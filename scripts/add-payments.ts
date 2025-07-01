import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Find an existing invoice to add payments to
  const invoice = await prisma.invoice.findFirst({
    where: {
      OR: [
        { status: 'sent' },
        { status: 'draft' }
      ]
    },
    include: {
      customer: true
    }
  });

  if (!invoice) {
    console.log('No invoice found. Please run the seed script first.');
    return;
  }

  // Update invoice status to sent if it's draft
  if (invoice.status === 'draft') {
    await prisma.invoice.update({
      where: { id: invoice.id },
      data: { status: 'sent' }
    });
    console.log(`Updated invoice ${invoice.invoiceNumber} status to 'sent'`);
  }

  console.log(`Adding payments for invoice ${invoice.invoiceNumber} (${invoice.total})`);

  // Create partial payment
  const payment1 = await (prisma as any).payment.create({
    data: {
      invoiceId: invoice.id,
      amount: 5000.00,
      paymentDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
      paymentMethod: 'Bank Transfer',
      reference: 'TXN-2025-001',
      notes: 'Partial payment received',
    },
  });

  // Create another partial payment
  const payment2 = await (prisma as any).payment.create({
    data: {
      invoiceId: invoice.id,
      amount: 3000.00,
      paymentDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      paymentMethod: 'Credit Card',
      reference: 'CC-2025-002',
      notes: 'Second partial payment',
    },
  });

  // Check total payments vs invoice total
  const totalPayments = 5000 + 3000;
  if (totalPayments >= invoice.total) {
    await prisma.invoice.update({
      where: { id: invoice.id },
      data: { status: 'paid' }
    });
    console.log('Invoice marked as paid');
  } else {
    console.log(`Outstanding balance: ${invoice.total - totalPayments}`);
  }

  // Create another customer and invoice for testing
  const customer2 = await prisma.customer.create({
    data: {
      name: 'TechStart LLC',
      email: 'finance@techstart.com',
      phone: '+1-555-987-6543',
      address: '456 Innovation Ave, Tech City, TC 54321',
      taxId: 'TAX987654321',
    },
  });

  const invoice2 = await prisma.invoice.create({
    data: {
      customerId: customer2.id,
      invoiceNumber: 'INV-2025-002',
      date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000), // 45 days ago
      dueDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago (overdue)
      status: 'sent',
      total: 8250.00,
      notes: 'Payment terms: Net 30 days.',
    } as any,
  });

  // Add line items for the second invoice
  await prisma.lineItem.create({
    data: {
      invoiceId: invoice2.id,
      itemType: 'service',
      quantity: 50,
      unitPrice: 150.00,
      taxRate: 10,
      taxAmount: 750.00,
      total: 8250.00,
      description: 'Consulting services - 50 hours',
    } as any,
  });

  // Create a fully paid invoice
  const invoice3 = await prisma.invoice.create({
    data: {
      customerId: customer2.id,
      invoiceNumber: 'INV-2025-003',
      date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), // 20 days ago
      dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
      status: 'paid',
      total: 3300.00,
      notes: 'Thank you for your prompt payment!',
    } as any,
  });

  // Add line item for the third invoice
  await prisma.lineItem.create({
    data: {
      invoiceId: invoice3.id,
      itemType: 'service',
      quantity: 20,
      unitPrice: 150.00,
      taxRate: 10,
      taxAmount: 300.00,
      total: 3300.00,
      description: 'Training workshop - 20 hours',
    } as any,
  });

  // Add full payment for the third invoice
  const payment3 = await (prisma as any).payment.create({
    data: {
      invoiceId: invoice3.id,
      amount: 3300.00,
      paymentDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
      paymentMethod: 'Bank Transfer',
      reference: 'TXN-2025-003',
      notes: 'Full payment received',
    },
  });

  console.log('Payment test data created successfully!');
  console.log(`Customer 1: ${invoice.customer.name}`);
  console.log(`  - Invoice ${invoice.invoiceNumber}: ₦${invoice.total} (${totalPayments >= invoice.total ? 'PAID' : 'PARTIAL'})`);
  console.log(`Customer 2: ${customer2.name}`);
  console.log(`  - Invoice ${invoice2.invoiceNumber}: ₦${invoice2.total} (OVERDUE)`);
  console.log(`  - Invoice ${invoice3.invoiceNumber}: ₦${invoice3.total} (PAID)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
