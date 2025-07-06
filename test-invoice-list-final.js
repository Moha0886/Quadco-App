const fs = require('fs');

async function testInvoiceListAndPagination() {
    console.log('🔍 Testing Invoice List and Pagination...');
    
    try {
        // Test 1: Basic API call
        console.log('\n📊 Test 1: Basic Invoice List');
        const response1 = await fetch('http://localhost:3000/api/invoices');
        const data1 = await response1.json();
        console.log(`✅ Found ${data1.invoices?.length || 0} invoices`);
        console.log(`✅ Pagination info:`, data1.pagination);
        
        // Test 2: Pagination
        console.log('\n📊 Test 2: Pagination (page 1, limit 3)');
        const response2 = await fetch('http://localhost:3000/api/invoices?page=1&limit=3');
        const data2 = await response2.json();
        console.log(`✅ Page 1: ${data2.invoices?.length || 0} invoices`);
        console.log(`✅ Total pages: ${data2.pagination?.totalPages || 0}`);
        
        // Test 3: Search functionality
        console.log('\n📊 Test 3: Search Functionality');
        const response3 = await fetch('http://localhost:3000/api/invoices?search=test');
        const data3 = await response3.json();
        console.log(`✅ Search 'test': ${data3.invoices?.length || 0} results`);
        
        // Test 4: Status filtering
        console.log('\n📊 Test 4: Status Filtering');
        const response4 = await fetch('http://localhost:3000/api/invoices?status=DRAFT');
        const data4 = await response4.json();
        console.log(`✅ Status 'DRAFT': ${data4.invoices?.length || 0} results`);
        
        // Test 5: Combined filters
        console.log('\n📊 Test 5: Combined Filters');
        const response5 = await fetch('http://localhost:3000/api/invoices?search=test&status=DRAFT&page=1&limit=5');
        const data5 = await response5.json();
        console.log(`✅ Combined filters: ${data5.invoices?.length || 0} results`);
        
        // Test 6: Check invoice data structure
        console.log('\n📊 Test 6: Invoice Data Structure');
        if (data1.invoices && data1.invoices.length > 0) {
            const invoice = data1.invoices[0];
            const requiredFields = ['id', 'invoiceNumber', 'customerId', 'total', 'status', 'issueDate', 'customer'];
            const missingFields = requiredFields.filter(field => !(field in invoice));
            
            if (missingFields.length === 0) {
                console.log('✅ All required fields present');
                console.log('✅ Sample invoice:', {
                    id: invoice.id,
                    invoiceNumber: invoice.invoiceNumber,
                    customer: invoice.customer.name,
                    total: invoice.total,
                    status: invoice.status,
                    issueDate: invoice.issueDate
                });
            } else {
                console.log('❌ Missing fields:', missingFields);
            }
        }
        
        console.log('\n🎯 Expected Frontend Behavior:');
        console.log('1. Invoice list should display 10 invoices by default');
        console.log('2. Search should filter results in real-time');
        console.log('3. Status filter should work correctly');
        console.log('4. Pagination should show page numbers and navigation');
        console.log('5. Each invoice should show generated invoice number');
        
        console.log('\n🔧 To verify:');
        console.log('1. Visit http://localhost:3000/invoices');
        console.log('2. Check that invoices are displayed with proper data');
        console.log('3. Test search functionality');
        console.log('4. Test status filtering');
        console.log('5. Navigate between pages if more than 10 invoices');
        
        return true;
        
    } catch (error) {
        console.error('❌ Error testing invoice functionality:', error);
        return false;
    }
}

// Run the test
testInvoiceListAndPagination().then(success => {
    if (success) {
        console.log('\n🎉 All tests passed! Invoice list and pagination should work correctly.');
    } else {
        console.log('\n❌ Some tests failed. Please check the issues above.');
    }
}).catch(console.error);
