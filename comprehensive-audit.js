const fs = require('fs');
const path = require('path');

async function comprehensiveAudit() {
    console.log('🔍 COMPREHENSIVE FRONTEND-BACKEND RECONCILIATION AUDIT');
    console.log('='* 60);
    
    const results = {
        issues: [],
        successes: [],
        recommendations: []
    };
    
    // Test all major APIs
    const apiTests = [
        { name: 'Customers', url: '/api/customers' },
        { name: 'Products', url: '/api/products' },
        { name: 'Services', url: '/api/services' },
        { name: 'Service Categories', url: '/api/service-categories' },
        { name: 'Quotations', url: '/api/quotations' },
        { name: 'Invoices', url: '/api/invoices' },
        { name: 'Delivery Notes', url: '/api/delivery-notes' },
        { name: 'Users', url: '/api/users' },
        { name: 'Permissions', url: '/api/permissions' }
    ];
    
    console.log('\n📊 API CONNECTIVITY TEST');
    console.log('-' * 30);
    
    for (const test of apiTests) {
        try {
            const response = await fetch(`http://localhost:3000${test.url}`);
            const status = response.status;
            
            if (status === 200) {
                const data = await response.json();
                const dataKeys = Object.keys(data);
                console.log(`✅ ${test.name}: ${status} - Keys: [${dataKeys.join(', ')}]`);
                results.successes.push(`${test.name} API working`);
                
                // Check data structure
                if (dataKeys.length > 0) {
                    const firstKey = dataKeys[0];
                    const items = data[firstKey];
                    if (Array.isArray(items) && items.length > 0) {
                        const sampleItem = items[0];
                        const fieldTypes = {};
                        Object.keys(sampleItem).forEach(key => {
                            fieldTypes[key] = typeof sampleItem[key];
                        });
                        console.log(`   Sample fields: ${Object.entries(fieldTypes).map(([k,v]) => `${k}:${v}`).join(', ')}`);
                    }
                }
            } else {
                console.log(`❌ ${test.name}: ${status}`);
                results.issues.push(`${test.name} API failed with status ${status}`);
            }
        } catch (error) {
            console.log(`❌ ${test.name}: ERROR - ${error.message}`);
            results.issues.push(`${test.name} API error: ${error.message}`);
        }
    }
    
    // Test specific endpoints that had issues
    console.log('\n🎯 SPECIFIC ENDPOINT TESTING');
    console.log('-' * 30);
    
    const specificTests = [
        { name: 'Invoice View', url: '/api/invoices/cmcqxj0i700102wuf8vh2y4m2' },
        { name: 'Quotations with pagination', url: '/api/quotations?page=1&limit=5' },
        { name: 'Products search', url: '/api/products?search=laptop' }
    ];
    
    for (const test of specificTests) {
        try {
            const response = await fetch(`http://localhost:3000${test.url}`);
            if (response.status === 200) {
                const data = await response.json();
                console.log(`✅ ${test.name}: Working`);
                
                // Special checks for invoice
                if (test.name === 'Invoice View' && data.invoice) {
                    console.log(`   Invoice fields: ${Object.keys(data.invoice).join(', ')}`);
                    console.log(`   Line items: ${data.invoice.lineItems?.length || 0}`);
                    if (data.invoice.lineItems?.length > 0) {
                        console.log(`   First item fields: ${Object.keys(data.invoice.lineItems[0]).join(', ')}`);
                    }
                }
            } else {
                console.log(`❌ ${test.name}: ${response.status}`);
                results.issues.push(`${test.name} failed`);
            }
        } catch (error) {
            console.log(`❌ ${test.name}: ${error.message}`);
            results.issues.push(`${test.name} error`);
        }
    }
    
    // Check frontend interfaces by examining key files
    console.log('\n📋 FRONTEND INTERFACE ANALYSIS');
    console.log('-' * 30);
    
    const frontendFiles = [
        'src/app/invoices/page.tsx',
        'src/app/invoices/[id]/page.tsx', 
        'src/app/invoices/new/page.tsx',
        'src/app/quotations/page.tsx',
        'src/app/customers/page.tsx',
        'src/app/products/page.tsx'
    ];
    
    for (const file of frontendFiles) {
        try {
            const content = fs.readFileSync(file, 'utf8');
            
            // Extract interfaces
            const interfaceMatches = content.match(/interface\s+(\w+)\s*{[^}]+}/g);
            if (interfaceMatches) {
                console.log(`✅ ${file}:`);
                interfaceMatches.forEach(match => {
                    const name = match.match(/interface\s+(\w+)/)[1];
                    console.log(`   - Interface: ${name}`);
                });
            }
            
            // Check for common issues
            if (content.includes('id: number')) {
                results.issues.push(`${file}: Uses number IDs (should be string)`);
            }
            if (content.includes('issueDate') && !content.includes('date')) {
                results.issues.push(`${file}: Uses issueDate (should be date)`);
            }
            
        } catch (error) {
            console.log(`❌ Cannot read ${file}: ${error.message}`);
        }
    }
    
    // Prisma schema analysis
    console.log('\n🗄️  DATABASE SCHEMA ANALYSIS');
    console.log('-' * 30);
    
    try {
        const schemaContent = fs.readFileSync('prisma/schema.prisma', 'utf8');
        
        // Extract model names
        const models = schemaContent.match(/model\s+(\w+)\s*{/g);
        if (models) {
            console.log('✅ Database Models:');
            models.forEach(model => {
                const name = model.match(/model\s+(\w+)/)[1];
                console.log(`   - ${name}`);
            });
        }
        
        // Extract enums
        const enums = schemaContent.match(/enum\s+(\w+)\s*{/g);
        if (enums) {
            console.log('✅ Enums:');
            enums.forEach(enumMatch => {
                const name = enumMatch.match(/enum\s+(\w+)/)[1];
                console.log(`   - ${name}`);
            });
        }
        
    } catch (error) {
        console.log(`❌ Cannot read schema: ${error.message}`);
    }
    
    // Summary
    console.log('\n📊 AUDIT SUMMARY');
    console.log('=' * 30);
    console.log(`✅ Successes: ${results.successes.length}`);
    console.log(`❌ Issues: ${results.issues.length}`);
    
    if (results.issues.length > 0) {
        console.log('\n🔧 ISSUES TO FIX:');
        results.issues.forEach((issue, i) => {
            console.log(`${i + 1}. ${issue}`);
        });
    }
    
    console.log('\n💡 RECOMMENDATIONS:');
    console.log('1. Ensure all frontend interfaces use string IDs');
    console.log('2. Use consistent field names (date vs issueDate)');
    console.log('3. Match status enums between frontend and backend');
    console.log('4. Implement proper error handling in all APIs');
    console.log('5. Add TypeScript types for all API responses');
    
    return results;
}

comprehensiveAudit().then(results => {
    console.log('\n🎉 AUDIT COMPLETE');
}).catch(console.error);
