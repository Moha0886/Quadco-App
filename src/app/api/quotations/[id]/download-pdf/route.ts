import { NextRequest, NextResponse } from 'next/server';
import ReactPDF from '@react-pdf/renderer';
import { prisma } from '@/lib/prisma';
import QuotationPDF from '@/components/pdf/QuotationPDF';

type QuotationData = {
  id: string;
  date: string;
  validUntil: string;
  status: string;
  total: number;
  notes?: string;
  customer: {
    name: string;
    email: string;
    phone?: string;
    address?: string;
  };
  lineItems: Array<{
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
    itemType: 'product';
    product?: {
      name: string;
      unit: string;
    };
    service: undefined;
  }>;
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: quotationId } = await params;

    // Fetch quotation with all related data
    const quotation = await prisma.quotation.findUnique({
      where: { id: quotationId },
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
    const pdfData: QuotationData = {
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
    const pdfBuffer = await ReactPDF.renderToBuffer(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      QuotationPDF({ quotation: pdfData }) as any
    );

    // Create response with PDF buffer
    const response = new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="quotation-${quotation.id}.pdf"`,
        'Cache-Control': 'no-cache',
        'Content-Length': pdfBuffer.length.toString(),
      },
    });

    return response;
  } catch (error) {
    console.error('Error generating quotation PDF:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}
