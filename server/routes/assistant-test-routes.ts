import express from 'express';
import OpenAI from 'openai';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// OpenAI clients per project (reuse envs defined elsewhere)
const openaiDefault = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const openaiUltra = process.env.ULTRA_TALIA_PROJECT_ID
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY, project: process.env.ULTRA_TALIA_PROJECT_ID })
  : null;
const openaiIA = process.env.IMAGINAL_AGILITY_PROJECT_ID
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY, project: process.env.IMAGINAL_AGILITY_PROJECT_ID })
  : null;
const openaiReflection = process.env.REFLECTION_TALIA_PROJECT_ID
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY, project: process.env.REFLECTION_TALIA_PROJECT_ID })
  : null;
const openaiAllStar = process.env.ALLSTAR_TALIA_PROJECT_ID
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY, project: process.env.ALLSTAR_TALIA_PROJECT_ID })
  : null;

function getClientForProject(projectKey?: string): OpenAI {
  const key = (projectKey || '').toLowerCase();
  if (/ultra/.test(key)) return openaiUltra || openaiDefault;
  if (/ia|imaginal/.test(key)) return openaiIA || openaiDefault;
  if (/reflection/.test(key)) return openaiReflection || openaiDefault;
  if (/allstar|allstarteams|talia/.test(key)) return openaiAllStar || openaiDefault;
  return openaiDefault;
}

// POST /api/admin/ai/assistant-test/run
router.post('/assistant-test/run', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { projectKey, assistantId, prompt } = req.body as { projectKey?: string; assistantId?: string; prompt?: string };
    if (!assistantId || !prompt) {
      return res.status(400).json({ error: 'assistantId and prompt are required' });
    }

    const client = getClientForProject(projectKey);

    // Create thread
    const thread = await (client as any).beta.threads.create();
    await (client as any).beta.threads.messages.create(thread.id, { role: 'user', content: prompt });

    // Run assistant
    const run = await (client as any).beta.threads.runs.create(thread.id, { assistant_id: assistantId });

    // Poll status up to 60s
    const start = Date.now();
    let status = await (client as any).beta.threads.runs.retrieve(thread.id, run.id);
    while ((status.status === 'queued' || status.status === 'in_progress') && Date.now() - start < 60000) {
      await new Promise(r => setTimeout(r, 1500));
      status = await (client as any).beta.threads.runs.retrieve(thread.id, run.id);
    }

    if (status.status !== 'completed') {
      return res.status(500).json({ error: `Run failed: ${status.status}`, details: status });
    }

    const messages = await (client as any).beta.threads.messages.list(thread.id);
    const assistantMsg = messages.data.find((m: any) => m.role === 'assistant');
    let output = '';
    if (assistantMsg && assistantMsg.content?.[0]?.type === 'text') {
      output = assistantMsg.content[0].text.value;
    }
    return res.json({ success: true, output, run: { id: run.id, status: status.status }, threadId: thread.id });
  } catch (error: any) {
    console.error('Assistant test run failed:', error);
    return res.status(500).json({ error: 'Assistant test failed', details: error?.message || String(error) });
  }
});

export default router;

