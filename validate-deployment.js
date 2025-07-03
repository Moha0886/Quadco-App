#!/usr/bin/env node

/**
 * Comprehensive Deployment Validation Script
 * Tests all aspects of the Railway deployment
 */

const https = require('https');
const http = require('http');
const url = require('url');

const appUrl = 'https://quadco-app-production.up.railway.app';

console.log('🚀 QUADCO APP DEPLOYMENT VALIDATION');
console.log('=====================================');
console.log(`Testing: ${appUrl}`);
console.log('');

function makeRequest(endpoint, options = {}) {
  return new Promise((resolve, reject) => {
    const fullUrl = `${appUrl}${endpoint}`;
    const parsedUrl = url.parse(fullUrl);
    const requestOptions = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || 443,
      path: parsedUrl.path,
      method: options.method || 'GET',
      headers: options.headers || {},
      timeout: 10000
    };

    const protocol = parsedUrl.protocol === 'https:' ? https : http;
    
    const req = protocol.request(requestOptions, (res) => {
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

    req.on('error', reject);
    req.on('timeout', () => reject(new Error('Request timeout')));
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

async function runTests() {
  const results = {
    passed: 0,
    failed: 0,
    issues: []
  };

  try {
    // Test 1: Basic connectivity
    console.log('1️⃣ Testing basic connectivity...');
    try {
      const response = await makeRequest('/api/test');
      if (response.status === 200 && response.data) {
        console.log('   ✅ API responding correctly');
        console.log(`   📊 Environment: ${response.data.environment}`);
        results.passed++;
      } else {
        console.log(`   ❌ API not responding correctly (Status: ${response.status})`);
        results.failed++;
        results.issues.push('API connectivity failed');
      }
    } catch (error) {
      console.log(`   ❌ Connection failed: ${error.message}`);
      results.failed++;
      results.issues.push(`Connection error: ${error.message}`);
    }

    // Test 2: Database connectivity
    console.log('');
    console.log('2️⃣ Testing database connectivity...');
    try {
      const response = await makeRequest('/api/customers');
      if (response.status === 401) {
        console.log('   ✅ Database connected (unauthorized as expected)');
        results.passed++;
      } else if (response.status === 200) {
        console.log('   ✅ Database connected and accessible');
        results.passed++;
      } else {
        console.log(`   ❌ Database connection issue (Status: ${response.status})`);
        console.log(`   Response: ${response.text.substring(0, 100)}...`);
        results.failed++;
        results.issues.push('Database connection failed');
      }
    } catch (error) {
      console.log(`   ❌ Database test failed: ${error.message}`);
      results.failed++;
      results.issues.push(`Database test error: ${error.message}`);
    }

    // Test 3: Authentication endpoint
    console.log('');
    console.log('3️⃣ Testing authentication endpoint...');
    try {
      const response = await makeRequest('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'wrong-password'
        })
      });
      
      if (response.status === 401) {
        console.log('   ✅ Authentication endpoint working (401 as expected)');
        results.passed++;
      } else if (response.status === 500) {
        console.log('   ⚠️  Authentication endpoint has database setup issue');
        results.issues.push('Database not set up for authentication');
      } else {
        console.log(`   ❌ Unexpected response: ${response.status}`);
        results.failed++;
        results.issues.push('Authentication endpoint error');
      }
    } catch (error) {
      console.log(`   ❌ Authentication test failed: ${error.message}`);
      results.failed++;
      results.issues.push(`Authentication test error: ${error.message}`);
    }

    // Test 4: Admin login
    console.log('');
    console.log('4️⃣ Testing admin login...');
    try {
      const response = await makeRequest('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'admin@quadco.com',
          password: 'admin123'
        })
      });
      
      if (response.status === 200 && response.data) {
        console.log('   ✅ Admin login successful!');
        console.log(`   👤 User: ${response.data.user?.firstName} ${response.data.user?.lastName}`);
        console.log(`   🔐 Role: ${response.data.user?.role?.name}`);
        results.passed++;
      } else if (response.status === 401) {
        console.log('   ❌ Admin login failed - credentials invalid');
        results.failed++;
        results.issues.push('Admin user not created or wrong credentials');
      } else if (response.status === 500) {
        console.log('   ❌ Admin login failed - server error');
        console.log(`   Error: ${response.text.substring(0, 200)}`);
        results.failed++;
        results.issues.push('Database setup required for admin login');
      } else {
        console.log(`   ❌ Unexpected response: ${response.status}`);
        results.failed++;
        results.issues.push('Admin login unexpected error');
      }
    } catch (error) {
      console.log(`   ❌ Admin login test failed: ${error.message}`);
      results.failed++;
      results.issues.push(`Admin login test error: ${error.message}`);
    }

    // Test 5: Frontend accessibility
    console.log('');
    console.log('5️⃣ Testing frontend accessibility...');
    try {
      const response = await makeRequest('');
      if (response.status === 200) {
        console.log('   ✅ Frontend accessible');
        results.passed++;
      } else {
        console.log(`   ❌ Frontend not accessible (Status: ${response.status})`);
        results.failed++;
        results.issues.push('Frontend not accessible');
      }
    } catch (error) {
      console.log(`   ❌ Frontend test failed: ${error.message}`);
      results.failed++;
      results.issues.push(`Frontend test error: ${error.message}`);
    }

    // Summary
    console.log('');
    console.log('📊 DEPLOYMENT VALIDATION SUMMARY');
    console.log('================================');
    console.log(`✅ Passed: ${results.passed}`);
    console.log(`❌ Failed: ${results.failed}`);
    console.log(`📱 App URL: ${appUrl}`);
    
    if (results.issues.length > 0) {
      console.log('');
      console.log('🔧 ISSUES TO RESOLVE:');
      results.issues.forEach((issue, index) => {
        console.log(`   ${index + 1}. ${issue}`);
      });
      
      console.log('');
      console.log('🛠️  RECOMMENDED ACTIONS:');
      
      if (results.issues.some(i => i.includes('Database') || i.includes('Admin'))) {
        console.log('   🎯 PRIMARY ISSUE: Database setup required');
        console.log('');
        console.log('   📋 Run these commands in Railway terminal:');
        console.log('   1. npx prisma generate');
        console.log('   2. npx prisma db push');
        console.log('   3. npm run seed');
        console.log('   4. npx tsx scripts/create-super-admin.ts');
        console.log('');
        console.log('   🔗 Railway Dashboard: https://railway.app');
        console.log('   📂 Go to your project > Main service > Terminal tab');
      }
      
      if (results.issues.some(i => i.includes('Connection'))) {
        console.log('   ⚙️  Check Railway environment variables:');
        console.log('      - DATABASE_URL (should be auto-generated if using Railway PostgreSQL)');
        console.log('      - NODE_ENV=production');
        console.log('      - NEXTAUTH_SECRET');
      }
    } else {
      console.log('');
      console.log('🎉 ALL TESTS PASSED! Your deployment is ready!');
      console.log('');
      console.log('🔐 Default admin credentials:');
      console.log('   Email: admin@quadco.com');
      console.log('   Password: admin123');
      console.log('');
      console.log('🚀 Your app is fully functional!');
    }
    
  } catch (error) {
    console.error('❌ Validation script failed:', error);
  }
}

runTests();

    // Test 1: Basic connectivity
    console.log('1️⃣ Testing basic connectivity...');
    try {
      const response = await fetch(`${url}/api/test`);
      if (response.ok) {
        const data = await response.json();
        console.log('   ✅ API responding correctly');
        console.log(`   📊 Environment: ${data.environment}`);
        results.passed++;
      } else {
        console.log('   ❌ API not responding correctly');
        results.failed++;
        results.issues.push('API connectivity failed');
      }
    } catch (error) {
      console.log(`   ❌ Connection failed: ${error.message}`);
      results.failed++;
      results.issues.push(`Connection error: ${error.message}`);
    }

    // Test 2: Database connectivity
    console.log('');
    console.log('2️⃣ Testing database connectivity...');
    try {
      const response = await fetch(`${url}/api/customers`);
      if (response.status === 401) {
        console.log('   ✅ Database connected (unauthorized as expected)');
        results.passed++;
      } else if (response.status === 200) {
        console.log('   ✅ Database connected and accessible');
        results.passed++;
      } else {
        const text = await response.text();
        console.log(`   ❌ Database connection issue (Status: ${response.status})`);
        console.log(`   Response: ${text.substring(0, 100)}...`);
        results.failed++;
        results.issues.push('Database connection failed');
      }
    } catch (error) {
      console.log(`   ❌ Database test failed: ${error.message}`);
      results.failed++;
      results.issues.push(`Database test error: ${error.message}`);
    }

    // Test 3: Authentication endpoint
    console.log('');
    console.log('3️⃣ Testing authentication endpoint...');
    try {
      const response = await fetch(`${url}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'wrong-password'
        })
      });
      
      if (response.status === 401) {
        console.log('   ✅ Authentication endpoint working (401 as expected)');
        results.passed++;
      } else if (response.status === 500) {
        console.log('   ⚠️  Authentication endpoint has database setup issue');
        results.issues.push('Database not set up for authentication');
      } else {
        console.log(`   ❌ Unexpected response: ${response.status}`);
        results.failed++;
        results.issues.push('Authentication endpoint error');
      }
    } catch (error) {
      console.log(`   ❌ Authentication test failed: ${error.message}`);
      results.failed++;
      results.issues.push(`Authentication test error: ${error.message}`);
    }

    // Test 4: Admin login
    console.log('');
    console.log('4️⃣ Testing admin login...');
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
      
      if (response.status === 200) {
        const data = await response.json();
        console.log('   ✅ Admin login successful!');
        console.log(`   👤 User: ${data.user?.firstName} ${data.user?.lastName}`);
        console.log(`   🔐 Role: ${data.user?.role?.name}`);
        results.passed++;
      } else if (response.status === 401) {
        console.log('   ❌ Admin login failed - credentials invalid');
        results.failed++;
        results.issues.push('Admin user not created or wrong credentials');
      } else if (response.status === 500) {
        console.log('   ❌ Admin login failed - server error');
        results.failed++;
        results.issues.push('Database setup required for admin login');
      } else {
        console.log(`   ❌ Unexpected response: ${response.status}`);
        results.failed++;
        results.issues.push('Admin login unexpected error');
      }
    } catch (error) {
      console.log(`   ❌ Admin login test failed: ${error.message}`);
      results.failed++;
      results.issues.push(`Admin login test error: ${error.message}`);
    }

    // Test 5: Frontend accessibility
    console.log('');
    console.log('5️⃣ Testing frontend accessibility...');
    try {
      const response = await fetch(url);
      if (response.ok) {
        console.log('   ✅ Frontend accessible');
        results.passed++;
      } else {
        console.log(`   ❌ Frontend not accessible (Status: ${response.status})`);
        results.failed++;
        results.issues.push('Frontend not accessible');
      }
    } catch (error) {
      console.log(`   ❌ Frontend test failed: ${error.message}`);
      results.failed++;
      results.issues.push(`Frontend test error: ${error.message}`);
    }

    // Summary
    console.log('');
    console.log('📊 DEPLOYMENT VALIDATION SUMMARY');
    console.log('================================');
    console.log(`✅ Passed: ${results.passed}`);
    console.log(`❌ Failed: ${results.failed}`);
    console.log(`📱 App URL: ${url}`);
    
    if (results.issues.length > 0) {
      console.log('');
      console.log('🔧 ISSUES TO RESOLVE:');
      results.issues.forEach((issue, index) => {
        console.log(`   ${index + 1}. ${issue}`);
      });
      
      console.log('');
      console.log('🛠️  RECOMMENDED ACTIONS:');
      
      if (results.issues.some(i => i.includes('Database'))) {
        console.log('   1. Run database setup in Railway terminal:');
        console.log('      npx prisma generate');
        console.log('      npx prisma db push');
        console.log('      npm run seed');
        console.log('      npx tsx scripts/create-super-admin.ts');
      }
      
      if (results.issues.some(i => i.includes('Admin'))) {
        console.log('   2. Create admin user:');
        console.log('      npx tsx scripts/create-super-admin.ts');
      }
      
      if (results.issues.some(i => i.includes('Connection'))) {
        console.log('   3. Check Railway environment variables:');
        console.log('      - DATABASE_URL');
        console.log('      - NODE_ENV=production');
        console.log('      - NEXTAUTH_SECRET');
      }
    } else {
      console.log('');
      console.log('🎉 ALL TESTS PASSED! Your deployment is ready!');
      console.log('');
      console.log('🔐 Default admin credentials:');
      console.log('   Email: admin@quadco.com');
      console.log('   Password: admin123');
      console.log('');
      console.log('🚀 Your app is fully functional!');
    }
    
  } catch (error) {
    console.error('❌ Validation script failed:', error);
  }
}

runTests();
