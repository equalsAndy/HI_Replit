import * as React from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

type CapabilityKey = 'imagination' | 'curiosity' | 'caring' | 'creativity' | 'courage';

const CAPABILITIES: { key: CapabilityKey; label: string; color: string; question: string }[] = [
  {
    key: 'imagination',
    label: 'Imagination',
    color: '#8b5cf6',
    question: 'Did you see possibilities in the situation that weren\'t immediately obvious to others?'
  },
  {
    key: 'curiosity',
    label: 'Curiosity',
    color: '#10b981',  // green — matches icon
    question: 'Did you find yourself asking questions — of yourself or others — to understand what was really going on?'
  },
  {
    key: 'caring',
    label: 'Caring',
    color: '#3b82f6',  // blue — matches icon
    question: 'Did concern for someone or something beyond the immediate task influence how you acted?'
  },
  {
    key: 'creativity',
    label: 'Creativity',
    color: '#f59e0b',
    question: 'Did you try something different from your usual approach, or combine ideas in a new way?'
  },
  {
    key: 'courage',
    label: 'Courage',
    color: '#ef4444',
    question: 'Did you do something that felt risky or uncomfortable because it seemed like the right thing to do?'
  },
];

const RATING_ANCHORS: Record<number, string> = {
  1: 'Not really',
  2: 'Slightly',
  3: 'Somewhat',
  4: 'Quite a bit',
  5: 'Central',
};

export interface ScenarioReflectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scenarioNotes: string;
  existingRatings: Record<string, number>;
  existingConversation: Array<{ role: 'user' | 'assistant'; content: string }>;
  onComplete: (result: {
    ratings: Record<string, number>;
    conversation: Array<{ role: 'user' | 'assistant'; content: string }>;
    summary?: string;
  }) => void;
}

/**
 * Phase 4 placeholder — Scenario Reflection Modal
 *
 * This stub provides a basic rating interface so the ia-4-7 content view
 * is testable end-to-end. Phase 4 replaces this with the full split-screen
 * AI conversation modal per the spec.
 */
export function ScenarioReflectionModal({
  open,
  onOpenChange,
  scenarioNotes,
  existingRatings,
  onComplete,
}: ScenarioReflectionModalProps) {
  const [ratings, setRatings] = React.useState<Record<string, number>>({});

  // Initialize ratings from existing data when modal opens
  React.useEffect(() => {
    if (open) {
      setRatings(existingRatings || {});
    }
  }, [open, existingRatings]);

  const ratedCount = CAPABILITIES.filter(c => ratings[c.key] >= 1).length;
  const allRated = ratedCount === 5;

  const setRating = (capability: CapabilityKey, value: number) => {
    setRatings(prev => ({ ...prev, [capability]: value }));
  };

  const handleDone = () => {
    onComplete({
      ratings,
      conversation: [],
      summary: '',
    });
  };

  const handleClose = () => {
    if (ratedCount > 0 && !allRated) {
      if (!window.confirm('You have unfinished ratings. Close anyway?')) return;
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal>
      <DialogContent
        hideClose
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        style={{ top: '1rem', transform: 'translateX(-50%) translateY(0)' }}
        className="max-w-[900px] w-full grid grid-cols-[1fr_0.75fr] gap-0 p-0 h-[800px] rounded-lg shadow-lg overflow-hidden"
      >
        {/* Header */}
        <header className="absolute top-0 left-0 w-full bg-white border-b border-gray-200 flex items-center gap-4 px-4 py-3 z-10">
          <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-sm shrink-0">
            AI
          </div>
          <DialogTitle className="text-base font-semibold flex-grow">
            Scenario Reflection
          </DialogTitle>
          <span className="text-sm text-gray-500">
            {ratedCount} of 5 confirmed
          </span>
          <Button variant="secondary" size="sm" onClick={handleClose}>Close</Button>
        </header>

        {/* Left Panel: Scenario + AI Chat placeholder */}
        <div className="flex flex-col bg-gray-50 p-4 pt-16 min-h-0">
          {/* Scenario reference */}
          <label className="font-medium text-gray-700 mb-1 text-sm">Your Scenario</label>
          <div className="rounded-md bg-purple-50/60 border border-purple-100 px-3 py-2 text-sm text-gray-900 shadow-sm mb-4 max-h-24 overflow-y-auto">
            "{scenarioNotes}"
          </div>

          {/* Placeholder for AI conversation — Phase 4 */}
          <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6 max-w-sm">
              <p className="text-gray-500 text-sm mb-3">
                AI conversation will appear here in Phase 4.
              </p>
              <p className="text-gray-400 text-xs">
                For now, use the rating panel on the right to set your capability ratings manually.
              </p>
            </div>
          </div>
        </div>

        {/* Right Panel: Capability Rating Tracker */}
        <div className="flex flex-col bg-white p-4 pt-16 overflow-y-auto border-l border-gray-200">
          <h2 className="text-sm font-semibold uppercase text-gray-500 mb-4 tracking-wide">
            Capability Ratings
          </h2>

          <div className="space-y-3 flex-1">
            {CAPABILITIES.map(({ key, label, color, question }) => {
              const currentRating = ratings[key] || 0;
              const isRated = currentRating >= 1;
              return (
                <div
                  key={key}
                  className="rounded-lg border p-3 transition-all"
                  style={{
                    borderColor: isRated ? color : '#e5e7eb',
                    backgroundColor: isRated ? `${color}08` : 'transparent',
                  }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: isRated ? color : '#d1d5db' }}
                    />
                    <span className="text-sm font-semibold" style={{ color: isRated ? color : '#6b7280' }}>
                      {label}
                    </span>
                    {isRated && (
                      <span className="ml-auto text-lg font-bold" style={{ color }}>
                        {currentRating}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mb-2 leading-relaxed">{question}</p>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map(n => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setRating(key, n)}
                        className="w-8 h-8 rounded-full border-2 transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 text-xs font-medium"
                        style={{
                          backgroundColor: n <= currentRating ? color : 'transparent',
                          borderColor: n <= currentRating ? color : '#d1d5db',
                          color: n <= currentRating ? 'white' : '#9ca3af',
                        }}
                        aria-label={`Rate ${label} ${n} — ${RATING_ANCHORS[n]}`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                  {isRated && (
                    <p className="text-xs mt-1" style={{ color }}>{RATING_ANCHORS[currentRating]}</p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Done button */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <Button
              onClick={handleDone}
              disabled={!allRated}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            >
              {allRated ? 'Done' : `Rate ${5 - ratedCount} more to finish`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ScenarioReflectionModal;
