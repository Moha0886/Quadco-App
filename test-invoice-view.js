async function testInvoiceViewPage() {
    console.log('🔍 Testing Invoice View Page...');
    
    const invoiceId = 'cmcqxj0i700102wuf8vh2y4m2';
    
    try {
        // Test the API directly
        console.log('📊 Testing API response...');
        const response = await fetch(`http://localhost:3000/api/invoices/${invoiceId}`);
        
        if (!response.ok) {
            console.error('❌ API request failed:', response.status, response.statusText);
            return false;
        }
        
        const data = await response.json();
        console.log('✅ API Response received');
        
        // Check structure
        console.log('\n📋 Invoice Data Structure:');
        console.log('- Invoice ID:', data.invoice?.id);
        console.log('- Customer:', data.invoice?.customer?.name);
        console.log('- Line Items Count:', data.invoice?.lineItems?.length || 0);
        console.log('- Total:', data.invoice?.total);
        console.log('- Status:', data.invoice?.status);
        
        // Check line items in detail
        if (data.invoice?.lineItems && data.invoice.lineItems.length > 0) {
            console.log('\n📦 Line Items Details:');
            data.invoice.lineItems.forEach((item, index) => {
                console.log(`Item ${index + 1}:`);
                console.log('  - ID:', item.id);
                console.log('  - Description:', item.description);
                console.log('  - Quantity:', item.quantity);
                console.log('  - Unit Price:', item.unitPrice);
                console.log('  - Total:', item.total);
                console.log('  - Product:', item.product?.name || 'None');
                console.log('  - Service:', item.service?.name || 'None');
            });
        } else {
            console.log('❌ No line items found!');
        }
        
        // Expected frontend behavior
        console.log('\n🎯 Expected Frontend Behavior:');
        console.log('1. Page should load without errors');
        console.log('2. Invoice details should be displayed');
        console.log('3. Line items table should show all items');
        console.log('4. Product/service information should be visible');
        console.log('5. Totals should be calculated correctly');
        
        console.log('\n🔧 To verify:');
        console.log(`1. Open http://localhost:3000/invoices/${invoiceId}`);
        console.log('2. Check browser console for debug logs');
        console.log('3. Verify line items are displayed in the table');
        console.log('4. Check that totals match the API response');
        
        return true;
        
    } catch (error) {
        console.error('❌ Error testing invoice view:', error);
        return false;
    }
}

// Run the test
testInvoiceViewPage().then(success => {
    if (success) {
        console.log('\n🎉 Invoice view test completed! Check the browser for actual results.');
    } else {
        console.log('\n❌ Invoice view test failed. Please check the issues above.');
    }
}).catch(console.error);
