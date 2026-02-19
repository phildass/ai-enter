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
      cwd: "/var/www/ai-enter", // Directory of your Next.js app
      script: "npm",
      args: "start",
      env: {
        NODE_ENV: "production",
        PORT: 3040,               // Next.js port (must match what your server expects)
        // ---- Add your app's required environment variables below ----
        // DATABASE_URL: "your_database_url_here",
        // API_KEY: "your_api_key_here",
        // Any other env vars your app needs
      }
    }
  ]
};
