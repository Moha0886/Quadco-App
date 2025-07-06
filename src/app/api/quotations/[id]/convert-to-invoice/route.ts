import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    
    // Find the quotation with its line items
    const quotation = await prisma.quotation.findUnique({
      where: { id },
      include: {
        customer: true,
        lineItems: true
      }
    });
    
    if (!quotation) {
      return NextResponse.json(
        { error: 'Quotation not found' },
        { status: 404 }
      );
    }
    
    // Create the invoice from quotation data
    const invoice = await prisma.invoice.create({
      data: {
        customerId: quotation.customerId,
        quotationId: quotation.id,
        date: new Date(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        notes: quotation.notes || `Invoice generated from quotation`,
        subtotal: quotation.subtotal,
        taxRate: quotation.taxRate,
        taxAmount: quotation.taxAmount,
        total: quotation.total,
        currency: quotation.currency
      }
    });
    
    // Create line items for the invoice
    if (quotation.lineItems && quotation.lineItems.length > 0) {
      await prisma.lineItem.createMany({
        data: quotation.lineItems.map(item => ({
          itemType: item.itemType,
          documentId: invoice.id,
          documentType: 'INVOICE',
          invoiceId: invoice.id,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.total,
          productId: item.productId,
          serviceId: item.serviceId
        }))
      });
    }
    
    // Update quotation status to accepted
    await prisma.quotation.update({
      where: { id },
      data: { status: 'ACCEPTED' }
    });
    
    // Fetch the complete invoice with relations
    const completeInvoice = await prisma.invoice.findUnique({
      where: { id: invoice.id },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        lineItems: true,
        quotation: {
          select: {
            id: true,
            notes: true
          }
        }
      }
    });
    
    return NextResponse.json({ 
      message: 'Quotation converted to invoice successfully',
      invoice: completeInvoice 
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error converting quotation to invoice:', error);
    return NextResponse.json(
      { error: 'Failed to convert quotation to invoice' },
      { status: 500 }
    );
  }
}

