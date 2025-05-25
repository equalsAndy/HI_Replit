import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../../shared/types';

/**
 * Middleware to check if user has required role(s)
 * @param allowedRoles Array of roles that are allowed to access the route
 */
export const hasRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Check if user exists in request (set by isAuthenticated middleware)
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    // Check if user has one of the allowed roles
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'Access denied: Insufficient permissions',
        requiredRoles: allowedRoles,
        userRole: req.user.role
      });
    }
    
    next();
  };
};

/**
 * Middleware to check if user is an admin
 */
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  
  next();
};

/**
 * Middleware to check if user is a facilitator or admin
 */
export const isFacilitatorOrAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  
  if (req.user.role !== 'facilitator' && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Facilitator or admin access required' });
  }
  
  next();
};