import express from 'express';
import OpenAI from 'openai';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Instantiate an OpenAI client for the Imaginal Agility project if configured
function getIaClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY not set');
  const iaProject = process.env.IMAGINAL_AGILITY_PROJECT_ID;
  return iaProject ? new OpenAI({ apiKey, project: iaProject }) : new OpenAI({ apiKey });
}

function getIaAssistantId(variant?: 'hq' | 'fast'): string {
  if (variant === 'fast') {
    return (
      process.env.IA_ASSISTANT_ID_FAST ||
      'asst_T2PHoj8DJ6sWHlfoWyba2Wq0'
    );
  }
  // default to HQ
  return (
    process.env.IA_ASSISTANT_ID ||
    process.env.IA_ASSISTANT_ID_HQ ||
    'asst_ujxKbOaEw5HCiFygwxGR6XP4'
  );
}

// Start a conversation (create a thread) for IA assistant
router.post('/ia/chat/conversation', requireAuth, express.json(), async (req, res) => {
  try {
    const client = getIaClient();
    const { stepId, contextData } = req.body as { stepId?: string; contextData?: any };

    const thread = await (client as any).beta.threads.create();

    // Optionally we could seed context as a system/user message; for now, keep empty thread
    return res.json({ success: true, conversation: { id: thread.id }, stepId, hasContext: !!contextData });
  } catch (e: any) {
    console.error('IA chat: init failed', e);
    return res.status(500).json({ success: false, error: 'Failed to initialize IA conversation' });
  }
});

// Send a message and get AI response
router.post('/ia/chat/message', requireAuth, express.json(), async (req, res) => {
  try {
    const client = getIaClient();
    const { conversationId, message, stepId, contextData, assistantId: overrideId, assistantVariant } = req.body as {
      conversationId?: string;
      message?: string;
      stepId?: string;
      contextData?: any;
      assistantId?: string;
      assistantVariant?: 'hq' | 'fast';
    };

    if (!conversationId || !message) {
      return res.status(400).json({ success: false, error: 'conversationId and message are required' });
    }

    // Compose message content; include lightweight context for richer replies
    const contextSnippet = contextData ? `\n\nContext: ${safeStringify(contextData).slice(0, 2000)}` : '';
    await (client as any).beta.threads.messages.create(conversationId, {
      role: 'user',
      content: `${message}${contextSnippet}`
    });

    const assistantId = overrideId || getIaAssistantId(assistantVariant);
    const run = await (client as any).beta.threads.runs.create(conversationId, { assistant_id: assistantId });
    // Poll for completion up to 60s
    const start = Date.now();
    let status = await (client as any).beta.threads.runs.retrieve(conversationId, run.id);
    while ((status.status === 'queued' || status.status === 'in_progress') && Date.now() - start < 60000) {
      await new Promise(r => setTimeout(r, 1200));
      status = await (client as any).beta.threads.runs.retrieve(conversationId, run.id);
    }
    if (status.status !== 'completed') {
      return res.status(500).json({ success: false, error: `Run failed: ${status.status}` });
    }
    const messages = await (client as any).beta.threads.messages.list(conversationId);
    const assistantMsg = messages.data.find((m: any) => m.role === 'assistant');
    const text = assistantMsg?.content?.[0]?.type === 'text' ? assistantMsg.content[0].text.value : '';
    return res.json({ success: true, response: { content: text, metadata: { stepId, assistantId } } });
  } catch (e: any) {
    console.error('IA chat: send failed', e);
    return res.status(500).json({ success: false, error: 'Failed to send message' });
  }
});

function safeStringify(obj: any): string {
  try { return JSON.stringify(obj); } catch { return String(obj); }
}

export default router;
