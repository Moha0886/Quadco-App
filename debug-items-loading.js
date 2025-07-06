/**
 * Debug script to check items loading in invoice creation
 */

console.log('🔍 Debugging Items Not Showing Issue\n');

const puppeteer = require('puppeteer');

async function debugItemsLoading() {
  let browser;
  try {
    browser = await puppeteer.launch({ 
      headless: false,
      slowMo: 1000,
      devtools: true
    });
    
    const page = await browser.newPage();
    
    // Listen for console messages
    page.on('console', msg => {
      console.log('🖥️  Browser Console:', msg.text());
    });
    
    // Listen for network requests
    page.on('request', request => {
      if (request.url().includes('api/')) {
        console.log('🌐 API Request:', request.url());
      }
    });
    
    page.on('response', response => {
      if (response.url().includes('api/')) {
        console.log('📡 API Response:', response.url(), response.status());
      }
    });
    
    console.log('🚀 Opening invoice creation page...');
    await page.goto('http://localhost:3000/invoices/new');
    
    // Wait for the page to load
    await page.waitForSelector('select');
    
    // Wait a bit for the API calls to complete
    await page.waitForTimeout(3000);
    
    // Check if products are loaded
    const selectOptions = await page.$$eval('select option', options => 
      options.map(option => ({ value: option.value, text: option.textContent }))
    );
    
    console.log('\n📋 Dropdown Options Found:');
    selectOptions.forEach((option, index) => {
      console.log(`   ${index + 1}. ${option.text} (value: ${option.value})`);
    });
    
    // Check if optgroups are present
    const optgroups = await page.$$eval('optgroup', groups => 
      groups.map(group => ({ label: group.label, optionCount: group.children.length }))
    );
    
    console.log('\n📦 Option Groups:');
    optgroups.forEach(group => {
      console.log(`   ${group.label}: ${group.optionCount} options`);
    });
    
    console.log('\n⏳ Keeping browser open for 10 seconds for manual inspection...');
    await page.waitForTimeout(10000);
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

debugItemsLoading();
