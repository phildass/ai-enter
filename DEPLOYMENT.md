# Deployment Guide - AI Cloud Enterprises

This guide covers deploying the AI Cloud Enterprises Next.js application to a production server.

## Server Requirements

- **Node.js:** 18.x or higher
- **npm or yarn:** Latest stable version
- **Process Manager:** PM2 (recommended for production)
- **Web Server:** Nginx (for reverse proxy)
- **Operating System:** Ubuntu 20.04+ or similar Linux distribution

## Pre-Deployment Checklist

- [ ] Server has Node.js 18+ installed
- [ ] PM2 is installed globally (`npm install -g pm2`)
- [ ] Nginx is installed and configured
- [ ] Environment variables are set up
- [ ] Domain DNS points to server IP
- [ ] SSL certificate is configured (required for production)

## Environment Variables

Create a `.env` file in the project root with the following variables:

```bash
# API Base URL (leave empty when Next.js API routes live on the same host)
# Set to an absolute URL only when the API is served from a different host,
# e.g. NEXT_PUBLIC_API_BASE_URL=https://api.aienter.in
NEXT_PUBLIC_API_BASE_URL=

# Razorpay Configuration
RAZORPAY_KEY_ID=your_razorpay_key_id_here
RAZORPAY_KEY_SECRET=your_razorpay_key_secret_here
# Webhook secret — copy from https://dashboard.razorpay.com/app/webhooks
RAZORPAY_WEBHOOK_SECRET=your_razorpay_webhook_secret_here

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

**Security Note:** Never commit `.env` files to version control. Use `.env.example` as a template.

## Deployment Steps

### 1. Initial Server Setup

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Node.js 18.x (if not already installed)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Install Nginx (if not already installed)
sudo apt install -y nginx
```

### 2. Clone and Setup Application

```bash
# Navigate to web directory
cd /var/www

# Clone the repository (or pull latest changes)
git clone https://github.com/phildass/ai-enter.git
# OR: cd ai-enter && git pull

# Navigate to project directory
cd ai-enter

# Install dependencies
npm install
# OR: yarn install

# Create environment file
cp .env.example .env
# Edit .env with your actual credentials
nano .env
```

### 3. Build the Application

```bash
# Build the Next.js application
npm run build
# OR: yarn build

# Verify build was successful
# Look for "Compiled successfully" message
```

### 4. Configure PM2

The application includes a PM2 ecosystem configuration file. Start the application using:

```bash
# Start with PM2 using the ecosystem config
pm2 start ecosystem.config.js

# OR start directly (will use port 3040 as configured in package.json)
pm2 start npm --name "ai-enter" -- start

# Save PM2 configuration
pm2 save

# Setup PM2 to start on system boot
pm2 startup
# Follow the instructions provided by the command above
```

### 5. Configure Nginx

Copy the bundled bootstrap Nginx configuration from the repository:

```bash
sudo cp nginx/aienter.in.conf /etc/nginx/sites-available/aienter.in
```

This HTTP-only configuration contains all the required proxy headers (including
`proxy_set_header X-Forwarded-Proto $scheme;`) in the location block. Nginx can
load it immediately — before the SSL certificate exists — because it only listens
on port 80. Certbot will extend this file with the HTTPS server block and redirect
in the next step.

Enable the site and test the configuration:

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/aienter.in /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### 6. SSL Certificate (Required for Razorpay)

#### Step 1 — Install Certbot

```bash
sudo apt update && sudo apt install certbot python3-certbot-nginx -y
```

#### Step 2 — Issue the Certificate

```bash
sudo certbot --nginx -d aienter.in -d www.aienter.in
```

Follow the prompts:
- Enter a valid email address for renewal notifications
- Agree to the Let's Encrypt Terms of Service
- **When asked about redirects, select Option 2 (Redirect)** to force all HTTP
  traffic to HTTPS — this is mandatory for Razorpay to process payments over a
  secure connection

Certbot will obtain the certificate, update `/etc/nginx/sites-available/aienter.in`
with the SSL directives, and configure the HTTP→HTTPS redirect automatically.

#### Step 3 — Verify Nginx Config

After Certbot completes, confirm that `/etc/nginx/sites-available/aienter.in`
contains the following entries:

```nginx
# SSL certificates issued by Let's Encrypt
ssl_certificate /etc/letsencrypt/live/aienter.in/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/aienter.in/privkey.pem;
```

Also confirm that `proxy_set_header X-Forwarded-Proto $scheme;` is present inside
the `location /` block of the HTTPS server. This header tells Next.js the request
arrived over HTTPS, preventing Mixed Content errors during Razorpay checkout:

```nginx
proxy_set_header X-Forwarded-Proto $scheme;
```

If Certbot moved the location block without this header, add it manually:

```bash
sudo nano /etc/nginx/sites-available/aienter.in
```

#### Step 4 — Restart and Test

```bash
sudo nginx -t && sudo systemctl reload nginx
```

## Verification Steps

After deployment, verify everything is working:

### 1. Check Application is Running

```bash
# Check PM2 status
pm2 status

# View application logs
pm2 logs ai-enter --lines 50

# Check if port 3040 is in use
sudo lsof -i :3040
# OR
sudo netstat -tlnp | grep :3040
```

### 2. Test Local Connection

```bash
# Test if the app responds locally
curl -I http://localhost:3040

# Should return HTTP 200 OK with Next.js headers
```

### 3. Check Nginx

```bash
# Verify Nginx is running
sudo systemctl status nginx

# Check Nginx access logs
sudo tail -f /var/log/nginx/access.log

# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

### 4. Test Domain Access

```bash
# Test HTTP redirect (should return 301 -> HTTPS)
curl -I http://aienter.in

# Test HTTPS access
curl -I https://aienter.in
curl -I https://www.aienter.in

# Test from your local machine
# Visit https://aienter.in in your browser and confirm the padlock icon is present
```

### 5. Test the Razorpay Payment Route

Verify that the Razorpay webhook endpoint is reachable and returns an expected
status (200 or 400 — **not** 404 or an "Insecure" warning):

```bash
# A GET request returns 405 Method Not Allowed — confirms the route exists
curl -I https://aienter.in/api/webhooks/razorpay

# A POST without a valid signature returns 400 Bad Request — confirms signature
# validation is active
curl -s -o /dev/null -w "%{http_code}" \
  -X POST https://aienter.in/api/webhooks/razorpay \
  -H "Content-Type: application/json" \
  -d '{"event":"payment.captured"}'
# Expected output: 400
```

If the endpoint returns 404, the application has not been built/started after the
latest code changes. Rebuild and restart:

```bash
npm run build && pm2 restart ai-enter
```

## Common Issues and Solutions

### Issue: Port 3040 is not responding

**Solution:**
```bash
# Check if the app is running
pm2 status

# Restart the application
pm2 restart ai-enter

# Check logs for errors
pm2 logs ai-enter --err
```

### Issue: 502 Bad Gateway from Nginx

**Solution:**
```bash
# Verify app is running on port 3040
sudo lsof -i :3040

# Check PM2 logs
pm2 logs ai-enter

# Restart both services
pm2 restart ai-enter
sudo systemctl reload nginx
```

### Issue: Build fails

**Solution:**
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Try building again
npm run build
```

### Issue: Environment variables not working

**Solution:**
```bash
# Verify .env file exists
cat .env

# Restart PM2 to reload environment
pm2 restart ai-enter
```

## Updating the Application

To update the application with new code:

```bash
# Navigate to project directory
cd /var/www/ai-enter

# Pull latest changes
git pull

# Install any new dependencies
npm install

# Rebuild the application
npm run build

# Restart PM2
pm2 restart ai-enter

# Monitor logs for any issues
pm2 logs ai-enter
```

## Monitoring

### PM2 Monitoring

```bash
# Real-time monitoring
pm2 monit

# View logs
pm2 logs ai-enter

# View specific log file
pm2 logs ai-enter --out  # stdout only
pm2 logs ai-enter --err  # stderr only
```

### System Resources

```bash
# Check disk space
df -h

# Check memory usage
free -h

# Check CPU usage
top
```

## Backup Recommendations

1. **Database:** Regular Supabase backups (handled by Supabase)
2. **Code:** Version controlled in Git
3. **Environment Variables:** Keep secure backup of `.env` file
4. **PM2 Configuration:** Backed up with `pm2 save`

## Security Best Practices

- [x] Use HTTPS with valid SSL certificate
- [ ] Keep Node.js and npm packages updated
- [ ] Use strong, unique environment variables
- [ ] Enable firewall (UFW) and only allow necessary ports
- [ ] Regular security updates: `sudo apt update && sudo apt upgrade`
- [ ] Monitor logs for suspicious activity
- [ ] Use Razorpay's production keys only in production
- [ ] Never commit `.env` files to Git

## Support

For deployment issues:

1. Check this guide's troubleshooting section
2. Review PM2 logs: `pm2 logs ai-enter`
3. Review Nginx logs: `sudo tail -f /var/log/nginx/error.log`
4. Verify all environment variables are set correctly
5. Ensure server has adequate resources (RAM, disk space)

## Quick Reference Commands

```bash
# Application Management
pm2 start ecosystem.config.js    # Start app
pm2 stop ai-enter                  # Stop app
pm2 restart ai-enter               # Restart app
pm2 logs ai-enter                  # View logs
pm2 monit                         # Monitor resources

# Nginx Management
sudo nginx -t                     # Test configuration
sudo systemctl reload nginx       # Reload Nginx
sudo systemctl restart nginx      # Restart Nginx
sudo systemctl status nginx       # Check status

# Update Application
cd /var/www/ai-enter
git pull
npm install
npm run build
pm2 restart ai-enter
```

## Port Configuration

The application is configured to run on **port 3040** as specified in `package.json`:

```json
{
  "scripts": {
    "start": "next start -p 3040"
  }
}
```

This configuration ensures consistency between development and production environments. Nginx proxies external traffic on port 80/443 to the application running on port 3040.
