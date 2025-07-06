#!/usr/bin/env node

/**
 * Test script to verify invoice edit functionality
 * Tests API endpoints and data flow for invoice editing
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testInvoiceEdit() {
  console.log('🧪 Testing Invoice Edit Functionality...\n');
  
  try {
    // 1. Create a test customer if not exists
    console.log('1. Setting up test customer...');
    let customer = await prisma.customer.findFirst({
      where: { email: 'test-edit@example.com' }
    });
    
    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          name: 'Test Customer for Edit',
          email: 'test-edit@example.com',
          phone: '555-0123',
          address: '123 Test Street, Test City, TC 12345'
        }
      });
    }
    console.log(`✅ Customer ready: ${customer.name} (${customer.id})`);

    // 2. Create a test product and service
    console.log('\n2. Setting up test product and service...');
    let product = await prisma.product.findFirst({
      where: { name: 'Test Product for Edit' }
    });
    
    if (!product) {
      product = await prisma.product.create({
        data: {
          name: 'Test Product for Edit',
          description: 'A test product for edit functionality',
          price: 100.00,
          unit: 'piece',
          category: 'Test Category',
          stock: 50
        }
      });
    }

    let service = await prisma.service.findFirst({
      where: { name: 'Test Service for Edit' }
    });
    
    if (!service) {
      service = await prisma.service.create({
        data: {
          name: 'Test Service for Edit',
          description: 'A test service for edit functionality',
          basePrice: 150.00,
          unit: 'hour'
        }
      });
    }
    console.log(`✅ Product ready: ${product.name} (${product.id})`);
    console.log(`✅ Service ready: ${service.name} (${service.id})`);

    // 3. Create a test invoice
    console.log('\n3. Creating test invoice...');
    const invoice = await prisma.invoice.create({
      data: {
        customerId: customer.id,
        date: new Date('2024-01-15'),
        dueDate: new Date('2024-02-15'),
        status: 'DRAFT',
        notes: 'Original test invoice',
        taxRate: 10.0,
        subtotal: 250.00,
        taxAmount: 25.00,
        total: 275.00
      }
    });

    // Add line items after invoice creation
    await prisma.lineItem.createMany({
      data: [
        {
          itemType: 'PRODUCT',
          productId: product.id,
          documentId: invoice.id,
          documentType: 'INVOICE',
          invoiceId: invoice.id,
          description: 'Test Product for Edit',
          quantity: 1,
          unitPrice: 100.00,
          total: 100.00
        },
        {
          itemType: 'SERVICE',
          serviceId: service.id,
          documentId: invoice.id,
          documentType: 'INVOICE',
          invoiceId: invoice.id,
          description: 'Test Service for Edit',
          quantity: 1,
          unitPrice: 150.00,
          total: 150.00
        }
      ]
    });

    // Get the complete invoice with line items
    const completeInvoice = await prisma.invoice.findUnique({
      where: { id: invoice.id },
      include: {
        customer: true,
        lineItems: {
          include: {
            product: true,
            service: true
          }
        }
      }
    });

    console.log(`✅ Invoice created: ${invoice.id}`);

    // 4. Test GET invoice endpoint
    console.log('\n4. Testing GET invoice endpoint...');
    const getResponse = await fetch(`http://localhost:3000/api/invoices/${invoice.id}`);
    if (getResponse.ok) {
      const getData = await getResponse.json();
      console.log('✅ GET invoice successful');
      console.log(`   Status: ${getData.invoice.status}`);
      console.log(`   Total: $${getData.invoice.total}`);
      console.log(`   Line Items: ${getData.invoice.lineItems.length}`);
    } else {
      console.error('❌ GET invoice failed:', getResponse.status);
    }

    // 5. Test PUT invoice endpoint
    console.log('\n5. Testing PUT invoice endpoint...');
    const updateData = {
      customerId: customer.id,
      date: '2024-01-20',
      dueDate: '2024-02-20',
      status: 'SENT',
      notes: 'Updated test invoice with new items',
      taxRate: '12.5',
      lineItems: [
        {
          itemType: 'PRODUCT',
          productId: product.id,
          description: 'Updated Test Product',
          quantity: 2,
          unitPrice: 100.00,
          total: 200.00
        },
        {
          itemType: 'SERVICE',
          serviceId: service.id,
          description: 'Updated Test Service',
          quantity: 1.5,
          unitPrice: 150.00,
          total: 225.00
        },
        {
          itemType: 'CUSTOM',
          description: 'Custom line item',
          quantity: 1,
          unitPrice: 75.00,
          total: 75.00
        }
      ]
    };

    const putResponse = await fetch(`http://localhost:3000/api/invoices/${invoice.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData)
    });

    if (putResponse.ok) {
      const putData = await putResponse.json();
      console.log('✅ PUT invoice successful');
      console.log(`   Status: ${putData.invoice.status}`);
      console.log(`   Total: $${putData.invoice.total}`);
      console.log(`   Line Items: ${putData.invoice.lineItems.length}`);
      console.log(`   Tax Rate: ${putData.invoice.taxRate}%`);
    } else {
      const errorData = await putResponse.json();
      console.error('❌ PUT invoice failed:', putResponse.status, errorData);
    }

    // 6. Verify the update worked
    console.log('\n6. Verifying update in database...');
    const updatedInvoice = await prisma.invoice.findUnique({
      where: { id: invoice.id },
      include: {
        customer: true,
        lineItems: {
          include: {
            product: true,
            service: true
          }
        }
      }
    });

    if (updatedInvoice) {
      console.log('✅ Database verification successful');
      console.log(`   Status: ${updatedInvoice.status}`);
      console.log(`   Total: $${updatedInvoice.total}`);
      console.log(`   Line Items: ${updatedInvoice.lineItems.length}`);
      console.log(`   Tax Rate: ${updatedInvoice.taxRate}%`);
      console.log(`   Notes: ${updatedInvoice.notes}`);
      
      // Check line items
      updatedInvoice.lineItems.forEach((item, index) => {
        console.log(`   Item ${index + 1}: ${item.description} (${item.quantity} x $${item.unitPrice} = $${item.total})`);
      });
    } else {
      console.error('❌ Database verification failed - invoice not found');
    }

    // 7. Test data consistency
    console.log('\n7. Testing data consistency...');
    const expectedSubtotal = 200.00 + 225.00 + 75.00; // 500.00
    const expectedTaxAmount = expectedSubtotal * (12.5 / 100); // 62.50
    const expectedTotal = expectedSubtotal + expectedTaxAmount; // 562.50

    if (Math.abs(updatedInvoice.subtotal - expectedSubtotal) < 0.01) {
      console.log('✅ Subtotal calculation correct');
    } else {
      console.error(`❌ Subtotal mismatch: expected ${expectedSubtotal}, got ${updatedInvoice.subtotal}`);
    }

    if (Math.abs(updatedInvoice.taxAmount - expectedTaxAmount) < 0.01) {
      console.log('✅ Tax amount calculation correct');
    } else {
      console.error(`❌ Tax amount mismatch: expected ${expectedTaxAmount}, got ${updatedInvoice.taxAmount}`);
    }

    if (Math.abs(updatedInvoice.total - expectedTotal) < 0.01) {
      console.log('✅ Total calculation correct');
    } else {
      console.error(`❌ Total mismatch: expected ${expectedTotal}, got ${updatedInvoice.total}`);
    }

    // 8. Test field updates
    console.log('\n8. Testing field updates...');
    const testChecks = [
      { field: 'status', expected: 'SENT', actual: updatedInvoice.status },
      { field: 'taxRate', expected: 12.5, actual: updatedInvoice.taxRate },
      { field: 'notes', expected: 'Updated test invoice with new items', actual: updatedInvoice.notes },
      { field: 'lineItems count', expected: 3, actual: updatedInvoice.lineItems.length }
    ];

    testChecks.forEach(check => {
      if (check.actual === check.expected) {
        console.log(`✅ ${check.field} updated correctly`);
      } else {
        console.error(`❌ ${check.field} mismatch: expected ${check.expected}, got ${check.actual}`);
      }
    });

    // 9. Clean up test data
    console.log('\n9. Cleaning up test data...');
    await prisma.invoice.delete({
      where: { id: invoice.id }
    });
    console.log('✅ Test invoice deleted');

    console.log('\n🎉 Invoice Edit Functionality Test Complete!\n');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testInvoiceEdit().catch(console.error);
