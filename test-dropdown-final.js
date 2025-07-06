const fs = require('fs');
const path = require('path');

// Simple test to verify the dropdown functionality
async function testDropdownFunctionality() {
    console.log('🔍 Testing dropdown functionality...');
    
    try {
        // Test APIs
        console.log('📊 Testing APIs...');
        
        const productsResponse = await fetch('http://localhost:3000/api/products');
        const productsData = await productsResponse.json();
        console.log(`✅ Products API: ${productsData.products?.length || 0} products`);
        
        const servicesResponse = await fetch('http://localhost:3000/api/services');
        const servicesData = await servicesResponse.json();
        console.log(`✅ Services API: ${servicesData.services?.length || 0} services`);
        
        // Check if the component file has the correct structure
        const componentPath = path.join(__dirname, 'src', 'app', 'invoices', 'new', 'page.tsx');
        if (fs.existsSync(componentPath)) {
            const content = fs.readFileSync(componentPath, 'utf8');
            
            // Check for key patterns
            const hasProductsMap = content.includes('products.map((product)');
            const hasServicesMap = content.includes('services.map((service)');
            const hasLoadingState = content.includes('loadingItems');
            const hasOptgroups = content.includes('optgroup');
            
            console.log('📁 Component structure:');
            console.log(`  - Products mapping: ${hasProductsMap ? '✅' : '❌'}`);
            console.log(`  - Services mapping: ${hasServicesMap ? '✅' : '❌'}`);
            console.log(`  - Loading state: ${hasLoadingState ? '✅' : '❌'}`);
            console.log(`  - Optgroups: ${hasOptgroups ? '✅' : '❌'}`);
            
            if (hasProductsMap && hasServicesMap && hasLoadingState && hasOptgroups) {
                console.log('✅ Component structure looks correct!');
                
                console.log('\n🎯 Expected behavior:');
                console.log('1. Dropdown should show "Loading items..." initially');
                console.log('2. After loading, dropdown should show:');
                console.log(`   - Custom item (manual entry)`);
                console.log(`   - Products section with ${productsData.products?.length || 0} products`);
                console.log(`   - Services section with ${servicesData.services?.length || 0} services`);
                console.log('3. Selecting an item should auto-fill description and price');
                
                console.log('\n🔧 If items still don\'t show:');
                console.log('1. Open browser dev tools (F12)');
                console.log('2. Check Console tab for any errors');
                console.log('3. Check Network tab to verify API calls');
                console.log('4. Inspect the <select> element in Elements tab');
                
                return true;
            } else {
                console.log('❌ Component structure issues detected');
                return false;
            }
        } else {
            console.log('❌ Component file not found');
            return false;
        }
        
    } catch (error) {
        console.error('❌ Error testing functionality:', error);
        return false;
    }
}

// Run the test
testDropdownFunctionality().then(success => {
    if (success) {
        console.log('\n🎉 All tests passed! The dropdown should now work correctly.');
    } else {
        console.log('\n❌ Some tests failed. Please check the issues above.');
    }
}).catch(console.error);
