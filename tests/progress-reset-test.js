/**
 * Progress Reset Test
 * 
 * This script tests the functionality of the workshop progress reset
 * for both AllStarTeams and Imaginal Agility applications.
 */

import readline from 'readline';
import fetch from 'node-fetch';

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Helper function to prompt for user input
function ask(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

// Login function to authenticate and get session cookies
async function login(username, password) {
  try {
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    
    if (!response.ok) {
      console.log(`Login failed with status: ${response.status}`);
      const errorText = await response.text();
      console.log(`Error: ${errorText}`);
      return null;
    }
    
    const data = await response.json();
    const cookies = response.headers.get('set-cookie');
    
    if (!data || !data.user) {
      console.log('Login response did not contain user data:', data);
      return null;
    }
    
    console.log(`Logged in as ${data.user.username} (ID: ${data.user.id})`);
    return { userId: data.user.id, cookies };
  } catch (error) {
    console.log(`Login exception: ${error.message}`);
    return null;
  }
}

// Function to test localStorage data format
async function testLocalStorage(cookies) {
  try {
    console.log('\nTesting localStorage data format...');
    
    // Example formats we need to check
    const testFormats = [
      // Format 1: Array of strings
      JSON.stringify(['1-1', '1-2', '1-3']),
      
      // Format 2: Object with completed property
      JSON.stringify({ completed: ['1-1', '1-2', '1-3'] }),
      
      // Format 3: Object with multiple properties
      JSON.stringify({ 
        completed: ['1-1', '1-2'], 
        expandedSections: ['section1'],
        currentStep: '1-2'
      })
    ];
    
    // Parse each format to test how our app would handle it
    console.log('\nTesting parsing different localStorage formats:');
    
    testFormats.forEach((format, index) => {
      try {
        const parsed = JSON.parse(format);
        console.log(`\nFormat ${index + 1} parsing:`);
        console.log(`- Original: ${format}`);
        
        // Test extracting completed steps from different formats
        let completedSteps = [];
        
        if (Array.isArray(parsed)) {
          completedSteps = parsed;
          console.log(`- Array detected, extracted ${completedSteps.length} steps`);
        } else if (parsed && typeof parsed === 'object') {
          if (Array.isArray(parsed.completed)) {
            completedSteps = parsed.completed;
            console.log(`- Object with completed array detected, extracted ${completedSteps.length} steps`);
          } else {
            console.log(`- Object without valid completed array detected`);
          }
        } else {
          console.log(`- Unknown format detected`);
        }
        
        console.log(`- Extracted completed steps: ${JSON.stringify(completedSteps)}`);
      } catch (error) {
        console.log(`Format ${index + 1} parsing error: ${error.message}`);
      }
    });
    
    return true;
  } catch (error) {
    console.log(`Error testing localStorage: ${error.message}`);
    return false;
  }
}

// Reset user data function
async function resetUserData(userId, cookies) {
  try {
    console.log(`\nResetting data for user ${userId}...`);
    
    const response = await fetch(`http://localhost:5000/api/test-users/reset/${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies
      }
    });
    
    if (!response.ok) {
      console.log(`Reset failed with status: ${response.status}`);
      const errorText = await response.text();
      console.log(`Error: ${errorText}`);
      return false;
    }
    
    const data = await response.json();
    console.log('Reset response:', data);
    return true;
  } catch (error) {
    console.log(`Reset exception: ${error.message}`);
    return false;
  }
}

// Examine localStorage keys
function explainLocalStorageHandling() {
  console.log('\n================================');
  console.log('LOCAL STORAGE HANDLING ANALYSIS');
  console.log('================================');
  
  console.log('\nIdentified storage keys:');
  console.log('- "allstarteams-navigation-progress" - AllStarTeams app');
  console.log('- "imaginal-agility-navigation-progress" - Imaginal Agility app');
  console.log('- "allstar_navigation_progress" - Legacy key (older version)');
  
  console.log('\nProblem diagnosis:');
  console.log('1. Different apps use different localStorage key formats');
  console.log('2. Some code expects array format: ["1-1", "1-2", ...]');
  console.log('3. Some code expects object format: { completed: ["1-1", "1-2", ...] }');
  console.log('4. Reset functions may not be handling both formats properly');
  
  console.log('\nRecommended fixes:');
  console.log('1. Standardize localStorage format across all apps');
  console.log('2. Update loading logic to handle both formats (for backward compatibility)');
  console.log('3. Update reset logic to clear correct localStorage keys for each app');
  console.log('4. Ensure progress tracking is updated consistently across the app');
}

// Main function
async function runTest() {
  console.log('===== WORKSHOP PROGRESS RESET TEST =====');
  
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
  
  // Step 2: Test localStorage data formats
  await testLocalStorage(cookies);
  
  // Step 3: Reset the user data
  await resetUserData(userId, cookies);
  
  // Step 4: Provide analysis and recommended fixes
  explainLocalStorageHandling();
  
  rl.close();
}

// Run the test
runTest();