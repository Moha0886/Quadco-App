#!/usr/bin/env node

// Generate a secure NEXTAUTH_SECRET for Railway deployment
const crypto = require('crypto');

const generateSecret = () => {
  return crypto.randomBytes(32).toString('hex');
};

const secret = generateSecret();

console.log('🔐 Generated NEXTAUTH_SECRET for Railway deployment:');
console.log('');
console.log(`NEXTAUTH_SECRET=${secret}`);
console.log('');
console.log('✅ Copy this value and add it to your Railway environment variables!');
console.log('');
console.log('📋 Complete environment variables for Railway:');
console.log('');
console.log('DATABASE_URL=postgresql://[your-postgres-connection-string]');
console.log('NODE_ENV=production');
console.log(`NEXTAUTH_SECRET=${secret}`);
console.log('');
console.log('🚀 Ready for deployment!');
