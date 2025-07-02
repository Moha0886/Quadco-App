#!/usr/bin/env node

// Build validation script - Updated for deployment test

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Checking build status...\n');

try {
  // Check if package.json exists
  const packagePath = path.join(__dirname, 'package.json');
  if (!fs.existsSync(packagePath)) {
    throw new Error('package.json not found');
  }

  console.log('✅ package.json exists');

  // Check if node_modules exists
  const nodeModulesPath = path.join(__dirname, 'node_modules');
  if (!fs.existsSync(nodeModulesPath)) {
    console.log('❌ node_modules not found, running npm install...');
    execSync('npm install', { stdio: 'inherit' });
  } else {
    console.log('✅ node_modules exists');
  }

  // Check if Prisma client is generated
  try {
    require('@prisma/client');
    console.log('✅ Prisma client is available');
  } catch (error) {
    console.log('❌ Prisma client not generated, running prisma generate...');
    execSync('npx prisma generate', { stdio: 'inherit' });
  }

  // Try to build the project
  console.log('\n🔨 Running build...');
  execSync('npm run build', { stdio: 'inherit' });
  
  console.log('\n🎉 Build completed successfully!');
  console.log('🚀 App should be ready for deployment');

} catch (error) {
  console.error('\n❌ Build failed:', error.message);
  
  if (error.stdout) {
    console.log('\nSTDOUT:', error.stdout.toString());
  }
  if (error.stderr) {
    console.log('\nSTDERR:', error.stderr.toString());
  }
  
  process.exit(1);
}
