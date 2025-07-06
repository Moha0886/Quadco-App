import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Transform database delivery note to match frontend interface
function transformDeliveryNote(deliveryNote: any) {
  return {
    id: deliveryNote.id,
    deliveryNumber: deliveryNote.deliveryNumber,
    customerId: deliveryNote.customerId,
    invoiceId: deliveryNote.invoiceId,
    date: deliveryNote.date,
    deliveredDate: deliveryNote.deliveredDate,
    status: deliveryNote.status,
    notes: deliveryNote.notes,
    createdAt: deliveryNote.createdAt,
    updatedAt: deliveryNote.updatedAt,
    customer: deliveryNote.customer ? {
      id: deliveryNote.customer.id,
      name: deliveryNote.customer.name,
      email: deliveryNote.customer.email,
      phone: deliveryNote.customer.phone,
      address: deliveryNote.customer.address
    } : null,
    invoice: deliveryNote.invoice ? {
      id: deliveryNote.invoice.id,
      total: parseFloat(deliveryNote.invoice.total),
      status: deliveryNote.invoice.status
    } : null,
    lineItems: deliveryNote.lineItems?.map((item: any) => ({
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
    _count: {
      lineItems: deliveryNote._count?.lineItems || 0
    }
  };
}

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;

    const deliveryNote = await prisma.deliveryNote.findUnique({
      where: { id },
      include: {
        customer: true,
        invoice: {
          select: {
            id: true,
            total: true,
            status: true
          }
        },
        lineItems: {
          include: {
            product: true,
            service: true
          }
        },
        _count: {
          select: {
            lineItems: true
          }
        }
      }
    });

    if (!deliveryNote) {
      return NextResponse.json(
        { error: 'Delivery note not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ deliveryNote: transformDeliveryNote(deliveryNote) });
  } catch (error) {
    console.error('Error fetching delivery note:', error);
    return NextResponse.json(
      { error: 'Failed to fetch delivery note' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    // First, update the delivery note basic fields
    const updatedDeliveryNote = await prisma.deliveryNote.update({
      where: { id },
      data: {
        customerId: body.customerId,
        status: body.status,
        notes: body.notes,
        deliveredDate: body.deliveredDate ? new Date(body.deliveredDate) : null,
      }
    });

    // Handle line items update if provided
    if (body.lineItems) {
      // Delete existing line items for this delivery note
      await prisma.lineItem.deleteMany({
        where: { deliveryNoteId: id }
      });

      // Create new line items
      if (body.lineItems.length > 0) {
        await prisma.lineItem.createMany({
          data: body.lineItems.map((item: any) => {
            const quantity = parseFloat(item.quantity) || 0;
            const unitPrice = parseFloat(item.unitPrice) || 0;
            const total = quantity * unitPrice;
            
            return {
              itemType: item.itemType,
              productId: item.productId || null,
              serviceId: item.serviceId || null,
              documentId: id,
              documentType: 'DELIVERY_NOTE',
              deliveryNoteId: id,
              description: item.description,
              quantity: quantity,
              unitPrice: unitPrice,
              total: total
            };
          })
        });
      }
    }

    // Fetch the updated delivery note with all relations
    const finalDeliveryNote = await prisma.deliveryNote.findUnique({
      where: { id },
      include: {
        customer: true,
        invoice: {
          select: {
            id: true,
            total: true,
            status: true
          }
        },
        lineItems: {
          include: {
            product: true,
            service: true
          }
        },
        _count: {
          select: {
            lineItems: true
          }
        }
      }
    });

    return NextResponse.json({ deliveryNote: transformDeliveryNote(finalDeliveryNote) });
  } catch (error) {
    console.error('Error updating delivery note:', error);
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { error: 'Failed to update delivery note', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;

    await prisma.deliveryNote.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Delivery note deleted successfully' });
  } catch (error) {
    console.error('Error deleting delivery note:', error);
    return NextResponse.json(
      { error: 'Failed to delete delivery note' },
      { status: 500 }
    );
  }
}
