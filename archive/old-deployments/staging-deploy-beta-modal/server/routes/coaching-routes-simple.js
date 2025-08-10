import { Router } from 'express';
const router = Router();
router.post('/vector/init', async (req, res) => {
    try {
        const success = await vectorDB.initializeCollections();
        res.json({ success, message: success ? 'Vector DB initialized' : 'Failed to initialize' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to initialize vector database' });
    }
});
router.get('/vector/status', async (req, res) => {
    try {
        const connected = await vectorDB.testConnection();
        res.json({
            status: connected ? 'connected' : 'disconnected',
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to check vector database status' });
    }
});
router.get('/knowledge', async (req, res) => {
    try {
        res.json({
            message: 'Knowledge base endpoint working',
            status: 'development',
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to get knowledge base' });
    }
});
router.get('/profiles', async (req, res) => {
    try {
        res.json({
            message: 'Profiles endpoint working',
            status: 'development',
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to get profiles' });
    }
});
export default router;
