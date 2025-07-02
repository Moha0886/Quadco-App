import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const quotationId = params.id;

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
      return NextResponse.json(
        { error: "Quotation not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(quotation);
  } catch (error) {
    console.error("Error fetching quotation:", error);
    return NextResponse.json(
      { error: "Failed to fetch quotation" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const quotationId = params.id;
    const body = await request.json();
    const { customerId, validUntil, status, notes, lineItems } = body;

    // If only status is being updated (simple status change)
    if (status && !lineItems && !customerId && !validUntil && !notes) {
      const updatedQuotation = await prisma.quotation.update({
        where: { id: quotationId },
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
      return NextResponse.json(updatedQuotation);
    }

    // Calculate total from line items
    const total = lineItems.reduce((sum: number, item: { total: number }) => sum + item.total, 0);

    // Update quotation with line items in a transaction
    const quotation = await prisma.$transaction(async (tx) => {
      // Update the quotation
      const updatedQuotation = await tx.quotation.update({
        where: { id: quotationId },
        data: {
          customerId,
          validUntil: new Date(validUntil),
          status,
          notes,
          total,
        },
      });

      // Delete existing line items
      await tx.lineItem.deleteMany({
        where: { quotationId },
      });

      // Create new line items
      for (const item of lineItems) {
        await tx.lineItem.create({
          data: {
            quotationId: updatedQuotation.id,
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

      return updatedQuotation;
    });

    return NextResponse.json(quotation);
  } catch (error) {
    console.error("Error updating quotation:", error);
    return NextResponse.json(
      { error: "Failed to update quotation" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const quotationId = params.id;

    await prisma.quotation.delete({
      where: { id: quotationId },
    });

    return NextResponse.json({ message: "Quotation deleted successfully" });
  } catch (error) {
    console.error("Error deleting quotation:", error);
    return NextResponse.json(
      { error: "Failed to delete quotation" },
      { status: 500 }
    );
  }
}
