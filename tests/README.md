# Testing Utilities

This directory contains testing utilities to help verify the functionality of the AllStarTeams and Imaginal Agility Workshop platforms.

## Available Test Scripts

### Quick Reset Test (`reset-test.js`)

This simple script provides a quick way to test the reset functionality:
- Logs in as a test user
- Resets the user's assessment data
- Verifies the reset was successful

**To run:**
```
node tests/reset-test.js
```

### Simple Admin Reset Test (`simple-admin-reset.js`)

This script tests the admin reset functionality:
- Shows star card data before and after reset
- Uses admin credentials to perform the reset
- Provides detailed verification of reset success

**To run:**
```
node tests/simple-admin-reset.js
```

### Login Testing (`login-test.js`)

This script verifies that users can log in with different credentials:
- Tests login with username
- Tests login with email
- Verifies login failures with invalid credentials
- Checks that correct user roles are returned

**To run:**
```
node tests/login-test.js
```

### Data Management Tests (`test-data-utils.js`)

This script helps test data-related features:
- Reset user data (clear assessment results)
- Complete assessments with predefined data
- Verify completion status
- Test progress tracking

**To run:**
```
node tests/test-data-utils.js
```

### User Management Tests (`test-user-management.js`)

This script tests user-related features:
- Login with username or email
- User creation and registration
- User profile updates
- Test user setup

**To run:**
```
node tests/test-user-management.js
```

### Role-Based Access Tests (`test-role-permissions.js`)

This script tests permission-based features:
- Admin access to restricted routes
- Facilitator-specific permissions
- Participant-level access restrictions
- Role-based UI element visibility

**To run:**
```
node tests/test-role-permissions.js
```

## How to Use

1. Make sure the application is running on `http://localhost:5000`
2. Open a terminal and navigate to the project root
3. Run the desired test script using Node.js
4. Follow the on-screen prompts to select specific tests to run

## Common Test Users

The system has several preconfigured test users:

- **Admin**: Username: `admin`, Password: `password`
- **Facilitator**: Username: `facilitator`, Password: `password`
- **Participants**: Usernames: `user1`, `user2`, etc., Password: `password`

These test users can be quickly set up using the "Setup Test Users" option in the user management test script.

## Reset Functionality

The system includes a "Reset Data" button in the navigation bar that allows users to clear their assessment data for testing purposes. This functionality:

1. Resets the star card values (thinking, acting, feeling, planning) to zero
2. Sets the star card state back to "pending"
3. Clears any flow attributes
4. Resets user progress tracking

The test scripts in this directory can help verify that this functionality is working correctly.