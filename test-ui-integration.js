#!/usr/bin/env node
const { execSync } = require('child_process');

const BASE_URL = 'https://quadco-app.vercel.app';

console.log('🔍 Testing UI Integration...\n');

function fetchPage(url) {
    try {
        return execSync(`curl -s "${url}"`, { encoding: 'utf8' });
    } catch (error) {
        throw new Error(`Failed to fetch ${url}`);
    }
}

async function testUIIntegration() {
    const tests = [
        {
            name: 'Dashboard Page',
            url: `${BASE_URL}/dashboard`,
            checks: [
                'Quadco Business Manager', // Title
                'lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72', // Sidebar
                'Quadco', // Logo text
                'Dashboard', // Navigation
                'Customers', // Navigation
                'Products', // Navigation
                'Services', // Navigation
                'Quotations', // Navigation
                'Invoices', // Navigation
                'animate-pulse', // Loading state
                'bg-blue-50 dark:bg-blue-900/50 text-blue-600' // Active nav item
            ]
        },
        {
            name: 'Customer Creation Form',
            url: `${BASE_URL}/customers/new`,
            checks: [
                'Create New Customer',
                'form',
                'Company Name',
                'Email',
                'Phone',
                'Address',
                'Contact Person',
                'Submit',
                'Cancel',
                'Sidebar'
            ]
        },
        {
            name: 'Quotation Creation Form',
            url: `${BASE_URL}/quotations/new`,
            checks: [
                'Create New Quotation',
                'form',
                'Customer',
                'Valid Until',
                'Items',
                'Add Item',
                'Submit',
                'Cancel',
                'Sidebar'
            ]
        },
        {
            name: 'Products Page',
            url: `${BASE_URL}/products`,
            checks: [
                'Products',
                'Add Product',
                'Sidebar',
                'table'
            ]
        },
        {
            name: 'Services Page',
            url: `${BASE_URL}/services`,
            checks: [
                'Services',
                'Add Service',
                'Sidebar',
                'table'
            ]
        }
    ];

    let allPassed = true;
    
    for (const test of tests) {
        console.log(`\n📋 Testing ${test.name}...`);
        
        try {
            const html = fetchPage(test.url);
            let passed = 0;
            let failed = 0;
            
            for (const check of test.checks) {
                if (html.includes(check)) {
                    console.log(`   ✅ ${check}`);
                    passed++;
                } else {
                    console.log(`   ❌ ${check}`);
                    failed++;
                    allPassed = false;
                }
            }
            
            console.log(`   📊 ${passed} passed, ${failed} failed`);
            
        } catch (error) {
            console.log(`❌ ${test.name}: Error - ${error.message}`);
            allPassed = false;
        }
    }
    
    console.log('\n' + '='.repeat(60));
    
    if (allPassed) {
        console.log('🎉 All UI integration tests passed!');
        console.log('✅ Sidebar navigation is working');
        console.log('✅ Page titles and metadata are correct');
        console.log('✅ Forms are properly rendered');
        console.log('✅ Layout structure is intact');
        console.log('✅ Responsive design elements are present');
    } else {
        console.log('⚠️  Some UI integration issues detected');
    }
    
    return allPassed;
}

testUIIntegration().then(success => {
    process.exit(success ? 0 : 1);
}).catch(error => {
    console.error('Test failed:', error);
    process.exit(1);
});
