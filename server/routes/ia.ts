import express, { Request, Response, NextFunction } from 'express';
import { db } from '../db.js';
import { eq, and, isNull, inArray } from 'drizzle-orm';
import { workshopStepData } from '../../shared/schema.js';

export type IAState = {
  ia_4_2: {
    original_thought: string;
    ai_reframe: string[];
    user_shift: string;
    tag: string;
    new_perspective: string;
    challenge?: string;
    shift?: string;
  };
  ia_4_3: {
    frame_sentence: string;
    ai_stretch: string;
    stretch_vision: string;
    resistance: string;
  };
  ia_4_4: {
    purpose_one_line: string;
    global_challenge: string;
    ai_perspectives: string[];
    contribution: string;
    what_it_needs?: string;
  };
  ia_4_5: {
    interlude_cluster: string;
    muse_convo: string;
  };
  updatedAt?: string;
};

const STEP_KEYS = ['ia_4_2', 'ia_4_3', 'ia_4_4', 'ia_4_5'] as const;
const STEP_IDS = ['ia-4-2', 'ia-4-3', 'ia-4-4', 'ia-4-5'] as const;

function stepKeyToId(key: string): string {
  return key.replace(/_/g, '-');
}

function stepIdToKey(id: string): string {
  return id.replace(/-/g, '_');
}

function defaultStepData(key: string): Record<string, any> {
  switch (key) {
    case 'ia_4_2': return { original_thought: '', ai_reframe: [], user_shift: '', tag: '', new_perspective: '', shift: '' };
    case 'ia_4_3': return { frame_sentence: '', ai_stretch: '', stretch_vision: '', resistance: '' };
    case 'ia_4_4': return { purpose_one_line: '', global_challenge: '', ai_perspectives: [], contribution: '', what_it_needs: '' };
    case 'ia_4_5': return { interlude_cluster: '', muse_convo: '' };
    default: return {};
  }
}

function defaultState(): IAState {
  return {
    ia_4_2: defaultStepData('ia_4_2') as IAState['ia_4_2'],
    ia_4_3: defaultStepData('ia_4_3') as IAState['ia_4_3'],
    ia_4_4: defaultStepData('ia_4_4') as IAState['ia_4_4'],
    ia_4_5: defaultStepData('ia_4_5') as IAState['ia_4_5'],
    updatedAt: new Date().toISOString(),
  };
}

// Auth middleware - require session userId
const authenticateUser = (req: Request, res: Response, next: NextFunction) => {
  const userId = (req.session as any)?.userId || (req.cookies?.userId ? parseInt(req.cookies.userId) : null);
  if (!userId) {
    return res.status(401).json({ success: false, error: 'Authentication required' });
  }
  (req.session as any).userId = userId;
  next();
};

const router = express.Router();

router.get('/state', authenticateUser, async (req, res) => {
  try {
    const userId = (req.session as any).userId;

    const rows = await db
      .select()
      .from(workshopStepData)
      .where(and(
        eq(workshopStepData.userId, userId),
        eq(workshopStepData.workshopType, 'ia'),
        inArray(workshopStepData.stepId, [...STEP_IDS]),
        isNull(workshopStepData.deletedAt)
      ));

    // Assemble into IAState shape
    const state = defaultState();
    for (const row of rows) {
      const key = stepIdToKey(row.stepId) as keyof IAState;
      if (STEP_KEYS.includes(key as any) && row.data) {
        (state as any)[key] = { ...defaultStepData(key), ...(row.data as Record<string, any>) };
      }
    }

    // Use the most recent updatedAt from any row
    const latest = rows.reduce((max, r) => {
      const t = r.updatedAt ? new Date(r.updatedAt).getTime() : 0;
      return t > max ? t : max;
    }, 0);
    if (latest > 0) state.updatedAt = new Date(latest).toISOString();

    return res.json({ success: true, state });
  } catch (e: any) {
    console.error('Error loading IA state:', e);
    return res.status(500).json({ success: false, error: e?.message || 'Failed to get IA state' });
  }
});

router.post('/saveProgress', authenticateUser, express.json(), async (req, res) => {
  try {
    const userId = (req.session as any).userId;
    const body = req.body || {};
    let patch: Partial<IAState> | undefined = body.patch;

    // Accept alternate shape: { exerciseId, payload }
    if (!patch && body.exerciseId && body.payload && typeof body.exerciseId === 'string' && typeof body.payload === 'object') {
      patch = { [body.exerciseId]: { ...body.payload } } as any;
    }

    if (!patch || typeof patch !== 'object' || Object.keys(patch).length === 0) {
      return res.status(400).json({ success: false, error: 'Invalid or empty payload. Provide patch, or exerciseId + payload.' });
    }

    // Key normalization for drifted keys
    const normalized: any = { ...patch };
    if (normalized.ia_4_2 && typeof normalized.ia_4_2 === 'object') {
      const s = normalized.ia_4_2;
      if (Object.prototype.hasOwnProperty.call(s, 'shift') && !Object.prototype.hasOwnProperty.call(s, 'user_shift')) {
        s.user_shift = s.shift;
        delete s.shift;
      }
    }
    if (normalized.ia_4_4 && typeof normalized.ia_4_4 === 'object') {
      const s = normalized.ia_4_4;
      if (Object.prototype.hasOwnProperty.call(s, 'what_it_needs') && !Object.prototype.hasOwnProperty.call(s, 'contribution')) {
        s.contribution = s.what_it_needs;
        delete s.what_it_needs;
      }
    }

    // Load existing data for steps being patched, then merge and upsert
    const patchKeys = Object.keys(normalized).filter(k => STEP_KEYS.includes(k as any));
    const patchStepIds = patchKeys.map(stepKeyToId);

    // Load current DB data for these steps
    const existing = patchStepIds.length > 0 ? await db
      .select()
      .from(workshopStepData)
      .where(and(
        eq(workshopStepData.userId, userId),
        eq(workshopStepData.workshopType, 'ia'),
        inArray(workshopStepData.stepId, patchStepIds),
        isNull(workshopStepData.deletedAt)
      )) : [];

    const existingByStepId: Record<string, Record<string, any>> = {};
    for (const row of existing) {
      existingByStepId[row.stepId] = (row.data as Record<string, any>) || {};
    }

    // Upsert each patched step
    for (const key of patchKeys) {
      const stepId = stepKeyToId(key);
      const currentData = existingByStepId[stepId] || defaultStepData(key);
      const mergedData = { ...currentData, ...normalized[key] };

      await db
        .insert(workshopStepData)
        .values({
          userId,
          workshopType: 'ia',
          stepId,
          data: mergedData,
          updatedAt: new Date()
        })
        .onConflictDoUpdate({
          target: [workshopStepData.userId, workshopStepData.workshopType, workshopStepData.stepId],
          set: {
            data: mergedData,
            updatedAt: new Date(),
            deletedAt: null
          }
        });
    }

    // Return full assembled state
    const allRows = await db
      .select()
      .from(workshopStepData)
      .where(and(
        eq(workshopStepData.userId, userId),
        eq(workshopStepData.workshopType, 'ia'),
        inArray(workshopStepData.stepId, [...STEP_IDS]),
        isNull(workshopStepData.deletedAt)
      ));

    const state = defaultState();
    for (const row of allRows) {
      const k = stepIdToKey(row.stepId) as keyof IAState;
      if (STEP_KEYS.includes(k as any) && row.data) {
        (state as any)[k] = { ...defaultStepData(k), ...(row.data as Record<string, any>) };
      }
    }
    state.updatedAt = new Date().toISOString();

    return res.json({ success: true, state });
  } catch (e: any) {
    console.error('Error saving IA progress:', e);
    return res.status(500).json({ success: false, error: e?.message || 'Failed to save IA progress' });
  }
});

export default router;
