import { useCallback, useEffect, useRef, useState } from 'react';

import type { IAState as CanonicalIAState } from '@/lib/types';

export type IAState = CanonicalIAState;

const DEFAULT_STATE: IAState = {
  ia_4_2: { original_thought: '', ai_reframe: [], user_shift: '', tag: '', new_perspective: '', shift: '' },
  ia_4_3: { assumptions: '', ai_assumptions: [], user_insight: '', tag: '', updated_perspective: '' },
  ia_4_4: { positive_outcome: '', ai_outcome: [], user_possibility: '', tag: '', expanded_vision: '' },
  ia_4_5: { next_step: '', ai_action: [], user_clarity: '', tag: '', commitment: '' },
};

export function useContinuity() {
  const SAVE_DEBOUNCE_MS = Number((import.meta as any).env?.VITE_IA_SAVE_DEBOUNCE_MS || 2000);
  const [state, setState] = useState<IAState>(DEFAULT_STATE);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const dirtyRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load on mount
  useEffect(() => {
    let active = true;
    // Phase 0I: migrate any drifted keys in localStorage before loading
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
    (async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/ia/state', { credentials: 'include' });
        const data = await res.json();
        if (data?.success && data?.state) {
          if (!active) return;
          setState(data.state as IAState);
          setError(null);
        } else {
          throw new Error(data?.error || 'Failed to load state');
        }
      } catch (e: any) {
        if (!active) return;
        setError(e?.message || 'Failed to load state');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const save = useCallback(async (patch: Partial<IAState>) => {
    try {
      const res = await fetch('/api/ia/saveProgress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ patch }),
      });
      const data = await res.json();
      if (!data?.success) throw new Error(data?.error || 'Failed to save');
      setError(null);
      return true;
    } catch (e: any) {
      setError(e?.message || 'Failed to save');
      return false;
    }
  }, []);

  // Debounced autosave when state changes and is marked dirty
  useEffect(() => {
    if (!dirtyRef.current) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      save(state);
      dirtyRef.current = false;
    }, SAVE_DEBOUNCE_MS);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  // Update helpers
  // Accept either a partial patch object OR a functional updater so callers can
  // use the same API shape as React's setState (prev => ...). Some components
  // call `setState` with a function expecting it to behave like React's
  // functional updater — support that to avoid controlled inputs becoming
  // read-only.
  function patch(
    p: Partial<IAState> | ((prev: IAState) => Partial<IAState> | IAState)
  ) {
    if (typeof p === 'function') {
      setState(prev => {
        const result = (p as (prev: IAState) => Partial<IAState> | IAState)(prev) || {};
        // If the updater returned a full state object (has top-level IA keys),
        // use it as the new state; otherwise merge the returned partial.
        const isFullState = Object.keys(result).some(k => (prev as any)[k] !== undefined);
        return isFullState
          ? ({ ...(result as IAState), updatedAt: new Date().toISOString() } as IAState)
          : ({ ...prev, ...(result as Partial<IAState>), updatedAt: new Date().toISOString() } as IAState);
      });
    } else {
      setState(prev => ({ ...prev, ...(p as Partial<IAState>), updatedAt: new Date().toISOString() }));
    }
    dirtyRef.current = true;
  }

  function setStep<K extends keyof IAState>(step: K, value: IAState[K]) {
    setState(prev => ({ ...prev, [step]: value, updatedAt: new Date().toISOString() } as IAState));
    dirtyRef.current = true;
  }

  // Explicit saveNow if needed
  async function saveNow() {
    if (timerRef.current) clearTimeout(timerRef.current);
    dirtyRef.current = false;
    return save(state);
  }

  // Save on tab hide to avoid losing progress
  useEffect(() => {
    const handler = () => {
      if (document.hidden) {
        saveNow();
      }
    };
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  }, [saveNow]);

  return { state, setState: patch, set: patch, setStep, loading, error, saveNow };
}
