import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useWorkshopStepData } from '@/hooks/useWorkshopStepData';
import ScrollIndicator from '@/components/ui/ScrollIndicator';

interface IA37ContentProps {
  onNext?: (stepId: string) => void;
}

type CapabilityKey = 'imagination' | 'curiosity' | 'caring' | 'creativity' | 'courage';
type ExerciseKey = 'autoflow' | 'visualization' | 'intention' | 'inspiration' | 'mystery';
type NoticeValue = 'yes' | 'not_really' | 'unsure';

const CAPABILITIES: {
  key: CapabilityKey;
  label: string;
  color: string;
  colorFaint: string;
  colorBg: string;
  icon: string;
  question: string;
}[] = [
  {
    key: 'imagination',
    label: 'Imagination',
    color: '#8b5cf6',
    colorFaint: 'rgba(139,92,246,0.08)',
    colorBg: 'rgba(139,92,246,0.1)',
    icon: '/assets/Imagination_sq.png',
    question: "Did you see possibilities in the situation that weren't immediately obvious to others?",
  },
  {
    key: 'curiosity',
    label: 'Curiosity',
    color: '#10b981',
    colorFaint: 'rgba(16,185,129,0.08)',
    colorBg: 'rgba(16,185,129,0.1)',
    icon: '/assets/Curiosity_sq.png',
    question: 'Did you find yourself asking questions — of yourself or others — to understand what was really going on?',
  },
  {
    key: 'caring',
    label: 'Caring',
    color: '#3b82f6',
    colorFaint: 'rgba(59,130,246,0.08)',
    colorBg: 'rgba(59,130,246,0.1)',
    icon: '/assets/Caring_sq.png',
    question: 'Did concern for someone or something beyond the immediate task influence how you acted?',
  },
  {
    key: 'creativity',
    label: 'Creativity',
    color: '#f59e0b',
    colorFaint: 'rgba(245,158,11,0.08)',
    colorBg: 'rgba(245,158,11,0.1)',
    icon: '/assets/Creativity_sq.png',
    question: 'Did you try something different from your usual approach, or combine ideas in a new way?',
  },
  {
    key: 'courage',
    label: 'Courage',
    color: '#ef4444',
    colorFaint: 'rgba(239,68,68,0.08)',
    colorBg: 'rgba(239,68,68,0.1)',
    icon: '/assets/courage_sq.png',
    question: 'Did you do something that felt risky or uncomfortable because it seemed like the right thing to do?',
  },
];

const EXERCISE_LABELS: Record<ExerciseKey, string> = {
  autoflow: 'Autoflow',
  visualization: 'Visualization',
  intention: 'Intention',
  inspiration: 'Inspiration',
  mystery: 'Mystery',
};

interface IA37StepData {
  scenario_notes: string;
  selectedExercise: string | null;
  capability_noticed: Record<string, NoticeValue>;
  capability_notes: Record<string, string>;
  // Legacy — keep so old data doesn't break
  capability_ratings?: Record<string, number | 'unsure'>;
  ai_summaries?: Record<string, string>;
  ai_questions?: Record<string, string>;
}

const INITIAL_DATA: IA37StepData = {
  scenario_notes: '',
  selectedExercise: null,
  capability_noticed: {},
  capability_notes: {},
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

// Generic summaries used as fallback
const GENERIC_SUMMARIES: Record<ExerciseKey, (data: ModuleJourneyData) => string> = {
  autoflow: (d) => `You noticed your mind's automatic stream · ${d.autoflow?.momentCount ?? 0} moment${d.autoflow?.momentCount !== 1 ? 's' : ''} captured`,
  visualization: (d) => `You found an image for a side of yourself waiting to be used${d.visualization?.imageTitle ? ` — "${d.visualization.imageTitle}"` : ''}`,
  intention: () => 'You named what pulls your attention and where you\'re positioned to act',
  inspiration: (d) => `You sat with what makes you feel most alive · ${d.inspiration?.interludeCount ?? 0} interlude${d.inspiration?.interludeCount !== 1 ? 's' : ''} completed`,
  mystery: (d) => `You leapt into ${d.mystery?.mysteryName ?? 'the unknown'}`,
};

// ── Component ─────────────────────────────────────────────────────────────────

const IA_3_7_ModuleReflection: React.FC<IA37ContentProps> = ({ onNext }) => {
  const { data, updateData, saving, loaded } = useWorkshopStepData<IA37StepData>(
    'ia',
    'ia-3-7',
    INITIAL_DATA,
    { debounceMs: 1500, enableAutoSave: true }
  );

  const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>({});
  const capabilitiesRef = useRef<HTMLDivElement>(null);

  // Module 3 journey data (read-only)
  const [moduleData, setModuleData] = useState<ModuleJourneyData>({
    autoflow: null, visualization: null, intention: null,
    inspiration: null, mystery: null, rawData: {}, loading: true,
  });

  // AI state
  const [aiSummaries, setAiSummaries] = useState<Record<string, string> | null>(null);
  const [aiQuestions, setAiQuestions] = useState<Record<string, string> | null>(null);
  const [summariesLoading, setSummariesLoading] = useState(false);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const tailorCacheRef = useRef<Record<string, Record<string, string>>>({});

  // Reset selection and AI-generated content on mount so user always starts fresh
  // TODO: Remove this once training docs are stable — let saved state persist
  useEffect(() => {
    if (loaded && data.selectedExercise) {
      updateData({ selectedExercise: null, ai_summaries: undefined, ai_questions: undefined, capability_noticed: {} });
    }
  }, [loaded]); // eslint-disable-line react-hooks/exhaustive-deps

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

  // Fetch AI summaries once module data and step data are loaded
  useEffect(() => {
    if (moduleData.loading || !loaded) return;

    const hasAnyData = moduleData.autoflow || moduleData.visualization ||
      moduleData.intention || moduleData.inspiration || moduleData.mystery;
    if (!hasAnyData) return;

    // Always fetch fresh summaries
    // TODO: Re-enable caching once training docs are stable

    setSummariesLoading(true);
    fetch('/api/ai/module-reflection', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'summarize' }),
    })
      .then(r => r.json())
      .then(result => {
        if (result.success && result.summaries) {
          setAiSummaries(result.summaries);
          updateData({ ai_summaries: result.summaries });
        }
      })
      .catch(err => {
        console.error('Failed to fetch AI summaries:', err);
      })
      .finally(() => setSummariesLoading(false));
  }, [moduleData.loading, loaded]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-expand notes that already have content
  useEffect(() => {
    if (loaded && data.capability_notes) {
      const hasContent: Record<string, boolean> = {};
      for (const cap of CAPABILITIES) {
        if (data.capability_notes[cap.key]?.trim()) {
          hasContent[cap.key] = true;
        }
      }
      if (Object.keys(hasContent).length > 0) {
        setExpandedNotes(prev => ({ ...prev, ...hasContent }));
      }
    }
  }, [loaded]);

  // Derived state
  const noticed = data.capability_noticed || {};
  const noticedCount = CAPABILITIES.filter(c => noticed[c.key] !== undefined).length;
  const allNoticed = noticedCount === 5;
  const presentCount = CAPABILITIES.filter(c => noticed[c.key] === 'yes').length;
  const hasSelection = data.selectedExercise !== null;

  const handleNotice = useCallback((capability: CapabilityKey, value: NoticeValue) => {
    const current = noticed[capability];
    // Toggle off if tapping the same value
    if (current === value) {
      const newNoticed = { ...noticed };
      delete newNoticed[capability];
      updateData({ capability_noticed: newNoticed });
    } else {
      updateData({
        capability_noticed: { ...noticed, [capability]: value },
      });
    }
  }, [noticed, updateData]);

  const handleNote = useCallback((capability: CapabilityKey, value: string) => {
    updateData({
      capability_notes: { ...data.capability_notes, [capability]: value },
    });
  }, [data.capability_notes, updateData]);

  const toggleNote = useCallback((capability: CapabilityKey) => {
    setExpandedNotes(prev => ({ ...prev, [capability]: !prev[capability] }));
  }, []);

  // Handle exercise selection — triggers tailor call
  const handleSelectExercise = useCallback((exercise: ExerciseKey) => {
    // Clear previous notices when changing exercise
    updateData({ selectedExercise: exercise, capability_noticed: {} });

    const exerciseContent = moduleData.rawData[exercise];
    if (!exerciseContent) return;

    setQuestionsLoading(true);
    fetch('/api/ai/module-reflection', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'tailor', selectedExercise: exercise, exerciseContent }),
    })
      .then(r => r.json())
      .then(result => {
        if (result.success && result.questions) {
          tailorCacheRef.current[exercise] = result.questions;
          setAiQuestions(result.questions);
          updateData({ ai_questions: result.questions });
        }
      })
      .catch(err => {
        console.error('Failed to fetch tailored questions:', err);
      })
      .finally(() => setQuestionsLoading(false));
  }, [moduleData.rawData, updateData]);

  // Check if any journey steps have data
  const hasAnyJourneyData = !moduleData.loading && (
    moduleData.autoflow || moduleData.visualization || moduleData.intention ||
    moduleData.inspiration || moduleData.mystery
  );

  // Get the display summary for an exercise
  const getSummary = (exercise: ExerciseKey): string => {
    if (aiSummaries && aiSummaries[exercise]) return aiSummaries[exercise];
    return GENERIC_SUMMARIES[exercise](moduleData);
  };

  // Which exercises have data (and are therefore selectable)
  const exerciseHasData: Record<ExerciseKey, boolean> = {
    autoflow: !!moduleData.autoflow,
    visualization: !!moduleData.visualization,
    intention: !!moduleData.intention,
    inspiration: !!moduleData.inspiration,
    mystery: !!moduleData.mystery,
  };

  // Get the question for a capability — tailored if available, else generic
  const getQuestion = (capKey: CapabilityKey): string => {
    if (aiQuestions && aiQuestions[capKey]) return aiQuestions[capKey];
    return CAPABILITIES.find(c => c.key === capKey)!.question;
  };

  const EXERCISE_ORDER: ExerciseKey[] = ['autoflow', 'visualization', 'intention', 'inspiration', 'mystery'];

  // Button style helper
  const noticeButtonStyle = (
    cap: typeof CAPABILITIES[0],
    value: NoticeValue,
    currentValue: NoticeValue | undefined
  ): React.CSSProperties => {
    const isActive = currentValue === value;
    if (value === 'yes') {
      return {
        border: `2px solid ${isActive ? cap.color : '#e5e7eb'}`,
        backgroundColor: isActive ? cap.color : '#ffffff',
        color: isActive ? 'white' : '#6b7280',
      };
    }
    if (value === 'not_really') {
      return {
        border: `2px solid ${isActive ? '#9ca3af' : '#e5e7eb'}`,
        backgroundColor: isActive ? '#f3f4f6' : '#ffffff',
        color: isActive ? '#4b5563' : '#9ca3af',
      };
    }
    // unsure
    return {
      border: `2px solid ${isActive ? '#d1d5db' : '#e5e7eb'}`,
      backgroundColor: isActive ? '#f9fafb' : '#ffffff',
      color: isActive ? '#6b7280' : '#d1d5db',
    };
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <ScrollIndicator idleTime={3000} position="nav-adjacent" colorScheme="purple" />

      {/* ── Section 1: Module 3 Journey Timeline ── */}
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

      {/* Journey Timeline Rows */}
      {moduleData.loading || summariesLoading ? (
        <div className="text-sm text-gray-400 italic mb-8 pl-2">
          {summariesLoading ? 'Reflecting on your journey...' : 'Loading your journey...'}
        </div>
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

              const vizImage = exercise === 'visualization'
                ? (moduleData.rawData.visualization?.selectedImage || moduleData.rawData.visualization?.uploadedImage || null)
                : null;

              return (
                <button
                  key={exercise}
                  type="button"
                  onClick={() => handleSelectExercise(exercise)}
                  className={`w-full text-left flex items-start gap-3 pl-4 pr-4 py-3 rounded-xl transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? 'bg-purple-50 border-2 border-purple-400 shadow-sm'
                      : 'bg-white border border-gray-200 hover:bg-purple-50/50 hover:border-purple-200'
                  }`}
                >
                  <span className={`mt-0.5 flex-shrink-0 ${isSelected ? 'text-purple-600' : 'text-green-500'}`}>
                    {isSelected ? '◉' : '✓'}
                  </span>
                  {vizImage && (
                    <img
                      src={vizImage}
                      alt="Your visualization"
                      className="w-12 h-12 rounded-lg object-cover flex-shrink-0 mt-0.5"
                    />
                  )}
                  <div className="min-w-0">
                    <p className={`text-sm font-medium ${isSelected ? 'text-purple-800' : 'text-gray-800'}`}>
                      {EXERCISE_LABELS[exercise]}
                    </p>
                    <p className={`text-sm ${isSelected ? 'text-purple-600' : 'text-gray-500'}`}>
                      {getSummary(exercise)}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Incomplete exercises (not clickable) */}
          {EXERCISE_ORDER.some(ex => !exerciseHasData[ex]) && (
            <div className="space-y-2 mb-8 opacity-50">
              {EXERCISE_ORDER.filter(ex => !exerciseHasData[ex]).map(exercise => (
                <div key={exercise} className="flex items-start gap-3 pl-4 pr-4 py-2">
                  <span className="text-gray-300 mt-0.5 flex-shrink-0">○</span>
                  <div>
                    <p className="text-sm font-medium text-gray-400">{EXERCISE_LABELS[exercise]}</p>
                    <p className="text-sm text-gray-300">Not yet completed</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Optional elaboration textarea */}
          {hasSelection && (
            <div className="mb-8 animate-in fade-in duration-300">
              <p className="text-xs text-gray-400 mb-2 pl-1">
                Want to add anything about why this moment stands out? (optional)
              </p>
              <Textarea
                value={data.scenario_notes}
                onChange={(e) => updateData({ scenario_notes: e.target.value })}
                placeholder="A few words about why this one..."
                className="min-h-[72px]"
              />
            </div>
          )}
        </>
      ) : (
        <p className="text-sm text-gray-400 italic mb-8 pl-2">Complete the exercises above to see your journey here.</p>
      )}

      {/* ── Section 2: Capability Noticing ── */}
      {hasSelection && (
        <div ref={capabilitiesRef} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Intro */}
          <div className="text-center mb-7 px-2">
            <h3 className="text-xl font-bold mb-2 text-gray-900">
              What showed up in that moment?
            </h3>
            <p className="text-sm leading-relaxed text-gray-500">
              Read each prompt. Just notice — was this present in the moment you selected?
            </p>
          </div>

          {/* Questions loading state */}
          {questionsLoading && (
            <div className="text-sm text-purple-500 italic text-center mb-6 animate-pulse">
              Tailoring prompts to your moment...
            </div>
          )}

          {/* Progress indicator */}
          <div className="flex gap-1.5 mb-8 px-1">
            {CAPABILITIES.map(cap => {
              const value = noticed[cap.key];
              return (
                <div
                  key={cap.key}
                  className="flex-1 h-1 rounded-sm transition-colors duration-300"
                  style={{
                    backgroundColor: value === 'yes'
                      ? cap.color
                      : value !== undefined
                        ? '#d1d5db'
                        : '#e5e7eb',
                  }}
                />
              );
            })}
          </div>

          {/* Capability Cards */}
          <div className="space-y-4">
            {CAPABILITIES.map(cap => {
              const value = noticed[cap.key];
              const isPresent = value === 'yes';
              const isEngaged = value !== undefined;
              const noteExpanded = expandedNotes[cap.key] || false;
              const noteValue = data.capability_notes?.[cap.key] || '';

              return (
                <Card
                  key={cap.key}
                  className="overflow-hidden transition-all duration-200"
                  style={{
                    borderColor: isPresent ? cap.color : undefined,
                    boxShadow: isPresent ? `0 0 0 1px ${cap.colorFaint}` : undefined,
                  }}
                >
                  {/* Colored top border */}
                  <div className="h-1" style={{ backgroundColor: cap.color }} />

                  <CardContent className="p-5 md:p-6">
                    {/* Capability top: icon + name */}
                    <div className="flex items-center gap-3 mb-3.5">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 p-1.5"
                        style={{ backgroundColor: cap.colorBg }}
                      >
                        <img
                          src={cap.icon}
                          alt={cap.label}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <span
                        className="text-xs font-semibold tracking-wide uppercase"
                        style={{ color: cap.color }}
                      >
                        {cap.label}
                      </span>
                    </div>

                    {/* Question / prompt */}
                    <p className="text-[15px] leading-relaxed text-gray-900 mb-4">
                      {getQuestion(cap.key)}
                    </p>

                    {/* Three-choice buttons */}
                    <div className="flex gap-2">
                      {([
                        { value: 'yes' as NoticeValue, label: 'Yes' },
                        { value: 'not_really' as NoticeValue, label: 'Not really' },
                        { value: 'unsure' as NoticeValue, label: "I don't know" },
                      ]).map(({ value: btnValue, label }) => (
                        <button
                          key={btnValue}
                          type="button"
                          onClick={() => handleNotice(cap.key, btnValue)}
                          className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer"
                          style={noticeButtonStyle(cap, btnValue, value)}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </CardContent>

                  {/* Note toggle + area — only show after engaged */}
                  {isEngaged && (
                    <div className="px-5 md:px-6 pb-1.5">
                      <button
                        type="button"
                        onClick={() => toggleNote(cap.key)}
                        className="text-xs text-gray-400 hover:text-purple-500 transition-colors duration-150 cursor-pointer py-1"
                      >
                        {noteExpanded ? '− Hide notes' : 'What makes you say that?'}
                      </button>
                    </div>
                  )}

                  {noteExpanded && (
                    <div className="px-5 md:px-6 pb-4.5 animate-in fade-in slide-in-from-top-2 duration-250">
                      <Textarea
                        value={noteValue}
                        onChange={(e) => handleNote(cap.key, e.target.value)}
                        placeholder="Optional — a few words..."
                        className="min-h-[52px] text-sm resize-none"
                      />
                    </div>
                  )}
                </Card>
              );
            })}
          </div>

          {/* ── Section 3: Closing ── */}
          {allNoticed && (
            <Card className="text-center border-purple-200 mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <CardContent className="py-8">
                <h3 className="text-xl font-bold text-purple-800 mb-3">Reflection Complete</h3>
                <p className="text-gray-600 mb-3 max-w-md mx-auto">
                  {presentCount === 5
                    ? 'All five capabilities showed up in that moment.'
                    : presentCount === 0
                      ? "None of the five felt clearly present — and that's useful to notice too."
                      : `You noticed ${presentCount} capabilit${presentCount === 1 ? 'y' : 'ies'} in that moment.`
                  }
                </p>
                <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">
                  Next, you'll work with an AI thinking partner — and see what a different kind of reflection surfaces.
                </p>
                <Button
                  onClick={() => onNext?.('ia-4-1')}
                  disabled={saving}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3"
                >
                  {saving ? 'Saving...' : 'Continue to Module 4 →'}
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
