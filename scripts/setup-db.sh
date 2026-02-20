#!/bin/bash
# Database setup script for NeonDB

echo "Setting up database..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "ERROR: DATABASE_URL environment variable is not set"
    exit 1
fi

# Generate Prisma Client
echo "Generating Prisma Client..."
npx prisma generate

# Push schema to database
echo "Pushing schema to database..."
npx prisma db push

# Run migrations
echo "Running migrations..."
npx prisma migrate deploy

# Seed database
echo "Seeding database..."
npm run db:seed

echo "Database setup completed!"
echo ""
echo "You can now log in with:"
echo "  Username: admin"
echo "  Password: (your ADMIN_PASSWORD)"
