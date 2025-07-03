#!/usr/bin/env node

/**
 * Comprehensive Deployment Validation Script
 * Tests all aspects of the Railway deployment
 */

const https = require('https');

const appUrl = 'https://quadco-app-production.up.railway.app';

console.log('🚀 QUADCO APP DEPLOYMENT VALIDATION');
console.log('=====================================');
console.log(`Testing: ${appUrl}`);
console.log('');

function testEndpoint(path, options = {}) {
  return new Promise((resolve) => {
    const fullUrl = `${appUrl}${path}`;
    const postData = options.body || '';
    
    const reqOptions = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      timeout: 10000
    };

    const req = https.request(fullUrl, reqOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData, text: data });
        } catch (e) {
          resolve({ status: res.statusCode, text: data, data: null });
        }
      });
    });

    req.on('error', (error) => {
      resolve({ status: 0, error: error.message });
    });

    if (postData) {
      req.write(postData);
    }
    
    req.end();
  });
}

async function runValidation() {
  const results = { passed: 0, failed: 0, issues: [] };

  // Test 1: Basic API
  console.log('1️⃣ Testing basic API connectivity...');
  const test1 = await testEndpoint('/api/test');
  if (test1.status === 200 && test1.data) {
    console.log('   ✅ API responding correctly');
    console.log(`   📊 Environment: ${test1.data.environment}`);
    results.passed++;
  } else {
    console.log(`   ❌ API failed (Status: ${test1.status})`);
    results.failed++;
    results.issues.push('API connectivity failed');
  }

  // Test 2: Database
  console.log('');
  console.log('2️⃣ Testing database connectivity...');
  const test2 = await testEndpoint('/api/customers');
  if (test2.status === 401) {
    console.log('   ✅ Database connected (unauthorized as expected)');
    results.passed++;
  } else if (test2.status === 500) {
    console.log('   ❌ Database setup required');
    results.failed++;
    results.issues.push('Database not set up');
  } else {
    console.log(`   ❌ Unexpected response: ${test2.status}`);
    results.failed++;
    results.issues.push('Database connection issue');
  }

  // Test 3: Admin Login
  console.log('');
  console.log('3️⃣ Testing admin login...');
  const test3 = await testEndpoint('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'admin@quadco.com',
      password: 'admin123'
    })
  });

  if (test3.status === 200 && test3.data) {
    console.log('   ✅ Admin login successful!');
    console.log(`   👤 User: ${test3.data.user?.firstName} ${test3.data.user?.lastName}`);
    results.passed++;
  } else if (test3.status === 401) {
    console.log('   ❌ Admin login failed - user not found');
    results.failed++;
    results.issues.push('Admin user not created');
  } else if (test3.status === 500) {
    console.log('   ❌ Admin login failed - server error');
    results.failed++;
    results.issues.push('Database setup required');
  } else {
    console.log(`   ❌ Unexpected response: ${test3.status}`);
    results.failed++;
    results.issues.push('Admin login error');
  }

  // Test 4: Frontend
  console.log('');
  console.log('4️⃣ Testing frontend...');
  const test4 = await testEndpoint('');
  if (test4.status === 200) {
    console.log('   ✅ Frontend accessible');
    results.passed++;
  } else {
    console.log(`   ❌ Frontend failed (Status: ${test4.status})`);
    results.failed++;
    results.issues.push('Frontend not accessible');
  }

  // Summary
  console.log('');
  console.log('📊 DEPLOYMENT VALIDATION SUMMARY');
  console.log('================================');
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  
  if (results.issues.length > 0) {
    console.log('');
    console.log('🔧 ISSUES TO RESOLVE:');
    results.issues.forEach((issue, index) => {
      console.log(`   ${index + 1}. ${issue}`);
    });
    
    console.log('');
    console.log('🛠️  REQUIRED ACTIONS:');
    console.log('   Go to Railway Dashboard: https://railway.app');
    console.log('   Navigate to: quadco-app-production > Main Service > Terminal');
    console.log('');
    console.log('   Run these commands:');
    console.log('   1️⃣ npx prisma generate');
    console.log('   2️⃣ npx prisma db push');
    console.log('   3️⃣ npm run seed');
    console.log('   4️⃣ npx tsx scripts/create-super-admin.ts');
    console.log('');
    console.log('   Then test login with: admin@quadco.com / admin123');
  } else {
    console.log('');
    console.log('🎉 ALL TESTS PASSED! Deployment is ready!');
    console.log('🔐 Login: admin@quadco.com / admin123');
    console.log(`🌐 App: ${appUrl}`);
  }
}

runValidation().catch(console.error);
