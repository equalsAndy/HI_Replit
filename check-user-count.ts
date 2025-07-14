
import { db } from './server/db.js';
import { users } from './shared/schema.js';
import { sql } from 'drizzle-orm';

async function checkUserCount() {
  try {
    console.log('Connecting to Neon PostgreSQL database...');
    
    // Get total user count
    const totalUsers = await db.select({ count: sql`count(*)` }).from(users);
    
    // Get users by role
    const usersByRole = await db.execute(sql`
      SELECT role, COUNT(*) as count 
      FROM users 
      GROUP BY role 
      ORDER BY role
    `);
    
    // Get test vs non-test users
    const testUserCount = await db.execute(sql`
      SELECT 
        is_test_user,
        COUNT(*) as count 
      FROM users 
      GROUP BY is_test_user
    `);
    
    console.log('\n=== NEON DATABASE USER COUNT ===');
    console.log(`Total Users: ${totalUsers[0].count}`);
    
    console.log('\n--- Users by Role ---');
    (usersByRole as any[]).forEach(row => {
      console.log(`${row.role}: ${row.count}`);
    });
    
    console.log('\n--- Test vs Regular Users ---');
    (testUserCount as any[]).forEach(row => {
      const userType = row.is_test_user ? 'Test Users' : 'Regular Users';
      console.log(`${userType}: ${row.count}`);
    });
    
    // Get recent users (created in last 7 days)
    const recentUsers = await db.execute(sql`
      SELECT COUNT(*) as count 
      FROM users 
      WHERE created_at >= NOW() - INTERVAL '7 days'
    `);
    
    console.log(`\nUsers created in last 7 days: ${(recentUsers as any[])[0].count}`);
    
    console.log('\n=== DATABASE CONNECTION INFO ===');
    console.log(`Database URL: ${process.env.DATABASE_URL?.substring(0, 50)}...`);
    
  } catch (error) {
    console.error('Error checking user count:', error);
  }
  
  process.exit(0);
}

checkUserCount();
