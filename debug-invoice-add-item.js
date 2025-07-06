/**
 * Debug script to check the invoice new page functionality
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Debugging Invoice New Page - Add Item Functionality\n');

// Read the invoice new page file
const invoicePagePath = '/Users/muhammadilu/quadco-app/src/app/invoices/new/page.tsx';

try {
  const content = fs.readFileSync(invoicePagePath, 'utf8');
  
  console.log('📋 Checking key functionality in the React component:\n');
  
  // Check for the addLineItem function
  const addItemFunctionMatch = content.match(/const addLineItem = \(\) => \{[\s\S]*?\};/);
  if (addItemFunctionMatch) {
    console.log('✅ addLineItem function found:');
    console.log(addItemFunctionMatch[0]);
    console.log('');
  } else {
    console.log('❌ addLineItem function not found');
  }
  
  // Check for the onClick handler
  const onClickMatch = content.match(/onClick=\{addLineItem\}/);
  if (onClickMatch) {
    console.log('✅ onClick={addLineItem} handler found');
  } else {
    console.log('❌ onClick={addLineItem} handler not found');
  }
  
  // Check for the Add Item button
  const addButtonMatch = content.match(/<button[\s\S]*?Add Item[\s\S]*?<\/button>/);
  if (addButtonMatch) {
    console.log('✅ Add Item button found:');
    // Show a cleaned version
    const buttonText = addButtonMatch[0]
      .replace(/\s+/g, ' ')
      .substring(0, 200) + '...';
    console.log(buttonText);
    console.log('');
  } else {
    console.log('❌ Add Item button not found');
  }
  
  // Check for handleLineItemChange function
  const handleChangeMatch = content.match(/const handleLineItemChange = [\s\S]*?\};/);
  if (handleChangeMatch) {
    console.log('✅ handleLineItemChange function found');
  } else {
    console.log('❌ handleLineItemChange function not found');
  }
  
  // Check for useState with lineItems
  const useStateMatch = content.match(/const \[lineItems, setLineItems\] = useState<LineItem\[\]>/);
  if (useStateMatch) {
    console.log('✅ lineItems useState hook found');
  } else {
    console.log('❌ lineItems useState hook not found');
  }
  
  // Check for correct interface
  const interfaceMatch = content.match(/interface LineItem \{[\s\S]*?\}/);
  if (interfaceMatch) {
    console.log('✅ LineItem interface found:');
    console.log(interfaceMatch[0]);
    console.log('');
  } else {
    console.log('❌ LineItem interface not found');
  }
  
  console.log('🎯 Next Steps to Test:');
  console.log('1. Open http://localhost:3000/invoices/new in your browser');
  console.log('2. Open browser developer tools (F12)');
  console.log('3. Check the Console tab for any JavaScript errors');
  console.log('4. Try clicking the "Add Item" button');
  console.log('5. Verify that a new line item row appears');
  console.log('6. Fill in description, quantity, and unit price');
  console.log('7. Verify that the amount calculates automatically');
  
} catch (error) {
  console.error('❌ Error reading file:', error);
}
