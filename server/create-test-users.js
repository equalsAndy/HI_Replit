import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

// Define user roles
const UserRole = {
  Admin: 'admin',
  Facilitator: 'facilitator',
  Participant: 'participant'
};

async function createTestUsers() {
  try {
    // Connect to database
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL
    });

    // Standard password for all test users
    const password = 'password';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // List of test users to create
    const testUsers = [
      { username: 'admin', name: 'Admin User', role: UserRole.Admin },
      { username: 'facilitator', name: 'Facilitator User', role: UserRole.Facilitator },
      { username: 'user1', name: 'Participant One', role: UserRole.Participant },
      { username: 'user2', name: 'Participant Two', role: UserRole.Participant }
    ];
    
    // Create or update each test user
    for (const userData of testUsers) {
      console.log(`Setting up user: ${userData.username} with role ${userData.role}`);
      
      // Check if user exists
      const userResult = await pool.query(
        'SELECT id FROM users WHERE username = $1',
        [userData.username]
      );
      
      let userId;
      
      if (userResult.rows.length > 0) {
        // Update existing user
        userId = userResult.rows[0].id;
        await pool.query(
          'UPDATE users SET name = $1, password = $2, updated_at = NOW() WHERE id = $3',
          [userData.name, hashedPassword, userId]
        );
        console.log(`Updated existing user ${userData.username} (ID: ${userId})`);
      } else {
        // Create new user
        const newUserResult = await pool.query(
          'INSERT INTO users (username, password, name, created_at, updated_at) VALUES ($1, $2, $3, NOW(), NOW()) RETURNING id',
          [userData.username, hashedPassword, userData.name]
        );
        userId = newUserResult.rows[0].id;
        console.log(`Created new user ${userData.username} (ID: ${userId})`);
      }
      
      // Remove existing roles for this user
      await pool.query(
        'DELETE FROM user_roles WHERE user_id = $1',
        [userId]
      );
      console.log(`Removed existing roles for ${userData.username}`);
      
      // Add the role
      await pool.query(
        'INSERT INTO user_roles (user_id, role) VALUES ($1, $2)',
        [userId, userData.role]
      );
      console.log(`Added role ${userData.role} to ${userData.username}`);
    }
    
    await pool.end();
    console.log('Test users setup complete');
  } catch (error) {
    console.error('Error setting up test users:', error);
  }
}

// Run the function
createTestUsers();