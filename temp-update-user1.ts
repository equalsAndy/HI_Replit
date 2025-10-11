// Add user update endpoint - temporary for updating user1
// Add this to your server/routes or create a new route file

import { Request, Response } from 'express';
import { db } from '../db';
import { users } from '../../shared/schema';
import { eq } from 'drizzle-orm';

export async function updateUser1Email(req: Request, res: Response) {
  try {
    console.log('🔍 Looking for user1 system administrator...');
    
    // First, show all admin users
    const adminUsers = await db.select().from(users).where(eq(users.role, 'admin'));
    
    console.log('Current admin users:');
    adminUsers.forEach((user, index) => {
      console.log(`${index + 1}. ID: ${user.id}, Username: ${user.username}, Name: ${user.name}, Email: ${user.email || 'NO EMAIL'}`);
    });
    
    // Find user1 specifically
    const user1Results = await db.select().from(users).where(eq(users.username, 'user1')).limit(1);
    
    if (user1Results.length === 0) {
      return res.json({
        success: false,
        message: 'user1 not found',
        adminUsers: adminUsers.map(u => ({
          id: u.id,
          username: u.username,
          name: u.name,
          email: u.email,
          role: u.role
        }))
      });
    }
    
    const user1 = user1Results[0];
    console.log('Found user1:', user1);
    
    // Update user1 with brad's email
    const updateResult = await db.update(users)
      .set({ 
        email: 'brad@allstarteams.co',
        name: user1.name || 'Brad - System Administrator'
      })
      .where(eq(users.username, 'user1'))
      .returning();
    
    if (updateResult.length > 0) {
      console.log('✅ Successfully updated user1');
      return res.json({
        success: true,
        message: 'Successfully updated user1 with brad@allstarteams.co',
        updatedUser: {
          id: updateResult[0].id,
          username: updateResult[0].username,
          name: updateResult[0].name,
          email: updateResult[0].email,
          role: updateResult[0].role
        }
      });
    } else {
      return res.json({
        success: false,
        message: 'Update failed - no rows affected'
      });
    }
    
  } catch (error) {
    console.error('Error updating user1:', error);
    return res.status(500).json({
      success: false,
      message: 'Database error',
      error: error.message
    });
  }
}
