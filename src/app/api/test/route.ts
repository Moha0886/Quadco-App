import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Test database connection
    const userCount = await prisma.user.count();
    const roleCount = await prisma.role.count();
    const customerCount = await prisma.customer.count();
    
    return NextResponse.json({
      message: 'Test endpoint working!',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      database: {
        connected: true,
        users: userCount,
        roles: roleCount,
        customers: customerCount,
      }
    });
  } catch (err) {
    console.error('Test endpoint error:', err);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        database: { connected: false },
        details: err instanceof Error ? err.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    return NextResponse.json({
      message: 'Test POST endpoint working!',
      receivedData: body,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('Test POST endpoint error:', err);
    return NextResponse.json(
      { error: 'Invalid JSON' },
      { status: 400 }
    );
  }
}
