import React, { useState, useEffect, useCallback, useMemo } from 'react';

import { useWorkshopStepData } from '@/hooks/useWorkshopStepData';
import { useWorkshopStatus } from '@/hooks/use-workshop-status';
import ScrollIndicator from '@/components/ui/ScrollIndicator';

// ─── Types ───────────────────────────────────────────────────────────────────

interface IA47ContentProps {
  onNext?: (stepId: string) => void;
}

type AnchorKey = 'reframe' | 'stretch' | 'bridge' | 'muse' | 'whatif';

interface IA47StepData {
  rungSummaries: string[];
  selectedAnchor: AnchorKey | null;
  anchorContent: string;
}

const INITIAL_DATA: IA47StepData = {
  rungSummaries: [],
  selectedAnchor: null,
  anchorContent: '',
};

// ─── Constants ───────────────────────────────────────────────────────────────

const EXERCISE_LABELS: Record<AnchorKey, { label: string; subtitle: string }> = {
  reframe: { label: 'Reframing', subtitle: 'The perspective shift' },
  stretch: { label: 'Stretching', subtitle: 'The bigger vision' },
  bridge:  { label: 'Connecting', subtitle: 'The global connection' },
  muse:    { label: 'Inviting the Muse', subtitle: 'The practice' },
  whatif:  { label: 'Your What If', subtitle: 'The synthesis' },
};

const RUNG_CONFIG: { key: AnchorKey; rungNumber: number; tagField: string | null }[] = [
  { key: 'reframe', rungNumber: 1, tagField: 'ia42' },
  { key: 'stretch', rungNumber: 2, tagField: 'ia43' },
  { key: 'bridge',  rungNumber: 3, tagField: 'ia44' },
  { key: 'muse',    rungNumber: 4, tagField: 'ia45' },
  { key: 'whatif',   rungNumber: 5, tagField: null },
];

// ─── Rung Summaries Prompt ──────────────────────────────────────────────────

const RUNG_SUMMARIES_PROMPT = `You are writing five brief rung summaries for someone who just completed five imagination exercises — four collaborating with AI, then one final exercise on their own.

For each rung, write 2-3 sentences that describe what the participant did using THEIR specific words and details. Each summary should feel like a trusted colleague reflecting back what they witnessed.

Return your response in this EXACT format with these exact markers:

[RUNG1]
2-3 sentences about their reframe. What challenge they took on and what the new angle revealed. Use their actual nouns.
[/RUNG1]

[RUNG2]
2-3 sentences about their stretch. How their vision shifted and what the bigger scope revealed.
[/RUNG2]

[RUNG3]
2-3 sentences about their global connection. What happened when they connected their purpose to a global challenge, and what their questions uncovered.
[/RUNG3]

[RUNG4]
2-3 sentences about inviting the muse. What activity they chose, the anchor they're carrying, and what this practice opens up.
[/RUNG4]

[RUNG5]
2-3 sentences about their synthesis. What "What If" emerged when they looked across all four exercises. This one was done without AI — acknowledge that naturally without making it preachy. End with their What If statement close to verbatim.
[/RUNG5]

CRITICAL RULES:
- Use their actual nouns. If they said "funding cuts" say "funding cuts."
- Do NOT congratulate them
- Do NOT use "you discovered," "you learned," "you realized" — just state what happened
- Do NOT add coaching language like "this shows" or "this demonstrates"
- Tone: Warm, grounded, specific. Not congratulatory.
- If any exercise data is missing, write a brief generic summary for that rung (e.g., "You practiced reframing a challenge to find a new angle.")
- The 5th rung should include their What If statement as close to verbatim as possible, with no wrapper or commentary

PARTICIPANT DATA:
{exerciseData}`;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function truncate(text: string, maxLen: number): string {
  if (!text || text.length <= maxLen) return text || '';
  return text.slice(0, maxLen).replace(/\s+\S*$/, '') + '…';
}

function formatActivityName(id: string): string {
  if (!id) return '';
  return id.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function buildExerciseDataString(
  ia42: any,
  ia43: any,
  ia44: any,
  ia45: any,
  ia46: any,
): string {
  const sections: string[] = [];

  if (ia42) {
    sections.push(
      `EXERCISE 1 — REFRAME:`,
      `Original challenge: ${ia42.original_thought || ia42.challenge || '(not provided)'}`,
      `Reframed perspective: ${ia42.new_perspective || '(not provided)'}`,
      `Tag: ${ia42.tag || '(none)'}`,
    );
  }

  if (ia43) {
    sections.push(
      `\nEXERCISE 2 — STRETCH:`,
      `Original vision title: ${ia43.original_title || '(not provided)'}`,
      `Stretched vision title: ${ia43.new_title || '(not provided)'}`,
      `What the two images reveal: ${ia43.story || '(not provided)'}`,
      `Tag: ${ia43.tag || '(none)'}`,
    );
  }

  if (ia44) {
    sections.push(
      `\nEXERCISE 3 — BRIDGE:`,
      `Higher purpose: ${ia44.higher_purpose || '(not provided)'}`,
      `Global challenge: ${ia44.global_challenge || '(not provided)'}`,
      `Bridge view: ${ia44.reframed_view || '(not provided)'}`,
      `Tag: ${ia44.tag || '(none)'}`,
    );
  }

  if (ia45) {
    sections.push(
      `\nEXERCISE 4 — MUSE:`,
      `Chosen activity: ${ia45.exploredActivity || '(not provided)'}`,
      `Anchor/hook: ${ia45.anchor || '(not provided)'}`,
      `Tag: ${ia45.tag || '(none)'}`,
    );
  }

  if (ia46) {
    sections.push(
      `\nEXERCISE 5 — SYNTHESIS (no AI):`,
      `What If statement: ${ia46.whatIf || ia46.vision || '(not provided)'}`,
      `Process reflection: ${ia46.processReflection || ia46.capstone_reflection || '(not provided)'}`,
    );
  }

  return sections.join('\n');
}

function parseRungSummaries(response: string): string[] {
  const summaries: string[] = [];
  for (let i = 1; i <= 5; i++) {
    const regex = new RegExp(`\\[RUNG${i}\\]([\\s\\S]*?)\\[/RUNG${i}\\]`);
    const match = response.match(regex);
    summaries.push(match ? match[1].trim() : '');
  }
  return summaries;
}

interface Exercises {
  ia42: any;
  ia43: any;
  ia44: any;
  ia45: any;
  ia46: any;
}

function getAnchorContent(key: AnchorKey, ex: Exercises): string {
  switch (key) {
    case 'reframe': return ex.ia42?.new_perspective || '';
    case 'stretch': return [ex.ia43?.new_title, ex.ia43?.story].filter(Boolean).join(' — ');
    case 'bridge':  return ex.ia44?.reframed_view || '';
    case 'muse':    return [formatActivityName(ex.ia45?.exploredActivity), ex.ia45?.anchor].filter(Boolean).join(' — ');
    case 'whatif':   return ex.ia46?.whatIf || ex.ia46?.vision || '';
  }
}

function getTagForRung(rungIndex: number, ex: Exercises): string | null {
  const sources = [ex.ia42, ex.ia43, ex.ia44, ex.ia45];
  if (rungIndex >= 4) return null; // Rung 5 has no tag
  return sources[rungIndex]?.tag || null;
}


// ─── Component ───────────────────────────────────────────────────────────────

const IA_4_7_ModuleReflection: React.FC<IA47ContentProps> = ({ onNext }) => {
  const { data, updateData, saving, loaded } = useWorkshopStepData<IA47StepData>(
    'ia',
    'ia-4-7',
    INITIAL_DATA,
    { debounceMs: 1500, enableAutoSave: true },
  );
  const { isWorkshopLocked, iaCompleted, completeWorkshop } = useWorkshopStatus();
  const isStepLocked = isWorkshopLocked('ia', 'ia-4-7');

  // Raw exercise data from prior steps
  const [exerciseData, setExerciseData] = useState<Exercises & { loading: boolean }>({
    ia42: null, ia43: null, ia44: null, ia45: null, ia46: null, loading: true,
  });

  const [synopsisLoading, setSynopsisLoading] = useState(false);

  // ── Fetch prior exercise data ──────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [r42, r43, r44, r45, r46] = await Promise.all([
          fetch('/api/workshop-data/step/ia/ia-4-2', { credentials: 'include' }).then(r => r.json()).catch(() => null),
          fetch('/api/workshop-data/step/ia/ia-4-3', { credentials: 'include' }).then(r => r.json()).catch(() => null),
          fetch('/api/workshop-data/step/ia/ia-4-4', { credentials: 'include' }).then(r => r.json()).catch(() => null),
          fetch('/api/workshop-data/step/ia/ia-4-5', { credentials: 'include' }).then(r => r.json()).catch(() => null),
          fetch('/api/workshop-data/step/ia/ia-4-6', { credentials: 'include' }).then(r => r.json()).catch(() => null),
        ]);
        if (cancelled) return;
        setExerciseData({
          ia42: r42?.data ?? null,
          ia43: r43?.data ?? null,
          ia44: r44?.data ?? null,
          ia45: r45?.data ?? null,
          ia46: r46?.data ?? null,
          loading: false,
        });
      } catch {
        if (!cancelled) setExerciseData(prev => ({ ...prev, loading: false }));
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // ── Generate rung summaries (one-shot, first visit only) ───────────────────
  useEffect(() => {
    if (exerciseData.loading || !loaded) return;
    // If all 5 rung summaries already saved and non-empty, don't regenerate
    if (data.rungSummaries?.filter(Boolean).length === 5) return;

    const { ia42, ia43, ia44, ia45, ia46 } = exerciseData;
    const hasAny = ia42 || ia43 || ia44 || ia45 || ia46;
    if (!hasAny) return;

    setSynopsisLoading(true);
    const exerciseDataStr = buildExerciseDataString(ia42, ia43, ia44, ia45, ia46);
    const prompt = RUNG_SUMMARIES_PROMPT.replace('{exerciseData}', exerciseDataStr);

    fetch('/api/ai/chat/plain', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        training_id: 'ia-4-7-synopsis',
        messages: [
          { role: 'system', content: prompt },
          { role: 'user', content: 'Write the five rung summaries based on the participant data provided.' },
        ],
      }),
    })
      .then(r => r.json())
      .then(result => {
        if (result.success && result.reply) {
          const parsed = parseRungSummaries(result.reply);
          updateData({ rungSummaries: parsed });
        }
      })
      .catch(err => console.error('[ia-4-7] Rung summaries generation failed:', err))
      .finally(() => setSynopsisLoading(false));
  }, [exerciseData.loading, loaded, data.rungSummaries]);

  // ── Anchor selection handler ───────────────────────────────────────────────
  const handleSelectAnchor = useCallback((key: AnchorKey) => {
    const content = getAnchorContent(key, exerciseData);
    updateData({
      selectedAnchor: key,
      anchorContent: content,
    });
  }, [exerciseData, updateData]);

  // ── Derived state ──────────────────────────────────────────────────────────
  const rungSummaries = data.rungSummaries || [];
  const selectedAnchor = data.selectedAnchor;
  const isComplete = selectedAnchor !== null;

  // Check which exercises have data for anchor cards
  const hasExercise = useMemo(() => ({
    reframe: Boolean(exerciseData.ia42?.new_perspective),
    stretch: Boolean(exerciseData.ia43?.new_title || exerciseData.ia43?.story),
    bridge:  Boolean(exerciseData.ia44?.reframed_view),
    muse:    Boolean(exerciseData.ia45?.exploredActivity || exerciseData.ia45?.anchor),
    whatif:  Boolean(exerciseData.ia46?.whatIf || exerciseData.ia46?.vision),
  }), [exerciseData]);

  const anchorKeys: AnchorKey[] = ['reframe', 'stretch', 'bridge', 'muse', 'whatif'];

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-4xl mx-auto p-6">
      <ScrollIndicator idleTime={3000} position="nav-adjacent" colorScheme="purple" />

      {/* ── Page Header ── */}
      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-8 border border-purple-200 mb-8">
        <h1 className="text-3xl font-bold text-purple-700 mb-2">
          Your Collaboration Journey
        </h1>
        <p className="text-lg text-gray-600">
          How your human capabilities worked — with AI and on your own — across five exercises
        </p>
      </div>

      {/* ── Section 1: What You Practiced — Five Rung Cards ── */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">What You Practiced</h2>

        {synopsisLoading ? (
          // Loading skeleton — 5 card placeholders
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-white rounded-xl border border-gray-200 p-6">
                <div className="h-4 bg-purple-100 rounded w-1/3 mb-3" />
                <div className="h-4 bg-purple-100 rounded w-full mb-2" />
                <div className="h-4 bg-purple-100 rounded w-5/6 mb-2" />
                <div className="h-4 bg-purple-100 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {RUNG_CONFIG.map(({ key, rungNumber }, index) => {
              const summary = rungSummaries[index] || '';
              const tag = getTagForRung(index, exerciseData);
              const isCapstone = rungNumber === 5;

              return (
                <div
                  key={key}
                  className={`rounded-xl border p-6 ${
                    isCapstone
                      ? 'bg-gradient-to-br from-purple-50/80 to-indigo-50/60 border-purple-200'
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <h3 className="text-sm font-semibold text-purple-600 uppercase tracking-wide mb-3">
                    Rung {rungNumber}: {EXERCISE_LABELS[key].label}
                  </h3>

                  {summary ? (
                    <p className="text-gray-800 leading-relaxed">{summary}</p>
                  ) : (
                    <p className="text-gray-400 italic">Complete this exercise to see your summary here.</p>
                  )}

                  {tag && (
                    <div className="mt-3">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 border border-purple-200">
                        {tag}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Section 2: One Thing to Carry Forward — Five Anchor Cards ── */}
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">One Thing to Carry Forward</h2>
        <p className="text-gray-500 mb-5">Tap the one that feels most alive right now.</p>

        {/* 2×2 grid for rungs 1-4 */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          {anchorKeys.slice(0, 4).map(key => {
            const { subtitle } = EXERCISE_LABELS[key];
            const has = hasExercise[key];
            const isSelected = selectedAnchor === key;
            const content = has
              ? truncate(getAnchorContent(key, exerciseData), 120)
              : '';

            return (
              <button
                key={key}
                disabled={!has || isStepLocked}
                onClick={() => has && !isStepLocked && handleSelectAnchor(key)}
                className={`relative text-left p-5 rounded-xl border-2 transition-all duration-200 ${
                  !has || isStepLocked
                    ? 'bg-gray-50 border-gray-200 cursor-not-allowed opacity-50'
                    : isSelected
                      ? 'bg-purple-50 border-purple-500 shadow-md'
                      : 'bg-white border-gray-200 hover:border-purple-300 hover:shadow-sm cursor-pointer'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-3 right-3 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}

                <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide mb-1">
                  {subtitle}
                </p>

                {has ? (
                  <p className="text-sm text-gray-700 leading-relaxed">{content}</p>
                ) : (
                  <p className="text-sm text-gray-400 italic">Not yet completed</p>
                )}
              </button>
            );
          })}
        </div>

        {/* Full-width capstone card for rung 5 */}
        {(() => {
          const key: AnchorKey = 'whatif';
          const { subtitle } = EXERCISE_LABELS[key];
          const has = hasExercise[key];
          const isSelected = selectedAnchor === key;
          const content = has ? getAnchorContent(key, exerciseData) : '';

          return (
            <button
              disabled={!has || isStepLocked}
              onClick={() => has && !isStepLocked && handleSelectAnchor(key)}
              className={`relative w-full text-left p-5 rounded-xl border-2 transition-all duration-200 ${
                !has || isStepLocked
                  ? 'bg-gray-50 border-gray-200 cursor-not-allowed opacity-50'
                  : isSelected
                    ? 'bg-purple-50 border-purple-500 shadow-md'
                    : 'bg-white border-gray-200 hover:border-purple-300 hover:shadow-sm cursor-pointer'
              }`}
            >
              {isSelected && (
                <div className="absolute top-3 right-3 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}

              <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide mb-1">
                {subtitle}
              </p>

              {has ? (
                <p className="text-sm text-gray-700 leading-relaxed">{content}</p>
              ) : (
                <p className="text-sm text-gray-400 italic">Not yet completed</p>
              )}
            </button>
          );
        })()}
      </div>

      {/* Bridge line */}
      <p className="text-center text-gray-600 mt-6 mb-2">
        In each exercise, AI offered something. The work happened when you decided whether it was right. In Module 5, you'll see why that matters.
      </p>

      {/* ── Continue button ── */}
      {(isComplete || isStepLocked) && (
        <div className="flex justify-end mb-8">
          <button
            onClick={async () => {
              if (!iaCompleted) {
                const result = await completeWorkshop('ia');
                if (result.success) {
                  console.log('✅ IA workshop completed — modules 1-4 now locked');
                } else {
                  console.warn('⚠️ IA workshop completion not ready:', result.error);
                }
              }
              onNext?.('ia-5-1');
            }}
            disabled={saving}
            className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Continue to Module 5 →'}
          </button>
        </div>
      )}
    </div>
  );
};

export default IA_4_7_ModuleReflection;
