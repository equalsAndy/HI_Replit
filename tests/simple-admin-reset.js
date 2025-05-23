/**
 * Simple Admin Reset Test
 * 
 * This script tests the admin reset functionality directly
 * without any complex checks or verifications.
 */

import fetch from 'node-fetch';

// Admin credentials
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'password';

// Target user to reset (user1)
const TARGET_USER_ID = 2;  

// Base URL for API
const BASE_URL = 'http://localhost:5000';

// Function to get star card data for a user
async function getStarCard(userId, cookies) {
  try {
    const response = await fetch(`${BASE_URL}/api/starcard`, {
      headers: {
        'Cookie': cookies
      }
    });
    
    if (!response.ok) {
      console.error(`Failed to get star card: ${response.status}`);
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error getting star card:', error);
    return null;
  }
}

// Main function
async function main() {
  console.log('===== SIMPLE ADMIN RESET TEST =====');
  
  try {
    // Step 1: Login as the user we want to reset
    console.log('Logging in as user1...');
    const userLoginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: 'user1',
        password: 'password'
      })
    });
    
    if (!userLoginResponse.ok) {
      throw new Error(`User login failed: ${userLoginResponse.status}`);
    }
    
    const userData = await userLoginResponse.json();
    console.log(`Logged in as ${userData.username} with role: ${userData.role}`);
    
    // Extract cookies for authenticated requests
    const userCookies = userLoginResponse.headers.get('set-cookie');
    
    // Step 2: Check star card data before reset
    console.log('\nChecking star card data BEFORE reset:');
    const beforeData = await getStarCard(TARGET_USER_ID, userCookies);
    console.log(beforeData);
    
    // Step 3: Login as admin
    console.log('\nLogging in as admin...');
    const adminLoginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: ADMIN_USERNAME,
        password: ADMIN_PASSWORD
      })
    });
    
    if (!adminLoginResponse.ok) {
      throw new Error(`Admin login failed: ${adminLoginResponse.status}`);
    }
    
    const adminData = await adminLoginResponse.json();
    console.log(`Logged in as ${adminData.username} with role: ${adminData.role}`);
    
    // Extract cookies for authenticated requests
    const adminCookies = adminLoginResponse.headers.get('set-cookie');
    
    // Step 4: Reset the target user directly
    console.log(`\nResetting user ${TARGET_USER_ID}...`);
    const resetResponse = await fetch(`${BASE_URL}/api/test-users/reset/${TARGET_USER_ID}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': adminCookies
      }
    });
    
    console.log('Reset response status:', resetResponse.status);
    
    // Wait for the reset to complete
    console.log('\nWaiting for reset to complete...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Step 5: Check star card data after reset (log in as user1 again to get fresh data)
    console.log('\nLogging in as user1 again...');
    const userLoginAgainResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: 'user1',
        password: 'password'
      })
    });
    
    if (!userLoginAgainResponse.ok) {
      throw new Error(`User login failed: ${userLoginAgainResponse.status}`);
    }
    
    const userAgainData = await userLoginAgainResponse.json();
    const userAgainCookies = userLoginAgainResponse.headers.get('set-cookie');
    
    console.log('\nChecking star card data AFTER reset:');
    const afterData = await getStarCard(TARGET_USER_ID, userAgainCookies);
    console.log(afterData);
    
    // Step 6: Compare before and after data
    if (beforeData && afterData) {
      console.log('\nComparing data:');
      console.log(`Thinking: ${beforeData.thinking} -> ${afterData.thinking}`);
      console.log(`Acting: ${beforeData.acting} -> ${afterData.acting}`);
      console.log(`Feeling: ${beforeData.feeling} -> ${afterData.feeling}`);
      console.log(`Planning: ${beforeData.planning} -> ${afterData.planning}`);
      console.log(`State: ${beforeData.state} -> ${afterData.state}`);
      
      const dataChanged = 
        beforeData.thinking !== afterData.thinking ||
        beforeData.acting !== afterData.acting ||
        beforeData.feeling !== afterData.feeling ||
        beforeData.planning !== afterData.planning ||
        beforeData.state !== afterData.state;
      
      console.log('\nData changed after reset:', dataChanged ? '✅ Yes' : '❌ No');
      
      const resetToZero = 
        afterData.thinking === 0 && 
        afterData.acting === 0 && 
        afterData.feeling === 0 && 
        afterData.planning === 0;
      
      console.log('Reset to zero:', resetToZero ? '✅ Yes' : '❌ No');
      
      const resetToPending = afterData.state === 'pending';
      
      console.log('Reset to pending state:', resetToPending ? '✅ Yes' : '❌ No');
      
      const resetComplete = resetToZero && resetToPending;
      
      console.log('\nOverall reset status:', resetComplete ? '✅ SUCCESSFUL' : '❌ FAILED');
    }
    
  } catch (error) {
    console.error('Test error:', error.message);
  }
}

// Run the test
main();