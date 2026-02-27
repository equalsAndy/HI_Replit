import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useWorkshopStepData } from '@/hooks/useWorkshopStepData';
import { useContinuity } from '@/hooks/useContinuity';
import { GlobalPurposeBridgeModal } from './GlobalPurposeBridgeModal';
import { Globe, Target } from 'lucide-react';
import { CapabilitySelector } from '@/components/ia/CapabilitySelector';
import { CapabilityType } from '@/lib/types';

// IA-3-4 data structure for higher purpose
interface IA34StepData {
  whyReflection: string;
  howReflection: string;
  whatReflection: string;
  nextStep: string;
}

function wordCount(text?: string): number {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(w => w.length > 0).length;
}

function formatCapabilityList(caps: CapabilityType[]): string {
  if (caps.length === 0) return '';
  if (caps.length === 1) return caps[0];
  if (caps.length === 2) return `${caps[0]} and ${caps[1]}`;
  return caps.slice(0, -1).join(', ') + ', and ' + caps[caps.length - 1];
}

export default function GlobalPurposeBridgeExercise() {
  const { state, setState, saveNow } = useContinuity();
  const [modalOpen, setModalOpen] = React.useState(false);

  // Access IA-3-4 data for higher purpose
  const { data: ia34Data } = useWorkshopStepData<IA34StepData>('ia', 'ia-3-4', {
    whyReflection: '',
    howReflection: '',
    whatReflection: '',
    nextStep: ''
  });

  // Normalize state
  const ia = state?.ia_4_4 ?? {};

  const higherPurposeFromIA34 = ia34Data?.whyReflection || '';

  // Content area state (pre-modal)
  const [higherPurpose, setHigherPurpose] = React.useState(ia.higher_purpose || '');
  const [selectedChallenge, setSelectedChallenge] = React.useState(ia.global_challenge || '');
  const [customChallenge, setCustomChallenge] = React.useState('');

  const globalChallenges = [
    'Climate Change and Environmental Degradation',
    'Inequality and Global Poverty',
    'Artificial Intelligence and Technological Ethics',
    'Disinformation and Erosion of Truth',
    'Human Rights in Conflict and Crisis'
  ];

  const effectivePurpose = higherPurpose.trim() || higherPurposeFromIA34;
  const effectiveChallenge = customChallenge.trim() || selectedChallenge;
  const isReadyForAI = Boolean(effectivePurpose && effectiveChallenge);

  // Check completion
  const isCompleted = Boolean(ia.completed && ia.reframed_view);

  // Challenge selection
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

  // Modal completion handler
  const handleModalComplete = (results: {
    reframedView: string;
    question1: string;
    question2: string;
    aiAnswer1: string;
    aiAnswer2: string;
    aiReflection: string;
    tag: string;
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
        tag: results.tag,
        transcript: results.transcript,
        completed: true,
        last_updated: new Date().toISOString(),
      }
    }));
    setTimeout(() => saveNow(), 0);
    setModalOpen(false);
  };

  return (
    <>
      {/* Step 1: Recall Your Intention */}
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
            {isCompleted ? 'Explore Again' : 'Explore with AI'}
          </Button>
        )}
      </div>

      {/* ═══════════ POST-MODAL RESULTS ═══════════ */}
      {isCompleted && (
        <>
          {/* "What you just did" block */}
          <div className="mb-5 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg">
            <h3 className="font-semibold text-purple-800 mb-2">What you just did</h3>
            <p className="text-sm text-gray-700 leading-relaxed">
              You took your intention and put it somewhere much bigger than usual — not because we expect you to
              solve global problems, but because expansive contexts force your capabilities to show up in ways they
              don't in daily life. What you just practiced is using AI as an imagination partner to explore at a
              scale you normally wouldn't reach alone. The scenario was aspirational. What you learned about your
              capabilities is real.
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

          {/* 3. What your questions reveal */}
          {ia.ai_reflection && (
            <div className="mb-4 p-4 bg-purple-50/50 border border-purple-100 rounded-lg">
              <h3 className="text-xs font-semibold uppercase text-gray-500 mb-1">What your questions reveal</h3>
              <p className="text-sm text-gray-700 leading-relaxed">{ia.ai_reflection}</p>
            </div>
          )}

          {/* 4. What this gave you (tag) */}
          {ia.tag && (
            <div className="mb-6 p-3 bg-purple-50/50 border border-purple-100 rounded-lg">
              <h3 className="text-xs font-semibold uppercase text-gray-500 mb-1">What this gave you</h3>
              <span className="inline-block bg-purple-100 text-purple-800 text-sm px-3 py-1 rounded-full font-medium">
                {ia.tag}
              </span>
            </div>
          )}

          {/* 5. Capabilities in Action — REQUIRED */}
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

            {/* Dynamic "I imagine" prompt — appears after 2+ selected */}
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
