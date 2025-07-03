import { NextResponse } from 'next/server';

export async function GET(_request: Request) {
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

export async function POST(_request: Request) {
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
