#!/usr/bin/env node

// Login Diagnostic Script
const https = require('https');

const appUrl = 'https://quadco-app-production.up.railway.app';

console.log('🔍 LOGIN DIAGNOSTIC TOOL');
console.log('========================');
console.log('');

async function testLogin() {
  console.log('1️⃣ Testing admin login with detailed error...');
  
  const postData = JSON.stringify({
    email: 'admin@quadco.com',
    password: 'admin123'
  });
  
  const options = {
    hostname: 'quadco-app-production.up.railway.app',
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': postData.length
    }
  };
  
  const req = https.request(options, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log(`📊 Status Code: ${res.statusCode}`);
      
      if (res.statusCode === 200) {
        console.log('✅ LOGIN SUCCESS!');
        try {
          const result = JSON.parse(data);
          console.log(`👤 User: ${result.user?.firstName} ${result.user?.lastName}`);
          console.log(`🔐 Role: ${result.user?.role?.name}`);
          console.log('🎉 Your app is fully functional!');
        } catch (e) {
          console.log('📄 Response:', data);
        }
      } else if (res.statusCode === 401) {
        console.log('❌ LOGIN FAILED: Invalid credentials');
        console.log('🔍 This means either:');
        console.log('   • Admin user doesn\'t exist');
        console.log('   • Wrong password');
        console.log('   • Database tables exist but no admin user');
      } else if (res.statusCode === 500) {
        console.log('❌ LOGIN FAILED: Server error');
        console.log('🔍 This usually means:');
        console.log('   • Database tables don\'t exist');
        console.log('   • Database connection issue');
        console.log('   • Prisma client not generated');
        
        try {
          const error = JSON.parse(data);
          console.log('📄 Error response:', error);
        } catch (e) {
          console.log('📄 Raw response:', data);
        }
      }
      
      console.log('');
      console.log('🛠️  SOLUTION:');
      console.log('   Go to Railway Dashboard: https://railway.app');
      console.log('   Open your project > Main service > Terminal');
      console.log('');
      console.log('   Run these commands ONE BY ONE:');
      console.log('   ┌─────────────────────────────────────┐');
      console.log('   │ npx prisma generate                 │');
      console.log('   │ npx prisma db push                  │');
      console.log('   │ npm run seed                        │');
      console.log('   │ npx tsx scripts/create-super-admin.ts│');
      console.log('   └─────────────────────────────────────┘');
      console.log('');
      console.log('   Then try login again with:');
      console.log('   📧 Email: admin@quadco.com');
      console.log('   🔑 Password: admin123');
    });
  });
  
  req.on('error', (error) => {
    console.log('❌ Connection error:', error.message);
  });
  
  req.write(postData);
  req.end();
}

// Also test basic connectivity
console.log('0️⃣ Testing basic API connectivity...');
https.get(`${appUrl}/api/test`, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    if (res.statusCode === 200) {
      console.log('✅ API is working correctly');
      const result = JSON.parse(data);
      console.log(`📊 Environment: ${result.environment}`);
      console.log('');
      testLogin();
    } else {
      console.log('❌ API not responding correctly');
      console.log(`Status: ${res.statusCode}`);
    }
  });
}).on('error', (err) => {
  console.log('❌ API connection failed:', err.message);
});
