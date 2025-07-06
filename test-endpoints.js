#!/usr/bin/env node

const BASE_URL = 'http://localhost:3000';

async function testEndpoints() {
  console.log('🧪 Testing API endpoints...\n');

  // Test quotations endpoints
  console.log('Testing quotations...');
  try {
    const quotationsResponse = await fetch(`${BASE_URL}/api/quotations`);
    if (quotationsResponse.ok) {
      const quotationsData = await quotationsResponse.json();
      console.log('✅ Quotations list endpoint working');
      
      if (quotationsData.quotations && quotationsData.quotations.length > 0) {
        const firstQuotation = quotationsData.quotations[0];
        console.log(`   Found quotation: ${firstQuotation.id}`);
        
        // Test individual quotation endpoint
        const quotationResponse = await fetch(`${BASE_URL}/api/quotations/${firstQuotation.id}`);
        if (quotationResponse.ok) {
          console.log('✅ Individual quotation endpoint working');
        } else {
          console.log('❌ Individual quotation endpoint failed');
        }
      } else {
        console.log('   No quotations found in database');
      }
    } else {
      console.log('❌ Quotations list endpoint failed');
    }
  } catch (error) {
    console.log('❌ Quotations endpoints error:', error.message);
  }

  // Test invoices endpoints
  console.log('\nTesting invoices...');
  try {
    const invoicesResponse = await fetch(`${BASE_URL}/api/invoices`);
    if (invoicesResponse.ok) {
      const invoicesData = await invoicesResponse.json();
      console.log('✅ Invoices list endpoint working');
      
      if (invoicesData.invoices && invoicesData.invoices.length > 0) {
        const firstInvoice = invoicesData.invoices[0];
        console.log(`   Found invoice: ${firstInvoice.id}`);
        
        // Test individual invoice endpoint
        const invoiceResponse = await fetch(`${BASE_URL}/api/invoices/${firstInvoice.id}`);
        if (invoiceResponse.ok) {
          console.log('✅ Individual invoice endpoint working');
        } else {
          console.log('❌ Individual invoice endpoint failed');
        }
      } else {
        console.log('   No invoices found in database');
      }
    } else {
      console.log('❌ Invoices list endpoint failed');
    }
  } catch (error) {
    console.log('❌ Invoices endpoints error:', error.message);
  }

  // Test delivery notes endpoints
  console.log('\nTesting delivery notes...');
  try {
    const deliveryNotesResponse = await fetch(`${BASE_URL}/api/delivery-notes`);
    if (deliveryNotesResponse.ok) {
      const deliveryNotesData = await deliveryNotesResponse.json();
      console.log('✅ Delivery notes list endpoint working');
      
      if (deliveryNotesData.deliveryNotes && deliveryNotesData.deliveryNotes.length > 0) {
        const firstDeliveryNote = deliveryNotesData.deliveryNotes[0];
        console.log(`   Found delivery note: ${firstDeliveryNote.id}`);
        
        // Test individual delivery note endpoint
        const deliveryNoteResponse = await fetch(`${BASE_URL}/api/delivery-notes/${firstDeliveryNote.id}`);
        if (deliveryNoteResponse.ok) {
          console.log('✅ Individual delivery note endpoint working');
        } else {
          console.log('❌ Individual delivery note endpoint failed');
        }
      } else {
        console.log('   No delivery notes found in database');
      }
    } else {
      console.log('❌ Delivery notes list endpoint failed');
    }
  } catch (error) {
    console.log('❌ Delivery notes endpoints error:', error.message);
  }

  console.log('\n🏁 API endpoint testing complete!');
}

// Check if server is running first
async function checkServer() {
  try {
    const response = await fetch(`${BASE_URL}/`);
    if (response.ok) {
      console.log('✅ Development server is running\n');
      return true;
    }
  } catch (error) {
    console.log('❌ Development server is not running. Please start it with: npm run dev');
    return false;
  }
  return false;
}

async function main() {
  const serverRunning = await checkServer();
  if (serverRunning) {
    await testEndpoints();
  }
}

main().catch(console.error);
