/**
 * Test script to verify student invite creation
 */
import { db } from './server/db/index.js';
import { sql } from 'drizzle-orm';

async function testStudentInviteCreation() {
  try {
    console.log('Testing student invite creation...');
    
    // Generate a test invite code
    const inviteCode = 'TEST' + Date.now();
    
    // Test inserting a student invite
    const result = await db.execute(sql`
      INSERT INTO invites (invite_code, email, role, name, created_by, expires_at)
      VALUES (${inviteCode}, 'test@example.com', 'student', 'Test Student', 1, NULL)
      RETURNING *
    `);
    
    console.log('Insert result:', result);
    console.log('Result structure:', {
      hasRows: !!result.rows,
      isArray: Array.isArray(result),
      length: result.length,
      firstElement: result[0]
    });
    
    // Try to access the data
    const inviteData = result[0] || result.rows?.[0];
    console.log('Extracted invite data:', inviteData);
    
    if (inviteData) {
      console.log('✅ Student invite creation successful');
      console.log('Invite details:', {
        code: inviteData.invite_code,
        email: inviteData.email,
        role: inviteData.role,
        name: inviteData.name
      });
    } else {
      console.log('❌ Failed to extract invite data from result');
    }
    
  } catch (error) {
    console.error('❌ Error testing student invite creation:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      constraint: error.constraint
    });
  }
  
  process.exit(0);
}

testStudentInviteCreation();