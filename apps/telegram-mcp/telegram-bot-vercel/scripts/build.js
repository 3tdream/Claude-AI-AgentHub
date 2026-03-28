import { build } from "esbuild";
import { readdirSync, existsSync, mkdirSync, rmSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, "..");
const srcApiDir = join(rootDir, "src", "api");
const apiDir = join(rootDir, "api");
const publicDir = join(rootDir, "public");

// Clean api directory (output)
if (existsSync(apiDir)) {
  rmSync(apiDir, { recursive: true });
}
mkdirSync(apiDir, { recursive: true });

// Ensure public directory exists
if (!existsSync(publicDir)) {
  mkdirSync(publicDir, { recursive: true });
  writeFileSync(join(publicDir, "health.txt"), "OK");
}

// Get all API entry points (excluding helpers folder)
const apiFiles = readdirSync(srcApiDir)
  .filter((f) => f.endsWith(".ts") && !f.startsWith("_"))
  .map((f) => join(srcApiDir, f));

// Get cron files
const cronDir = join(srcApiDir, "cron");
if (existsSync(cronDir)) {
  mkdirSync(join(apiDir, "cron"), { recursive: true });
  const cronFiles = readdirSync(cronDir)
    .filter((f) => f.endsWith(".ts"))
    .map((f) => join(cronDir, f));
  apiFiles.push(...cronFiles);
}

console.log("Building API endpoints:");
apiFiles.forEach((f) => console.log(`  - ${f}`));

// Build each entry point
async function buildAll() {
  for (const entryPoint of apiFiles) {
    const relativePath = entryPoint.replace(srcApiDir + "\\", "").replace(srcApiDir + "/", "");
    const outfile = join(apiDir, relativePath.replace(".ts", ".js"));

    // Ensure output directory exists
    const outDir = dirname(outfile);
    if (!existsSync(outDir)) {
      mkdirSync(outDir, { recursive: true });
    }

    console.log(`Building ${relativePath}...`);

    await build({
      entryPoints: [entryPoint],
      bundle: true,
      platform: "node",
      target: "node18",
      format: "esm",
      outfile,
      external: ["@vercel/node"],
      minify: false,
      sourcemap: false,
      banner: {
        js: '// Bundled with esbuild',
      },
    });

    console.log(`  -> ${outfile}`);
  }

  console.log("\nBuild complete!");
}

buildAll().catch((err) => {
  console.error("Build failed:", err);
  process.exit(1);
});
