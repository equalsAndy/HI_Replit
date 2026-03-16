import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useWorkshopStepData } from '@/hooks/useWorkshopStepData';
import ScrollIndicator from '@/components/ui/ScrollIndicator';

// ─── Types ───────────────────────────────────────────────────────────────────

interface IA47ContentProps {
  onNext?: (stepId: string) => void;
}

type AnchorKey = 'reframe' | 'stretch' | 'bridge' | 'muse';

interface IA47StepData {
  synopsis: string;
  tags: { exercise: string; tag: string }[];
  capabilityCounts: Record<string, number>;
  topCapabilities: string[];
  capabilitySummaryLine: string;
  selectedAnchor: AnchorKey | null;
  anchorContent: string;
}

const INITIAL_DATA: IA47StepData = {
  synopsis: '',
  tags: [],
  capabilityCounts: {},
  topCapabilities: [],
  capabilitySummaryLine: '',
  selectedAnchor: null,
  anchorContent: '',
};

// ─── Constants ───────────────────────────────────────────────────────────────

type CapabilityKey = 'imagination' | 'curiosity' | 'caring' | 'creativity' | 'courage';

const CAPABILITIES: { key: CapabilityKey; label: string; color: string }[] = [
  { key: 'imagination', label: 'Imagination', color: '#8b5cf6' },
  { key: 'curiosity',   label: 'Curiosity',   color: '#10b981' },
  { key: 'caring',      label: 'Caring',      color: '#3b82f6' },
  { key: 'creativity',  label: 'Creativity',  color: '#f59e0b' },
  { key: 'courage',     label: 'Courage',     color: '#ef4444' },
];

const EXERCISE_LABELS: Record<AnchorKey, { label: string; subtitle: string }> = {
  reframe:    { label: 'Reframe',    subtitle: 'The perspective shift' },
  stretch:    { label: 'Stretch',    subtitle: 'The bigger vision' },
  bridge:     { label: 'Bridge',     subtitle: 'The global connection' },
  muse:       { label: 'Muse',       subtitle: 'The practice' },
};

const TAG_EXERCISE_ORDER: { key: AnchorKey; stepId: string }[] = [
  { key: 'reframe', stepId: 'ia-4-2' },
  { key: 'stretch', stepId: 'ia-4-3' },
  { key: 'bridge',  stepId: 'ia-4-4' },
  { key: 'muse',    stepId: 'ia-4-5' },
];

// ─── Synopsis Prompt ─────────────────────────────────────────────────────────

const SYNOPSIS_SYSTEM_PROMPT = `You are writing a brief personal synopsis for someone who just completed four imagination exercises where they collaborated with AI using their human capabilities. Use THEIR specific words and details — never generalize, never use abstract language.

Write 4-5 sentences that thread their journey as a single narrative arc:
- Sentence 1-2: What challenge they started with and what the reframe revealed
- Sentence 3: How they stretched their vision beyond its original scope
- Sentence 4: What they discovered when they connected their purpose to a global challenge
- Sentence 5: The activity they chose to invite the muse into and the anchor they're carrying, stated in their words

CRITICAL RULES:
- Use their actual nouns. If they said "funding cuts" say "funding cuts." If they said "sales pipeline" say "sales pipeline."
- The last sentence must reference their chosen activity and anchor as close to verbatim as possible with NO commentary, NO encouragement, NO "Great job!" wrapper
- Do NOT congratulate them
- Do NOT use phrases like "you discovered," "you learned," "you realized" — just state what happened
- Do NOT add coaching language like "this shows" or "this demonstrates"
- Tone: Like a trusted colleague reflecting back what they witnessed. Warm, grounded, specific.
- If any exercise data is missing, skip that part of the narrative gracefully — don't mention the gap`;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function truncate(text: string, maxLen: number): string {
  if (!text || text.length <= maxLen) return text || '';
  return text.slice(0, maxLen).replace(/\s+\S*$/, '') + '…';
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function buildExerciseDataString(
  ia42: any,
  ia43: any,
  ia44: any,
  ia45: any,
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

  return sections.join('\n');
}

function aggregateCapabilities(ia42: any, ia43: any, ia45: any) {
  const allSelected: string[] = [
    ...(Array.isArray(ia42?.capabilities_applied) ? ia42.capabilities_applied : []),
    ...Object.keys(ia43?.capability_stretches || {}),
    ...(Array.isArray(ia45?.selectedCoachingLines) ? ia45.selectedCoachingLines : []),
  ].map(c => c.toLowerCase());

  const counts: Record<string, number> = {};
  allSelected.forEach(cap => {
    if (CAPABILITIES.some(c => c.key === cap)) {
      counts[cap] = (counts[cap] || 0) + 1;
    }
  });

  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  let topCapabilities: string[];
  let summaryLine: string;

  if (sorted.length === 0) {
    topCapabilities = [];
    summaryLine = '';
  } else if (sorted.length === 1 || sorted[0][1] > (sorted[1]?.[1] ?? 0)) {
    // One dominant
    const [cap, count] = sorted[0];
    if (count >= 3) {
      topCapabilities = [cap];
      summaryLine = `${capitalize(cap)} showed up in all three exercises where you selected capabilities.`;
    } else {
      topCapabilities = sorted.slice(0, 2).map(([c]) => c);
      if (topCapabilities.length === 2) {
        summaryLine = `${capitalize(topCapabilities[0])} and ${capitalize(topCapabilities[1])} showed up in ${sorted[0][1]} of your exercises.`;
      } else {
        summaryLine = `${capitalize(cap)} showed up across your exercises.`;
      }
    }
  } else if (sorted[0][1] === sorted[1][1] && sorted[2]?.[1] === sorted[0][1]) {
    // 3+ tied
    topCapabilities = sorted.filter(([, c]) => c === sorted[0][1]).slice(0, 3).map(([cap]) => cap);
    const names = topCapabilities.map(capitalize);
    summaryLine = `${names.slice(0, -1).join(', ')}, and ${names[names.length - 1]} each appeared across your exercises.`;
  } else {
    // 2 tied at top
    topCapabilities = sorted.filter(([, c]) => c === sorted[0][1]).slice(0, 2).map(([cap]) => cap);
    const names = topCapabilities.map(capitalize);
    summaryLine = `${names[0]} and ${names[1]} showed up in ${sorted[0][1]} of your exercises.`;
  }

  return { counts, topCapabilities, summaryLine };
}

function buildTags(ia42: any, ia43: any, ia44: any, ia45: any) {
  const tags: { exercise: string; tag: string }[] = [];
  if (ia42?.tag) tags.push({ exercise: 'reframe', tag: ia42.tag });
  if (ia43?.tag) tags.push({ exercise: 'stretch', tag: ia43.tag });
  if (ia44?.tag) tags.push({ exercise: 'bridge', tag: ia44.tag });
  if (ia45?.tag) tags.push({ exercise: 'muse', tag: ia45.tag });
  return tags;
}

function getAnchorContent(key: AnchorKey, ia42: any, ia43: any, ia44: any, ia45: any): string {
  switch (key) {
    case 'reframe': return ia42?.new_perspective || '';
    case 'stretch': return [ia43?.new_title, ia43?.story].filter(Boolean).join(' — ');
    case 'bridge':  return ia44?.reframed_view || '';
    case 'muse':    return [ia45?.exploredActivity, ia45?.anchor].filter(Boolean).join(' — ');
  }
}

// ─── Component ───────────────────────────────────────────────────────────────

const IA_4_7_ModuleReflection: React.FC<IA47ContentProps> = ({ onNext }) => {
  const { data, updateData, saving, loaded } = useWorkshopStepData<IA47StepData>(
    'ia',
    'ia-4-7',
    INITIAL_DATA,
    { debounceMs: 1500, enableAutoSave: true },
  );

  // Raw exercise data from prior steps
  const [exerciseData, setExerciseData] = useState<{
    ia42: any; ia43: any; ia44: any; ia45: any; loading: boolean;
  }>({ ia42: null, ia43: null, ia44: null, ia45: null, loading: true });

  const [synopsisLoading, setSynopsisLoading] = useState(false);

  // ── Fetch prior exercise data ──────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [r42, r43, r44, r45] = await Promise.all([
          fetch('/api/workshop-data/step/ia/ia-4-2', { credentials: 'include' }).then(r => r.json()).catch(() => null),
          fetch('/api/workshop-data/step/ia/ia-4-3', { credentials: 'include' }).then(r => r.json()).catch(() => null),
          fetch('/api/workshop-data/step/ia/ia-4-4', { credentials: 'include' }).then(r => r.json()).catch(() => null),
          fetch('/api/workshop-data/step/ia/ia-4-5', { credentials: 'include' }).then(r => r.json()).catch(() => null),
        ]);
        if (cancelled) return;
        setExerciseData({
          ia42: r42?.data ?? null,
          ia43: r43?.data ?? null,
          ia44: r44?.data ?? null,
          ia45: r45?.data ?? null,
          loading: false,
        });
      } catch {
        if (!cancelled) setExerciseData(prev => ({ ...prev, loading: false }));
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // ── Compute capability aggregation + tags ──────────────────────────────────
  const { counts, topCaps, summaryLine, tags } = useMemo(() => {
    if (exerciseData.loading) return { counts: {}, topCaps: [] as string[], summaryLine: '', tags: [] as { exercise: string; tag: string }[] };
    const { ia42, ia43, ia44, ia45 } = exerciseData;
    const agg = aggregateCapabilities(ia42, ia43, ia45);
    const t = buildTags(ia42, ia43, ia44, ia45);
    return { counts: agg.counts, topCaps: agg.topCapabilities, summaryLine: agg.summaryLine, tags: t };
  }, [exerciseData]);

  // ── Save computed data once available ──────────────────────────────────────
  useEffect(() => {
    if (exerciseData.loading || !loaded) return;
    // Only save computed fields if they haven't been saved yet
    if (!data.capabilitySummaryLine && summaryLine) {
      updateData({
        capabilityCounts: counts,
        topCapabilities: topCaps,
        capabilitySummaryLine: summaryLine,
        tags,
      });
    }
  }, [exerciseData.loading, loaded, summaryLine]);

  // ── Generate synopsis (one-shot, first visit only) ─────────────────────────
  useEffect(() => {
    if (exerciseData.loading || !loaded) return;
    // If synopsis already saved, don't regenerate
    if (data.synopsis) return;

    const { ia42, ia43, ia44, ia45 } = exerciseData;
    const hasAny = ia42 || ia43 || ia44 || ia45;
    if (!hasAny) return;

    setSynopsisLoading(true);
    const exerciseDataStr = buildExerciseDataString(ia42, ia43, ia44, ia45);

    fetch('/api/ai/chat/plain', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        training_id: 'ia-4-7-synopsis',
        messages: [
          { role: 'system', content: SYNOPSIS_SYSTEM_PROMPT },
          { role: 'user', content: `Write the synopsis based on the participant data provided.\n\n${exerciseDataStr}` },
        ],
      }),
    })
      .then(r => r.json())
      .then(result => {
        if (result.success && result.reply) {
          updateData({ synopsis: result.reply });
        }
      })
      .catch(err => console.error('[ia-4-7] Synopsis generation failed:', err))
      .finally(() => setSynopsisLoading(false));
  }, [exerciseData.loading, loaded, data.synopsis]);

  // ── Anchor selection handler ───────────────────────────────────────────────
  const handleSelectAnchor = useCallback((key: AnchorKey) => {
    const { ia42, ia43, ia44, ia45 } = exerciseData;
    const content = getAnchorContent(key, ia42, ia43, ia44, ia45);
    updateData({
      selectedAnchor: key,
      anchorContent: content,
    });
  }, [exerciseData, updateData]);

  // ── Derived state ──────────────────────────────────────────────────────────
  const synopsis = data.synopsis;
  const selectedAnchor = data.selectedAnchor;
  const isComplete = selectedAnchor !== null;

  // Check which exercises have data for anchor cards
  const hasExercise = useMemo(() => ({
    reframe: Boolean(exerciseData.ia42?.new_perspective),
    stretch: Boolean(exerciseData.ia43?.new_title || exerciseData.ia43?.story),
    bridge:  Boolean(exerciseData.ia44?.reframed_view),
    muse:    Boolean(exerciseData.ia45?.exploredActivity || exerciseData.ia45?.anchor),
  }), [exerciseData]);

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
          How your human capabilities worked with AI across four exercises
        </p>
      </div>

      {/* ── Section 1: What You Practiced ── */}
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">What You Practiced</h2>

        {/* Synopsis */}
        {synopsisLoading ? (
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-purple-100 rounded w-full" />
            <div className="h-4 bg-purple-100 rounded w-5/6" />
            <div className="h-4 bg-purple-100 rounded w-4/6" />
            <div className="h-4 bg-purple-100 rounded w-3/4" />
          </div>
        ) : synopsis ? (
          <div className="bg-purple-50/60 border border-purple-100 rounded-lg p-5">
            <p className="text-gray-800 leading-relaxed">{synopsis}</p>
          </div>
        ) : (
          <p className="text-gray-400 italic">Complete the Module 4 exercises to see your journey summary.</p>
        )}

        {/* Tag badges row */}
        <div className="flex gap-2 mt-5 flex-wrap">
          {TAG_EXERCISE_ORDER.map(({ key }) => {
            const tag = tags.find(t => t.exercise === key);
            return (
              <span
                key={key}
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                  tag
                    ? 'bg-purple-100 text-purple-700 border border-purple-200'
                    : 'bg-gray-100 text-gray-400 border border-gray-200'
                }`}
              >
                {tag ? tag.tag : EXERCISE_LABELS[key].label}
              </span>
            );
          })}
        </div>
      </div>

      {/* ── Section 2: Capabilities That Showed Up ── */}
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-5">Capabilities That Showed Up</h2>

        {/* Capability pills row */}
        <div className="flex justify-center gap-4 flex-wrap mb-4">
          {CAPABILITIES.map(({ key, label, color }) => {
            const count = counts[key] || 0;
            const isTop = topCaps.includes(key);
            return (
              <div key={key} className="flex flex-col items-center gap-1.5">
                <div
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                    isTop
                      ? 'text-white shadow-md'
                      : 'border-2 bg-white'
                  }`}
                  style={
                    isTop
                      ? { backgroundColor: color }
                      : { borderColor: color, color, opacity: count > 0 ? 1 : 0.4 }
                  }
                >
                  {label}
                </div>
                {/* Count indicator */}
                <div className="flex gap-0.5">
                  {count > 0 ? (
                    Array.from({ length: count }).map((_, i) => (
                      <div
                        key={i}
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                    ))
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-gray-200" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary line */}
        {summaryLine && (
          <p className="text-center text-gray-600 mt-3">{summaryLine}</p>
        )}
      </div>

      {/* ── Section 3: One Thing to Carry Forward ── */}
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">One Thing to Carry Forward</h2>
        <p className="text-gray-500 mb-5">Tap the one that feels most alive right now.</p>

        {/* 2×2 grid */}
        <div className="grid grid-cols-2 gap-4">
          {(Object.keys(EXERCISE_LABELS) as AnchorKey[]).map(key => {
            const { subtitle } = EXERCISE_LABELS[key];
            const has = hasExercise[key];
            const isSelected = selectedAnchor === key;
            const content = has
              ? truncate(getAnchorContent(key, exerciseData.ia42, exerciseData.ia43, exerciseData.ia44, exerciseData.ia45), 120)
              : '';

            return (
              <button
                key={key}
                disabled={!has}
                onClick={() => has && handleSelectAnchor(key)}
                className={`relative text-left p-5 rounded-xl border-2 transition-all duration-200 ${
                  !has
                    ? 'bg-gray-50 border-gray-200 cursor-not-allowed opacity-50'
                    : isSelected
                      ? 'bg-purple-50 border-purple-500 shadow-md'
                      : 'bg-white border-gray-200 hover:border-purple-300 hover:shadow-sm cursor-pointer'
                }`}
              >
                {/* Selected checkmark */}
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
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {content}
                  </p>
                ) : (
                  <p className="text-sm text-gray-400 italic">Not yet completed</p>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Continue button ── */}
      {isComplete && (
        <div className="flex justify-end mb-8">
          <button
            onClick={() => onNext?.('ia-5-1')}
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
