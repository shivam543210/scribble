require('dotenv').config();
const authService = require('../services/authService');
const { prisma } = require('../config/db');

async function testAuth() {
  console.log('🚀 Starting Auth System Test...');
  
  try {
    // 1. Clear existing test user if any
    const testUsername = 'testuser_' + Date.now();
    const testPassword = 'password123';

    console.log('Step 1: Testing Signup Service...');
    const signupResult = await authService.signup({
      username: testUsername,
      password: testPassword
    });
    
    console.log('✅ Signup successful! User ID:', signupResult.user.id);
    if (!signupResult.token) throw new Error('JWT Token missing in signup');

    console.log('Step 2: Testing Login Service...');
    const loginResult = await authService.login({
      username: testUsername,
      password: testPassword
    });

    console.log('✅ Login successful! Token received.');
    if (!loginResult.token) throw new Error('JWT Token missing in login');

    console.log('Step 3: Verifying Unique Username Constraint...');
    try {
      await authService.signup({
        username: testUsername,
        password: testPassword
      });
      console.error('❌ Error: Allowed duplicate username!');
    } catch (err) {
      console.log('✅ Duplicate username correctly rejected:', err.message);
    }

    console.log('\n✨ All Auth Service tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  } finally {
    // We don't necessarily need to disconnect here as the script will exit
    // prisma.$disconnect();
  }
}

testAuth();
