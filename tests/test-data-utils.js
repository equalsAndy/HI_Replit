/**
 * Test Data Utilities
 * 
 * This script provides utilities to test data-related features in the application:
 * - Reset user data
 * - Complete assessments with predefined data
 * - Verify completion status
 * - Test progress tracking
 */

import fetch from 'node-fetch';
import readline from 'readline';

const BASE_URL = 'http://localhost:5000';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Utility function to ask questions
function ask(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

// Function to login to the system
async function login(username, password) {
  try {
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
    return data;
  } catch (error) {
    console.error('Login failed:', error.message);
    return null;
  }
}

// Function to reset user data
async function resetUserData(userId) {
  try {
    console.log(`Resetting data for user ${userId}...`);
    
    const response = await fetch(`${BASE_URL}/api/test-users/reset/${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Reset failed with status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Reset successful:', data.message);
    return true;
  } catch (error) {
    console.error('Reset failed:', error.message);
    return false;
  }
}

// Function to complete star card assessment
async function completeStarCardAssessment(userId, quadrantData = {
  thinking: 30,
  feeling: 25,
  acting: 28,
  planning: 17
}) {
  try {
    // Step 1: Start assessment
    console.log(`Starting assessment for user ${userId}...`);
    const startResponse = await fetch(`${BASE_URL}/api/assessment/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `userId=${userId}`
      }
    });

    if (!startResponse.ok) {
      const errorData = await startResponse.json();
      if (errorData.message === 'Assessment already completed') {
        console.log('Assessment was already completed, resetting first...');
        await resetUserData(userId);
        return completeStarCardAssessment(userId, quadrantData);
      }
      throw new Error(`Failed to start assessment: ${startResponse.status}`);
    }

    console.log('Assessment started successfully');

    // Step 2: Complete assessment with mock data (simulating answers)
    console.log('Completing assessment with quadrant data:', quadrantData);
    
    const completeResponse = await fetch(`${BASE_URL}/api/assessment/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `userId=${userId}`
      },
      body: JSON.stringify({ quadrantData })
    });

    if (!completeResponse.ok) {
      throw new Error(`Failed to complete assessment: ${completeResponse.status}`);
    }

    const completionData = await completeResponse.json();
    console.log('Assessment completed successfully:', completionData);
    return completionData;
  } catch (error) {
    console.error('Error completing assessment:', error.message);
    return null;
  }
}

// Function to add flow attributes
async function addFlowAttributes(userId, attributes = [
  { name: 'Teamwork', value: 7 },
  { name: 'Communication', value: 8 },
  { name: 'Problem Solving', value: 9 }
]) {
  try {
    console.log(`Adding flow attributes for user ${userId}...`);
    
    const response = await fetch(`${BASE_URL}/api/flow-attributes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `userId=${userId}`
      },
      body: JSON.stringify({ attributes })
    });

    if (!response.ok) {
      throw new Error(`Failed to add flow attributes: ${response.status}`);
    }

    const data = await response.json();
    console.log('Flow attributes added successfully:', data);
    return data;
  } catch (error) {
    console.error('Error adding flow attributes:', error.message);
    return null;
  }
}

// Function to verify user's current data state
async function verifyUserData(userId) {
  try {
    console.log(`Verifying data for user ${userId}...`);
    
    // Get star card data
    const starCardResponse = await fetch(`${BASE_URL}/api/starcard`, {
      headers: {
        'Cookie': `userId=${userId}`
      }
    });

    if (!starCardResponse.ok) {
      throw new Error(`Failed to get star card: ${starCardResponse.status}`);
    }

    const starCard = await starCardResponse.json();
    
    // Get flow attributes
    const flowResponse = await fetch(`${BASE_URL}/api/flow-attributes`, {
      headers: {
        'Cookie': `userId=${userId}`
      }
    });

    if (!flowResponse.ok) {
      throw new Error(`Failed to get flow attributes: ${flowResponse.status}`);
    }

    const flowAttributes = await flowResponse.json();

    // Get user profile
    const profileResponse = await fetch(`${BASE_URL}/api/user/profile`, {
      headers: {
        'Cookie': `userId=${userId}`
      }
    });

    if (!profileResponse.ok) {
      throw new Error(`Failed to get user profile: ${profileResponse.status}`);
    }

    const profile = await profileResponse.json();

    const result = {
      starCard,
      flowAttributes,
      profile
    };

    console.log('Current user data:', JSON.stringify(result, null, 2));
    return result;
  } catch (error) {
    console.error('Error verifying user data:', error.message);
    return null;
  }
}

// Function to update user progress
async function updateUserProgress(userId, progress) {
  try {
    console.log(`Updating progress for user ${userId} to ${progress}%...`);
    
    const response = await fetch(`${BASE_URL}/api/user/progress`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `userId=${userId}`
      },
      body: JSON.stringify({ progress })
    });

    if (!response.ok) {
      throw new Error(`Failed to update progress: ${response.status}`);
    }

    const data = await response.json();
    console.log('Progress updated successfully:', data.message);
    return true;
  } catch (error) {
    console.error('Error updating progress:', error.message);
    return false;
  }
}

// Main function to run tests
async function runTests() {
  try {
    console.log('===== DATA TESTING UTILITIES =====');
    console.log('These utilities help test various application features');
    
    const testType = await ask(`
Select a test to run:
1. Reset User Data
2. Complete Star Card Assessment
3. Add Flow Attributes
4. Verify User Data
5. Update User Progress
6. Run Full Test Sequence
7. Exit

Enter your choice (1-7): `);

    const userId = await ask('Enter the user ID to test with: ');
    
    switch (testType) {
      case '1':
        await resetUserData(userId);
        break;
      case '2':
        await completeStarCardAssessment(userId);
        break;
      case '3':
        await addFlowAttributes(userId);
        break;
      case '4':
        await verifyUserData(userId);
        break;
      case '5':
        const progress = await ask('Enter progress value (0-100): ');
        await updateUserProgress(userId, parseInt(progress));
        break;
      case '6':
        console.log('Running full test sequence...');
        // First reset data
        await resetUserData(userId);
        
        // Verify reset was successful
        let data = await verifyUserData(userId);
        console.log('Data after reset:', 
          data?.starCard?.thinking === 0 ? 'Star card reset ✓' : 'Star card reset failed ✗',
          data?.flowAttributes?.attributes?.length === 0 ? 'Flow attributes reset ✓' : 'Flow attributes reset failed ✗'
        );
        
        // Complete assessment
        await completeStarCardAssessment(userId);
        
        // Add flow attributes
        await addFlowAttributes(userId);
        
        // Set progress to 50%
        await updateUserProgress(userId, 50);
        
        // Verify everything was set correctly
        data = await verifyUserData(userId);
        console.log('Data after full sequence:', 
          data?.starCard?.thinking > 0 ? 'Star card completed ✓' : 'Star card not completed ✗',
          data?.flowAttributes?.attributes?.length > 0 ? 'Flow attributes added ✓' : 'Flow attributes not added ✗',
          data?.profile?.progress === 50 ? 'Progress updated ✓' : 'Progress not updated ✗'
        );
        break;
      case '7':
        console.log('Exiting...');
        rl.close();
        return;
      default:
        console.log('Invalid choice, please try again.');
        break;
    }
    
    const runAnother = await ask('Would you like to run another test? (y/n): ');
    if (runAnother.toLowerCase() === 'y') {
      await runTests();
    } else {
      rl.close();
    }
  } catch (error) {
    console.error('Error running tests:', error.message);
    rl.close();
  }
}

// Run the tests
if (require.main === module) {
  runTests();
}

module.exports = {
  resetUserData,
  completeStarCardAssessment,
  addFlowAttributes,
  verifyUserData,
  updateUserProgress
};