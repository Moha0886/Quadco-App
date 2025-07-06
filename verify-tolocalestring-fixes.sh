#!/bin/bash

echo "🔍 Comprehensive .toLocaleString() Fix Verification"
echo "=================================================="

# Check for any remaining unprotected .toLocaleString() calls
echo "1. Checking for unprotected .toLocaleString() calls..."
unprotected=$(grep -r "\.toLocaleString()" src/ | grep -v "?\.toLocaleString()" | grep -v "|| '0.00'" | grep -v "(.*|| 0)\.toLocaleString()" | grep -v "Math\.round.*\.toLocaleString()")

if [ -z "$unprotected" ]; then
    echo "✅ No unprotected .toLocaleString() calls found"
else
    echo "❌ Found potentially unprotected calls:"
    echo "$unprotected"
fi

echo ""
echo "2. Checking for any remaining references to 'totalAmount' field (should be 'total')..."
totalAmount_refs=$(grep -r "quotation\.totalAmount\|invoice\.totalAmount" src/ || true)

if [ -z "$totalAmount_refs" ]; then
    echo "✅ No references to 'totalAmount' field found"
else
    echo "❌ Found references to 'totalAmount' field:"
    echo "$totalAmount_refs"
fi

echo ""
echo "3. Checking build status..."
npm run build > build.log 2>&1
build_status=$?

if [ $build_status -eq 0 ]; then
    echo "✅ Build successful"
else
    echo "❌ Build failed. Check build.log for details"
    echo "First 10 lines of build log:"
    head -10 build.log
fi

echo ""
echo "4. Checking TypeScript compilation..."
npx tsc --noEmit > tsc.log 2>&1
tsc_status=$?

if [ $tsc_status -eq 0 ]; then
    echo "✅ TypeScript compilation successful"
else
    echo "❌ TypeScript compilation failed. Check tsc.log for details"
    echo "First 10 lines of TypeScript log:"
    head -10 tsc.log
fi

echo ""
echo "5. Summary of all .toLocaleString() usage patterns:"
echo "---------------------------------------------------"
grep -r "\.toLocaleString()" src/ | sed 's/.*://' | sort | uniq -c | sort -nr

echo ""
if [ $build_status -eq 0 ] && [ $tsc_status -eq 0 ] && [ -z "$unprotected" ] && [ -z "$totalAmount_refs" ]; then
    echo "🎉 All .toLocaleString() fixes verified successfully!"
    echo "   - No unprotected calls"
    echo "   - No totalAmount field references" 
    echo "   - Build passes"
    echo "   - TypeScript compilation passes"
    exit 0
else
    echo "❌ Some issues remain. Please review the output above."
    exit 1
fi
