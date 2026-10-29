module.exports = {
  apps: [
    {
      name: 'cafe-backend',
      script: 'index.js',
      cwd: '/var/www/cafe/server',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
    },
  ],
};
