module.exports = {
  apps: [
    // {
    //   name: 'shop-genuine-client',
    //   cwd: '/root/genuine-cosmetics/client',
    //   script: 'npm',
    //   args: 'start',
    //   env: {
    //     PORT: 3002,
    //     NODE_ENV: 'production'
    //   },
    //   error_file: "/root/.pm2/logs/genuine-cosmetics-client-error.log",
    //   out_file: "/root/.pm2/logs/genuine-cosmetics-client-out.log",
    //   log_date_format: "YYYY-MM-DD HH:mm:ss",
    //   max_memory_restart: "500M"
    // },
    {
      name: 'shop-genuine-admin',
      cwd: '/root/genuine-cosmetics/front',
      script: 'npm',
      args: 'run preview',
      env: {
        PORT: 4174,
        NODE_ENV: 'production',
        HOST: '0.0.0.0'
      },
      error_file: "/root/.pm2/logs/genuine-cosmetics-admin-error.log",
      out_file: "/root/.pm2/logs/genuine-cosmetics-admin-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      max_memory_restart: "500M"
    },
    // {
    //   // The partner portal had no PM2 entry, so partner.shopgenuine.online had
    //   // nothing to serve. Mirrors the admin entry above.
    //   name: 'shop-genuine-partner',
    //   cwd: '/root/genuine-cosmetics/partner',
    //   script: 'npm',
    //   args: 'run preview',
    //   env: {
    //     // Must match `preview.port` in partner/vite.config.js (5001), which
    //     // wins over this value — they diverge silently otherwise.
    //     PORT: 5001,
    //     NODE_ENV: 'production',
    //     HOST: '0.0.0.0'
    //   },
    //   error_file: "/root/.pm2/logs/genuine-cosmetics-partner-error.log",
    //   out_file: "/root/.pm2/logs/genuine-cosmetics-partner-out.log",
    //   log_date_format: "YYYY-MM-DD HH:mm:ss",
    //   max_memory_restart: "500M"
    // },
    {
      name: 'shop-genuine-server',
      cwd: '/root/genuine-cosmetics/server',
      script: 'npm',
      args: 'start',
      env: {
        PORT: 4002,
        NODE_ENV: 'production'
      },
      error_file: "/root/.pm2/logs/genuine-cosmetics-server-error.log",
      out_file: "/root/.pm2/logs/genuine-cosmetics-server-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      max_memory_restart: "500M"
    },
  ]
};