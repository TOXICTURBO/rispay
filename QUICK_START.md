# Quick Start Guide - Render + NeonDB

## 🚀 Deploy in 5 Minutes

### Step 1: Set Up NeonDB (2 minutes)

1. Go to [neon.tech](https://neon.tech) and sign up
2. Create a new project
3. Create a database named `rispay`
4. Copy the connection string (it looks like this):
   ```
   postgresql://user:password@ep-xxx-xxx.region.aws.neon.tech/rispay?sslmode=require
   ```
   **Important**: Make sure it includes `?sslmode=require`

### Step 2: Deploy to Render (3 minutes)

1. Go to [render.com](https://render.com) and sign up
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: rispay
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Starter (free tier works!)

5. Add Environment Variables:
   - `DATABASE_URL` = Your NeonDB connection string
   - `JWT_SECRET` = Generate one: `openssl rand -base64 32`
   - `ADMIN_PASSWORD` = Choose a strong password
   - `NODE_ENV` = `production`

6. Click "Create Web Service"

### Step 3: Set Up Database (Automatic)

Render will automatically:
1. Install dependencies
2. Generate Prisma Client
3. Build the application

After first deployment, you may need to:
1. Go to Render Shell (in your service dashboard)
2. Run: `npx prisma migrate deploy`
3. Run: `npm run db:seed`

### Step 4: Access Your App

1. Wait for deployment to complete (2-3 minutes)
2. Visit your Render URL (e.g., `https://rispay.onrender.com`)
3. Log in with:
   - Username: `admin`
   - Password: Your `ADMIN_PASSWORD`

### Step 5: First Steps

1. **Change Admin Password** (Settings)
2. **Generate Registration Keys** (Admin Dashboard)
   - Create a USER key
   - Create a PROVIDER key
3. **Create Your First Bank** (Admin Dashboard)
4. **Test the System** (Register a test user)

## 🎉 You're Done!

Your multi-bank financial simulation platform is now live!

## 📚 Next Steps

- Read [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md) for detailed info
- Check [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) for security
- Customize your app settings

## 🆘 Troubleshooting

**Database connection fails?**
- Verify `DATABASE_URL` includes `sslmode=require`
- Check NeonDB dashboard for connection status

**Build fails?**
- Check Render build logs
- Ensure `prisma generate` runs (it's in build command)

**Can't log in?**
- Verify database was seeded
- Check `ADMIN_PASSWORD` is set correctly

## 💡 Pro Tips

1. **Use Render Blueprint** (render.yaml) for easier setup
2. **Enable Auto-Deploy** for automatic updates
3. **Set up Custom Domain** for production
4. **Monitor Logs** regularly in Render dashboard
