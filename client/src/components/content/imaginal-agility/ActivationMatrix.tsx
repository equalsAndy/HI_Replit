import React, { useState, useEffect, useRef } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';

// ── Types & Constants ─────────────────────────────────────────────────────────

type CapabilityKey = 'imagination' | 'curiosity' | 'caring' | 'creativity' | 'courage';
type Quadrant = 'stretch' | 'comfort' | 'growth' | 'untapped';

const CAPABILITIES: CapabilityKey[] = ['imagination', 'curiosity', 'caring', 'creativity', 'courage'];

const CAPABILITY_COLORS: Record<CapabilityKey, string> = {
  imagination: '#8b5cf6',
  curiosity:   '#3b82f6',
  caring:      '#10b981',
  creativity:  '#f59e0b',
  courage:     '#ef4444',
};

const CAPABILITY_LABELS: Record<CapabilityKey, string> = {
  imagination: 'Imagination',
  curiosity:   'Curiosity',
  caring:      'Caring',
  creativity:  'Creativity',
  courage:     'Courage',
};

const PILL_STYLES: Record<CapabilityKey, { bg: string; text: string }> = {
  imagination: { bg: '#ede9fe', text: '#6d28d9' },
  curiosity:   { bg: '#dbeafe', text: '#1d4ed8' },
  caring:      { bg: '#d1fae5', text: '#047857' },
  creativity:  { bg: '#fef3c7', text: '#b45309' },
  courage:     { bg: '#fee2e2', text: '#b91c1c' },
};

const QUADRANT_META: Record<Quadrant, { label: string; hint: string; bg: string; labelColor: string }> = {
  stretch:  { label: 'Stretch',      hint: 'Used more than expected',      bg: '#f0fdf4', labelColor: '#059669' },
  comfort:  { label: 'Comfort Zone', hint: 'Know it, use it',              bg: '#faf5ff', labelColor: '#7c3aed' },
  growth:   { label: 'Growth Edge',  hint: 'Room to explore',              bg: '#f9fafb', labelColor: '#9ca3af' },
  untapped: { label: 'Untapped',     hint: "See it, didn't reach for it",  bg: '#fffbeb', labelColor: '#d97706' },
};

const QUADRANT_ORDER: Record<Quadrant, number> = { growth: 0, untapped: 1, stretch: 2, comfort: 3 };

// ── Props ─────────────────────────────────────────────────────────────────────

interface ActivationMatrixProps {
  prism: Record<CapabilityKey, number> | null;
  soloActivations: Record<CapabilityKey, number>;
  aiActivations: Record<CapabilityKey, number>;
  completeness: {
    hasPrism: boolean;
    soloStepsCompleted: number;
    soloStepsTotal: number;
    aiStepsCompleted: number;
    aiStepsTotal: number;
  } | null | undefined;
}

// ── Placement Algorithm ───────────────────────────────────────────────────────

function computePlacements(
  prism: Record<CapabilityKey, number>,
  activations: Record<CapabilityKey, number>
): Record<CapabilityKey, Quadrant> {
  const median = (arr: number[]) => {
    const sorted = [...arr].sort((a, b) => a - b);
    return sorted[Math.floor(sorted.length / 2)];
  };

  const prismMed = median(CAPABILITIES.map(c => prism[c]));
  const actMed   = median(CAPABILITIES.map(c => activations[c]));

  const result = {} as Record<CapabilityKey, Quadrant>;
  for (const cap of CAPABILITIES) {
    const highPrism = prism[cap] >= prismMed;
    const highAct   = activations[cap] >= actMed;

    if (highAct && !highPrism)      result[cap] = 'stretch';
    else if (highAct && highPrism)  result[cap] = 'comfort';
    else if (!highAct && !highPrism) result[cap] = 'growth';
    else                             result[cap] = 'untapped';
  }
  return result;
}

// ── CompactPrism ──────────────────────────────────────────────────────────────

function CompactPrism({ prism }: { prism: Record<CapabilityKey, number> }) {
  const radarData = [
    { capacity: 'Imagination', score: prism.imagination, fullMark: 5 },
    { capacity: 'Curiosity',   score: prism.curiosity,   fullMark: 5 },
    { capacity: 'Caring',      score: prism.caring,      fullMark: 5 },
    { capacity: 'Creativity',  score: prism.creativity,  fullMark: 5 },
    { capacity: 'Courage',     score: prism.courage,     fullMark: 5 },
  ];

  return (
    <div>
      <div style={{ padding: '14px 16px 0' }}>
        <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#5b21b6', marginBottom: 2 }}>
          Your Capability Prism
        </div>
        <div style={{ fontSize: '0.75rem', color: '#9ca3af', lineHeight: 1.4 }}>
          How you rated yourself at the start
        </div>
      </div>

      <div style={{ height: 200, width: '100%', padding: '8px 12px 4px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
            <defs>
              <radialGradient id="prismFillCompact" cx="50%" cy="50%" r="50%">
                <stop offset="0%"   stopColor="#10b981" stopOpacity={0.45} />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.65} />
              </radialGradient>
            </defs>
            <PolarGrid stroke="#e5e7eb" />
            <PolarAngleAxis
              dataKey="capacity"
              tick={{ fontSize: 10, fill: '#4b5563', fontWeight: 600 }}
            />
            <Radar
              name="Score"
              dataKey="score"
              stroke="#7c3aed"
              fill="url(#prismFillCompact)"
              strokeWidth={2}
              dot={{ r: 3, fill: '#7c3aed' }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Score bars */}
      <div style={{ padding: '0 16px 14px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {CAPABILITIES.map(cap => (
          <div key={cap} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem' }}>
            <span style={{
              width: 8, height: 8, borderRadius: '50%',
              backgroundColor: CAPABILITY_COLORS[cap], flexShrink: 0,
            }} />
            <span style={{ flex: 1, color: '#4b5563', fontWeight: 500 }}>
              {CAPABILITY_LABELS[cap]}
            </span>
            <div style={{ width: 80, height: 6, background: '#f3f4f6', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${(prism[cap] / 5) * 100}%`,
                backgroundColor: CAPABILITY_COLORS[cap],
                borderRadius: 3,
                transition: 'width 0.6s ease',
              }} />
            </div>
            <span style={{ width: 24, textAlign: 'right', fontWeight: 600, fontSize: '0.75rem', color: '#374151' }}>
              {prism[cap].toFixed(1)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── ToggleBar ─────────────────────────────────────────────────────────────────

function ToggleBar({ mode, onSwitch }: { mode: 'solo' | 'ai'; onSwitch: (m: 'solo' | 'ai') => void }) {
  const sliderColor = mode === 'solo' ? '#8b5cf6' : '#3b82f6';
  const sliderTranslate = mode === 'solo' ? '0%' : '100%';

  return (
    <div style={{
      display: 'flex', background: '#f3f4f6', borderRadius: 8,
      padding: 3, margin: '14px 16px 0', position: 'relative',
    }}>
      {/* Sliding indicator */}
      <div style={{
        position: 'absolute', top: 3, left: 3,
        width: 'calc(50% - 3px)', height: 'calc(100% - 6px)',
        borderRadius: 6, backgroundColor: sliderColor,
        transform: `translateX(${sliderTranslate})`,
        transition: 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.35s ease',
        zIndex: 0,
      }} />
      {(['solo', 'ai'] as const).map(m => (
        <button
          key={m}
          onClick={() => onSwitch(m)}
          style={{
            flex: 1, padding: '8px 12px', fontSize: '0.8rem', fontWeight: 600,
            textAlign: 'center', border: 'none', background: 'transparent',
            color: mode === m ? 'white' : '#6b7280',
            cursor: 'pointer', borderRadius: 6,
            position: 'relative', zIndex: 1,
            transition: 'color 0.3s ease',
          }}
        >
          {m === 'solo' ? 'Solo · Module 3' : 'AI-Partnered · Module 4'}
        </button>
      ))}
    </div>
  );
}

// ── QuadrantGrid ──────────────────────────────────────────────────────────────

interface QuadrantGridProps {
  placements: Record<CapabilityKey, Quadrant>;
  animatingCaps: Set<CapabilityKey>;
  movedCaps: Set<CapabilityKey>;
}

function QuadrantGrid({ placements, animatingCaps, movedCaps }: QuadrantGridProps) {
  // Group capabilities by quadrant
  const byQuadrant: Record<Quadrant, CapabilityKey[]> = {
    stretch: [], comfort: [], growth: [], untapped: [],
  };
  for (const cap of CAPABILITIES) {
    byQuadrant[placements[cap]].push(cap);
  }

  const QuadrantCell = ({
    quadrant, borderRight, borderBottom,
  }: { quadrant: Quadrant; borderRight?: boolean; borderBottom?: boolean }) => {
    const meta = QUADRANT_META[quadrant];
    return (
      <div style={{
        background: meta.bg,
        padding: '10px 12px',
        display: 'flex', flexDirection: 'column',
        minHeight: 100,
        borderRight: borderRight ? '1px dashed #e5e7eb' : undefined,
        borderBottom: borderBottom ? '1px dashed #e5e7eb' : undefined,
      }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: meta.labelColor, marginBottom: 1 }}>
          {meta.label}
        </div>
        <div style={{ fontSize: '0.6rem', color: '#9ca3af', fontStyle: 'italic' }}>
          {meta.hint}
        </div>
        <div style={{
          flex: 1, display: 'flex', flexWrap: 'wrap',
          alignItems: 'center', alignContent: 'center',
          justifyContent: 'center', gap: 5, paddingTop: 6,
        }}>
          {byQuadrant[quadrant].map(cap => {
            const isAnimating = animatingCaps.has(cap);
            const justMoved = movedCaps.has(cap) && !isAnimating;
            return (
              <span
                key={cap}
                className={justMoved ? 'cap-pill-moved' : ''}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  padding: '4px 10px', borderRadius: 999,
                  fontSize: '0.75rem', fontWeight: 600, whiteSpace: 'nowrap',
                  backgroundColor: PILL_STYLES[cap].bg,
                  color: PILL_STYLES[cap].text,
                  opacity: isAnimating ? 0 : 1,
                  transform: isAnimating ? 'scale(0.7)' : 'scale(1)',
                  transition: 'opacity 0.4s ease, transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                }}
              >
                <span style={{
                  width: 7, height: 7, borderRadius: '50%',
                  backgroundColor: CAPABILITY_COLORS[cap], flexShrink: 0,
                }} />
                {CAPABILITY_LABELS[cap]}
              </span>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding: '12px 16px 8px' }}>
      <div style={{ position: 'relative', paddingLeft: 28 }}>
        {/* Y-axis */}
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 28,
          width: 24, display: 'flex', flexDirection: 'column',
          justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{ fontSize: '0.55rem', color: '#9ca3af', writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>More ↑</span>
          <span style={{ fontSize: '0.6rem', color: '#6b7280', fontWeight: 600, writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>Activation</span>
          <span style={{ fontSize: '0.55rem', color: '#9ca3af', writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>Less ↓</span>
        </div>

        <div>
          {/* 2×2 Grid */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr',
            border: '1.5px solid #e5e7eb', borderRadius: 8, overflow: 'hidden',
          }}>
            <QuadrantCell quadrant="stretch"  borderRight borderBottom />
            <QuadrantCell quadrant="comfort"  borderBottom />
            <QuadrantCell quadrant="growth"   borderRight />
            <QuadrantCell quadrant="untapped" />
          </div>

          {/* X-axis */}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 2px 0' }}>
            <span style={{ fontSize: '0.6rem', color: '#9ca3af', fontWeight: 500 }}>← Lower</span>
            <span style={{ fontSize: '0.65rem', color: '#6b7280', fontWeight: 600 }}>Self-Perception (Prism)</span>
            <span style={{ fontSize: '0.6rem', color: '#9ca3af', fontWeight: 500 }}>Higher →</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── MovementLog ───────────────────────────────────────────────────────────────

interface MovementLogProps {
  mode: 'solo' | 'ai';
  soloPlacements: Record<CapabilityKey, Quadrant>;
  aiPlacements: Record<CapabilityKey, Quadrant>;
}

function MovementLog({ mode, soloPlacements, aiPlacements }: MovementLogProps) {
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (mode !== 'ai') {
      setVisibleItems(new Set());
      return;
    }
    // Build sorted items: movers first, then stable
    const movers: number[] = [];
    const stable: number[] = [];
    CAPABILITIES.forEach((cap, i) => {
      if (soloPlacements[cap] !== aiPlacements[cap]) movers.push(i);
      else stable.push(i);
    });
    const order = [...movers, ...stable];
    order.forEach((capIdx, i) => {
      setTimeout(() => {
        setVisibleItems(prev => new Set([...prev, capIdx]));
      }, 180 + i * 100);
    });
  }, [mode]);

  const QUADRANT_DISPLAY: Record<Quadrant, string> = {
    comfort: 'Comfort Zone', stretch: 'Stretch', untapped: 'Untapped', growth: 'Growth Edge',
  };

  // Sort: movers first, then stable
  const items = CAPABILITIES.map((cap, idx) => {
    const from = soloPlacements[cap];
    const to   = aiPlacements[cap];
    const moved = from !== to;
    let dir: 'up' | 'down' | 'same';
    if (!moved) dir = 'same';
    else dir = QUADRANT_ORDER[to] > QUADRANT_ORDER[from] ? 'up' : 'down';
    return { cap, from, to, moved, dir, idx };
  });
  const sorted = [...items.filter(m => m.moved), ...items.filter(m => !m.moved)];

  const arrowStyle: Record<'up' | 'down' | 'same', React.CSSProperties> = {
    up:   { color: '#059669', fontWeight: 600, flexShrink: 0, width: 18, textAlign: 'center' },
    down: { color: '#d97706', fontWeight: 600, flexShrink: 0, width: 18, textAlign: 'center' },
    same: { color: '#9ca3af', fontWeight: 600, flexShrink: 0, width: 18, textAlign: 'center' },
  };
  const arrowChar: Record<'up' | 'down' | 'same', string> = { up: '↗', down: '↙', same: '→' };

  return (
    <div style={{
      borderTop: '1px solid #e5e7eb', padding: '12px 16px',
      background: '#f9fafb', minHeight: 48,
    }}>
      {mode === 'solo' ? (
        <p style={{ fontSize: '0.78rem', color: '#9ca3af', fontStyle: 'italic' }}>
          Toggle to <strong style={{ color: '#6b7280' }}>AI-Partnered</strong> to see what shifted.
        </p>
      ) : (
        <>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#5b21b6', marginBottom: 8 }}>
            What shifted
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {sorted.map(({ cap, from, to, dir, idx }) => (
              <div
                key={cap}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  fontSize: '0.78rem', color: '#4b5563', lineHeight: 1.4,
                  opacity: visibleItems.has(idx) ? 1 : 0,
                  transform: visibleItems.has(idx) ? 'translateY(0)' : 'translateY(4px)',
                  transition: 'opacity 0.35s ease, transform 0.35s ease',
                }}
              >
                <span style={arrowStyle[dir]}>{arrowChar[dir]}</span>
                <span>
                  <span style={{ fontWeight: 700, color: CAPABILITY_COLORS[cap] }}>
                    {CAPABILITY_LABELS[cap]}
                  </span>
                  {' '}
                  {from === to
                    ? <>stayed in <strong style={{ color: '#374151' }}>{QUADRANT_DISPLAY[to]}</strong></>
                    : <><strong style={{ color: '#374151' }}>{QUADRANT_DISPLAY[from]}</strong> → <strong style={{ color: '#374151' }}>{QUADRANT_DISPLAY[to]}</strong></>
                  }
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── FacilitationPrompts ───────────────────────────────────────────────────────

function FacilitationPrompts() {
  const prompts = [
    'Which capabilities stayed in the same quadrant with or without AI?',
    'If something jumped quadrants — what might that say about how you use AI?',
    'Look at your Prism shape. Where the pentagon is small but the matrix shows Stretch — that\'s a surprise worth paying attention to.',
  ];

  return (
    <div style={{
      background: 'linear-gradient(135deg, #f5f3ff 0%, #eef2ff 100%)',
      border: '1px solid #c4b5fd', borderRadius: 12,
      padding: '18px 22px', marginBottom: 16,
    }}>
      <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#5b21b6', marginBottom: 12 }}>
        Worth Exploring
      </div>
      {prompts.map((p, i) => (
        <div key={i} style={{
          fontSize: '0.875rem', lineHeight: 1.5, color: '#4b5563',
          padding: '5px 0 5px 20px', position: 'relative',
        }}>
          <span style={{ position: 'absolute', left: 0, color: '#7c3aed', fontWeight: 600 }}>→</span>
          {p}
        </div>
      ))}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function ActivationMatrix({
  prism,
  soloActivations,
  aiActivations,
  completeness,
}: ActivationMatrixProps) {
  const [mode, setMode] = useState<'solo' | 'ai'>('solo');
  const [hasToggled, setHasToggled] = useState(false);
  const [animatingCaps, setAnimatingCaps] = useState<Set<CapabilityKey>>(new Set());
  const [movedCaps, setMovedCaps] = useState<Set<CapabilityKey>>(new Set());
  const prevPlacementsRef = useRef<Record<CapabilityKey, Quadrant> | null>(null);

  // Compute placements — fallback to zero-prism if no prism data
  const fallbackPrism: Record<CapabilityKey, number> = prism ?? {
    imagination: 0, curiosity: 0, caring: 0, creativity: 0, courage: 0,
  };
  const soloPlacements = computePlacements(fallbackPrism, soloActivations);
  const aiPlacements   = computePlacements(fallbackPrism, aiActivations);
  const currentPlacements = mode === 'solo' ? soloPlacements : aiPlacements;

  const handleToggle = (newMode: 'solo' | 'ai') => {
    if (newMode === mode) return;
    prevPlacementsRef.current = currentPlacements;
    setMode(newMode);
    setHasToggled(true);
  };

  useEffect(() => {
    if (!hasToggled || !prevPlacementsRef.current) return;
    const prev = prevPlacementsRef.current;
    const curr = mode === 'solo' ? soloPlacements : aiPlacements;
    const moved = new Set(CAPABILITIES.filter(c => prev[c] !== curr[c]));
    setMovedCaps(moved);

    // Make all pills invisible
    setAnimatingCaps(new Set(CAPABILITIES));

    // Stagger reveal
    CAPABILITIES.forEach((cap, i) => {
      const delay = moved.has(cap) ? 120 + i * 80 : 60;
      setTimeout(() => {
        setAnimatingCaps(prev => {
          const next = new Set(prev);
          next.delete(cap);
          return next;
        });
      }, delay);
    });
  }, [mode]);

  const comp = completeness;

  return (
    <>
      {/* Pulse animation for moved pills */}
      <style>{`
        .cap-pill-moved {
          animation: arrivalPulse 0.45s ease-out 0.45s both;
        }
        @keyframes arrivalPulse {
          0%   { transform: scale(1); }
          40%  { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
      `}</style>

      <div className="mb-8">
        {/* Two-panel grid */}
        <div className={`grid gap-5 mb-5 ${prism ? 'grid-cols-1 md:grid-cols-[280px_1fr]' : 'grid-cols-1'}`}>

          {/* LEFT: Prism Panel */}
          {prism && (
            <div style={{
              background: 'white', border: '1px solid #e5e7eb',
              borderRadius: 14, overflow: 'hidden',
            }}>
              <CompactPrism prism={prism} />
            </div>
          )}

          {/* RIGHT: Matrix Panel */}
          <div style={{
            background: 'white', border: '1px solid #e5e7eb',
            borderRadius: 14, overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}>
            <ToggleBar mode={mode} onSwitch={handleToggle} />
            <QuadrantGrid
              placements={currentPlacements}
              animatingCaps={animatingCaps}
              movedCaps={movedCaps}
            />
            <MovementLog
              mode={mode}
              soloPlacements={soloPlacements}
              aiPlacements={aiPlacements}
            />
          </div>
        </div>

        {/* Facilitation Prompts */}
        <FacilitationPrompts />

        {/* Note */}
        <p style={{
          fontSize: '0.7rem', color: '#9ca3af', fontStyle: 'italic',
          textAlign: 'center', lineHeight: 1.5,
        }}>
          Patterns, not scores. Matrix placement comes from your Prism self-assessment
          relative to your own median, crossed with exercise activation frequency.
        </p>

        {/* Completeness */}
        {comp && (
          <div className="mt-3 flex flex-wrap gap-3 text-xs text-gray-500 justify-center">
            <span>Solo: {comp.soloStepsCompleted}/{comp.soloStepsTotal} exercises tracked</span>
            <span>·</span>
            <span>AI: {comp.aiStepsCompleted}/{comp.aiStepsTotal} exercises tracked</span>
          </div>
        )}
      </div>
    </>
  );
}
