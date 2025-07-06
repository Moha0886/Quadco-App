#!/usr/bin/env node

// Test the invoice new page functionality

const http = require('http');

function makeRequest(method, path, data) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => responseData += chunk);
      res.on('end', () => resolve({ 
        status: res.statusCode, 
        data: responseData 
      }));
    });

    req.on('error', reject);
    req.setTimeout(10000, () => reject(new Error('Request timeout')));
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function testInvoiceNewPage() {
  console.log('🧾 Testing Invoice New Page Functionality...\n');

  try {
    // 1. Test if the page loads
    console.log('1. Testing page access...');
    const pageResponse = await makeRequest('GET', '/invoices/new');
    
    if (pageResponse.status === 200) {
      console.log('✅ Invoice new page loads successfully');
      
      // Check if the page contains the expected elements
      const pageContent = pageResponse.data;
      const hasAddButton = pageContent.includes('Add Item');
      const hasLineItemsSection = pageContent.includes('Line Items');
      const hasQuantityField = pageContent.includes('Qty');
      const hasUnitPriceField = pageContent.includes('Unit Price');
      
      if (hasAddButton && hasLineItemsSection && hasQuantityField && hasUnitPriceField) {
        console.log('✅ Page contains all expected line item elements:');
        console.log('   - Add Item button');
        console.log('   - Line Items section');
        console.log('   - Quantity field');
        console.log('   - Unit Price field');
      } else {
        console.log('⚠️  Some expected elements might be missing:');
        console.log(`   - Add Item button: ${hasAddButton ? '✅' : '❌'}`);
        console.log(`   - Line Items section: ${hasLineItemsSection ? '✅' : '❌'}`);
        console.log(`   - Quantity field: ${hasQuantityField ? '✅' : '❌'}`);
        console.log(`   - Unit Price field: ${hasUnitPriceField ? '✅' : '❌'}`);
      }
    } else {
      console.log(`❌ Page failed to load: ${pageResponse.status}`);
      return;
    }

    // 2. Test the customers API (used by the page)
    console.log('\n2. Testing customers API...');
    const customersResponse = await makeRequest('GET', '/api/customers');
    
    if (customersResponse.status === 200) {
      const customersData = JSON.parse(customersResponse.data);
      console.log(`✅ Customers API working - ${customersData.customers?.length || 0} customers found`);
    } else {
      console.log(`⚠️  Customers API issue: ${customersResponse.status}`);
    }

    // 3. Test invoice creation API
    console.log('\n3. Testing invoice creation API...');
    const testInvoiceData = {
      customerId: 'test-customer-id',
      date: '2025-07-06',
      dueDate: '2025-07-20',
      notes: 'Test invoice for functionality check',
      taxRate: '7.5',
      lineItems: [{
        description: 'Test Item',
        quantity: 1,
        unitPrice: 100
      }]
    };

    const createResponse = await makeRequest('POST', '/api/invoices', testInvoiceData);
    
    if (createResponse.status === 201) {
      console.log('✅ Invoice creation API working');
    } else if (createResponse.status === 400 || createResponse.status === 404) {
      console.log('⚠️  Invoice creation API responds (may need valid customer ID)');
    } else {
      console.log(`❌ Invoice creation API issue: ${createResponse.status}`);
    }

    console.log('\n🎉 Invoice New Page Test Complete!');
    console.log('📋 Diagnosis:');
    
    if (pageResponse.status === 200) {
      console.log('✅ The page structure looks correct');
      console.log('💡 If you can\'t add items, try:');
      console.log('   1. Check browser console for JavaScript errors');
      console.log('   2. Make sure you\'re clicking the "Add Item" button');
      console.log('   3. Try refreshing the page');
      console.log('   4. Check if the page is fully loaded');
      
      console.log('\n🔧 Expected Behavior:');
      console.log('   - Click "Add Item" button to add new line items');
      console.log('   - Fill in Description, Quantity, and Unit Price');
      console.log('   - Amount should calculate automatically');
      console.log('   - Use trash icon to remove items');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testInvoiceNewPage();
