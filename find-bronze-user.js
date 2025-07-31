/**
 * Script to find user with name "Bronze"
 */

import { Pool } from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: 'server/.env.development' });

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function findBronzeUser() {
  try {
    console.log('🔍 Looking for user named "Bronze"...');
    
    // Search for users with "Bronze" in name or username
    const result = await pool.query(`
      SELECT id, name, username, email 
      FROM users 
      WHERE LOWER(name) LIKE '%bronze%' 
         OR LOWER(username) LIKE '%bronze%'
      ORDER BY id
    `);
    
    if (result.rows.length === 0) {
      console.log('❌ No user found with "Bronze" in name or username');
      
      // Show all users for reference
      const allUsers = await pool.query(`
        SELECT id, name, username 
        FROM users 
        WHERE id BETWEEN 10 AND 20
        ORDER BY id
      `);
      
      console.log('\n📋 Users 10-20 for reference:');
      allUsers.rows.forEach(user => {
        console.log(`  ID ${user.id}: ${user.name || user.username}`);
      });
      
    } else {
      console.log('✅ Found users with "Bronze":');
      result.rows.forEach(user => {
        console.log(`  ID ${user.id}: ${user.name || user.username} (${user.email})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error searching for Bronze user:', error);
  } finally {
    await pool.end();
  }
}

findBronzeUser();