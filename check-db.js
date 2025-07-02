#!/usr/bin/env node

/**
 * Database Configuration Checker
 * Validates database connection and provides setup guidance
 */

const { PrismaClient } = require('@prisma/client');

async function checkDatabase() {
  console.log('🔍 Checking database configuration...\n');

  // Check if DATABASE_URL is set
  if (!process.env.DATABASE_URL) {
    console.log('❌ DATABASE_URL environment variable is not set');
    console.log('\n📋 Setup Instructions:');
    console.log('1. Create a free PostgreSQL database at https://neon.tech');
    console.log('2. Copy the connection string');
    console.log('3. Add it to your .env file:');
    console.log('   DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"');
    console.log('4. Run: npm run db:setup');
    process.exit(1);
  }

  console.log('✅ DATABASE_URL is set');
  
  // Test database connection
  const prisma = new PrismaClient();
  
  try {
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // Check if database is seeded
    const userCount = await prisma.user?.count() || 0;
    const customerCount = await prisma.customer?.count() || 0;
    
    console.log(`📊 Database status:`);
    console.log(`   Users: ${userCount}`);
    console.log(`   Customers: ${customerCount}`);
    
    if (userCount === 0) {
      console.log('\n⚠️  Database is empty. Run: npm run seed');
    } else {
      console.log('\n🎉 Database is ready!');
      console.log('\n🔑 Login with:');
      console.log('   Email: superadmin@quadco.com');
      console.log('   Password: SuperAdmin2025!');
    }
    
  } catch (error) {
    console.log('❌ Database connection failed:', error.message);
    console.log('\n💡 Common fixes:');
    console.log('   - Verify your DATABASE_URL is correct');
    console.log('   - Ensure the database exists');
    console.log('   - Check network connectivity');
    console.log('   - Run: npx prisma db push');
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase().catch(console.error);
