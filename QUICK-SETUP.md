## 🎯 Quick Setup Guide - PostgreSQL Database for Quadco App

### Step 1: Create Free PostgreSQL Database (2 minutes)

1. **Go to [Neon.tech](https://neon.tech)** (Free tier - no credit card required)
2. **Sign up** with GitHub or email
3. **Create a new project** called "quadco-app"
4. **Copy the connection string** (it will look like this):
   ```
   postgresql://username:password@ep-xyz-123.us-east-1.neon.tech/neondb?sslmode=require
   ```

### Step 2: Update Environment Variables

**Local (.env file):**
```bash
# Replace this with your Neon connection string
DATABASE_URL="postgresql://username:password@ep-xyz-123.us-east-1.neon.tech/neondb?sslmode=require"
```

**Vercel Dashboard:**
1. Go to your Vercel project: https://vercel.com/dashboard
2. Settings → Environment Variables
3. Add `DATABASE_URL` with your connection string
4. Set for Production, Preview, and Development

### Step 3: Setup Database

```bash
# Install dependencies and setup database
npm install
npm run db:setup
```

This will:
- Push the schema to PostgreSQL
- Seed with sample data
- Create admin user: `superadmin@quadco.com` / `SuperAdmin2025!`

### Step 4: Deploy

```bash
git push origin main
```

The deployment will automatically trigger and use the PostgreSQL database.

### 🔥 Common Issues

**Error: "Environment variable not found: DATABASE_URL"**
- Make sure you added DATABASE_URL to both `.env` locally and Vercel environment variables

**Error: "database does not exist"**
- The database name in your connection string should match what Neon created (usually "neondb")

**Error: "connect ECONNREFUSED"**
- Check that your connection string includes `?sslmode=require` at the end

### 🎉 Success!

Once deployed, your app will be available at your Vercel URL with:
- Working authentication
- PostgreSQL database
- All features functional

**Admin Login:**
- Email: `superadmin@quadco.com`
- Password: `SuperAdmin2025!`
