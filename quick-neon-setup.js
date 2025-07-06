#!/usr/bin/env node

/**
 * Quick Neon Database Setup Guide
 * This script provides step-by-step instructions for setting up Neon PostgreSQL
 */

console.log('🚀 Quick Neon Database Setup for Quadco App');
console.log('='.repeat(50));

console.log('\n📋 Step-by-Step Instructions:');
console.log('');
console.log('1. **Create Neon Account**:');
console.log('   → Go to https://neon.tech');
console.log('   → Click "Sign up" and use GitHub/Google');
console.log('   → This is completely FREE (no credit card required)');
console.log('');
console.log('2. **Create New Project**:');
console.log('   → Click "Create Project"');
console.log('   → Project name: quadco-app');
console.log('   → Database name: quadco_db');
console.log('   → Region: Choose closest to you');
console.log('   → Click "Create Project"');
console.log('');
console.log('3. **Get Connection String**:');
console.log('   → After creation, you\'ll see "Connection Details"');
console.log('   → Copy the "Connection string" (starts with postgresql://)');
console.log('   → It looks like: postgresql://username:password@host/database?sslmode=require');
console.log('');
console.log('4. **Run Setup Script**:');
console.log('   → Come back to your terminal');
console.log('   → Run: node setup-production-database.js');
console.log('   → Paste your connection string when prompted');
console.log('');
console.log('💡 Benefits of Neon:');
console.log('   ✅ 512MB storage (enough for most apps)');
console.log('   ✅ Serverless (auto-scales)');
console.log('   ✅ Built-in connection pooling');
console.log('   ✅ Automatic backups');
console.log('   ✅ Great performance');
console.log('');
console.log('🔗 Alternative: If you prefer Supabase instead:');
console.log('   → Go to https://supabase.com');
console.log('   → Create project → Settings → Database');
console.log('   → Copy the connection string');
console.log('');
console.log('⚡ Ready? Run this when you have your connection string:');
console.log('   node setup-production-database.js');
console.log('');

const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Press Enter when you\'re ready to continue or Ctrl+C to exit...', () => {
  console.log('\n🎯 Next: Get your database connection string, then run:');
  console.log('   node setup-production-database.js');
  rl.close();
});
