# Production Deployment Guide

This guide covers deploying TalkMateAI to production environments.

## Table of Contents
- [Pre-Deployment Checklist](#pre-deployment-checklist)
- [Environment Setup](#environment-setup)
- [Deployment Options](#deployment-options)
- [Post-Deployment](#post-deployment)
- [Monitoring](#monitoring)

## Pre-Deployment Checklist

### ✅ Code Quality
- [ ] All tests passing
- [ ] No ESLint errors (warnings are acceptable)
- [ ] Code formatted with Prettier
- [ ] Build completes successfully

### ✅ Security
- [ ] Environment variables configured
- [ ] API keys secured (never commit to git)
- [ ] CORS origins properly configured
- [ ] HTTPS enabled
- [ ] Security headers configured

### ✅ Performance
- [ ] Images optimized
- [ ] Code minified
- [ ] Compression enabled
- [ ] CDN configured (optional)

### ✅ Monitoring
- [ ] Error tracking setup (Sentry, etc.)
- [ ] Analytics configured
- [ ] Logging configured
- [ ] Health checks enabled

## Environment Setup

### Required Environment Variables

#### Client (.env.local)
```bash
NEXT_PUBLIC_WS_URL=wss://your-domain.com/ws/test-client
NEXT_PUBLIC_API_URL=https://your-domain.com
```

#### Server (.env)
```bash
GEMINI_API_KEY=your_actual_gemini_api_key
HOST=0.0.0.0
PORT=8000
CORS_ORIGINS=https://your-frontend-domain.com
ENVIRONMENT=production
LOG_LEVEL=INFO
```

## Deployment Options

### Option 1: Vercel + Railway (Recommended for Quick Deploy)

#### Deploy Client to Vercel
1. Push code to GitHub
2. Import project in Vercel
3. Configure environment variables:
   - `NEXT_PUBLIC_WS_URL`
   - `NEXT_PUBLIC_API_URL`
4. Deploy

#### Deploy Server to Railway
1. Create new project in Railway
2. Connect GitHub repository
3. Select `apps/server` as root directory
4. Add environment variables
5. Set start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
6. Deploy

### Option 2: Docker + Cloud Provider

#### Using Docker Compose
```bash
# 1. Set environment variables
cp .env.example .env
# Edit .env with your values

# 2. Build and start
docker-compose up -d

# 3. View logs
docker-compose logs -f

# 4. Stop
docker-compose down
```

#### Deploy to AWS ECS, Google Cloud Run, or Azure Container Instances
1. Build Docker images
2. Push to container registry
3. Configure cloud service
4. Deploy containers

### Option 3: VPS (DigitalOcean, Linode, etc.)

#### 1. Server Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install pnpm
npm install -g pnpm

# Install Python
sudo apt install -y python3.11 python3.11-venv

# Install uv
curl -LsSf https://astral.sh/uv/install.sh | sh

# Install Nginx
sudo apt install -y nginx

# Install Certbot for SSL
sudo apt install -y certbot python3-certbot-nginx
```

#### 2. Clone and Build
```bash
# Clone repository
git clone <your-repo-url>
cd talkmateai

# Install dependencies
pnpm monorepo-setup

# Build client
cd apps/client
pnpm build

# Setup server
cd ../server
uv sync
```

#### 3. Configure Process Manager (PM2)
```bash
# Install PM2
npm install -g pm2

# Start client
cd apps/client
pm2 start npm --name "talkmateai-client" -- start

# Start server
cd ../server
pm2 start "uv run uvicorn main:app --host 0.0.0.0 --port 8000" --name "talkmateai-server"

# Save PM2 configuration
pm2 save
pm2 startup
```

#### 4. Configure Nginx
```nginx
# /etc/nginx/sites-available/talkmateai

# Frontend
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Backend
server {
    listen 80;
    server_name api.your-domain.com;

    location / {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket support
    location /ws {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/talkmateai /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Setup SSL
sudo certbot --nginx -d your-domain.com -d api.your-domain.com
```

### Option 4: Kubernetes

See `k8s/` directory for Kubernetes manifests (if applicable).

## Post-Deployment

### 1. Verify Deployment
- [ ] Frontend loads correctly
- [ ] WebSocket connection established
- [ ] Voice detection works
- [ ] Avatar loads and animates
- [ ] AI responses working

### 2. Performance Testing
```bash
# Load testing with Artillery
npm install -g artillery
artillery quick --count 10 --num 50 https://your-domain.com
```

### 3. Security Scan
```bash
# Run security audit
pnpm audit

# Check for vulnerabilities
npm install -g snyk
snyk test
```

## Monitoring

### Application Monitoring

#### Sentry Integration (Error Tracking)
```bash
# Install Sentry
pnpm add @sentry/nextjs @sentry/node

# Configure in next.config.ts and main.py
```

#### Logging
- Client: Browser console + Sentry
- Server: Python logging + CloudWatch/Datadog

### Infrastructure Monitoring
- **Uptime**: UptimeRobot, Pingdom
- **Performance**: New Relic, Datadog
- **Logs**: CloudWatch, Papertrail, Logtail

### Health Checks
```bash
# Client health
curl https://your-domain.com

# Server health
curl https://api.your-domain.com/health

# WebSocket
wscat -c wss://api.your-domain.com/ws/test-client
```

## Rollback Procedure

### Docker Deployment
```bash
# Rollback to previous version
docker-compose down
git checkout <previous-commit>
docker-compose up -d
```

### Vercel
- Use Vercel dashboard to rollback to previous deployment

### PM2
```bash
# Restart services
pm2 restart all

# Or restore from backup
git checkout <previous-commit>
pnpm build
pm2 restart all
```

## Troubleshooting

### Common Issues

#### WebSocket Connection Failed
- Check CORS configuration
- Verify WebSocket URL uses `wss://` in production
- Check firewall rules

#### Build Failures
- Clear cache: `rm -rf .next node_modules`
- Reinstall: `pnpm install`
- Check Node.js version

#### Performance Issues
- Enable CDN for static assets
- Optimize images
- Enable caching headers
- Use Redis for session management

## Support

For issues, please check:
1. Application logs
2. Server logs
3. Browser console
4. GitHub Issues

---

**Last Updated**: 2025-12-18
