/**
 * Test script to verify the Add Item functionality on invoice creation page
 */

const puppeteer = require('puppeteer');

async function testAddItemFunctionality() {
  const browser = await puppeteer.launch({ 
    headless: false,
    slowMo: 1000 
  });
  
  try {
    const page = await browser.newPage();
    
    console.log('🚀 Testing Add Item functionality on Invoice Creation page...');
    
    // Navigate to the invoice creation page
    await page.goto('http://localhost:3000/invoices/new');
    
    // Wait for the page to load
    await page.waitForSelector('h1');
    
    // Check if the page loaded correctly
    const title = await page.$eval('h1', el => el.textContent);
    console.log('✅ Page loaded:', title);
    
    // Check initial state - should have 1 line item
    const initialLineItems = await page.$$('.grid.grid-cols-12.gap-4.items-end');
    console.log(`📋 Initial line items count: ${initialLineItems.length}`);
    
    // Find and click the Add Item button
    await page.waitForSelector('button[type="button"]');
    const addItemButton = await page.$('button[type="button"]');
    const buttonText = await page.evaluate(el => el.textContent, addItemButton);
    
    if (buttonText.includes('Add Item')) {
      console.log('✅ Add Item button found');
      
      // Click the Add Item button
      await addItemButton.click();
      
      // Wait a moment for the DOM to update
      await page.waitForTimeout(1000);
      
      // Check if a new line item was added
      const newLineItems = await page.$$('.grid.grid-cols-12.gap-4.items-end');
      console.log(`📋 Line items count after click: ${newLineItems.length}`);
      
      if (newLineItems.length > initialLineItems.length) {
        console.log('✅ SUCCESS: Add Item button is working! New line item added.');
        
        // Test filling out the new line item
        const descriptionInputs = await page.$$('input[placeholder="Item description"]');
        if (descriptionInputs.length >= 2) {
          await descriptionInputs[1].type('Test Item');
          console.log('✅ Description field is working');
          
          // Test quantity input
          const quantityInputs = await page.$$('input[type="number"][min="1"]');
          if (quantityInputs.length >= 2) {
            await quantityInputs[1].click();
            await quantityInputs[1].type('2');
            console.log('✅ Quantity field is working');
            
            // Test unit price input
            const priceInputs = await page.$$('input[type="number"][step="0.01"]');
            if (priceInputs.length >= 2) {
              await priceInputs[1].click();
              await priceInputs[1].type('100');
              console.log('✅ Unit price field is working');
              
              // Wait for calculation to update
              await page.waitForTimeout(1000);
              
              // Check if total is calculated correctly
              const totalDisplays = await page.$$('.px-3.py-2.bg-gray-50');
              if (totalDisplays.length >= 2) {
                const totalText = await page.evaluate(el => el.textContent, totalDisplays[1]);
                console.log(`💰 Calculated total: ${totalText}`);
                
                if (totalText.includes('200.00')) {
                  console.log('✅ SUCCESS: Calculation is working correctly (2 x 100 = 200)');
                } else {
                  console.log('⚠️ Warning: Calculation might not be working correctly');
                }
              }
            }
          }
        }
        
        // Test remove functionality
        const removeButtons = await page.$$('button[type="button"] svg');
        if (removeButtons.length >= 2) {
          // Click the remove button for the second item
          await removeButtons[1].click();
          
          await page.waitForTimeout(1000);
          
          const finalLineItems = await page.$$('.grid.grid-cols-12.gap-4.items-end');
          console.log(`📋 Line items count after remove: ${finalLineItems.length}`);
          
          if (finalLineItems.length === initialLineItems.length) {
            console.log('✅ SUCCESS: Remove item functionality is working');
          } else {
            console.log('⚠️ Warning: Remove item functionality might not be working');
          }
        }
        
      } else {
        console.log('❌ FAIL: Add Item button is not working - no new line item added');
        
        // Check console for errors
        const consoleLogs = await page.evaluate(() => {
          return window.console.error.toString();
        });
        console.log('Console errors:', consoleLogs);
      }
    } else {
      console.log('❌ FAIL: Add Item button not found or has wrong text');
    }
    
    // Take a screenshot for debugging
    await page.screenshot({ path: 'invoice-add-item-test.png', fullPage: true });
    console.log('📸 Screenshot saved as invoice-add-item-test.png');
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  } finally {
    await browser.close();
  }
}

// Run the test
testAddItemFunctionality().catch(console.error);
