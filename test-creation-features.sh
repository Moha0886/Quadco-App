#!/bin/bash

# Final functionality test for customer and quotation creation
echo "🔧 Testing Customer and Quotation Creation"
echo "=========================================="

BASE_URL="https://quadco-app.vercel.app"

echo "1. Testing Customer Creation API..."
CUSTOMER_RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" \
  -d '{"name":"API Test Customer","email":"apitest@example.com","phone":"555-123-4567","address":"123 API Street"}' \
  "$BASE_URL/api/customers")
echo "   Customer Creation: $CUSTOMER_RESPONSE"

echo ""
echo "2. Testing Customer List API..."
CUSTOMERS=$(curl -s -H "Content-Type: application/json" "$BASE_URL/api/customers")
echo "   Customers Count: $(echo $CUSTOMERS | jq -r '.customers | length // "Error"')"

echo ""
echo "3. Testing Products API..."
PRODUCTS=$(curl -s -H "Content-Type: application/json" "$BASE_URL/api/products")
echo "   Products Count: $(echo $PRODUCTS | jq -r '.products | length // "Error"')"

echo ""
echo "4. Testing Services API..."
SERVICES=$(curl -s -H "Content-Type: application/json" "$BASE_URL/api/services")
echo "   Services Count: $(echo $SERVICES | jq -r '.services | length // "Error"')"

echo ""
echo "5. Testing Quotations GET API..."
QUOTATIONS_GET=$(curl -s -H "Content-Type: application/json" "$BASE_URL/api/quotations")
echo "   Quotations GET: $(echo $QUOTATIONS_GET | jq -r '.quotations | length // .error // "Error"')"

echo ""
echo "6. Testing Form Pages Access..."
FORMS=("/customers/new" "/quotations/new" "/products/new" "/services/new")

for form in "${FORMS[@]}"; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$form")
  echo "   $form: HTTP $STATUS"
done

echo ""
echo "✅ Test completed!"
