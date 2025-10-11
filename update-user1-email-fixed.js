import { db } from './server/db.js';

async function updateUser1WithEmail() {
  try {
    console.log('🔍 Looking for user1 system administrator...\n');
    
    // First, show all admin users to find user1
    const adminResult = await db.execute(`
      SELECT id, username, name, email, role, is_test_user 
      FROM users 
      WHERE role = 'admin' OR username LIKE '%user1%' OR id <= 5
      ORDER BY id
    `);
    
    console.log('Current admin/test users:');
    console.table(adminResult.rows);
    
    // Find user1 specifically (check both username and id)
    const user1Result = await db.execute(`
      SELECT id, username, name, email, role 
      FROM users 
      WHERE username = 'user1' OR (id = 1 AND role = 'admin')
      LIMIT 1
    `);
    
    if (user1Result.rows.length === 0) {
      console.log('\n❌ user1 not found.');
      console.log('Available users shown above.');
      console.log('\n💡 Would you like me to:');
      console.log('1. Create a new admin user with brad@allstarteams.co?');
      console.log('2. Update an existing user?');
      return;
    }
    
    const user1 = user1Result.rows[0];
    console.log('\n✅ Found user1:', user1);
    
    // Update user1 with the email
    const updateResult = await db.execute(`
      UPDATE users 
      SET email = 'brad@allstarteams.co',
          name = COALESCE(NULLIF(name, ''), 'Brad - System Administrator')
      WHERE id = $1
      RETURNING id, username, name, email, role
    `, [user1.id]);
    
    if (updateResult.rows.length > 0) {
      console.log('\n🎉 Successfully updated user:');
      console.table(updateResult.rows);
      console.log('\n🔐 You can now login to Auth0 with: brad@allstarteams.co');
    } else {
      console.log('\n❌ Update failed - no rows affected');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  process.exit(0);
}

updateUser1WithEmail();
