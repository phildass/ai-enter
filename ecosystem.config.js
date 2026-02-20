/**
 * PM2 Ecosystem Configuration for AI Cloud Enterprises
 * 
 * This file defines the PM2 configuration for running the Next.js application
 * in production. It ensures consistent deployment across environments.
 * 
 * Usage:
 *   pm2 start ecosystem.config.js          - Start the application
 *   pm2 restart ecosystem.config.js        - Restart the application
 *   pm2 stop ecosystem.config.js           - Stop the application
 *   pm2 delete ecosystem.config.js         - Delete the application from PM2
 */

module.exports = {
  apps: [
    {
      name: "aienter",
      cwd: "/var/www/ai-enter",
      script: "npm",
      args: "start",
      interpreter: "none",
      env: {
        NODE_ENV: "production",
        PORT: 3040
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "2G",
      min_uptime: "10s",           // Don't restart if crashes within 10s
      max_restarts: 5,              // Max 5 restarts in a window
      restart_delay: 4000,          // Wait 4s before restarting
      error_file: "/var/www/ai-enter/logs/aienter-error.log",
      out_file: "/var/www/ai-enter/logs/aienter-out.log",
      log_file: "/var/www/ai-enter/logs/aienter-combined.log",
      time: true
    }
  ]
};
