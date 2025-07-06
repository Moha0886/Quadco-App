/**
 * Test script to verify Add Item and Create Invoice functionality
 */

const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

async function testInvoiceCreation() {
  console.log('🧪 Testing Invoice Creation and Add Item Functionality\n');
  
  try {
    // Test 1: Check if customers API works
    console.log('1️⃣ Testing customers API...');
    const { stdout: customersResponse } = await execAsync('curl -s http://localhost:3000/api/customers');
    const customersData = JSON.parse(customersResponse);
    
    if (customersData.customers && customersData.customers.length > 0) {
      console.log('✅ Customers API working - found', customersData.customers.length, 'customers');
    } else {
      console.log('⚠️ Customers API returned empty or no customers');
    }
    
    // Test 2: Test invoice creation with line items
    console.log('\n2️⃣ Testing invoice creation API...');
    
    const invoiceData = {
      customerId: customersData.customers[0]?.id || 'test-customer-id',
      date: '2025-07-06',
      dueDate: '2025-07-20',
      notes: 'Test invoice',
      taxRate: '7.5',
      lineItems: [
        {
          description: 'Test Product 1',
          quantity: 2,
          unitPrice: 100.00
        },
        {
          description: 'Test Product 2', 
          quantity: 1,
          unitPrice: 50.00
        }
      ]
    };
    
    const curlCommand = `curl -s -X POST http://localhost:3000/api/invoices \\
      -H "Content-Type: application/json" \\
      -d '${JSON.stringify(invoiceData)}'`;
    
    const { stdout: invoiceResponse } = await execAsync(curlCommand);
    const invoiceResult = JSON.parse(invoiceResponse);
    
    if (invoiceResult.invoice) {
      console.log('✅ Invoice creation API working');
      console.log('📋 Created invoice ID:', invoiceResult.invoice.id);
      console.log('💰 Total amount:', invoiceResult.invoice.total);
      console.log('📝 Line items count:', invoiceResult.invoice.lineItems?.length || 0);
    } else {
      console.log('❌ Invoice creation failed:', invoiceResult);
    }
    
    // Test 3: Check page accessibility
    console.log('\n3️⃣ Testing page accessibility...');
    const { stdout: pageResponse } = await execAsync('curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/invoices/new');
    
    if (pageResponse.trim() === '200') {
      console.log('✅ Invoice new page loads successfully');
    } else {
      console.log('❌ Invoice new page failed to load. Status:', pageResponse);
    }
    
    console.log('\n🎯 Manual Testing Steps:');
    console.log('1. Open http://localhost:3000/invoices/new');
    console.log('2. Select a customer from dropdown');
    console.log('3. Click "Add Item" button - should add new line item');
    console.log('4. Fill in description, quantity, and unit price');
    console.log('5. Verify amount calculates automatically');
    console.log('6. Add more items as needed');
    console.log('7. Fill in dates and notes');
    console.log('8. Click "Create Invoice"');
    
    console.log('\n💡 Common Issues to Check:');
    console.log('• JavaScript errors in browser console');
    console.log('• Network errors when submitting');
    console.log('• Missing customer selection');
    console.log('• Empty or invalid line item data');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Test creating invoice from quotation functionality
async function testCreateFromQuotation() {
  console.log('\n🔄 Testing Create Invoice from Quotation...');
  
  try {
    // Check if quotations exist
    const { stdout: quotationsResponse } = await execAsync('curl -s http://localhost:3000/api/quotations');
    const quotationsData = JSON.parse(quotationsResponse);
    
    if (quotationsData.quotations && quotationsData.quotations.length > 0) {
      console.log('✅ Found', quotationsData.quotations.length, 'quotations');
      
      // Test conversion API if it exists
      const quotationId = quotationsData.quotations[0].id;
      console.log('🔄 Testing quotation to invoice conversion for ID:', quotationId);
      
      try {
        const { stdout: conversionResponse } = await execAsync(
          `curl -s -X POST http://localhost:3000/api/quotations/${quotationId}/convert-to-invoice`
        );
        const conversionResult = JSON.parse(conversionResponse);
        
        if (conversionResult.invoice) {
          console.log('✅ Quotation to invoice conversion working');
        } else {
          console.log('⚠️ Conversion API exists but returned:', conversionResult);
        }
      } catch (conversionError) {
        console.log('⚠️ Conversion API might not be implemented yet');
      }
    } else {
      console.log('⚠️ No quotations found to convert');
    }
  } catch (error) {
    console.log('⚠️ Error testing quotation conversion:', error.message);
  }
}

testInvoiceCreation().then(() => testCreateFromQuotation());
