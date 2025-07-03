#!/bin/bash

# Fix Vercel Deployment Script
# This will properly deploy to Vercel without SSO issues

set -e

echo "🚀 DEPLOYING TO VERCEL (FIXED VERSION)"
echo "====================================="

# 1. Install Vercel CLI if not present
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# 2. Remove Railway-specific files
echo "🧹 Cleaning up Railway files..."
rm -f railway.json
rm -f Dockerfile
rm -f .dockerignore

# 3. Create/update vercel.json without SSO issues
echo "📝 Creating proper vercel.json..."
cat > vercel.json << EOF
{
  "env": {
    "DATABASE_URL": "@database_url",
    "NEXTAUTH_SECRET": "@nextauth_secret",
    "NEXTAUTH_URL": "@nextauth_url"
  },
  "build": {
    "env": {
      "DATABASE_URL": "@database_url",
      "NEXTAUTH_SECRET": "@nextauth_secret"
    }
  }
}
EOF

# 4. Update package.json for Vercel
echo "📦 Updating package.json..."
npm pkg set scripts.build="prisma generate && next build"
npm pkg set scripts.start="next start"

# 5. Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

echo ""
echo "✅ DEPLOYMENT COMPLETE!"
echo "🔗 Your app should be live at: https://quadco-app-[hash].vercel.app"
echo ""
echo "🛠️ Next steps:"
echo "1. Set environment variables in Vercel dashboard"
echo "2. Run database setup commands"
echo "3. Test your app"
