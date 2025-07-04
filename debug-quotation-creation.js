#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function testQuotationCreation() {
  console.log('Testing quotation creation...');
  
  try {
    // First, let's check if we can connect to the database
    console.log('Checking database connection...');
    const customers = await prisma.customer.findMany({ take: 1 });
    console.log('Database connection OK. Found customers:', customers.length);
    
    if (customers.length === 0) {
      console.log('No customers found. Creating a test customer first...');
      const testCustomer = await prisma.customer.create({
        data: {
          name: 'Test Customer for Quotation',
          email: 'test@example.com',
          phone: '123-456-7890',
        }
      });
      console.log('Created test customer:', testCustomer.id);
      customers.push(testCustomer);
    }
    
    const customerId = customers[0].id;
    console.log('Using customer ID:', customerId);
    
    // Test minimal quotation creation
    console.log('Creating minimal quotation...');
    const quotationData = {
      customerId,
      notes: 'Test quotation from debug script',
      subtotal: 100.00,
      taxRate: 7.5,
      taxAmount: 7.5,
      total: 107.5,
      status: 'DRAFT',
      currency: 'NGN',
    };
    
    console.log('Quotation data:', quotationData);
    
    const quotation = await prisma.quotation.create({
      data: quotationData,
    });
    
    console.log('✅ Quotation created successfully:', quotation);
    
    // Test with line items
    console.log('Testing with line items...');
    
    const quotationWithItems = await prisma.quotation.create({
      data: {
        customerId,
        notes: 'Test quotation with line items',
        subtotal: 200.00,
        taxRate: 7.5,
        taxAmount: 15.0,
        total: 215.0,
        status: 'DRAFT',
        currency: 'NGN',
      },
    });
    
    console.log('Created quotation:', quotationWithItems.id);
    
    // Create line items
    await prisma.lineItem.createMany({
      data: [
        {
          quotationId: quotationWithItems.id,
          documentId: quotationWithItems.id,
          documentType: 'QUOTATION',
          itemType: 'PRODUCT',
          description: 'Test Product 1',
          quantity: 2,
          unitPrice: 50.00,
          total: 100.00,
        },
        {
          quotationId: quotationWithItems.id,
          documentId: quotationWithItems.id,
          documentType: 'QUOTATION',
          itemType: 'SERVICE',
          description: 'Test Service 1',
          quantity: 1,
          unitPrice: 100.00,
          total: 100.00,
        }
      ],
    });
    
    console.log('✅ Line items created successfully');
    
    // Fetch complete quotation
    const completeQuotation = await prisma.quotation.findUnique({
      where: { id: quotationWithItems.id },
      include: {
        customer: true,
        lineItems: true,
      },
    });
    
    console.log('✅ Complete quotation:', JSON.stringify(completeQuotation, null, 2));
    
  } catch (error) {
    console.error('❌ Error creating quotation:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta,
      stack: error.stack,
    });
  } finally {
    await prisma.$disconnect();
  }
}

testQuotationCreation();
