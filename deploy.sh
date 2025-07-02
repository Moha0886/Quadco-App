#!/bin/bash

# Quadco App Deployment Script - v1.2
# Production-ready deployment for Quadco business management app

set -e  # Exit on any error

echo "🚀 Quadco App - Production Deployment"
echo "===================================="

# Change to project directory
cd /Users/muhammadilu/quadco-app

# Validate project structure
echo "📋 Validating project structure..."
if [ ! -f "package.json" ]; then
    echo "❌ package.json not found!"
    exit 1
fi

if [ ! -f "vercel.json" ]; then
    echo "❌ vercel.json not found!"
    exit 1
fi

echo "✅ Project structure validated"

# Check if Vercel CLI is installed
echo "📋 Checking Vercel CLI..."
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Check Vercel login status
echo "📋 Checking Vercel authentication..."
vercel whoami || {
    echo "❌ Not logged into Vercel. Please run: vercel login"
    exit 1
}

# Generate Prisma client
echo "📋 Generating Prisma client..."
npx prisma generate

# Build the application
echo "🔨 Building application..."
npm run build

# Deploy to production
echo "� Deploying to Vercel production..."
vercel --prod --yes

echo ""
echo "🎉 Deployment completed successfully!"
echo "🌐 Your app should now be live on Vercel"
echo "📱 Test all functionality after deployment"
