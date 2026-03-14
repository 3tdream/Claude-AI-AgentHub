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
  ],
};
