import { db } from './server/db.ts';

async function updateUser1WithEmail() {
  try {
    console.log('🔍 Looking for user1 system administrator...\n');
    
    // First, show all admin users to find user1
    const adminResult = await db.execute(`
      SELECT id, username, name, email, role, is_test_user 
      FROM users 
      WHERE role = 'admin' OR username = 'user1'
      ORDER BY id
    `);
    
    console.log('Current admin users:');
    console.table(adminResult.rows);
    
    // Find user1 specifically
    const user1Result = await db.execute(`
      SELECT id, username, name, email, role 
      FROM users 
      WHERE username = 'user1' 
      LIMIT 1
    `);
    
    if (user1Result.rows.length === 0) {
      console.log('\n❌ user1 not found.');
      console.log('Available users shown above. You may need to create user1 first.');
      return;
    }
    
    const user1 = user1Result.rows[0];
    console.log('\n✅ Found user1:', user1);
    
    // Update user1 with the email
    const updateResult = await db.execute(`
      UPDATE users 
      SET email = 'brad@allstarteams.co',
          name = COALESCE(NULLIF(name, ''), 'Brad - System Administrator')
      WHERE username = 'user1'
      RETURNING id, username, name, email, role
    `);
    
    if (updateResult.rows.length > 0) {
      console.log('\n🎉 Successfully updated user1:');
      console.table(updateResult.rows);
      console.log('\n🔐 You can now login to Auth0 with: brad@allstarteams.co');
    } else {
      console.log('\n❌ Update failed - no rows affected');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    
    // Fallback: show the current database structure
    try {
      console.log('\n🔍 Checking database structure...');
      const tableInfo = await db.execute(`
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        ORDER BY ordinal_position
      `);
      console.log('Users table structure:');
      console.table(tableInfo.rows);
    } catch (structureError) {
      console.log('Could not check database structure:', structureError.message);
    }
  }
  
  process.exit(0);
}

updateUser1WithEmail();
