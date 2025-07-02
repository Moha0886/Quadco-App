# Production Database Setup Guide

## Step 1: Create a PostgreSQL Database

### Option 1: Neon (Recommended - Free tier available)
1. Go to https://neon.tech
2. Sign up and create a new project
3. Copy the connection string (it will look like: `postgresql://username:password@hostname/database?sslmode=require`)

### Option 2: Supabase
1. Go to https://supabase.com
2. Create a new project
3. Go to Settings > Database
4. Copy the connection string

### Option 3: Railway
1. Go to https://railway.app
2. Create a new project
3. Add PostgreSQL service
4. Copy the connection string

## Step 2: Update Environment Variables

### Local Development (.env)
```
DATABASE_URL="postgresql://username:password@hostname/database?sslmode=require"
```

### Vercel Environment Variables
1. Go to your Vercel project dashboard
2. Go to Settings > Environment Variables
3. Add `DATABASE_URL` with your PostgreSQL connection string
4. Make sure it's set for Production, Preview, and Development environments

## Step 3: Run Migration and Seed
```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed the database
npm run seed
```

## Step 4: Deploy to Vercel
```bash
git add .
git commit -m "Migrate to PostgreSQL for production"
git push origin main
```

The deployment will automatically trigger on Vercel.
