import * as React from 'react';
import { useContinuity } from '@/hooks/useContinuity';
import { Button } from '@/components/ui/button';
import { ReframeModal } from './ReframeModal';
import { CapabilitiesExplorerModal, ExplorerRound } from './CapabilitiesExplorerModal';
import { CAPABILITY_LABELS, CAPABILITY_COLORS } from '@/lib/types';

function formatCapabilityList(caps: string[]): string {
  if (caps.length === 0) return '';
  if (caps.length === 1) return caps[0];
  if (caps.length === 2) return `${caps[0]} and ${caps[1]}`;
  return caps.slice(0, -1).join(', ') + ', and ' + caps[caps.length - 1];
}

export default function ReframeExercise() {
  const { state, setState, loading, saveNow } = useContinuity();
  const [modalOpen, setModalOpen] = React.useState(false);
  const [explorerOpen, setExplorerOpen] = React.useState(false);
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
    setTimeout(() => saveNow(), 0);
    setModalOpen(false);
  }

  function onExplorerComplete(result: { rounds: ExplorerRound[]; chosen: ExplorerRound }) {
    setState((prev) => ({
      ...prev,
      ia_4_2: {
        ...(prev.ia_4_2 || {}),
        explorer_rounds: result.rounds,
        explorer_chosen: result.chosen,
      },
    }));
    setTimeout(() => saveNow(), 0);
    setExplorerOpen(false);
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
          instinct_approach: '',
          explorer_rounds: [],
          explorer_chosen: null,
          explorer_reflection: '',
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

      <CapabilitiesExplorerModal
        open={explorerOpen}
        onOpenChange={setExplorerOpen}
        reframedChallenge={ia.new_perspective ?? ''}
        originalChallenge={challenge}
        onComplete={onExplorerComplete}
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
              Then you named what actually shifted.
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

          {/* 4. Your Instinct — capture gut response before capabilities exploration */}
          <div className="mb-6 p-4 bg-white border-2 border-purple-300 rounded-lg">
            <h3 className="font-semibold text-purple-700 mb-1">Your Instinct</h3>
            <p className="text-sm text-gray-600 mb-3">
              With your new perspective, what&apos;s your first instinct for a next step? Don&apos;t overthink it — just capture your gut response.
            </p>
            <textarea
              className="w-full border border-gray-300 rounded p-3 resize-y bg-white"
              rows={3}
              placeholder="My first instinct is..."
              value={ia.instinct_approach ?? ''}
              onChange={(e) =>
                setState((prev) => ({
                  ...prev,
                  ia_4_2: { ...(prev.ia_4_2 || {}), instinct_approach: e.target.value },
                }))
              }
              onBlur={() => saveNow()}
            />
            <p className="mt-1 text-xs text-gray-500">
              {(ia.instinct_approach ?? '').trim().length < 8
                ? `${(ia.instinct_approach ?? '').trim().length} characters — write at least 8`
                : `${(ia.instinct_approach ?? '').trim().length} characters`}
            </p>
          </div>

          {/* 5. Explore with Capabilities button — gated on instinct >= 8 chars */}
          {(ia.instinct_approach ?? '').trim().length >= 8 && !ia.explorer_chosen && (
            <div className="mb-6">
              <Button
                onClick={() => setExplorerOpen(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                Explore with Capabilities
              </Button>
            </div>
          )}

          {/* 6. What the Capabilities Revealed — shows after explorer completion */}
          {ia.explorer_chosen && (
            <div className="mb-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <h3 className="text-sm font-semibold uppercase text-purple-700 mb-2">What the Capabilities Revealed</h3>
              {ia.explorer_rounds && ia.explorer_rounds.length > 0 && (
                <p className="text-xs text-gray-500 mb-2">
                  You explored {ia.explorer_rounds.length} combination{ia.explorer_rounds.length > 1 ? 's' : ''}.
                  You chose {formatCapabilityList(ia.explorer_chosen.capabilities.map((c: string) => CAPABILITY_LABELS[c as keyof typeof CAPABILITY_LABELS] || c))}:
                </p>
              )}
              <div className="flex gap-1.5 mb-2">
                {ia.explorer_chosen.capabilities.map((cap: string) => {
                  const color = CAPABILITY_COLORS[cap as keyof typeof CAPABILITY_COLORS] || 'purple';
                  const bgClass = color === 'green' ? 'bg-green-100 text-green-700'
                    : color === 'blue' ? 'bg-blue-100 text-blue-700'
                    : color === 'orange' ? 'bg-orange-100 text-orange-700'
                    : color === 'red' ? 'bg-red-100 text-red-700'
                    : 'bg-purple-100 text-purple-700';
                  return (
                    <span key={cap} className={`text-xs font-medium px-2.5 py-1 rounded-full ${bgClass}`}>
                      {CAPABILITY_LABELS[cap as keyof typeof CAPABILITY_LABELS] || cap}
                    </span>
                  );
                })}
              </div>
              <p className="text-sm text-gray-800">{ia.explorer_chosen.ai_response}</p>

              {/* Re-explore button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setExplorerOpen(true)}
                className="mt-3 text-purple-600 border-purple-300"
              >
                Explore again
              </Button>
            </div>
          )}

          {/* 7. The Comparison — instinct vs chosen capability approach */}
          {ia.explorer_chosen && ia.instinct_approach && (
            <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <h4 className="text-xs font-semibold uppercase text-gray-500 mb-2">Your first instinct</h4>
                <p className="text-sm text-gray-700">{ia.instinct_approach}</p>
              </div>
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <h4 className="text-xs font-semibold uppercase text-purple-600 mb-2">
                  Through {formatCapabilityList(ia.explorer_chosen.capabilities.map((c: string) => CAPABILITY_LABELS[c as keyof typeof CAPABILITY_LABELS] || c))}
                </h4>
                <p className="text-sm text-gray-800">{ia.explorer_chosen.ai_response}</p>
              </div>
            </div>
          )}

          {/* 8. Reflection — post-exploration */}
          {ia.explorer_chosen && (
            <div className="mb-6 p-4 bg-white border-2 border-purple-300 rounded-lg">
              <h3 className="font-semibold text-purple-700 mb-1">Reflection</h3>
              <p className="text-sm text-gray-600 mb-3">
                What stood out to you about the approach you chose?
              </p>
              <textarea
                className="w-full border border-gray-300 rounded p-3 resize-y bg-white"
                rows={3}
                placeholder="What stands out when you compare these two approaches?"
                value={ia.explorer_reflection ?? ''}
                onChange={(e) =>
                  setState((prev) => ({
                    ...prev,
                    ia_4_2: { ...(prev.ia_4_2 || {}), explorer_reflection: e.target.value },
                  }))
                }
                onBlur={() => saveNow()}
              />
              <p className="mt-1 text-xs text-gray-500">
                {(ia.explorer_reflection ?? '').trim().length < 10
                  ? `${(ia.explorer_reflection ?? '').trim().length} characters — write at least 10`
                  : `${(ia.explorer_reflection ?? '').trim().length} characters`}
              </p>
            </div>
          )}
        </>
      )}
    </>
  );
}