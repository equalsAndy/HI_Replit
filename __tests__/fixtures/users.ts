/**
 * User Test Fixtures
 * ==================
 * Reusable test data for user-related tests
 */

export const testUsers = {
  admin: {
    id: 1,
    username: 'admin',
    name: 'Admin User',
    email: 'admin@heliotropeimaginal.com',
    role: 'admin',
    isAdmin: true,
    password: 'password',
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  
  facilitator: {
    id: 2,
    username: 'facilitator',
    name: 'Facilitator User',
    email: 'facilitator@heliotropeimaginal.com',
    role: 'facilitator',
    isAdmin: false,
    password: 'password',
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  
  participant: {
    id: 3,
    username: 'participant',
    name: 'Participant User',
    email: 'participant@example.com',
    role: 'participant',
    isAdmin: false,
    password: 'password',
    createdAt: '2025-01-01T00:00:00.000Z'
  },
  
  testUser: {
    id: 4,
    username: 'testuser1',
    name: 'Test User 1',
    email: 'testuser1@example.com',
    role: 'participant',
    isAdmin: false,
    isTestUser: true,
    password: 'password',
    createdAt: '2025-01-01T00:00:00.000Z'
  }
}

export const invalidUsers = {
  invalidEmail: {
    username: 'invalid',
    name: 'Invalid User',
    email: 'not-an-email',
    password: 'password'
  },
  
  shortPassword: {
    username: 'shortpass',
    name: 'Short Password',
    email: 'short@example.com',
    password: '123'
  },
  
  missingFields: {
    username: 'incomplete'
    // Missing required fields
  }
}

export const loginCredentials = {
  validAdmin: {
    username: 'admin',
    password: 'password'
  },
  
  validAdminEmail: {
    email: 'admin@heliotropeimaginal.com',
    password: 'password'
  },
  
  invalidCredentials: {
    username: 'admin',
    password: 'wrongpassword'
  },
  
  nonExistentUser: {
    username: 'nonexistent',
    password: 'password'
  }
}