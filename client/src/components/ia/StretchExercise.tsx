import React, { useMemo } from 'react';
import { useContinuity } from '@/hooks/useContinuity';
import InlineChat from '@/components/ia/InlineChat';
import { PROMPTS } from '@/constants/prompts';
import { RUNG_ART } from '@/constants/rungArt';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

export default function StretchExercise() {
  const { state, setStep } = useContinuity();
  const s = state.ia_4_3 || {};
  const assumptions = s.assumptions || '';
  const seed = useMemo(() => assumptions, [assumptions]);

  function parseStretchReply(reply: string) {
    const text = String(reply || '').trim();
    const mStretch = text.match(/^\s*Stretch:\s*(.+)$/mi);
    const mVision = text.match(/^\s*(Vision|Stretch Vision):\s*(.+)$/mi);
    const mResist = text.match(/^\s*Resistance:\s*(.+)$/mi);
    const ai_stretch = mStretch ? mStretch[1].trim() : text;
    const stretch_vision = mVision ? mVision[2].trim() : (s.stretch_vision || '');
    const resistance = mResist ? mResist[1].trim() : (s.resistance || '');
    setStep('ia_4_3', { ...s, ai_stretch, stretch_vision, resistance });
  }

  return (
    <div className="space-y-6">
      {/* Top header: Rung graphic + PURPOSE card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
        <div className="flex md:justify-start justify-center">
          <img src={RUNG_ART.IA_4_3} alt="" aria-hidden className="w-[180px] h-auto select-none pointer-events-none" style={{ opacity: 0.95 }} />
        </div>
        <div className="rounded-xl border border-purple-200 bg-purple-50 p-4">
          <div className="text-sm font-semibold text-purple-800">PURPOSE</div>
          <p className="text-gray-700 text-sm mt-1">
            Build directly on your visualization. Ask AI for one stretch, then picture how stepping into it would feel.
          </p>
        </div>
      </div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="max-w-[680px]"><h3 className="text-xl font-semibold">ACTIVITY</h3></div>
        <img src={RUNG_ART.IA_4_3} alt="Rung 2 highlighted" className="w-40 h-auto select-none pointer-events-none" />
      </div>

      {/* Step 1 — Assumptions */}
      <div className="space-y-2">
        <label htmlFor="ia43-assumptions" className="text-sm font-medium text-gray-800">What assumptions might you be making about this challenge?</label>
        <Textarea id="ia43-assumptions" rows={3} placeholder="List one or more assumptions in your own words…"
          value={assumptions}
          onChange={(e) => setStep('ia_4_3', { ...s, assumptions: e.target.value })}
        />
      </div>

      {/* Step 2 — AI chat (gated) */}
      {seed.trim() ? (
        <InlineChat trainingId="ia-4-3" systemPrompt={PROMPTS.IA_4_3} seed={seed}
          onReply={(reply) => {
            const arr = Array.isArray(s.ai_assumptions) ? s.ai_assumptions.slice() : [];
            const text = String(reply || '').trim();
            if (text) arr.push(text);
            setStep('ia_4_3', { ...s, ai_assumptions: arr });
          }}
        />
      ) : (
        <div className="text-sm text-gray-600">Start by listing at least one assumption above.</div>
      )}

      {/* Step 3 — Reflection */}
      <div className="space-y-2">
        <label htmlFor="ia43-insight" className="text-sm font-medium text-gray-800">Did the AI help you notice any blind spots or new possibilities?</label>
        <Textarea id="ia43-insight" rows={3} placeholder="Write a few lines about what you noticed…"
          value={s.user_insight || ''}
          onChange={(e) => setStep('ia_4_3', { ...s, user_insight: e.target.value })}
        />
      </div>

      {/* Step 4 — Tag insight */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-800">Tag this insight</label>
        <Select value={s.tag || ''} onValueChange={(v) => setStep('ia_4_3', { ...s, tag: v })}>
          <SelectTrigger className="w-full"><SelectValue placeholder="Choose a tag" /></SelectTrigger>
          <SelectContent>
            {['Blind Spot','Possibility','Curiosity','Challenge','Insight','Other'].map(opt => (
              <SelectItem key={opt} value={opt}>{opt}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Step 5 — Updated perspective */}
      <div className="space-y-2">
        <label htmlFor="ia43-updated" className="text-sm font-medium text-gray-800">What’s a new way you could approach this challenge?</label>
        <Textarea id="ia43-updated" rows={3} placeholder="Describe a new approach or posture…"
          value={s.updated_perspective || ''}
          onChange={(e) => setStep('ia_4_3', { ...s, updated_perspective: e.target.value })}
        />
      </div>
    </div>
  );
}
