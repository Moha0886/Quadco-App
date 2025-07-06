import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(_request: Request) {
  try {
    const roles = await prisma.role.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    return NextResponse.json({ roles });
  } catch (error) {
    console.error('Roles GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch roles' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: 'Role name is required' },
        { status: 400 }
      );
    }

    // Check if role already exists
    const existingRole = await prisma.role.findUnique({
      where: { name }
    });

    if (existingRole) {
      return NextResponse.json(
        { error: 'Role with this name already exists' },
        { status: 400 }
      );
    }

    // Create role
    const role = await prisma.role.create({
      data: {
        name,
        description: description || ''
      },
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true
      }
    });

    return NextResponse.json({ role }, { status: 201 });
  } catch (error) {
    console.error('Roles POST error:', error);
    return NextResponse.json(
      { error: 'Failed to create role' },
      { status: 500 }
    );
  }
}

export async function PUT(_request: Request) {
  try {
    return NextResponse.json(
      { error: 'Route not yet implemented' },
      { status: 501 }
    );
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request) {
  try {
    return NextResponse.json(
      { error: 'Route not yet implemented' },
      { status: 501 }
    );
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
