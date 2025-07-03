#!/bin/bash

# Deploy to Netlify + Supabase
# Best for static sites with external database

set -e

echo "🚀 DEPLOYING TO NETLIFY + SUPABASE"
echo "=================================="

# 1. Install Netlify CLI
if ! command -v netlify &> /dev/null; then
    echo "📦 Installing Netlify CLI..."
    npm install -g netlify-cli
fi

# 2. Update for static export (required for Netlify)
echo "📝 Updating next.config.ts for static export..."
cat > next.config.ts << EOF
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
};

export default nextConfig;
EOF

# 3. Create netlify.toml
echo "📝 Creating netlify.toml..."
cat > netlify.toml << EOF
[build]
  command = "npm run build"
  publish = "out"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
EOF

# 4. Update package.json
echo "📦 Updating package.json..."
npm pkg set scripts.build="prisma generate && next build"
npm pkg set scripts.export="next export"

echo ""
echo "✅ NETLIFY SETUP COMPLETE!"
echo "🔗 Go to: https://netlify.com"
echo "📂 Connect your GitHub repo"
echo "🗄️ Set up Supabase database separately"
echo ""
echo "📋 Required environment variables:"
echo "- DATABASE_URL (from Supabase)"
echo "- NEXTAUTH_SECRET"
echo "- NEXTAUTH_URL"
