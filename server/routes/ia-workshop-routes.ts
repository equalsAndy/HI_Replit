import express from 'express';
import { requireAuth } from '../middleware/auth';
import { prisma } from '../db';

const router = express.Router();

// Get IA workshop progress
router.get('/progress', requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id;
    const progress = await prisma.workshopProgress.findFirst({
      where: {
        userId,
        workshopType: 'IA'
      }
    });
    
    res.json(progress || { workshopType: 'IA', currentStep: 'ia-1-1', completedSteps: [] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch IA workshop progress' });
  }
});

// Update IA workshop progress
router.post('/progress', requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { currentStep, completedSteps } = req.body;
    
    const progress = await prisma.workshopProgress.upsert({
      where: {
        userId_workshopType: {
          userId,
          workshopType: 'IA'
        }
      },
      update: {
        currentStep,
        completedSteps
      },
      create: {
        userId,
        workshopType: 'IA',
        currentStep,
        completedSteps
      }
    });
    
    res.json(progress);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update IA workshop progress' });
  }
});

export default router;
