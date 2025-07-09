import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to restrict access to admin users only
 */
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  const userRole = (req.session as any)?.userRole;
  const userId = (req.session as any)?.userId;

  console.log('Admin check - UserID:', userId, 'Role:', userRole);
  console.log('Full session in admin check:', req.session);

  // For user ID 1, always grant admin access and ensure role is set
  if (userId === 1) {
    if (!(req.session as any).userRole) {
      (req.session as any).userRole = 'admin';
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
  if (!req.session || !(req.session as any).userId || (req.session as any).userRole !== 'facilitator') {
    return res.status(403).json({ error: 'Facilitator access required' });
  }

  // User is a facilitator, continue
  next();
};

/**
 * Middleware to allow access to facilitators and admins
 */
export const isFacilitatorOrAdmin = (req: Request, res: Response, next: NextFunction) => {
  const userRole = (req.session as any)?.userRole;
  const userId = (req.session as any)?.userId;

  console.log('Facilitator/Admin check - UserID:', userId, 'Role:', userRole);

  // For user ID 1, always grant admin access and ensure role is set
  if (userId === 1) {
    if (!(req.session as any).userRole) {
      (req.session as any).userRole = 'admin';
    }
    console.log('Management access granted for admin user 1');
    next();
    return;
  }

  // Check if user has facilitator or admin role
  if (userRole !== 'admin' && userRole !== 'facilitator') {
    console.log('Management access denied - Role:', userRole, 'UserID:', userId);
    return res.status(403).json({ 
      success: false,
      message: 'You do not have permission to access the management console',
      currentRole: userRole,
      userId: userId
    });
  }

  console.log('Management access granted for role:', userRole);
  next();
};



/**
 * Middleware to restrict access to participant users only
 */
export const isParticipant = (req: Request, res: Response, next: NextFunction) => {
  // Check if user is authenticated and has participant role
  if (!req.session || !(req.session as any).userId || (req.session as any).userRole !== 'participant') {
    return res.status(403).json({ error: 'Participant access required' });
  }

  // User is a participant, continue
  next();
};