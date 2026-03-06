import { useCallback, useEffect, useRef, useState } from 'react';

import type { IAState as CanonicalIAState } from '@/lib/types';

export type IAState = CanonicalIAState;

const DEFAULT_STATE: IAState = {
  ia_2_1_pulse: undefined,
  ia_4_2: { original_thought: '', ai_reframe: [], user_shift: '', tag: '', new_perspective: '', shift: '', instinct_approach: '', explorer_rounds: [], explorer_chosen: null, explorer_reflection: '', capability_stretched: undefined, capabilities_applied: [], capabilities_imagine: '', tested_capability: '', capability_insight: '' },
  ia_4_3: { original_image: null, original_title: '', original_reflection: '', new_image: null, new_title: '', story: '', capability: null, tag: '', transcript: [], completed: false },
  ia_4_4: { positive_outcome: '', ai_outcome: [], user_possibility: '', tag: '', expanded_vision: '', global_bridges: [], completed: false, capability_stretched: undefined },
  ia_4_5: { next_step: '', ai_action: [], user_clarity: '', tag: '', commitment: '', action_steps: [], completed: false, capability_stretched: undefined },
};

// ── Module-level shared state ─────────────────────────────────────────────────
// All components calling useContinuity() on the same page share this state so
// parent/child pairs (e.g. IA_4_2 + ReframeExercise) always see the same data
// and the parent's canContinue check reflects child-driven updates immediately.
let _sharedState: IAState = { ...DEFAULT_STATE };
let _sharedLoading = true;
let _sharedError: string | null = null;
let _initialized = false;
let _initPromise: Promise<void> | null = null;

const _listeners = new Set<() => void>();

function _notifyListeners() {
  _listeners.forEach(fn => fn());
}

function _applyPatch(
  p: Partial<IAState> | ((prev: IAState) => Partial<IAState> | IAState)
) {
  if (typeof p === 'function') {
    const result = (p as (prev: IAState) => Partial<IAState> | IAState)(_sharedState) || {};
    const isFullState = Object.keys(result).some(k => (_sharedState as any)[k] !== undefined);
    _sharedState = isFullState
      ? ({ ...(result as IAState), updatedAt: new Date().toISOString() } as IAState)
      : ({ ..._sharedState, ...(result as Partial<IAState>), updatedAt: new Date().toISOString() } as IAState);
  } else {
    _sharedState = { ..._sharedState, ...(p as Partial<IAState>), updatedAt: new Date().toISOString() };
  }
  _notifyListeners();
}

async function _saveToServer(stateSnapshot: IAState): Promise<boolean> {
  try {
    const res = await fetch('/api/ia/saveProgress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ patch: stateSnapshot }),
    });
    const data = await res.json();
    if (!data?.success) throw new Error(data?.error || 'Failed to save');
    return true;
  } catch {
    return false;
  }
}

function _initSharedState(): Promise<void> {
  if (_initialized) return _initPromise!;
  _initialized = true;

  // Migrate any drifted localStorage keys before first server load
  try {
    const raw = localStorage.getItem('IA_STATE');
    if (raw) {
      let obj: any = JSON.parse(raw);
      let changed = false;
      if (obj?.ia_4_2 && typeof obj.ia_4_2 === 'object') {
        if ('shift' in obj.ia_4_2 && !('user_shift' in obj.ia_4_2)) {
          obj.ia_4_2.user_shift = obj.ia_4_2.shift;
          delete obj.ia_4_2.shift;
          changed = true;
        }
      }
      if (obj?.ia_4_4 && typeof obj.ia_4_4 === 'object') {
        if ('what_it_needs' in obj.ia_4_4 && !('contribution' in obj.ia_4_4)) {
          obj.ia_4_4.contribution = obj.ia_4_4.what_it_needs;
          delete obj.ia_4_4.what_it_needs;
          changed = true;
        }
      }
      if (changed) {
        localStorage.setItem('IA_STATE', JSON.stringify(obj));
      }
    }
  } catch {}

  _initPromise = (async () => {
    try {
      _sharedLoading = true;
      _notifyListeners();
      const res = await fetch('/api/ia/state', { credentials: 'include' });
      const data = await res.json();
      if (data?.success && data?.state) {
        _sharedState = data.state as IAState;
        _sharedError = null;
      } else {
        throw new Error(data?.error || 'Failed to load state');
      }
    } catch (e: any) {
      _sharedError = e?.message || 'Failed to load state';
    } finally {
      _sharedLoading = false;
      _notifyListeners();
    }
  })();

  return _initPromise;
}

export function useContinuity() {
  const SAVE_DEBOUNCE_MS = Number((import.meta as any).env?.VITE_IA_SAVE_DEBOUNCE_MS || 2000);

  // Local render counter — incremented whenever shared state changes
  const [, forceUpdate] = useState(0);
  const dirtyRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Keep a ref to the current snapshot for unmount/visibility flushes
  const stateRef = useRef(_sharedState);

  // Subscribe to shared state notifications and kick off the initial load
  useEffect(() => {
    const listener = () => {
      stateRef.current = _sharedState;
      forceUpdate(n => n + 1);
    };
    _listeners.add(listener);
    _initSharedState();
    return () => {
      _listeners.delete(listener);
    };
  }, []);

  const scheduleSave = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      _saveToServer(_sharedState);
      dirtyRef.current = false;
    }, SAVE_DEBOUNCE_MS);
  }, [SAVE_DEBOUNCE_MS]);

  // Flush pending save on unmount so navigation doesn't lose data
  useEffect(() => {
    return () => {
      if (dirtyRef.current) {
        if (timerRef.current) clearTimeout(timerRef.current);
        _saveToServer(stateRef.current);
        dirtyRef.current = false;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save on tab hide to avoid losing progress
  useEffect(() => {
    const handler = () => {
      if (document.hidden && dirtyRef.current) {
        saveNow();
      }
    };
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Accept either a partial patch object OR a functional updater so callers can
  // use the same API shape as React's setState (prev => ...).
  function patch(
    p: Partial<IAState> | ((prev: IAState) => Partial<IAState> | IAState)
  ) {
    _applyPatch(p);
    dirtyRef.current = true;
    scheduleSave();
  }

  function setStep<K extends keyof IAState>(step: K, value: IAState[K]) {
    _sharedState = { ..._sharedState, [step]: value, updatedAt: new Date().toISOString() } as IAState;
    _notifyListeners();
    dirtyRef.current = true;
    scheduleSave();
  }

  async function saveNow() {
    if (timerRef.current) clearTimeout(timerRef.current);
    dirtyRef.current = false;
    return _saveToServer(_sharedState);
  }

  return {
    state: _sharedState,
    setState: patch,
    set: patch,
    setStep,
    loading: _sharedLoading,
    error: _sharedError,
    saveNow,
  };
}
