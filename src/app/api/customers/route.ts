import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(_request: Request) {
  try {
    const customers = await prisma.customer.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        taxId: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            quotations: true,
            invoices: true,
            deliveryNotes: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ customers });
  } catch (error) {
    console.error('GET /api/customers error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, address, taxId } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: 'Customer name is required' },
        { status: 400 }
      );
    }

    const customer = await prisma.customer.create({
      data: {
        name,
        email,
        phone,
        address,
        taxId
      }
    });

    return NextResponse.json({ customer }, { status: 201 });
  } catch (error) {
    console.error('POST /api/customers error:', error);
    return NextResponse.json(
      { error: 'Failed to create customer' },
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
