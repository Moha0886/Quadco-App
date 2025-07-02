import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const invoiceId = params.id;

    // Verify invoice exists
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
    });

    if (!invoice) {
      return NextResponse.json(
        { error: "Invoice not found" },
        { status: 404 }
      );
    }

    // Fetch payments for this invoice
    const payments = await prisma.payment.findMany({
      where: { invoiceId },
      orderBy: { paymentDate: "desc" },
    });

    // Transform payments
    const transformedPayments = payments.map((payment) => ({
      id: payment.id,
      amount: payment.amount,
      paymentDate: payment.paymentDate.toISOString(),
      paymentMethod: payment.paymentMethod,
      reference: payment.reference,
      notes: payment.notes,
      createdAt: payment.createdAt.toISOString(),
      updatedAt: payment.updatedAt.toISOString(),
    }));

    return NextResponse.json(transformedPayments);
  } catch (error: unknown) {
    console.error("Error fetching invoice payments:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
