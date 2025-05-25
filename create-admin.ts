import { db } from './server/db';
import { users } from './shared/schema';
import bcrypt from 'bcryptjs';
import { sql } from 'drizzle-orm';

async function createAdminUser() {
  try {
    console.log('Connecting to database...');
    
    // Check if an admin user already exists
    const existingAdmin = await db.select().from(users).where(sql`email = 'admin@heliotropeimaginal.com'`).limit(1);
    
    if (existingAdmin.length > 0) {
      console.log('An admin user already exists:', existingAdmin[0].username);
      return;
    }
    
    // Admin user details
    const adminUser = {
      username: 'admin',
      password: await bcrypt.hash('Heliotrope@2025', 10), // Strong default password
      first_name: 'System',
      last_name: 'Administrator',
      name: 'System Administrator',
      email: 'admin@heliotropeimaginal.com',
      organization: 'Heliotrope Imaginal Workshops',
      title: 'System Administrator',
      role: 'admin',
      job_title: 'System Administrator',
      created_at: new Date(),
      updated_at: new Date()
    };
    
    // Insert the admin user
    const result = await db.insert(users).values(adminUser);
    
    console.log('Admin user created successfully!');
    console.log('Username: admin');
    console.log('Password: Heliotrope@2025');
    console.log('Please change this password after first login');
    
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    // Close any open connections
    process.exit(0);
  }
}

// Run the function
createAdminUser();