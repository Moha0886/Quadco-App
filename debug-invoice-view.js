const puppeteer = require('puppeteer');

async function debugInvoiceViewPage() {
  console.log('🚀 Starting invoice view page debugging...');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    devtools: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Listen to console logs from the page
    page.on('console', msg => {
      const type = msg.type();
      console.log(`[BROWSER ${type.toUpperCase()}]:`, msg.text());
    });
    
    // Listen to network requests
    page.on('response', response => {
      if (response.url().includes('/api/invoices/')) {
        console.log(`[NETWORK]: ${response.status()} ${response.url()}`);
      }
    });
    
    console.log('📖 Navigating to invoice view page...');
    await page.goto('http://localhost:3000/invoices/cmcqxj0i700102wuf8vh2y4m2', { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });
    
    // Wait for the page to load completely
    await page.waitForTimeout(3000);
    
    console.log('🔍 Checking page elements...');
    
    // Check if the invoice details are displayed
    const invoiceTitle = await page.$('h1');
    if (invoiceTitle) {
      const titleText = await page.evaluate(el => el.textContent, invoiceTitle);
      console.log('Page title:', titleText);
    }
    
    // Check if line items table exists
    const table = await page.$('table');
    console.log('Line items table found:', !!table);
    
    if (table) {
      // Count table rows
      const rows = await page.$$('tbody tr');
      console.log('Table rows found:', rows.length);
      
      // Get table content
      const tableContent = await page.evaluate(() => {
        const rows = document.querySelectorAll('tbody tr');
        return Array.from(rows).map(row => {
          const cells = row.querySelectorAll('td');
          return Array.from(cells).map(cell => cell.textContent.trim());
        });
      });
      
      console.log('Table content:', tableContent);
    }
    
    // Check for any error messages
    const errorMessage = await page.$('.text-red-800');
    if (errorMessage) {
      const errorText = await page.evaluate(el => el.textContent, errorMessage);
      console.log('Error message found:', errorText);
    }
    
    // Check if "No line items found" message is shown
    const noItemsMessage = await page.$eval('td[colspan="4"]', el => el ? el.textContent : null).catch(() => null);
    if (noItemsMessage) {
      console.log('No items message:', noItemsMessage);
    }
    
    console.log('⏳ Waiting for additional logs and keeping browser open for inspection...');
    await page.waitForTimeout(5000);
    
  } catch (error) {
    console.error('❌ Error during debugging:', error);
  } finally {
    console.log('🏁 Debug session complete. Browser will stay open for manual inspection.');
    // Don't close browser automatically for manual inspection
    // await browser.close();
  }
}

debugInvoiceViewPage().catch(console.error);
