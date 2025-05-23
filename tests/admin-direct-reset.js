/**
 * Admin Direct Reset Test
 * 
 * This script provides a direct way to reset user data using admin credentials
 * and the database-verified results to confirm the reset worked.
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';

// Admin user credentials
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'password';

// User to reset (default is user1 with ID 2)
const TARGET_USER_ID = 2;

// Login as admin and get session cookie
async function loginAsAdmin() {
  console.log(`Logging in as admin (${ADMIN_USERNAME})...`);
  
  try {
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        identifier: ADMIN_USERNAME,
        password: ADMIN_PASSWORD
      })
    });

    if (!loginResponse.ok) {
      throw new Error(`Admin login failed with status ${loginResponse.status}`);
    }

    const userData = await loginResponse.json();
    console.log(`Successfully logged in as admin with role: ${userData.role}`);
    
    // Get the session cookie
    const cookies = loginResponse.headers.get('set-cookie');
    
    return {
      userId: userData.id,
      cookies
    };
  } catch (error) {
    console.error('Admin login error:', error.message);
    return null;
  }
}

// Function to get star card data for a specific user
async function getUserStarCard(userId, adminCookies) {
  try {
    console.log(`Fetching star card for user ${userId}...`);
    
    const response = await fetch(`${BASE_URL}/api/admin/user/${userId}/starcard`, {
      headers: {
        'Cookie': adminCookies
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        console.log(`No star card found for user ${userId}`);
        return null;
      }
      throw new Error(`Failed to get star card: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting user star card:', error.message);
    return null;
  }
}

// Function to directly reset a user's data as admin
async function resetUserDataAsAdmin(userId, adminCookies) {
  try {
    console.log(`Admin resetting data for user ${userId}...`);
    
    const response = await fetch(`${BASE_URL}/api/test-users/reset/${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': adminCookies
      }
    });

    if (!response.ok) {
      throw new Error(`Reset failed with status: ${response.status}`);
    }

    try {
      const data = await response.json();
      console.log('Reset response:', data);
      return true;
    } catch (e) {
      console.log('Note: Could not parse reset response as JSON, but reset was completed');
      return true;
    }
  } catch (error) {
    console.error('Error during admin reset:', error.message);
    return false;
  }
}

// Function to check database directly for star card data
async function checkDatabaseStarCard(userId, adminCookies) {
  try {
    console.log(`Checking database for user ${userId} star card...`);
    
    // Get raw DB data (separate endpoint)
    const response = await fetch(`${BASE_URL}/api/admin/db/star-card/${userId}`, {
      headers: {
        'Cookie': adminCookies
      }
    });

    if (response.status === 404) {
      console.log(`No star card found in database for user ${userId}`);
      return null;
    }

    if (!response.ok) {
      throw new Error(`Database check failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error checking database:', error.message);
    return null;
  }
}

// Main function to run the test
async function runTest() {
  console.log('===== ADMIN DIRECT RESET TEST =====');
  
  // Step 1: Login as admin
  const adminLogin = await loginAsAdmin();
  
  if (!adminLogin) {
    console.log('Test aborted: Admin login failed');
    return;
  }
  
  const { cookies: adminCookies } = adminLogin;
  
  // Step 2: Get initial star card data for target user
  console.log('\n=== BEFORE RESET ===');
  const beforeStarCard = await getUserStarCard(TARGET_USER_ID, adminCookies);
  
  if (beforeStarCard) {
    console.log('Star card data before reset:');
    console.log(`- Thinking: ${beforeStarCard.thinking}`);
    console.log(`- Acting: ${beforeStarCard.acting}`);
    console.log(`- Feeling: ${beforeStarCard.feeling}`);
    console.log(`- Planning: ${beforeStarCard.planning}`);
    console.log(`- State: ${beforeStarCard.state}`);
  } else {
    console.log('No star card found for user before reset');
  }
  
  // Step 3: Reset the user's data
  console.log('\n=== PERFORMING RESET ===');
  const resetSuccess = await resetUserDataAsAdmin(TARGET_USER_ID, adminCookies);
  
  if (!resetSuccess) {
    console.log('Test aborted: Reset failed');
    return;
  }
  
  // Step 4: Wait for reset to complete
  console.log('Waiting for reset to complete...');
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Step 5: Get star card data after reset
  console.log('\n=== AFTER RESET ===');
  const afterStarCard = await getUserStarCard(TARGET_USER_ID, adminCookies);
  
  if (afterStarCard) {
    console.log('Star card data after reset:');
    console.log(`- Thinking: ${afterStarCard.thinking}`);
    console.log(`- Acting: ${afterStarCard.acting}`);
    console.log(`- Feeling: ${afterStarCard.feeling}`);
    console.log(`- Planning: ${afterStarCard.planning}`);
    console.log(`- State: ${afterStarCard.state}`);
    
    // Check if values have been reset as expected
    const hasBeenReset = afterStarCard.thinking === 0 && 
                        afterStarCard.acting === 0 && 
                        afterStarCard.feeling === 0 && 
                        afterStarCard.planning === 0;
    
    console.log(`\nReset confirmed by API: ${hasBeenReset ? '✅ Yes' : '❌ No'}`);
  } else {
    console.log('No star card found for user after reset');
  }
  
  // Create a fallback endpoint to check directly for the star card reset without API filtering
  console.log('\nVerifying data directly from database...');
  const dbStarCard = await checkDatabaseStarCard(TARGET_USER_ID, adminCookies);
  
  if (dbStarCard) {
    console.log('Database star card values:');
    console.log(dbStarCard);
  } else {
    console.log('Could not verify database values directly');
  }
}

// Run the test
runTest();