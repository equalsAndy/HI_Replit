import * as React from 'react';
import { useContinuity } from '@/hooks/useContinuity';
import { Button } from '@/components/ui/button';
import { ReframeModal } from './ReframeModal';

export default function ReframeExercise() {
  const { state, setState, loading } = useContinuity();
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

  function onModalApply(result: { transcript: string[]; shift: string; tag: stri
ng }) {
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
          original_thought: challenge,
        },
      };
    });
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
      <div className="mb-4">
        <label htmlFor="challenge-textarea" className="block mb-1 font-medium text-gray-900">
          Your work challenge
        </label>
        <textarea
          id="challenge-textarea"
          className="w-full border border-gray-300 rounded p-2 resize-y"
          rows={4}
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
        <p id="challenge-hint" className="mt-1 text-xs text-gray-600">
          Write your challenge first. When you're ready, invite AI to help you reframe it.
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
        <p id="new-perspective-desc" className="mt-1 text-xs text-gray-600">
          Edit your new perspective as needed.
        </p>
      </div>
    </>
  );
}