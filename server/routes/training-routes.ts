/**
 * Training Routes
 * ==============
 * API endpoints for Talia training system
 */

import { Router } from 'express';
import { taliaTrainingService } from '../services/talia-training-service.js';

const router = Router();

/**
 * Add training text from admin console
 * POST /api/training/add-text
 */
router.post('/add-text', async (req, res) => {
  try {
    const { personaId, trainingText } = req.body;
    const adminUserId = req.session?.userId;

    if (!adminUserId) {
      return res.status(401).json({ 
        success: false, 
        error: 'Admin authentication required' 
      });
    }

    if (!personaId || !trainingText) {
      return res.status(400).json({ 
        success: false, 
        error: 'PersonaId and trainingText are required' 
      });
    }

    if (trainingText.trim().length < 10) {
      return res.status(400).json({ 
        success: false, 
        error: 'Training text must be at least 10 characters long' 
      });
    }

    await taliaTrainingService.addTrainingFromAdmin(
      personaId, 
      trainingText.trim(), 
      adminUserId.toString()
    );

    res.json({ 
      success: true, 
      message: 'Training text added successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error adding training text:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to add training text' 
    });
  }
});

/**
 * Get training data for a persona
 * GET /api/training/data/:personaId
 */
router.get('/data/:personaId', async (req, res) => {
  try {
    const { personaId } = req.params;
    const adminUserId = req.session?.userId;

    if (!adminUserId) {
      return res.status(401).json({ 
        success: false, 
        error: 'Admin authentication required' 
      });
    }

    const trainingData = await taliaTrainingService.loadTrainingData(personaId);

    res.json({ 
      success: true, 
      data: trainingData || { 
        trainingSessions: [], 
        guidelines: [], 
        examples: [], 
        lastUpdated: null 
      }
    });

  } catch (error) {
    console.error('❌ Error loading training data:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to load training data' 
    });
  }
});

/**
 * Get active training sessions (for admin monitoring)
 * GET /api/training/active-sessions
 */
router.get('/active-sessions', async (req, res) => {
  try {
    const adminUserId = req.session?.userId;

    if (!adminUserId) {
      return res.status(401).json({ 
        success: false, 
        error: 'Admin authentication required' 
      });
    }

    // Since activeSessions is private, we'll return a summary
    res.json({ 
      success: true, 
      message: 'Active sessions monitoring endpoint - implementation depends on privacy requirements',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error getting active sessions:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get active sessions' 
    });
  }
});

export default router;