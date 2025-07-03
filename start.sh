#!/bin/bash

# Railway startup script for Quadco App
echo "🚀 Starting Quadco App on Railway..."

# Set default port if not provided
export PORT=${PORT:-3000}

echo "📦 Generating Prisma client..."
npx prisma generate

echo "🔧 Starting Next.js application on port $PORT..."
exec npm start
