import express from 'express';

const router = express.Router();

// Simple IA navigation progress endpoints that return basic structure
// Uses client-side localStorage for now until database schema is updated

router.get('/ia', async (req, res) => {
  try {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ success: false, error: 'User not authenticated' });
    }

    // Return basic IA progress structure
    res.json({
      success: true,
      progress: {
        completedSteps: [],
        currentStepId: 'ia-1-1',
        appType: 'ia',
        lastVisitedAt: new Date().toISOString(),
        unlockedSteps: ['ia-1-1'],
        videoProgress: {}
      }
    });
  } catch (error) {
    console.error('Error fetching IA navigation progress:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.post('/ia', async (req, res) => {
  try {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ success: false, error: 'User not authenticated' });
    }

    const { stepId, action } = req.body;

    if (!stepId || !action) {
      return res.status(400).json({ success: false, error: 'Missing stepId or action' });
    }

    // For now, just return success - client will handle localStorage
    res.json({
      success: true,
      message: `Step ${stepId} ${action} recorded`
    });
  } catch (error) {
    console.error('Error updating IA navigation progress:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.post('/ia/video', async (req, res) => {
  try {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ success: false, error: 'User not authenticated' });
    }

    const { stepId, progress } = req.body;

    if (!stepId || !progress) {
      return res.status(400).json({ success: false, error: 'Missing stepId or progress' });
    }

    // For now, just return success - client will handle localStorage
    res.json({
      success: true,
      message: `Video progress for ${stepId} recorded`
    });
  } catch (error) {
    console.error('Error updating IA video progress:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

export default router;