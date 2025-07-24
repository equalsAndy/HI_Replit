import { Router } from 'express';
// import { VectorDBService } from '../services/vector-db.js'; // Temporarily disabled

const router = Router();
// const vectorDB = new VectorDBService(); // Temporarily disabled

// Initialize vector database (call once on startup)
router.post('/vector/init', async (req, res) => {
  try {
    const success = await vectorDB.initializeCollections();
    res.json({ success, message: success ? 'Vector DB initialized' : 'Failed to initialize' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to initialize vector database' });
  }
});

// Test vector database connection
router.get('/vector/status', async (req, res) => {
  try {
    const connected = await vectorDB.testConnection();
    res.json({ 
      status: connected ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to check vector database status' });
  }
});

// Basic knowledge endpoint for testing
router.get('/knowledge', async (req, res) => {
  try {
    // For now, return a basic response
    res.json({ 
      message: 'Knowledge base endpoint working',
      status: 'development',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get knowledge base' });
  }
});

// Basic profiles endpoint for testing
router.get('/profiles', async (req, res) => {
  try {
    // For now, return a basic response
    res.json({ 
      message: 'Profiles endpoint working',
      status: 'development',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get profiles' });
  }
});

export default router;
