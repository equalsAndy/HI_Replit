import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useWorkshopStepData } from '@/hooks/useWorkshopStepData';
import { useContinuity } from '@/hooks/useContinuity';
import { GlobalPurposeBridgeModal } from './GlobalPurposeBridgeModal';
import { Globe, Target } from 'lucide-react';
import { CapabilitySelector } from '@/components/ia/CapabilitySelector';
import { CapabilityType } from '@/lib/types';

const TAG_OPTIONS = [
  { value: 'A Way In',         label: 'A way in',                  helper: 'I can engage with something bigger than my normal scope.' },
  { value: 'Questions I Wouldnt Have Asked', label: 'Questions I wouldn\'t have asked', helper: 'I asked about things I didn\'t know I was drawn to.' },
  { value: 'My Capabilities',  label: 'My capabilities at work',   helper: 'I can see which capabilities I reach for when it matters.' },
  { value: 'A Partnership',    label: 'A partnership',             helper: 'I experienced what human intention + AI knowledge can do together.' },
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
    'Reimagining How Communities Learn Together',
  ];

  const effectivePurpose = higherPurpose.trim() || higherPurposeFromIA34;
  const effectiveChallenge = customChallenge.trim() || selectedChallenge;
  const isReadyForAI = Boolean(effectivePurpose && effectiveChallenge);

  // Is the modal work done? (reframed_view populated)
  const isModalDone = Boolean(ia.reframed_view);

  // Helpers
  const wordCount = (text?: string) => (text || '').trim().split(/\s+/).filter(Boolean).length;
  const formatCapabilityList = (caps: CapabilityType[]) => {
    if (caps.length === 0) return '';
    if (caps.length === 1) return caps[0];
    if (caps.length === 2) return `${caps[0]} and ${caps[1]}`;
    return caps.slice(0, -1).join(', ') + ', and ' + caps[caps.length - 1];
  };

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

  // Modal completion — receives everything except tag + capabilities
  const handleModalComplete = (results: {
    reframedView: string;
    question1: string;
    question2: string;
    aiAnswer1: string;
    aiAnswer2: string;
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
        ai_answer1: results.aiAnswer1,
        ai_answer2: results.aiAnswer2,
        ai_reflection: results.aiReflection,
        transcript: results.transcript,
        last_updated: new Date().toISOString(),
      }
    }));
    setTimeout(() => saveNow(), 0);
    setModalOpen(false);
  };

  return (
    <>
      {/* ═══════════ PRE-MODAL: Steps 1 & 2 ═══════════ */}

      {/* Step 1: Your Intention */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <Target className="w-5 h-5 text-purple-600" />
          Step 1: Your Intention
        </h3>

        {higherPurposeFromIA34 && (
          <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
            <p className="text-sm text-purple-700 font-medium">From your Insight to Intention reflection:</p>
            <p className="text-purple-800 italic">"{higherPurposeFromIA34}"</p>
          </div>
        )}

        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700">
            What core intention did you uncover earlier? Refine or shorten it if you like.
          </label>
          <Textarea
            value={higherPurpose}
            onChange={(e) => setHigherPurpose(e.target.value)}
            placeholder="Your deeper intention or core purpose..."
            rows={3}
            className="text-sm"
          />
          <p className="text-xs text-gray-500">
            {higherPurposeFromIA34 ? "Leave blank to use your earlier intention, or refine it here." : "What do you care about deeply? What future would you like to help shape?"}
          </p>
        </div>
      </div>

      {/* Step 2: Choose a Global Challenge */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <Globe className="w-5 h-5 text-purple-600" />
          Step 2: Pick a Global Challenge
        </h3>

        <p className="text-sm text-gray-600 mb-4">
          Pick one — not because you'll solve it, but because it gives your imagination something big to push against.
        </p>

        <div className="space-y-3 mb-4">
          {globalChallenges.map((challenge) => (
            <label
              key={challenge}
              className={`block p-3 rounded-lg border-2 cursor-pointer transition-all ${
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
            className="text-sm"
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
            className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg"
          >
            <Globe className="w-5 h-5 mr-2" />
            {isModalDone ? 'Explore Again' : 'Explore with AI'}
          </Button>
        )}
      </div>

      {/* ═══════════ POST-MODAL RESULTS ═══════════ */}
      {isModalDone && (
        <>
          {/* "What you just did" block — dynamic with participant's specifics */}
          <div className="mb-5 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg">
            <h3 className="font-semibold text-purple-800 mb-2">What you just did</h3>
            <p className="text-sm text-gray-700 leading-relaxed">
              You took your intention about{' '}
              <em>{(ia.higher_purpose || effectivePurpose || 'what matters to you').toLowerCase()}</em>{' '}
              and put it up against{' '}
              <em>{(ia.global_challenge || effectiveChallenge || 'a global challenge').toLowerCase()}</em>{' '}
              — not because we expect you to solve global problems, but because expansive contexts force your
              capabilities to show up in ways they don't in daily life. The two questions you asked AI weren't
              random — they reveal which capabilities you instinctively reach for when facing something unfamiliar.
              The scenario was practice. What you learned about how you think is real.
            </p>
          </div>

          {/* 1. How you see this challenge (editable) */}
          <div className="mb-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <h3 className="text-sm font-semibold uppercase text-purple-700 mb-2">How you see this challenge</h3>
            <textarea
              className="w-full border border-gray-300 rounded p-2 resize-y bg-white text-sm"
              rows={3}
              value={ia.reframed_view ?? ''}
              onChange={(e) =>
                setState((prev) => ({
                  ...prev,
                  ia_4_4: { ...(prev.ia_4_4 || {}), reframed_view: e.target.value },
                }))
              }
              onBlur={() => saveNow()}
            />
            <p className="mt-1 text-xs text-gray-500">Edit if you'd like to refine the wording.</p>
          </div>

          {/* 2. Your Questions */}
          {(ia.question1 || ia.question2) && (
            <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <h3 className="text-sm font-semibold uppercase text-gray-600 mb-3">Your questions</h3>
              <div className="space-y-2">
                {ia.question1 && (
                  <div className="p-2 bg-white border border-gray-200 rounded text-sm text-gray-800">
                    1. {ia.question1}
                  </div>
                )}
                {ia.question2 && (
                  <div className="p-2 bg-white border border-gray-200 rounded text-sm text-gray-800">
                    2. {ia.question2}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 3. Tag selection — "What did this give you?" (BEFORE AI reflection) */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold uppercase text-gray-600 mb-3">What did this give you?</h3>
            <div className="grid grid-cols-1 gap-2">
              {TAG_OPTIONS.map(({ value, label, helper }) => (
                <label
                  key={value}
                  className={`flex items-start gap-2 cursor-pointer p-3 border-2 rounded-lg transition-all ${
                    ia.tag === value
                      ? 'border-purple-500 bg-purple-50 shadow-sm'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="tag44"
                    value={value}
                    checked={ia.tag === value}
                    onChange={() => {
                      setState((prev) => ({
                        ...prev,
                        ia_4_4: { ...(prev.ia_4_4 || {}), tag: value },
                      }));
                      setTimeout(() => saveNow(), 0);
                    }}
                    className="mt-1"
                  />
                  <div>
                    <div className="font-medium text-sm text-gray-800">{label}</div>
                    <div className="text-xs text-gray-500">{helper}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* 4. Capabilities in Action — REQUIRED (BEFORE AI reflection) */}
          <div className="mb-6 p-4 bg-white border-2 border-purple-300 rounded-lg">
            <h3 className="font-semibold text-purple-700 mb-1">Capabilities in Action</h3>
            <p className="text-sm text-gray-600 mb-3">
              You just explored a challenge at global scale. Which capabilities did you feel activate?
              Pick at least two and imagine what happens when you deliberately combine them on a real challenge.
            </p>

            <CapabilitySelector
              mode="multi"
              minSelections={2}
              selected={ia.capabilities_applied ?? []}
              onSelect={(val) => {
                const caps = Array.isArray(val) ? val : [val];
                setState((prev) => ({
                  ...prev,
                  ia_4_4: { ...(prev.ia_4_4 || {}), capabilities_applied: caps as CapabilityType[] },
                }));
                setTimeout(() => saveNow(), 0);
              }}
              prompt="Which capabilities would you bring to a real challenge at this scale?"
              className="mb-4"
            />

            {/* Dynamic "I imagine" prompt */}
            {Array.isArray(ia.capabilities_applied) && ia.capabilities_applied.length >= 2 && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  If I brought{' '}
                  <span className="font-semibold text-purple-700">
                    {formatCapabilityList(ia.capabilities_applied)}
                  </span>
                  {' '}to a real challenge at this scale, I imagine...
                </label>
                <textarea
                  className="w-full border border-gray-300 rounded p-3 resize-y bg-white"
                  rows={4}
                  placeholder="Complete this thought — what do you imagine might happen?"
                  value={ia.capabilities_imagine ?? ''}
                  onChange={(e) =>
                    setState((prev) => ({
                      ...prev,
                      ia_4_4: { ...(prev.ia_4_4 || {}), capabilities_imagine: e.target.value },
                    }))
                  }
                  onBlur={() => saveNow()}
                />
                <p className="mt-1 text-xs text-gray-500">
                  {wordCount(ia.capabilities_imagine) < 15
                    ? `${wordCount(ia.capabilities_imagine)} words — write at least 15`
                    : `${wordCount(ia.capabilities_imagine)} words`}
                </p>
              </div>
            )}

            {/* Completion gate */}
            {(!ia.tag ||
              !ia.capabilities_applied ||
              (Array.isArray(ia.capabilities_applied) && ia.capabilities_applied.length < 2) ||
              !ia.capabilities_imagine ||
              wordCount(ia.capabilities_imagine) < 15) && (
              <p className="mt-3 text-xs font-semibold text-amber-600 flex items-center gap-1">
                <span>⚠</span> Required to continue
              </p>
            )}
          </div>

          {/* 5. What the AI noticed — REVEALED AFTER participant's own selections */}
          {ia.ai_reflection && (
            <div className="mb-4 p-4 bg-purple-50/50 border border-purple-100 rounded-lg">
              <h3 className="text-xs font-semibold uppercase text-purple-600 mb-1">What the AI noticed in your questions</h3>
              <p className="text-sm text-gray-700 leading-relaxed">{ia.ai_reflection}</p>
              <p className="mt-2 text-xs text-gray-500 italic">
                Compare this with your own selections above — did you notice the same capabilities, or different ones?
              </p>
            </div>
          )}
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
