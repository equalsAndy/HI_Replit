import express from 'express';
import OpenAI from 'openai';
import { getTraining, getApiKeyForTraining, TrainingId } from '../config/trainings.js';
import { getTrainingDoc } from '../config/training-doc-loader.js';
import { getProvider, getProviderName } from '../services/ai-provider.js';

const router = express.Router();

type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string };

router.post('/chat/plain', express.json(), async (req, res) => {
  try {
    const { training_id, messages, model } = req.body || {};

    if (!training_id || typeof training_id !== 'string') {
      return res.status(400).json({ success: false, error: 'training_id is required' });
    }

    const training = getTraining(training_id as TrainingId);
    if (!training) {
      return res.status(404).json({ success: false, error: `Unknown training_id: ${training_id}` });
    }

    // Validate messages
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ success: false, error: 'messages must be a non-empty array' });
    }

    const validRoles = new Set(['system', 'user', 'assistant']);
    let normalized: ChatMessage[];
    try {
      normalized = messages.map((m: any) => {
        const role = m?.role;
        const content = m?.content;
        if (typeof role !== 'string' || typeof content !== 'string' || !validRoles.has(role)) {
          throw new Error('Each message must have role (system|user|assistant) and string content');
        }
        return { role, content } as ChatMessage;
      });
    } catch (e: any) {
      return res.status(400).json({ success: false, error: e?.message || 'Invalid messages format' });
    }

    const resolvedModel: string = (typeof model === 'string' && model.trim()) ? model.trim() : training.model_default;
    const apiKey = getApiKeyForTraining(training);
    if (!apiKey) {
      return res.status(500).json({ success: false, error: `Missing API key: ${training.api_key_env}` });
    }

    // Inject training doc into system message if one exists for this exercise
    const trainingDoc = getTrainingDoc(training_id);
    if (trainingDoc) {
      const systemIdx = normalized.findIndex(m => m.role === 'system');
      if (systemIdx >= 0) {
        normalized[systemIdx] = {
          ...normalized[systemIdx],
          content: `--- EXERCISE TRAINING GUIDE ---\n${trainingDoc}\n--- END TRAINING GUIDE ---\n\n${normalized[systemIdx].content}`,
        };
        console.log(`[ai/chat/plain] Injected training doc for ${training_id}. Combined system prompt length: ${normalized[systemIdx].content.length} chars`);
      }
    }

    // ─── Provider-agnostic path ──────────────────────────────────────────────
    const providerName = getProviderName('ia');

    if (providerName === 'claude') {
      // Extract system prompt from messages (Claude takes it separately)
      const systemMsg = normalized.find(m => m.role === 'system');
      const nonSystemMsgs = normalized.filter(m => m.role !== 'system');

      const provider = await getProvider('ia');
      const response = await provider.complete({
        systemPrompt: systemMsg?.content || '',
        messages: nonSystemMsgs,
        maxTokens: 1024,
        temperature: 0.7,
        cacheSystemPrompt: !!trainingDoc, // Cache when training doc present (static content)
        model: training.claude_model || process.env.CLAUDE_MODEL,
        apiKey: undefined, // Uses CLAUDE_API_KEY from env
      });

      console.log(`[ai/chat/plain] Claude response for ${training_id}: ${response.content.length} chars, ${response.usage.inputTokens} in / ${response.usage.outputTokens} out, cache read: ${response.usage.cacheReadTokens}, latency: ${response.latencyMs}ms`);
      return res.json({ success: true, reply: response.content, model: response.model, training_id, provider: 'claude' });
    }

    // ─── OpenAI path (default, unchanged) ────────────────────────────────────
    const isIATraining = training.id.startsWith('ia-');
    const projectId = isIATraining ? process.env.IMAGINAL_AGILITY_PROJECT_ID : undefined;
    const client = projectId ? new OpenAI({ apiKey, project: projectId }) : new OpenAI({ apiKey });

    const completion = await client.chat.completions.create({
      model: resolvedModel,
      messages: normalized,
    });

    const reply = completion.choices?.[0]?.message?.content ?? '';
    return res.json({ success: true, reply, model: resolvedModel, training_id, provider: 'openai' });
  } catch (error: any) {
    console.error('AI plain chat error:', error);
    return res.status(500).json({ success: false, error: error?.message || 'Server error' });
  }
});

export default router;

// RAG stub route — prepares retrieval flow for assistants that use it
// TODO: Replace stub context with real retrieved snippets from the vector store
router.post('/chat/rag', express.json(), async (req, res) => {
  try {
    const { training_id, messages, model, top_k } = req.body || {};

    if (!training_id || typeof training_id !== 'string') {
      return res.status(400).json({ success: false, error: 'training_id is required' });
    }

    const training = getTraining(training_id as TrainingId);
    if (!training) {
      return res.status(404).json({ success: false, error: `Unknown training_id: ${training_id}` });
    }

    if (!training.use_retrieval || !training.vector_store_id) {
      return res.status(400).json({ success: false, error: 'Training is not configured for retrieval (use_retrieval=false or missing vector_store_id)' });
    }

    // Validate messages
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ success: false, error: 'messages must be a non-empty array' });
    }
    const validRoles = new Set(['system', 'user', 'assistant']);
    let normalized: ChatMessage[];
    try {
      normalized = messages.map((m: any) => {
        const role = m?.role;
        const content = m?.content;
        if (typeof role !== 'string' || typeof content !== 'string' || !validRoles.has(role)) {
          throw new Error('Each message must have role (system|user|assistant) and string content');
        }
        return { role, content } as ChatMessage;
      });
    } catch (e: any) {
      return res.status(400).json({ success: false, error: e?.message || 'Invalid messages format' });
    }

    const resolvedModel: string = (typeof model === 'string' && model.trim()) ? model.trim() : training.model_default;
    const apiKey = getApiKeyForTraining(training);
    if (!apiKey) {
      return res.status(500).json({ success: false, error: `Missing API key: ${training.api_key_env}` });
    }

    // TODO: perform vector search using training.vector_store_id and top_k (default 5)
    const usedVectorStore = training.vector_store_id;
    const k = (typeof top_k === 'number' && top_k > 0 && Number.isFinite(top_k)) ? Math.min(Math.floor(top_k), 20) : 5;
    const contextMessage: ChatMessage = {
      role: 'assistant',
      content: `(Retrieved 0 snippets from ${usedVectorStore} — stub, top_k=${k})`
    };

    const client = new OpenAI({ apiKey });
    const completion = await client.chat.completions.create({
      model: resolvedModel,
      messages: [contextMessage, ...normalized],
    });

    const reply = completion.choices?.[0]?.message?.content ?? '';
    return res.json({ success: true, reply, used_vector_store: usedVectorStore, model: resolvedModel, training_id });
  } catch (error: any) {
    console.error('AI RAG chat error:', error);
    return res.status(500).json({ success: false, error: error?.message || 'Server error' });
  }
});
