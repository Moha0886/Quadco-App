# 🔧 FIXING THE LOGIN ISSUE - Step by Step Guide

## Problem
The Quadco App is deployed but users cannot log in because there are no users in the database.

## Solution

### Step 1: Initialize the Database
1. **Visit the setup API endpoint** to create initial data:
   ```
   https://quadco-app.vercel.app/api/setup
   ```
   This will create an admin user and sample data.

### Step 2: Login with Admin Credentials
After running the setup, use these credentials to log in:
- **Email:** `admin@quadco.com`
- **Password:** `admin123`

### Step 3: Access the Application
1. Go to: https://quadco-app.vercel.app/login
2. Enter the admin credentials above
3. You should now have access to all features

### Step 4: Verify Everything Works
Once logged in, you can:
- ✅ View Dashboard
- ✅ Manage Customers  
- ✅ Manage Products
- ✅ Manage Services
- ✅ Create Quotations
- ✅ Manage Invoices
- ✅ Track Delivery Notes
- ✅ Manage Users
- ✅ Set Permissions

## Alternative: Manual Database Setup

If the setup API doesn't work, you can manually create a user by:

1. **Connect to your database** (Vercel Postgres)
2. **Run this SQL:**
   ```sql
   -- Create admin role
   INSERT INTO roles (id, name, description, "createdAt", "updatedAt") 
   VALUES (gen_random_uuid(), 'Admin', 'Full system access', NOW(), NOW());

   -- Create admin user (replace ROLE_ID with the actual role ID from above)
   INSERT INTO users (id, email, password, "firstName", "lastName", "isActive", "roleId", "createdAt", "updatedAt")
   VALUES (gen_random_uuid(), 'admin@quadco.com', '$2a$10$hash_here', 'Admin', 'User', true, 'ROLE_ID', NOW(), NOW());
   ```

## Testing the Fix

After setup, test these URLs:
- ✅ **Login:** https://quadco-app.vercel.app/login
- ✅ **Dashboard:** https://quadco-app.vercel.app/dashboard  
- ✅ **Customers:** https://quadco-app.vercel.app/customers
- ✅ **Products:** https://quadco-app.vercel.app/products
- ✅ **Services:** https://quadco-app.vercel.app/services
- ✅ **Quotations:** https://quadco-app.vercel.app/quotations
- ✅ **Invoices:** https://quadco-app.vercel.app/invoices
- ✅ **Delivery Notes:** https://quadco-app.vercel.app/delivery-notes

## Current Status
- ✅ Application deployed successfully
- ✅ All pages and APIs working
- ✅ Database connected
- ⚠️ **Need to initialize database with users**

## Next Steps
1. Run the setup API endpoint
2. Login with admin credentials
3. Create additional users as needed
4. Start using the business management features

The application is fully functional - it just needs initial data setup!
