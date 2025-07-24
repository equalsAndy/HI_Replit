
import { db } from './server/db.ts';
import { users } from './shared/schema.ts';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

async function resetAdminPassword() {
  try {
    console.log('Resetting admin password...');
    
    // New password
    const newPassword = 'password';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update admin user password
    const result = await db.update(users)
      .set({ 
        password: hashedPassword,
        updatedAt: new Date()
      })
      .where(eq(users.username, 'admin'))
      .returning();
    
    if (result.length > 0) {
      console.log('Admin password reset successfully!');
      console.log('Username: admin');
      console.log('Password: password');
      console.log(`User ID: ${result[0].id}`);
    } else {
      console.log('No admin user found to update');
    }
  } catch (error) {
    console.error('Error resetting admin password:', error);
  }
  
  process.exit(0);
}

resetAdminPassword();
