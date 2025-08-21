import express from 'express';

type UserKey = string; // session userId as string or demoUserId cookie

export type IAState = {
  ia_4_2: {
    original_thought: string;
    ai_reframe: string;
    user_shift: string; // normalized key
    // legacy alias kept for backward compatibility in state snapshots
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
    contribution: string; // normalized key
    // legacy alias kept for backward compatibility
    what_it_needs?: string;
  };
  ia_4_5: {
    interlude_cluster: string;
    muse_convo: string;
  };
  updatedAt?: string;
};

function defaultState(): IAState {
  return {
    ia_4_2: { original_thought: '', ai_reframe: '', user_shift: '', shift: '' },
    ia_4_3: { frame_sentence: '', ai_stretch: '', stretch_vision: '', resistance: '' },
    ia_4_4: { purpose_one_line: '', global_challenge: '', ai_perspectives: [], contribution: '', what_it_needs: '' },
    ia_4_5: { interlude_cluster: '', muse_convo: '' },
    updatedAt: new Date().toISOString(),
  };
}

// In-memory store for IA continuity
const store = new Map<UserKey, IAState>();

function getUserKey(req: express.Request): UserKey {
  // Prefer session userId if present, otherwise use demoUserId cookie, else IP-based fallback
  const sid = (req as any)?.session?.userId;
  if (typeof sid === 'number' || typeof sid === 'string') return String(sid);
  const demo = req.cookies?.demoUserId;
  if (typeof demo === 'string' && demo.trim()) return `demo:${demo}`;
  return `ip:${req.ip}`;
}

const router = express.Router();

router.get('/state', (req, res) => {
  try {
    const key = getUserKey(req);
    if (!store.has(key)) store.set(key, defaultState());
    return res.json({ success: true, state: store.get(key), key });
  } catch (e: any) {
    return res.status(500).json({ success: false, error: e?.message || 'Failed to get IA state' });
  }
});

router.post('/saveProgress', express.json(), (req, res) => {
  try {
    const key = getUserKey(req);
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
    const current = store.get(key) ?? defaultState();
    // Shallow merge per top-level step objects
    const merged: IAState = {
      ...current,
      ...normalized,
      ia_4_2: { ...current.ia_4_2, ...normalized.ia_4_2 },
      ia_4_3: { ...current.ia_4_3, ...normalized.ia_4_3 },
      ia_4_4: { ...current.ia_4_4, ...normalized.ia_4_4 },
      ia_4_5: { ...current.ia_4_5, ...normalized.ia_4_5 },
      updatedAt: new Date().toISOString(),
    };
    store.set(key, merged);
    return res.json({ success: true, state: merged });
  } catch (e: any) {
    return res.status(500).json({ success: false, error: e?.message || 'Failed to save IA progress' });
  }
});

export default router;
