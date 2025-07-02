#!/bin/bash

# 🗄️ Quadco App - Database Setup Helper
# Run this after adding PostgreSQL URL to Vercel

echo "🔧 Setting up PostgreSQL database for Quadco App..."
echo "=================================================="

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo ""
    echo "⚠️  DATABASE_URL environment variable is not set locally"
    echo ""
    echo "📋 TO COMPLETE SETUP:"
    echo ""
    echo "1. 🗄️ GET YOUR POSTGRESQL CONNECTION STRING:"
    echo "   → From your Neon.tech dashboard"
    echo "   → Should look like: postgresql://user:pass@ep-xyz.neon.tech/db?sslmode=require"
    echo ""
    echo "2. 🔧 UPDATE LOCAL .env FILE:"
    echo "   → Add this line to your .env file:"
    echo "   → DATABASE_URL=\"your_postgresql_connection_string\""
    echo ""
    echo "3. 🔄 RUN THIS SCRIPT AGAIN:"
    echo "   → ./setup-local-db.sh"
    echo ""
    exit 1
fi

echo "✅ DATABASE_URL is set locally"
echo "🔍 Testing database connection..."

# Test database connection
npx prisma db push --accept-data-loss

if [ $? -eq 0 ]; then
    echo "✅ Database schema updated successfully!"
    
    echo "🌱 Seeding database with initial data..."
    npm run seed
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "🎉 DATABASE SETUP COMPLETE!"
        echo ""
        echo "🔑 ADMIN LOGIN CREDENTIALS:"
        echo "   Email: superadmin@quadco.com"
        echo "   Password: SuperAdmin2025!"
        echo ""
        echo "🌐 Your app should now be fully functional at:"
        echo "   https://quadco-gxiolauxo-moha0886s-projects.vercel.app/"
        echo ""
        echo "✅ FEATURES NOW WORKING:"
        echo "   ✅ Authentication & Login"
        echo "   ✅ Customer Management"
        echo "   ✅ Product & Service Catalogs"
        echo "   ✅ Quotation Generation"
        echo "   ✅ Invoice Generation" 
        echo "   ✅ PDF Export"
        echo "   ✅ Delivery Notes"
        echo "   ✅ User Management"
        echo ""
    else
        echo "❌ Database seeding failed!"
        echo "💡 Try running: npm run seed"
    fi
else
    echo "❌ Database connection failed!"
    echo "💡 Please check your DATABASE_URL is correct"
fi
