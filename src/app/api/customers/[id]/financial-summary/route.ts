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

    // Fetch customer invoices with payments
    const invoices = await prisma.invoice.findMany({
      where: { customerId },
      include: {
        payments: true,
      } as any,
    });

    let totalInvoiced = 0;
    let totalPaid = 0;
    let totalOutstanding = 0;
    let overdueAmount = 0;
    let invoiceCount = invoices.length;
    let paidInvoiceCount = 0;
    let overdueInvoiceCount = 0;
    let totalPaymentDays = 0;
    let paidInvoicesWithPaymentDate = 0;

    const now = new Date();

    for (const invoice of invoices) {
      totalInvoiced += invoice.total;
      
      const invoicePayments = (invoice as any).payments || [];
      const invoicePaid = invoicePayments.reduce((sum: number, payment: any) => sum + payment.amount, 0);
      totalPaid += invoicePaid;

      const outstanding = invoice.total - invoicePaid;
      totalOutstanding += outstanding;

      // Check if invoice is paid
      if (invoicePaid >= invoice.total) {
        paidInvoiceCount++;
        
        // Calculate payment days for paid invoices
        if (invoicePayments.length > 0) {
          const lastPaymentDate = new Date(Math.max(...invoicePayments.map((p: any) => new Date(p.paymentDate).getTime())));
          const invoiceDate = new Date(invoice.date);
          const paymentDays = Math.ceil((lastPaymentDate.getTime() - invoiceDate.getTime()) / (1000 * 60 * 60 * 24));
          totalPaymentDays += paymentDays;
          paidInvoicesWithPaymentDate++;
        }
      } else {
        // Check if invoice is overdue
        if (invoice.status !== "cancelled" && new Date(invoice.dueDate) < now) {
          overdueAmount += outstanding;
          overdueInvoiceCount++;
        }
      }
    }

    const averagePaymentDays = paidInvoicesWithPaymentDate > 0 
      ? Math.round(totalPaymentDays / paidInvoicesWithPaymentDate) 
      : 0;

    const financialSummary = {
      totalInvoiced,
      totalPaid,
      totalOutstanding,
      overdueAmount,
      averagePaymentDays,
      invoiceCount,
      paidInvoiceCount,
      overdueInvoiceCount,
    };

    return NextResponse.json(financialSummary);
  } catch (error) {
    console.error("Error fetching customer financial summary:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
