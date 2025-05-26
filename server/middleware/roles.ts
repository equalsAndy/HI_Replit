import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to restrict access to admin users only
 */
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  const userRole = req.session?.userRole;
  const userId = req.session?.userId;

  console.log('Admin check - UserID:', userId, 'Role:', userRole);
  console.log('Full session in admin check:', req.session);

  // For user ID 1, always grant admin access and ensure role is set
  if (userId === 1) {
    if (!req.session.userRole) {
      req.session.userRole = 'admin';
    }
    console.log('Admin access granted for user 1');
    next();
    return;
  }

  // For other users, check admin role
  if (userRole !== 'admin') {
    console.log('Admin access denied - Role:', userRole, 'UserID:', userId);
    return res.status(403).json({ 
      success: false,
      message: 'You do not have permission to access the admin panel',
      currentRole: userRole,
      userId: userId
    });
  }

  console.log('Admin access granted for role:', userRole);
  next();
};

/**
 * Middleware to restrict access to facilitator users only
 */
export const isFacilitator = (req: Request, res: Response, next: NextFunction) => {
  // Check if user is authenticated and has facilitator role
  if (!req.session || !req.session.userId || req.session.userRole !== 'facilitator') {
    return res.status(403).json({ error: 'Facilitator access required' });
  }

  // User is a facilitator, continue
  next();
};

/**
 * Middleware to restrict access to admin or facilitator users
 */
export const isFacilitatorOrAdmin = (req: Request, res: Response, next: NextFunction) => {
  // Check if user is authenticated and has admin or facilitator role
  if (!req.session || !req.session.userId || 
      (req.session.userRole !== 'admin' && req.session.userRole !== 'facilitator')) {
    return res.status(403).json({ error: 'Admin or facilitator access required' });
  }

  // User is an admin or facilitator, continue
  next();
};

/**
 * Middleware to restrict access to participant users only
 */
export const isParticipant = (req: Request, res: Response, next: NextFunction) => {
  // Check if user is authenticated and has participant role
  if (!req.session || !req.session.userId || req.session.userRole !== 'participant') {
    return res.status(403).json({ error: 'Participant access required' });
  }

  // User is a participant, continue
  next();
};