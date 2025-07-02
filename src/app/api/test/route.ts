import { NextRequest, NextResponse } from 'next/server';

// Simple test endpoint that bypasses all authentication
export async function GET() {
  return NextResponse.json({ 
    message: 'Test endpoint working!',
    timestamp: new Date().toISOString(),
    database_url_configured: !!process.env.DATABASE_URL,
    database_url_preview: process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 20) + '...' : 'Not set'
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    return NextResponse.json({ 
      message: 'POST test successful!',
      received: body,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({ 
      error: 'Invalid JSON',
      timestamp: new Date().toISOString()
    }, { status: 400 });
  }
}
