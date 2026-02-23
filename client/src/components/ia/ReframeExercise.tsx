import * as React from 'react';
import { useContinuity } from '@/hooks/useContinuity';
import { Button } from '@/components/ui/button';
import { ReframeModal } from './ReframeModal';
import { CapabilitySelector } from '@/components/ia/CapabilitySelector';
import { CapabilityType } from '@/lib/types';

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

  function onModalApply(result: { transcript: string[]; shift: string; tag: string; reframe: string }) {
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

      {/* Display AI reframe results if available */}
      {(ia.user_shift || ia.tag) && (
        <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-3">Your AI Reframe Results</h3>
          
          {ia.user_shift && (
            <div className="mb-3">
              <h4 className="text-base font-medium text-gray-700 mb-1">What Shifted:</h4>
              <p className="text-base text-gray-800 italic">"{ia.user_shift}"</p>
            </div>
          )}

          {ia.tag && (
            <div className="mb-3">
              <h4 className="text-base font-medium text-gray-700 mb-1">Tag:</h4>
              <span className="inline-block bg-purple-100 text-purple-800 text-sm px-2 py-1 rounded">
                {ia.tag}
              </span>
            </div>
          )}
          
          {!ia.capability_stretched && (
            <p className="mt-4 mb-1 text-xs font-semibold text-amber-600 flex items-center gap-1">
              <span>⚠</span> Required to continue — select one below
            </p>
          )}
          <CapabilitySelector
            mode="single"
            selected={ia.capability_stretched || null}
            onSelect={(val) => {
              setState((prev) => ({
                ...prev,
                ia_4_2: { ...(prev.ia_4_2 || {}), capability_stretched: val as CapabilityType },
              }));
              // Persist immediately so "Continue" never sees stale data
              setTimeout(() => saveNow(), 0);
            }}
            prompt="Which of your capabilities was most stretched by this exchange?"
            className={ia.capability_stretched ? 'mt-4 mb-2' : 'mt-1 mb-2 ring-2 ring-amber-400'}
          />

        </div>
      )}

      {/* New perspective section - only show after modal completion */}
      {(ia.user_shift || ia.tag) && (
        <div className="mb-4">
          <label htmlFor="new-perspective" className="block mb-1 font-medium text-gray-900">
            Your new perspective
          </label>
          <textarea
            id="new-perspective"
            ref={newPerspectiveRef}
            className="w-full border border-gray-300 rounded p-2 resize-y"
            rows={4}
            value={ia.new_perspective ?? ''}
            onChange={(e) =>
              setState((prev) => ({
                ...prev,
                ia_4_2: {
                  ...(prev.ia_4_2 || {}),
                  new_perspective: e.target.value,
                },
              }))
            }
            aria-describedby="new-perspective-desc"
          />
          <p id="new-perspective-desc" className="mt-1 text-sm text-gray-600">
            Edit your new perspective as needed.
          </p>
        </div>
      )}
    </>
  );
}