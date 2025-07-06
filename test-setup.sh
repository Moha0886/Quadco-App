#!/bin/bash

echo "🔧 Setting up Quadco App Database..."
echo "==================================="

# Step 1: Call setup API
echo "1. Calling setup API..."
setup_response=$(curl -s -X POST https://quadco-app.vercel.app/api/setup -H "Content-Type: application/json")
echo "Setup response: $setup_response"

echo ""

# Step 2: Test login with admin credentials
echo "2. Testing admin login..."
login_response=$(curl -s -X POST https://quadco-app.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@quadco.com","password":"admin123"}')
echo "Login response: $login_response"

echo ""

# Step 3: Test users API
echo "3. Testing users API..."
users_response=$(curl -s https://quadco-app.vercel.app/api/users)
echo "Users API response: $users_response"

echo ""

# Step 4: Test customers API
echo "4. Testing customers API..."
customers_response=$(curl -s https://quadco-app.vercel.app/api/customers)
echo "Customers API response: $customers_response"

echo ""
echo "🎉 Setup and testing completed!"
echo "==================================="
echo "If login was successful, you can now access the app at:"
echo "https://quadco-app.vercel.app/login"
echo "Email: admin@quadco.com"
echo "Password: admin123"
