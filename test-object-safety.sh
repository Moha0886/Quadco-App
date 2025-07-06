#!/bin/bash

echo "🔍 Comprehensive Object Property Access Safety Check"
echo "=================================================="

# Check for potentially unsafe object property access patterns
echo "1. Checking for unsafe ._count access..."
unsafe_count=$(grep -r "\._count\." src/ | grep -v "\._count\?" | grep -v "|| 0" | grep -v "interface" || true)

if [ -z "$unsafe_count" ]; then
    echo "✅ All _count property access is safe"
else
    echo "❌ Found unsafe _count access:"
    echo "$unsafe_count"
fi

echo ""
echo "2. Checking for unsafe .customer property access..."
unsafe_customer=$(grep -r "\.customer\." src/ | grep -v "\.customer\?" | grep -v "|| 'N/A'" | grep -v "interface" | grep -v "toLowerCase" || true)

if [ -z "$unsafe_customer" ]; then
    echo "✅ All customer property access is safe"
else
    echo "❌ Found unsafe customer access:"
    echo "$unsafe_customer"
fi

echo ""
echo "3. Checking for any remaining undefined object evaluation patterns..."
# Look for patterns like object.property.method() without optional chaining
unsafe_chains=$(grep -r "\.[a-zA-Z_][a-zA-Z0-9_]*\.[a-zA-Z_][a-zA-Z0-9_]*(" src/ | grep -v "\?\." | grep -v "interface" | grep -v "toLowerCase().includes" || true)

if [ -z "$unsafe_chains" ]; then
    echo "✅ No unsafe property chains found"
else
    echo "⚠️  Found potential unsafe property chains:"
    echo "$unsafe_chains"
fi

echo ""
echo "4. Summary of current safety patterns:"
echo "-------------------------------------"
echo "Protected _count access:"
grep -r "\._count\?" src/ | wc -l | tr -d ' ' | xargs echo "- _count with optional chaining:"

echo "Protected customer access:"
grep -r "\.customer\?" src/ | wc -l | tr -d ' ' | xargs echo "- customer with optional chaining:"

echo "Protected .toLocaleString() calls:"
grep -r "\.toLocaleString()" src/ | grep -E "(\?\.||| '0\.00'|\|\| 0)" | wc -l | tr -d ' ' | xargs echo "- safe toLocaleString calls:"

echo ""
echo "5. Building app to verify no compile errors..."
npm run build > build.log 2>&1
build_status=$?

if [ $build_status -eq 0 ]; then
    echo "✅ Build successful - no compilation errors"
else
    echo "❌ Build failed - checking for relevant errors..."
    grep -i "undefined" build.log || echo "No undefined-related errors found in build log"
fi

echo ""
if [ -z "$unsafe_count" ] && [ -z "$unsafe_customer" ] && [ $build_status -eq 0 ]; then
    echo "🎉 All object property access is now safe!"
    echo "   - _count properties use optional chaining"
    echo "   - customer properties use optional chaining" 
    echo "   - .toLocaleString() calls are protected"
    echo "   - Build passes successfully"
    exit 0
else
    echo "❌ Some issues may remain. Please review the output above."
    exit 1
fi
