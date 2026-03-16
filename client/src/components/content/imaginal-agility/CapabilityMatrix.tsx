import React from 'react';

// ── Types & Constants ─────────────────────────────────────────────────────────

type CapabilityKey = 'imagination' | 'curiosity' | 'caring' | 'creativity' | 'courage';

const CAPABILITIES: CapabilityKey[] = ['imagination', 'curiosity', 'caring', 'creativity', 'courage'];

const CAPABILITY_COLORS: Record<CapabilityKey, string> = {
  imagination: '#8b5cf6',
  curiosity:   '#10b981',
  caring:      '#3b82f6',
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
  curiosity:   { bg: '#d1fae5', text: '#047857' },
  caring:      { bg: '#dbeafe', text: '#1d4ed8' },
  creativity:  { bg: '#fef3c7', text: '#b45309' },
  courage:     { bg: '#fee2e2', text: '#b91c1c' },
};

// Rank badge colors: 1st/2nd = capability color, 3rd = neutral, 4th/5th = gray
const RANK_COLORS = ['', '#7c3aed', '#059669', '#6b7280', '#9ca3af', '#d1d5db'];

interface ExerciseCapabilities {
  stepId: string;
  name: string;
  capabilities: CapabilityKey[];
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface CapabilityMatrixProps {
  prism: Record<CapabilityKey, number> | null;
  pulseRanking: CapabilityKey[] | null;
  soloExercises: ExerciseCapabilities[];
  aiExercises: ExerciseCapabilities[];
  completeness: {
    hasPulse: boolean;
    hasPrism: boolean;
    soloStepsCompleted: number;
    soloStepsTotal: number;
    aiStepsCompleted: number;
    aiStepsTotal: number;
  } | null | undefined;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function PulseRankBadge({ rank, capColor }: { rank: number; capColor: string }) {
  // 1st/2nd use capability color, 3rd neutral, 4th/5th gray
  const bg = rank <= 2 ? capColor : rank === 3 ? '#6b7280' : '#d1d5db';
  const textColor = rank <= 3 ? 'white' : '#6b7280';

  return (
    <span
      className="inline-flex items-center justify-center rounded-full font-semibold"
      style={{
        width: 26, height: 26,
        backgroundColor: bg, color: textColor,
        fontSize: '0.7rem',
      }}
    >
      {rank}
    </span>
  );
}

function AssessmentBar({ score, color }: { score: number; color: string }) {
  const pct = Math.min((score / 5) * 100, 100);
  const label = score >= 3.5 ? 'Stronger' : score >= 2.5 ? 'Moderate' : 'Developing';

  return (
    <div className="flex items-center gap-2">
      <div className="relative" style={{ width: 60, height: 5, background: '#f3f4f6', borderRadius: 3 }}>
        <div
          style={{
            position: 'absolute', top: 0, left: 0, height: '100%',
            width: `${pct}%`, backgroundColor: color, borderRadius: 3,
            transition: 'width 0.6s ease',
          }}
        />
      </div>
      <span className="text-xs text-gray-500 whitespace-nowrap">{label}</span>
    </div>
  );
}

function ExercisePills({ exercises, capability }: { exercises: ExerciseCapabilities[]; capability: CapabilityKey }) {
  const matching = exercises.filter(ex => ex.capabilities.includes(capability));
  if (matching.length === 0) {
    return <span className="text-gray-300 text-sm">—</span>;
  }
  return (
    <div className="flex flex-wrap gap-1">
      {matching.map(ex => (
        <span
          key={ex.stepId}
          className="inline-block px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap"
          style={{
            backgroundColor: PILL_STYLES[capability].bg,
            color: PILL_STYLES[capability].text,
          }}
        >
          {ex.name}
        </span>
      ))}
    </div>
  );
}

function CombinationsSection({ soloExercises, aiExercises }: { soloExercises: ExerciseCapabilities[]; aiExercises: ExerciseCapabilities[] }) {
  // Find exercises where 2+ capabilities selected together
  const allExercises = [...soloExercises, ...aiExercises];
  const combos = allExercises.filter(ex => ex.capabilities.length >= 2);
  if (combos.length === 0) return null;

  return (
    <div className="mt-6">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Combinations</h3>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {combos.map(ex => (
          <div
            key={ex.stepId}
            className="flex-shrink-0 bg-white border border-gray-200 rounded-lg px-4 py-3 min-w-[140px]"
          >
            <p className="text-xs font-semibold text-gray-600 mb-2">{ex.name}</p>
            <div className="flex flex-wrap gap-1">
              {ex.capabilities.map(cap => (
                <span
                  key={cap}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                  style={{ backgroundColor: PILL_STYLES[cap].bg, color: PILL_STYLES[cap].text }}
                >
                  <span
                    className="inline-block w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: CAPABILITY_COLORS[cap] }}
                  />
                  {CAPABILITY_LABELS[cap]}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FacilitationPrompts() {
  const prompts = [
    'Which capabilities keep showing up regardless of the exercise?',
    'Are there any that only appeared with AI — or only without it?',
    'Look at the pulse column and the exercise columns. Did your first instinct match what actually showed up?',
  ];

  return (
    <div
      className="mt-6 rounded-xl p-5"
      style={{
        background: 'linear-gradient(135deg, #f5f3ff 0%, #eef2ff 100%)',
        border: '1px solid #c4b5fd',
      }}
    >
      <div className="text-sm font-bold text-purple-800 mb-3">Worth Exploring</div>
      {prompts.map((p, i) => (
        <div key={i} className="text-sm text-gray-600 leading-relaxed pl-5 py-1 relative">
          <span className="absolute left-0 text-purple-600 font-semibold">→</span>
          {p}
        </div>
      ))}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function CapabilityMatrix({
  prism,
  pulseRanking,
  soloExercises,
  aiExercises,
  completeness,
}: CapabilityMatrixProps) {
  const comp = completeness;

  return (
    <div className="mb-8">
      {/* 5×4 Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-200 min-w-[120px]">
                Capability
              </th>
              <th className="text-center px-3 py-3 border-b border-gray-200 min-w-[80px]">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Pulse</div>
                <div className="text-xs text-gray-400 italic font-normal">First drawn to</div>
              </th>
              <th className="text-center px-3 py-3 border-b border-gray-200 min-w-[130px]">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Assessment</div>
                <div className="text-xs text-gray-400 italic font-normal">How you saw yourself</div>
              </th>
              <th className="text-center px-3 py-3 border-b border-gray-200 min-w-[160px]">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Solo</div>
                <div className="text-xs text-gray-400 italic font-normal">Module 3 exercises</div>
              </th>
              <th className="text-center px-3 py-3 border-b border-gray-200 min-w-[160px]">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">AI-Partnered</div>
                <div className="text-xs text-gray-400 italic font-normal">Module 4 exercises</div>
              </th>
            </tr>
          </thead>
          <tbody>
            {CAPABILITIES.map((cap, i) => {
              const pulseRank = pulseRanking ? pulseRanking.indexOf(cap) + 1 : 0;
              const assessmentScore = prism ? prism[cap] : null;
              const isLast = i === CAPABILITIES.length - 1;

              return (
                <tr key={cap} className={!isLast ? 'border-b border-gray-100' : ''}>
                  {/* Capability name */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: CAPABILITY_COLORS[cap] }}
                      />
                      <span className="font-semibold text-gray-800">{CAPABILITY_LABELS[cap]}</span>
                    </div>
                  </td>

                  {/* Pulse ranking */}
                  <td className="px-3 py-3 text-center">
                    {pulseRank > 0 ? (
                      <PulseRankBadge rank={pulseRank} capColor={CAPABILITY_COLORS[cap]} />
                    ) : (
                      <span className="text-gray-300 text-sm">—</span>
                    )}
                  </td>

                  {/* Assessment bar */}
                  <td className="px-3 py-3">
                    <div className="flex justify-center">
                      {assessmentScore !== null ? (
                        <AssessmentBar score={assessmentScore} color={CAPABILITY_COLORS[cap]} />
                      ) : (
                        <span className="text-gray-300 text-sm">—</span>
                      )}
                    </div>
                  </td>

                  {/* Solo exercises */}
                  <td className="px-3 py-3 text-center">
                    <ExercisePills exercises={soloExercises} capability={cap} />
                  </td>

                  {/* AI-partnered exercises */}
                  <td className="px-3 py-3 text-center">
                    <ExercisePills exercises={aiExercises} capability={cap} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Combinations section */}
      <CombinationsSection soloExercises={soloExercises} aiExercises={aiExercises} />

      {/* Facilitation prompts */}
      <FacilitationPrompts />

      {/* Closing note */}
      <p className="mt-5 text-xs text-gray-400 italic text-center leading-relaxed">
        This is a snapshot of noticing, not a score. Each column is a different moment where a capability showed up — or didn't. The pattern tells a story about what you reach for.
      </p>

      {/* Completeness */}
      {comp && (
        <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-500 justify-center">
          <span>Pulse: {comp.hasPulse ? '✓' : '✗'}</span>
          <span>·</span>
          <span>Assessment: {comp.hasPrism ? '✓' : '✗'}</span>
          <span>·</span>
          <span>Solo: {comp.soloStepsCompleted}/{comp.soloStepsTotal}</span>
          <span>·</span>
          <span>AI: {comp.aiStepsCompleted}/{comp.aiStepsTotal}</span>
        </div>
      )}
    </div>
  );
}
