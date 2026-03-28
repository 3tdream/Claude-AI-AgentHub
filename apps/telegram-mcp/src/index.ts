#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions/index.js";
import * as dotenv from "dotenv";
import { tools, createToolHandlers } from "./tools/mtproto.js";

dotenv.config();

const apiId = parseInt(process.env.TELEGRAM_API_ID || "0");
const apiHash = process.env.TELEGRAM_API_HASH || "";
const sessionString = process.env.TELEGRAM_SESSION || "";

// Proxy configuration
const proxyEnabled = process.env.PROXY_ENABLED === "true";
const proxyConfig = proxyEnabled ? {
  socksType: 5 as const,
  ip: process.env.PROXY_HOST || "127.0.0.1",
  port: parseInt(process.env.PROXY_PORT || "1080"),
  username: process.env.PROXY_USERNAME || undefined,
  password: process.env.PROXY_PASSWORD || undefined,
} : undefined;

if (!apiId || !apiHash) {
  console.error("Error: TELEGRAM_API_ID and TELEGRAM_API_HASH required");
  console.error("Run 'npm run generate-session' to set up authentication");
  process.exit(1);
}

if (proxyEnabled) {
  console.error(`Using SOCKS5 proxy: ${proxyConfig?.ip}:${proxyConfig?.port}`);
}

const stringSession = new StringSession(sessionString);
const client = new TelegramClient(stringSession, apiId, apiHash, {
  connectionRetries: 5,
  proxy: proxyConfig,
});

const server = new Server(
  {
    name: "telegram-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

let toolHandlers: ReturnType<typeof createToolHandlers>;

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  const handler = toolHandlers[name];
  if (!handler) {
    throw new Error(`Unknown tool: ${name}`);
  }

  try {
    const result = await handler(args ?? {});
    return {
      content: [
        {
          type: "text",
          text: typeof result === "string" ? result : JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Tool error [${name}]:`, errorMessage);
    return {
      content: [
        {
          type: "text",
          text: `Error: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
});

async function main() {
  console.error("Connecting to Telegram...");

  await client.connect();

  if (!sessionString) {
    console.error("Warning: No session string. Run 'npm run generate-session' first.");
  }

  toolHandlers = createToolHandlers(client);

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Telegram MCP server running on stdio (MTProto)");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
