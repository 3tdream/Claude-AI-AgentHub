#!/usr/bin/env node
import { TelegramClient, Api } from "telegram";
import { StringSession } from "telegram/sessions/index.js";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

dotenv.config();

const apiId = parseInt(process.env.TELEGRAM_API_ID || "0");
const apiHash = process.env.TELEGRAM_API_HASH || "";

const phone = process.argv[2] || process.env.TELEGRAM_PHONE;
const code = process.argv[3] || process.env.TELEGRAM_CODE;
const password = process.argv[4] || process.env.TELEGRAM_2FA;

const stateFile = path.join(process.cwd(), ".auth_state.json");

if (!apiId || !apiHash) {
  console.error("Error: TELEGRAM_API_ID and TELEGRAM_API_HASH required in .env");
  process.exit(1);
}

if (!phone) {
  console.log("Usage: npm run generate-session <phone> [code] [2fa_password]");
  process.exit(1);
}

interface AuthState {
  phone: string;
  phoneCodeHash: string;
  session: string;
}

function loadState(): AuthState | null {
  try {
    if (fs.existsSync(stateFile)) {
      return JSON.parse(fs.readFileSync(stateFile, "utf-8"));
    }
  } catch {}
  return null;
}

function saveState(state: AuthState) {
  fs.writeFileSync(stateFile, JSON.stringify(state));
}

function clearState() {
  if (fs.existsSync(stateFile)) {
    fs.unlinkSync(stateFile);
  }
}

async function main() {
  console.log("Telegram Session Generator");
  console.log("==========================\n");
  console.log(`Phone: ${phone}`);

  const state = loadState();

  // If we have a code and saved state, use it
  let sessionString = "";
  let phoneCodeHash = "";

  if (code && state && state.phone === phone) {
    sessionString = state.session;
    phoneCodeHash = state.phoneCodeHash;
    console.log("Using saved auth state...");
  }

  const stringSession = new StringSession(sessionString);
  const client = new TelegramClient(stringSession, apiId, apiHash, {
    connectionRetries: 5,
  });

  await client.connect();

  if (!code) {
    // Step 1: Request code
    try {
      console.log("Requesting verification code...");

      const result = await client.invoke(
        new Api.auth.SendCode({
          phoneNumber: phone!,
          apiId: apiId,
          apiHash: apiHash,
          settings: new Api.CodeSettings({}),
        })
      );

      // Save state for step 2
      saveState({
        phone: phone!,
        phoneCodeHash: result.phoneCodeHash,
        session: client.session.save() as unknown as string,
      });

      console.log("\n✓ Code sent to your Telegram app!");
      console.log("\nGive me the code and I'll complete authentication.");

      await client.disconnect();
      process.exit(0);
    } catch (error: any) {
      console.error("Error:", error.message);
      process.exit(1);
    }
  } else {
    // Step 2: Sign in with code
    if (!phoneCodeHash) {
      console.error("No saved auth state. Request a new code first.");
      process.exit(1);
    }

    try {
      console.log("Signing in...");

      const result = await client.invoke(
        new Api.auth.SignIn({
          phoneNumber: phone!,
          phoneCodeHash: phoneCodeHash,
          phoneCode: code,
        })
      );

      console.log("\n✓ Successfully authenticated!");

      const session = client.session.save() as unknown as string;

      // Update .env file
      const envPath = path.join(process.cwd(), ".env");
      let envContent = fs.readFileSync(envPath, "utf-8");

      if (envContent.includes("TELEGRAM_SESSION=")) {
        envContent = envContent.replace(/TELEGRAM_SESSION=.*/, `TELEGRAM_SESSION=${session}`);
      } else {
        envContent += `\nTELEGRAM_SESSION=${session}\n`;
      }

      fs.writeFileSync(envPath, envContent);
      clearState();

      console.log("✓ Session saved to .env file!");
      console.log("\n=== SESSION STRING ===");
      console.log(session);
      console.log("======================\n");

      await client.disconnect();
    } catch (error: any) {
      if (error.message?.includes("PHONE_CODE_EXPIRED")) {
        console.error("\nCode expired. Requesting new one...");
        clearState();
        // Request new code
        const result = await client.invoke(
          new Api.auth.SendCode({
            phoneNumber: phone!,
            apiId: apiId,
            apiHash: apiHash,
            settings: new Api.CodeSettings({}),
          })
        );
        saveState({
          phone: phone!,
          phoneCodeHash: result.phoneCodeHash,
          session: client.session.save() as unknown as string,
        });
        console.log("✓ New code sent! Give me the new code.");
        await client.disconnect();
        process.exit(2);
      } else if (error.message?.includes("PHONE_CODE_INVALID")) {
        console.error("\nInvalid code. Try again with the correct code.");
        console.error("If the code expired, I'll request a new one.");
      } else if (error.message?.includes("SESSION_PASSWORD_NEEDED")) {
        // 2FA required
        if (password) {
          try {
            const passwordResult = await client.invoke(new Api.account.GetPassword());
            const srpPassword = await client.computeSrpPassword(passwordResult, password);
            await client.invoke(new Api.auth.CheckPassword({ password: srpPassword }));

            console.log("\n✓ 2FA verified!");
            const session = client.session.save() as unknown as string;

            const envPath = path.join(process.cwd(), ".env");
            let envContent = fs.readFileSync(envPath, "utf-8");
            if (envContent.includes("TELEGRAM_SESSION=")) {
              envContent = envContent.replace(/TELEGRAM_SESSION=.*/, `TELEGRAM_SESSION=${session}`);
            } else {
              envContent += `\nTELEGRAM_SESSION=${session}\n`;
            }
            fs.writeFileSync(envPath, envContent);
            clearState();

            console.log("✓ Session saved!");
            console.log("\n=== SESSION ===");
            console.log(session);
            console.log("===============\n");
            await client.disconnect();
            process.exit(0);
          } catch (e: any) {
            console.error("2FA Error:", e.message);
          }
        } else {
          console.error("\n2FA password required!");
          console.error(`Run again with: npx tsx src/generate-session.ts ${phone} ${code} YOUR_2FA_PASSWORD`);
        }
      } else {
        console.error("\nError:", error.message || error);
      }
      process.exit(1);
    }
  }
}

main();
