#!/usr/bin/env node

/**
 * Production Database Setup Script
 * This script helps you set up a PostgreSQL database for production
 * and configure your environment variables properly.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Production Database Setup for Quadco App');
console.log('='.repeat(50));

// Function to generate a secure random secret
function generateSecret() {
  const crypto = require('crypto');
  return crypto.randomBytes(32).toString('hex');
}

// Function to update environment variables
function updateEnvFile(filePath, variables) {
  let content = '';
  
  // Read existing content if file exists
  if (fs.existsSync(filePath)) {
    content = fs.readFileSync(filePath, 'utf8');
  }
  
  // Update or add each variable
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`^${key}=.*$`, 'm');
    const line = `${key}="${value}"`;
    
    if (regex.test(content)) {
      content = content.replace(regex, line);
    } else {
      content += content && !content.endsWith('\n') ? '\n' : '';
      content += line + '\n';
    }
  });
  
  fs.writeFileSync(filePath, content);
  console.log(`✅ Updated ${filePath}`);
}

// Function to run command safely
function runCommand(command, description) {
  try {
    console.log(`\n🔧 ${description}...`);
    const output = execSync(command, { stdio: 'pipe', encoding: 'utf8' });
    console.log(`✅ ${description} completed`);
    return output;
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message);
    throw error;
  }
}

async function main() {
  console.log('\n📋 Step 1: Database Provider Options');
  console.log('Choose one of these FREE PostgreSQL providers:');
  console.log('');
  console.log('1. Neon (Recommended) - https://neon.tech');
  console.log('   - 512MB storage, 1 compute unit');
  console.log('   - Easy setup, good performance');
  console.log('');
  console.log('2. Supabase - https://supabase.com');
  console.log('   - 500MB storage, 2 CPU cores');
  console.log('   - Built-in auth, real-time features');
  console.log('');
  console.log('3. Aiven (Current) - https://aiven.io');
  console.log('   - 1 month free trial');
  console.log('   - Good for enterprise features');
  console.log('');
  console.log('4. Railway PostgreSQL - https://railway.app');
  console.log('   - $5/month after trial');
  console.log('   - Good integration with Railway hosting');
  console.log('');
  
  console.log('🔍 Step 2: Get Your Database Connection String');
  console.log('After creating your database, you\'ll get a connection string like:');
  console.log('postgres://username:password@host:port/database?sslmode=require');
  console.log('');
  
  // Check if user wants to continue with setup
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  function askQuestion(question) {
    return new Promise((resolve) => {
      rl.question(question, resolve);
    });
  }
  
  try {
    const hasDatabase = await askQuestion('Do you have a PostgreSQL database connection string ready? (y/n): ');
    
    if (hasDatabase.toLowerCase() === 'y' || hasDatabase.toLowerCase() === 'yes') {
      const databaseUrl = await askQuestion('Enter your PostgreSQL connection string: ');
      
      if (!databaseUrl.startsWith('postgres://') && !databaseUrl.startsWith('postgresql://')) {
        console.log('❌ Invalid connection string format. It should start with postgres:// or postgresql://');
        process.exit(1);
      }
      
      // Generate secure secrets
      const nextAuthSecret = generateSecret();
      const vercelUrl = 'https://quadco-app-moha0886s-projects.vercel.app';
      
      console.log('\n🔧 Step 3: Updating Environment Variables');
      
      // Update local .env for development
      updateEnvFile('.env', {
        DATABASE_URL: databaseUrl,
        NEXTAUTH_SECRET: nextAuthSecret,
        NEXTAUTH_URL: 'http://localhost:3000'
      });
      
      // Update production .env
      updateEnvFile('.env.production', {
        DATABASE_URL: databaseUrl,
        NEXTAUTH_SECRET: nextAuthSecret,
        NEXTAUTH_URL: vercelUrl,
        NODE_ENV: 'production'
      });
      
      console.log('\n🔧 Step 4: Setting up Database Schema');
      
      // Generate Prisma client
      runCommand('npx prisma generate', 'Generating Prisma client');
      
      // Push schema to database
      runCommand('npx prisma db push', 'Pushing database schema');
      
      console.log('\n🔧 Step 5: Seeding Database');
      
      // Run seed script
      runCommand('npm run seed', 'Seeding basic data');
      
      // Create super admin
      runCommand('npx tsx scripts/create-super-admin.ts', 'Creating super admin user');
      
      console.log('\n🔧 Step 6: Updating Vercel Environment Variables');
      console.log('You need to update these environment variables in Vercel:');
      console.log('');
      console.log('Run these commands:');
      console.log(`vercel env add DATABASE_URL`);
      console.log(`(Enter: ${databaseUrl})`);
      console.log('');
      console.log(`vercel env add NEXTAUTH_SECRET`);
      console.log(`(Enter: ${nextAuthSecret})`);
      console.log('');
      console.log(`vercel env add NEXTAUTH_URL`);
      console.log(`(Enter: ${vercelUrl})`);
      console.log('');
      
      const updateVercel = await askQuestion('Do you want me to update Vercel environment variables now? (y/n): ');
      
      if (updateVercel.toLowerCase() === 'y' || updateVercel.toLowerCase() === 'yes') {
        try {
          // Check if vercel CLI is installed
          execSync('which vercel', { stdio: 'pipe' });
          
          console.log('\n🔧 Updating Vercel environment variables...');
          
          // Set environment variables
          execSync(`echo "${databaseUrl}" | vercel env add DATABASE_URL production`, { stdio: 'inherit' });
          execSync(`echo "${nextAuthSecret}" | vercel env add NEXTAUTH_SECRET production`, { stdio: 'inherit' });
          execSync(`echo "${vercelUrl}" | vercel env add NEXTAUTH_URL production`, { stdio: 'inherit' });
          
          console.log('\n🔧 Redeploying to Vercel...');
          execSync('vercel --prod', { stdio: 'inherit' });
          
        } catch (error) {
          console.log('❌ Vercel CLI not found or error updating. Please update manually:');
          console.log('1. Go to https://vercel.com/dashboard');
          console.log('2. Select your project');
          console.log('3. Go to Settings > Environment Variables');
          console.log('4. Add the variables shown above');
          console.log('5. Redeploy your project');
        }
      }
      
      console.log('\n🎉 Database Setup Complete!');
      console.log('='.repeat(50));
      console.log('✅ Database schema created');
      console.log('✅ Database seeded with initial data');
      console.log('✅ Super admin user created');
      console.log('✅ Environment variables updated');
      console.log('');
      console.log('🔐 Login Details:');
      console.log('URL: https://quadco-app-moha0886s-projects.vercel.app/login');
      console.log('Email: admin@quadco.com');
      console.log('Password: admin123');
      console.log('');
      console.log('🧪 Test your deployment:');
      console.log('node validate-deployment.js');
      
    } else {
      console.log('\n📚 Database Setup Guide:');
      console.log('');
      console.log('1. **Neon (Recommended)**:');
      console.log('   - Go to https://neon.tech');
      console.log('   - Sign up with GitHub/Google');
      console.log('   - Create a new project');
      console.log('   - Copy the connection string');
      console.log('');
      console.log('2. **Supabase**:');
      console.log('   - Go to https://supabase.com');
      console.log('   - Sign up and create a new project');
      console.log('   - Go to Settings > Database');
      console.log('   - Copy the connection string');
      console.log('');
      console.log('3. **Run this script again** when you have your connection string');
      console.log('   node setup-production-database.js');
    }
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Run the setup
main().catch(console.error);
