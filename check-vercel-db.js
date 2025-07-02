#!/usr/bin/env node

/**
 * Check if Vercel DATABASE_URL is configured
 */

console.log('🔍 Checking Vercel Database Configuration...\n');

const API_BASE = 'https://quadco-it317bpig-moha0886s-projects.vercel.app';

async function checkDatabaseConnection() {
  try {
    console.log('Testing basic API connection...');
    
    // Test a simple endpoint that doesn't require auth
    const response = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@test.com',
        password: 'wrongpassword'
      })
    });

    const responseText = await response.text();
    
    if (response.status === 401) {
      console.log('✅ Database connection working - Got authentication error (expected)');
      console.log('🎉 DATABASE_URL is properly configured in Vercel!');
      console.log('\n🔑 Now you can login with:');
      console.log('   Super Admin: superadmin@quadco.com / SuperAdmin2025!');
      console.log('   Admin: admin@quadco.com / admin123');
      console.log('\n🌐 App URL: ' + API_BASE);
    } else if (response.status === 500) {
      console.log('❌ Database connection failed');
      console.log('💡 You need to add DATABASE_URL to Vercel environment variables');
      console.log('\n🔧 Steps:');
      console.log('1. Go to https://vercel.com/dashboard');
      console.log('2. Select quadco-app project');
      console.log('3. Settings → Environment Variables');
      console.log('4. Add DATABASE_URL with your PostgreSQL connection string');
    } else if (responseText.includes('Forbidden')) {
      console.log('❌ Getting "Forbidden" error');
      console.log('💡 This means DATABASE_URL is not configured in Vercel');
      console.log('\n📋 Action Required:');
      console.log('Add DATABASE_URL environment variable to Vercel');
    } else {
      console.log(`⚠️  Unexpected response: ${response.status}`);
      console.log('Response:', responseText);
    }

  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
  }
}

checkDatabaseConnection();
