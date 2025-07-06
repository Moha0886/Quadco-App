/**
 * Simple test to check if the invoice new page loads and has Add Item functionality
 */

const http = require('http');

async function testInvoiceNewPage() {
  console.log('🚀 Testing Invoice New Page...\n');
  
  try {
    // Test if the page loads
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/invoices/new',
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        console.log(`📊 Response Status: ${res.statusCode}`);
        
        if (res.statusCode === 200) {
          console.log('✅ Page loads successfully');
          
          // Check for key elements in the HTML
          const checks = [
            { name: 'Add Item Button', pattern: /Add Item/ },
            { name: 'Line Items Section', pattern: /Line Items/ },
            { name: 'Description Input', pattern: /Item description/ },
            { name: 'Quantity Input', pattern: /Qty/ },
            { name: 'Unit Price Input', pattern: /Unit Price/ },
            { name: 'Amount Display', pattern: /Amount/ },
            { name: 'Create Invoice Button', pattern: /Create Invoice/ },
            { name: 'addLineItem Function', pattern: /addLineItem/ },
            { name: 'handleLineItemChange Function', pattern: /handleLineItemChange/ },
          ];
          
          console.log('\n🔍 Checking for required elements:');
          checks.forEach(check => {
            if (check.pattern.test(data)) {
              console.log(`✅ ${check.name}: Found`);
            } else {
              console.log(`❌ ${check.name}: Missing`);
            }
          });
          
          // Check for React state management
          if (data.includes('useState') && data.includes('lineItems')) {
            console.log('✅ React state management: Found');
          } else {
            console.log('❌ React state management: Missing');
          }
          
          // Check for event handlers
          if (data.includes('onClick={addLineItem}')) {
            console.log('✅ Add Item click handler: Found');
          } else {
            console.log('❌ Add Item click handler: Missing or incorrect');
          }
          
          console.log('\n💡 Summary:');
          console.log('The invoice creation page should now have working Add Item functionality.');
          console.log('If you\'re still having issues, please check the browser console for JavaScript errors.');
          
        } else {
          console.log(`❌ Page failed to load: Status ${res.statusCode}`);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Request failed:', error.message);
      console.log('\n💡 Make sure the development server is running with: npm run dev');
    });

    req.end();
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testInvoiceNewPage();
