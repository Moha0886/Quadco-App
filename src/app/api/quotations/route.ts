import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateLineItemTotals, calculateDocumentTotals } from "@/lib/currency";
import { requirePermission } from "@/lib/auth";

export const GET = requirePermission("quotations", "read")(async () => {
  try {
    const quotations = await prisma.quotation.findMany({
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: { lineItems: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });
    
    return NextResponse.json(quotations);
  } catch (error) {
    console.error("Error fetching quotations:", error);
    return NextResponse.json(
      { error: "Failed to fetch quotations" },
      { status: 500 }
    );
  }
});

export const POST = requirePermission("quotations", "create")(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { customerId, validUntil, notes, lineItems } = body;

    if (!customerId || !validUntil || !lineItems || lineItems.length === 0) {
      return NextResponse.json(
        { error: "Customer, valid until date, and at least one line item are required" },
        { status: 400 }
      );
    }

    // Process line items with tax calculations
    const processedLineItems = await Promise.all(
      lineItems.map(async (item: {
        itemType: string;
        productId?: string;
        serviceId?: string;
        quantity: number;
        unitPrice: number;
        description?: string;
      }) => {
        let taxRate = 0;

        // Get tax rate from product or service
        if (item.itemType === 'product' && item.productId) {
          const product = await prisma.product.findUnique({
            where: { id: item.productId },
            select: { taxable: true, taxRate: true }
          });
          if (product?.taxable) {
            taxRate = product.taxRate || 0;
          }
        } else if (item.itemType === 'service' && item.serviceId) {
          const service = await prisma.service.findUnique({
            where: { id: item.serviceId },
            select: { taxable: true, taxRate: true }
          });
          if (service?.taxable) {
            taxRate = service.taxRate || 0;
          }
        }

        // Calculate totals with tax
        const totals = calculateLineItemTotals(item.quantity, item.unitPrice, taxRate);

        return {
          itemType: item.itemType,
          productId: item.productId || null,
          serviceId: item.serviceId || null,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          subtotal: totals.subtotal,
          taxRate: taxRate,
          taxAmount: totals.taxAmount,
          total: totals.total,
          description: item.description,
        };
      })
    );

    // Calculate document totals
    const documentTotals = calculateDocumentTotals(processedLineItems);

    const quotation = await prisma.quotation.create({
      data: {
        customerId,
        validUntil: new Date(validUntil),
        status: "draft",
        subtotal: documentTotals.subtotal,
        taxAmount: documentTotals.taxAmount,
        total: documentTotals.total,
        notes,
        lineItems: {
          create: processedLineItems,
        },
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        lineItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                unit: true,
              },
            },
            service: {
              select: {
                id: true,
                name: true,
                unit: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(quotation, { status: 201 });
  } catch (error) {
    console.error("Error creating quotation:", error);
    return NextResponse.json(
      { error: "Failed to create quotation" },
      { status: 500 }
    );
  }
});
