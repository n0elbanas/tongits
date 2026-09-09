module.exports = {
  apps: [
    {
      name: 'tongits-server',
      script: 'node_modules/.bin/tsx',
      args: 'server/index.ts',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 5005,
        HOST: '127.0.0.1',
      },
    },
  ],
};
