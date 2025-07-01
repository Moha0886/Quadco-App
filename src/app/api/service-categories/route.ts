import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth";

export const GET = requirePermission("services", "read")(async () => {
  try {
    const categories = await prisma.serviceCategory.findMany({
      include: {
        _count: {
          select: { services: true }
        }
      },
      orderBy: { name: "asc" }
    });
    
    return NextResponse.json(categories);
  } catch (error) {
    console.error("Error fetching service categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch service categories" },
      { status: 500 }
    );
  }
});

export const POST = requirePermission("services", "create")(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { name, description } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    const category = await prisma.serviceCategory.create({
      data: {
        name,
        description,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error("Error creating service category:", error);
    return NextResponse.json(
      { error: "Failed to create service category" },
      { status: 500 }
    );
  }
});
