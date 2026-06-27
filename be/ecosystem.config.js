module.exports = {
  apps: [
    {
      name: "ecep-backend",
      script: "./dist/server.js",
      instances: "max",
      exec_mode: "cluster",
      watch: false,
      max_memory_restart: "500M",
      kill_timeout: 5000,
      listen_timeout: 10000,
      instance_var: "PM2_INSTANCE_ID",
      env: {
        NODE_ENV: "production",
        PORT: 3000
      },
      out_file: "./logs/pm2-out.log",
      error_file: "./logs/pm2-error.log",
      merge_logs: true,
      autorestart: true,
      min_uptime: "10s",
      max_restarts: 10
    }
  ]
};
