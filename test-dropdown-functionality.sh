#!/bin/bash

echo "🔍 Testing invoice creation page for dropdown functionality..."

# Check if the development server is running
if ! curl -s http://localhost:3000 > /dev/null; then
    echo "❌ Development server is not running on localhost:3000"
    echo "Please start the server with: npm run dev"
    exit 1
fi

echo "✅ Development server is running"

# Test the APIs directly
echo "📊 Testing Products API..."
products_response=$(curl -s http://localhost:3000/api/products)
products_count=$(echo "$products_response" | jq '.products | length' 2>/dev/null || echo "0")
echo "Products found: $products_count"

echo "📊 Testing Services API..."
services_response=$(curl -s http://localhost:3000/api/services)
services_count=$(echo "$services_response" | jq '.services | length' 2>/dev/null || echo "0")
echo "Services found: $services_count"

# Open the page in the default browser
echo "🌐 Opening invoice creation page in browser..."
echo "Please check the browser console for debug logs and verify that:"
echo "1. Products and services are being fetched"
echo "2. The dropdown shows $products_count products and $services_count services"
echo "3. No JavaScript errors are present"

# For macOS, open the page in the default browser
if [[ "$OSTYPE" == "darwin"* ]]; then
    open "http://localhost:3000/invoices/new"
else
    echo "Please navigate to: http://localhost:3000/invoices/new"
fi

echo "✨ Test complete. Check the browser console and dropdown functionality."
