// Simple script to get user data for Auth0 migration testing
// Run with: NODE_ENV=development node --env-file=.env get-users-for-migration.js

const { Client } = require('pg');

async function getUsersForMigration() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Get sample users - focusing on test users and those with interesting names
    const result = await client.query(`
      SELECT 
        id,
        username,
        name,
        email,
        role,
        organization,
        job_title,
        is_test_user,
        content_access,
        created_at
      FROM users 
      WHERE 
        name ILIKE '%fred%' OR 
        name ILIKE '%barney%' OR 
        name ILIKE '%flintstone%' OR 
        name ILIKE '%rubble%' OR
        username ILIKE '%fred%' OR 
        username ILIKE '%barney%' OR
        is_test_user = true OR
        role = 'admin' OR
        id <= 10
      ORDER BY id
      LIMIT 20
    `);

    console.log('\n📋 Found users for migration testing:');
    console.table(result.rows);

    // Create Auth0 migration format
    const auth0MigrationData = result.rows.map(user => ({
      email: user.email || `${user.username}@example.com`,
      email_verified: true,
      given_name: user.name ? user.name.split(' ')[0] : user.username,
      family_name: user.name ? user.name.split(' ').slice(1).join(' ') || 'User' : 'User',
      app_metadata: {
        interface: user.content_access || (user.role === 'admin' ? 'professional' : 'student'),
        flags: {
          beta: user.is_test_user || false,
          test: user.is_test_user || false,
          migrated: true
        },
        legacy_role: user.role || 'participant',
        legacy_id: user.id,
        legacy_username: user.username
      },
      user_metadata: {
        organization: user.organization,
        job_title: user.job_title,
        original_created_at: user.created_at
      }
    }));

    console.log('\n🔄 Auth0 Migration Format:');
    console.log(JSON.stringify(auth0MigrationData, null, 2));

    // Also create update SQL for adding emails to existing users
    console.log('\n📝 SQL to add emails to existing users:');
    result.rows.forEach(user => {
      if (!user.email) {
        const email = `${user.username}@example.com`;
        console.log(`UPDATE users SET email = '${email}' WHERE id = ${user.id}; -- ${user.name || user.username}`);
      }
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

getUsersForMigration();
