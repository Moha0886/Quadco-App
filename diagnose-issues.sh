#!/bin/bash

echo "🔍 Diagnosing Quadco App Issues..."
echo "================================="

# Test 1: Check if the application is accessible
echo "1. Testing main application..."
curl -s -I https://quadco-app.vercel.app | head -1 || echo "❌ Main app not accessible"

# Test 2: Check login page
echo "2. Testing login page..."
curl -s -I https://quadco-app.vercel.app/login | head -1 || echo "❌ Login page not accessible"

# Test 3: Test login API with invalid credentials
echo "3. Testing login API..."
response=$(curl -s -X POST https://quadco-app.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"wrongpassword"}')
echo "Response: $response"

# Test 4: Test users API
echo "4. Testing users API..."
users_response=$(curl -s https://quadco-app.vercel.app/api/users)
echo "Users API response: $users_response"

echo ""
echo "🎯 Diagnosis Complete!"
echo "================================="
