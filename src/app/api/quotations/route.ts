import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(_request: Request) {
  try {
    const quotations = await prisma.quotation.findMany({
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        lineItems: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ quotations });
  } catch (error) {
    console.error('Quotations GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customerId, validUntil, notes, lineItems = [], taxRate = 0 } = body;

    if (!customerId) {
      return NextResponse.json(
        { error: 'Customer ID is required' },
        { status: 400 }
      );
    }

    // Calculate totals
    let subtotal = 0;
    for (const item of lineItems) {
      subtotal += parseFloat(item.quantity || 0) * parseFloat(item.unitPrice || 0);
    }

    const taxAmount = (subtotal * parseFloat(taxRate)) / 100;
    const total = subtotal + taxAmount;

    const quotationData: any = {
      customerId,
      notes: notes || null,
      subtotal,
      taxRate: parseFloat(taxRate),
      taxAmount,
      total,
      status: 'DRAFT',
      currency: 'NGN',
    };

    if (validUntil) {
      quotationData.validUntil = new Date(validUntil);
    }

    const quotation = await prisma.quotation.create({
      data: quotationData,
    });

    // Create line items separately if any
    if (lineItems.length > 0) {
      await prisma.lineItem.createMany({
        data: lineItems.map((item: any) => ({
          quotationId: quotation.id,
          documentId: quotation.id,
          documentType: 'QUOTATION',
          itemType: item.itemType || 'PRODUCT',
          productId: item.productId || null,
          serviceId: item.serviceId || null,
          description: item.description || 'No description',
          quantity: parseFloat(item.quantity || 1),
          unitPrice: parseFloat(item.unitPrice || 0),
          total: parseFloat(item.quantity || 1) * parseFloat(item.unitPrice || 0),
        })),
      });
    }

    // Fetch the complete quotation with related data
    const completeQuotation = await prisma.quotation.findUnique({
      where: { id: quotation.id },
      include: {
        customer: true,
        lineItems: true,
      },
    });

    return NextResponse.json({ quotation: completeQuotation }, { status: 201 });
  } catch (error) {
    console.error('Quotations POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
