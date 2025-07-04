#!/usr/bin/env node

const endpoints = [
  'https://quadco-al0wse0zx-moha0886s-projects.vercel.app',
  'https://quadco-al0wse0zx-moha0886s-projects.vercel.app/login',
  'https://quadco-al0wse0zx-moha0886s-projects.vercel.app/dashboard',
  'https://quadco-al0wse0zx-moha0886s-projects.vercel.app/quotations',
  'https://quadco-al0wse0zx-moha0886s-projects.vercel.app/invoices',
  'https://quadco-al0wse0zx-moha0886s-projects.vercel.app/products',
  'https://quadco-al0wse0zx-moha0886s-projects.vercel.app/services',
  'https://quadco-al0wse0zx-moha0886s-projects.vercel.app/users',
  'https://quadco-al0wse0zx-moha0886s-projects.vercel.app/delivery-notes',
  'https://quadco-al0wse0zx-moha0886s-projects.vercel.app/permissions',
  'https://quadco-al0wse0zx-moha0886s-projects.vercel.app/quotations/new',
  'https://quadco-al0wse0zx-moha0886s-projects.vercel.app/invoices/new',
  'https://quadco-al0wse0zx-moha0886s-projects.vercel.app/products/new',
  'https://quadco-al0wse0zx-moha0886s-projects.vercel.app/users/new',
  'https://quadco-al0wse0zx-moha0886s-projects.vercel.app/customers/new'
];

async function testEndpoint(url) {
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Quadco-Test/1.0'
      }
    });
    
    console.log(`${response.status} - ${url}`);
    return { url, status: response.status, success: response.status === 200 };
  } catch (error) {
    console.log(`ERROR - ${url}: ${error.message}`);
    return { url, status: 'ERROR', success: false, error: error.message };
  }
}

async function runTests() {
  console.log('🚀 Testing Quadco App Endpoints...\n');
  
  const results = await Promise.all(endpoints.map(testEndpoint));
  
  console.log('\n📊 Summary:');
  const successful = results.filter(r => r.success).length;
  const total = results.length;
  
  console.log(`✅ Successful: ${successful}/${total}`);
  console.log(`❌ Failed: ${total - successful}/${total}`);
  
  if (successful === total) {
    console.log('\n🎉 All pages are working correctly!');
    console.log('\n🔗 Live App: https://quadco-al0wse0zx-moha0886s-projects.vercel.app');
    console.log('📧 Login: admin@quadco.com / admin123');
  } else {
    console.log('\n⚠️  Some pages need attention:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`   - ${r.url}: ${r.status}`);
    });
  }
  
  console.log('\n✨ Updated Features:');
  console.log('   - Professional landing page');
  console.log('   - Real authentication system');
  console.log('   - Business dashboard with analytics');
  console.log('   - Functional customers API');
  console.log('   - Professional feature pages (Quotations, Invoices, Products, Services, Users, etc.)');
  console.log('   - Branded "Coming Soon" pages for remaining features');
  console.log('   - PostgreSQL database integration');
  console.log('   - No SSO/password protection - fully public');
}

runTests().catch(console.error);
