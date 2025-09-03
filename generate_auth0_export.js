import { Pool } from 'pg';

const pool = new Pool({
  connectionString: 'postgresql://dbmasteruser:HeliotropeDev2025@ls-3a6b051cdbc2d5e1ea4c550eb3e0cc5aef8be307.cvue4a2gwocx.us-west-2.rds.amazonaws.com:5432/postgres?sslmode=require'
});

async function exportUsers() {
  try {
    const result = await pool.query(`
      SELECT id, name, email, role, organization, job_title, 
             is_test_user, is_beta_tester, password, email_verified
      FROM users 
      ORDER BY id
    `);
    
    const users = result.rows.map(user => {
      const auth0User = {
        email: user.email,
        email_verified: user.email_verified || true,
        name: user.name,
        blocked: false,
        app_metadata: {
          role: user.role,
          organization: user.organization || '',
          job_title: user.job_title || '',
          is_test_user: user.is_test_user || false,
          is_beta_tester: user.is_beta_tester || false,
          internal_user_id: user.id
        },
        user_metadata: {}
      };
      
      // Add password_hash if available
      if (user.password) {
        auth0User.password_hash = user.password;
      }
      
      return auth0User;
    });
    
    console.log(JSON.stringify(users, null, 2));
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

exportUsers();