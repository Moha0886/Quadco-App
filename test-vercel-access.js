#!/usr/bin/env node

/**
 * Quick Vercel Access Test
 * Tests if Vercel SSO is disabled
 */

const https = require('https');

async function testAccess() {
  console.log('🔍 TESTING VERCEL ACCESS');
  console.log('========================');
  
  const url = 'https://quadco-app-moha0886s-projects.vercel.app';
  console.log(`Testing: ${url}`);
  
  return new Promise((resolve) => {
    const req = https.get(url, (res) => {
      console.log(`Status: ${res.statusCode}`);
      
      if (res.statusCode === 200) {
        console.log('✅ SUCCESS! App is accessible');
        console.log('🎉 Vercel SSO has been disabled');
        console.log('🔗 Your app is now live and accessible!');
      } else if (res.statusCode === 401) {
        console.log('❌ STILL BLOCKED: Vercel SSO is active');
        console.log('📋 Next steps:');
        console.log('   1. Check Vercel Dashboard settings');
        console.log('   2. Disable password protection');
        console.log('   3. Wait 2-3 minutes and test again');
      } else {
        console.log(`⚠️  Unexpected status: ${res.statusCode}`);
      }
      
      resolve();
    });
    
    req.on('error', (error) => {
      console.log('❌ Connection error:', error.message);
      resolve();
    });
    
    req.setTimeout(10000, () => {
      console.log('❌ Request timeout');
      resolve();
    });
  });
}

testAccess();
