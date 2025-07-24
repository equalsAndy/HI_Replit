import express from 'express';
import { 
  getFeatureStatus, 
  getDetailedFlagStatus, 
  runFlagTests, 
  enableAIFeatures 
} from '../middleware/feature-flags.js';
import { requireDevelopment } from '../middleware/validateFlags.js';

const router = express.Router();

// Public endpoint - basic feature status
router.get('/status', getFeatureStatus);

// Development-only endpoints
router.get('/detailed', requireDevelopment, getDetailedFlagStatus);
router.get('/test', requireDevelopment, runFlagTests);
router.post('/ai/enable', requireDevelopment, enableAIFeatures);

export default router;