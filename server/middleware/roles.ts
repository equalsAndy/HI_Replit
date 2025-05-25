import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to restrict access to admin users only
 */
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  // Check if user is authenticated and has admin role
  if (!req.session || !req.session.userId || req.session.userRole !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  // User is an admin, continue
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