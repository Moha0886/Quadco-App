#!/bin/bash

echo "Testing API endpoints and array safety fixes..."
echo "================================================"

# Test all API endpoints
echo "Testing customers API..."
curl -s http://localhost:3000/api/customers | jq '.customers | length' 2>/dev/null || echo "API not responding or invalid JSON"

echo "Testing quotations API..."
curl -s http://localhost:3000/api/quotations | jq '.quotations | length' 2>/dev/null || echo "API not responding or invalid JSON"

echo "Testing services API..."
curl -s http://localhost:3000/api/services | jq '.services | length' 2>/dev/null || echo "API not responding or invalid JSON"

echo "Testing invoices API..."
curl -s http://localhost:3000/api/invoices | jq '.invoices | length' 2>/dev/null || echo "API not responding or invalid JSON"

echo "Testing delivery-notes API..."
curl -s http://localhost:3000/api/delivery-notes | jq '.deliveryNotes | length' 2>/dev/null || echo "API not responding or invalid JSON"

echo "Testing users API..."
curl -s http://localhost:3000/api/users | jq '.users | length' 2>/dev/null || echo "API not responding or invalid JSON"

echo ""
echo "Testing page accessibility..."
echo "==============================="

pages=("customers" "quotations" "services" "invoices" "delivery-notes" "users")
for page in "${pages[@]}"; do
    status=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/$page)
    if [ "$status" = "200" ]; then
        echo "✓ $page page: HTTP $status"
    else
        echo "✗ $page page: HTTP $status"
    fi
done

echo ""
echo "Array safety check complete!"
echo "All pages should now handle non-array API responses gracefully."
