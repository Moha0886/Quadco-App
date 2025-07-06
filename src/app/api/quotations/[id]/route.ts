import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const id = params.id;

    const quotation = await prisma.quotation.findUnique({
      where: { id },
      include: {
        customer: true,
        lineItems: true,
        _count: {
          select: { lineItems: true }
        }
      }
    });

    if (!quotation) {
      return NextResponse.json(
        { error: 'Quotation not found' },
        { status: 404 }
      );
    }

    // Transform the response to match the expected interface
    const transformedQuotation = {
      id: quotation.id,
      quotationNumber: `QUO-${quotation.id.slice(-8).toUpperCase()}`, // Generate from ID
      title: quotation.notes || `Quotation for ${quotation.customer.name}`, // Use notes or generate
      description: quotation.notes,
      status: quotation.status,
      customerId: quotation.customerId,
      total: Number(quotation.total),
      validUntil: quotation.validUntil?.toISOString() || new Date().toISOString(),
      createdAt: quotation.createdAt.toISOString(),
      updatedAt: quotation.updatedAt.toISOString(),
      customer: quotation.customer,
      lineItems: quotation.lineItems.map(item => ({
        id: item.id,
        description: item.description,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        total: Number(item.total)
      }))
    };

    return NextResponse.json(transformedQuotation);
  } catch (error) {
    console.error('Error fetching quotation:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quotation' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const id = params.id;
    const body = await request.json();
    const {
      title,
      description,
      status,
      customerId,
      total,
      validUntil
    } = body;

    // Check if quotation exists
    const existingQuotation = await prisma.quotation.findUnique({
      where: { id }
    });

    if (!existingQuotation) {
      return NextResponse.json(
        { error: 'Quotation not found' },
        { status: 404 }
      );
    }

    // Update quotation
    const updatedQuotation = await prisma.quotation.update({
      where: { id },
      data: {
        notes: description || title,
        status: status as any,
        customerId: customerId,
        total: parseFloat(total),
        validUntil: validUntil ? new Date(validUntil) : undefined,
        updatedAt: new Date()
      },
      include: {
        customer: true,
        lineItems: true,
        _count: {
          select: { lineItems: true }
        }
      }
    });

    // Transform the response
    const transformedQuotation = {
      id: updatedQuotation.id,
      quotationNumber: `QUO-${updatedQuotation.id.slice(-8).toUpperCase()}`,
      title: updatedQuotation.notes || `Quotation for ${updatedQuotation.customer.name}`,
      description: updatedQuotation.notes,
      status: updatedQuotation.status,
      customerId: updatedQuotation.customerId,
      total: Number(updatedQuotation.total),
      validUntil: updatedQuotation.validUntil?.toISOString() || new Date().toISOString(),
      createdAt: updatedQuotation.createdAt.toISOString(),
      updatedAt: updatedQuotation.updatedAt.toISOString(),
      customer: updatedQuotation.customer,
      lineItems: updatedQuotation.lineItems.map(item => ({
        id: item.id,
        description: item.description,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        total: Number(item.total)
      }))
    };

    return NextResponse.json(transformedQuotation);
  } catch (error) {
    console.error('Error updating quotation:', error);
    return NextResponse.json(
      { error: 'Failed to update quotation' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const id = params.id;

    // Check if quotation exists
    const existingQuotation = await prisma.quotation.findUnique({
      where: { id }
    });

    if (!existingQuotation) {
      return NextResponse.json(
        { error: 'Quotation not found' },
        { status: 404 }
      );
    }

    // Delete related line items first
    await prisma.lineItem.deleteMany({
      where: { 
        documentId: id,
        documentType: 'QUOTATION'
      }
    });

    // Delete quotation
    await prisma.quotation.delete({
      where: { id }
    });

    return NextResponse.json(
      { message: 'Quotation deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting quotation:', error);
    return NextResponse.json(
      { error: 'Failed to delete quotation' },
      { status: 500 }
    );
  }
}
