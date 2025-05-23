/**
 * Role-Based Access Control Testing
 * 
 * This script tests role-based access permissions in the application:
 * - Admin access to restricted routes
 * - Facilitator-specific permissions
 * - Participant-level access restrictions
 * - Role-based UI element visibility
 */

const fetch = require('node-fetch');
const readline = require('readline');

const BASE_URL = 'http://localhost:5000';

// Test users with different roles (using standard test users)
const TEST_USERS = {
  admin: { username: 'admin', password: 'password', expectedRole: 'admin' },
  facilitator: { username: 'facilitator', password: 'password', expectedRole: 'facilitator' },
  participant: { username: 'user1', password: 'password', expectedRole: 'participant' }
};

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

// Function to login and get cookie
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
    console.log(`Successfully logged in as ${username} with role: ${data.role}`);
    
    // Extract cookies from response headers
    const cookies = response.headers.get('set-cookie');
    
    return {
      user: data,
      cookies
    };
  } catch (error) {
    console.error('Login failed:', error.message);
    return null;
  }
}

// Function to test access to an admin-only route
async function testAdminAccess(cookies) {
  try {
    console.log('Testing access to admin-only route...');
    
    const response = await fetch(`${BASE_URL}/api/admin/users`, {
      headers: {
        Cookie: cookies
      }
    });

    console.log(`Admin route access status: ${response.status}`);
    
    if (response.ok) {
      console.log('✅ Successfully accessed admin route');
      return true;
    } else {
      console.log('❌ Access to admin route denied');
      return false;
    }
  } catch (error) {
    console.error('Error testing admin access:', error.message);
    return false;
  }
}

// Function to test access to a participant-only route
async function testParticipantAccess(cookies) {
  try {
    console.log('Testing access to participant data route...');
    
    const response = await fetch(`${BASE_URL}/api/starcard`, {
      headers: {
        Cookie: cookies
      }
    });

    console.log(`Participant route access status: ${response.status}`);
    
    if (response.ok) {
      console.log('✅ Successfully accessed participant route');
      return true;
    } else {
      console.log('❌ Access to participant route denied');
      return false;
    }
  } catch (error) {
    console.error('Error testing participant access:', error.message);
    return false;
  }
}

// Function to run a full role access test
async function testRoleBasedAccess(role) {
  const testUser = TEST_USERS[role];
  
  if (!testUser) {
    console.error(`No test user defined for role: ${role}`);
    return false;
  }
  
  // Login as the test user
  const loginResult = await login(testUser.username, testUser.password);
  
  if (!loginResult) {
    return false;
  }
  
  const { user, cookies } = loginResult;
  
  // Verify that the user has the expected role
  const hasCorrectRole = user.role === testUser.expectedRole;
  console.log(`Role verification: ${hasCorrectRole ? '✅ Correct' : '❌ Incorrect'}`);
  
  // Test admin access
  const adminAccessResult = await testAdminAccess(cookies);
  
  // Test participant access
  const participantAccessResult = await testParticipantAccess(cookies);
  
  // Check if access matches expectations based on role
  const expectedAdminAccess = role === 'admin';
  const adminAccessMatches = adminAccessResult === expectedAdminAccess;
  
  console.log(`Admin access test: ${adminAccessMatches ? '✅ Behaves as expected' : '❌ Unexpected behavior'}`);
  
  // All participants (including admins and facilitators) should have access to participant routes
  console.log(`Participant access test: ${participantAccessResult ? '✅ Access granted (expected)' : '❌ Access denied (unexpected)'}`);
  
  return {
    role,
    hasCorrectRole,
    adminAccessMatches,
    participantAccessResult
  };
}

// Main function to run tests
async function runTests() {
  try {
    console.log('===== ROLE-BASED ACCESS TESTING =====');
    console.log('These tests verify that role-based permissions are working correctly');
    
    const testType = await ask(`
Select a test to run:
1. Test Admin Role Access
2. Test Facilitator Role Access
3. Test Participant Role Access
4. Run All Role Tests
5. Exit

Enter your choice (1-5): `);

    switch (testType) {
      case '1':
        await testRoleBasedAccess('admin');
        break;
      case '2':
        await testRoleBasedAccess('facilitator');
        break;
      case '3':
        await testRoleBasedAccess('participant');
        break;
      case '4':
        console.log('Running all role tests...');
        
        console.log('\n=== ADMIN ROLE TEST ===');
        const adminResult = await testRoleBasedAccess('admin');
        
        console.log('\n=== FACILITATOR ROLE TEST ===');
        const facilitatorResult = await testRoleBasedAccess('facilitator');
        
        console.log('\n=== PARTICIPANT ROLE TEST ===');
        const participantResult = await testRoleBasedAccess('participant');
        
        console.log('\n=== SUMMARY ===');
        console.log('Admin test:', adminResult.adminAccessMatches ? '✅ Pass' : '❌ Fail');
        console.log('Facilitator test:', !facilitatorResult.adminAccessMatches ? '✅ Pass' : '❌ Fail');
        console.log('Participant test:', !participantResult.adminAccessMatches ? '✅ Pass' : '❌ Fail');
        
        const allTestsPass = 
          adminResult.adminAccessMatches && 
          !facilitatorResult.adminAccessMatches && 
          !participantResult.adminAccessMatches &&
          adminResult.participantAccessResult &&
          facilitatorResult.participantAccessResult &&
          participantResult.participantAccessResult;
        
        console.log('\nOverall role test result:', allTestsPass ? '✅ PASS' : '❌ FAIL');
        
        break;
      case '5':
        console.log('Exiting...');
        rl.close();
        return;
      default:
        console.log('Invalid choice, please try again.');
        break;
    }
    
    const runAnother = await ask('\nWould you like to run another test? (y/n): ');
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
  testRoleBasedAccess,
  testAdminAccess,
  testParticipantAccess
};