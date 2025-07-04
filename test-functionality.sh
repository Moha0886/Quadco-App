#!/bin/bash

# Test script for Quadco App functionality
echo "🚀 Testing Quadco App Functionality"
echo "================================="

BASE_URL="https://quadco-app.vercel.app"

echo "1. Testing main page access..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL")
echo "   Main page: HTTP $STATUS"

echo "2. Testing login page access..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/login")
echo "   Login page: HTTP $STATUS"

echo "3. Testing dashboard access..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/dashboard")
echo "   Dashboard: HTTP $STATUS"

echo "4. Testing authentication API..."
AUTH_RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" \
  -d '{"email":"admin@quadco.com","password":"admin123"}' \
  "$BASE_URL/api/auth/login")
echo "   Login API: $AUTH_RESPONSE"

echo "5. Testing API endpoints..."

# Test customers API
echo "   Customers API:"
CUSTOMERS=$(curl -s -H "Content-Type: application/json" "$BASE_URL/api/customers")
echo "     GET: $(echo $CUSTOMERS | jq -r '.customers | length // .error // "Error"')"

# Test products API
echo "   Products API:"
PRODUCTS=$(curl -s -H "Content-Type: application/json" "$BASE_URL/api/products")
echo "     GET: $(echo $PRODUCTS | jq -r '.products | length // .error // "Error"')"

# Test services API
echo "   Services API:"
SERVICES=$(curl -s -H "Content-Type: application/json" "$BASE_URL/api/services")
echo "     GET: $(echo $SERVICES | jq -r '.services | length // .error // "Error"')"

# Test quotations API
echo "   Quotations API:"
QUOTATIONS=$(curl -s -H "Content-Type: application/json" "$BASE_URL/api/quotations")
echo "     GET: $(echo $QUOTATIONS | jq -r '.quotations | length // .error // "Error"')"

# Test invoices API
echo "   Invoices API:"
INVOICES=$(curl -s -H "Content-Type: application/json" "$BASE_URL/api/invoices")
echo "     GET: $(echo $INVOICES | jq -r '.invoices | length // .error // "Error"')"

# Test delivery notes API
echo "   Delivery Notes API:"
DELIVERY_NOTES=$(curl -s -H "Content-Type: application/json" "$BASE_URL/api/delivery-notes")
echo "     GET: $(echo $DELIVERY_NOTES | jq -r '.deliveryNotes | length // .error // "Error"')"

echo "6. Testing page accessibility..."
PAGES=("/customers" "/products" "/services" "/quotations" "/invoices" "/delivery-notes" "/users" "/permissions" "/roles")

for page in "${PAGES[@]}"; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$page")
  echo "   $page: HTTP $STATUS"
done

echo ""
echo "🏁 Test completed!"
echo "================================="
