#!/usr/bin/env node

/**
 * Interactive Database Setup Helper
 */

const readline = require('readline');
const fs = require('fs');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🗄️  INTERACTIVE DATABASE SETUP');
console.log('==============================');
console.log('');

console.log('Current setup: You have SQLite (file:./dev.db)');
console.log('For production: We need PostgreSQL');
console.log('');

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

async function setup() {
  console.log('Choose an option:');
  console.log('1. I already have a PostgreSQL connection string');
  console.log('2. Help me create a new PostgreSQL database');
  console.log('3. Show me the manual setup steps');
  console.log('');
  
  const choice = await askQuestion('Enter your choice (1, 2, or 3): ');
  
  if (choice === '1') {
    const dbUrl = await askQuestion('Enter your PostgreSQL connection string: ');
    
    if (dbUrl && dbUrl.startsWith('postgresql://')) {
      // Update .env file
      const envContent = fs.readFileSync('.env', 'utf8');
      const newEnvContent = envContent.replace(
        /DATABASE_URL=".*"/,
        `DATABASE_URL="${dbUrl}"`
      );
      fs.writeFileSync('.env', newEnvContent);
      
      console.log('✅ Updated .env file with PostgreSQL URL');
      console.log('');
      console.log('🔄 Next steps:');
      console.log('1. Add the same DATABASE_URL to Vercel environment variables');
      console.log('2. Run: chmod +x run-database-setup.js && node run-database-setup.js');
      
    } else {
      console.log('❌ Invalid PostgreSQL connection string');
      console.log('It should start with: postgresql://');
    }
    
  } else if (choice === '2') {
    console.log('');
    console.log('🔗 Creating a new PostgreSQL database:');
    console.log('1. Go to: https://neon.tech');
    console.log('2. Sign up (it\'s free)');
    console.log('3. Create a new project');
    console.log('4. Copy the connection string');
    console.log('5. Run this script again and choose option 1');
    console.log('');
    console.log('Opening Neon.tech in your browser...');
    
    // Try to open browser (works on most systems)
    try {
      const { execSync } = require('child_process');
      if (process.platform === 'darwin') {
        execSync('open https://neon.tech');
      } else if (process.platform === 'win32') {
        execSync('start https://neon.tech');
      } else {
        execSync('xdg-open https://neon.tech');
      }
    } catch (error) {
      console.log('Please manually go to: https://neon.tech');
    }
    
  } else if (choice === '3') {
    console.log('');
    console.log('📋 MANUAL SETUP STEPS:');
    console.log('=====================');
    console.log('');
    console.log('1. Create PostgreSQL Database:');
    console.log('   • Neon.tech (recommended): https://neon.tech');
    console.log('   • Supabase: https://supabase.com');
    console.log('   • Aiven: https://aiven.io');
    console.log('');
    console.log('2. Get connection string like:');
    console.log('   postgresql://user:pass@host:5432/database');
    console.log('');
    console.log('3. Update .env file:');
    console.log('   DATABASE_URL="your_postgresql_connection_string"');
    console.log('');
    console.log('4. Add to Vercel:');
    console.log('   https://vercel.com/moha0886s-projects/quadco-app/settings/environment-variables');
    console.log('');
    console.log('5. Run database setup:');
    console.log('   node run-database-setup.js');
  }
  
  rl.close();
}

setup();
