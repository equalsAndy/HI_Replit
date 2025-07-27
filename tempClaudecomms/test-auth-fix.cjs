// Quick test to check authentication issue
const bcrypt = require('bcryptjs');
const postgres = require('postgres');

const sql = postgres('postgresql://bradtopliff@localhost:5432/heliotrope_dev');

async function testAuth() {
  try {
    // Test if we can find the user
    const users = await sql`SELECT username, password FROM users WHERE username = 'simple'`;
    console.log('Found users:', users.length);
    
    if (users.length > 0) {
      const user = users[0];
      console.log('Username:', user.username);
      console.log('Password hash exists:', !!user.password);
      console.log('Password hash length:', user.password?.length);
      
      // Test password verification
      const testPassword = 'test123';
      const isValid = await bcrypt.compare(testPassword, user.password);
      console.log('Password test123 is valid:', isValid);
      
      // Test with admin password
      const isValidAdmin = await bcrypt.compare('admin', user.password);
      console.log('Password admin is valid:', isValidAdmin);
    }
    
    await sql.end();
  } catch (error) {
    console.error('Error:', error);
    await sql.end();
  }
}

testAuth();