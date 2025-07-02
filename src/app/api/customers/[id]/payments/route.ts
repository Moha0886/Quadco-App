import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const customerId = params.id;

    // Verify customer exists
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    // Fetch customer payments through invoices
    const payments = await prisma.payment.findMany({
      where: {
        invoice: {
          customerId: customerId,
        },
      },
      include: {
        invoice: {
          select: {
            invoiceNumber: true,
            id: true,
          },
        },
      },
      orderBy: { paymentDate: "desc" },
    });

    // Transform payments
    const transformedPayments = payments.map((payment) => ({
      id: payment.id,
      invoiceId: payment.invoiceId,
      amount: payment.amount,
      paymentDate: payment.paymentDate.toISOString(),
      paymentMethod: payment.paymentMethod,
      reference: payment.reference,
      notes: payment.notes,
      invoice: {
        invoiceNumber: payment.invoice.invoiceNumber,
      },
      createdAt: payment.createdAt.toISOString(),
      updatedAt: payment.updatedAt.toISOString(),
    }));

    return NextResponse.json(transformedPayments);
  } catch (error) {
    console.error("Error fetching customer payments:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const customerId = params.id;
    const body = await request.json();

    // Verify customer exists
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    // Verify invoice belongs to customer
    const invoice = await prisma.invoice.findFirst({
      where: {
        id: body.invoiceId,
        customerId: customerId,
      },
    });

    if (!invoice) {
      return NextResponse.json(
        { error: "Invoice not found or doesn't belong to customer" },
        { status: 404 }
      );
    }

    // Create payment
    const payment = await prisma.payment.create({
      data: {
        invoiceId: body.invoiceId,
        amount: body.amount,
        paymentDate: body.paymentDate ? new Date(body.paymentDate) : new Date(),
        paymentMethod: body.paymentMethod,
        reference: body.reference,
        notes: body.notes,
      },
      include: {
        invoice: {
          select: {
            invoiceNumber: true,
          },
        },
      },
    });

    // Check if invoice is fully paid and update status
    const totalPayments = await prisma.payment.aggregate({
      where: { invoiceId: body.invoiceId },
      _sum: { amount: true },
    });

    const totalPaid = totalPayments._sum.amount || 0;
    if (totalPaid >= invoice.total) {
      await prisma.invoice.update({
        where: { id: body.invoiceId },
        data: { status: "paid" },
      });
    }

    return NextResponse.json({
      id: payment.id,
      invoiceId: payment.invoiceId,
      amount: payment.amount,
      paymentDate: payment.paymentDate.toISOString(),
      paymentMethod: payment.paymentMethod,
      reference: payment.reference,
      notes: payment.notes,
      invoice: {
        invoiceNumber: payment.invoice.invoiceNumber,
      },
      createdAt: payment.createdAt.toISOString(),
      updatedAt: payment.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error("Error creating payment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
