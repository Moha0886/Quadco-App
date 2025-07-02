import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const deliveryNoteId = context.params.id;

    const deliveryNote = await prisma.deliveryNote.findUnique({
      where: { id: deliveryNoteId },
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

    if (!deliveryNote) {
      return NextResponse.json(
        { error: "Delivery note not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(deliveryNote);
  } catch (error) {
    console.error("Failed to fetch delivery note:", error);
    return NextResponse.json(
      { error: "Failed to fetch delivery note" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const deliveryNoteId = params.id;
    const body = await request.json();
    const {
      deliveredDate,
      status,
      notes,
    } = body;

    const deliveryNote = await prisma.deliveryNote.update({
      where: { id: deliveryNoteId },
      data: {
        deliveredDate: deliveredDate ? new Date(deliveredDate) : null,
        status,
        notes,
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

    return NextResponse.json(deliveryNote);
  } catch (error) {
    console.error("Failed to update delivery note:", error);
    return NextResponse.json(
      { error: "Failed to update delivery note" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const deliveryNoteId = params.id;

    await prisma.deliveryNote.delete({
      where: { id: deliveryNoteId },
    });

    return NextResponse.json({ message: "Delivery note deleted successfully" });
  } catch (error) {
    console.error("Failed to delete delivery note:", error);
    return NextResponse.json(
      { error: "Failed to delete delivery note" },
      { status: 500 }
    );
  }
}
