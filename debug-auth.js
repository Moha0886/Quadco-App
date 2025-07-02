#!/usr/bin/env node

/**
 * Debug Authentication Issue
 */

console.log('🔍 Debugging Authentication...\n');

const API_BASE = 'https://quadco-it317bpig-moha0886s-projects.vercel.app';

async function debugAuth() {
  try {
    console.log('Testing login API with detailed response...');
    
    const response = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'superadmin@quadco.com',
        password: 'SuperAdmin2025!'
      })
    });

    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    
    const responseText = await response.text();
    console.log('Response:', responseText);
    
    if (response.status === 401) {
      console.log('\n🔍 401 Unauthorized could mean:');
      console.log('1. User does not exist in production database');
      console.log('2. Password is incorrect');
      console.log('3. Authentication logic issue');
      
      // Try the other admin user
      console.log('\n🔄 Trying alternative admin credentials...');
      const response2 = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'admin@quadco.com',
          password: 'admin123'
        })
      });
      
      console.log('Alternative login status:', response2.status);
      const responseText2 = await response2.text();
      console.log('Alternative response:', responseText2);
    }

  } catch (error) {
    console.error('Error:', error.message);
  }
}

debugAuth();
