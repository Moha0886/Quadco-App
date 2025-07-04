#!/usr/bin/env node

/**
 * Database Setup Execution Script
 * Runs the actual database setup commands
 */

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🗄️  EXECUTING DATABASE SETUP');
console.log('============================');
console.log('');

// Check if .env file exists and has DATABASE_URL
function checkEnvironment() {
  if (!fs.existsSync('.env')) {
    console.log('❌ Error: .env file not found');
    console.log('Please create a .env file with your DATABASE_URL');
    return false;
  }
  
  const envContent = fs.readFileSync('.env', 'utf8');
  if (!envContent.includes('DATABASE_URL')) {
    console.log('❌ Error: DATABASE_URL not found in .env');
    console.log('Please add your PostgreSQL connection string to .env');
    return false;
  }
  
  return true;
}

async function runDatabaseSetup() {
  try {
    console.log('✅ Environment check passed');
    console.log('');
    
    console.log('1️⃣ Generating Prisma Client...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    console.log('✅ Prisma Client generated');
    console.log('');
    
    console.log('2️⃣ Creating database tables...');
    execSync('npx prisma db push', { stdio: 'inherit' });
    console.log('✅ Database tables created');
    console.log('');
    
    console.log('3️⃣ Seeding database with initial data...');
    execSync('npm run seed', { stdio: 'inherit' });
    console.log('✅ Database seeded');
    console.log('');
    
    console.log('4️⃣ Creating super admin user...');
    execSync('npx tsx scripts/create-super-admin.ts', { stdio: 'inherit' });
    console.log('✅ Super admin created');
    console.log('');
    
    console.log('🎉 DATABASE SETUP COMPLETE!');
    console.log('===========================');
    console.log('');
    console.log('🔐 Admin Login Credentials:');
    console.log('   Email: admin@quadco.com');
    console.log('   Password: admin123');
    console.log('');
    console.log('🌐 Your App:');
    console.log('   https://quadco-app-moha0886s-projects.vercel.app');
    console.log('');
    console.log('🔗 Login URL:');
    console.log('   https://quadco-app-moha0886s-projects.vercel.app/login');
    console.log('');
    console.log('✅ Next Steps:');
    console.log('   1. Test login with admin credentials');
    console.log('   2. Verify all app features work');
    console.log('   3. Start using your business management app!');
    
  } catch (error) {
    console.log('❌ Error during database setup:', error.message);
    console.log('');
    console.log('🔧 Troubleshooting:');
    console.log('   1. Check your DATABASE_URL is correct');
    console.log('   2. Ensure your database is accessible');
    console.log('   3. Verify all dependencies are installed');
  }
}

// Main execution
if (checkEnvironment()) {
  console.log('🚀 Starting database setup...');
  console.log('');
  runDatabaseSetup();
} else {
  console.log('');
  console.log('📋 To fix this:');
  console.log('   1. Get your PostgreSQL connection string from Neon/Supabase');
  console.log('   2. Add it to your .env file:');
  console.log('      DATABASE_URL="postgresql://user:pass@host:5432/db"');
  console.log('   3. Run this script again');
}
