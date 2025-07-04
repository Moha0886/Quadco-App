import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(_request: Request) {
  try {
    const deliveryNotes = await prisma.deliveryNote.findMany({
      select: {
        id: true,
        deliveryNumber: true,
        customerId: true,
        invoiceId: true,
        date: true,
        deliveredDate: true,
        status: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            lineItems: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ deliveryNotes });
  } catch (error) {
    console.error('Delivery Notes GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customerId, invoiceId, notes } = body;

    if (!customerId) {
      return NextResponse.json(
        { error: 'Customer ID is required' },
        { status: 400 }
      );
    }

    // Generate delivery number
    const lastDeliveryNote = await prisma.deliveryNote.findFirst({
      orderBy: { createdAt: 'desc' },
    });
    
    const lastNumber = lastDeliveryNote?.deliveryNumber?.match(/DN-(\d+)$/)?.[1];
    const nextNumber = lastNumber ? parseInt(lastNumber) + 1 : 1;
    const deliveryNumber = `DN-${nextNumber.toString().padStart(4, '0')}`;

    const deliveryNote = await prisma.deliveryNote.create({
      data: {
        deliveryNumber,
        customerId,
        invoiceId,
        notes,
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            lineItems: true,
          },
        },
      },
    });

    return NextResponse.json({ deliveryNote }, { status: 201 });
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(_request: Request) {
  try {
    return NextResponse.json(
      { error: 'Route not yet implemented' },
      { status: 501 }
    );
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request) {
  try {
    return NextResponse.json(
      { error: 'Route not yet implemented' },
      { status: 501 }
    );
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
