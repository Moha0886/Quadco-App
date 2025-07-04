#!/usr/bin/env node

/**
 * Vercel Deployment Validation Script
 * Tests the new Vercel deployment
 */

const https = require('https');
const http = require('http');
const url = require('url');

// Update this with your actual Vercel URL once deployed
const appUrl = 'https://quadco-app-moha0886s-projects.vercel.app';

console.log('🚀 VERCEL DEPLOYMENT VALIDATION');
console.log('================================');
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
        if (response.text) {
          console.log(`   Response preview: ${response.text.substring(0, 200)}...`);
        }
        results.failed++;
        results.issues.push('API connectivity failed');
      }
    } catch (error) {
      console.log(`   ❌ Connection failed: ${error.message}`);
      results.failed++;
      results.issues.push(`Connection error: ${error.message}`);
    }

    // Test 2: Frontend accessibility
    console.log('');
    console.log('2️⃣ Testing frontend accessibility...');
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

    // Test 3: Check if we can access login page
    console.log('');
    console.log('3️⃣ Testing login page...');
    try {
      const response = await makeRequest('/login');
      if (response.status === 200) {
        console.log('   ✅ Login page accessible');
        results.passed++;
      } else {
        console.log(`   ❌ Login page not accessible (Status: ${response.status})`);
        results.failed++;
        results.issues.push('Login page not accessible');
      }
    } catch (error) {
      console.log(`   ❌ Login page test failed: ${error.message}`);
      results.failed++;
      results.issues.push(`Login page test error: ${error.message}`);
    }

    // Summary
    console.log('');
    console.log('📊 VERCEL DEPLOYMENT SUMMARY');
    console.log('============================');
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
      console.log('   1. Check Vercel deployment logs');
      console.log('   2. Verify environment variables are set');
      console.log('   3. Check if build completed successfully');
      console.log('');
      console.log('   🔗 Vercel Dashboard: https://vercel.com/dashboard');
      console.log('   📋 Environment variables needed:');
      console.log('      - DATABASE_URL');
      console.log('      - NEXTAUTH_SECRET');
      console.log('      - NEXTAUTH_URL');
      
    } else {
      console.log('');
      console.log('🎉 VERCEL DEPLOYMENT SUCCESSFUL!');
      console.log('');
      console.log('🔗 Your app is live at:');
      console.log(`   ${appUrl}`);
      console.log('');
      console.log('🔐 Next steps:');
      console.log('   1. Set up database (if not done)');
      console.log('   2. Test login functionality');
      console.log('   3. Verify all features work');
    }
    
  } catch (error) {
    console.error('❌ Validation script failed:', error);
  }
}

runTests();
