#!/bin/bash
# Post-deployment script for Render
# This runs after the build completes

echo "Running post-deployment tasks..."

# Generate Prisma Client (if not already done)
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Seed database (only if needed - check if admin exists first)
# Uncomment if you want to auto-seed on deployment
# npm run db:seed

echo "Post-deployment tasks completed!"
