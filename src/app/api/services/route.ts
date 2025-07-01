import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth";

export const GET = requirePermission("services", "read")(async () => {
  try {
    const services = await prisma.service.findMany({
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { name: "asc" }
    });
    
    return NextResponse.json(services);
  } catch (error) {
    console.error("Error fetching services:", error);
    return NextResponse.json(
      { error: "Failed to fetch services" },
      { status: 500 }
    );
  }
});

export const POST = requirePermission("services", "create")(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { name, description, basePrice, unit, categoryId, isActive, taxable, taxRate } = body;

    if (!name || !basePrice || !categoryId) {
      return NextResponse.json(
        { error: "Name, base price, and category are required" },
        { status: 400 }
      );
    }

    const service = await prisma.service.create({
      data: {
        name,
        description,
        basePrice: parseFloat(basePrice),
        unit: unit || "hour",
        categoryId,
        isActive: isActive !== undefined ? isActive : true,
        taxable: Boolean(taxable),
        taxRate: taxable ? parseFloat(taxRate) || 0 : 0,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(service, { status: 201 });
  } catch (error) {
    console.error("Error creating service:", error);
    return NextResponse.json(
      { error: "Failed to create service" },
      { status: 500 }
    );
  }
});
