/**
 * Exercise Training Docs Routes
 * ==============================
 * Admin CRUD + AI test panel for exercise training docs stored in the database.
 * Also provides export/sync endpoints for keeping dev and production in sync.
 *
 * All routes mounted at /api/admin/exercise-training-docs
 *
 * IMPORTANT — route ordering: named routes (/export, /sync-from, /test) must be
 * registered BEFORE the /:trainingId parameter route to avoid Express treating
 * those literal strings as trainingId values.
 */

import express from 'express';
import OpenAI from 'openai';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { db } from '../db.js';
import { eq } from 'drizzle-orm';
import { exerciseTrainingDocs } from '../../shared/schema.js';
import { getTrainingDoc } from '../config/training-doc-loader.js';
import { getTraining, getApiKeyForTraining, TrainingId } from '../config/trainings.js';
import { getProvider, getProviderName } from '../services/ai-provider.js';

const router = express.Router();

type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string };
const VALID_ROLES = new Set(['system', 'user', 'assistant']);

// ─── GET /export ─────────────────────────────────────────────────────────────
// Returns all docs as JSON. Dual auth: admin session OR X-Sync-Key header.
// The X-Sync-Key path allows server-to-server calls during environment sync.
router.get('/export', async (req, res) => {
  const syncKey = req.headers['x-sync-key'];
  const expectedKey = process.env.TRAINING_DOC_SYNC_KEY;
  const isKeyAuth = syncKey && expectedKey && syncKey === expectedKey;
  const isSessionAuth =
    (req.session as any)?.userId && (req.session as any)?.userRole === 'admin';

  if (!isKeyAuth && !isSessionAuth) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  try {
    const docs = await db
      .select({
        trainingId: exerciseTrainingDocs.trainingId,
        title: exerciseTrainingDocs.title,
        content: exerciseTrainingDocs.content,
        updatedAt: exerciseTrainingDocs.updatedAt,
      })
      .from(exerciseTrainingDocs)
      .orderBy(exerciseTrainingDocs.trainingId);

    return res.json({ success: true, docs });
  } catch (error: any) {
    console.error('[exercise-training-docs] Export error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ─── POST /sync-from ──────────────────────────────────────────────────────────
// Pull all training docs from another environment and upsert them locally.
// Requires admin session. Source environment must have TRAINING_DOC_SYNC_KEY set.
router.post('/sync-from', requireAuth, requireAdmin, async (req, res) => {
  const syncKey = process.env.TRAINING_DOC_SYNC_KEY;
  if (!syncKey) {
    return res.status(500).json({
      success: false,
      error: 'TRAINING_DOC_SYNC_KEY not configured — add it to .env to enable sync',
    });
  }

  const { sourceUrl } = req.body;
  if (!sourceUrl || typeof sourceUrl !== 'string') {
    return res.status(400).json({ success: false, error: 'sourceUrl is required' });
  }

  try {
    const cleanUrl = sourceUrl.replace(/\/+$/, '');
    const response = await fetch(
      `${cleanUrl}/api/admin/exercise-training-docs/export`,
      { headers: { 'X-Sync-Key': syncKey } }
    );

    if (!response.ok) {
      const text = await response.text();
      return res.status(502).json({
        success: false,
        error: `Source returned ${response.status}: ${text.substring(0, 200)}`,
      });
    }

    const data = await response.json() as any;
    if (!data.success || !Array.isArray(data.docs)) {
      return res.status(502).json({ success: false, error: 'Invalid response from source' });
    }

    const userId = (req.session as any)?.userId ?? null;
    const results: Array<{ trainingId: string; status: 'synced' | 'error'; error?: string }> = [];

    for (const doc of data.docs) {
      try {
        await db
          .insert(exerciseTrainingDocs)
          .values({
            trainingId: doc.trainingId,
            title: doc.title,
            content: doc.content,
            updatedAt: new Date(),
            updatedBy: userId,
          })
          .onConflictDoUpdate({
            target: exerciseTrainingDocs.trainingId,
            set: {
              title: doc.title,
              content: doc.content,
              updatedAt: new Date(),
              updatedBy: userId,
            },
          });
        results.push({ trainingId: doc.trainingId, status: 'synced' });
      } catch (err: any) {
        results.push({ trainingId: doc.trainingId, status: 'error', error: err.message });
      }
    }

    const synced = results.filter(r => r.status === 'synced').length;
    const errors = results.filter(r => r.status === 'error');
    console.log(`[exercise-training-docs] Synced ${synced} docs from ${sourceUrl} (${errors.length} errors)`);
    return res.json({ success: true, synced, total: data.docs.length, errors });
  } catch (error: any) {
    console.error('[exercise-training-docs] Sync error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ─── POST /test ───────────────────────────────────────────────────────────────
// Test a training doc against the AI pipeline. Mirrors the logic in ai.ts.
// Sends messages through the same provider (Claude or OpenAI) as production.
router.post('/test', requireAuth, requireAdmin, async (req, res) => {
  const { training_id, messages } = req.body;

  if (!training_id || typeof training_id !== 'string') {
    return res.status(400).json({ success: false, error: 'training_id is required' });
  }

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ success: false, error: 'messages must be a non-empty array' });
  }

  // ia-3-7-* are not in the TrainingId union — no AI config, test not available
  const training = getTraining(training_id as TrainingId);
  if (!training) {
    return res.status(404).json({
      success: false,
      error: `No AI config for training_id "${training_id}" — test not available for this doc`,
    });
  }

  const apiKey = getApiKeyForTraining(training);
  if (!apiKey) {
    return res.status(500).json({ success: false, error: `Missing API key: ${training.api_key_env}` });
  }

  let normalized: ChatMessage[];
  try {
    normalized = messages.map((m: any) => {
      if (!VALID_ROLES.has(m?.role) || typeof m?.content !== 'string') {
        throw new Error('Each message must have role (system|user|assistant) and string content');
      }
      return { role: m.role, content: m.content } as ChatMessage;
    });
  } catch (e: any) {
    return res.status(400).json({ success: false, error: e.message });
  }

  try {
    // Fetch the current saved training doc from DB (same as production path)
    const trainingDoc = await getTrainingDoc(training_id);
    if (trainingDoc) {
      const systemIdx = normalized.findIndex(m => m.role === 'system');
      if (systemIdx >= 0) {
        normalized[systemIdx] = {
          ...normalized[systemIdx],
          content: `--- EXERCISE TRAINING GUIDE ---\n${trainingDoc}\n--- END TRAINING GUIDE ---\n\n${normalized[systemIdx].content}`,
        };
      }
    }

    const providerName = getProviderName('ia');

    if (providerName === 'claude') {
      const systemMsg = normalized.find(m => m.role === 'system');
      const nonSystemMsgs = normalized.filter(m => m.role !== 'system');
      const provider = await getProvider('ia');
      const response = await provider.complete({
        systemPrompt: systemMsg?.content || '',
        messages: nonSystemMsgs,
        maxTokens: 1024,
        temperature: 0.7,
        cacheSystemPrompt: !!trainingDoc,
        model: training.claude_model || process.env.CLAUDE_MODEL,
        apiKey: undefined,
      });

      return res.json({
        success: true,
        reply: response.content,
        model: response.model,
        training_id,
        provider: 'claude',
        usage: response.usage,
        latencyMs: response.latencyMs,
      });
    }

    // OpenAI path
    const isIATraining = training.id.startsWith('ia-');
    const projectId = isIATraining ? process.env.IMAGINAL_AGILITY_PROJECT_ID : undefined;
    const client = projectId
      ? new OpenAI({ apiKey, project: projectId })
      : new OpenAI({ apiKey });

    const start = Date.now();
    const completion = await client.chat.completions.create({
      model: training.model_default,
      messages: normalized,
    });

    const reply = completion.choices?.[0]?.message?.content ?? '';
    return res.json({
      success: true,
      reply,
      model: training.model_default,
      training_id,
      provider: 'openai',
      usage: completion.usage,
      latencyMs: Date.now() - start,
    });
  } catch (error: any) {
    console.error('[exercise-training-docs] Test error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ─── GET / ────────────────────────────────────────────────────────────────────
// List all training docs (id, title, updatedAt — no content for performance)
router.get('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const docs = await db
      .select({
        trainingId: exerciseTrainingDocs.trainingId,
        title: exerciseTrainingDocs.title,
        updatedAt: exerciseTrainingDocs.updatedAt,
        updatedBy: exerciseTrainingDocs.updatedBy,
      })
      .from(exerciseTrainingDocs)
      .orderBy(exerciseTrainingDocs.trainingId);

    return res.json({ success: true, docs });
  } catch (error: any) {
    console.error('[exercise-training-docs] List error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ─── GET /:trainingId ─────────────────────────────────────────────────────────
// Get a single doc including its full content
router.get('/:trainingId', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { trainingId } = req.params;
    const [doc] = await db
      .select()
      .from(exerciseTrainingDocs)
      .where(eq(exerciseTrainingDocs.trainingId, trainingId))
      .limit(1);

    if (!doc) {
      return res.status(404).json({ success: false, error: 'Training doc not found' });
    }

    return res.json({ success: true, doc });
  } catch (error: any) {
    console.error('[exercise-training-docs] Get error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ─── POST /push-to ────────────────────────────────────────────────────────────
// Push all training docs to another environment (e.g., dev → production).
// Requires admin session. Target environment must have TRAINING_DOC_SYNC_KEY set
// and the PUT /:trainingId endpoint must accept sync key auth.
router.post('/push-to', requireAuth, requireAdmin, async (req, res) => {
  const syncKey = process.env.TRAINING_DOC_SYNC_KEY;
  if (!syncKey) {
    return res.status(500).json({
      success: false,
      error: 'TRAINING_DOC_SYNC_KEY not configured — add it to .env to enable sync',
    });
  }

  const { targetUrl, trainingId: singleId } = req.body;
  if (!targetUrl || typeof targetUrl !== 'string') {
    return res.status(400).json({ success: false, error: 'targetUrl is required' });
  }

  try {
    // Get docs to push — either one or all
    let docsToPush: Array<{ trainingId: string; title: string; content: string }>;
    if (singleId && typeof singleId === 'string') {
      const [doc] = await db
        .select({ trainingId: exerciseTrainingDocs.trainingId, title: exerciseTrainingDocs.title, content: exerciseTrainingDocs.content })
        .from(exerciseTrainingDocs)
        .where(eq(exerciseTrainingDocs.trainingId, singleId))
        .limit(1);
      if (!doc) return res.status(404).json({ success: false, error: 'Training doc not found' });
      docsToPush = [doc];
    } else {
      docsToPush = await db
        .select({ trainingId: exerciseTrainingDocs.trainingId, title: exerciseTrainingDocs.title, content: exerciseTrainingDocs.content })
        .from(exerciseTrainingDocs);
    }

    const cleanUrl = targetUrl.replace(/\/+$/, '');
    const results: Array<{ trainingId: string; status: 'pushed' | 'error'; error?: string }> = [];

    for (const doc of docsToPush) {
      try {
        const putRes = await fetch(
          `${cleanUrl}/api/admin/exercise-training-docs/${doc.trainingId}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'X-Sync-Key': syncKey,
            },
            body: JSON.stringify({ content: doc.content, title: doc.title }),
          }
        );
        if (!putRes.ok) {
          const text = await putRes.text();
          results.push({ trainingId: doc.trainingId, status: 'error', error: `${putRes.status}: ${text.substring(0, 200)}` });
        } else {
          results.push({ trainingId: doc.trainingId, status: 'pushed' });
        }
      } catch (err: any) {
        results.push({ trainingId: doc.trainingId, status: 'error', error: err.message });
      }
    }

    const pushed = results.filter(r => r.status === 'pushed').length;
    const errors = results.filter(r => r.status === 'error');
    console.log(`[exercise-training-docs] Pushed ${pushed} docs to ${targetUrl} (${errors.length} errors)`);
    return res.json({ success: true, pushed, total: docsToPush.length, errors });
  } catch (error: any) {
    console.error('[exercise-training-docs] Push error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ─── PUT /:trainingId ─────────────────────────────────────────────────────────
// Update doc content (and optionally title).
// Dual auth: admin session OR X-Sync-Key header (for cross-environment push).
router.put('/:trainingId', async (req, res) => {
  // Dual auth: sync key OR admin session
  const syncKey = req.headers['x-sync-key'];
  const expectedKey = process.env.TRAINING_DOC_SYNC_KEY;
  const isKeyAuth = syncKey && expectedKey && syncKey === expectedKey;
  const isSessionAuth =
    (req.session as any)?.userId && (req.session as any)?.userRole === 'admin';

  if (!isKeyAuth && !isSessionAuth) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  try {
    const { trainingId } = req.params;
    const { content, title } = req.body;
    const userId = isSessionAuth ? ((req.session as any)?.userId ?? null) : null;

    if (!content || typeof content !== 'string') {
      return res.status(400).json({ success: false, error: 'content is required' });
    }

    const updates: Record<string, any> = {
      content,
      updatedAt: new Date(),
      updatedBy: userId,
    };
    if (title && typeof title === 'string') {
      updates.title = title;
    }

    const [updated] = await db
      .update(exerciseTrainingDocs)
      .set(updates)
      .where(eq(exerciseTrainingDocs.trainingId, trainingId))
      .returning();

    if (!updated) {
      return res.status(404).json({ success: false, error: 'Training doc not found' });
    }

    console.log(`[exercise-training-docs] Updated ${trainingId} by user ${userId} (${content.length} chars)`);
    return res.json({ success: true, doc: updated });
  } catch (error: any) {
    console.error('[exercise-training-docs] Update error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
