import { NextResponse } from 'next/server';

export async function POST(_request: Request) {
  try {
    // For JWT-based auth, logout is handled on the client side
    // by removing the token from storage
    return NextResponse.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}