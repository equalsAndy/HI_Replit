import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useWorkshopStepData } from '@/hooks/useWorkshopStepData';
import { useWorkshopStatus } from '@/hooks/use-workshop-status';
import ScrollIndicator from '@/components/ui/ScrollIndicator';

interface IA37ContentProps {
  onNext?: (stepId: string) => void;
}

type CapabilityKey = 'imagination' | 'curiosity' | 'caring' | 'creativity' | 'courage';
type ExerciseKey = 'autoflow' | 'visualization' | 'intention' | 'inspiration' | 'mystery';

const CAPABILITY_KEYS: CapabilityKey[] = ['imagination', 'curiosity', 'caring', 'creativity', 'courage'];

const CAPABILITY_META: Record<CapabilityKey, { label: string; color: string }> = {
  imagination: { label: 'Imagination', color: '#8b5cf6' },
  curiosity:   { label: 'Curiosity',   color: '#10b981' },
  caring:      { label: 'Caring',      color: '#3b82f6' },
  creativity:  { label: 'Creativity',  color: '#f59e0b' },
  courage:     { label: 'Courage',     color: '#ef4444' },
};

const EXERCISE_LABELS: Record<ExerciseKey, string> = {
  autoflow: 'Autoflow',
  visualization: 'Visualization',
  intention: 'Intention',
  inspiration: 'Inspiration',
  mystery: 'Mystery',
};

const EXERCISE_ORDER: ExerciseKey[] = ['autoflow', 'visualization', 'intention', 'inspiration', 'mystery'];

const INTERLUDE_TITLES: Record<string, string> = {
  nature: 'Walk in Nature',
  beauty: 'Capture Beauty',
  journal: 'Journal Thoughts',
  create: 'Create Art',
  vision: 'Vision Board',
  play: 'Play',
  learn: 'Learn New Skills',
  heroes: 'Read Heroes',
  art: 'Experience Art',
};

interface IA37StepData {
  selectedExercise: string | null;
  capability_ratings: Record<CapabilityKey, number>;
  // Legacy fields so old data doesn't crash
  capability_noticed?: Record<string, string>;
  capability_notes?: Record<string, string>;
  scenario_notes?: string;
  ai_summaries?: Record<string, string>;
  ai_questions?: Record<string, string>;
}

const INITIAL_DATA: IA37StepData = {
  selectedExercise: null,
  capability_ratings: {} as Record<CapabilityKey, number>,
};

// ── Module Journey Data (read-only from prior steps) ──────────────────────────

interface ModuleJourneyData {
  autoflow: { momentCount: number } | null;
  visualization: { imageTitle: string } | null;
  intention: { completed: boolean } | null;
  inspiration: { interludeCount: number } | null;
  mystery: { mysteryName: string } | null;
  rawData: Record<string, any>;
  loading: boolean;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function truncateToFirstSentence(text: string, maxLen = 120): string {
  if (!text) return '';
  const match = text.match(/^[^.!?]+[.!?]/);
  const sentence = match ? match[0] : text;
  if (sentence.length <= maxLen) return sentence;
  return sentence.slice(0, maxLen).trimEnd() + '\u2026';
}

function truncateText(text: string, maxLen: number): string {
  if (!text) return '';
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen).trimEnd() + '\u2026';
}

function getRichDescription(exercise: ExerciseKey, rawData: Record<string, any>): string {
  const d = rawData[exercise];
  if (!d) return '';

  switch (exercise) {
    case 'autoflow': {
      const moments = d.savedMoments;
      if (!moments || moments.length === 0) return 'You noticed your mind\'s automatic stream';
      const firstText = truncateText(moments[0].text || '', 80);
      const tag = moments[0].tag ? ` (${moments[0].tag})` : '';
      if (moments.length === 1) {
        return `You noticed your mind's automatic stream \u2014 captured "${firstText}"${tag}`;
      }
      return `You noticed your mind's automatic stream \u2014 captured ${moments.length} moments, starting with "${firstText}"${tag}`;
    }

    case 'visualization': {
      const title = d.imageTitle || '';
      const reflection = d.reflection || '';
      const firstSentence = truncateToFirstSentence(reflection);
      if (title && firstSentence) {
        return `You found an image for a side of yourself waiting to be used \u2014 "${title}". ${firstSentence}`;
      }
      if (title) {
        return `You found an image for a side of yourself waiting to be used \u2014 "${title}"`;
      }
      return 'You found an image for a side of yourself waiting to be used';
    }

    case 'intention': {
      const why = d.whyReflection || '';
      if (!why) return 'You named what pulls your attention';
      if (why.length < 120) return `You named what pulls your attention \u2014 ${why}`;
      return `You named what pulls your attention \u2014 ${truncateToFirstSentence(why)}`;
    }

    case 'inspiration': {
      const completed: string[] = d.completed || [];
      const responses: Record<string, string> = d.responses || {};
      if (completed.length === 0) return 'You sat with what makes you feel most alive';
      const firstId = completed[0];
      const firstTitle = INTERLUDE_TITLES[firstId] || firstId;
      if (completed.length === 1) {
        const response = responses[firstId] || '';
        const firstSentence = truncateToFirstSentence(response);
        const suffix = firstSentence ? `. ${firstSentence}` : '';
        return `You sat with what makes you feel most alive \u2014 chose "${firstTitle}"${suffix}`;
      }
      return `You sat with what makes you feel most alive \u2014 ${completed.length} interludes completed, including "${firstTitle}"`;
    }

    case 'mystery': {
      const mystery = d.selectedMystery || 'the unknown';
      const question = d.selectedQuestion || '';
      if (question) {
        return `You leapt into ${mystery} \u2014 asking "${truncateText(question, 100)}"`;
      }
      return `You leapt into ${mystery}`;
    }

    default:
      return '';
  }
}

// ── Component ─────────────────────────────────────────────────────────────────

const IA_3_7_ModuleReflection: React.FC<IA37ContentProps> = ({ onNext }) => {
  const { data, updateData, saving, loaded } = useWorkshopStepData<IA37StepData>(
    'ia',
    'ia-3-7',
    INITIAL_DATA,
    { debounceMs: 1500, enableAutoSave: true }
  );

  const { isWorkshopLocked } = useWorkshopStatus();
  const isStepLocked = isWorkshopLocked('ia', 'ia-3-7');

  // Module 3 journey data (read-only)
  const [moduleData, setModuleData] = useState<ModuleJourneyData>({
    autoflow: null, visualization: null, intention: null,
    inspiration: null, mystery: null, rawData: {}, loading: true,
  });

  // Fetch Module 3 journey data on mount
  useEffect(() => {
    const fetchModuleData = async () => {
      try {
        const [r32, r33, r34, r35, r36] = await Promise.all([
          fetch('/api/workshop-data/step/ia/ia-3-2', { credentials: 'include' }).then(r => r.json()).catch(() => null),
          fetch('/api/workshop-data/step/ia/ia-3-3', { credentials: 'include' }).then(r => r.json()).catch(() => null),
          fetch('/api/workshop-data/step/ia/ia-3-4', { credentials: 'include' }).then(r => r.json()).catch(() => null),
          fetch('/api/ia/steps/ia-3-5', { credentials: 'include' }).then(r => r.json()).catch(() => null),
          fetch('/api/workshop-data/step/ia/ia-3-6', { credentials: 'include' }).then(r => r.json()).catch(() => null),
        ]);

        const d32 = r32?.data;
        const d33 = r33?.data;
        const d34 = r34?.data;
        const d35 = r35?.data;
        const d36 = r36?.data;

        const rawData: Record<string, any> = {};
        if (d32) rawData.autoflow = d32;
        if (d33) rawData.visualization = d33;
        if (d34) rawData.intention = d34;
        if (d35) rawData.inspiration = d35;
        if (d36) rawData.mystery = d36;

        setModuleData({
          autoflow: d32?.savedMoments?.length > 0
            ? { momentCount: d32.savedMoments.length }
            : null,
          visualization: d33?.imageTitle?.trim()
            ? { imageTitle: d33.imageTitle }
            : null,
          intention: d34?.whyReflection?.trim()
            ? { completed: true }
            : null,
          inspiration: d35?.completed?.length > 0
            ? { interludeCount: d35.completed.length }
            : null,
          mystery: d36?.selectedMystery?.trim()
            ? { mysteryName: d36.selectedMystery }
            : null,
          rawData,
          loading: false,
        });
      } catch (e) {
        console.error('Failed to load Module 3 journey data:', e);
        setModuleData(prev => ({ ...prev, loading: false }));
      }
    };
    fetchModuleData();
  }, []);

  // Which exercises have data
  const exerciseHasData: Record<ExerciseKey, boolean> = {
    autoflow: !!moduleData.autoflow,
    visualization: !!moduleData.visualization,
    intention: !!moduleData.intention,
    inspiration: !!moduleData.inspiration,
    mystery: !!moduleData.mystery,
  };

  const hasAnyJourneyData = !moduleData.loading && (
    moduleData.autoflow || moduleData.visualization || moduleData.intention ||
    moduleData.inspiration || moduleData.mystery
  );

  // Exercise selection handler
  const handleSelectExercise = useCallback((exercise: ExerciseKey) => {
    const ratings = data.capability_ratings || {};
    const hasAllRatings = CAPABILITY_KEYS.every(k => ratings[k] !== undefined);

    if (hasAllRatings) {
      updateData({ selectedExercise: exercise });
    } else {
      // Initialize all ratings to 3
      const initialRatings = {} as Record<CapabilityKey, number>;
      for (const k of CAPABILITY_KEYS) {
        initialRatings[k] = ratings[k] ?? 3;
      }
      updateData({ selectedExercise: exercise, capability_ratings: initialRatings });
    }
  }, [data.capability_ratings, updateData]);

  // Slider rating handler
  const handleRatingChange = useCallback((capability: CapabilityKey, value: number) => {
    updateData({
      capability_ratings: { ...data.capability_ratings, [capability]: value },
    });
  }, [data.capability_ratings, updateData]);

  // Completion logic
  const hasSelection = data.selectedExercise !== null;
  const ratings = data.capability_ratings || {};
  const allRated = CAPABILITY_KEYS.every(k => ratings[k] !== undefined);
  const isComplete = hasSelection && allRated;

  const ratingValues = Object.values(ratings);
  const highCaps = CAPABILITY_KEYS.filter(k => (ratings[k] || 0) >= 4);
  const highCapNames = highCaps.map(k => CAPABILITY_META[k].label).join(', ');

  return (
    <div className="max-w-4xl mx-auto p-6">
      <ScrollIndicator idleTime={3000} position="nav-adjacent" colorScheme="purple" />

      {/* ── Section 1: Module 3 Journey Header ── */}
      <div className="bg-gradient-to-br from-purple-700 to-purple-900 rounded-2xl p-8 text-white mb-8 relative overflow-hidden">
        <div className="absolute -top-[40%] -right-[20%] w-[300px] h-[300px] bg-[radial-gradient(circle,rgba(255,255,255,0.06)_0%,transparent_70%)] rounded-full" />
        <div className="absolute -bottom-[30%] -left-[10%] w-[200px] h-[200px] bg-[radial-gradient(circle,rgba(168,85,247,0.3)_0%,transparent_70%)] rounded-full" />

        <p className="text-[11px] font-semibold tracking-[1.5px] uppercase text-purple-300 mb-3 relative z-10">
          Module 3 · Wrap-up
        </p>
        <h2 className="text-[28px] leading-tight mb-4 relative z-10 font-bold">
          Your Module 3 Journey
        </h2>
        <p className="text-[15px] leading-relaxed text-white/85 relative z-10">
          Here's what you practiced across this module.
        </p>
      </div>

      {/* Journey Cards */}
      {moduleData.loading ? (
        <div className="text-sm text-gray-400 italic mb-8 pl-2">Loading your journey...</div>
      ) : hasAnyJourneyData ? (
        <>
          {/* Selection instruction */}
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="text-gray-800">A Moment That Shifted</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm">
                Which of these moments stands out right now? Tap to select.
              </p>
              {data.selectedExercise && (
                <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 border border-purple-200">
                  <span className="text-xs font-medium text-purple-700">
                    Selected: {EXERCISE_LABELS[data.selectedExercise as ExerciseKey]}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-3 mb-4">
            {EXERCISE_ORDER.map(exercise => {
              if (!exerciseHasData[exercise]) return null;
              const isSelected = data.selectedExercise === exercise;
              const description = getRichDescription(exercise, moduleData.rawData);

              const vizImage = exercise === 'visualization'
                ? (moduleData.rawData.visualization?.selectedImage || moduleData.rawData.visualization?.uploadedImage || null)
                : null;

              return (
                <button
                  key={exercise}
                  type="button"
                  onClick={() => !isStepLocked && handleSelectExercise(exercise)}
                  disabled={isStepLocked}
                  className={`w-full text-left flex items-start gap-3 pl-4 pr-4 py-3 rounded-xl transition-all duration-200 ${isStepLocked ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'} ${
                    isSelected
                      ? 'bg-purple-50 border-2 border-purple-400 shadow-sm'
                      : 'bg-white border border-gray-200 hover:bg-purple-50/50 hover:border-purple-200'
                  }`}
                >
                  <span className={`mt-0.5 flex-shrink-0 ${isSelected ? 'text-purple-600' : 'text-green-500'}`}>
                    {isSelected ? (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="2" fill="none" />
                        <circle cx="8" cy="8" r="4" />
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 8.5L6.5 12L13 4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className={`text-[14px] font-bold ${isSelected ? 'text-purple-800' : 'text-gray-800'}`}>
                      {EXERCISE_LABELS[exercise]}
                    </p>
                    <p className={`text-[13px] ${isSelected ? 'text-purple-600' : 'text-gray-500'}`}>
                      {description}
                    </p>
                  </div>
                  {vizImage && (
                    <img
                      src={vizImage}
                      alt="Your visualization"
                      className="w-12 h-12 rounded-lg object-cover flex-shrink-0 mt-0.5"
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Incomplete exercises (not clickable) */}
          {EXERCISE_ORDER.some(ex => !exerciseHasData[ex]) && (
            <div className="space-y-2 mb-8 opacity-50">
              {EXERCISE_ORDER.filter(ex => !exerciseHasData[ex]).map(exercise => (
                <div key={exercise} className="flex items-start gap-3 pl-4 pr-4 py-2">
                  <span className="text-gray-300 mt-0.5 flex-shrink-0">&#9675;</span>
                  <div>
                    <p className="text-sm font-medium text-gray-400">{EXERCISE_LABELS[exercise]}</p>
                    <p className="text-sm text-gray-300">Not yet completed</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <p className="text-sm text-gray-400 italic mb-8 pl-2">Complete the exercises above to see your journey here.</p>
      )}

      {/* ── Section 2: Capability Ratings ── */}
      {hasSelection && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="text-center mb-7 px-2">
            <h3 className="text-xl font-bold mb-2 text-gray-900">
              What showed up in that moment?
            </h3>
            <p className="text-sm leading-relaxed text-gray-500">
              For the moment you selected, how present was each capability? Tap a number.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="space-y-4">
              {CAPABILITY_KEYS.map(cap => {
                const meta = CAPABILITY_META[cap];
                const value = ratings[cap] ?? 3;

                return (
                  <div key={cap} className="flex items-center gap-3">
                    <span
                      className="text-[13px] font-medium w-[90px] flex-shrink-0"
                      style={{ color: meta.color }}
                    >
                      {meta.label}
                    </span>
                    <div className="flex gap-2 flex-1">
                      {[1, 2, 3, 4, 5].map(n => {
                        const isActive = value === n;
                        return (
                          <button
                            key={n}
                            type="button"
                            onClick={() => !isStepLocked && handleRatingChange(cap, n)}
                            disabled={isStepLocked}
                            className={`flex-1 h-10 rounded-lg text-[14px] font-medium transition-all duration-150 ${isStepLocked ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                            style={{
                              border: `1.5px solid ${isActive ? meta.color : '#e5e7eb'}`,
                              backgroundColor: isActive ? meta.color : 'white',
                              color: isActive ? 'white' : '#9ca3af',
                            }}
                          >
                            {n}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Scale anchors */}
            <div className="flex justify-between mt-2" style={{ paddingLeft: '102px' }}>
              <span className="text-[11px] text-gray-400">barely there</span>
              <span className="text-[11px] text-gray-400">fully present</span>
            </div>
          </div>

          {/* ── Section 3: Closing ── */}
          {isComplete && (
            <Card className="text-center border-purple-200 mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <CardContent className="py-8">
                <h3 className="text-xl font-bold text-purple-800 mb-3">Reflection Complete</h3>
                <p className="text-gray-600 mb-3 max-w-md mx-auto">
                  {highCaps.length === 0
                    ? "Interesting \u2014 none of the capabilities felt strongly present. That's useful to notice."
                    : highCaps.length <= 2
                      ? `You noticed ${highCapNames} showing up most in that moment.`
                      : `Multiple capabilities were active in that moment \u2014 ${highCapNames}.`
                  }
                </p>
                <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">
                  Next, you'll work with an AI thinking partner &mdash; and see what a different kind of reflection surfaces.
                </p>
                <Button
                  onClick={() => onNext?.('ia-4-1')}
                  disabled={saving || isStepLocked}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3"
                >
                  {saving ? 'Saving...' : 'Continue to Module 4 \u2192'}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default IA_3_7_ModuleReflection;
