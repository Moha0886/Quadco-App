#!/bin/bash

# Railway Post-Deployment Setup Script
echo "🚀 Setting up Quadco App on Railway..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL environment variable is not set"
    echo "Please set DATABASE_URL in Railway dashboard first"
    exit 1
fi

echo "✅ DATABASE_URL found"

# Generate Prisma client
echo "📦 Generating Prisma client..."
npx prisma generate

# Push database schema
echo "🗄️ Setting up database schema..."
npx prisma db push --accept-data-loss

# Seed the database
echo "🌱 Seeding database..."
npm run seed

echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Create admin user: node scripts/create-super-admin.ts"
echo "2. Test your app at your Railway URL"
echo "3. Login with admin credentials"
