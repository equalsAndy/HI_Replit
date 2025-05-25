import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to require authentication
 */
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
};

/**
 * Middleware to require admin role
 */
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  if (req.session.userRole !== 'admin') {
    return res.status(403).json({ error: 'Admin role required' });
  }
  
  next();
};

/**
 * Middleware to require facilitator role or higher
 */
export const requireFacilitator = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  if (req.session.userRole !== 'admin' && req.session.userRole !== 'facilitator') {
    return res.status(403).json({ error: 'Facilitator role or higher required' });
  }
  
  next();
};

// Extend Express Request to include user session data
declare module 'express-session' {
  interface SessionData {
    userId: number;
    username: string;
    userRole: 'admin' | 'facilitator' | 'participant';
  }
}

// Extend Express Request to include user data
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        username: string;
        role: 'admin' | 'facilitator' | 'participant';
      };
    }
  }
}