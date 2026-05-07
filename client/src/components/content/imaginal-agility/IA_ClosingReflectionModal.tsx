import React, { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import ImaginalAgilityRadarChart from './ImaginalAgilityRadarChart';

// ─── Types ───────────────────────────────────────────────────────────────────

type CapabilityKey = 'imagination' | 'curiosity' | 'courage' | 'creativity' | 'caring';

interface SurveyState {
  prismNotice: string;
  definition: string;
  capabilityMost: CapabilityKey | '';
  capabilitySurprise: CapabilityKey | '';
  shiftBefore: string;
  shiftAfter: string;
  likelyToUse: number;
  recommend: number;
  changeNextTime: string;
}

interface IA_ClosingReflectionModalProps {
  open: boolean;
  onSubmitted: () => void;
}

// ─── Capability button config ────────────────────────────────────────────────

const CAPABILITIES: {
  key: CapabilityKey;
  label: string;
  icon: string;
  selectedClass: string;
  hoverClass: string;
}[] = [
  {
    key: 'imagination',
    label: 'Imagination',
    icon: '/assets/Imagination_new.png',
    selectedClass: 'bg-purple-50 border-purple-500 ring-2 ring-purple-300',
    hoverClass: 'hover:border-purple-300',
  },
  {
    key: 'curiosity',
    label: 'Curiosity',
    icon: '/assets/Curiosity_new.png',
    selectedClass: 'bg-green-50 border-green-500 ring-2 ring-green-300',
    hoverClass: 'hover:border-green-300',
  },
  {
    key: 'courage',
    label: 'Courage',
    icon: '/assets/Courage_new.png',
    selectedClass: 'bg-red-50 border-red-500 ring-2 ring-red-300',
    hoverClass: 'hover:border-red-300',
  },
  {
    key: 'creativity',
    label: 'Creativity',
    icon: '/assets/Creativity_new.png',
    selectedClass: 'bg-orange-50 border-orange-500 ring-2 ring-orange-300',
    hoverClass: 'hover:border-orange-300',
  },
  {
    key: 'caring',
    label: 'Caring',
    icon: '/assets/Caring_new.png',
    selectedClass: 'bg-blue-50 border-blue-500 ring-2 ring-blue-300',
    hoverClass: 'hover:border-blue-300',
  },
];

const INITIAL_STATE: SurveyState = {
  prismNotice: '',
  definition: '',
  capabilityMost: '',
  capabilitySurprise: '',
  shiftBefore: '',
  shiftAfter: '',
  likelyToUse: 0,
  recommend: 0,
  changeNextTime: '',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function parsePrismResults(assessmentData: any): {
  imagination: number;
  curiosity: number;
  empathy: number;
  creativity: number;
  courage: number;
} | null {
  const raw = assessmentData?.data?.results;
  if (!raw) return null;
  let parsed: any = raw;
  if (typeof raw === 'string') {
    try { parsed = JSON.parse(raw); } catch { return null; }
  }
  if (parsed && typeof parsed === 'object' && parsed.imagination !== undefined) {
    return {
      imagination: Number(parsed.imagination) || 0,
      curiosity: Number(parsed.curiosity) || 0,
      empathy: Number(parsed.empathy) || 0,
      creativity: Number(parsed.creativity) || 0,
      courage: Number(parsed.courage) || 0,
    };
  }
  return null;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

const SectionLabel: React.FC<{ children: React.ReactNode; optional?: boolean }> = ({ children, optional }) => (
  <div className="flex items-center gap-2 mb-3">
    <h3 className="text-xs font-semibold text-purple-700 uppercase tracking-wider">{children}</h3>
    {optional && (
      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-500 uppercase tracking-wide">
        Optional
      </span>
    )}
    <div className="flex-1 h-px bg-purple-100" />
  </div>
);

const QuestionLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text-[15px] text-gray-800 font-medium mb-2 leading-snug">{children}</p>
);

const CapabilityGrid: React.FC<{
  value: CapabilityKey | '';
  onChange: (key: CapabilityKey) => void;
}> = ({ value, onChange }) => (
  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
    {CAPABILITIES.map(cap => {
      const selected = value === cap.key;
      return (
        <button
          key={cap.key}
          type="button"
          onClick={() => onChange(cap.key)}
          className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all duration-150 ${
            selected
              ? cap.selectedClass
              : `bg-white border-gray-200 ${cap.hoverClass}`
          }`}
        >
          <img src={cap.icon} alt="" className="w-10 h-10 object-contain" />
          <span className={`text-sm font-medium ${selected ? 'text-gray-900' : 'text-gray-700'}`}>
            {cap.label}
          </span>
        </button>
      );
    })}
  </div>
);

const LikertScale: React.FC<{
  value: number;
  onChange: (n: number) => void;
  leftAnchor: string;
  rightAnchor: string;
}> = ({ value, onChange, leftAnchor, rightAnchor }) => (
  <div>
    <div className="flex items-center justify-between gap-2">
      {[1, 2, 3, 4, 5].map(n => {
        const selected = value === n;
        return (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`flex-1 h-12 rounded-lg border-2 text-sm font-semibold transition-all duration-150 ${
              selected
                ? 'bg-purple-600 border-purple-600 text-white shadow-sm'
                : 'bg-white border-gray-200 text-gray-700 hover:border-purple-300'
            }`}
          >
            {n}
          </button>
        );
      })}
    </div>
    <div className="flex justify-between mt-2 text-xs text-gray-500">
      <span>{leftAnchor}</span>
      <span>{rightAnchor}</span>
    </div>
  </div>
);

// ─── Main component ──────────────────────────────────────────────────────────

const IA_ClosingReflectionModal: React.FC<IA_ClosingReflectionModalProps> = ({
  open,
  onSubmitted,
}) => {
  const [phase, setPhase] = useState<'survey' | 'transition'>('survey');
  const [state, setState] = useState<SurveyState>(INITIAL_STATE);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Reset when reopened
  useEffect(() => {
    if (open) {
      setPhase('survey');
      setState(INITIAL_STATE);
      setSubmitError(null);
    }
  }, [open]);

  // Fetch assessment for prism
  const { data: assessmentData } = useQuery({
    queryKey: ['/api/workshop-data/ia-assessment'],
    queryFn: async () => {
      const response = await fetch('/api/workshop-data/ia-assessment', {
        credentials: 'include',
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    },
    enabled: open,
    retry: false,
    staleTime: 60_000,
  });

  const prismData = useMemo(() => parsePrismResults(assessmentData), [assessmentData]);

  // Required validation: Q1-Q7 (Q8 optional)
  const isValid =
    state.prismNotice.trim().length > 0 &&
    state.definition.trim().length > 0 &&
    state.capabilityMost !== '' &&
    state.capabilitySurprise !== '' &&
    state.shiftBefore.trim().length > 0 &&
    state.shiftAfter.trim().length > 0 &&
    state.likelyToUse >= 1 &&
    state.recommend >= 1;

  const update = <K extends keyof SurveyState>(key: K, value: SurveyState[K]) =>
    setState(prev => ({ ...prev, [key]: value }));

  const handleSubmit = async () => {
    if (!isValid || submitting) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const payload = {
        prismNotice: state.prismNotice.trim(),
        definition: state.definition.trim(),
        capabilityMost: state.capabilityMost,
        capabilitySurprise: state.capabilitySurprise,
        shiftBefore: state.shiftBefore.trim(),
        shiftAfter: state.shiftAfter.trim(),
        likelyToUse: state.likelyToUse,
        recommend: state.recommend,
        changeNextTime: state.changeNextTime.trim() || null,
      };
      const response = await fetch('/api/workshop-data/step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          workshopType: 'ia',
          stepId: 'ia-survey',
          data: payload,
        }),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || `Save failed (${response.status})`);
      }
      const result = await response.json();
      if (!result.success) throw new Error(result.error || 'Save failed');
      setPhase('transition');
    } catch (err) {
      console.error('[IA closing reflection] Save failed:', err);
      setSubmitError(err instanceof Error ? err.message : 'Save failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent
        hideClose
        onPointerDownOutside={e => e.preventDefault()}
        onEscapeKeyDown={e => e.preventDefault()}
        className="max-w-3xl w-[calc(100vw-2rem)] max-h-[92vh] p-0 gap-0 flex flex-col bg-white"
      >
        {phase === 'survey' && (
          <>
            {/* Header */}
            <div className="px-6 sm:px-8 pt-6 pb-4 border-b border-purple-100 bg-gradient-to-br from-purple-50 to-indigo-50">
              <h2 className="text-2xl font-bold text-purple-700">Closing reflection</h2>
              <p className="text-sm text-gray-600 mt-1">
                A few questions to consolidate what you've practiced. Your answers are private.
              </p>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-6 space-y-8">
              {/* Section: Your capability prism */}
              <section>
                <SectionLabel>Your capability prism</SectionLabel>
                {prismData ? (
                  <ImaginalAgilityRadarChart data={prismData} />
                ) : (
                  <div className="w-full bg-purple-50/50 rounded-lg border border-purple-100 p-6 text-center text-sm text-gray-500">
                    Your assessment results will appear here.
                  </div>
                )}
                <div className="mt-4">
                  <QuestionLabel>Look at the shape of your prism. What do you notice?</QuestionLabel>
                  <textarea
                    rows={3}
                    value={state.prismNotice}
                    onChange={e => update('prismNotice', e.target.value)}
                    placeholder="When I look at my prism, I notice..."
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400 resize-none"
                  />
                </div>
              </section>

              {/* Section: In your own words */}
              <section>
                <SectionLabel>In your own words</SectionLabel>
                <QuestionLabel>
                  If a colleague asked "what's imaginal agility?" — what would you say in one sentence?
                </QuestionLabel>
                <textarea
                  rows={2}
                  value={state.definition}
                  onChange={e => update('definition', e.target.value)}
                  placeholder="In my own words..."
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400 resize-none"
                />
              </section>

              {/* Section: Your capabilities */}
              <section>
                <SectionLabel>Your capabilities</SectionLabel>
                <div className="space-y-5">
                  <div>
                    <QuestionLabel>Which capability did you lean on most during the microcourse?</QuestionLabel>
                    <CapabilityGrid
                      value={state.capabilityMost}
                      onChange={k => update('capabilityMost', k)}
                    />
                  </div>
                  <div>
                    <QuestionLabel>Which capability surprised you — one you didn't expect to use?</QuestionLabel>
                    <CapabilityGrid
                      value={state.capabilitySurprise}
                      onChange={k => update('capabilitySurprise', k)}
                    />
                  </div>
                </div>
              </section>

              {/* Section: What shifted */}
              <section>
                <SectionLabel>What shifted</SectionLabel>
                <QuestionLabel>
                  Complete this sentence about your understanding of human imagination and AI:
                </QuestionLabel>
                <div className="flex flex-col sm:flex-row sm:items-stretch gap-3">
                  <textarea
                    rows={3}
                    value={state.shiftBefore}
                    onChange={e => update('shiftBefore', e.target.value)}
                    placeholder="Before this, I thought..."
                    className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400 resize-none"
                  />
                  <div className="flex sm:flex-col items-center justify-center text-purple-400">
                    <svg className="w-6 h-6 sm:rotate-0 rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </div>
                  <textarea
                    rows={3}
                    value={state.shiftAfter}
                    onChange={e => update('shiftAfter', e.target.value)}
                    placeholder="Now I see that..."
                    className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400 resize-none"
                  />
                </div>
              </section>

              {/* Section: Your experience */}
              <section>
                <SectionLabel>Your experience</SectionLabel>
                <div className="space-y-6">
                  <div>
                    <QuestionLabel>How likely are you to use what you learned here?</QuestionLabel>
                    <LikertScale
                      value={state.likelyToUse}
                      onChange={n => update('likelyToUse', n)}
                      leftAnchor="Unlikely"
                      rightAnchor="Already planning to"
                    />
                  </div>
                  <div>
                    <QuestionLabel>Would you recommend this to a colleague?</QuestionLabel>
                    <LikertScale
                      value={state.recommend}
                      onChange={n => update('recommend', n)}
                      leftAnchor="No"
                      rightAnchor="Definitely"
                    />
                  </div>
                </div>
              </section>

              {/* Section: Help us improve */}
              <section>
                <SectionLabel optional>Help us improve</SectionLabel>
                <QuestionLabel>One thing we should change next time:</QuestionLabel>
                <textarea
                  rows={2}
                  value={state.changeNextTime}
                  onChange={e => update('changeNextTime', e.target.value)}
                  placeholder="What would have made this better..."
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400 resize-none"
                />
              </section>
            </div>

            {/* Sticky footer */}
            <div className="px-6 sm:px-8 py-4 border-t border-gray-100 bg-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <p className="text-xs text-gray-500">
                Your responses are private and help us improve the experience.
              </p>
              <div className="flex flex-col items-end gap-1">
                {submitError && (
                  <span className="text-xs text-red-600">{submitError}</span>
                )}
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!isValid || submitting}
                  className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-lg font-medium text-sm transition-colors"
                >
                  {submitting ? 'Submitting...' : 'Submit reflection'}
                </button>
              </div>
            </div>
          </>
        )}

        {phase === 'transition' && (
          <div className="px-6 sm:px-10 py-10 sm:py-14 text-center bg-gradient-to-br from-purple-50 via-white to-indigo-50">
            <h2 className="text-2xl sm:text-3xl font-bold text-purple-700 mb-4">
              You've completed the core journey.
            </h2>
            <p className="text-base text-gray-700 leading-relaxed max-w-xl mx-auto mb-8">
              Module 5 is here for you to explore — review your prism, revisit exercises, and think about
              how these capabilities show up in your life going forward. Take what's useful.
            </p>
            <button
              type="button"
              onClick={onSubmitted}
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-base rounded-lg font-medium transition-colors"
            >
              Explore Module 5 →
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default IA_ClosingReflectionModal;
