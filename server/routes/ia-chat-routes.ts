import express from 'express';
import OpenAI from 'openai';
import crypto from 'crypto';
import { Pool } from 'pg';
import { requireAuth } from '../middleware/auth.js';
import { getProvider, getProviderName, type AIMessage } from '../services/ai-provider.js';

const router = express.Router();

// Minimal PG pool for pulling IA exercise instructions configured via admin console
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function loadExerciseInstructions(stepId?: string) {
  const globalRes = await pool.query(
    'SELECT instruction, simulation_starter, enabled FROM ai_exercise_instructions WHERE workshop_type=$1 AND step_id=$2',
    ['ia', '__global__']
  );
  let exerciseInstruction = '';
  let simulationStarter: string | null = null;
  if (stepId) {
    const stepRes = await pool.query(
      'SELECT instruction, simulation_starter, enabled FROM ai_exercise_instructions WHERE workshop_type=$1 AND step_id=$2',
      ['ia', stepId]
    );
    const stepRow = stepRes.rows?.[0];
    if (stepRow?.enabled && stepRow.instruction) exerciseInstruction = String(stepRow.instruction);
    if (stepRow?.enabled && stepRow.simulation_starter) simulationStarter = String(stepRow.simulation_starter);
  }
  const globalRow = globalRes.rows?.[0];
  const exerciseGlobalInstruction = globalRow?.enabled && globalRow.instruction ? String(globalRow.instruction) : '';
  return { exerciseInstruction, exerciseGlobalInstruction, simulationStarter };
}

// ─── OpenAI helpers (unchanged) ──────────────────────────────────────────────

function getIaClient(): OpenAI {
  const apiKey = process.env.OPENAI_KEY_IA || process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_KEY_IA not set');
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

// ─── Claude stateless conversation store ─────────────────────────────────────
// IA chat conversations are short-lived (single exercise session).
// In-memory storage is sufficient — no persistence needed.

interface ClaudeConversation {
  id: string;
  systemPrompt: string;
  messages: AIMessage[];
  stepId?: string;
  createdAt: number;
}

const claudeConversations = new Map<string, ClaudeConversation>();

// Cleanup conversations older than 2 hours to prevent memory leaks
const CONVERSATION_TTL_MS = 2 * 60 * 60 * 1000;
setInterval(() => {
  const cutoff = Date.now() - CONVERSATION_TTL_MS;
  for (const [id, conv] of claudeConversations) {
    if (conv.createdAt < cutoff) {
      claudeConversations.delete(id);
    }
  }
}, 15 * 60 * 1000); // Run cleanup every 15 minutes

// ─── Routes ──────────────────────────────────────────────────────────────────

// Start a conversation (create a thread) for IA assistant
router.post('/ia/chat/conversation', requireAuth, express.json(), async (req, res) => {
  try {
    const { stepId, contextData } = req.body as { stepId?: string; contextData?: any };

    // Load exercise instructions configured by admin (global + per-step)
    const { exerciseInstruction, exerciseGlobalInstruction, simulationStarter } = await loadExerciseInstructions(stepId);

    const providerName = getProviderName('ia');

    // ── Claude path: stateless conversation ───────────────────────────────
    if (providerName === 'claude') {
      const conversationId = `claude-${crypto.randomUUID()}`;

      // Build system prompt from admin-configured guidance
      const guidanceBlocks: string[] = [];
      if (exerciseGlobalInstruction) guidanceBlocks.push(`Global Guidance:\n${exerciseGlobalInstruction}`);
      if (exerciseInstruction) guidanceBlocks.push(`Exercise Guidance (${stepId}):\n${exerciseInstruction}`);
      const systemPrompt = guidanceBlocks.length > 0
        ? `You are an Imaginal Agility exercise assistant.\n\n${guidanceBlocks.join('\n\n')}`
        : 'You are an Imaginal Agility exercise assistant. Help participants explore their imagination and creative potential.';

      claudeConversations.set(conversationId, {
        id: conversationId,
        systemPrompt,
        messages: [],
        stepId,
        createdAt: Date.now(),
      });

      console.log(`[IA chat] Claude conversation created: ${conversationId} (step: ${stepId})`);

      return res.json({
        success: true,
        conversation: { id: conversationId },
        stepId,
        hasContext: !!contextData,
        starterPrompt: simulationStarter || null,
        provider: 'claude',
      });
    }

    // ── OpenAI path: thread-based (unchanged) ─────────────────────────────
    const client = getIaClient();
    const thread = await (client as any).beta.threads.create();

    // Seed the thread with guidance so the assistant steers responses accordingly
    const guidanceBlocks: string[] = [];
    if (exerciseGlobalInstruction) guidanceBlocks.push(`Global Guidance:\n${exerciseGlobalInstruction}`);
    if (exerciseInstruction) guidanceBlocks.push(`Exercise Guidance (${stepId}):\n${exerciseInstruction}`);
    if (guidanceBlocks.length > 0) {
      try {
        await (client as any).beta.threads.messages.create(thread.id, {
          role: 'user',
          content: `Assistant Instructions (for context):\n${guidanceBlocks.join('\n\n')}`
        });
      } catch (e) {
        console.warn('IA chat: failed to seed guidance message', e);
      }
    }

    // Return starter prompt (if configured) so client can prefill input
    return res.json({
      success: true,
      conversation: { id: thread.id },
      stepId,
      hasContext: !!contextData,
      starterPrompt: simulationStarter || null,
      provider: 'openai',
    });
  } catch (e: any) {
    console.error('IA chat: init failed', e);
    return res.status(500).json({ success: false, error: 'Failed to initialize IA conversation' });
  }
});

// Send a message and get AI response
router.post('/ia/chat/message', requireAuth, express.json(), async (req, res) => {
  try {
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

    // ── Claude path: stateless with in-memory history ─────────────────────
    const conversation = claudeConversations.get(conversationId);
    if (conversation) {
      // Append user message (with optional context)
      const { exerciseInstruction, exerciseGlobalInstruction } = await loadExerciseInstructions(stepId);
      const guidanceSnippet = [
        exerciseGlobalInstruction ? `Global Guidance: ${exerciseGlobalInstruction}` : null,
        exerciseInstruction ? `Exercise Guidance: ${exerciseInstruction}` : null,
      ].filter(Boolean).join(' | ');
      const contextSnippet = [
        contextData ? `Context: ${safeStringify(contextData).slice(0, 2000)}` : null,
        guidanceSnippet || null,
      ].filter(Boolean).join(' \n\n');

      const userContent = `${message}${contextSnippet ? `\n\n${contextSnippet}` : ''}`;
      conversation.messages.push({ role: 'user', content: userContent });

      const provider = await getProvider('ia');
      const result = await provider.complete({
        systemPrompt: conversation.systemPrompt,
        messages: conversation.messages,
        maxTokens: 1024,
        temperature: 0.7,
        cacheSystemPrompt: false, // System prompt is small for IA chat
      });

      // Append assistant response to history
      conversation.messages.push({ role: 'assistant', content: result.content });

      console.log(`[IA chat] Claude response: ${result.content.length} chars, ${result.latencyMs}ms`);

      return res.json({
        success: true,
        response: {
          content: result.content,
          metadata: { stepId, provider: 'claude', model: result.model },
        },
      });
    }

    // ── OpenAI path: thread-based (unchanged) ─────────────────────────────
    const client = getIaClient();

    // Compose message content; include lightweight context and any admin-configured guidance
    const { exerciseInstruction, exerciseGlobalInstruction } = await loadExerciseInstructions(stepId);
    const guidanceSnippet = [
      exerciseGlobalInstruction ? `Global Guidance: ${exerciseGlobalInstruction}` : null,
      exerciseInstruction ? `Exercise Guidance: ${exerciseInstruction}` : null,
    ].filter(Boolean).join(' | ');
    const contextSnippet = [
      contextData ? `Context: ${safeStringify(contextData).slice(0, 2000)}` : null,
      guidanceSnippet ? guidanceSnippet : null
    ].filter(Boolean).join(' \n\n');
    await (client as any).beta.threads.messages.create(conversationId, {
      role: 'user',
      content: `${message}${contextSnippet ? `\n\n${contextSnippet}` : ''}`
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
