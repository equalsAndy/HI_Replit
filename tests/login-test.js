/**
 * User Login Test Script
 * 
 * This script tests the login functionality with different credentials:
 * - Login with username
 * - Login with email
 * - Invalid credentials
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

// Function to attempt login
async function attemptLogin(identifier, password) {
  try {
    console.log(`Attempting login with identifier: ${identifier}`);
    
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        identifier,
        password
      })
    });

    const status = response.status;
    let data = null;
    
    if (response.ok) {
      data = await response.json();
      console.log('✅ Login successful!');
      console.log(`User: ${data.username}`);
      console.log(`Name: ${data.firstName} ${data.lastName}`);
      console.log(`Role: ${data.role}`);
    } else {
      console.log(`❌ Login failed with status: ${status}`);
    }
    
    return {
      success: response.ok,
      status,
      data
    };
  } catch (error) {
    console.error('Error during login attempt:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// Function to run an interactive login test
async function runInteractiveTest() {
  console.log('===== INTERACTIVE LOGIN TEST =====');
  
  const identifier = await ask('Enter username or email: ');
  const password = await ask('Enter password: ');
  
  const result = await attemptLogin(identifier, password);
  
  if (result.success) {
    console.log('\nLogin details:');
    console.log('-------------------------');
    console.log(`ID: ${result.data.id}`);
    console.log(`Username: ${result.data.username}`);
    console.log(`Email: ${result.data.email}`);
    console.log(`Name: ${result.data.firstName} ${result.data.lastName}`);
    console.log(`Role: ${result.data.role}`);
    console.log('-------------------------');
  }
  
  rl.close();
}

// Function to run automated login tests
async function runAutomatedTests() {
  console.log('===== AUTOMATED LOGIN TESTS =====');
  
  // Test users (modify as needed for your system)
  const testUsers = [
    { description: 'Admin with username', identifier: 'admin', password: 'password', expectedRole: 'admin' },
    { description: 'Admin with email', identifier: 'admin@example.com', password: 'password', expectedRole: 'admin' },
    { description: 'Facilitator with username', identifier: 'facilitator', password: 'password', expectedRole: 'facilitator' },
    { description: 'Participant with username', identifier: 'user1', password: 'password', expectedRole: 'participant' },
    { description: 'Invalid username', identifier: 'nonexistent', password: 'password', expectedSuccess: false },
    { description: 'Invalid password', identifier: 'admin', password: 'wrongpassword', expectedSuccess: false }
  ];
  
  let successCount = 0;
  let failureCount = 0;
  
  for (const testCase of testUsers) {
    console.log(`\nTest: ${testCase.description}`);
    console.log(`Identifier: ${testCase.identifier}`);
    
    const result = await attemptLogin(testCase.identifier, testCase.password);
    
    const expectedSuccess = testCase.expectedSuccess !== false;
    
    if (result.success === expectedSuccess) {
      if (result.success) {
        const roleMatches = result.data.role === testCase.expectedRole;
        if (roleMatches) {
          console.log(`✅ Test passed: Login successful and role matches (${result.data.role})`);
          successCount++;
        } else {
          console.log(`❌ Test failed: Login successful but role does not match. Expected: ${testCase.expectedRole}, Got: ${result.data.role}`);
          failureCount++;
        }
      } else {
        console.log('✅ Test passed: Login failed as expected');
        successCount++;
      }
    } else {
      if (expectedSuccess) {
        console.log('❌ Test failed: Login should have succeeded but failed');
      } else {
        console.log('❌ Test failed: Login should have failed but succeeded');
      }
      failureCount++;
    }
  }
  
  console.log('\n===== TEST SUMMARY =====');
  console.log(`Total tests: ${testUsers.length}`);
  console.log(`Passed: ${successCount}`);
  console.log(`Failed: ${failureCount}`);
  console.log(`Success rate: ${Math.round((successCount / testUsers.length) * 100)}%`);
  
  rl.close();
}

// Main function
async function main() {
  console.log('===== USER LOGIN TEST =====');
  console.log('This script tests the login functionality of the application');
  
  const testType = await ask(`
Select a test to run:
1. Interactive Login Test (single login)
2. Automated Login Tests (multiple test cases)
3. Exit

Enter your choice (1-3): `);

  switch (testType) {
    case '1':
      await runInteractiveTest();
      break;
    case '2':
      await runAutomatedTests();
      break;
    case '3':
      console.log('Exiting...');
      rl.close();
      break;
    default:
      console.log('Invalid option, defaulting to interactive test');
      await runInteractiveTest();
      break;
  }
}

// Run the main function
main();