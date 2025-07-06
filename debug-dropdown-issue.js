const puppeteer = require('puppeteer');

async function debugDropdownIssue() {
  console.log('🚀 Starting dropdown debug session...');
  
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
      const args = msg.args();
      console.log(`[BROWSER ${type.toUpperCase()}]:`, msg.text());
    });
    
    // Listen to network requests
    page.on('response', response => {
      if (response.url().includes('/api/')) {
        console.log(`[NETWORK]: ${response.status()} ${response.url()}`);
      }
    });
    
    console.log('📖 Navigating to invoice creation page...');
    await page.goto('http://localhost:3000/invoices/new', { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });
    
    // Wait for the page to load completely
    await page.waitForTimeout(3000);
    
    console.log('🔍 Checking if dropdown exists...');
    const dropdownExists = await page.$('select');
    console.log('Dropdown found:', !!dropdownExists);
    
    if (dropdownExists) {
      console.log('📋 Getting dropdown options...');
      const options = await page.$$eval('select option', options => 
        options.map(option => ({
          value: option.value,
          text: option.textContent,
          disabled: option.disabled
        }))
      );
      
      console.log('Available options:', options);
      
      // Check optgroups
      const optgroups = await page.$$eval('select optgroup', optgroups => 
        optgroups.map(group => ({
          label: group.label,
          options: Array.from(group.querySelectorAll('option')).map(opt => ({
            value: opt.value,
            text: opt.textContent
          }))
        }))
      );
      
      console.log('Optgroups found:', optgroups);
    }
    
    // Check the React state by evaluating JavaScript
    console.log('🔍 Checking React component state...');
    const reactState = await page.evaluate(() => {
      // Try to access React dev tools if available
      if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
        const renderers = window.__REACT_DEVTOOLS_GLOBAL_HOOK__.renderers;
        if (renderers && renderers.size > 0) {
          console.log('React DevTools detected');
        }
      }
      
      // Check if the data is in window (sometimes components expose state for debugging)
      return {
        windowKeys: Object.keys(window).filter(key => key.includes('react') || key.includes('React')),
        hasReactDevTools: !!window.__REACT_DEVTOOLS_GLOBAL_HOOK__
      };
    });
    
    console.log('React state info:', reactState);
    
    // Wait a bit longer to see console logs
    console.log('⏳ Waiting for additional logs...');
    await page.waitForTimeout(5000);
    
  } catch (error) {
    console.error('❌ Error during debugging:', error);
  } finally {
    console.log('🏁 Debug session complete. Browser will stay open for manual inspection.');
    // Don't close browser automatically for manual inspection
    // await browser.close();
  }
}

debugDropdownIssue().catch(console.error);
