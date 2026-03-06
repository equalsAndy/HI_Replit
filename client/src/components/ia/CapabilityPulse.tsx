/**
 * CapabilityPulse.tsx
 *
 * Forced-choice pairs component for ia-2-1.
 * Captures gut-instinct ranking of 5 capabilities BEFORE the Prism assessment.
 * 10 pairs (full round-robin) — each capability compared to every other exactly once.
 *
 * DESIGN DECISIONS:
 * - No results shown to participant (avoids anchoring before assessment)
 * - Ranking and consistency data saved silently for later matrix comparison
 * - Reveal happens later in course when pulse is compared to assessment results
 * - Modal can be closed to quit; clicking Start Pulse resets and reopens
 * - Continue button disabled until pulse is complete
 *
 * Data saved via onComplete callback to state.ia_2_1_pulse:
 * {
 *   choices: Array<{ pair: [string, string], winner: string, loser: string }>,
 *   ranking: Array<{ key: string, score: number }>,
 *   inconsistencies: number,
 *   completedAt: string
 * }
 *
 * Integration: Placed on ia-2-1 content page after video/prism content,
 * before the "Next: Self-Assessment" button.
 */

import { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';

// ─── Types ────────────────────────────────────────────────────────────────

type CapabilityKey = 'imagination' | 'curiosity' | 'caring' | 'creativity' | 'courage';

interface CapabilityDef {
  name: string;
  color: string;
  lightBg: string;
  border: string;
  image: string;
  tagline: string;
}

interface Choice {
  pair: [CapabilityKey, CapabilityKey];
  winner: CapabilityKey;
  loser: CapabilityKey;
}

interface PulseData {
  choices: Choice[];
  ranking: Array<{ key: string; score: number }>;
  inconsistencies: number;
  completedAt: string;
}

interface CapabilityPulseProps {
  /** Called with pulse data when participant completes all 10 pairs */
  onComplete?: (data: PulseData) => void;
  /** Called when participant clicks "Continue to Assessment" */
  onContinue?: () => void;
  /** Previously saved pulse data (for returning to completed pulse) */
  savedData?: PulseData | null;
}

// ─── Constants ────────────────────────────────────────────────────────────
// Colors match the _sq icon graphics

const CAPABILITIES: Record<CapabilityKey, CapabilityDef> = {
  imagination: {
    name: 'Imagination',
    color: '#8b5cf6',
    lightBg: '#faf5ff',
    border: '#d8b4fe',
    image: '/assets/Imagination_sq.png',
    tagline: 'Seeing what isn\'t there yet',
  },
  curiosity: {
    name: 'Curiosity',
    color: '#10b981',
    lightBg: '#ecfdf5',
    border: '#6ee7b7',
    image: '/assets/Curiosity_sq.png',
    tagline: 'The drive to explore',
  },
  caring: {
    name: 'Caring',
    color: '#3b82f6',
    lightBg: '#eff6ff',
    border: '#93c5fd',
    image: '/assets/Caring_sq.png',
    tagline: 'The capacity to relate',
  },
  creativity: {
    name: 'Creativity',
    color: '#f59e0b',
    lightBg: '#fffbeb',
    border: '#fcd34d',
    image: '/assets/Creativity_sq.png',
    tagline: 'The power to generate',
  },
  courage: {
    name: 'Courage',
    color: '#ef4444',
    lightBg: '#fef2f2',
    border: '#fca5a5',
    image: '/assets/courage_sq.png',
    tagline: 'The strength to act',
  },
};

const CAPABILITY_KEYS: CapabilityKey[] = ['imagination', 'curiosity', 'caring', 'creativity', 'courage'];

// ─── Utilities ────────────────────────────────────────────────────────────

/** Generate all 10 pairs, shuffled, with randomized left/right positions */
function generatePairs(): [CapabilityKey, CapabilityKey][] {
  const pairs: [CapabilityKey, CapabilityKey][] = [];
  for (let i = 0; i < CAPABILITY_KEYS.length; i++) {
    for (let j = i + 1; j < CAPABILITY_KEYS.length; j++) {
      pairs.push([CAPABILITY_KEYS[i], CAPABILITY_KEYS[j]]);
    }
  }
  // Fisher-Yates shuffle
  for (let i = pairs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
  }
  // Randomize left/right within each pair
  return pairs.map(pair =>
    Math.random() > 0.5 ? [pair[1], pair[0]] : pair
  );
}

/** Calculate ranking and consistency from completed choices */
function calculateResults(choices: Choice[]) {
  const wins: Record<CapabilityKey, number> = {
    imagination: 0, curiosity: 0, caring: 0, creativity: 0, courage: 0,
  };

  choices.forEach(({ winner }) => {
    wins[winner]++;
  });

  // Detect circular inconsistencies (A > B > C > A)
  let inconsistencies = 0;
  for (let i = 0; i < CAPABILITY_KEYS.length; i++) {
    for (let j = i + 1; j < CAPABILITY_KEYS.length; j++) {
      for (let k = j + 1; k < CAPABILITY_KEYS.length; k++) {
        const a = CAPABILITY_KEYS[i];
        const b = CAPABILITY_KEYS[j];
        const c = CAPABILITY_KEYS[k];

        const findWinner = (x: CapabilityKey, y: CapabilityKey): CapabilityKey | null => {
          const match = choices.find(
            ch => (ch.pair[0] === x && ch.pair[1] === y) ||
                  (ch.pair[0] === y && ch.pair[1] === x)
          );
          return match?.winner || null;
        };

        const abWinner = findWinner(a, b);
        const bcWinner = findWinner(b, c);
        const acWinner = findWinner(a, c);

        if (abWinner && bcWinner && acWinner) {
          const aBeatsB = abWinner === a;
          const bBeatsC = bcWinner === b;
          const aBeatsC = acWinner === a;
          if (aBeatsB && bBeatsC && !aBeatsC) inconsistencies++;
          if (!aBeatsB && !bBeatsC && aBeatsC) inconsistencies++;
        }
      }
    }
  }

  const ranking = Object.entries(wins)
    .sort((a, b) => b[1] - a[1])
    .map(([key, score]) => ({ key, score }));

  return { ranking, inconsistencies, totalPairs: 10 };
}

// ─── Styles ──────────────────────────────────────────────────────────────

const KEYFRAMES = `
  @keyframes cp-enterCard {
    from { opacity: 0; transform: translateY(20px) scale(0.95); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes cp-exitChosen {
    to { opacity: 0; transform: scale(1.05); }
  }
  @keyframes cp-exitNotChosen {
    to { opacity: 0; transform: scale(0.9) translateY(10px); }
  }
  @keyframes cp-fadeInUp {
    from { opacity: 0; transform: translateY(16px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

// ─── Sub-components ──────────────────────────────────────────────────────

interface CardProps {
  capKey: CapabilityKey;
  onClick: () => void;
  side: 'left' | 'right';
  isExiting: boolean;
  exitSide: 'left' | 'right' | null;
}

function CapabilityCard({ capKey, onClick, side, isExiting, exitSide }: CardProps) {
  const cap = CAPABILITIES[capKey];

  const animationName = isExiting
    ? (exitSide === side ? 'cp-exitChosen' : 'cp-exitNotChosen')
    : 'cp-enterCard';

  const animationDuration = isExiting ? '0.35s' : '0.4s';
  const animationTiming = isExiting ? 'ease-in' : 'cubic-bezier(0.34, 1.56, 0.64, 1)';
  const animationDelay = isExiting ? '0s' : (side === 'left' ? '0.05s' : '0.15s');

  return (
    <div
      onClick={onClick}
      style={{
        flex: 1,
        maxWidth: 220,
        cursor: 'pointer',
        animation: `${animationName} ${animationDuration} ${animationTiming} ${animationDelay} forwards`,
        opacity: 0,
      }}
    >
      <div
        style={{
          background: cap.lightBg,
          border: `2px solid ${cap.border}`,
          borderRadius: 16,
          padding: 20,
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          boxShadow: `0 4px 24px ${cap.color}15`,
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.transform = 'scale(1.04)';
          (e.currentTarget as HTMLDivElement).style.boxShadow = `0 8px 32px ${cap.color}25`;
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.transform = 'scale(1)';
          (e.currentTarget as HTMLDivElement).style.boxShadow = `0 4px 24px ${cap.color}15`;
        }}
      >
        {/* Icon graphic */}
        <img
          src={cap.image}
          alt={cap.name}
          style={{
            width: 56,
            height: 56,
            objectFit: 'contain',
            margin: '0 auto 12px',
            display: 'block',
          }}
        />

        {/* Name */}
        <h3
          style={{
            fontSize: 18,
            fontWeight: 700,
            textAlign: 'center',
            color: cap.color,
            marginBottom: 4,
          }}
        >
          {cap.name}
        </h3>

        {/* Tagline */}
        <p
          style={{
            fontSize: 12,
            textAlign: 'center',
            color: cap.color,
            opacity: 0.7,
          }}
        >
          {cap.tagline}
        </p>
      </div>
    </div>
  );
}

function ProgressDots({ current, total }: { current: number; total: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 24 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          style={{
            width: i === current ? 24 : 8,
            height: 8,
            borderRadius: 4,
            transition: 'all 0.3s ease',
            background:
              i < current
                ? '#9333ea'
                : i === current
                  ? 'linear-gradient(90deg, #9333ea, #7c3aed)'
                  : '#e5e7eb',
          }}
        />
      ))}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────

export default function CapabilityPulse({ onComplete, onContinue, savedData }: CapabilityPulseProps) {
  const [completed, setCompleted] = useState(!!savedData);
  const [modalOpen, setModalOpen] = useState(false);
  const [pairs, setPairs] = useState<[CapabilityKey, CapabilityKey][]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [choices, setChoices] = useState<Choice[]>([]);
  const [isExiting, setIsExiting] = useState(false);
  const [exitSide, setExitSide] = useState<'left' | 'right' | null>(null);

  const startPulse = useCallback(() => {
    setPairs(generatePairs());
    setCurrentIndex(0);
    setChoices([]);
    setModalOpen(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setModalOpen(false);
    setIsExiting(false);
    setExitSide(null);
  }, []);

  const handleChoice = useCallback((winner: CapabilityKey, side: 'left' | 'right') => {
    if (isExiting) return;

    const currentPair = pairs[currentIndex];
    const loser = currentPair[0] === winner ? currentPair[1] : currentPair[0];
    const newChoice: Choice = { pair: currentPair, winner, loser };

    setIsExiting(true);
    setExitSide(side);

    setTimeout(() => {
      const newChoices = [...choices, newChoice];
      setChoices(newChoices);

      if (currentIndex + 1 >= pairs.length) {
        const { ranking, inconsistencies } = calculateResults(newChoices);
        setModalOpen(false);
        setCompleted(true);

        onComplete?.({
          choices: newChoices,
          ranking,
          inconsistencies,
          completedAt: new Date().toISOString(),
        });
      } else {
        setCurrentIndex(currentIndex + 1);
      }

      setIsExiting(false);
      setExitSide(null);
    }, 350);
  }, [currentIndex, pairs, choices, isExiting, onComplete]);

  const currentPair = pairs[currentIndex] ?? null;

  return (
    <>
      <div style={{ padding: '32px 16px' }}>
        <style>{KEYFRAMES}</style>
        <div
          style={{
            maxWidth: 480,
            margin: '0 auto',
            textAlign: 'center',
            animation: 'cp-fadeInUp 0.5s ease-out forwards',
          }}
        >
          {completed ? (
            // ─── Post-pulse acknowledgment ───
            <>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 28,
                  margin: '0 auto 20px',
                  background: 'linear-gradient(135deg, #faf5ff, #f3e8ff)',
                  border: '1.5px solid #d8b4fe',
                }}
              >
                ✦
              </div>

              <h3 style={{ fontSize: 20, fontWeight: 700, color: '#1e1b4b', marginBottom: 12 }}>
                First Impression Captured
              </h3>

              <p style={{ fontSize: 15, lineHeight: 1.7, color: '#6b7280', marginBottom: 24 }}>
                We've got your gut reaction. You'll see how it
                compares to your full results later in the course.
              </p>

              <button
                onClick={onContinue}
                style={{
                  padding: '14px 32px',
                  borderRadius: 12,
                  color: 'white',
                  fontWeight: 600,
                  fontSize: 15,
                  background: 'linear-gradient(135deg, #9333ea, #7c3aed)',
                  boxShadow: '0 4px 16px #9333ea30',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease',
                }}
                onMouseEnter={(e) => { (e.target as HTMLButtonElement).style.transform = 'scale(1.05)'; }}
                onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.transform = 'scale(1)'; }}
              >
                Continue to Discover Your Prism →
              </button>
            </>
          ) : (
            // ─── Pre-pulse framing ───
            <>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 16,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 24,
                  margin: '0 auto 20px',
                  background: 'linear-gradient(135deg, #faf5ff, #f3e8ff)',
                  border: '1.5px solid #d8b4fe',
                }}
              >
                ✦
              </div>

              <h3 style={{ fontSize: 20, fontWeight: 700, color: '#1e1b4b', marginBottom: 16 }}>
                Quick Pulse
              </h3>

              <p style={{ fontSize: 15, lineHeight: 1.7, color: '#4b5563', marginBottom: 16 }}>
                Before you dive in, we want to capture something
                important — your gut reaction.
              </p>

              <p style={{ fontSize: 15, lineHeight: 1.7, color: '#4b5563', marginBottom: 16 }}>
                You'll see two capabilities at a time. Just pick the one you're
                more drawn to. Don't overthink it — there's no right answer
                and you'll go through all ten pairs in about 30 seconds.
              </p>

              <p style={{ fontSize: 14, lineHeight: 1.6, color: '#6b7280', marginBottom: 32 }}>
                Later in the course, we'll show you how your first impression
                compares to what your Prism reveals. The gap between the two
                is often where the most interesting learning lives.
              </p>

              <button
                onClick={startPulse}
                style={{
                  padding: '14px 32px',
                  borderRadius: 12,
                  color: 'white',
                  fontWeight: 600,
                  fontSize: 15,
                  background: 'linear-gradient(135deg, #9333ea, #7c3aed)',
                  boxShadow: '0 4px 16px #9333ea30',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease',
                }}
                onMouseEnter={(e) => { (e.target as HTMLButtonElement).style.transform = 'scale(1.05)'; }}
                onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.transform = 'scale(1)'; }}
              >
                Start Pulse
              </button>
            </>
          )}
        </div>
      </div>

      {/* Modal for the choosing interaction */}
      <Dialog open={modalOpen} onOpenChange={(open) => { if (!open) handleModalClose(); }}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden">
          <style>{KEYFRAMES}</style>

          {/* Persistent instruction header */}
          <div style={{ padding: '24px 28px 16px', textAlign: 'center', borderBottom: '1px solid #f3f4f6' }}>
            <DialogTitle style={{ fontSize: 18, fontWeight: 700, color: '#1e1b4b', marginBottom: 8 }}>
              Quick Pulse
            </DialogTitle>
            <DialogDescription asChild>
              <div>
                <p style={{ fontSize: 14, lineHeight: 1.6, color: '#4b5563' }}>
                  Just pick the one you're more drawn to. Don't overthink it — there's no right answer.
                </p>
              </div>
            </DialogDescription>
          </div>

          {currentPair && (
            <div style={{ padding: '20px 28px 28px' }}>
              {/* Counter */}
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#9333ea' }}>
                  {currentIndex + 1} of 10
                </p>
              </div>

              {/* Cards */}
              <div
                key={currentIndex}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 24,
                }}
              >
                <CapabilityCard
                  capKey={currentPair[0]}
                  onClick={() => handleChoice(currentPair[0], 'left')}
                  side="left"
                  isExiting={isExiting}
                  exitSide={exitSide}
                />

                <div
                  style={{
                    color: '#d1d5db',
                    fontSize: 14,
                    fontWeight: 600,
                  }}
                >
                  or
                </div>

                <CapabilityCard
                  capKey={currentPair[1]}
                  onClick={() => handleChoice(currentPair[1], 'right')}
                  side="right"
                  isExiting={isExiting}
                  exitSide={exitSide}
                />
              </div>

              <ProgressDots current={currentIndex} total={10} />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
