import { db } from './server/db.js';
import { users } from './shared/schema.js';
import { eq } from 'drizzle-orm';

async function createAuth0AdminUser() {
  try {
    console.log('Creating Auth0-compatible admin user...');
    
    // Replace with your actual email that you want to use for Auth0 login
    const adminEmail = 'brad@allstarteams.co'; // Brad's admin email
    
    // Check if user already exists
    const existingUser = await db.select()
      .from(users)
      .where(eq(users.email, adminEmail))
      .limit(1);
    
    if (existingUser.length > 0) {
      console.log('Admin user already exists:', existingUser[0]);
      return;
    }
    
    // Create the admin user for Auth0
    const result = await db.insert(users).values({
      email: adminEmail,
      name: 'Admin User', 
      role: 'admin',
      organization: 'Heliotrope Imaginal',
      jobTitle: 'Administrator',
      username: 'admin', // Optional for Auth0 users
      isTestUser: false
    }).returning();
    
    console.log('Auth0 admin user created successfully:', result[0]);
    console.log(`You can now login to Auth0 with: ${adminEmail}`);
    
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
  
  process.exit(0);
}

createAuth0AdminUser();
