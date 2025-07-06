import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Transform database invoice to match frontend interface
function transformInvoice(invoice: any) {
  return {
    id: invoice.id,
    customerId: invoice.customerId,
    quotationId: invoice.quotationId,
    date: invoice.date,
    dueDate: invoice.dueDate,
    status: invoice.status,
    notes: invoice.notes,
    subtotal: parseFloat(invoice.subtotal),
    taxRate: parseFloat(invoice.taxRate),
    taxAmount: parseFloat(invoice.taxAmount),
    total: parseFloat(invoice.total),
    paidAmount: parseFloat(invoice.paidAmount),
    currency: invoice.currency,
    createdAt: invoice.createdAt,
    updatedAt: invoice.updatedAt,
    customer: invoice.customer ? {
      id: invoice.customer.id,
      name: invoice.customer.name,
      email: invoice.customer.email,
      phone: invoice.customer.phone,
      address: invoice.customer.address
    } : null,
    quotation: invoice.quotation ? {
      id: invoice.quotation.id,
      status: invoice.quotation.status,
      notes: invoice.quotation.notes
    } : null,
    lineItems: invoice.lineItems?.map((item: any) => ({
      id: item.id,
      itemType: item.itemType,
      productId: item.productId,
      serviceId: item.serviceId,
      description: item.description,
      quantity: parseFloat(item.quantity),
      unitPrice: parseFloat(item.unitPrice),
      discount: parseFloat(item.discount || 0),
      total: parseFloat(item.total),
      product: item.product,
      service: item.service
    })) || [],
    payments: invoice.payments?.map((payment: any) => ({
      id: payment.id,
      amount: parseFloat(payment.amount),
      method: payment.method,
      reference: payment.reference,
      date: payment.date,
      notes: payment.notes
    })) || [],
    _count: {
      lineItems: invoice._count?.lineItems || 0,
      payments: invoice._count?.payments || 0
    }
  };
}

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;

    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        customer: true,
        quotation: {
          select: {
            id: true,
            status: true,
            notes: true
          }
        },
        lineItems: {
          include: {
            product: true,
            service: true
          }
        },
        payments: true,
        _count: {
          select: {
            lineItems: true,
            payments: true
          }
        }
      }
    });

    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ invoice: transformInvoice(invoice) });
  } catch (error) {
    console.error('Error fetching invoice:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoice' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    // Calculate totals if line items are provided
    let calculatedTotals = {};
    if (body.lineItems) {
      const subtotal = body.lineItems.reduce((sum: number, item: any) => sum + parseFloat(item.total), 0);
      const taxRate = parseFloat(body.taxRate || 0);
      const taxAmount = subtotal * (taxRate / 100);
      const total = subtotal + taxAmount;

      calculatedTotals = {
        subtotal: subtotal,
        taxAmount: taxAmount,
        total: total
      };
    }

    const updateData: any = {
      ...(body.customerId && { customerId: body.customerId }),
      ...(body.date && { date: new Date(body.date) }),
      ...(body.dueDate && { dueDate: new Date(body.dueDate) }),
      ...(body.status && { status: body.status }),
      ...(body.notes !== undefined && { notes: body.notes }),
      ...(body.taxRate !== undefined && { taxRate: parseFloat(body.taxRate) }),
      ...calculatedTotals
    };

    // First, delete existing line items if updating
    if (body.lineItems) {
      await prisma.lineItem.deleteMany({
        where: {
          invoiceId: id
        }
      });
    }

    // Update the invoice
    const updatedInvoice = await prisma.invoice.update({
      where: { id },
      data: updateData
    });

    // Create new line items if provided
    if (body.lineItems) {
      await prisma.lineItem.createMany({
        data: body.lineItems.map((item: any) => ({
          itemType: item.itemType || 'CUSTOM',
          productId: item.productId || null,
          serviceId: item.serviceId || null,
          documentId: id,
          documentType: 'INVOICE',
          invoiceId: id,
          description: item.description,
          quantity: parseFloat(item.quantity),
          unitPrice: parseFloat(item.unitPrice),
          total: parseFloat(item.total)
        }))
      });
    }

    // Fetch the complete updated invoice
    const completeInvoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        customer: true,
        quotation: {
          select: {
            id: true,
            status: true,
            notes: true
          }
        },
        lineItems: {
          include: {
            product: true,
            service: true
          }
        },
        payments: true,
        _count: {
          select: {
            lineItems: true,
            payments: true
          }
        }
      }
    });

    return NextResponse.json({ invoice: transformInvoice(completeInvoice) });
  } catch (error) {
    console.error('Error updating invoice:', error);
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { error: 'Failed to update invoice', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;

    await prisma.invoice.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Invoice deleted successfully' });
  } catch (error) {
    console.error('Error deleting invoice:', error);
    return NextResponse.json(
      { error: 'Failed to delete invoice' },
      { status: 500 }
    );
  }
}
