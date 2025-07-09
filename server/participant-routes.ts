import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { storage } from './storage.js';

// Create router for participant management routes
const participantRouter = Router();

// Middleware to check if user has admin or facilitator role
const requireAdminOrFacilitator = async (req: Request, res: Response, next: Function) => {
  try {
    // Get user ID from cookie
    const userId = req.cookies.userId ? parseInt(req.cookies.userId) : null;
    
    if (!userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    // Get user details
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    // Check if user has admin or facilitator role
    const isAdmin = user.role === 'admin';
    const isFacilitator = user.role === 'facilitator';
    
    if (!isAdmin && !isFacilitator) {
      return res.status(403).json({ message: 'Access denied: Admin or Facilitator role required' });
    }
    
    // If user is admin or facilitator, proceed to the next middleware/route handler
    next();
  } catch (error) {
    console.error('Error in admin/facilitator authentication:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Apply middleware to all routes
participantRouter.use(requireAdminOrFacilitator);

// Get participants for a cohort
participantRouter.get('/cohorts/:cohortId/participants', async (req: Request, res: Response) => {
  try {
    const cohortId = parseInt(req.params.cohortId);
    
    if (isNaN(cohortId)) {
      return res.status(400).json({ message: 'Invalid cohort ID' });
    }
    
    // Get cohort to check if it exists
    const cohort = await storage.getCohort(cohortId);
    
    if (!cohort) {
      return res.status(404).json({ message: 'Cohort not found' });
    }
    
    // Get participants
    const participants = await storage.getCohortParticipants(cohortId);
    
    // Return participants without passwords
    const participantsWithoutPasswords = participants.map(participant => {
      const { password: _, ...participantWithoutPassword } = participant;
      return participantWithoutPassword;
    });
    
    res.status(200).json(participantsWithoutPasswords);
  } catch (error) {
    console.error('Error getting participants:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add a participant to a cohort
participantRouter.post('/cohorts/:cohortId/participants', async (req: Request, res: Response) => {
  try {
    const cohortId = parseInt(req.params.cohortId);
    
    if (isNaN(cohortId)) {
      return res.status(400).json({ message: 'Invalid cohort ID' });
    }
    
    // Validate request body
    const addParticipantSchema = z.object({
      userId: z.number().int().positive('User ID must be a positive integer'),
    });
    
    const { userId } = addParticipantSchema.parse(req.body);
    
    // Check if cohort exists
    const cohort = await storage.getCohort(cohortId);
    
    if (!cohort) {
      return res.status(404).json({ message: 'Cohort not found' });
    }
    
    // Check if user exists
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Add participant to cohort
    await storage.addParticipantToCohort(cohortId, userId);
    
    res.status(200).json({ message: 'Participant added to cohort successfully' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid input', errors: error.errors });
    }
    console.error('Error adding participant to cohort:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove a participant from a cohort
participantRouter.delete('/cohorts/:cohortId/participants/:userId', async (req: Request, res: Response) => {
  try {
    const cohortId = parseInt(req.params.cohortId);
    const userId = parseInt(req.params.userId);
    
    if (isNaN(cohortId) || isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid cohort ID or user ID' });
    }
    
    // Check if cohort exists
    const cohort = await storage.getCohort(cohortId);
    
    if (!cohort) {
      return res.status(404).json({ message: 'Cohort not found' });
    }
    
    // Remove participant from cohort
    await storage.removeParticipantFromCohort(cohortId, userId);
    
    res.status(200).json({ message: 'Participant removed from cohort successfully' });
  } catch (error) {
    console.error('Error removing participant from cohort:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export { participantRouter };