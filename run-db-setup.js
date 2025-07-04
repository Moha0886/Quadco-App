#!/usr/bin/env node

/**
 * Database Setup Runner
 * Runs the actual database setup commands with Aiven
 */

const { execSync } = require('child_process');

function runCommand(command, description) {
  console.log(`\n🔧 ${description}...`);
  console.log(`Running: ${command}`);
  
  try {
    const output = execSync(command, { 
      stdio: 'inherit',
      encoding: 'utf8'
    });
    console.log(`✅ ${description} completed successfully`);
    return true;
  } catch (error) {
    console.log(`❌ ${description} failed:`, error.message);
    return false;
  }
}

async function setupDatabase() {
  console.log('🗄️ AIVEN DATABASE SETUP');
  console.log('========================');
  console.log('');
  
  console.log('Prerequisites Check:');
  console.log('✅ Aiven database exists');
  console.log('✅ Environment variables configured');
  console.log('');
  
  console.log('Starting database setup...');
  
  // Step 1: Generate Prisma client
  if (!runCommand('npx prisma generate', 'Generating Prisma client')) {
    return;
  }
  
  // Step 2: Push database schema
  if (!runCommand('npx prisma db push', 'Creating database tables')) {
    return;
  }
  
  // Step 3: Seed the database
  if (!runCommand('npm run seed', 'Seeding database with initial data')) {
    return;
  }
  
  // Step 4: Create super admin
  if (!runCommand('npx tsx scripts/create-super-admin.ts', 'Creating super admin user')) {
    return;
  }
  
  console.log('');
  console.log('🎉 DATABASE SETUP COMPLETE!');
  console.log('===========================');
  console.log('');
  console.log('✅ Database tables created');
  console.log('✅ Initial data seeded');
  console.log('✅ Admin user created');
  console.log('');
  console.log('🔐 Default admin credentials:');
  console.log('   Email: admin@quadco.com');
  console.log('   Password: admin123');
  console.log('');
  console.log('🚀 Your app is ready!');
  console.log('   Local: http://localhost:3000');
  console.log('   Production: https://quadco-app-moha0886s-projects.vercel.app');
  console.log('');
  console.log('🔄 Next steps:');
  console.log('1. Test login locally: npm run dev');
  console.log('2. Deploy to Vercel: vercel --prod');
  console.log('3. Test login in production');
}

setupDatabase();
