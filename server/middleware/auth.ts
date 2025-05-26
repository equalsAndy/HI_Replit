import { Request, Response, NextFunction } from 'express';

// Define user types in Express Request
declare global {
  namespace Express {
    interface User {
      id: number;
      username: string;
      role: 'admin' | 'facilitator' | 'participant';
      name: string;
      email: string;
    }

    interface Session {
      userId?: number;
      username?: string;
      userRole?: 'admin' | 'facilitator' | 'participant';
    }
  }
}

/**
 * Middleware to require authentication
 */
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const sessionUserId = req.session?.userId;
  const cookieUserId = req.cookies?.userId;

  console.log('Auth check - Session:', sessionUserId, 'Cookie:', cookieUserId);
  console.log('Full session data:', req.session);

  const userId = sessionUserId || (cookieUserId ? parseInt(cookieUserId) : null);

  if (!userId) {
    console.log('Authentication failed - no valid user ID');
    return res.status(401).json({ 
      success: false,
      message: 'Authentication required' 
    });
  }

  // Ensure session has the user ID and role
  if (!req.session.userId) {
    req.session.userId = userId;
  }

  // For user 1 (admin), ensure admin role is set
  if (userId === 1 && !req.session.userRole) {
    req.session.userRole = 'admin';
    req.session.username = 'admin';
  }

  console.log('Authentication successful for user:', userId, 'Role:', req.session.userRole);
  next();
};

/**
 * Middleware to require admin role
 */
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.userId) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
  }

  if (req.session.userRole !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Admin privileges required'
    });
  }

  next();
};

/**
 * Middleware to require facilitator role or higher
 */
export const requireFacilitator = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.userId) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
  }

  if (req.session.userRole !== 'admin' && req.session.userRole !== 'facilitator') {
    return res.status(403).json({
      success: false,
      error: 'Facilitator privileges required'
    });
  }

  next();
};

/**
 * Middleware to attach the user to the request if authenticated
 */
export const attachUser = (req: Request, res: Response, next: NextFunction) => {
  if (req.session.userId) {
    req.user = {
      id: req.session.userId,
      username: req.session.username || '',
      role: req.session.userRole || 'participant',
      name: '',  // These are placeholders as we don't store these in the session
      email: ''  // for security reasons
    };
  }

  next();
};