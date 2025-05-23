# Testing Utilities

This directory contains testing utilities to help verify the functionality of the AllStarTeams and Imaginal Agility Workshop platforms.

## Available Test Scripts

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