# Rispay - Multi-Bank Financial Simulation PWA

A full-stack Progressive Web App simulating a closed multi-bank financial ecosystem with Admin, Bank Provider, and User roles.

## 🚀 Quick Start (Render + NeonDB)

> **New to Render?** Check out [QUICK_START.md](./QUICK_START.md) for a 5-minute deployment guide!

### Prerequisites

- Node.js 18+
- NeonDB account ([Sign up free](https://neon.tech))
- Render account ([Sign up free](https://render.com))

### Local Development

1. **Clone and install**:
```bash
git clone <repository-url>
cd rispay
npm install
```

2. **Set up environment variables**:
```bash
cp .env.example .env
```

Edit `.env` with your NeonDB connection string:
```
DATABASE_URL="postgresql://user:password@ep-xxx-xxx.region.aws.neon.tech/rispay?sslmode=require"
JWT_SECRET="your-secret-key-min-32-chars"
ADMIN_PASSWORD="admin123"
```

3. **Set up database**:
```bash
npx prisma generate
npx prisma db push
npm run db:seed
```

4. **Run development server**:
```bash
npm run dev
```

Visit `http://localhost:3000`

### Render Deployment

**🚀 Fast Track**: See [QUICK_START.md](./QUICK_START.md) for 5-minute setup!

**📖 Detailed Guide**: See [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md) for complete instructions.

**Quick steps**:
1. Push code to GitHub
2. Create NeonDB database and copy connection string
3. In Render, create new Web Service (or use `render.yaml` blueprint)
4. Set environment variables (see [ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md))
5. Deploy and wait for build to complete!
6. Run database migrations and seed (via Render Shell)

## 📋 Features

- **Role-Based Access**: Admin, Provider, and User roles with strict isolation
- **Multi-Bank System**: Support for multiple banks with independent vaults
- **Transaction System**: Atomic transactions with fees, taxes, and real-time updates
- **Account Management**: Bank linking, account creation, and activation flow
- **Spending Insights**: Analytics and 30-day transaction charts
- **PWA Support**: Offline mode, installable, service worker
- **Real-time Updates**: WebSocket integration for live balance updates
- **Dark Mode**: Smooth theme switching with persistence
- **Modern UI**: Premium fintech design with Framer Motion animations

## 🛠 Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Next.js API Routes, Prisma ORM, PostgreSQL (NeonDB)
- **Real-time**: Socket.io
- **Authentication**: JWT with secure cookies
- **PWA**: next-pwa
- **Deployment**: Render

## 📁 Project Structure

```
rispay/
├── app/                    # Next.js app directory
│   ├── (auth)/            # Authentication pages
│   ├── (user)/            # User-facing pages
│   ├── (admin)/           # Admin pages
│   ├── (provider)/        # Provider pages
│   └── api/               # API routes
├── components/            # React components
├── lib/                   # Utility functions
├── hooks/                 # Custom React hooks
├── prisma/               # Database schema
└── public/               # Static assets
```

## 🔐 Default Admin Credentials

- **Username**: `admin`
- **Password**: Set via `ADMIN_PASSWORD` environment variable (default: `admin123`)

**⚠️ Change immediately after first login!**

## 🔧 Environment Variables

Required:
- `DATABASE_URL` - NeonDB PostgreSQL connection string
- `JWT_SECRET` - Secret for JWT tokens (min 32 characters)
- `ADMIN_PASSWORD` - Initial admin password
- `NODE_ENV` - Environment (development/production)

Optional:
- `NEXT_PUBLIC_WS_URL` - WebSocket URL (auto-detected)
- `PORT` - Server port (auto-set by Render)

## 📚 Documentation

- [Quick Start Guide](./QUICK_START.md) - Deploy in 5 minutes
- [Render Deployment Guide](./RENDER_DEPLOYMENT.md) - Detailed deployment steps
- [Environment Variables](./ENVIRONMENT_VARIABLES.md) - Complete env var reference
- [Deployment Checklist](./DEPLOYMENT_CHECKLIST.md) - Pre/post deployment checklist
- [Implementation Notes](./NOTES.md) - Technical details
- [Database Migrations](./prisma/migrations/README.md) - Migration guide

## 🧪 Development

### Database Commands

```bash
# Generate Prisma Client
npm run db:generate

# Push schema changes
npm run db:push

# Run migrations
npm run db:migrate

# Seed database
npm run db:seed

# Open Prisma Studio
npm run db:studio
```

### Build for Production

```bash
npm run build
npm start
```

## 🐛 Troubleshooting

### Database Connection

- Ensure `DATABASE_URL` includes `sslmode=require`
- Check NeonDB dashboard for connection status
- Verify IP allowlist settings (if enabled)

### Build Issues

- Run `npx prisma generate` before build
- Check Node.js version (18+ required)
- Clear `.next` folder and rebuild

### WebSocket Issues

- Verify WebSocket is enabled in Render service settings
- Check `NEXT_PUBLIC_WS_URL` environment variable
- Review browser console for connection errors

## 📝 License

MIT

## 🤝 Contributing

Contributions welcome! Please read the contributing guidelines first.
