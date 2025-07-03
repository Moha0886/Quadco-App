#!/bin/bash

# Deploy to Render - Alternative to Railway
# Free PostgreSQL + Web Service

set -e

echo "🚀 DEPLOYING TO RENDER"
echo "====================="

# 1. Create render.yaml for deployment
echo "📝 Creating render.yaml..."
cat > render.yaml << EOF
services:
  - type: web
    name: quadco-app
    env: node
    buildCommand: npm install && npx prisma generate && npm run build
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        fromDatabase:
          name: quadco-db
          property: connectionString
      - key: NEXTAUTH_SECRET
        generateValue: true
      - key: NEXTAUTH_URL
        value: https://quadco-app.onrender.com

databases:
  - name: quadco-db
    databaseName: quadco
    user: quadco
EOF

# 2. Update package.json for Render
echo "📦 Updating package.json..."
npm pkg set scripts.build="prisma generate && next build"
npm pkg set scripts.start="next start -p \${PORT:-3000}"

# 3. Create Dockerfile (optional but recommended)
echo "🐳 Creating Dockerfile..."
cat > Dockerfile << EOF
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npx prisma generate
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
EOF

echo ""
echo "✅ RENDER SETUP COMPLETE!"
echo "🔗 Go to: https://render.com"
echo "📂 Connect your GitHub repo"
echo "⚙️ Use the render.yaml file for automatic setup"
echo ""
echo "🛠️ After deployment:"
echo "1. Run database commands in Render shell"
echo "2. Test your app"
