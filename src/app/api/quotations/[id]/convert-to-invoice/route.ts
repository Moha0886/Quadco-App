import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const quotationId = params.id;

    // First, get the quotation with its line items
    const quotation = await prisma.quotation.findUnique({
      where: { id: quotationId },
      include: {
        lineItems: true,
        customer: true,
      },
    });

    if (!quotation) {
      return NextResponse.json(
        { error: "Quotation not found" },
        { status: 404 }
      );
    }

    // Check if invoice already exists for this quotation
    const existingInvoice = await prisma.invoice.findFirst({
      where: { quotationId },
    });

    if (existingInvoice) {
      return NextResponse.json(
        { error: "Invoice already exists for this quotation", invoiceId: existingInvoice.id },
        { status: 400 }
      );
    }

    // Generate unique invoice number
    const invoiceCount = await prisma.invoice.count();
    const invoiceNumber = `INV-${String(invoiceCount + 1).padStart(6, '0')}`;

    // Calculate due date (30 days from now)
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);

    // Create invoice with line items in a transaction
    const invoice = await prisma.$transaction(async (tx) => {
      // Create the invoice
      const newInvoice = await tx.invoice.create({
        data: {
          customerId: quotation.customerId,
          quotationId: quotation.id,
          invoiceNumber,
          dueDate,
          total: quotation.total,
          notes: quotation.notes,
          status: "draft",
        },
      });

      // Copy line items from quotation to invoice
      for (const lineItem of quotation.lineItems) {
        await tx.lineItem.create({
          data: {
            invoiceId: newInvoice.id,
            itemType: (lineItem as any).itemType,
            productId: (lineItem as any).productId,
            serviceId: (lineItem as any).serviceId,
            quantity: lineItem.quantity,
            unitPrice: lineItem.unitPrice,
            total: lineItem.total,
            description: lineItem.description,
          },
        });
      }

      // Update quotation status to 'accepted' since it's being converted to invoice
      await tx.quotation.update({
        where: { id: quotationId },
        data: { status: "accepted" },
      });

      return newInvoice;
    });

    return NextResponse.json(invoice, { status: 201 });
  } catch (error) {
    console.error("Error converting quotation to invoice:", error);
    return NextResponse.json(
      { error: "Failed to convert quotation to invoice" },
      { status: 500 }
    );
  }
}
