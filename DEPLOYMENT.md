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
- [ ] SSL certificate is configured (recommended)

## Environment Variables

Create a `.env` file in the project root with the following variables:

```bash
# Razorpay Configuration
RAZORPAY_KEY_ID=your_razorpay_key_id_here
RAZORPAY_KEY_SECRET=your_razorpay_key_secret_here

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
pm2 start npm --name "aienter" -- start

# Save PM2 configuration
pm2 save

# Setup PM2 to start on system boot
pm2 startup
# Follow the instructions provided by the command above
```

### 5. Configure Nginx

Create or update the Nginx configuration file:

```bash
sudo nano /etc/nginx/sites-available/aienter.in
```

Add the following configuration:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name aienter.in www.aienter.in;

    # Redirect HTTP to HTTPS (uncomment after SSL is configured)
    # return 301 https://$server_name$request_uri;

    location / {
        proxy_pass http://127.0.0.1:3040;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

Enable the site and reload Nginx:

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/aienter.in /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### 6. SSL Configuration (Recommended)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d aienter.in -d www.aienter.in

# Certbot will automatically update your Nginx configuration
```

## Verification Steps

After deployment, verify everything is working:

### 1. Check Application is Running

```bash
# Check PM2 status
pm2 status

# View application logs
pm2 logs aienter --lines 50

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
# Test from server
curl -I http://aienter.in

# Test from your local machine
# Visit http://aienter.in in your browser
```

## Common Issues and Solutions

### Issue: Port 3040 is not responding

**Solution:**
```bash
# Check if the app is running
pm2 status

# Restart the application
pm2 restart aienter

# Check logs for errors
pm2 logs aienter --err
```

### Issue: 502 Bad Gateway from Nginx

**Solution:**
```bash
# Verify app is running on port 3040
sudo lsof -i :3040

# Check PM2 logs
pm2 logs aienter

# Restart both services
pm2 restart aienter
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
pm2 restart aienter
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
pm2 restart aienter

# Monitor logs for any issues
pm2 logs aienter
```

## Monitoring

### PM2 Monitoring

```bash
# Real-time monitoring
pm2 monit

# View logs
pm2 logs aienter

# View specific log file
pm2 logs aienter --out  # stdout only
pm2 logs aienter --err  # stderr only
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

- [ ] Use HTTPS with valid SSL certificate
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
2. Review PM2 logs: `pm2 logs aienter`
3. Review Nginx logs: `sudo tail -f /var/log/nginx/error.log`
4. Verify all environment variables are set correctly
5. Ensure server has adequate resources (RAM, disk space)

## Quick Reference Commands

```bash
# Application Management
pm2 start ecosystem.config.js    # Start app
pm2 stop aienter                  # Stop app
pm2 restart aienter               # Restart app
pm2 logs aienter                  # View logs
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
pm2 restart aienter
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
