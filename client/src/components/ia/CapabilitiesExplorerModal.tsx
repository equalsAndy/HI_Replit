import * as React from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Lightbulb, Search, Heart, Sparkles, Shield } from 'lucide-react';
import { CapabilityType, CAPABILITY_LABELS, CAPABILITY_COLORS } from '@/lib/types';

export interface ExplorerRound {
  capabilities: CapabilityType[];
  ai_response: string;
  round_number: number;
}

export interface CapabilitiesExplorerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reframedChallenge: string;
  originalChallenge: string;
  onComplete: (result: { rounds: ExplorerRound[]; chosen: ExplorerRound }) => void;
}

const CAPABILITY_ICONS: Record<CapabilityType, React.ReactNode> = {
  imagination: <Lightbulb className="w-4 h-4" />,
  curiosity: <Search className="w-4 h-4" />,
  caring: <Heart className="w-4 h-4" />,
  creativity: <Sparkles className="w-4 h-4" />,
  courage: <Shield className="w-4 h-4" />,
};

const COLOR_CLASSES: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  purple: { bg: 'bg-purple-100', border: 'border-purple-400', text: 'text-purple-700', badge: 'bg-purple-100 text-purple-700' },
  green: { bg: 'bg-green-100', border: 'border-green-400', text: 'text-green-700', badge: 'bg-green-100 text-green-700' },
  blue: { bg: 'bg-blue-100', border: 'border-blue-400', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-700' },
  orange: { bg: 'bg-orange-100', border: 'border-orange-400', text: 'text-orange-700', badge: 'bg-orange-100 text-orange-700' },
  red: { bg: 'bg-red-100', border: 'border-red-400', text: 'text-red-700', badge: 'bg-red-100 text-red-700' },
};

const ALL_CAPABILITIES: CapabilityType[] = ['imagination', 'curiosity', 'caring', 'creativity', 'courage'];

export function CapabilitiesExplorerModal({
  open,
  onOpenChange,
  reframedChallenge,
  originalChallenge,
  onComplete,
}: CapabilitiesExplorerModalProps) {
  const [rounds, setRounds] = React.useState<ExplorerRound[]>([]);
  const [currentSelection, setCurrentSelection] = React.useState<CapabilityType[]>([]);
  const [chosenIndex, setChosenIndex] = React.useState<number | null>(null);
  const [loading, setLoading] = React.useState(false);
  const cardsRef = React.useRef<HTMLDivElement>(null);

  const currentRoundNumber = rounds.length + 1;

  // Round constraints: Round 1 = exactly 1, Round 2 = exactly 2, Round 3+ = any (1-5)
  const requiredCount = currentRoundNumber === 1 ? 1 : currentRoundNumber === 2 ? 2 : null;
  const isSelectionValid = requiredCount
    ? currentSelection.length === requiredCount
    : currentSelection.length >= 1;

  // Reset all state when modal opens/closes
  React.useEffect(() => {
    if (!open) {
      setRounds([]);
      setCurrentSelection([]);
      setChosenIndex(null);
      setLoading(false);
    }
  }, [open]);

  // Scroll to bottom when new cards appear
  React.useEffect(() => {
    if (cardsRef.current && rounds.length > 0) {
      setTimeout(() => {
        cardsRef.current?.scrollTo({ top: cardsRef.current.scrollHeight, behavior: 'smooth' });
      }, 100);
    }
  }, [rounds.length]);

  const toggleCapability = (cap: CapabilityType) => {
    setCurrentSelection((prev) => {
      if (prev.includes(cap)) {
        return prev.filter((c) => c !== cap);
      }
      // Enforce max count for rounds 1 and 2
      if (requiredCount && prev.length >= requiredCount) {
        // Replace the oldest selection
        return [...prev.slice(1), cap];
      }
      return [...prev, cap];
    });
  };

  const generateRound = async () => {
    if (!isSelectionValid || loading) return;
    setLoading(true);

    try {
      const capNames = currentSelection.map((c) => CAPABILITY_LABELS[c]).join(' + ');
      const systemPrompt = `You are a capability coach in the Imaginal Agility workshop.

The participant has reframed a challenge and is now exploring what different capabilities reveal as starting points.

THEIR ORIGINAL CHALLENGE: "${originalChallenge}"
THEIR REFRAMED PERSPECTIVE: "${reframedChallenge}"
CAPABILITIES TO APPLY: ${capNames}

CAPABILITY DEFINITIONS — each is a specific KIND OF MOVE, not a mood:
- Imagination: Change the timeframe, scope, or frame entirely. See what doesn't exist yet. "What if this isn't about X at all?"
- Curiosity: Ask the question nobody's asking. Go toward what you don't know. Investigate before concluding.
- Caring: Start from what matters to the people involved. What are they protecting? What do they need?
- Creativity: Find an unexpected path. Change the medium, the channel, the approach. Combine things that don't usually go together.
- Courage: Name what's being avoided. Go direct. Do the uncomfortable thing first.

RULES:
- Write 2-3 sentences maximum showing what this capability combination reveals as a STARTING POINT for their specific situation
- Use their actual nouns and details — reference their challenge specifically
- First person: "What if I..." or "I could..."
- This is about STARTING POINTS, not solutions or action plans
- Each capability should produce a distinctly different KIND of move — not just a different tone
- For combinations: the output should feel emergent, not like two single-capability answers stapled together. What does ${capNames} TOGETHER reveal that neither does alone?
- No preamble, no "Great choice!", no explanation of the capabilities — just the angle
- NEVER use flattering language about the participant ("your unique insight," "your exceptional ability")`;

      const res = await fetch('/api/ai/chat/plain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          training_id: 'ia-4-2',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Apply ${capNames} to my reframed challenge.` },
          ],
        }),
      });

      const data = await res.json();
      const aiResponse = data?.reply?.trim() || data?.content?.trim() || 'Something went wrong — try again.';

      const newRound: ExplorerRound = {
        capabilities: [...currentSelection],
        ai_response: aiResponse,
        round_number: currentRoundNumber,
      };

      setRounds((prev) => [...prev, newRound]);
      setCurrentSelection([]);
    } catch (err) {
      console.error('Capabilities explorer error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDone = () => {
    if (chosenIndex === null || rounds.length < 2) return;
    onComplete({ rounds, chosen: rounds[chosenIndex] });
    onOpenChange(false);
  };

  const canFinish = rounds.length >= 2 && chosenIndex !== null;

  // Selection hint text
  const getSelectionHint = () => {
    if (currentRoundNumber === 1) return 'Pick one capability to start.';
    if (currentRoundNumber === 2) return 'Now try a combination — pick two.';
    return 'Try any combination you want, or choose your favorite approach above.';
  };

  // Nudge message after a round completes
  const getNudge = (roundIndex: number) => {
    if (roundIndex === 0) return 'Now try a combination — pick two.';
    if (roundIndex === 1) return 'Try any combination, or choose your favorite approach.';
    return null;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal>
      <DialogContent
        hideClose
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        style={{ top: '1rem', transform: 'translateX(-50%) translateY(0)' }}
        className="max-w-[700px] w-full p-0 h-[750px] rounded-lg shadow-lg overflow-hidden flex flex-col"
      >
        {/* Header */}
        <header className="bg-white border-b border-gray-200 flex items-center gap-4 p-3 flex-shrink-0">
          <img src="/assets/adv_rung1_split.png" alt="Rung 1" className="h-8 flex-shrink-0" />
          <DialogTitle className="text-base font-semibold flex-grow">
            Capabilities Explorer
          </DialogTitle>
          <Button variant="secondary" size="sm" onClick={() => onOpenChange(false)}>Close</Button>
        </header>

        {/* Top: reframed challenge reference */}
        <div className="px-6 pt-4 pb-2 flex-shrink-0">
          <div className="rounded-md bg-purple-50/60 border border-purple-100 px-3 py-2 text-sm text-gray-700 mb-3">
            <span className="text-xs font-semibold text-purple-600 uppercase">Your reframed perspective: </span>
            {reframedChallenge}
          </div>
          <p className="text-sm text-gray-600 italic">
            This isn't about finding the solution. It's about seeing what different starting points your capabilities reveal.
          </p>
        </div>

        {/* Scrollable cards area */}
        <div ref={cardsRef} className="flex-1 overflow-y-auto px-6 py-3 space-y-3 min-h-0">
          {rounds.map((round, idx) => {
            const isChosen = chosenIndex === idx;
            return (
              <div key={idx}>
                <div
                  className={`p-4 rounded-lg border-2 transition-all ${
                    isChosen
                      ? 'border-purple-500 bg-purple-50 shadow-md'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-gray-400 font-medium">Round {round.round_number}</span>
                    <div className="flex gap-1.5">
                      {round.capabilities.map((cap) => {
                        const color = CAPABILITY_COLORS[cap];
                        const classes = COLOR_CLASSES[color] || COLOR_CLASSES.purple;
                        return (
                          <span
                            key={cap}
                            className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${classes.badge}`}
                          >
                            {CAPABILITY_ICONS[cap]}
                            {CAPABILITY_LABELS[cap]}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                  <p className="text-sm text-gray-800 mb-3">{round.ai_response}</p>
                  <Button
                    variant={isChosen ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setChosenIndex(idx)}
                    className={isChosen ? 'bg-purple-600 hover:bg-purple-700 text-white' : ''}
                  >
                    {isChosen ? 'Chosen' : 'Choose this one'}
                  </Button>
                </div>

                {/* Nudge message after round */}
                {idx < rounds.length - 1 ? null : getNudge(idx) && !loading ? (
                  <p className="text-sm text-purple-600 font-medium mt-2 ml-1">{getNudge(idx)}</p>
                ) : null}
              </div>
            );
          })}

          {/* Loading indicator */}
          {loading && (
            <div className="p-4 bg-purple-50 border border-purple-100 rounded-lg text-sm text-gray-600 animate-pulse">
              Exploring what {currentSelection.map((c) => CAPABILITY_LABELS[c]).join(' + ')} reveals...
            </div>
          )}
        </div>

        {/* Light touch line after Round 2 */}
        {rounds.length >= 2 && (
          <div className="px-6 py-2 flex-shrink-0">
            <p className="text-xs text-gray-500 italic text-center">
              Notice which starting points feel sharpest. AI can suggest angles, but only you know which one fits your situation.
            </p>
          </div>
        )}

        {/* Bottom: capability selection + actions */}
        <div className="border-t border-gray-200 px-6 py-4 flex-shrink-0 bg-gray-50">
          <p className="text-xs text-gray-500 mb-2">{getSelectionHint()}</p>

          {/* Capability buttons */}
          <div className="flex gap-2 mb-4">
            {ALL_CAPABILITIES.map((cap) => {
              const isSelected = currentSelection.includes(cap);
              const color = CAPABILITY_COLORS[cap];
              const classes = COLOR_CLASSES[color] || COLOR_CLASSES.purple;
              return (
                <button
                  key={cap}
                  type="button"
                  onClick={() => toggleCapability(cap)}
                  disabled={loading}
                  className={`flex-1 flex flex-col items-center gap-1 rounded-lg border-2 px-1.5 py-2.5 text-xs font-medium transition-all duration-150 ${
                    isSelected
                      ? `${classes.bg} ${classes.border} ${classes.text} scale-105 shadow-sm`
                      : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                  } ${loading ? 'opacity-50 cursor-wait' : 'cursor-pointer'}`}
                >
                  {CAPABILITY_ICONS[cap]}
                  <span>{CAPABILITY_LABELS[cap]}</span>
                </button>
              );
            })}
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <Button
              onClick={generateRound}
              disabled={!isSelectionValid || loading}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
            >
              See what this reveals
            </Button>
            <Button
              onClick={handleDone}
              disabled={!canFinish}
              variant="outline"
              className={`flex-1 ${canFinish ? 'border-purple-400 text-purple-700 hover:bg-purple-50' : ''}`}
            >
              Done — bring this back
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default CapabilitiesExplorerModal;
