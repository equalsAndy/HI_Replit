import { db } from './server/db.js';

async function checkUsers() {
  try {
    const result = await db.execute(`
      SELECT id, username, name, role, is_test_user 
      FROM users 
      WHERE role = 'admin' OR id <= 5 
      ORDER BY id
    `);
    
    console.log('Admin and test users:');
    console.table(result.rows);
    
    // Also check all users with isTestUser = true
    const testUsers = await db.execute(`
      SELECT id, username, name, role, is_test_user 
      FROM users 
      WHERE is_test_user = true 
      ORDER BY id
    `);
    
    console.log('\nAll test users:');
    console.table(testUsers.rows);
    
  } catch (error) {
    console.error('Error:', error);
  }
  process.exit(0);
}

checkUsers();
