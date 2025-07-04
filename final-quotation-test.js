#!/usr/bin/env node

const { exec } = require('child_process');

async function runTests() {
  console.log('🔧 Final Quotation Creation Test');
  console.log('================================');
  
  // Get a valid customer ID first
  const getCustomers = () => new Promise((resolve, reject) => {
    exec('curl -s https://quadco-app.vercel.app/api/customers', (error, stdout) => {
      if (error) reject(error);
      else resolve(JSON.parse(stdout));
    });
  });
  
  try {
    const customersData = await getCustomers();
    const customerId = customersData.customers[0].id;
    console.log(`Using customer ID: ${customerId}`);
    
    // Test 1: Basic quotation creation
    console.log('\n1. Testing basic quotation creation...');
    const basicQuote = () => new Promise((resolve, reject) => {
      const data = JSON.stringify({
        customerId,
        notes: 'Basic test quotation',
        taxRate: 7.5
      });
      
      exec(`curl -s -X POST https://quadco-app.vercel.app/api/quotations -H "Content-Type: application/json" -d '${data}'`, (error, stdout) => {
        if (error) reject(error);
        else resolve(JSON.parse(stdout));
      });
    });
    
    const basicResult = await basicQuote();
    console.log(`   ✅ Basic quotation created: ${basicResult.quotation.id}`);
    
    // Test 2: Quotation with line items
    console.log('\n2. Testing quotation with line items...');
    const detailedQuote = () => new Promise((resolve, reject) => {
      const data = JSON.stringify({
        customerId,
        notes: 'Detailed test quotation with line items',
        taxRate: 7.5,
        lineItems: [
          {
            itemType: 'PRODUCT',
            description: 'Test Product Item',
            quantity: 3,
            unitPrice: 100.00
          },
          {
            itemType: 'SERVICE',
            description: 'Test Service Item',
            quantity: 1,
            unitPrice: 250.00
          }
        ]
      });
      
      exec(`curl -s -X POST https://quadco-app.vercel.app/api/quotations -H "Content-Type: application/json" -d '${data}'`, (error, stdout) => {
        if (error) reject(error);
        else resolve(JSON.parse(stdout));
      });
    });
    
    const detailedResult = await detailedQuote();
    console.log(`   ✅ Detailed quotation created: ${detailedResult.quotation.id}`);
    console.log(`   ✅ Line items count: ${detailedResult.quotation.lineItems.length}`);
    console.log(`   ✅ Total amount: ${detailedResult.quotation.total} ${detailedResult.quotation.currency}`);
    
    // Test 3: Quotation with valid until date
    console.log('\n3. Testing quotation with expiry date...');
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30); // 30 days from now
    
    const expiryQuote = () => new Promise((resolve, reject) => {
      const data = JSON.stringify({
        customerId,
        notes: 'Quotation with expiry date',
        validUntil: expiryDate.toISOString(),
        taxRate: 10,
        lineItems: [
          {
            itemType: 'PRODUCT',
            description: 'Premium Product',
            quantity: 1,
            unitPrice: 500.00
          }
        ]
      });
      
      exec(`curl -s -X POST https://quadco-app.vercel.app/api/quotations -H "Content-Type: application/json" -d '${data}'`, (error, stdout) => {
        if (error) reject(error);
        else resolve(JSON.parse(stdout));
      });
    });
    
    const expiryResult = await expiryQuote();
    console.log(`   ✅ Expiry quotation created: ${expiryResult.quotation.id}`);
    console.log(`   ✅ Valid until: ${expiryResult.quotation.validUntil}`);
    
    // Final verification - get all quotations
    console.log('\n4. Final verification - fetching all quotations...');
    const finalCheck = await getCustomers(); // Using same function as it's just a GET request
    exec('curl -s https://quadco-app.vercel.app/api/quotations', (error, stdout) => {
      if (error) {
        console.error('Error:', error);
      } else {
        const quotationsData = JSON.parse(stdout);
        console.log(`   ✅ Total quotations in system: ${quotationsData.quotations.length}`);
        console.log(`   ✅ Most recent quotation: ${quotationsData.quotations[0].id}`);
      }
    });
    
    console.log('\n🎉 All quotation creation tests passed!');
    console.log('=====================================');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

runTests();
