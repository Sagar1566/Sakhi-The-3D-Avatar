# Production Deployment Guide

This guide covers deploying Sakhi - The 3D Avatar to production environments.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Configuration](#environment-configuration)
3. [Deployment Options](#deployment-options)
4. [Post-Deployment](#post-deployment)
5. [Monitoring](#monitoring)
6. [Troubleshooting](#troubleshooting)

## Prerequisites

Before deploying to production, ensure you have:

- [ ] Google Gemini API key
- [ ] Domain name (optional but recommended)
- [ ] SSL certificate (for HTTPS/WSS)
- [ ] Cloud platform account (Vercel, Railway, Render, etc.)
- [ ] Docker Hub account (for Docker deployments)

## Environment Configuration

### 1. Client Environment Variables

Create `.env.local` in `apps/client/`:

```env
# Production WebSocket URL (must use wss:// for HTTPS sites)
NEXT_PUBLIC_WS_URL=wss://your-api-domain.com/ws/test-client

# Production API URL
NEXT_PUBLIC_API_URL=https://your-api-domain.com

# Application metadata
NEXT_PUBLIC_APP_NAME=Sakhi - The 3D Avatar
NEXT_PUBLIC_APP_VERSION=1.0.0
```

### 2. Server Environment Variables

Set these in your deployment platform:

```env
# Required
GEMINI_API_KEY=your_actual_gemini_api_key

# Server configuration
HOST=0.0.0.0
PORT=8000

# CORS - Add your client URL
CORS_ORIGINS=https://your-client-domain.com

# Environment
ENVIRONMENT=production
```

## Deployment Options

### Option 1: Vercel (Client) + Render (Server) [Recommended]

#### Deploy Client to Vercel

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Production ready"
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Configure:
     - Framework Preset: Next.js
     - Root Directory: `apps/client`
     - Build Command: `cd ../.. && pnpm install && pnpm build:client`
     - Output Directory: `.next`

3. **Set Environment Variables**
   ```
   NEXT_PUBLIC_WS_URL=wss://your-api.onrender.com/ws/test-client
   NEXT_PUBLIC_API_URL=https://your-api.onrender.com
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete
   - Note your deployment URL

#### Deploy Server to Render

1. **Create New Web Service**
   - Go to [render.com](https://render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

2. **Configure Service**
   - Name: `sakhi-api`
   - Region: Choose closest to your users
   - Branch: `main`
   - Root Directory: `apps/server`
   - Runtime: `Python 3.11`
   - Build Command: `uv sync`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

3. **Set Environment Variables**
   ```
   GEMINI_API_KEY=your_actual_key
   CORS_ORIGINS=https://your-vercel-app.vercel.app
   ENVIRONMENT=production
   ```

4. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment
   - Note your service URL

5. **Update Client Environment**
   - Go back to Vercel
   - Update `NEXT_PUBLIC_WS_URL` and `NEXT_PUBLIC_API_URL` with Render URL
   - Redeploy

### Option 2: Docker Compose on VPS

#### 1. Prepare VPS

```bash
# SSH into your server
ssh user@your-server-ip

# Install Docker and Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

#### 2. Clone Repository

```bash
git clone https://github.com/Sagar1566/Sakhi-The-3D-Avatar.git
cd Sakhi-The-3D-Avatar
```

#### 3. Configure Environment

```bash
# Copy and edit environment file
cp .env.example .env
nano .env

# Add your GEMINI_API_KEY and other production values
```

#### 4. Build and Deploy

```bash
# Build images
pnpm docker:build

# Start services
pnpm docker:up

# View logs
pnpm docker:logs
```

#### 5. Setup Nginx Reverse Proxy

```nginx
# /etc/nginx/sites-available/sakhi

server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # Client
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

server {
    listen 443 ssl http2;
    server_name api.your-domain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # API
    location / {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket
    location /ws {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
        proxy_read_timeout 86400;
    }
}
```

```bash
# Enable site and reload Nginx
sudo ln -s /etc/nginx/sites-available/sakhi /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Option 3: Railway

#### Deploy Both Services

1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   railway login
   ```

2. **Initialize Project**
   ```bash
   railway init
   ```

3. **Deploy Server**
   ```bash
   cd apps/server
   railway up
   railway variables set GEMINI_API_KEY=your_key
   railway variables set ENVIRONMENT=production
   ```

4. **Deploy Client**
   ```bash
   cd ../client
   railway up
   railway variables set NEXT_PUBLIC_WS_URL=wss://your-server.railway.app/ws/test-client
   railway variables set NEXT_PUBLIC_API_URL=https://your-server.railway.app
   ```

## Post-Deployment

### 1. Verify Deployment

```bash
# Check client
curl https://your-client-domain.com

# Check server health
curl https://your-api-domain.com/health

# Check API docs
curl https://your-api-domain.com/docs
```

### 2. Test WebSocket Connection

Open browser console on your client URL:

```javascript
const ws = new WebSocket('wss://your-api-domain.com/ws/test-client');
ws.onopen = () => console.log('Connected');
ws.onerror = (e) => console.error('Error:', e);
```

### 3. Configure DNS

Point your domain to your deployment:

```
A Record: @ → your-server-ip
CNAME: www → your-domain.com
CNAME: api → your-api-domain.com
```

### 4. Enable SSL

For VPS deployments, use Let's Encrypt:

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
sudo certbot --nginx -d api.your-domain.com
```

## Monitoring

### 1. Application Logs

**Vercel:**
```bash
vercel logs
```

**Render:**
- View logs in Render dashboard

**Docker:**
```bash
pnpm docker:logs
```

### 2. Health Checks

Set up monitoring for:
- Client: `https://your-domain.com`
- Server: `https://your-api-domain.com/health`

Recommended tools:
- UptimeRobot
- Pingdom
- Better Uptime

### 3. Error Tracking

Consider integrating:
- Sentry for error tracking
- LogRocket for session replay
- Google Analytics for usage metrics

## Performance Optimization

### 1. Enable CDN

- Vercel automatically provides CDN
- For VPS, consider Cloudflare

### 2. Database (if needed)

If you add a database later:
- Use connection pooling
- Enable query caching
- Set up read replicas

### 3. Caching

- Enable Redis for session storage
- Cache Gemini API responses
- Use HTTP caching headers

## Security Checklist

- [ ] HTTPS enabled on all domains
- [ ] WebSocket using WSS protocol
- [ ] Environment variables secured
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Security headers configured
- [ ] Regular dependency updates
- [ ] API key rotation policy

## Backup Strategy

### 1. Code Backup

- Ensure code is in GitHub
- Tag releases: `git tag v1.0.0`

### 2. Environment Backup

- Document all environment variables
- Store securely (1Password, AWS Secrets Manager)

### 3. User Data Backup

If you add database:
- Daily automated backups
- Test restore procedures
- Off-site backup storage

## Scaling

### Horizontal Scaling

**Client:**
- Vercel auto-scales
- For Docker: Use load balancer + multiple containers

**Server:**
- Add more FastAPI instances
- Use load balancer (Nginx, HAProxy)
- Consider serverless functions for API

### Vertical Scaling

- Increase server resources
- Optimize memory usage
- Profile and optimize slow endpoints

## Troubleshooting

### WebSocket Connection Fails

1. Check WSS protocol (not WS) for HTTPS sites
2. Verify CORS_ORIGINS includes client domain
3. Check firewall allows WebSocket connections
4. Ensure reverse proxy configured for WebSocket

### Build Fails

1. Clear build cache
2. Check Node.js version (20+)
3. Verify all dependencies installed
4. Check environment variables set

### High Memory Usage

1. Reduce worker processes
2. Implement request queuing
3. Add memory limits to Docker containers
4. Consider serverless for API

### Slow Response Times

1. Enable caching
2. Optimize database queries
3. Use CDN for static assets
4. Profile slow endpoints

## Rollback Procedure

### Vercel

```bash
vercel rollback
```

### Render

- Use Render dashboard to rollback to previous deploy

### Docker

```bash
# Stop current containers
pnpm docker:down

# Checkout previous version
git checkout v1.0.0

# Rebuild and deploy
pnpm docker:build
pnpm docker:up
```

## Support

For deployment issues:
- Check logs first
- Review this guide
- Open GitHub issue
- Contact support team

---

**Last Updated:** 2025-12-19
**Version:** 1.0.0
