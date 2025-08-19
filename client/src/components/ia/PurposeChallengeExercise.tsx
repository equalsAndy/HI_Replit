import React, { useMemo } from 'react';
import { useContinuity } from '@/hooks/useContinuity';
import InlineChat from '@/components/ia/InlineChat';
import { PROMPTS } from '@/constants/prompts';
import { RUNG_ART } from '@/constants/rungArt';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

export default function PurposeChallengeExercise() {
  const { state, setStep } = useContinuity();
  const s = state.ia_4_5 || {};
  const nextStep = s.next_step || '';
  const seed = useMemo(() => nextStep, [nextStep]);

  return (
    <div className="space-y-6">
      {/* Top header: Rung graphic + PURPOSE card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
        <div className="flex md:justify-start justify-center">
          <img src={RUNG_ART.IA_4_5} alt="" aria-hidden className="w-[180px] h-auto select-none pointer-events-none" style={{ opacity: 0.95 }} />
        </div>
        <div className="rounded-xl border border-purple-200 bg-purple-50 p-4">
          <div className="text-sm font-semibold text-purple-800">PURPOSE</div>
          <p className="text-gray-700 text-sm mt-1">
            Connect your purpose with a real-world need. Use AI for unexpected angles, then imagine a modest contribution.
          </p>
        </div>
      </div>

      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="max-w-[680px]"><h3 className="text-xl font-semibold">ACTIVITY</h3></div>
        <img src={RUNG_ART.IA_4_5} alt="Rung 4 highlighted" className="w-40 h-auto select-none pointer-events-none" />
      </div>

      {/* Step 1 — Next step */}
      <div className="space-y-2">
        <label htmlFor="ia45-next" className="text-sm font-medium text-gray-800">What’s one step you could take toward this outcome?</label>
        <Textarea id="ia45-next" rows={2}
          value={nextStep}
          onChange={(e) => setStep('ia_4_5', { ...s, next_step: e.target.value })}
          placeholder="Describe one small next step…"
        />
      </div>

      {/* Step 2 — AI chat (gated) */}
      {seed.trim() ? (
        <InlineChat trainingId="ia-4-5" systemPrompt={PROMPTS.IA_4_5} seed={seed}
          onReply={(reply) => {
            const arr = Array.isArray(s.ai_action) ? s.ai_action.slice() : [];
            const text = String(reply || '').trim();
            if (text) arr.push(text);
            setStep('ia_4_5', { ...s, ai_action: arr });
          }}
        />
      ) : (
        <div className="text-sm text-gray-600">Start by writing one next step above.</div>
      )}

      {/* Step 3 — Reflection */}
      <div className="space-y-2">
        <label htmlFor="ia45-clarity" className="text-sm font-medium text-gray-800">Did the AI help you clarify or expand your plan?</label>
        <Textarea id="ia45-clarity" rows={3}
          value={s.user_clarity || ''}
          onChange={(e) => setStep('ia_4_5', { ...s, user_clarity: e.target.value })}
        />
      </div>

      {/* Step 4 — Tag */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-800">Tag this action</label>
        <select className="w-full border rounded p-2" value={s.tag || ''} onChange={(e) => setStep('ia_4_5', { ...s, tag: e.target.value })}>
          {['Action','Plan','Clarity','Motivation','Insight','Other'].map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>

      {/* Step 5 — Commitment */}
      <div className="space-y-2">
        <label htmlFor="ia45-commit" className="text-sm font-medium text-gray-800">What will you do next?</label>
        <Textarea id="ia45-commit" rows={3}
          value={s.commitment || ''}
          onChange={(e) => setStep('ia_4_5', { ...s, commitment: e.target.value })}
        />
      </div>
    </div>
  );
}
