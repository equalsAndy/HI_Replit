import { Router } from 'express';
import { z } from 'zod';
import { storage } from './storage.js';
const participantRouter = Router();
const requireAdminOrFacilitator = async (req, res, next) => {
    try {
        const userId = req.cookies.userId ? parseInt(req.cookies.userId) : null;
        if (!userId) {
            return res.status(401).json({ message: 'Not authenticated' });
        }
        const user = await storage.getUser(userId);
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }
        const isAdmin = user.role === 'admin';
        const isFacilitator = user.role === 'facilitator';
        if (!isAdmin && !isFacilitator) {
            return res.status(403).json({ message: 'Access denied: Admin or Facilitator role required' });
        }
        next();
    }
    catch (error) {
        console.error('Error in admin/facilitator authentication:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
participantRouter.use(requireAdminOrFacilitator);
participantRouter.get('/cohorts/:cohortId/participants', async (req, res) => {
    try {
        const cohortId = parseInt(req.params.cohortId);
        if (isNaN(cohortId)) {
            return res.status(400).json({ message: 'Invalid cohort ID' });
        }
        const cohort = await storage.getCohort(cohortId);
        if (!cohort) {
            return res.status(404).json({ message: 'Cohort not found' });
        }
        const participants = await storage.getCohortParticipants(cohortId);
        const participantsWithoutPasswords = participants.map(participant => {
            const { password: _, ...participantWithoutPassword } = participant;
            return participantWithoutPassword;
        });
        res.status(200).json(participantsWithoutPasswords);
    }
    catch (error) {
        console.error('Error getting participants:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
participantRouter.post('/cohorts/:cohortId/participants', async (req, res) => {
    try {
        const cohortId = parseInt(req.params.cohortId);
        if (isNaN(cohortId)) {
            return res.status(400).json({ message: 'Invalid cohort ID' });
        }
        const addParticipantSchema = z.object({
            userId: z.number().int().positive('User ID must be a positive integer'),
        });
        const { userId } = addParticipantSchema.parse(req.body);
        const cohort = await storage.getCohort(cohortId);
        if (!cohort) {
            return res.status(404).json({ message: 'Cohort not found' });
        }
        const user = await storage.getUser(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        await storage.addParticipantToCohort(cohortId, userId);
        res.status(200).json({ message: 'Participant added to cohort successfully' });
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: 'Invalid input', errors: error.errors });
        }
        console.error('Error adding participant to cohort:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
participantRouter.delete('/cohorts/:cohortId/participants/:userId', async (req, res) => {
    try {
        const cohortId = parseInt(req.params.cohortId);
        const userId = parseInt(req.params.userId);
        if (isNaN(cohortId) || isNaN(userId)) {
            return res.status(400).json({ message: 'Invalid cohort ID or user ID' });
        }
        const cohort = await storage.getCohort(cohortId);
        if (!cohort) {
            return res.status(404).json({ message: 'Cohort not found' });
        }
        await storage.removeParticipantFromCohort(cohortId, userId);
        res.status(200).json({ message: 'Participant removed from cohort successfully' });
    }
    catch (error) {
        console.error('Error removing participant from cohort:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
export { participantRouter };
