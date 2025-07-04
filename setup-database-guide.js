#!/usr/bin/env node

/**
 * Database Setup Guide for Vercel
 * Helps set up PostgreSQL database for production
 */

console.log('🗄️  DATABASE SETUP FOR VERCEL');
console.log('=============================');
console.log('');

console.log('📋 STEP 1: Create PostgreSQL Database');
console.log('-------------------------------------');
console.log('Choose one of these free PostgreSQL providers:');
console.log('');
console.log('🟢 NEON (Recommended)');
console.log('   • Website: https://neon.tech');
console.log('   • Free tier: 512 MB, 1 database');
console.log('   • Sign up and create a new project');
console.log('');
console.log('🟡 SUPABASE');
console.log('   • Website: https://supabase.com');
console.log('   • Free tier: 500 MB, 2 projects');
console.log('   • Sign up and create a new project');
console.log('');
console.log('🔵 AIVEN');
console.log('   • Website: https://aiven.io');
console.log('   • Free tier: 1 month trial');
console.log('   • Sign up and create PostgreSQL service');
console.log('');

console.log('📋 STEP 2: Get Database Connection String');
console.log('----------------------------------------');
console.log('After creating your database, you will get a connection string like:');
console.log('postgresql://username:password@host:5432/database_name');
console.log('');

console.log('📋 STEP 3: Add to Vercel Environment Variables');
console.log('---------------------------------------------');
console.log('1. Go to: https://vercel.com/moha0886s-projects/quadco-app');
console.log('2. Click Settings → Environment Variables');
console.log('3. Add these variables:');
console.log('   • DATABASE_URL = your_postgresql_connection_string');
console.log('   • NEXTAUTH_SECRET = your_secret_key');
console.log('   • NEXTAUTH_URL = https://quadco-app-moha0886s-projects.vercel.app');
console.log('');

console.log('📋 STEP 4: Run Database Setup Commands');
console.log('-------------------------------------');
console.log('After setting up the database, run these commands locally:');
console.log('');
console.log('   npx prisma db push');
console.log('   npm run seed');
console.log('   npx tsx scripts/create-super-admin.ts');
console.log('');

console.log('🎯 QUICK SETUP WITH NEON');
console.log('========================');
console.log('1. Go to https://neon.tech and sign up');
console.log('2. Create a new project');
console.log('3. Copy the connection string');
console.log('4. Add it to Vercel environment variables');
console.log('5. Run the database setup commands');
console.log('');

console.log('💡 Need help? Run: node setup-neon-guide.js');
console.log('');
