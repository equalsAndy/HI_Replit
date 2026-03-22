import express from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { getAssistantManager, getOpenAIClient } from '../services/openai-api-service.js';

const router = express.Router();

// GET /api/admin/ai/assistants/resources
router.get('/assistants/resources', requireAuth, requireAdmin, async (_req, res) => {
  try {
    const mgr = getAssistantManager();
    const assistants = mgr.getAllAssistants().map(a => ({
      id: a.id,
      name: a.name,
      purpose: a.purpose,
      vectorStoreId: a.vectorStoreId,
      model: a.model
    }));
    res.json({ success: true, assistants });
  } catch (error) {
    console.error('Error fetching assistants:', error);
    res.status(500).json({ success: false, error: 'Failed to load assistant resources' });
  }
});

// GET /api/admin/ai/vector-store/:vectorStoreId/files
router.get('/vector-store/:vectorStoreId/files', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { vectorStoreId } = req.params as { vectorStoreId: string };
    const projectKey = (req.query.projectKey as string | undefined) || '';
    // Choose client: default or project-based
    let client: any = getOpenAIClient();
    if (/ultra/i.test(projectKey) && process.env.ULTRA_TALIA_PROJECT_ID) {
      const OpenAI = (await import('openai')).default;
      client = new (OpenAI as any)({ apiKey: process.env.OPENAI_API_KEY, project: process.env.ULTRA_TALIA_PROJECT_ID });
    }
    const files = await client.beta.vectorStores.files.list(vectorStoreId);
    const items = (files?.data || []).map((f: any) => ({ id: f.id, filename: f.filename, createdAt: f.created_at, status: f.status }));
    res.json({ success: true, files: items });
  } catch (error) {
    console.error('Error listing vector store files:', error);
    res.status(500).json({ success: false, error: 'Failed to list vector store files' });
  }
});

export default router;
