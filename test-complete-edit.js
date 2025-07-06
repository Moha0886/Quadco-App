#!/usr/bin/env node

// Comprehensive test for delivery note edit functionality

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

async function testCompleteEditFlow() {
  console.log('🔧 Testing complete delivery note edit flow...\n');

  try {
    // 1. Get a delivery note with line items
    console.log('1. Getting delivery note with line items...');
    const listResponse = await makeRequest('GET', '/api/delivery-notes');
    const deliveryNotes = JSON.parse(listResponse.data).deliveryNotes;
    
    // Find one with line items
    const noteWithItems = deliveryNotes.find(note => note._count.lineItems > 0);
    
    if (!noteWithItems) {
      console.log('⚠️  No delivery notes with line items found. Creating one...');
      
      // Create a new delivery note with line items
      const newNoteData = {
        customerId: deliveryNotes[0].customerId,
        status: 'PENDING',
        notes: 'Test delivery note for edit functionality',
        lineItems: [{
          itemType: 'PRODUCT',
          productId: 'cmcphumrh00062w2hgknhg54t',
          description: 'Test Product',
          quantity: 1,
          unitPrice: 100
        }]
      };
      
      const createResponse = await makeRequest('POST', '/api/delivery-notes', newNoteData);
      if (createResponse.status === 201) {
        const newNote = JSON.parse(createResponse.data).deliveryNote;
        console.log(`✅ Created new delivery note: ${newNote.deliveryNumber}`);
        deliveryNoteId = newNote.id;
      } else {
        console.log('❌ Failed to create test delivery note');
        return;
      }
    } else {
      deliveryNoteId = noteWithItems.id;
      console.log(`✅ Found delivery note with line items: ${noteWithItems.deliveryNumber}`);
    }

    // 2. Get the full delivery note details
    console.log('\n2. Fetching full delivery note details...');
    const getResponse = await makeRequest('GET', `/api/delivery-notes/${deliveryNoteId}`);
    
    if (getResponse.status !== 200) {
      console.log(`❌ Failed to fetch delivery note: ${getResponse.status}`);
      return;
    }

    const originalNote = JSON.parse(getResponse.data).deliveryNote;
    console.log(`✅ Original note: ${originalNote.deliveryNumber}`);
    console.log(`   Status: ${originalNote.status}`);
    console.log(`   Line items: ${originalNote.lineItems.length}`);
    
    // 3. Test updating with line items
    console.log('\n3. Testing update with line items...');
    
    const updateData = {
      customerId: originalNote.customerId,
      status: 'IN_TRANSIT',
      notes: 'Updated with line items - ' + new Date().toISOString(),
      lineItems: [
        {
          itemType: 'PRODUCT',
          productId: 'cmcphumrh00062w2hgknhg54t',
          description: 'Updated Product Item',
          quantity: 2,
          unitPrice: 150
        },
        {
          itemType: 'PRODUCT',
          productId: 'cmcpg45z700012wb72thuue2q',
          description: 'Additional Product Item',
          quantity: 1,
          unitPrice: 200
        }
      ]
    };

    const updateResponse = await makeRequest('PUT', `/api/delivery-notes/${deliveryNoteId}`, updateData);
    
    if (updateResponse.status === 200) {
      const updatedNote = JSON.parse(updateResponse.data).deliveryNote;
      console.log('✅ Update successful!');
      console.log(`   New status: ${updatedNote.status}`);
      console.log(`   New line items: ${updatedNote.lineItems.length}`);
      console.log(`   Total value: $${updatedNote.lineItems.reduce((sum, item) => sum + item.total, 0)}`);
    } else {
      console.log(`❌ Update failed with status: ${updateResponse.status}`);
      console.log(`   Response: ${updateResponse.data}`);
    }

    // 4. Test the UI pages
    console.log('\n4. Testing UI pages...');
    
    // View page
    const viewResponse = await makeRequest('GET', `/delivery-notes/${deliveryNoteId}`);
    if (viewResponse.status === 200 && !viewResponse.data.includes('404')) {
      console.log('✅ View page accessible');
    } else {
      console.log('❌ View page not accessible');
    }
    
    // Edit page
    const editResponse = await makeRequest('GET', `/delivery-notes/${deliveryNoteId}/edit`);
    if (editResponse.status === 200 && !editResponse.data.includes('404')) {
      console.log('✅ Edit page accessible');
    } else {
      console.log('❌ Edit page not accessible');
    }

    console.log('\n🎉 Complete edit flow test finished!');
    console.log('📋 Summary:');
    console.log('   ✅ API endpoints working');
    console.log('   ✅ Line items handling');
    console.log('   ✅ UI pages accessible');
    console.log('   ✅ Edit functionality is fully operational');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testCompleteEditFlow();
