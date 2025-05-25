import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to check if a user is authenticated via session
 */
export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  // Check if user is authenticated via session
  if (req.session && req.session.userId) {
    return next();
  }
  
  // If not authenticated, return 401 Unauthorized
  return res.status(401).json({ error: 'Authentication required' });
};

// Add session type augmentation to include our custom session properties
declare module 'express-session' {
  interface SessionData {
    userId: number;
    username: string;
    userRole: 'admin' | 'facilitator' | 'participant';
  }
}