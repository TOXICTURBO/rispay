# Environment Variables Reference

## Required Variables

### `DATABASE_URL`
**Type**: String  
**Format**: PostgreSQL connection string  
**Example**: `postgresql://user:password@ep-xxx-xxx.region.aws.neon.tech/rispay?sslmode=require`

**Description**: NeonDB connection string. Must include `sslmode=require` for secure connections.

**How to get**: 
1. Go to NeonDB dashboard
2. Select your project
3. Copy connection string from database settings

---

### `JWT_SECRET`
**Type**: String  
**Length**: Minimum 32 characters  
**Example**: `your-super-secret-jwt-key-min-32-characters-long`

**Description**: Secret key used to sign JWT tokens for authentication.

**How to generate**:
```bash
openssl rand -base64 32
```

**Security**: Keep this secret! Never commit to Git.

---

### `ADMIN_PASSWORD`
**Type**: String  
**Minimum Length**: 6 characters  
**Example**: `MySecurePassword123!`

**Description**: Initial password for the admin user. Change immediately after first login.

**Security**: Use a strong password. Change after deployment.

---

### `NODE_ENV`
**Type**: String  
**Values**: `development` | `production`  
**Default**: `development`

**Description**: Environment mode. Set to `production` for Render deployment.

---

## Optional Variables

### `PORT`
**Type**: Number  
**Default**: `3000`

**Description**: Port number for the server. Render sets this automatically, but you can override if needed.

---

### `NEXT_PUBLIC_WS_URL`
**Type**: String  
**Example**: `https://rispay.onrender.com` or `wss://rispay.onrender.com`

**Description**: WebSocket URL for real-time features. If not set, it auto-detects from the current domain.

**When to set**: 
- Using custom domain
- WebSocket connections failing
- Using separate WebSocket server

---

### `DIRECT_URL`
**Type**: String  
**Format**: PostgreSQL connection string (same as DATABASE_URL)

**Description**: Direct database connection URL for migrations. Only needed if NeonDB requires separate connection for migrations.

**When to set**: If `prisma migrate deploy` fails with connection pooling errors.

---

### `HOSTNAME`
**Type**: String  
**Default**: `0.0.0.0` (production) | `localhost` (development)

**Description**: Hostname to bind the server to. Usually don't need to set this.

---

## Render-Specific Variables

Render automatically sets:
- `PORT` - Port number
- `RENDER` - Set to `true` when running on Render
- `RENDER_SERVICE_NAME` - Your service name
- `RENDER_SERVICE_ID` - Service ID

You don't need to set these manually.

---

## Setting Variables in Render

1. Go to your Render service dashboard
2. Click "Environment" tab
3. Click "Add Environment Variable"
4. Enter key and value
5. Click "Save Changes"
6. Service will automatically redeploy

---

## Local Development

Create a `.env` file in the project root:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/rispay"
JWT_SECRET="your-local-secret-key"
ADMIN_PASSWORD="admin123"
NODE_ENV="development"
```

**Never commit `.env` to Git!**

---

## Security Best Practices

1. ✅ Use strong, unique values for `JWT_SECRET`
2. ✅ Change `ADMIN_PASSWORD` after first login
3. ✅ Never commit secrets to Git
4. ✅ Use Render's environment variable encryption
5. ✅ Rotate secrets periodically
6. ✅ Use different values for development and production
7. ✅ Restrict database access in NeonDB dashboard

---

## Verification

After setting variables, verify they're loaded:

1. Check Render logs for any errors
2. Test database connection (check `/api/health`)
3. Try logging in with admin credentials
4. Check browser console for any errors

---

## Troubleshooting

**Variable not loading?**
- Check spelling (case-sensitive)
- Verify variable is saved in Render dashboard
- Check service logs for errors
- Restart the service

**Database connection fails?**
- Verify `DATABASE_URL` format
- Check `sslmode=require` is included
- Verify NeonDB database is running
- Check IP allowlist (if enabled)

**JWT errors?**
- Verify `JWT_SECRET` is set
- Check it's at least 32 characters
- Ensure it's the same across all instances (if using multiple)
