# Railway Deployment Guide

## Current Status
✅ Build issues resolved
✅ Code committed and pushed to GitHub
✅ Ready for deployment

## Deployment Steps for Railway

### 1. Sign up/Login to Railway
- Go to [railway.app](https://railway.app)
- Sign in with GitHub account

### 2. Create New Project
- Click "New Project"
- Select "Deploy from GitHub repo"
- Choose the `Quadco-App` repository

### 3. Configure Environment Variables
In Railway dashboard, go to your project > Variables tab and add:

```
DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require
NODE_ENV=production
NEXTAUTH_SECRET=your-secret-here-minimum-32-characters
```

### 4. Database Setup Options

#### Option A: Use Railway PostgreSQL
1. In Railway dashboard, click "New Service"
2. Select "PostgreSQL"
3. Railway will automatically create DATABASE_URL
4. Copy the DATABASE_URL from PostgreSQL service variables

#### Option B: Use External PostgreSQL (Neon, Aiven, etc.)
1. Create PostgreSQL database on your preferred provider
2. Copy the connection string
3. Add it as DATABASE_URL in Railway variables

### 5. Deploy and Setup Database
Once deployed:

1. **Access Railway CLI or use their built-in terminal:**
   ```bash
   # Install dependencies (should happen automatically)
   npm install

   # Generate Prisma client
   npx prisma generate

   # Push database schema
   npx prisma db push

   # Seed the database
   npm run seed
   ```

2. **Create admin user:**
   ```bash
   node scripts/create-super-admin.ts
   ```

### 6. Test Deployment
- Your app will be available at: `https://your-app-name.railway.app`
- Test the API endpoints:
  - `GET /api/test` - Should return JSON (not HTML)
  - `POST /api/auth/login` - Test with admin credentials
  - `GET /api/customers` - Test authenticated endpoint

## Key Advantages of Railway
- ✅ No SSO/authentication interference
- ✅ Automatic HTTPS
- ✅ Easy environment variable management
- ✅ Built-in PostgreSQL option
- ✅ GitHub integration
- ✅ Simple deployment process

## Rollback Plan
If Railway doesn't work, we can try:
1. **Render.com** - Similar to Railway
2. **DigitalOcean App Platform**
3. **Heroku** (if budget allows)
4. **Self-hosted VPS**

## Database Credentials Needed
You'll need your PostgreSQL connection details:
- Host
- Port
- Database name
- Username
- Password

If you don't have these, we can create a new database on Railway or another provider.

## Next Steps
1. Follow the deployment steps above
2. Configure environment variables
3. Set up database
4. Test all functionality
5. Update any frontend URLs if needed

The application should work perfectly on Railway without the Vercel SSO issues!
