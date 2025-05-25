import { Request, Response, NextFunction } from 'express';
import { userManagementService } from '../services/user-management-service';

// Check if user is authenticated
export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  // Check if user is logged in
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  next();
};

// Check if user is admin
export const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
  // First check if authenticated
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  // Then check if admin
  if (req.session.userRole !== 'admin') {
    return res.status(403).json({ error: 'Admin privileges required' });
  }
  
  next();
};

// Check if user is facilitator
export const isFacilitator = async (req: Request, res: Response, next: NextFunction) => {
  // First check if authenticated
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  // Then check if facilitator or admin (admins can do everything facilitators can)
  if (req.session.userRole !== 'facilitator' && req.session.userRole !== 'admin') {
    return res.status(403).json({ error: 'Facilitator privileges required' });
  }
  
  next();
};

// Check if user is participant
export const isParticipant = async (req: Request, res: Response, next: NextFunction) => {
  // First check if authenticated
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  // All authenticated users are at least participants, so this is just a sanity check
  next();
};