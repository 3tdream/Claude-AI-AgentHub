module.exports = {
  apps: [{
    name: 'secretutka',
    script: 'node_modules/next/dist/bin/next',
    args: 'start -p 3400',
    cwd: 'C:/Users/Ro050/Desktop/ai-projects/apps/secretutka',
    env: {
      NODE_ENV: 'production'
    }
  }]
};
