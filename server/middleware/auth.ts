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
  const sessionUserId = (req.session as any)?.userId;
  const cookieUserId = req.cookies?.userId;

  console.log('Auth check - Session:', sessionUserId, 'Cookie:', cookieUserId);
  
  // Log session data safely (sanitized to avoid base64 profile pictures)
  const sessionCopy = { ...req.session };
  if (sessionCopy.user?.profilePicture && sessionCopy.user.profilePicture.length > 100) {
    sessionCopy.user.profilePicture = `[Base64 Data - ${sessionCopy.user.profilePicture.length} characters]`;
  }
  console.log('Full session data:', sessionCopy);

  const userId = sessionUserId || (cookieUserId ? parseInt(cookieUserId) : null);

  if (!userId) {
    console.log('Authentication failed - no valid user ID');
    return res.status(401).json({ 
      success: false,
      message: 'Authentication required' 
    });
  }

  // Ensure session has the user ID and role
  if (!(req.session as any).userId) {
    (req.session as any).userId = userId;
  }

  // For user 1 (admin), ensure admin role is set
  if (userId === 1 && !(req.session as any).userRole) {
    (req.session as any).userRole = 'admin';
    (req.session as any).username = 'admin';
  }

  console.log('Authentication successful for user:', userId, 'Role:', (req.session as any).userRole);
  next();
};

/**
 * Middleware to require admin role
 */
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!(req.session as any).userId) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
  }

  if ((req.session as any).userRole !== 'admin') {
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
  if (!(req.session as any).userId) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
  }

  if ((req.session as any).userRole !== 'admin' && (req.session as any).userRole !== 'facilitator') {
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
  if ((req.session as any).userId) {
    (req as any).user = {
      id: (req.session as any).userId,
      username: (req.session as any).username || '',
      role: (req.session as any).userRole || 'participant',
      name: '',
      email: ''
    };
  }

  next();
};