#!/bin/bash

# Script to add basic route implementations to empty files

# List of empty files to fix
FILES=(
  "src/app/api/customers/route.ts"
  "src/app/api/customers/[id]/payments/route.ts"
  "src/app/api/customers/[id]/invoices/route.ts"
  "src/app/api/customers/[id]/route.ts"
  "src/app/api/products/route.ts"
  "src/app/api/invoices/route.ts"
  "src/app/api/invoices/[id]/payments/route.ts"
  "src/app/api/invoices/[id]/create-delivery-note/route.ts"
  "src/app/api/invoices/[id]/route.ts"
  "src/app/api/service-categories/route.ts"
  "src/app/api/roles/route.ts"
  "src/app/api/roles/[id]/route.ts"
  "src/app/api/permissions/route.ts"
  "src/app/api/permissions/[id]/route.ts"
  "src/app/api/users/route.ts"
  "src/app/api/users/[id]/route.ts"
  "src/app/api/quotations/route.ts"
  "src/app/api/quotations/[id]/pdf/route.ts"
  "src/app/api/quotations/[id]/route.ts"
  "src/app/api/quotations/[id]/convert-to-invoice/route.ts"
  "src/app/api/quotations/[id]/download-pdf/route.ts"
  "src/app/api/delivery-notes/route.ts"
  "src/app/api/delivery-notes/[id]/route.ts"
  "src/app/api/services/route.ts"
)

echo "🔧 Adding basic implementations to empty API route files..."

for file in "${FILES[@]}"; do
  if [[ -f "$file" ]] && [[ ! -s "$file" ]]; then
    echo "Fixing: $file"
    
    # Determine if this is a dynamic route ([id])
    if [[ "$file" == *"[id]"* ]]; then
      # Dynamic route template
      cat > "$file" << 'EOF'
import { NextResponse } from 'next/server';

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    return NextResponse.json(
      { error: 'Route not yet implemented', resourceId: id },
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

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    return NextResponse.json(
      { error: 'Route not yet implemented', resourceId: id },
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

export async function PUT(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    return NextResponse.json(
      { error: 'Route not yet implemented', resourceId: id },
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

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    return NextResponse.json(
      { error: 'Route not yet implemented', resourceId: id },
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
EOF
    else
      # Static route template
      cat > "$file" << 'EOF'
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
EOF
    fi
  fi
done

echo "✅ All empty API route files have been fixed!"
echo "🏗️ You can now build and deploy your application."
