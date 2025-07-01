import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const deliveryNotes = await prisma.deliveryNote.findMany({
      include: {
        customer: true,
        invoice: true,
        lineItems: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(deliveryNotes);
  } catch (error) {
    console.error("Failed to fetch delivery notes:", error);
    return NextResponse.json(
      { error: "Failed to fetch delivery notes" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      customerId,
      invoiceId,
      deliveryNumber,
      date,
      deliveredDate,
      status,
      notes,
      lineItems,
    } = body;

    // Create delivery note with line items
    const deliveryNote = await prisma.deliveryNote.create({
      data: {
        customerId,
        invoiceId,
        deliveryNumber,
        date: new Date(date),
        deliveredDate: deliveredDate ? new Date(deliveredDate) : null,
        status: status || "pending",
        notes,
        lineItems: {
          create: lineItems.map((item: any) => ({
            productId: item.productId,
            serviceId: item.serviceId,
            itemType: item.itemType,
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
    console.error("Failed to create delivery note:", error);
    return NextResponse.json(
      { error: "Failed to create delivery note" },
      { status: 500 }
    );
  }
}