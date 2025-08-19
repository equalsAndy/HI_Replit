import React, { useMemo } from 'react';
import { useContinuity } from '@/hooks/useContinuity';
import InlineChat from '@/components/ia/InlineChat';
import { PROMPTS } from '@/constants/prompts';
import { RUNG_ART } from '@/constants/rungArt';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';

export default function MuseExercise() {
  const { state, setStep } = useContinuity();
  const s = state.ia_4_4 || {};
  const positive = s.positive_outcome || '';
  const seed = useMemo(() => positive, [positive]);

  function appendMuseReply(reply: string) {
    const arr = Array.isArray(s.muse_chat) ? s.muse_chat.slice() : [];
    const text = String(reply || '').trim();
    if (text) arr.push(text);
    setStep('ia_4_4', { ...s, muse_chat: arr });
  }

  return (
    <div className="space-y-6">
      {/* Top header: Rung graphic + PURPOSE card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
        <div className="flex md:justify-start justify-center">
          <img src={RUNG_ART.IA_4_4} alt="" aria-hidden className="w-[180px] h-auto select-none pointer-events-none" style={{ opacity: 0.95 }} />
        </div>
        <div className="rounded-xl border border-purple-200 bg-purple-50 p-4">
          <div className="text-sm font-semibold text-purple-800">PURPOSE</div>
          <p className="text-gray-700 text-sm mt-1">
            Deepen your relationship with inspiration. Invite a helpful ‘Muse’ voice and converse with it for a few minutes.
          </p>
        </div>
      </div>

      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="max-w-[680px]"><h3 className="text-xl font-semibold">ACTIVITY</h3></div>
        <img src={RUNG_ART.IA_4_4} alt="Rung 3 highlighted" className="w-40 h-auto select-none pointer-events-none" />
      </div>

      {/* Step 1 — Positive outcome */}
      <div className="space-y-2">
        <label htmlFor="ia44-positive" className="text-sm font-medium text-gray-800">What would a positive outcome look like for this challenge?</label>
        <Textarea id="ia44-positive" rows={3}
          value={positive}
          onChange={(e) => setStep('ia_4_4', { ...s, positive_outcome: e.target.value })}
          placeholder="Describe a positive outcome in a few lines…"
        />
      </div>

      {/* Step 2 — AI chat (gated) */}
      {seed.trim() ? (
        <InlineChat trainingId="ia-4-4" systemPrompt={PROMPTS.IA_4_4} seed={seed}
          onReply={(reply) => {
            const arr = Array.isArray(s.ai_outcome) ? s.ai_outcome.slice() : [];
            const text = String(reply || '').trim();
            if (text) arr.push(text);
            setStep('ia_4_4', { ...s, ai_outcome: arr });
          }}
        />
      ) : (
        <div className="text-sm text-gray-600">Describe a positive outcome above to begin.</div>
      )}

      {/* Step 3 — Reflection */}
      <div className="space-y-2">
        <label htmlFor="ia44-possibility" className="text-sm font-medium text-gray-800">Did the AI help you see an even bigger or more inspiring possibility?</label>
        <Textarea id="ia44-possibility" rows={3}
          value={s.user_possibility || ''}
          onChange={(e) => setStep('ia_4_4', { ...s, user_possibility: e.target.value })}
        />
      </div>
      {/* Step 4 — Tag */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-800">Tag this possibility</label>
        <select className="w-full border rounded p-2"
          value={s.tag || ''}
          onChange={(e) => setStep('ia_4_4', { ...s, tag: e.target.value })}
        >
          {['Possibility','Inspiration','Stretch','Hope','Insight','Other'].map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>

      {/* Step 5 — Expanded vision */}
      <div className="space-y-2">
        <label htmlFor="ia44-expanded" className="text-sm font-medium text-gray-800">Describe your expanded vision</label>
        <Textarea id="ia44-expanded" rows={3}
          value={s.expanded_vision || ''}
          onChange={(e) => setStep('ia_4_4', { ...s, expanded_vision: e.target.value })}
        />
      </div>
    </div>
  );
}
