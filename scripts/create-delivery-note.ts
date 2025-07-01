import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createDeliveryNote() {
  try {
    // Get the first customer and invoice
    const customer = await prisma.customer.findFirst();
    const invoice = await prisma.invoice.findFirst({
      include: {
        lineItems: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!customer || !invoice) {
      console.log('No customer or invoice found. Please create some test data first.');
      return;
    }

    // Create delivery note
    const deliveryNote = await prisma.deliveryNote.create({
      data: {
        customerId: customer.id,
        invoiceId: invoice.id,
        deliveryNumber: 'DN-2025-001',
        date: new Date(),
        status: 'pending',
        notes: 'Standard delivery - Please inspect items upon receipt.',
        lineItems: {
          create: invoice.lineItems.map((item) => ({
            productId: item.productId,
            itemType: 'product',
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.total,
            description: item.description,
          })),
        },
      },
      include: {
        customer: true,
        invoice: true,
        lineItems: {
          include: {
            product: true,
          },
        },
      },
    });

    console.log('Delivery note created successfully!');
    console.log(`Delivery Note: ${deliveryNote.deliveryNumber} (${deliveryNote.id})`);
    console.log(`Customer: ${deliveryNote.customer.name}`);
    console.log(`Invoice: ${deliveryNote.invoice?.invoiceNumber}`);
    console.log(`Items: ${deliveryNote.lineItems.length}`);

  } catch (error) {
    console.error('Error creating delivery note:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createDeliveryNote();
