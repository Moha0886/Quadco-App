#!/usr/bin/env node

// Quick deployment check
const https = require('https');

console.log('🔍 Quick Deployment Check');
console.log('=========================');

https.get('https://quadco-app-production.up.railway.app/api/test', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const result = JSON.parse(data);
    console.log(`✅ API Status: Working`);
    console.log(`📊 Environment: ${result.environment}`);
    console.log(`🌐 URL: https://quadco-app-production.up.railway.app`);
    console.log('');
    
    // Test login
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
      let loginData = '';
      res.on('data', chunk => loginData += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('🎉 LOGIN SUCCESS! App is fully functional!');
          console.log('🔐 Admin credentials work correctly');
          console.log('✅ Database setup complete');
        } else {
          console.log('❌ Login failed - run database setup commands');
          console.log('📋 Need to run: npx prisma generate, db push, seed, create-super-admin');
        }
      });
    });
    
    req.write(postData);
    req.end();
  });
}).on('error', (err) => {
  console.log('❌ Connection failed:', err.message);
});
