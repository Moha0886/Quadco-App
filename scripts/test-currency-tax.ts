import { PrismaClient } from '@prisma/client';
import { formatNaira, calculateLineItemTotals, NIGERIAN_TAX_RATES } from '../src/lib/currency';

const prisma = new PrismaClient();

async function testCurrencyAndTax() {
  console.log('=== Testing Currency & Tax Functionality ===\n');

  // Test currency formatting
  console.log('Currency Formatting:');
  console.log(`₦1000.50 formatted: ${formatNaira(1000.50)}`);
  console.log(`₦25000 formatted: ${formatNaira(25000)}`);
  console.log(`₦0 formatted: ${formatNaira(0)}`);

  // Test tax calculations
  console.log('\nTax Calculations:');
  const item1 = calculateLineItemTotals(2, 10000, NIGERIAN_TAX_RATES.VAT);
  console.log(`2 × ₦10,000 with VAT (7.5%):`, {
    subtotal: formatNaira(item1.subtotal),
    tax: formatNaira(item1.taxAmount),
    total: formatNaira(item1.total)
  });

  const item2 = calculateLineItemTotals(1, 5000, NIGERIAN_TAX_RATES.WHT_SERVICES);
  console.log(`1 × ₦5,000 with WHT Services (5%):`, {
    subtotal: formatNaira(item2.subtotal),
    tax: formatNaira(item2.taxAmount),
    total: formatNaira(item2.total)
  });

  // Test database queries
  console.log('\nDatabase Test:');
  try {
    const products = await prisma.product.findMany({
      where: { taxable: true },
      select: { name: true, price: true, taxable: true, taxRate: true }
    });
    
    console.log(`Found ${products.length} taxable products:`);
    products.forEach(product => {
      console.log(`- ${product.name}: ${formatNaira(product.price)} (Tax: ${product.taxRate}%)`);
    });

  } catch (error) {
    console.log('Database connection error:', error);
  }

  await prisma.$disconnect();
}

testCurrencyAndTax();
