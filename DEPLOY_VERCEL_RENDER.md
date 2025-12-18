# Deploying to Vercel + Render

This guide provides step-by-step instructions for deploying TalkMateAI to Vercel (client) and Render (server).

## Prerequisites

- GitHub account
- Vercel account (free tier available)
- Render account (free tier available)
- Google Gemini API key

## Part 1: Deploy to Vercel (Client)

### 1. Push to GitHub

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 2. Import to Vercel

1. Visit [vercel.com](https://vercel.com)
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Configure:
   - **Framework**: Next.js (auto-detected)
   - **Root Directory**: `apps/client`
   - **Build Command**: `pnpm build`
   - **Install Command**: `pnpm install`

### 3. Environment Variables (Vercel)

Add these in the Vercel dashboard:

```env
# These will be updated after deploying the server
NEXT_PUBLIC_WS_URL=wss://your-app.onrender.com/ws/test-client
NEXT_PUBLIC_API_URL=https://your-app.onrender.com
```

### 4. Deploy

Click **"Deploy"** and wait 2-3 minutes.

Your client will be live at: `https://your-project.vercel.app`

---

## Part 2: Deploy to Render (Server)

### 1. Create Web Service

1. Visit [render.com](https://render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository

### 2. Configure Service

**Settings**:
- **Name**: `talkmateai-server`
- **Region**: Choose nearest region
- **Branch**: `main`
- **Root Directory**: `apps/server`
- **Runtime**: `Python 3`

**Build Command**:
```bash
pip install uv && uv sync
```

**Start Command**:
```bash
uv run uvicorn main:app --host 0.0.0.0 --port $PORT
```

**Instance Type**:
- **Free** (for testing) - Note: Spins down after 15 min inactivity
- **Starter** ($7/month) - Recommended for production

### 3. Environment Variables (Render)

```env
GEMINI_API_KEY=your_gemini_api_key_here
HOST=0.0.0.0
PORT=10000
CORS_ORIGINS=https://your-vercel-app.vercel.app
ENVIRONMENT=production
LOG_LEVEL=INFO
```

### 4. Deploy

Click **"Create Web Service"**

First deployment takes 5-10 minutes. Your server will be at:
`https://your-app.onrender.com`

---

## Part 3: Connect Client and Server

### 1. Update Vercel Environment Variables

Go to Vercel → Your Project → Settings → Environment Variables

Update with your actual Render URL:

```env
NEXT_PUBLIC_WS_URL=wss://your-actual-app.onrender.com/ws/test-client
NEXT_PUBLIC_API_URL=https://your-actual-app.onrender.com
```

### 2. Redeploy Vercel

- Go to **Deployments** tab
- Click **"..."** on latest deployment
- Click **"Redeploy"**

### 3. Update Render CORS

Go to Render → Your Service → Environment

Update `CORS_ORIGINS` with your actual Vercel URL:

```env
CORS_ORIGINS=https://your-actual-project.vercel.app
```

Service will auto-redeploy.

---

## Verification

### Test Your Deployment

1. **Visit your Vercel URL**: `https://your-project.vercel.app`
2. **Check server health**: `https://your-app.onrender.com/health`
3. **Check API docs**: `https://your-app.onrender.com/docs`
4. **Test WebSocket**: Open browser console and check for connection

### Expected Behavior

✅ Frontend loads without errors
✅ WebSocket connects (check browser console)
✅ Voice detection works
✅ Avatar loads and responds

---

## Troubleshooting

### WebSocket Connection Failed

**Problem**: "WebSocket error" in console

**Solutions**:
1. Verify `NEXT_PUBLIC_WS_URL` uses `wss://` (not `ws://`)
2. Check CORS_ORIGINS includes your Vercel domain
3. Ensure Render service is running (free tier spins down)

### Server Not Responding

**Problem**: 502/503 errors

**Solutions**:
1. Check Render logs for errors
2. Verify `GEMINI_API_KEY` is set correctly
3. Ensure all dependencies installed (check build logs)
4. Free tier: Wait for service to spin up (can take 30-60 seconds)

### Build Failures

**Vercel**:
- Check build logs in Vercel dashboard
- Verify `apps/client` is set as root directory
- Ensure all dependencies in `package.json`

**Render**:
- Check build logs in Render dashboard
- Verify Python version compatibility
- Check `uv sync` completed successfully

---

## Cost Breakdown

### Free Tier (Testing)

- **Vercel**: Free (hobby plan)
  - Unlimited deployments
  - 100 GB bandwidth/month
  - Automatic HTTPS

- **Render**: Free
  - 750 hours/month
  - Spins down after 15 min inactivity
  - 512 MB RAM

**Total**: $0/month

### Production (Recommended)

- **Vercel**: Free (hobby) or $20/month (Pro)
- **Render**: $7/month (Starter)
  - Always on
  - 512 MB RAM
  - Better performance

**Total**: $7-27/month

---

## Custom Domains

### Vercel

1. Go to **Settings** → **Domains**
2. Add your domain
3. Update DNS records as instructed
4. SSL automatically provisioned

### Render

1. Go to **Settings** → **Custom Domain**
2. Add your domain
3. Update DNS CNAME record
4. SSL automatically provisioned

---

## Monitoring

### Vercel

- **Analytics**: Built-in (Pro plan)
- **Logs**: Real-time in dashboard
- **Deployments**: Automatic from GitHub

### Render

- **Logs**: Real-time in dashboard
- **Metrics**: CPU, Memory, Network
- **Health Checks**: Automatic
- **Alerts**: Email notifications

---

## Continuous Deployment

Both platforms support automatic deployment:

1. Push to GitHub `main` branch
2. Vercel automatically builds and deploys client
3. Render automatically builds and deploys server

No manual intervention needed!

---

## Security Checklist

- [ ] HTTPS enabled (automatic on both platforms)
- [ ] Environment variables secured
- [ ] CORS properly configured
- [ ] API keys not in code
- [ ] `.env` files in `.gitignore`

---

## Support

- **Vercel Docs**: https://vercel.com/docs
- **Render Docs**: https://render.com/docs
- **GitHub Issues**: Create issue in your repository

---

**Last Updated**: 2025-12-18
