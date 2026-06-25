import React, { useState, useCallback } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import type { SurveyConfig, SurveySection, Question } from './surveyConfig';

// ─── Props ────────────────────────────────────────────────────────────────────

interface WorkshopSurveyModalProps {
  open: boolean;
  config: SurveyConfig;
  onSubmitted: () => void;
  onDismissed: () => void;
}

// ─── Theme tokens ─────────────────────────────────────────────────────────────

const THEME = {
  purple: {
    headerBg: 'bg-gradient-to-br from-purple-50 to-indigo-50',
    headerText: 'text-purple-700',
    headerBorder: 'border-purple-100',
    sectionLabel: 'text-purple-700',
    divider: 'bg-purple-100',
    selectedScale: 'bg-purple-600 border-purple-600 text-white shadow-sm',
    hoverScale: 'hover:border-purple-300',
    submitBtn: 'bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300',
    progressText: 'text-purple-600',
  },
  blue: {
    headerBg: 'bg-gradient-to-br from-blue-50 to-indigo-50',
    headerText: 'text-blue-700',
    headerBorder: 'border-blue-100',
    sectionLabel: 'text-blue-700',
    divider: 'bg-blue-100',
    selectedScale: 'bg-blue-600 border-blue-600 text-white shadow-sm',
    hoverScale: 'hover:border-blue-300',
    submitBtn: 'bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300',
    progressText: 'text-blue-600',
  },
} as const;

// ─── Section label char ───────────────────────────────────────────────────────

const SECTION_LABELS: Record<string, string> = { a: 'A', b: 'B', c: 'C', d: 'D' };

// ─── Sub-components ───────────────────────────────────────────────────────────

const ScaleButtons: React.FC<{
  count: number;
  value: number | null;
  onChange: (n: number) => void;
  leftAnchor?: string;
  rightAnchor?: string;
  selectedClass: string;
  hoverClass: string;
}> = ({ count, value, onChange, leftAnchor, rightAnchor, selectedClass, hoverClass }) => {
  const buttons = Array.from({ length: count }, (_, i) => i + (count === 11 ? 0 : 1));
  return (
    <div>
      <div className={`flex items-center gap-1 ${count === 11 ? 'flex-wrap sm:flex-nowrap' : ''}`}>
        {buttons.map(n => {
          const selected = value === n;
          return (
            <button
              key={n}
              type="button"
              onClick={() => onChange(n)}
              className={`flex-1 h-10 rounded-lg border-2 text-sm font-semibold transition-all duration-150 min-w-0 ${
                selected
                  ? selectedClass
                  : `bg-white border-gray-200 text-gray-700 ${hoverClass}`
              }`}
            >
              {n}
            </button>
          );
        })}
      </div>
      {(leftAnchor || rightAnchor) && (
        <div className="flex justify-between mt-1.5 text-xs text-gray-500">
          <span>{leftAnchor}</span>
          <span>{rightAnchor}</span>
        </div>
      )}
    </div>
  );
};

// ─── Question renderer ────────────────────────────────────────────────────────

const QuestionItem: React.FC<{
  q: Question;
  value: number | string | undefined;
  onChange: (id: string, val: number | string) => void;
  tokens: typeof THEME.purple;
}> = ({ q, value, onChange, tokens }) => (
  <div className="space-y-2">
    <p className="text-[15px] text-gray-800 font-medium leading-snug">{q.label}</p>
    {q.type === 'scale-1-5' && (
      <ScaleButtons
        count={5}
        value={typeof value === 'number' ? value : null}
        onChange={n => onChange(q.id, n)}
        leftAnchor={q.leftAnchor}
        rightAnchor={q.rightAnchor}
        selectedClass={tokens.selectedScale}
        hoverClass={tokens.hoverScale}
      />
    )}
    {q.type === 'nps-0-10' && (
      <ScaleButtons
        count={11}
        value={typeof value === 'number' ? value : null}
        onChange={n => onChange(q.id, n)}
        leftAnchor={q.leftAnchor}
        rightAnchor={q.rightAnchor}
        selectedClass={tokens.selectedScale}
        hoverClass={tokens.hoverScale}
      />
    )}
    {q.type === 'textarea' && (
      <textarea
        rows={3}
        value={typeof value === 'string' ? value : ''}
        onChange={e => onChange(q.id, e.target.value)}
        placeholder={q.placeholder}
        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:border-transparent resize-none"
        style={{ focusRingColor: 'var(--survey-ring)' } as React.CSSProperties}
      />
    )}
  </div>
);

// ─── Section renderer ─────────────────────────────────────────────────────────

const SectionView: React.FC<{
  section: SurveySection;
  responses: Record<string, number | string>;
  onChange: (id: string, val: number | string) => void;
  tokens: typeof THEME.purple;
}> = ({ section, responses, onChange, tokens }) => (
  <div className="space-y-6">
    {section.subtitle && (
      <p className="text-xs text-gray-500">{section.subtitle}</p>
    )}
    {section.questions.map(q => (
      <QuestionItem
        key={q.id}
        q={q}
        value={responses[q.id]}
        onChange={onChange}
        tokens={tokens}
      />
    ))}
  </div>
);

// ─── Main modal ───────────────────────────────────────────────────────────────

const WorkshopSurveyModal: React.FC<WorkshopSurveyModalProps> = ({
  open,
  config,
  onSubmitted,
  onDismissed,
}) => {
  const [sectionIdx, setSectionIdx] = useState(0);
  const [responses, setResponses] = useState<Record<string, number | string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const tokens = THEME[config.theme];
  const sections = config.sections;
  const currentSection = sections[sectionIdx];
  const isLastSection = sectionIdx === sections.length - 1;
  const sectionLabel = SECTION_LABELS[currentSection.id] ?? String(sectionIdx + 1);

  const handleChange = useCallback((id: string, val: number | string) => {
    setResponses(prev => {
      // Remove entry if value is empty string (unanswered textarea)
      if (val === '') {
        const next = { ...prev };
        delete next[id];
        return next;
      }
      return { ...prev, [id]: val };
    });
  }, []);

  const handleNext = () => {
    if (!isLastSection) setSectionIdx(i => i + 1);
  };

  const handleBack = () => {
    if (sectionIdx > 0) setSectionIdx(i => i - 1);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch('/api/surveys/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ workshopSlug: config.workshopSlug, responses }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Submit failed');
      // Reset for potential future use
      setSectionIdx(0);
      setResponses({});
      onSubmitted();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Submit failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDismiss = () => {
    setSectionIdx(0);
    setResponses({});
    setSubmitError(null);
    onDismissed();
  };

  return (
    <Dialog open={open}>
      <DialogContent
        className="max-w-2xl w-[calc(100vw-2rem)] max-h-[92vh] p-0 gap-0 flex flex-col bg-white"
        onPointerDownOutside={e => e.preventDefault()}
        onEscapeKeyDown={e => e.preventDefault()}
        hideClose
      >
        {/* Header */}
        <div className={`px-6 sm:px-8 pt-6 pb-4 border-b ${tokens.headerBorder} ${tokens.headerBg}`}>
          <div className={`text-xs font-semibold uppercase tracking-wider mb-1 ${tokens.progressText}`}>
            Section {sectionLabel} · {sectionIdx + 1} of {sections.length}
          </div>
          <h2 className={`text-xl font-bold ${tokens.headerText}`}>{currentSection.title}</h2>
          {sectionIdx === 0 && (
            <p className="text-sm text-gray-600 mt-1">{config.subheading}</p>
          )}
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-6">
          <SectionView
            section={currentSection}
            responses={responses}
            onChange={handleChange}
            tokens={tokens}
          />
        </div>

        {/* Footer */}
        <div className="px-6 sm:px-8 py-4 border-t border-gray-100 bg-white flex items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleDismiss}
              className="text-sm text-gray-400 hover:text-gray-600 underline underline-offset-2"
            >
              Do this later
            </button>
            {sectionIdx > 0 && (
              <button
                type="button"
                onClick={handleBack}
                className="text-sm text-gray-600 hover:text-gray-800 font-medium"
              >
                ← Back
              </button>
            )}
          </div>
          <div className="flex flex-col items-end gap-1">
            {submitError && (
              <span className="text-xs text-red-600">{submitError}</span>
            )}
            {isLastSection ? (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className={`${tokens.submitBtn} disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-lg font-medium text-sm transition-colors`}
              >
                {submitting ? 'Submitting…' : 'Submit survey'}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNext}
                className={`${tokens.submitBtn} text-white px-6 py-2.5 rounded-lg font-medium text-sm transition-colors`}
              >
                Next →
              </button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WorkshopSurveyModal;
