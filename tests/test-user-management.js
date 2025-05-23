/**
 * User Management Test Utilities
 * 
 * This script provides utilities to test user-related features:
 * - Login with username or email
 * - User creation and registration
 * - User profile updates
 * - Role-based access verification
 */

const fetch = require('node-fetch');
const readline = require('readline');

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

// Function to test login with username
async function testLoginWithUsername(username, password) {
  try {
    console.log(`Testing login with username: ${username}`);
    
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
    console.log('Login successful:', data);
    return data;
  } catch (error) {
    console.error('Login failed:', error.message);
    return null;
  }
}

// Function to test login with email
async function testLoginWithEmail(email, password) {
  try {
    console.log(`Testing login with email: ${email}`);
    
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        identifier: email,
        password: password
      })
    });

    if (!response.ok) {
      throw new Error(`Login failed with status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Login successful:', data);
    return data;
  } catch (error) {
    console.error('Login failed:', error.message);
    return null;
  }
}

// Function to register a new user
async function registerNewUser(userData) {
  try {
    console.log(`Registering new user: ${userData.username}`);
    
    const response = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Registration failed: ${errorData.message || response.status}`);
    }

    const data = await response.json();
    console.log('User registration successful:', data);
    return data;
  } catch (error) {
    console.error('Registration failed:', error.message);
    return null;
  }
}

// Function to get available test users
async function getTestUsers() {
  try {
    console.log('Getting list of test users...');
    
    const response = await fetch(`${BASE_URL}/api/auth/test-users`);

    if (!response.ok) {
      throw new Error(`Failed to get test users: ${response.status}`);
    }

    const data = await response.json();
    console.log('Test users retrieved:', data);
    return data;
  } catch (error) {
    console.error('Failed to get test users:', error.message);
    return null;
  }
}

// Function to setup test users
async function setupTestUsers() {
  try {
    console.log('Setting up test users...');
    
    const response = await fetch(`${BASE_URL}/api/auth/setup-test-users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to setup test users: ${response.status}`);
    }

    const data = await response.json();
    console.log('Test users setup successful:', data);
    return data;
  } catch (error) {
    console.error('Failed to setup test users:', error.message);
    return null;
  }
}

// Function to update user profile
async function updateUserProfile(userId, profileData) {
  try {
    console.log(`Updating profile for user ${userId}...`);
    
    const response = await fetch(`${BASE_URL}/api/user/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `userId=${userId}`
      },
      body: JSON.stringify(profileData)
    });

    if (!response.ok) {
      throw new Error(`Failed to update profile: ${response.status}`);
    }

    const data = await response.json();
    console.log('Profile update successful:', data);
    return data;
  } catch (error) {
    console.error('Failed to update profile:', error.message);
    return null;
  }
}

// Function to generate a random test user
function generateTestUser() {
  const randomNum = Math.floor(Math.random() * 10000);
  return {
    username: `test_user_${randomNum}`,
    password: 'password123',
    name: `Test User ${randomNum}`,
    email: `test${randomNum}@example.com`,
    title: 'Test Title',
    organization: 'Test Organization'
  };
}

// Main function to run tests
async function runTests() {
  try {
    console.log('===== USER MANAGEMENT TESTING UTILITIES =====');
    console.log('These utilities help test user-related features');
    
    const testType = await ask(`
Select a test to run:
1. Test Login with Username
2. Test Login with Email
3. Register New User
4. Get Available Test Users
5. Setup Test Users (admin, facilitator, users)
6. Update User Profile
7. Run User Creation & Login Test Sequence
8. Exit

Enter your choice (1-8): `);

    switch (testType) {
      case '1':
        const username = await ask('Enter username to test login: ');
        const password1 = await ask('Enter password: ');
        await testLoginWithUsername(username, password1);
        break;
      case '2':
        const email = await ask('Enter email to test login: ');
        const password2 = await ask('Enter password: ');
        await testLoginWithEmail(email, password2);
        break;
      case '3':
        console.log('Enter new user details:');
        const newUser = {
          username: await ask('Username: '),
          password: await ask('Password: '),
          name: await ask('Name: '),
          email: await ask('Email (optional, press Enter to skip): '),
          title: await ask('Title (optional, press Enter to skip): '),
          organization: await ask('Organization (optional, press Enter to skip): ')
        };
        
        // Clean up empty optional fields
        Object.keys(newUser).forEach(key => {
          if (newUser[key] === '') {
            newUser[key] = null;
          }
        });
        
        await registerNewUser(newUser);
        break;
      case '4':
        await getTestUsers();
        break;
      case '5':
        await setupTestUsers();
        break;
      case '6':
        const userId = await ask('Enter user ID to update profile: ');
        const profileUpdateData = {
          name: await ask('New name (press Enter to skip): '),
          email: await ask('New email (press Enter to skip): '),
          title: await ask('New title (press Enter to skip): '),
          organization: await ask('New organization (press Enter to skip): ')
        };
        
        // Clean up empty fields
        Object.keys(profileUpdateData).forEach(key => {
          if (profileUpdateData[key] === '') {
            delete profileUpdateData[key];
          }
        });
        
        await updateUserProfile(userId, profileUpdateData);
        break;
      case '7':
        console.log('Running user creation & login test sequence...');
        
        // First, ensure test users are set up
        await setupTestUsers();
        
        // Get current test users
        const testUsers = await getTestUsers();
        
        if (testUsers && testUsers.length > 0) {
          // Test login with username for the first test user
          const testUser = testUsers[0];
          await testLoginWithUsername(testUser.username, 'password');
          
          // Create a random new user
          const randomUser = generateTestUser();
          const newUserData = await registerNewUser(randomUser);
          
          if (newUserData) {
            // Test login with the newly created user
            await testLoginWithUsername(randomUser.username, randomUser.password);
            
            // Test login with email for the newly created user
            if (randomUser.email) {
              await testLoginWithEmail(randomUser.email, randomUser.password);
            }
            
            // Update the user's profile
            if (newUserData.id) {
              await updateUserProfile(newUserData.id, {
                name: `Updated ${randomUser.name}`,
                title: 'Updated Title'
              });
            }
          }
        }
        break;
      case '8':
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
  testLoginWithUsername,
  testLoginWithEmail,
  registerNewUser,
  getTestUsers,
  setupTestUsers,
  updateUserProfile
};