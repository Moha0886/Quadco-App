# 🎯 PostgreSQL Setup - Step by Step Visual Guide

## 📋 **QUICK CHECKLIST**

### ✅ **Step 1: Create PostgreSQL Database (2 minutes)**

🌐 **Go to: https://neon.tech**

1. Click **"Sign Up"** (use GitHub/Google for faster setup)
2. Click **"Create a project"**
3. Fill in:
   - **Project name:** `quadco-app`
   - **Region:** (pick closest to you)
   - **PostgreSQL version:** (keep default)
4. Click **"Create project"**
5. **COPY the connection string** (it appears immediately)
   - Looks like: `postgresql://username:password@ep-xyz-123.us-east-1.neon.tech/neondb?sslmode=require`

### ✅ **Step 2: Add to Vercel (1 minute)**

🌐 **Go to: https://vercel.com/dashboard**

1. **Find and click** your `quadco-app` project
2. Click **"Settings"** tab (top menu)
3. Click **"Environment Variables"** (left sidebar)
4. Click **"Add New"** button
5. Fill in:
   - **Name:** `DATABASE_URL`
   - **Value:** (paste your Neon connection string)
   - **Environments:** ✅ Production ✅ Preview ✅ Development
6. Click **"Save"**

**🔄 Vercel will automatically redeploy (takes ~2 minutes)**

### ✅ **Step 3: Seed Database (1 minute)**

In your terminal:

```bash
# 1. Update your local .env file with the PostgreSQL URL
echo 'DATABASE_URL="your_postgresql_connection_string_here"' > .env

# 2. Run the setup script
./setup-local-db.sh
```

### 🎉 **Done! Login and Test**

**🌐 Go to:** https://quadco-gxiolauxo-moha0886s-projects.vercel.app/

**🔑 Login with:**
- Email: `superadmin@quadco.com`
- Password: `SuperAdmin2025!`

---

## 🚨 **Common Issues & Solutions**

### ❌ "Can't reach database server"
- **Solution:** Double-check your connection string is correct
- **Make sure:** It includes `?sslmode=require` at the end

### ❌ "Environment variable not found"
- **Solution:** Wait 2-3 minutes for Vercel redeploy to complete
- **Or:** Manually trigger redeploy in Vercel dashboard

### ❌ "Invalid login credentials"
- **Solution:** Run the seeding script: `npm run seed`
- **Make sure:** You updated local .env with PostgreSQL URL first

---

## 📞 **Need Help?**

1. **Check Vercel deployment logs:** Settings → Functions → View logs
2. **Test database connection:** Run `npm run db:check`
3. **Reset database:** Run `npx prisma db push --accept-data-loss && npm run seed`

**🎯 Goal:** Working login at your Vercel URL with admin credentials!
