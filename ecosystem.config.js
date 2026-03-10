module.exports = {
  apps: [
    {
      name: "ai-enter",
      cwd: "/var/www/ai-enter",
      script: "/var/www/ai-enter/pm2-start.sh",
      interpreter: "bash",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "2G",
      min_uptime: "10s",
      max_restarts: 5,
      restart_delay: 4000,
      error_file: "/var/www/ai-enter/logs/aienter-error.log",
      out_file: "/var/www/ai-enter/logs/aienter-out.log",
      log_file: "/var/www/ai-enter/logs/aienter-combined.log",
      time: true
    }
  ]
};
