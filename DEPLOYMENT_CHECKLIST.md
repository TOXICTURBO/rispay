# Deployment Checklist for Render + NeonDB

## Pre-Deployment

- [ ] Code pushed to Git repository (GitHub/GitLab/Bitbucket)
- [ ] All environment variables documented
- [ ] Database schema finalized
- [ ] Tested locally with production build

## NeonDB Setup

- [ ] Created NeonDB account
- [ ] Created new project
- [ ] Created database (e.g., `rispay`)
- [ ] Copied connection string
- [ ] Verified connection string includes `sslmode=require`
- [ ] Tested connection locally

## Render Setup

- [ ] Created Render account
- [ ] Created new Web Service
- [ ] Connected Git repository
- [ ] Set build command: `npm install && npm run build`
- [ ] Set start command: `npm start`
- [ ] Selected appropriate plan (Starter minimum)

## Environment Variables

- [ ] `DATABASE_URL` - NeonDB connection string
- [ ] `JWT_SECRET` - Secure random string (32+ chars)
- [ ] `ADMIN_PASSWORD` - Strong password
- [ ] `NODE_ENV` - Set to `production`
- [ ] `PORT` - Usually auto-set by Render
- [ ] `NEXT_PUBLIC_WS_URL` - Optional, for WebSocket

## Database Migration

- [ ] Prisma migrations run successfully
- [ ] Database seeded with admin user
- [ ] Verified admin can log in
- [ ] Tested database connection

## Post-Deployment

- [ ] Application accessible at Render URL
- [ ] Login page loads correctly
- [ ] Can log in with admin credentials
- [ ] Changed admin password
- [ ] Generated test registration keys
- [ ] Created test bank
- [ ] Tested user registration flow
- [ ] Tested transaction flow
- [ ] Verified WebSocket connections (if enabled)
- [ ] Checked PWA installation
- [ ] Tested offline mode
- [ ] Verified dark mode toggle

## Security

- [ ] Changed default admin password
- [ ] JWT_SECRET is strong and unique
- [ ] Environment variables are secure
- [ ] Database connection uses SSL
- [ ] Rate limiting is working
- [ ] CORS is properly configured

## Monitoring

- [ ] Render logs are accessible
- [ ] NeonDB dashboard shows connections
- [ ] Error tracking set up (optional)
- [ ] Performance monitoring (optional)

## Documentation

- [ ] Deployment guide updated
- [ ] Environment variables documented
- [ ] Team has access to credentials (securely)
- [ ] Rollback plan documented

## Testing

- [ ] All user roles tested
- [ ] Transactions work correctly
- [ ] Real-time updates work
- [ ] PWA features work
- [ ] Mobile responsiveness verified
- [ ] Cross-browser testing done

## Optional Enhancements

- [ ] Custom domain configured
- [ ] SSL certificate verified
- [ ] CDN configured (if needed)
- [ ] Backup strategy in place
- [ ] Monitoring alerts set up
