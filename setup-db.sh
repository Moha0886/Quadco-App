#!/bin/bash

# Production Database Setup Script
# This script helps set up the PostgreSQL database for production deployment

echo "🚀 Setting up PostgreSQL database for production deployment..."

echo "
📋 REQUIRED STEPS:

1. Create a PostgreSQL database (choose one):
   - Neon (https://neon.tech) - Free tier available
   - Supabase (https://supabase.com) - Free tier available  
   - Railway (https://railway.app) - Free tier available
   - Vercel Postgres (https://vercel.com/storage/postgres) - Paid

2. Get your connection string (should look like):
   postgresql://username:password@hostname/database?sslmode=require

3. Set up environment variables:
   - Update .env locally with DATABASE_URL
   - Add DATABASE_URL to Vercel environment variables

4. Run the setup commands below:
"

echo "🔧 Available commands:"
echo "npm run db:setup    - Push schema and seed database"
echo "npm run seed        - Seed database with sample data"
echo "npx prisma studio   - Open database admin interface"

echo "
🔑 Admin Login Credentials (after seeding):
Email: superadmin@quadco.com
Password: SuperAdmin2025!

📝 To deploy:
1. Update your DATABASE_URL environment variable
2. Run: npm run db:setup
3. Commit and push: git add . && git commit -m 'Migrate to PostgreSQL' && git push
4. Deploy will trigger automatically on Vercel
"

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "⚠️  DATABASE_URL environment variable is not set"
    echo "Please add your PostgreSQL connection string to .env file"
else
    echo "✅ DATABASE_URL is set"
    
    # Ask if user wants to run setup
    read -p "Do you want to run database setup now? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🔄 Setting up database..."
        npm run db:setup
        echo "✅ Database setup complete!"
    fi
fi
