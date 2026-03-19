import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useWorkshopStepData } from '@/hooks/useWorkshopStepData';
import { useContinuity } from '@/hooks/useContinuity';
import { GlobalPurposeBridgeModal } from './GlobalPurposeBridgeModal';
import { Globe, Target } from 'lucide-react';
import { useWorkshopStatus } from '@/hooks/use-workshop-status';

const TAG_OPTIONS = [
  { value: 'Bigger Than I Thought',           label: 'Bigger than I thought',           helper: 'My intention isn\'t small \u2014 it connects to something real.' },
  { value: 'A New Lens',                      label: 'A new lens',                      helper: 'I see my own situation differently now.' },
  { value: 'Something I Didnt Know I Cared About', label: 'Something I didn\'t know I cared about', helper: 'The stretch revealed a dimension I wasn\'t seeing.' },
  { value: 'Clearer Conviction',              label: 'Clearer conviction',              helper: 'I know why this matters to me now, not just that it does.' },
];

// IA-3-4 data for higher purpose
interface IA34StepData {
  whyReflection: string;
  howReflection: string;
  whatReflection: string;
  nextStep: string;
}

export default function GlobalPurposeBridgeExercise() {
  const { state, setState, saveNow } = useContinuity();
  const { isWorkshopLocked } = useWorkshopStatus();
  const isStepLocked = isWorkshopLocked('ia', 'ia-4-4');
  const [modalOpen, setModalOpen] = React.useState(false);

  const { data: ia34Data } = useWorkshopStepData<IA34StepData>('ia', 'ia-3-4', {
    whyReflection: '',
    howReflection: '',
    whatReflection: '',
    nextStep: ''
  });

  // Normalize state
  const ia = state?.ia_4_4 ?? {};
  const higherPurposeFromIA34 = ia34Data?.whyReflection || '';

  // Pre-modal state
  const [higherPurpose, setHigherPurpose] = React.useState(ia.higher_purpose || '');
  const [selectedChallenge, setSelectedChallenge] = React.useState(ia.global_challenge || '');
  const [customChallenge, setCustomChallenge] = React.useState('');

  const globalChallenges = [
    'Climate Change and Environmental Degradation',
    'Inequality and Global Poverty',
    'Artificial Intelligence and Technological Ethics',
    'Disinformation and Erosion of Truth',
    'Human Rights in Conflict and Crisis',
    'The Future of Work and Human Purpose',
    'Global Education and Access to Knowledge',
    'Mental Health and Psychological Safety',
  ];

  const effectivePurpose = higherPurpose.trim() || higherPurposeFromIA34;
  const effectiveChallenge = customChallenge.trim() || selectedChallenge;
  const isReadyForAI = Boolean(effectivePurpose && effectiveChallenge);

  // Is the modal work done? (reframed_view populated)
  const isModalDone = Boolean(ia.reframed_view);

  // Helpers
  const wordCount = (text?: string) => (text || '').trim().split(/\s+/).filter(Boolean).length;

  // Challenge handlers
  const handleChallengeSelect = (challenge: string) => {
    setSelectedChallenge(challenge);
    setCustomChallenge('');
  };
  const handleCustomChallengeChange = (value: string) => {
    setCustomChallenge(value);
    if (value.trim()) setSelectedChallenge('');
  };

  // Open modal
  const handleOpenModal = () => {
    if (!isReadyForAI) return;
    setState((prev) => ({
      ...prev,
      ia_4_4: {
        ...prev.ia_4_4,
        higher_purpose: effectivePurpose,
        global_challenge: effectiveChallenge,
      }
    }));
    setModalOpen(true);
  };

  // Modal completion
  const handleModalComplete = (results: {
    reframedView: string;
    question1: string;
    question2: string;
    observation: string;
    aiReflection: string;
    transcript: string[];
  }) => {
    setState((prev) => ({
      ...prev,
      ia_4_4: {
        ...prev.ia_4_4,
        higher_purpose: effectivePurpose,
        global_challenge: effectiveChallenge,
        reframed_view: results.reframedView,
        question1: results.question1,
        question2: results.question2,
        observation: results.observation,
        ai_reflection: results.aiReflection,
        transcript: results.transcript,
        last_updated: new Date().toISOString(),
      }
    }));
    setTimeout(() => saveNow(), 0);
    setModalOpen(false);
  };

  // Completion gate: tag + 20+ words in "what changed" reflection
  const reflectionWords = wordCount(ia.intention_reflection);
  const isComplete = Boolean(ia.tag) && reflectionWords >= 20;

  return (
    <>
      {/* ═══════════ PRE-MODAL: Intro + Steps 1 & 2 ═══════════ */}

      {/* Exercise introduction */}
      <div className="mb-8 p-6 bg-gradient-to-br from-purple-50 via-indigo-50 to-purple-50 border border-purple-200 rounded-xl">
        <p className="text-[15px] text-gray-700 leading-relaxed mb-3">
          In Module 3, you clarified what you care about and where you're headed. Now we're going to stretch that &mdash; <em>deliberately too far.</em>
        </p>
        <p className="text-[15px] text-gray-700 leading-relaxed mb-3">
          You'll connect your purpose to a global challenge. Not because anyone expects you to solve it, but because{' '}
          <strong className="text-purple-800">when a problem is bigger than your usual playbook, imagination has to show up.</strong>{' '}
          And when imagination shows up, your capabilities come with it.
        </p>
        <p className="text-[15px] text-gray-700 leading-relaxed">
          AI will be your research partner &mdash; bringing knowledge you don't have so you can explore freely.{' '}
          <strong className="text-purple-800">Your job is to notice what happens inside you when you stretch.</strong>
        </p>
      </div>

      {/* Step 1: Your Intention */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <Target className="w-5 h-5 text-purple-600" />
          Step 1: Your Intention
        </h3>

        {effectivePurpose ? (
          <>
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <p className="text-[15px] text-purple-900 leading-relaxed italic">
                "{effectivePurpose}"
              </p>
              <p className="text-xs text-purple-600 mt-2">From your earlier reflection</p>
            </div>

            <details className="mt-3">
              <summary className="text-sm text-purple-600 cursor-pointer hover:text-purple-800 font-medium">
                &#9998;&#65039; Refine this wording
              </summary>
              <div className="mt-2 space-y-2">
                <Textarea
                  value={higherPurpose}
                  onChange={(e) => setHigherPurpose(e.target.value)}
                  placeholder={effectivePurpose}
                  rows={3}
                  disabled={isStepLocked}
                  readOnly={isStepLocked}
                  className={`text-sm ${isStepLocked ? 'opacity-60 cursor-not-allowed bg-gray-50' : ''}`}
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => setHigherPurpose('')}
                    disabled={isStepLocked}
                    className={`text-xs text-gray-500 hover:text-gray-700 underline ${isStepLocked ? 'opacity-60 cursor-not-allowed' : ''}`}
                  >
                    Reset to original
                  </button>
                </div>
              </div>
            </details>
          </>
        ) : (
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">
              What do you care about deeply? What future would you like to help shape?
            </label>
            <Textarea
              value={higherPurpose}
              onChange={(e) => setHigherPurpose(e.target.value)}
              placeholder="Your deeper intention or core purpose..."
              rows={3}
              disabled={isStepLocked}
              readOnly={isStepLocked}
              className={`text-sm ${isStepLocked ? 'opacity-60 cursor-not-allowed bg-gray-50' : ''}`}
            />
          </div>
        )}
      </div>

      {/* Step 2: Choose a Global Challenge */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <Globe className="w-5 h-5 text-purple-600" />
          Step 2: Pick a Global Challenge
        </h3>

        <p className="text-sm text-gray-600 mb-4">
          Pick one that pulls you &mdash; even if you don't know why.
        </p>

        <div className="space-y-3 mb-4">
          {globalChallenges.map((challenge) => (
            <label
              key={challenge}
              className={`block p-3 rounded-lg border-2 transition-all ${
                isStepLocked ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
              } ${
                selectedChallenge === challenge
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-purple-300'
              }`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="radio"
                  name="globalChallenge"
                  value={challenge}
                  checked={selectedChallenge === challenge}
                  onChange={() => handleChallengeSelect(challenge)}
                  disabled={isStepLocked}
                  className="mt-1"
                />
                <span className="text-sm font-medium text-gray-800">{challenge}</span>
              </div>
            </label>
          ))}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Or write your own:</label>
          <Textarea
            value={customChallenge}
            onChange={(e) => handleCustomChallengeChange(e.target.value)}
            placeholder="Describe a global challenge that draws you in..."
            rows={2}
            disabled={isStepLocked}
            readOnly={isStepLocked}
            className={`text-sm ${isStepLocked ? 'opacity-60 cursor-not-allowed bg-gray-50' : ''}`}
          />
        </div>
      </div>

      {/* Launch Button */}
      <div className="mb-8 text-center">
        {!isReadyForAI ? (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-700 text-sm">
              Complete steps 1 and 2 above to continue.
            </p>
          </div>
        ) : (
          <Button
            onClick={handleOpenModal}
            disabled={isStepLocked}
            className={`bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg ${isStepLocked ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            <Globe className="w-5 h-5 mr-2" />
            {isModalDone ? 'Explore Again' : 'Explore with AI'}
          </Button>
        )}
      </div>

      {/* ═══════════ POST-MODAL: Simplified 5-section layout ═══════════ */}
      {isModalDone && (
        <>
          {/* ── 1. What you just did ── */}
          <div className="mb-6 p-4 border-l-[3px] border-purple-400 bg-purple-50/60 rounded-r-lg">
            <p className="text-sm text-gray-700 leading-relaxed">
              You took your intention to global scale and used AI as a research partner to explore{' '}
              <em>{(ia.global_challenge || effectiveChallenge || 'a global challenge').toLowerCase()}</em>.
              The questions you asked and what drew you to them revealed which of your capabilities naturally showed up.
            </p>
          </div>

          {/* ── 2. The bridge (editable) ── */}
          <div className="mb-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">The bridge</h3>
            <div className="bg-white border-[1.5px] border-purple-200 rounded-lg p-4">
              <textarea
                className={`w-full border-0 bg-transparent text-[15px] text-gray-800 leading-relaxed resize-y focus:outline-none focus:ring-0 min-h-[60px] ${isStepLocked ? 'opacity-60 cursor-not-allowed bg-gray-50' : ''}`}
                rows={2}
                value={ia.reframed_view ?? ''}
                onChange={(e) =>
                  setState((prev) => ({
                    ...prev,
                    ia_4_4: { ...(prev.ia_4_4 || {}), reframed_view: e.target.value },
                  }))
                }
                onBlur={() => saveNow()}
                disabled={isStepLocked}
                readOnly={isStepLocked}
              />
              <p className="text-xs text-gray-400 italic mt-1">✏️ Edit to make this yours</p>
            </div>
          </div>

          {/* ── 3. Tags (quick tap) ── */}
          <div className="mb-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">What did this give you?</h3>
            <div className="space-y-2">
              {TAG_OPTIONS.map(({ value, label, helper }) => (
                <label
                  key={value}
                  className={`flex items-start gap-3 p-3 border-[1.5px] rounded-lg transition-all ${
                    isStepLocked ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
                  } ${
                    ia.tag === value
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300 bg-white'
                  }`}
                >
                  <div className={`w-[18px] h-[18px] rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center ${
                    ia.tag === value ? 'border-purple-500' : 'border-gray-300'
                  }`}>
                    {ia.tag === value && (
                      <div className="w-2 h-2 rounded-full bg-purple-500" />
                    )}
                  </div>
                  <input
                    type="radio"
                    name="tag44"
                    value={value}
                    checked={ia.tag === value}
                    disabled={isStepLocked}
                    onChange={() => {
                      if (isStepLocked) return;
                      setState((prev) => ({
                        ...prev,
                        ia_4_4: { ...(prev.ia_4_4 || {}), tag: value },
                      }));
                      setTimeout(() => saveNow(), 0);
                    }}
                    className="sr-only"
                  />
                  <div>
                    <div className="font-semibold text-sm text-gray-800">{label}</div>
                    <div className="text-[13px] text-gray-500 mt-0.5">{helper}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* ── 4. What changed (THE reflection) ── */}
          <div className="mb-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">What changed</h3>
            <textarea
              className={`w-full border-[1.5px] border-gray-200 rounded-lg p-4 text-sm leading-relaxed resize-y bg-white focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 min-h-[100px] ${isStepLocked ? 'opacity-60 cursor-not-allowed bg-gray-50' : ''}`}
              rows={4}
              placeholder="Now that I've stretched to global scale, when I come back to my intention I notice..."
              value={ia.intention_reflection ?? ''}
              onChange={(e) =>
                setState((prev) => ({
                  ...prev,
                  ia_4_4: { ...(prev.ia_4_4 || {}), intention_reflection: e.target.value },
                }))
              }
              onBlur={() => saveNow()}
              disabled={isStepLocked}
              readOnly={isStepLocked}
            />
            <div className="flex justify-between items-center mt-1.5">
              <p className="text-xs text-gray-400">
                {reflectionWords} word{reflectionWords !== 1 ? 's' : ''} · aim for 20–50
              </p>
              {!isComplete && (
                <p className="text-xs font-medium text-purple-500">✦ Required to continue</p>
              )}
            </div>
          </div>

          {/* ── 5. AI reveal (appears after participant writes their reflection) ── */}
          {ia.ai_reflection && reflectionWords >= 10 && (
            <div
              className="mb-6 bg-green-50/80 border border-green-200 rounded-lg p-4"
              style={{ animation: 'fadeReveal 0.4s ease forwards' }}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-green-700">During the exercise, AI noticed</h3>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">{ia.ai_reflection}</p>
            </div>
          )}

          {/* Inline keyframe for reveal animation */}
          <style>{`
            @keyframes fadeReveal {
              from { opacity: 0; transform: translateY(8px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}</style>
        </>
      )}

      {/* Modal */}
      <GlobalPurposeBridgeModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        higherPurpose={effectivePurpose}
        globalChallenge={effectiveChallenge}
        onComplete={handleModalComplete}
      />
    </>
  );
}
