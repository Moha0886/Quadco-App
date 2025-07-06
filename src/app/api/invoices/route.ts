import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const search = url.searchParams.get('search') || '';
    const status = url.searchParams.get('status') || '';

    const skip = (page - 1) * limit;

    // Build where clause for filtering
    const whereClause: any = {};
    
    if (search) {
      whereClause.OR = [
        { customer: { name: { contains: search, mode: 'insensitive' } } },
        { customer: { email: { contains: search, mode: 'insensitive' } } },
        { notes: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (status && status !== 'All') {
      whereClause.status = status;
    }

    // Get total count for pagination
    const totalCount = await prisma.invoice.count({
      where: whereClause,
    });

    const invoices = await prisma.invoice.findMany({
      where: whereClause,
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
      skip,
      take: limit,
    });

    // Transform the data to match frontend expectations
    const transformedInvoices = invoices.map((invoice, index) => ({
      id: invoice.id,
      invoiceNumber: `INV-${String(Date.now() + index).slice(-8).toUpperCase()}`, // Generate invoice number
      customerId: invoice.customerId,
      quotationId: invoice.quotationId,
      total: parseFloat(invoice.total.toString()),
      taxAmount: parseFloat(invoice.taxAmount.toString()),
      status: invoice.status,
      issueDate: invoice.date.toISOString().split('T')[0], // Convert to YYYY-MM-DD format
      dueDate: invoice.dueDate ? invoice.dueDate.toISOString().split('T')[0] : null,
      createdAt: invoice.createdAt.toISOString(),
      updatedAt: invoice.updatedAt.toISOString(),
      customer: invoice.customer,
      _count: invoice._count,
    }));

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({ 
      invoices: transformedInvoices,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      }
    });
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
    const { customerId, date, dueDate, notes, taxRate, lineItems } = body;

    // Validate required fields
    if (!customerId || !lineItems || lineItems.length === 0) {
      return NextResponse.json(
        { error: 'Customer and line items are required' },
        { status: 400 }
      );
    }

    // Calculate totals
    const subtotal = lineItems.reduce((sum: number, item: any) => sum + (item.quantity * item.unitPrice), 0);
    const taxAmount = (subtotal * (parseFloat(taxRate) || 0)) / 100;
    const total = subtotal + taxAmount;

    // Create invoice first, then add line items
    const invoice = await prisma.invoice.create({
      data: {
        customerId,
        date: date ? new Date(date) : new Date(),
        dueDate: dueDate ? new Date(dueDate) : null,
        notes: notes || '',
        subtotal,
        taxRate: parseFloat(taxRate) || 0,
        taxAmount,
        total
      }
    });

    // Create line items with the invoice ID
    if (lineItems && lineItems.length > 0) {
      await prisma.lineItem.createMany({
        data: lineItems.map((item: any) => {
          // Determine item type and IDs based on selectedItemType
          let itemType = 'PRODUCT';
          let productId = null;
          let serviceId = null;
          
          if (item.selectedItemType === 'product' && item.selectedItemId) {
            itemType = 'PRODUCT';
            productId = item.selectedItemId;
          } else if (item.selectedItemType === 'service' && item.selectedItemId) {
            itemType = 'SERVICE';
            serviceId = item.selectedItemId;
          }
          
          return {
            itemType,
            documentId: invoice.id,
            documentType: 'INVOICE',
            invoiceId: invoice.id,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.quantity * item.unitPrice,
            productId,
            serviceId
          };
        })
      });
    }

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
        lineItems: true
      }
    });

    return NextResponse.json({ invoice: completeInvoice }, { status: 201 });
  } catch (error) {
    console.error('Invoices POST error:', error);
    return NextResponse.json(
      { error: 'Failed to create invoice' },
      { status: 500 }
    );
  }
}
