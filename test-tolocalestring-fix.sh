#!/bin/bash

echo "🔍 Testing .toLocaleString() fixes..."
echo "======================================"

# Check if the app is running
if ! curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "❌ App is not running. Starting development server..."
    npm run dev &
    DEV_PID=$!
    
    echo "⏳ Waiting for app to start..."
    sleep 10
    
    # Check again
    if ! curl -s http://localhost:3000 > /dev/null 2>&1; then
        echo "❌ Failed to start development server"
        exit 1
    fi
    
    echo "✅ Development server started"
    STARTED_SERVER=true
else
    echo "✅ App is already running"
    STARTED_SERVER=false
fi

# Test pages that use .toLocaleString()
echo ""
echo "Testing pages with .toLocaleString() usage:"

pages=(
    "/dashboard"
    "/quotations"
    "/invoices"
    "/products"
    "/services"
)

all_passed=true

for page in "${pages[@]}"; do
    echo -n "Testing $page... "
    response=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000$page")
    
    if [ "$response" = "200" ]; then
        echo "✅ OK (HTTP $response)"
    else
        echo "❌ Failed (HTTP $response)"
        all_passed=false
    fi
done

# Check for specific error patterns in browser console
echo ""
echo "Checking for common .toLocaleString() errors in the codebase:"

# Search for potential issues
echo -n "Checking for unprotected .toLocaleString() calls... "
unprotected_calls=$(grep -r "\.toLocaleString()" src/ | grep -v "?\.toLocaleString()" | grep -v "|| '0.00'" | wc -l)

if [ "$unprotected_calls" -gt 0 ]; then
    echo "❌ Found $unprotected_calls potentially unsafe calls"
    echo "Details:"
    grep -r "\.toLocaleString()" src/ | grep -v "?\.toLocaleString()" | grep -v "|| '0.00'"
    all_passed=false
else
    echo "✅ All .toLocaleString() calls are protected"
fi

echo ""
if [ "$all_passed" = true ]; then
    echo "🎉 All .toLocaleString() fixes are working correctly!"
    exit_code=0
else
    echo "❌ Some issues detected. Please review the output above."
    exit_code=1
fi

# Cleanup
if [ "$STARTED_SERVER" = true ]; then
    echo ""
    echo "🛑 Stopping development server..."
    kill $DEV_PID 2>/dev/null
    wait $DEV_PID 2>/dev/null
    echo "✅ Development server stopped"
fi

echo ""
echo "Test completed at $(date)"
exit $exit_code
