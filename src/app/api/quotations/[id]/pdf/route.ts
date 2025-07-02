import { NextRequest, NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import React from 'react';
import { prisma } from '@/lib/prisma';
import QuotationPDF from '@/components/pdf/QuotationPDF';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;

    // Fetch quotation with all related data
    const quotation = await prisma.quotation.findUnique({
      where: { id },
      include: {
        customer: true,
        lineItems: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!quotation) {
      return NextResponse.json({ error: 'Quotation not found' }, { status: 404 });
    }

    // Transform data for PDF component
    const pdfData = {
      id: quotation.id,
      date: quotation.date.toISOString().split('T')[0],
      validUntil: quotation.validUntil.toISOString().split('T')[0],
      status: quotation.status,
      total: quotation.total,
      notes: quotation.notes || undefined,
      customer: {
        name: quotation.customer.name,
        email: quotation.customer.email,
        phone: quotation.customer.phone || undefined,
        address: quotation.customer.address || undefined,
      },
      lineItems: quotation.lineItems.map(item => ({
        id: item.id,
        description: item.description || '',
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.total,
        itemType: 'product' as const,
        product: item.product ? {
          name: item.product.name,
          unit: item.product.unit,
        } : undefined,
        service: undefined,
      })),
    };

    // Generate PDF buffer
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore: React-PDF type mismatch - component returns valid Document
    const pdfBuffer = await renderToBuffer(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      React.createElement(QuotationPDF, { quotation: pdfData }) as any
    );
    
    // Return PDF with appropriate headers
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="quotation-${quotation.id}.pdf"`,
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('Error generating quotation PDF:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}
