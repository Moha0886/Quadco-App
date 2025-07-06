#!/usr/bin/env node

const BASE_URL = 'http://localhost:3000';

async function testDeliveryNoteEditFlow() {
  console.log('🧪 Testing Delivery Note Edit Flow\n');
  
  const deliveryNoteId = 'cmcqubsy0000f2wz7r53htt9m';
  
  try {
    // Test 1: Check if edit page loads
    console.log('1. Testing edit page accessibility...');
    const editPageResponse = await fetch(`${BASE_URL}/delivery-notes/${deliveryNoteId}/edit`);
    if (editPageResponse.ok) {
      console.log('   ✅ Edit page loads successfully');
    } else {
      console.log(`   ❌ Edit page failed (${editPageResponse.status})`);
      return;
    }

    // Test 2: Get current delivery note data
    console.log('2. Fetching current delivery note data...');
    const currentDataResponse = await fetch(`${BASE_URL}/api/delivery-notes/${deliveryNoteId}`);
    if (!currentDataResponse.ok) {
      console.log('   ❌ Failed to fetch current data');
      return;
    }
    
    const currentData = await currentDataResponse.json();
    console.log(`   ✅ Current status: ${currentData.deliveryNote.status}`);
    console.log(`   ✅ Current notes: ${currentData.deliveryNote.notes?.substring(0, 30)}...`);
    console.log(`   ✅ Line items: ${currentData.deliveryNote.lineItems.length}`);

    // Test 3: Test update API (just update notes)
    console.log('3. Testing delivery note update...');
    const updateData = {
      customerId: currentData.deliveryNote.customerId,
      status: currentData.deliveryNote.status,
      notes: currentData.deliveryNote.notes + ' - Updated via API test',
      deliveredDate: currentData.deliveryNote.deliveredDate,
      lineItems: currentData.deliveryNote.lineItems.map(item => ({
        itemType: item.itemType,
        productId: item.productId,
        serviceId: item.serviceId,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount || 0,
        total: item.total
      }))
    };

    const updateResponse = await fetch(`${BASE_URL}/api/delivery-notes/${deliveryNoteId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });

    if (updateResponse.ok) {
      const updatedData = await updateResponse.json();
      console.log('   ✅ Update successful');
      console.log(`   ✅ Updated notes: ${updatedData.deliveryNote.notes?.substring(0, 50)}...`);
    } else {
      console.log(`   ❌ Update failed (${updateResponse.status})`);
      const errorData = await updateResponse.json();
      console.log(`   Error: ${errorData.error}`);
    }

    // Test 4: Verify view page still works
    console.log('4. Testing view page after update...');
    const viewPageResponse = await fetch(`${BASE_URL}/delivery-notes/${deliveryNoteId}`);
    if (viewPageResponse.ok) {
      console.log('   ✅ View page still accessible after update');
    } else {
      console.log('   ❌ View page failed after update');
    }

  } catch (error) {
    console.log(`❌ Test error: ${error.message}`);
  }

  console.log('\n🎉 Delivery Note Edit Flow Test Complete!');
}

async function main() {
  // Check server first
  try {
    const healthCheck = await fetch(`${BASE_URL}/`);
    if (!healthCheck.ok) {
      throw new Error('Server not accessible');
    }
    console.log('✅ Development server is running\n');
  } catch (error) {
    console.log('❌ Development server is not accessible');
    return;
  }

  await testDeliveryNoteEditFlow();
}

main().catch(console.error);
