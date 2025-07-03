#!/usr/bin/env node

// Debug script to test login issues
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔍 Railway Login Troubleshooting Tool');
console.log('=====================================');
console.log('');

rl.question('What is your Railway app URL? (e.g., https://your-app.railway.app): ', async (url) => {
  console.log('');
  console.log('🧪 Testing your Railway deployment...');
  
  try {
    const fetch = (await import('node-fetch')).default;
    
    // Test 1: Basic connectivity
    console.log('1️⃣ Testing basic connectivity...');
    try {
      const response = await fetch(`${url}/api/test`);
      console.log(`   Status: ${response.status}`);
      if (response.ok) {
        const data = await response.json();
        console.log('   ✅ API is responding correctly');
        console.log(`   Response: ${JSON.stringify(data, null, 2)}`);
      } else {
        console.log('   ❌ API is not responding correctly');
        const text = await response.text();
        console.log(`   Response: ${text.substring(0, 200)}...`);
      }
    } catch (error) {
      console.log(`   ❌ Connection failed: ${error.message}`);
    }

    console.log('');
    
    // Test 2: Login endpoint
    console.log('2️⃣ Testing login endpoint...');
    try {
      const response = await fetch(`${url}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'admin@quadco.com',
          password: 'admin123'
        })
      });
      
      console.log(`   Status: ${response.status}`);
      const text = await response.text();
      
      if (response.status === 200) {
        console.log('   ✅ Login successful!');
        try {
          const data = JSON.parse(text);
          console.log(`   User: ${data.user?.firstName} ${data.user?.lastName}`);
          console.log(`   Role: ${data.user?.role?.name}`);
        } catch (e) {
          console.log(`   Response: ${text}`);
        }
      } else {
        console.log('   ❌ Login failed');
        console.log(`   Response: ${text.substring(0, 500)}`);
      }
    } catch (error) {
      console.log(`   ❌ Login test failed: ${error.message}`);
    }

    console.log('');
    console.log('📋 Next Steps:');
    
    if (url.includes('railway.app')) {
      console.log('1. Make sure your DATABASE_URL is set in Railway dashboard');
      console.log('2. Run database setup commands in Railway terminal:');
      console.log('   npx prisma generate');
      console.log('   npx prisma db push');
      console.log('   npm run seed');
      console.log('   npx tsx scripts/create-super-admin.ts');
      console.log('');
      console.log('3. Default admin credentials:');
      console.log('   Email: admin@quadco.com');
      console.log('   Password: admin123');
    } else {
      console.log('⚠️  This doesn\'t look like a Railway URL. Make sure you\'re using the correct URL.');
    }
    
  } catch (error) {
    console.log(`❌ Error running tests: ${error.message}`);
  }
  
  rl.close();
});

console.log('This tool will help diagnose login issues with your Railway deployment.');
console.log('');
