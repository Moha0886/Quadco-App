#!/usr/bin/env node

/**
 * Complete Database Setup Script for Vercel with Aiven Database
 * Sets up PostgreSQL database and creates admin user
 */

const { execSync } = require('child_process');
const crypto = require('crypto');
const fs = require('fs');

console.log('🚀 VERCEL DATABASE SETUP WITH AIVEN');
console.log('===================================');
console.log('');

// Generate a secure secret
const generateSecret = () => {
  return crypto.randomBytes(32).toString('hex');
};

const nextAuthSecret = generateSecret();
console.log('🔑 Generated NEXTAUTH_SECRET:');
console.log(nextAuthSecret);
console.log('');

// Check current Aiven connection string
console.log('🔍 Current Aiven Database Configuration:');
try {
  const envProd = fs.readFileSync('.env.production', 'utf8');
  const dbMatch = envProd.match(/DATABASE_URL="([^"]*)/);
  
  if (dbMatch && dbMatch[1]) {
    const aivenUrl = dbMatch[1];
    console.log('✅ Found Aiven Database URL');
    console.log('📊 Host:', aivenUrl.includes('aivencloud.com') ? 'Aiven Cloud' : 'Unknown');
    
    // Check if URL is complete
    if (!aivenUrl.includes('?sslmode=require') && !aivenUrl.endsWith('"')) {
      console.log('⚠️  Database URL appears incomplete');
      console.log('');
      
      // Fix the URL
      const fixedUrl = aivenUrl + '"';
      console.log('🔧 FIXING DATABASE URL...');
      
      // Update .env.production
      const fixedEnvProd = envProd.replace(/DATABASE_URL="[^"]*/, `DATABASE_URL="${aivenUrl}"`);
      fs.writeFileSync('.env.production', fixedEnvProd);
      
      // Update local .env for running setup commands
      const localEnv = `# Environment variables declared in this file are automatically made available to Prisma.
# See the documentation for more detail: https://pris.ly/d/prisma-schema#accessing-environment-variables-from-the-schema

# Prisma supports the native connection string format for PostgreSQL, MySQL, SQLite, SQL Server, MongoDB and CockroachDB.
# See the documentation for all the connection string options: https://pris.ly/d/connection-strings

DATABASE_URL="${aivenUrl}"
NEXTAUTH_SECRET="${nextAuthSecret}"
`;
      fs.writeFileSync('.env', localEnv);
      
      console.log('✅ Fixed database URLs in both .env files');
      console.log('');
    }
    
    // Now provide setup instructions
    console.log('📋 NEXT STEPS:');
    console.log('=============');
    console.log('');
    
    console.log('1️⃣ Add Environment Variables to Vercel:');
    console.log('   Go to: https://vercel.com/moha0886s-projects/quadco-app/settings/environment-variables');
    console.log('');
    console.log('   Add these THREE variables:');
    console.log('');
    console.log('   Variable: DATABASE_URL');
    console.log(`   Value: ${aivenUrl}`);
    console.log('   Environment: ✅ Production ✅ Preview ✅ Development');
    console.log('');
    console.log('   Variable: NEXTAUTH_SECRET');
    console.log(`   Value: ${nextAuthSecret}`);
    console.log('   Environment: ✅ Production ✅ Preview ✅ Development');
    console.log('');
    console.log('   Variable: NEXTAUTH_URL');
    console.log('   Value: https://quadco-app-moha0886s-projects.vercel.app');
    console.log('   Environment: ✅ Production ✅ Preview ✅ Development');
    console.log('');
    
    console.log('2️⃣ Run Database Setup Commands:');
    console.log('   After adding the environment variables, run:');
    console.log('');
    console.log('   npx prisma db push      # Create tables');
    console.log('   npm run seed           # Add initial data');
    console.log('   npx tsx scripts/create-super-admin.ts  # Create admin user');
    console.log('');
    
    console.log('3️⃣ Test Your App:');
    console.log('   • Wait 2-3 minutes for Vercel to redeploy');
    console.log('   • Go to: https://quadco-app-moha0886s-projects.vercel.app/login');
    console.log('   • Login with: admin@quadco.com / admin123');
    console.log('');
    
    console.log('🤖 AUTOMATED OPTION:');
    console.log('If you want me to run the database setup commands now, type:');
    console.log('node run-db-setup.js');
    console.log('');
    
  } else {
    console.log('❌ Could not find Aiven database URL');
    console.log('Please check your .env.production file');
  }
} catch (error) {
  console.log('❌ Error reading environment files:', error.message);
}

console.log('🎯 SUMMARY:');
console.log('1. Add 3 environment variables to Vercel (see above)');
console.log('2. Run database setup commands');
console.log('3. Test login at your live app');
console.log('');
console.log('🔗 Your live app: https://quadco-app-moha0886s-projects.vercel.app');
