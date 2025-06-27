import { Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { eq } from 'drizzle-orm';
import * as schema from '../../shared/schema';

export const requireTestUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get user ID from session or cookies
    const userId = req.session?.userId || (req.cookies?.userId ? parseInt(req.cookies.userId) : null);
    
    if (!userId) {
      return res.status(401).json({ 
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }
    
    // Check if user is a test user by querying the database
    const [user] = await db
      .select({ isTestUser: schema.users.isTestUser })
      .from(schema.users)
      .where(eq(schema.users.id, userId));
    
    if (!user?.isTestUser) {
      console.warn(`Non-test user ${userId} attempted test action`);
      return res.status(403).json({ 
        error: 'Test features only available to test users',
        code: 'TEST_USER_REQUIRED'
      });
    }
    
    next();
  } catch (error) {
    console.error('Error validating test user:', error);
    return res.status(500).json({
      error: 'Failed to validate test user status',
      code: 'VALIDATION_ERROR'
    });
  }
};

export const validateTestAction = (action: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.session?.userId || (req.cookies?.userId ? parseInt(req.cookies.userId) : null);
      
      if (!userId) {
        return res.status(401).json({ 
          error: 'Authentication required',
          code: 'AUTH_REQUIRED'
        });
      }
      
      const [user] = await db
        .select({ isTestUser: schema.users.isTestUser })
        .from(schema.users)
        .where(eq(schema.users.id, userId));
      
      if (!user?.isTestUser) {
        console.warn(`Non-test user ${userId} attempted test action: ${action}`);
        return res.status(403).json({ 
          error: `Test action '${action}' not available`,
          code: 'UNAUTHORIZED_TEST_ACTION'
        });
      }
      
      next();
    } catch (error) {
      console.error(`Error validating test action ${action}:`, error);
      return res.status(500).json({
        error: 'Failed to validate test action',
        code: 'VALIDATION_ERROR'
      });
    }
  };
};