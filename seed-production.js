#!/usr/bin/env node

/**
 * Seed Production Database - Quadco App
 * This seeds the Vercel production database with admin users
 */

console.log('🌱 Seeding Production Database...\n');

// You need to run this locally with the same DATABASE_URL as production
async function seedProduction() {
  try {
    const { execSync } = require('child_process');
    
    console.log('🔧 Checking if DATABASE_URL matches production...');
    
    // Run the seeding scripts
    console.log('📊 Seeding basic data...');
    execSync('npx tsx scripts/seed.ts', { stdio: 'inherit' });
    
    console.log('👥 Seeding user management...');
    execSync('npx tsx scripts/seed-user-management.ts', { stdio: 'inherit' });
    
    console.log('👑 Creating super admin...');
    execSync('npx tsx scripts/create-super-admin.ts', { stdio: 'inherit' });
    
    console.log('\n🎉 Production database seeded successfully!');
    console.log('\n🔑 Login credentials for production:');
    console.log('Super Admin: superadmin@quadco.com / SuperAdmin2025!');
    console.log('Admin: admin@quadco.com / admin123');
    
    console.log('\n🌐 Production app: https://quadco-it317bpig-moha0886s-projects.vercel.app/');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    console.log('\n💡 Make sure your local DATABASE_URL points to the same database as production');
  }
}

// Check if DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.log('❌ DATABASE_URL not found in local environment');
  console.log('\n📋 To seed production database:');
  console.log('1. Make sure your .env file has the same DATABASE_URL as Vercel');
  console.log('2. Run: npm run db:setup');
  console.log('\nOr manually:');
  console.log('1. npx tsx scripts/seed.ts');
  console.log('2. npx tsx scripts/seed-user-management.ts'); 
  console.log('3. npx tsx scripts/create-super-admin.ts');
} else if (process.env.DATABASE_URL.includes('aivencloud.com')) {
  console.log('✅ Detected production database URL');
  seedProduction();
} else {
  console.log('⚠️  DATABASE_URL does not appear to be the production database');
  console.log('Current:', process.env.DATABASE_URL);
  console.log('\nExpected to contain: aivencloud.com');
}
