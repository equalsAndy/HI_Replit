import * as React from 'react';
import { useContinuity } from '@/hooks/useContinuity';
import { Button } from '@/components/ui/button';
import { ReframeModal } from './ReframeModal';
import { CapabilitySelector } from '@/components/ia/CapabilitySelector';
import { CapabilityType } from '@/lib/types';

function formatCapabilityList(caps: string[]): string {
  if (caps.length === 0) return '';
  if (caps.length === 1) return caps[0];
  if (caps.length === 2) return `${caps[0]} and ${caps[1]}`;
  return caps.slice(0, -1).join(', ') + ', and ' + caps[caps.length - 1];
}

function wordCount(text?: string): number {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(w => w.length > 0).length;
}

function SaveImagineButton({ onSave }: { onSave: () => void }) {
  const [saved, setSaved] = React.useState(false);

  const handleSave = () => {
    onSave();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <button
      onClick={handleSave}
      className={`mt-3 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
        saved
          ? 'bg-green-100 text-green-700 border border-green-300'
          : 'bg-purple-600 text-white hover:bg-purple-700'
      }`}
    >
      {saved ? '✓ Saved' : 'Save'}
    </button>
  );
}

export default function ReframeExercise() {
  const { state, setState, loading, saveNow } = useContinuity();
  const [modalOpen, setModalOpen] = React.useState(false);
  const newPerspectiveRef = React.useRef<HTMLTextAreaElement | null>(null);

  // Normalize ia_4_2 with a fallback (safe access even if state is null)
  const ia = state?.ia_4_2 ?? {};

  // Ensure ai_reframe is always an array
  React.useEffect(() => {
    if (state && !Array.isArray(ia.ai_reframe)) {
      setState((prev) => ({
        ...prev,
        ia_4_2: {
          ...(prev.ia_4_2 || {}),
          ai_reframe: typeof ia.ai_reframe === 'string' ? [ia.ai_reframe] : [],
        },
      }));
    }
  }, [ia.ai_reframe, state]);

  React.useEffect(() => {
    if (!modalOpen && newPerspectiveRef.current) {
      newPerspectiveRef.current.focus();
    }
  }, [modalOpen]);

  // Early return AFTER all hooks are called
  if (loading || !state) return null;

  const challenge = (ia.challenge ?? ia.original_thought ?? '').toString();

  const isChallengeValid = challenge.trim().length >= 8;

  function openModal() {
    if (isChallengeValid) setModalOpen(true);
  }

  function onModalOpenChange(open: boolean) {
    setModalOpen(open);
  }

  function onModalApply(result: { transcript: string[]; shift: string; tag: string; reframe: string; testedCapability: string; capabilityInsight: string }) {
    setState((prev) => {
      const prevIA = prev.ia_4_2 || {};
      return {
        ...prev,
        ia_4_2: {
          ...prevIA,
          ai_reframe: [
            ...(Array.isArray(prevIA.ai_reframe)
              ? prevIA.ai_reframe
              : prevIA.ai_reframe
              ? [String(prevIA.ai_reframe)]
              : []),
            ...result.transcript.map(String),
          ],
          user_shift: result.shift,
          tag: result.tag,
          new_perspective: result.reframe,
          original_thought: challenge,
          tested_capability: result.testedCapability,
          capability_insight: result.capabilityInsight,
        },
      };
    });
    // Save immediately so modal results survive refresh/navigation
    setTimeout(() => saveNow(), 0);
    setModalOpen(false);
  }

  function onModalStartOver() {
    if (window.confirm('Are you sure you want to start over? This will clear your challenge and AI chat.')) {
      setState((prev) => ({
        ...prev,
        ia_4_2: {
          original_thought: '',
          ai_reframe: [],
          user_shift: '',
          tag: '',
          new_perspective: '',
          shift: '',
          challenge: '',
          capabilities_applied: [],
          capabilities_imagine: '',
          tested_capability: '',
          capability_insight: '',
        },
      }));
      setModalOpen(false);
    }
  }

  function onModalKeepContext() {
    setModalOpen(false);
  }

  return (
    <>
      {/* Step 1: Settle — echoes ia-3-2 step box style */}
      <div className="p-4 rounded-lg border-2 border-purple-300 bg-purple-50 mb-4">
        <h3 className="font-semibold text-purple-700 mb-3">1. Settle (15 seconds)</h3>
        <p className="text-gray-700">Sit comfortably.</p>
        <p className="text-gray-700">Take one slow breath in… and out.</p>
        <p className="text-gray-700 mt-2 text-sm italic">
          In your first Autoflow exercise, you practiced noticing whatever arose — without directing it. Anything was fine.
          This exercise uses that same settling skill, but now you&apos;re bringing it somewhere specific.
        </p>
      </div>

      {/* Step 2: Notice */}
      <div className="p-4 rounded-lg border-2 border-purple-300 bg-purple-50 mb-4">
        <h3 className="font-semibold text-purple-700 mb-3">2. Notice (20–30 seconds)</h3>
        <p className="text-gray-700 mb-2">Let your attention drift toward work or school.</p>
        <p className="text-gray-700 mb-2">Think of something that feels unresolved — a situation, a relationship, a project, or a pattern that keeps coming up.</p>
        <p className="text-gray-700 mb-2">It might be:</p>
        <ul className="list-disc pl-6 space-y-1 text-gray-700 mb-3">
          <li>A dynamic with someone that feels difficult</li>
          <li>A project or role that feels draining or stuck</li>
          <li>Something you&apos;re not sure how to move through</li>
          <li>A situation that keeps coming back to you</li>
        </ul>
        <p className="text-gray-700 italic">Notice the one that has a little weight to it.</p>
      </div>

      {/* Step 3: Describe — textarea with privacy note as caption */}
      <div className="p-4 rounded-lg border-2 border-purple-300 bg-purple-50 mb-6">
        <h3 className="font-semibold text-purple-700 mb-3">3. Describe your challenge (2–3 sentences)</h3>
        <p className="text-gray-700 mb-4">
          Write enough that the AI can understand the situation. Don&apos;t edit — just capture it plainly.
        </p>
        <textarea
          id="challenge-textarea"
          className="w-full border border-gray-300 rounded p-2 resize-y bg-white"
          rows={5}
          value={challenge}
          onChange={(e) =>
            setState((prev) => ({
              ...prev,
              ia_4_2: {
                ...(prev.ia_4_2 || {}),
                challenge: e.target.value,
              },
            }))
          }
          aria-describedby="challenge-hint"
        />
        <p id="challenge-hint" className="mt-2 text-sm text-gray-500 flex items-start gap-1">
          <span>🔒</span>
          <span>
            <strong className="text-gray-700">This is private</strong> — never visible to your manager, instructor, or colleagues.
            Still, it is always wise to use general terms rather than names: &ldquo;a colleague,&rdquo; &ldquo;my team,&rdquo; &ldquo;a project I&apos;m on.&rdquo;
            People&apos;s names can get in the way of solutions, and AI doesn&apos;t know anything about them that you don&apos;t tell it.
          </span>
        </p>
      </div>

      <div className="mb-6">
        <Button onClick={openModal} disabled={!isChallengeValid}>
          Work with AI to reframe this
        </Button>
      </div>

      <ReframeModal
        open={modalOpen}
        onOpenChange={onModalOpenChange}
        challenge={challenge}
        onApply={onModalApply}
        onStartOver={onModalStartOver}
        onKeepContext={onModalKeepContext}
      />

      {/* Post-modal content — only show after modal completion */}
      {(ia.new_perspective || ia.user_shift || ia.tag) && (
        <>
          {/* Exercise summary — what just happened */}
          <div className="mb-5 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg">
            <h3 className="font-semibold text-purple-800 mb-2">What you just did</h3>
            <p className="text-sm text-gray-700 leading-relaxed">
              You took a real challenge and worked with AI to <strong>reframe</strong> it — not to make it disappear,
              but to see it from an angle that reveals something useful: leverage, clarity, or a better question.
              Then you named what shifted and tested what one of your capabilities could do with that new perspective.
              Below is everything that came out of that process. You can edit your new perspective if you want to refine it.
            </p>
          </div>

          {/* 1. New Perspective */}
          <div className="mb-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <h3 className="text-sm font-semibold uppercase text-purple-700 mb-2">New Perspective</h3>
            <textarea
              ref={newPerspectiveRef}
              className="w-full border border-gray-300 rounded p-2 resize-y bg-white"
              rows={3}
              value={ia.new_perspective ?? ''}
              onChange={(e) =>
                setState((prev) => ({
                  ...prev,
                  ia_4_2: { ...(prev.ia_4_2 || {}), new_perspective: e.target.value },
                }))
              }
            />
            <p className="mt-1 text-xs text-gray-500">Edit if you'd like to refine the wording.</p>
          </div>

          {/* 2. What Shifted */}
          {ia.user_shift && (
            <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <h3 className="text-sm font-semibold uppercase text-gray-600 mb-2">What Shifted</h3>
              <p className="text-base text-gray-800 italic">"{ia.user_shift}"</p>
            </div>
          )}

          {/* 3. What Reframing Gave You */}
          {ia.tag && (
            <div className="mb-6 p-3 bg-purple-50/50 border border-purple-100 rounded-lg">
              <h3 className="text-xs font-semibold uppercase text-gray-500 mb-1">What reframing gave you</h3>
              <span className="inline-block bg-purple-100 text-purple-800 text-sm px-3 py-1 rounded-full font-medium">
                {ia.tag}
              </span>
            </div>
          )}

          {/* 3b. Capability you explored in the modal */}
          {ia.tested_capability && ia.capability_insight && (
            <div className="mb-4 p-3 bg-purple-50/50 border border-purple-100 rounded-lg">
              <h3 className="text-xs font-semibold uppercase text-gray-500 mb-1">
                You explored: {ia.tested_capability}
              </h3>
              <p className="text-sm text-gray-700 italic">"{ia.capability_insight}"</p>
            </div>
          )}

          {/* 4. Capabilities in Action — REQUIRED */}
          <div className="mb-6 p-4 bg-white border-2 border-purple-300 rounded-lg">
            <h3 className="font-semibold text-purple-700 mb-1">Capabilities in Action</h3>
            <p className="text-sm text-gray-600 mb-3">
              In real life, capabilities don&apos;t work in isolation — and most of the time we act
              without thinking about which ones we&apos;re drawing on. This exercise reverses that on purpose.
              In the reframe conversation you tested one. Now pick at least two and imagine what
              happens when you deliberately combine them.
            </p>

            <CapabilitySelector
              mode="multi"
              minSelections={2}
              selected={ia.capabilities_applied ?? []}
              onSelect={(val) => {
                const caps = Array.isArray(val) ? val : [val];
                setState((prev) => ({
                  ...prev,
                  ia_4_2: { ...(prev.ia_4_2 || {}), capabilities_applied: caps as CapabilityType[] },
                }));
                setTimeout(() => saveNow(), 0);
              }}
              prompt="Which capabilities would you bring to this challenge?"
              className="mb-4"
            />

            {/* Dynamic "I imagine" prompt — appears after 2+ capabilities selected */}
            {Array.isArray(ia.capabilities_applied) && ia.capabilities_applied.length >= 2 && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  If I brought{' '}
                  <span className="font-semibold text-purple-700">
                    {formatCapabilityList(ia.capabilities_applied)}
                  </span>
                  {' '}to this challenge, I imagine...
                </label>
                <textarea
                  className="w-full border border-gray-300 rounded p-3 resize-y bg-white"
                  rows={4}
                  placeholder="Complete this thought — what do you imagine might happen?"
                  value={ia.capabilities_imagine ?? ''}
                  onChange={(e) =>
                    setState((prev) => ({
                      ...prev,
                      ia_4_2: { ...(prev.ia_4_2 || {}), capabilities_imagine: e.target.value },
                    }))
                  }
                  onBlur={() => saveNow()}
                />
                <p className="mt-1 text-xs text-gray-500">
                  {wordCount(ia.capabilities_imagine) < 15
                    ? `${wordCount(ia.capabilities_imagine)} words — write at least 15`
                    : `${wordCount(ia.capabilities_imagine)} words`}
                </p>
                {wordCount(ia.capabilities_imagine) >= 15 && (
                  <SaveImagineButton onSave={saveNow} />
                )}
              </div>
            )}

            {/* Completion gate warning */}
            {(!ia.capabilities_applied ||
              (Array.isArray(ia.capabilities_applied) && ia.capabilities_applied.length < 2) ||
              !ia.capabilities_imagine ||
              wordCount(ia.capabilities_imagine) < 15) && (
              <p className="mt-3 text-xs font-semibold text-amber-600 flex items-center gap-1">
                <span>⚠</span> Required to continue
              </p>
            )}
          </div>
        </>
      )}
    </>
  );
}