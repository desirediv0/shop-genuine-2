module.exports = {
  apps: [
    {
      name: 'shop-genuine-client',
      cwd: '/root/shop-genuine-2/client',
      script: 'npm',
      args: 'start',
      env: {
        PORT: 3011,
        NODE_ENV: 'production'
      },
      error_file: "/root/.pm2/logs/shop-genuine-client-error.log",
      out_file: "/root/.pm2/logs/shop-genuine-client-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      max_memory_restart: "500M"
    },
    {
      name: 'shop-genuine-admin',
      cwd: '/root/shop-genuine-2/front',
      script: 'npm',
      args: 'run preview',
      env: {
        PORT: 4184,
        NODE_ENV: 'production',
        HOST: '0.0.0.0'
      },
      error_file: "/root/.pm2/logs/shop-genuine-admin-error.log",
      out_file: "/root/.pm2/logs/shop-genuine-admin-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      max_memory_restart: "500M"
    },
    {
      // The partner portal had no PM2 entry, so partner.shopgenuine.online had
      // nothing to serve. Mirrors the admin entry above.
      name: 'shop-genuine-partner',
      cwd: '/root/shop-genuine-2/partner',
      script: 'npm',
      args: 'run preview',
      env: {
        // Must match `preview.port` in partner/vite.config.js (5001), which
        // wins over this value — they diverge silently otherwise.
        PORT: 5001,
        NODE_ENV: 'production',
        HOST: '0.0.0.0'
      },
      error_file: "/root/.pm2/logs/shop-genuine-partner-error.log",
      out_file: "/root/.pm2/logs/shop-genuine-partner-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      max_memory_restart: "500M"
    },
    {
      name: 'shop-genuine-server',
      cwd: '/root/shop-genuine-2/server',
      script: 'npm',
      args: 'start',
      env: {
        PORT: 4011,
        NODE_ENV: 'production'
      },
      error_file: "/root/.pm2/logs/shop-genuine-server-error.log",
      out_file: "/root/.pm2/logs/shop-genuine-server-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      max_memory_restart: "500M"
    },
  ]
};