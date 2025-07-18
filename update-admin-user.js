import { db } from './server/db.js';
import { eq } from 'drizzle-orm';
import { users } from './shared/schema.js';

async function updateAdminUser() {
  try {
    console.log('Updating admin user (ID 1) to be a test user...');
    
    // Update the admin user to have isTestUser = true
    const result = await db.update(users)
      .set({ 
        isTestUser: true 
      })
      .where(eq(users.id, 1))
      .returning();
    
    if (result.length > 0) {
      console.log('✅ Admin user updated successfully:');
      console.log('User ID:', result[0].id);
      console.log('Username:', result[0].username);
      console.log('Name:', result[0].name);
      console.log('Role:', result[0].role);
      console.log('Is Test User:', result[0].isTestUser);
    } else {
      console.log('❌ No user found with ID 1');
    }
    
    // Verify the update
    const verifyResult = await db.select()
      .from(users)
      .where(eq(users.id, 1));
    
    if (verifyResult.length > 0) {
      console.log('\n✅ Verification - User details:');
      console.log('ID:', verifyResult[0].id);
      console.log('Username:', verifyResult[0].username);
      console.log('Name:', verifyResult[0].name);
      console.log('Role:', verifyResult[0].role);
      console.log('Is Test User:', verifyResult[0].isTestUser);
    }
    
  } catch (error) {
    console.error('❌ Error updating admin user:', error);
  }
  
  process.exit(0);
}

updateAdminUser();
