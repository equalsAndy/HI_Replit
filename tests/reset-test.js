/**
 * Simple Reset Test Utility
 * 
 * This script provides a quick way to test the reset functionality
 */

import fetch from 'node-fetch';
import readline from 'readline';

const BASE_URL = 'http://localhost:5000';

// Create readline interface for CLI interaction
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to ask questions
function ask(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

// Function to login and get cookies
async function login(username, password) {
  try {
    console.log(`Logging in as ${username}...`);
    
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        identifier: username,
        password: password
      })
    });

    if (!response.ok) {
      throw new Error(`Login failed with status: ${response.status}`);
    }

    const data = await response.json();
    console.log(`Login successful as ${username} with role: ${data.role}`);
    
    // Extract cookies from response headers
    const cookies = response.headers.get('set-cookie');
    
    return {
      userId: data.id,
      cookies
    };
  } catch (error) {
    console.error('Login failed:', error.message);
    return null;
  }
}

// Function to reset user data
async function resetUserData(userId, cookies) {
  try {
    console.log(`Resetting data for user ${userId}...`);
    
    const response = await fetch(`${BASE_URL}/api/reset`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies
      }
    });

    if (!response.ok) {
      throw new Error(`Reset failed with status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Reset successful:', data.message || 'User data reset');
    return true;
  } catch (error) {
    console.error('Reset failed:', error.message);
    return false;
  }
}

// Function to verify user's current data state
async function verifyUserData(cookies) {
  try {
    console.log(`Verifying user data...`);
    
    // Get star card data
    const starCardResponse = await fetch(`${BASE_URL}/api/starcard`, {
      headers: {
        'Cookie': cookies
      }
    });

    if (!starCardResponse.ok) {
      throw new Error(`Failed to get star card: ${starCardResponse.status}`);
    }

    const starCard = await starCardResponse.json();
    console.log('Star card data:', starCard);
    
    return starCard;
  } catch (error) {
    console.error('Error verifying user data:', error.message);
    return null;
  }
}

// Main function
async function runTest() {
  console.log('===== RESET DATA TEST =====');
  
  // Get login credentials
  const username = await ask('Enter username (default: user1): ') || 'user1';
  const password = await ask('Enter password (default: password): ') || 'password';
  
  // Step 1: Login to get session cookies
  const loginResult = await login(username, password);
  
  if (!loginResult) {
    console.log('Test aborted due to login failure');
    rl.close();
    return;
  }
  
  const { userId, cookies } = loginResult;
  
  // Step 2: Reset the user data
  await resetUserData(userId, cookies);
  
  // Step 3: Verify the reset was successful
  const data = await verifyUserData(cookies);
  
  if (data) {
    console.log('\nReset verification:');
    console.log('- Thinking score is zero:', data.thinking === 0 ? '✅ Yes' : '❌ No');
    console.log('- Acting score is zero:', data.acting === 0 ? '✅ Yes' : '❌ No');
    console.log('- Feeling score is zero:', data.feeling === 0 ? '✅ Yes' : '❌ No');
    console.log('- Planning score is zero:', data.planning === 0 ? '✅ Yes' : '❌ No');
    
    const allReset = data.thinking === 0 && data.acting === 0 && 
                     data.feeling === 0 && data.planning === 0;
    
    console.log('\nOverall reset status:', allReset ? '✅ SUCCESSFUL' : '❌ FAILED');
  } else {
    console.log('Could not verify reset status');
  }
  
  rl.close();
}

// Run the test
runTest();