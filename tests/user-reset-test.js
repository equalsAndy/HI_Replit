/**
 * User Data Reset Test Script
 * 
 * This is a simplified test script that focuses specifically on the 
 * Reset Data functionality from the NavBar. It logs in and resets
 * user data, then verifies the reset was successful.
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';

// Function to login and get a session cookie
async function login(username, password) {
  console.log(`Logging in as ${username}...`);
  
  try {
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        identifier: username,
        password: password
      })
    });

    if (!loginResponse.ok) {
      throw new Error(`Login failed with status ${loginResponse.status}`);
    }

    const userData = await loginResponse.json();
    console.log(`Successfully logged in as ${username} with role: ${userData.role}`);
    
    // Get the session cookie
    const cookies = loginResponse.headers.get('set-cookie');
    
    return {
      userId: userData.id,
      cookies
    };
  } catch (error) {
    console.error('Login error:', error.message);
    return null;
  }
}

// Function to get current star card data
async function getStarCardData(cookies) {
  try {
    console.log('Checking current star card data...');
    
    const response = await fetch(`${BASE_URL}/api/starcard`, {
      headers: {
        'Cookie': cookies
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to get star card data: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting star card data:', error.message);
    return null;
  }
}

// Function to reset user data
async function resetUserData(userId, cookies) {
  try {
    console.log(`Resetting data for user ${userId}...`);
    
    // This is the endpoint used by the NavBar "Reset Data" button
    const response = await fetch(`${BASE_URL}/api/test-users/reset/${userId}`, {
      method: 'POST',
      headers: {
        'Cookie': cookies
      }
    });

    if (!response.ok) {
      console.error(`Reset API returned status: ${response.status}`);
      return false;
    }
    
    // Force reload of data with a delay, similar to what the UI does
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return true;
  } catch (error) {
    console.error('Error resetting user data:', error.message);
    return false;
  }
}

// Main function
async function runTest() {
  console.log('===== USER DATA RESET TEST =====');
  
  // Default test user
  const username = 'user1';
  const password = 'password';
  
  // Step 1: Login to get session cookie
  const loginResult = await login(username, password);
  
  if (!loginResult) {
    console.log('Test aborted: Login failed');
    return;
  }
  
  const { userId, cookies } = loginResult;
  
  // Step 2: Get current star card data before reset
  const beforeData = await getStarCardData(cookies);
  
  if (beforeData) {
    console.log('\nBefore reset:');
    console.log(`- Thinking: ${beforeData.thinking}`);
    console.log(`- Acting: ${beforeData.acting}`);
    console.log(`- Feeling: ${beforeData.feeling}`);
    console.log(`- Planning: ${beforeData.planning}`);
    console.log(`- State: ${beforeData.state}`);
  } else {
    console.log('Could not get star card data before reset');
    return;
  }
  
  // Step 3: Perform the reset
  console.log('\nPerforming data reset...');
  await resetUserData(userId, cookies);
  
  // Step 4: Get star card data after reset
  const afterData = await getStarCardData(cookies);
  
  if (afterData) {
    console.log('\nAfter reset:');
    console.log(`- Thinking: ${afterData.thinking}`);
    console.log(`- Acting: ${afterData.acting}`);
    console.log(`- Feeling: ${afterData.feeling}`);
    console.log(`- Planning: ${afterData.planning}`);
    console.log(`- State: ${afterData.state}`);
    
    // Check if data has changed (not necessarily reset to zero - depends on the server implementation)
    const dataChanged = 
      beforeData.thinking !== afterData.thinking || 
      beforeData.acting !== afterData.acting ||
      beforeData.feeling !== afterData.feeling ||
      beforeData.planning !== afterData.planning ||
      beforeData.state !== afterData.state;
      
    console.log(`\nData changed after reset: ${dataChanged ? '✅ Yes' : '❌ No'}`);
    
    // Additional tests for a complete reset - depending on your implementation
    // Some reset implementations create a new blank record rather than zero out the existing one
    const completeReset = afterData.state === 'pending' || 
                        (afterData.thinking === 0 && 
                         afterData.acting === 0 &&
                         afterData.feeling === 0 &&
                         afterData.planning === 0);
    
    console.log(`Reset implementation check: ${completeReset ? '✅ Complete' : '❓ Partial'}`);
  } else {
    console.log('Could not get star card data after reset');
  }
}

// Run the test
runTest();