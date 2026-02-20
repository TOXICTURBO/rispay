# Render Deployment Guide

This guide will help you deploy Rispay to Render with NeonDB.

## Prerequisites

1. A Render account (sign up at https://render.com)
2. A NeonDB account (sign up at https://neon.tech)
3. Your code pushed to a Git repository (GitHub, GitLab, or Bitbucket)

## Step 1: Set Up NeonDB

1. Log in to [Neon Dashboard](https://console.neon.tech)
2. Create a new project
3. Create a new database (e.g., `rispay`)
4. Copy the connection string from the dashboard
   - It will look like: `postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/rispay?sslmode=require`
   - **Important**: Make sure `sslmode=require` is included

## Step 2: Deploy to Render

### Option A: Using render.yaml (Recommended)

1. Push your code to GitHub/GitLab/Bitbucket
2. In Render Dashboard, click "New" → "Blueprint"
3. Connect your repository
4. Render will automatically detect `render.yaml` and configure the service
5. Add environment variables (see Step 3)

### Option B: Manual Setup

1. In Render Dashboard, click "New" → "Web Service"
2. Connect your repository
3. Configure the service:
   - **Name**: rispay (or your preferred name)
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Starter (or higher for production)

## Step 3: Environment Variables

Add these environment variables in Render Dashboard:

### Required Variables

- `DATABASE_URL`: Your NeonDB connection string
- `JWT_SECRET`: A secure random string (min 32 characters)
  - Generate one: `openssl rand -base64 32`
- `ADMIN_PASSWORD`: Initial admin password (change after first login)
- `NODE_ENV`: `production`

### Optional Variables

- `NEXT_PUBLIC_WS_URL`: WebSocket URL (if using custom domain)
- `PORT`: Usually set automatically by Render

## Step 4: Database Setup

After the first deployment:

1. Go to your Render service logs
2. Check if Prisma migrations ran successfully
3. If not, you can run them manually:
   - Open Render Shell: `render shell`
   - Run: `npx prisma migrate deploy`
   - Run: `npm run db:seed`

## Step 5: Verify Deployment

1. Visit your Render URL (e.g., `https://rispay.onrender.com`)
2. You should see the login page
3. Log in with:
   - Username: `admin`
   - Password: (your ADMIN_PASSWORD)

## Step 6: Post-Deployment

1. **Change Admin Password**: Log in and change the admin password
2. **Generate Registration Keys**: Create USER and PROVIDER registration keys
3. **Create Banks**: Set up your first bank
4. **Test Transactions**: Verify the system works end-to-end

## Troubleshooting

### Database Connection Issues

- Verify `DATABASE_URL` includes `sslmode=require`
- Check NeonDB dashboard for connection limits
- Ensure IP allowlist is configured (if required)

### Build Failures

- Check Render build logs
- Ensure `prisma generate` runs during build
- Verify all dependencies are in `package.json`

### WebSocket Issues

- Render supports WebSockets, but may need configuration
- Check Render logs for WebSocket connection errors
- Consider using Server-Sent Events (SSE) as alternative

### PWA Not Working

- Ensure `NODE_ENV=production` is set
- Check service worker registration in browser console
- Verify manifest.json is accessible

## Performance Tips

1. **Upgrade Plan**: Starter plan has limitations; upgrade for production
2. **Database Connection Pooling**: NeonDB handles this automatically
3. **Caching**: Consider adding Redis for rate limiting
4. **CDN**: Use Render's CDN for static assets

## Monitoring

- Check Render logs regularly
- Monitor NeonDB dashboard for connection issues
- Set up alerts for errors
- Monitor database size and performance

## Backup

- NeonDB provides automatic backups
- Consider exporting data regularly
- Keep environment variables backed up securely

## Custom Domain

1. In Render Dashboard, go to your service
2. Click "Custom Domains"
3. Add your domain
4. Update DNS records as instructed
5. Update `NEXT_PUBLIC_WS_URL` if using WebSocket

## Support

- Render Docs: https://render.com/docs
- NeonDB Docs: https://neon.tech/docs
- Project Issues: Check GitHub issues
