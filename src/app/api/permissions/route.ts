import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(_request: Request) {
  try {
    const permissions = await prisma.permission.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        resource: true,
        action: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            roles: true,
          },
        },
      },
      orderBy: [
        { resource: 'asc' },
        { action: 'asc' }
      ],
    });

    return NextResponse.json({ permissions });
  } catch (error) {
    console.error('Permissions GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { name, description, resource, action } = await request.json();

    if (!name || !resource || !action) {
      return NextResponse.json(
        { error: 'Name, resource, and action are required' },
        { status: 400 }
      );
    }

    const permission = await prisma.permission.create({
      data: {
        name,
        description,
        resource,
        action,
      },
    });

    return NextResponse.json({ permission });
  } catch (error) {
    console.error('Permissions POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
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
