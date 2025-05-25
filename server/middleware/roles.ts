import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to check if a user has admin role
 */
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  // First ensure user is authenticated
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  // Check if user has admin role
  if (req.session.userRole === 'admin') {
    return next();
  }
  
  // If not admin, return 403 Forbidden
  return res.status(403).json({ error: 'Admin privileges required' });
};

/**
 * Middleware to check if user has facilitator or admin role
 */
export const isFacilitatorOrAdmin = (req: Request, res: Response, next: NextFunction) => {
  // First ensure user is authenticated
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  // Check if user has admin or facilitator role
  if (req.session.userRole === 'admin' || req.session.userRole === 'facilitator') {
    return next();
  }
  
  // If not admin or facilitator, return 403 Forbidden
  return res.status(403).json({ error: 'Insufficient privileges' });
};

/**
 * Middleware to check if a user has facilitator role
 */
export const isFacilitator = (req: Request, res: Response, next: NextFunction) => {
  // First ensure user is authenticated
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  // Check if user has facilitator role
  if (req.session.userRole === 'facilitator') {
    return next();
  }
  
  // If not facilitator, return 403 Forbidden
  return res.status(403).json({ error: 'Facilitator privileges required' });
};