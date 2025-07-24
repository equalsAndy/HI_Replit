import dotenv from 'dotenv';
import postgres from 'postgres';

// Load environment variables first
dotenv.config();

async function debugAdminAuth() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL environment variable is not set');
    process.exit(1);
  }

  const sql = postgres(databaseUrl);

  try {
    console.log('🔍 DEBUGGING ADMIN AUTHENTICATION');
    console.log('==================================\n');

    // Check if there are any admin users
    const adminUsers = await sql`
      SELECT id, name, email, role, username
      FROM users 
      WHERE role IN ('admin', 'facilitator')
      ORDER BY role, created_at
    `;

    console.log(`👥 Admin/Facilitator Users (${adminUsers.length} found):`);
    if (adminUsers.length === 0) {
      console.log('   ❌ NO ADMIN USERS FOUND!');
      console.log('   📝 You need to create an admin user first.');
      console.log('\n🛠️  Creating a test admin user...');
      
      // Create a test admin user
      await sql`
        INSERT INTO users (
          username, password, name, email, role, 
          organization, job_title, is_test_user,
          content_access, ast_access, ia_access,
          created_at, updated_at
        ) VALUES (
          'admin',
          '$2b$10$K7L/gXl.3HK0P2S1TH9q4eR8rP9jJ6xF7k4Z8Q5M2N1L9V6S8T4U3', -- password: 'admin123'
          'Test Admin',
          'admin@test.com',
          'admin',
          'Test Organization',
          'Administrator',
          true,
          'professional',
          true,
          true,
          NOW(),
          NOW()
        )
        ON CONFLICT (email) DO NOTHING
      `;
      
      console.log('   ✅ Test admin user created!');
      console.log('   📧 Email: admin@test.com');
      console.log('   🔑 Password: admin123');
      console.log('   👤 Username: admin');
    } else {
      adminUsers.forEach((user: any) => {
        console.log(`   ✅ ${user.email} (${user.role}) - Username: ${user.username || 'N/A'}`);
      });
    }

    // Check recent sessions to see if anyone is logged in
    console.log('\n🔐 Active Sessions:');
    try {
      const sessions = await sql`
        SELECT 
          sess,
          expire,
          (sess->>'userId')::integer as user_id
        FROM session 
        WHERE expire > NOW() 
        ORDER BY expire DESC 
        LIMIT 5
      `;

      if (sessions.length === 0) {
        console.log('   ❌ No active sessions found');
        console.log('   💡 You need to log in to access the admin console');
      } else {
        console.log(`   ✅ ${sessions.length} active session(s) found`);
        for (const session of sessions) {
          if (session.user_id) {
            const user = await sql`
              SELECT name, email, role 
              FROM users 
              WHERE id = ${session.user_id}
            `;
            if (user.length > 0) {
              console.log(`   👤 ${user[0].name} (${user[0].role}) - expires: ${session.expire}`);
            }
          }
        }
      }
    } catch (error) {
      console.log('   ℹ️  Session table not accessible or doesn\'t exist');
    }

    await sql.end();

    console.log('\n🚀 NEXT STEPS TO FIX BLANK CONSOLE:');
    console.log('=====================================');
    console.log('1. 🌐 Go to: http://localhost:8080');
    console.log('2. 🔐 Log in with admin credentials shown above');
    console.log('3. 🏠 Navigate to: /admin/dashboard');
    console.log('4. 🔧 Open browser DevTools (F12)');
    console.log('5. 📄 Go to Console tab');
    console.log('6. 🔍 Look for these debug messages:');
    console.log('   • "Debug - Full userProfile: ..."');
    console.log('   • "Debug - Extracted currentUser: ..."');
    console.log('7. 📊 If userProfile is null or undefined, the issue is authentication');
    console.log('8. 📊 If currentUser is null, the issue is user extraction');
    console.log('\n❗ Common Issues:');
    console.log('   • Not logged in as admin/facilitator');
    console.log('   • Session expired');
    console.log('   • Browser cache showing old content');
    console.log('   • API response structure changed');

  } catch (error) {
    console.error('❌ Debug failed:', error);
    await sql.end();
    throw error;
  }
}

// Execute debugging
debugAdminAuth()
  .then(() => {
    console.log('\n✅ Debug completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Debug failed:', error);
    process.exit(1);
  });
