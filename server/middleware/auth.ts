import { Request, Response, NextFunction } from 'express';
import { db } from '../db';
import * as schema from '../../shared/schema';
import { eq } from 'drizzle-orm';

/**
 * Middleware to check if user is authenticated
 * Adds user object to request if authenticated
 */
export const isAuthenticated = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get user ID from cookie
    const userId = req.cookies.userId ? parseInt(req.cookies.userId) : null;
    
    if (!userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    // Get user details
    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, userId));
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    // Check if user has been soft-deleted
    if (user.deletedAt) {
      return res.status(401).json({ message: 'Account has been deactivated' });
    }
    
    // Get user roles
    const [userRole] = await db
      .select()
      .from(schema.userRoles)
      .where(eq(schema.userRoles.userId, userId));
    
    // Add user to request object
    req.user = {
      ...user,
      role: userRole?.role || 'participant' // Default to participant if no role found
    };
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Extend Request interface to include user property
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}