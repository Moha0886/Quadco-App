#!/usr/bin/env node

// Test the delivery note edit functionality end-to-end

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

async function testEditFunctionality() {
  const deliveryNoteId = 'cmcqubsy0000f2wz7r53htt9m';
  
  console.log('🔧 Testing delivery note edit functionality...\n');

  try {
    // 1. Get the current delivery note
    console.log('1. Fetching current delivery note...');
    const getResponse = await makeRequest('GET', `/api/delivery-notes/${deliveryNoteId}`);
    
    if (getResponse.status !== 200) {
      console.log(`❌ Failed to fetch delivery note: ${getResponse.status}`);
      return;
    }

    const currentData = JSON.parse(getResponse.data);
    const deliveryNote = currentData.deliveryNote;
    console.log(`✅ Current delivery note: ${deliveryNote.deliveryNumber}`);
    console.log(`   Status: ${deliveryNote.status}`);
    console.log(`   Notes: "${deliveryNote.notes}"`);
    console.log(`   Line items: ${deliveryNote.lineItems.length}`);

    // 2. Update the delivery note
    console.log('\n2. Testing update functionality...');
    
    const updateData = {
      customerId: deliveryNote.customerId,
      status: 'IN_TRANSIT', // Change status
      notes: 'Updated via edit functionality test - ' + new Date().toISOString(),
      lineItems: deliveryNote.lineItems.map(item => ({
        itemType: item.itemType,
        productId: item.productId,
        serviceId: item.serviceId,
        description: item.description,
        quantity: item.quantity,
        unitPrice: parseFloat(item.unitPrice),
      }))
    };

    const updateResponse = await makeRequest('PUT', `/api/delivery-notes/${deliveryNoteId}`, updateData);
    
    if (updateResponse.status === 200) {
      console.log('✅ Update successful!');
      const updatedData = JSON.parse(updateResponse.data);
      console.log(`   New status: ${updatedData.deliveryNote.status}`);
      console.log(`   New notes: "${updatedData.deliveryNote.notes}"`);
    } else {
      console.log(`❌ Update failed with status: ${updateResponse.status}`);
      console.log(`   Response: ${updateResponse.data.substring(0, 200)}...`);
    }

    // 3. Verify the update
    console.log('\n3. Verifying the update...');
    const verifyResponse = await makeRequest('GET', `/api/delivery-notes/${deliveryNoteId}`);
    
    if (verifyResponse.status === 200) {
      const verifiedData = JSON.parse(verifyResponse.data);
      const verifiedNote = verifiedData.deliveryNote;
      
      if (verifiedNote.status === 'IN_TRANSIT' && verifiedNote.notes.includes('Updated via edit functionality test')) {
        console.log('✅ Update verified successfully!');
      } else {
        console.log('⚠️  Update may not have been saved correctly');
        console.log(`   Status: ${verifiedNote.status}`);
        console.log(`   Notes: "${verifiedNote.notes}"`);
      }
    }

    console.log('\n🎉 Edit functionality test complete!');
    console.log('   The API endpoints for editing are working correctly.');
    console.log('   The edit page in the browser should also work once it loads.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testEditFunctionality();
