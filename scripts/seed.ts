import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create a customer
  const customer = await prisma.customer.create({
    data: {
      name: 'Acme Corporation',
      email: 'procurement@acme.com',
      phone: '+1-555-123-4567',
      address: '123 Business St, Corporate City, CC 12345',
      taxId: 'TAX123456789',
    },
  });

  // Create some products
  const product1 = await prisma.product.create({
    data: {
      name: 'Professional Consultation',
      description: 'Business strategy consultation',
      price: 150.00,
      unit: 'hour',
      category: 'Services',
      stock: 100,
    },
  });

  const product2 = await prisma.product.create({
    data: {
      name: 'Project Management Software License',
      description: 'Annual software license',
      price: 2500.00,
      unit: 'license',
      category: 'Software',
      stock: 50,
    },
  });

  const product3 = await prisma.product.create({
    data: {
      name: 'Training Workshop',
      description: 'Team training workshop',
      price: 1650.00,
      unit: 'workshop',
      category: 'Training',
      stock: 20,
    },
  });

  // Create a quotation
  const quotation = await prisma.quotation.create({
    data: {
      customerId: customer.id,
      date: new Date(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      status: 'sent',
      total: 10150.00,
      notes: 'Thank you for considering our services. This quotation is valid for 30 days.',
    },
  });

  // Create line items for the quotation
  await prisma.lineItem.createMany({
    data: [
      {
        quotationId: quotation.id,
        productId: product1.id,
        itemType: 'product',
        quantity: 40,
        unitPrice: 150.00,
        total: 6000.00,
        description: '40 hours of business consultation',
      },
      {
        quotationId: quotation.id,
        productId: product2.id,
        itemType: 'product',
        quantity: 1,
        unitPrice: 2500.00,
        total: 2500.00,
        description: 'Annual software license',
      },
      {
        quotationId: quotation.id,
        productId: product3.id,
        itemType: 'product',
        quantity: 1,
        unitPrice: 1650.00,
        total: 1650.00,
        description: 'Team training workshop',
      },
    ],
  });

  // Create an invoice based on the quotation
  const invoice = await prisma.invoice.create({
    data: {
      customerId: customer.id,
      quotationId: quotation.id,
      invoiceNumber: 'INV-2025-001',
      date: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      status: 'sent',
      total: 10150.00,
      notes: 'Payment terms: Net 30 days. Thank you for your business!',
    },
  });

  // Create line items for the invoice (copy from quotation)
  await prisma.lineItem.createMany({
    data: [
      {
        invoiceId: invoice.id,
        productId: product1.id,
        itemType: 'product',
        quantity: 40,
        unitPrice: 150.00,
        total: 6000.00,
        description: '40 hours of business consultation',
      },
      {
        invoiceId: invoice.id,
        productId: product2.id,
        itemType: 'product',
        quantity: 1,
        unitPrice: 2500.00,
        total: 2500.00,
        description: 'Annual software license',
      },
      {
        invoiceId: invoice.id,
        productId: product3.id,
        itemType: 'product',
        quantity: 1,
        unitPrice: 1650.00,
        total: 1650.00,
        description: 'Team training workshop',
      },
    ],
  });

  console.log('Seed data created successfully!');
  console.log(`Customer: ${customer.name} (${customer.id})`);
  console.log(`Quotation: QUO-${quotation.id.slice(-6).toUpperCase()} (${quotation.id})`);
  console.log(`Invoice: ${invoice.invoiceNumber} (${invoice.id})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
