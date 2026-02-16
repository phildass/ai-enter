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
      name: 'aienter',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/ai-enter',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3040
      },
      error_file: '/var/www/ai-enter/logs/pm2-error.log',
      out_file: '/var/www/ai-enter/logs/pm2-out.log',
      log_file: '/var/www/ai-enter/logs/pm2-combined.log',
      time: true,
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    }
  ]
};
