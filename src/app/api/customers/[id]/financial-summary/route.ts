import { NextResponse } from 'next/server';

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    // TODO: Implement financial summary functionality
    return NextResponse.json(
      { error: 'Financial summary functionality not yet implemented', customerId: id },
      { status: 501 }
    );
  } catch (error) {
    console.error('Financial summary error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}