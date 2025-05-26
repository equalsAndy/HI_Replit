import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to restrict access to admin users only
 */
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  const userRole = req.session?.userRole;
  const userId = req.session?.userId;

  console.log('Admin check - UserID:', userId, 'Role:', userRole);

  // Allow admin role or user ID 1 (primary admin)
  if (userRole !== 'admin' && userId !== 1) {
    console.log('Admin access denied - Role:', userRole, 'UserID:', userId);
    return res.status(403).json({ 
      success: false,
      message: 'Admin access required',
      currentRole: userRole,
      userId: userId
    });
  }

  console.log('Admin access granted');
  next();
};

/**
 * Middleware to restrict access to facilitator users only
 */
export const const isFacilitator = (req: Request, res: Response, next: NextFunction) => {
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