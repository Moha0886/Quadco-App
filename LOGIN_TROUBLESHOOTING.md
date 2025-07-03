# 🔐 Login Troubleshooting Guide

## ❌ **Current Issue: Can't Log In**

I've identified and fixed several critical issues that were preventing login:

### ✅ **Issues Fixed:**
1. **Missing Database Schema** - Restored complete Prisma schema
2. **Incorrect User Model** - Fixed field names (firstName/lastName instead of name)
3. **Empty Admin Script** - Recreated proper super admin creation script
4. **PostgreSQL Configuration** - Updated schema to use PostgreSQL

### 🚀 **Steps to Fix Your Login Issue:**

#### **Step 1: Wait for New Deployment (2-3 minutes)**
The fixes have been pushed to GitHub and Railway will automatically redeploy.

#### **Step 2: Set Up Database Properly**
Once the new deployment is ready, you need to set up the database:

**In Railway Dashboard:**
1. Go to your project
2. Open the terminal/console for your app service
3. Run these commands one by one:

```bash
# Generate Prisma client with new schema
npx prisma generate

# Create database tables
npx prisma db push

# Seed basic data
npm run seed

# Create admin user
npx tsx scripts/create-super-admin.ts
```

#### **Step 3: Test Your Login**
Use these credentials:
- **Email**: `admin@quadco.com`
- **Password**: `admin123`

### 🧪 **Debug Your Deployment**

I've created a debugging tool for you. Run this locally:

```bash
node debug-railway-login.js
```

This will test your Railway URL and diagnose any remaining issues.

### 📋 **Expected Database Setup Output:**

When you run the setup commands, you should see:

```bash
# npx prisma generate
✔ Generated Prisma Client

# npx prisma db push  
✔ Database sync completed

# npm run seed
✅ Seeded roles and permissions
✅ Created service categories
✅ Sample data created

# npx tsx scripts/create-super-admin.ts
🎉 Super Admin created successfully!
📧 Email: admin@quadco.com
🔑 Password: admin123
```

### 🔍 **Common Issues & Solutions:**

#### **Issue**: "Can't connect to database"
**Solution**: Check DATABASE_URL environment variable in Railway dashboard

#### **Issue**: "User not found" 
**Solution**: Run the admin creation script: `npx tsx scripts/create-super-admin.ts`

#### **Issue**: "Invalid password"
**Solution**: Use correct credentials: admin@quadco.com / admin123

#### **Issue**: "API returns HTML instead of JSON"
**Solution**: This was the old Vercel SSO issue - should be fixed on Railway

### 📱 **Quick Test Commands:**

Test your API endpoints:

```bash
# Test basic connectivity
curl https://your-railway-app.railway.app/api/test

# Test login
curl -X POST https://your-railway-app.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@quadco.com","password":"admin123"}'
```

### 🆘 **If Still Having Issues:**

1. **Share your Railway URL** so I can test it directly
2. **Check Railway logs** for any error messages
3. **Verify environment variables** are set correctly:
   - `DATABASE_URL`
   - `NODE_ENV=production`
   - `NEXTAUTH_SECRET`

The fixes I've applied should resolve the login issues once the database is properly set up! 🚀
