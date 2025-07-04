import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(_request: Request) {
  try {
    const invoices = await prisma.invoice.findMany({
      select: {
        id: true,
        customerId: true,
        quotationId: true,
        date: true,
        dueDate: true,
        status: true,
        notes: true,
        subtotal: true,
        taxAmount: true,
        total: true,
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
            payments: true,
            deliveryNotes: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ invoices });
  } catch (error) {
    console.error('Invoices GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    return NextResponse.json(
      { error: 'Invoice creation temporarily disabled - schema validation in progress' },
      { status: 501 }
    );
  } catch (error) {
    console.error('Invoices POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
