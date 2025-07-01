import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const invoiceId = params.id;

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

    return NextResponse.json(invoice);
  } catch (error) {
    console.error("Error fetching invoice:", error);
    return NextResponse.json(
      { error: "Failed to fetch invoice" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const invoiceId = params.id;
    const body = await request.json();
    const { customerId, dueDate, status, notes, lineItems } = body;

    // If only status is being updated (simple status change)
    if (status && !lineItems && !customerId && !dueDate && !notes) {
      const updatedInvoice = await prisma.invoice.update({
        where: { id: invoiceId },
        data: { status },
        include: {
          customer: true,
          lineItems: {
            include: {
              product: true,
            },
          },
        },
      });
      return NextResponse.json(updatedInvoice);
    }

    // Calculate total from line items
    const total = lineItems.reduce((sum: number, item: any) => sum + item.total, 0);

    // Update invoice with line items in a transaction
    const invoice = await prisma.$transaction(async (tx) => {
      // Update the invoice
      const updatedInvoice = await tx.invoice.update({
        where: { id: invoiceId },
        data: {
          customerId,
          dueDate: new Date(dueDate),
          status,
          notes,
          total,
        },
      });

      // Delete existing line items
      await tx.lineItem.deleteMany({
        where: { invoiceId },
      });

      // Create new line items
      for (const item of lineItems) {
        await tx.lineItem.create({
          data: {
            invoiceId: updatedInvoice.id,
            itemType: item.itemType,
            productId: item.productId || null,
            serviceId: item.serviceId || null,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.total,
            description: item.description,
          },
        } as any);
      }

      return updatedInvoice;
    });

    return NextResponse.json(invoice);
  } catch (error) {
    console.error("Error updating invoice:", error);
    return NextResponse.json(
      { error: "Failed to update invoice" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const invoiceId = params.id;

    await prisma.invoice.delete({
      where: { id: invoiceId },
    });

    return NextResponse.json({ message: "Invoice deleted successfully" });
  } catch (error) {
    console.error("Error deleting invoice:", error);
    return NextResponse.json(
      { error: "Failed to delete invoice" },
      { status: 500 }
    );
  }
}
