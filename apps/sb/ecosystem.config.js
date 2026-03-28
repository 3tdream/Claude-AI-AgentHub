module.exports = {
  apps: [
    {
      name: 'sb-api',
      cwd: './sb-api-services-v2',
      script: 'node_modules/tsx/dist/cli.mjs',
      args: 'src/index.ts',
      watch: false,
      env: {
        NODE_ENV: 'development'
      }
    },
    {
      name: 'sb-ui',
      cwd: './sb-chat-ui',
      script: 'node_modules/vite/bin/vite.js',
      env: {
        NODE_ENV: 'development'
      }
    }
  ]
};
