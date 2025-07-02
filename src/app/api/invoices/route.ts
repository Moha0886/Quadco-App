import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const invoices = await prisma.invoice.findMany({
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        quotation: {
          select: {
            id: true,
          },
        },
        _count: {
          select: {
            lineItems: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(invoices);
  } catch (error: unknown) {
    console.error("Error fetching invoices:", error);
    return NextResponse.json(
      { error: "Failed to fetch invoices" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerId, quotationId, dueDate, notes, lineItems } = body;

    // Generate unique invoice number
    const invoiceCount = await prisma.invoice.count();
    const invoiceNumber = `INV-${String(invoiceCount + 1).padStart(6, '0')}`;

    // Calculate total from line items
    const total = lineItems.reduce((sum: number, item: { total: number }) => sum + item.total, 0);

    // Create invoice with line items in a transaction
    const invoice = await prisma.$transaction(async (tx) => {
      // Create the invoice
      const newInvoice = await tx.invoice.create({
        data: {
          customerId,
          quotationId: quotationId || null,
          invoiceNumber,
          dueDate: new Date(dueDate),
          total,
          notes,
          status: "draft",
        },
      });

      // Create line items
      for (const item of lineItems) {
        await tx.lineItem.create({
          data: {
            invoiceId: newInvoice.id,
            itemType: item.itemType,
            productId: item.productId || null,
            serviceId: item.serviceId || null,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.total,
            description: item.description,
          },
        });
      }

      return newInvoice;
    });

    return NextResponse.json(invoice, { status: 201 });
  } catch (error: unknown) {
    console.error("Error creating invoice:", error);
    return NextResponse.json(
      { error: "Failed to create invoice" },
      { status: 500 }
    );
  }
}
