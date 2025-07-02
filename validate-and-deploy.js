#!/usr/bin/env node

/**
 * Quadco App - Final Deployment Validation & Deploy Script
 * This script validates the app is ready for deployment and attempts to deploy
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Quadco App - Final Deployment Process');
console.log('=====================================\n');

function runCommand(command, description) {
  try {
    console.log(`📋 ${description}...`);
    const result = execSync(command, { 
      encoding: 'utf8',
      cwd: '/Users/muhammadilu/quadco-app'
    });
    console.log(`✅ ${description} - SUCCESS`);
    return result;
  } catch (error) {
    console.log(`❌ ${description} - FAILED`);
    console.log(`Error: ${error.message}`);
    return null;
  }
}

async function validateAndDeploy() {
  console.log('🔍 Step 1: Validating project structure...');
  
  // Check critical files
  const criticalFiles = [
    'package.json',
    'next.config.ts',
    'vercel.json',
    'src/app/layout.tsx',
    'src/app/page.tsx',
    'prisma/schema.prisma'
  ];
  
  for (const file of criticalFiles) {
    if (fs.existsSync(file)) {
      console.log(`✅ ${file} exists`);
    } else {
      console.log(`❌ ${file} missing - CRITICAL ERROR`);
      return false;
    }
  }

  console.log('\n🔍 Step 2: Checking Vercel configuration...');
  
  // Check Vercel project
  if (fs.existsSync('.vercel/project.json')) {
    const vercelConfig = JSON.parse(fs.readFileSync('.vercel/project.json', 'utf8'));
    console.log(`✅ Vercel project configured: ${vercelConfig.projectId}`);
  } else {
    console.log('❌ Vercel project not linked');
    return false;
  }

  console.log('\n🔍 Step 3: Testing build process...');
  
  // Generate Prisma client
  const prismaGenerate = runCommand('npx prisma generate', 'Generating Prisma client');
  if (!prismaGenerate) return false;

  // Test build
  const buildResult = runCommand('npm run build', 'Building application');
  if (!buildResult) return false;

  console.log('\n🚀 Step 4: Deploying to Vercel...');
  
  // Deploy to Vercel
  const deployResult = runCommand('npx vercel --prod --yes', 'Deploying to Vercel production');
  if (!deployResult) {
    console.log('\n⚠️  Direct deployment failed. You can deploy manually:');
    console.log('1. Visit https://vercel.com/dashboard');
    console.log('2. Find your quadco-app project');
    console.log('3. Click "Deploy" button');
    console.log('\nOr try: npx vercel --prod');
    return false;
  }

  console.log('\n🎉 DEPLOYMENT SUCCESSFUL!');
  console.log('🌐 Your app should now be live on Vercel');
  
  return true;
}

// Run the deployment process
validateAndDeploy().catch(console.error);
