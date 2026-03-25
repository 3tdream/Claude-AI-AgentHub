module.exports = {
  apps: [
    {
      name: "mission-control",
      script: "node_modules/next/dist/bin/next",
      args: "dev -p 3077",
      cwd: __dirname,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env_development: {
        NODE_ENV: "development",
        PORT: 3077,
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 3077,
      },
    },
    {
      name: "nightly-evolution",
      script: "scripts/nightly-evolution.mjs",
      cwd: __dirname,
      cron_restart: "0 3 * * *",
      autorestart: false,
      watch: false,
      env: {
        MC_URL: "http://localhost:3077",
      },
    },
  ],
};
