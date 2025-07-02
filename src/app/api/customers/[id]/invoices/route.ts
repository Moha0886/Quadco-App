import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const customerId = context.params.id;

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

    // Fetch customer invoices with line items
    const invoices = await prisma.invoice.findMany({
      where: { customerId },
      include: {
        lineItems: true,
        payments: true,
        quotation: {
          select: {
            id: true,
          },
        },
      },
      orderBy: { date: "desc" },
    });

    // Transform invoices to include computed fields
    const transformedInvoices = invoices.map((invoice) => {
      const totalPaid = (invoice.payments || []).reduce(
        (sum: number, payment) => sum + payment.amount,
        0
      );
      const outstanding = invoice.total - totalPaid;
      const isOverdue = 
        invoice.status !== "paid" && 
        invoice.status !== "cancelled" && 
        new Date(invoice.dueDate) < new Date();

      return {
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        date: invoice.date.toISOString(),
        dueDate: invoice.dueDate.toISOString(),
        status: isOverdue && invoice.status !== "paid" ? "overdue" : invoice.status,
        subtotal: invoice.subtotal,
        taxAmount: invoice.taxAmount,
        total: invoice.total,
        totalPaid,
        outstanding,
        quotationId: invoice.quotationId,
        createdAt: invoice.createdAt.toISOString(),
        updatedAt: invoice.updatedAt.toISOString(),
      };
    });

    return NextResponse.json(transformedInvoices);
  } catch (error) {
    console.error("Error fetching customer invoices:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
