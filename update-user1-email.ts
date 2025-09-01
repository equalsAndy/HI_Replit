import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

import { db } from './server/db';
import { users } from './shared/schema';
import { eq } from 'drizzle-orm';

async function updateUser1WithEmail() {
  try {
    console.log('🔍 Looking for user1 system administrator...\n');
    
    // First, show all admin users to find user1
    const adminUsers = await db.select().from(users).where(eq(users.role, 'admin'));
    
    console.log('Current admin users:');
    adminUsers.forEach((user, index) => {
      console.log(`${index + 1}. ID: ${user.id}, Username: ${user.username}, Name: ${user.name}, Email: ${user.email || 'NO EMAIL'}, Role: ${user.role}`);
    });
    
    // Find user1 specifically
    const user1Results = await db.select().from(users).where(eq(users.username, 'user1')).limit(1);
    
    if (user1Results.length === 0) {
      console.log('\n❌ user1 not found.');
      console.log('Available admin users shown above.');
      
      // Also check if there are any users with id = 1
      const user1ById = await db.select().from(users).where(eq(users.id, 1)).limit(1);
      if (user1ById.length > 0) {
        console.log('Found user with ID 1:', user1ById[0]);
      }
      return;
    }
    
    const user1 = user1Results[0];
    console.log('\n✅ Found user1:', {
      id: user1.id,
      username: user1.username,
      name: user1.name,
      email: user1.email || 'NO EMAIL',
      role: user1.role
    });
    
    // Update user1 with the email
    const updateResult = await db.update(users)
      .set({ 
        email: 'brad@allstarteams.co',
        name: user1.name || 'Brad - System Administrator'
      })
      .where(eq(users.username, 'user1'))
      .returning();
    
    if (updateResult.length > 0) {
      console.log('\n🎉 Successfully updated user1:');
      console.log({
        id: updateResult[0].id,
        username: updateResult[0].username,
        name: updateResult[0].name,
        email: updateResult[0].email,
        role: updateResult[0].role
      });
      console.log('\n🔐 You can now login to Auth0 with: brad@allstarteams.co');
    } else {
      console.log('\n❌ Update failed - no rows affected');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\nPlease make sure your database is running and DATABASE_URL is set.');
  }
  
  process.exit(0);
}

updateUser1WithEmail();
