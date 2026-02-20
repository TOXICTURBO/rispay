#!/bin/bash
# Migration script for Render deployment

echo "Running Prisma migrations..."

# Generate Prisma Client
npx prisma generate

# Deploy migrations
npx prisma migrate deploy

echo "Migrations completed!"
