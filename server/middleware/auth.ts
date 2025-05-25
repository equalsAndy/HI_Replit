import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to check if a user is authenticated
 */
export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  // Check if session exists and has userId
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  // User is authenticated, continue
  next();
};

/**
 * Add user data to request object for convenience
 */
export const populateUserData = (req: Request, res: Response, next: NextFunction) => {
  if (req.session && req.session.userId) {
    // Add user data to request object
    req.user = {
      id: req.session.userId,
      username: req.session.username,
      role: req.session.userRole
    };
  }
  
  next();
};

/**
 * Type definition for Express Request with user data
 */
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        username: string;
        role: string;
      };
    }
  }
}