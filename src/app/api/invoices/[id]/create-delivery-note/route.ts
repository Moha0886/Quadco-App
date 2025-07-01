import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const invoiceId = params.id;

    // Fetch the invoice with all related data
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        customer: true,
        lineItems: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!invoice) {
      return NextResponse.json(
        { error: "Invoice not found" },
        { status: 404 }
      );
    }

    // Generate delivery number
    const deliveryCount = await prisma.deliveryNote.count();
    const deliveryNumber = `DN-${new Date().getFullYear()}-${String(deliveryCount + 1).padStart(3, "0")}`;

    // Create delivery note from invoice
    const deliveryNote = await prisma.deliveryNote.create({
      data: {
        customerId: invoice.customerId,
        invoiceId: invoice.id,
        deliveryNumber,
        date: new Date(),
        status: "pending",
        notes: `Delivery note for invoice ${invoice.invoiceNumber}`,
        lineItems: {
          create: invoice.lineItems.map((item) => ({
            productId: item.productId,
            itemType: 'product', // Default to product for now
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.total,
            description: item.description,
          })),
        },
      },
      include: {
        customer: true,
        invoice: true,
        lineItems: {
          include: {
            product: true,
          },
        },
      },
    });

    return NextResponse.json(deliveryNote, { status: 201 });
  } catch (error) {
    console.error("Failed to create delivery note from invoice:", error);
    return NextResponse.json(
      { error: "Failed to create delivery note from invoice" },
      { status: 500 }
    );
  }
}
