import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useWorkshopStepData } from '@/hooks/useWorkshopStepData';
import { useContinuity } from '@/hooks/useContinuity';
import { GlobalPurposeBridgeModal, type GlobalBridge } from './GlobalPurposeBridgeModal';
import { Globe, Target, ArrowRight } from 'lucide-react';

// IA-3-4 data structure for higher purpose
interface IA34StepData {
  whyReflection: string;
  howReflection: string;
  whatReflection: string;
  nextStep: string;
}

export default function GlobalPurposeBridgeExercise() {
  const { state, setState } = useContinuity();
  const [modalOpen, setModalOpen] = React.useState(false);

  // Access IA-3-4 data for higher purpose
  const { data: ia34Data } = useWorkshopStepData<IA34StepData>('ia', 'ia-3-4', {
    whyReflection: '',
    howReflection: '',
    whatReflection: '',
    nextStep: ''
  });

  // Normalize ia_4_4 with a fallback (safe access even if state is null)
  const ia44 = state?.ia_4_4 ?? {};

  // Extract higher purpose from IA-3-4 WHY reflection
  const higherPurposeFromIA34 = ia34Data?.whyReflection || '';

  // Content area state (pre-modal work)
  const [higherPurpose, setHigherPurpose] = React.useState(higherPurposeFromIA34);
  const [selectedChallenge, setSelectedChallenge] = React.useState('');
  const [customChallenge, setCustomChallenge] = React.useState('');

  // Modal results state
  const [modalResults, setModalResults] = React.useState<{
    aiPerspectives: string;
    chosenPerspective?: string;
    modestContribution: string;
    bridgeName: string;
    worldGameStretch?: string;
  } | null>(null);

  // Global challenges
  const globalChallenges = [
    'Climate Change and Environmental Degradation',
    'Inequality and Global Poverty',
    'Artificial Intelligence and Technological Ethics',
    'Disinformation and Erosion of Truth',
    'Human Rights in Conflict and Crisis'
  ];

  // Initialize higher purpose when IA-3-4 data loads
  React.useEffect(() => {
    if (higherPurposeFromIA34 && !higherPurpose) {
      setHigherPurpose(higherPurposeFromIA34);
    }
  }, [higherPurposeFromIA34, higherPurpose]);

  // Handle challenge selection
  const handleChallengeSelect = (challenge: string) => {
    setSelectedChallenge(challenge);
    setCustomChallenge('');
  };

  // Handle custom challenge input
  const handleCustomChallengeChange = (value: string) => {
    setCustomChallenge(value);
    if (value.trim()) {
      setSelectedChallenge('');
    }
  };

  // Get the effective challenge (selected or custom)
  const effectiveChallenge = customChallenge.trim() || selectedChallenge;

  // Check if ready for AI perspectives
  const isReadyForAI = higherPurpose.trim() && effectiveChallenge;

  // Handle opening modal
  const handleOpenModal = () => {
    if (!isReadyForAI) return;
    
    // Save content area work before opening modal
    setState((prev) => ({
      ...prev,
      ia_4_4: {
        ...prev.ia_4_4,
        higher_purpose: higherPurpose,
        global_challenge: effectiveChallenge,
        content_completed: true
      }
    }));
    
    setModalOpen(true);
  };

  // Handle modal completion
  const handleModalComplete = (results: {
    aiPerspectives: string;
    chosenPerspective?: string;
    modestContribution: string;
    bridgeName: string;
    worldGameStretch?: string;
  }) => {
    setModalResults(results);
    
    // Save complete results to state
    setState((prev) => ({
      ...prev,
      ia_4_4: {
        ...prev.ia_4_4,
        higher_purpose: higherPurpose,
        global_challenge: effectiveChallenge,
        ai_perspectives: results.aiPerspectives,
        chosen_perspective: results.chosenPerspective,
        modest_contribution: results.modestContribution,
        bridge_name: results.bridgeName,
        world_game_stretch: results.worldGameStretch,
        completed: true,
        last_updated: new Date().toISOString()
      }
    }));
    
    setModalOpen(false);
  };

  // Check if exercise is completed
  const isCompleted = modalResults || (ia44.completed && ia44.bridge_name);

  return (
    <>
      {/* Step 1: Recall Your Higher Purpose */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <Target className="w-5 h-5 text-purple-600" />
          Step 1: Recall Your Higher Purpose
        </h3>
        
        {higherPurposeFromIA34 && (
          <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
            <p className="text-sm text-purple-700 font-medium">From your IA-3-4 reflection:</p>
            <p className="text-purple-800 italic">"{higherPurposeFromIA34}"</p>
          </div>
        )}
        
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700">
            What core intention did you uncover earlier? Write it in your own words.
          </label>
          <Textarea
            value={higherPurpose}
            onChange={(e) => setHigherPurpose(e.target.value)}
            placeholder="Your deeper purpose or core intention..."
            rows={3}
            className="text-sm"
          />
          <p className="text-xs text-gray-500">
            {higherPurposeFromIA34 ? "Edit the text above if you'd like to refine your purpose." : "What do you care about deeply? What future would you like to help shape?"}
          </p>
        </div>
      </div>

      {/* Step 2: Choose a Global Challenge */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <Globe className="w-5 h-5 text-purple-600" />
          Step 2: Choose a Global Challenge
        </h3>
        
        <p className="text-sm text-gray-600 mb-4">
          Pick one of the major issues below—or write your own. These are some of the most urgent and interconnected challenges facing our planet:
        </p>
        
        <div className="space-y-3 mb-4">
          {globalChallenges.map((challenge) => (
            <label
              key={challenge}
              className={`block p-3 rounded-lg border-2 cursor-pointer transition-all ${
                selectedChallenge === challenge
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-purple-300 hover:bg-purple-25'
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

        {/* Custom Challenge Option */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Or write your own:
          </label>
          <Textarea
            value={customChallenge}
            onChange={(e) => handleCustomChallengeChange(e.target.value)}
            placeholder="Describe a global challenge that matters to you..."
            rows={2}
            className="text-sm"
          />
        </div>
      </div>

      {/* Step 3: AI Button Activation */}
      <div className="mb-8 text-center">
        <div className="space-y-4">
          {!isReadyForAI ? (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-700 text-sm">
                Complete steps 1 and 2 above to unlock AI perspectives.
              </p>
            </div>
          ) : (
            <>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-800 text-sm font-medium mb-2">Ready for AI Assistance</p>
                <p className="text-blue-700 text-sm">
                  Ask AI: "Offer three unconventional or overlooked perspectives on this challenge—and what it might need most from someone like me."
                </p>
              </div>
              
              <Button
                onClick={handleOpenModal}
                className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg"
                disabled={isCompleted}
              >
                <Globe className="w-5 h-5 mr-2" />
                {isCompleted ? 'Bridge Created' : 'Get Fresh Perspectives'}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Post-Modal Results Display */}
      {isCompleted && (modalResults || ia44.bridge_name) && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <ArrowRight className="w-5 h-5 text-purple-600" />
            Your Global Purpose Bridge
          </h3>
          
          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-purple-700 mb-1">Your Higher Purpose:</h4>
                  <p className="text-gray-800">{higherPurpose || ia44.higher_purpose}</p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-purple-700 mb-1">Global Challenge:</h4>
                  <p className="text-gray-800">{effectiveChallenge || ia44.global_challenge}</p>
                </div>
                
                {(modalResults?.aiPerspectives || ia44.ai_perspectives) && (
                  <div>
                    <h4 className="font-semibold text-purple-700 mb-1">Fresh AI Perspectives:</h4>
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-blue-800 text-sm whitespace-pre-line">
                        {modalResults?.aiPerspectives || ia44.ai_perspectives}
                      </p>
                    </div>
                  </div>
                )}
                
                <div>
                  <h4 className="font-semibold text-purple-700 mb-1">Your Bridge:</h4>
                  <p className="text-lg font-medium text-purple-800 mb-2">
                    "{modalResults?.bridgeName || ia44.bridge_name}"
                  </p>
                  <p className="text-gray-800">
                    {modalResults?.modestContribution || ia44.modest_contribution}
                  </p>
                </div>
                
                {(modalResults?.worldGameStretch || ia44.world_game_stretch) && (
                  <div>
                    <h4 className="font-semibold text-purple-700 mb-1">World Game Stretch:</h4>
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-green-800 text-sm">
                        {modalResults?.worldGameStretch || ia44.world_game_stretch}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mt-6 text-center">
                <Button
                  onClick={handleOpenModal}
                  variant="outline"
                  className="border-purple-300 text-purple-600 hover:bg-purple-50"
                >
                  <Globe className="w-4 h-4 mr-2" />
                  Refine Your Bridge
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Example Section */}
      {!isCompleted && (
        <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-green-800 mb-3">💡 Example Global Purpose Bridge</h4>
          <div className="space-y-2 text-green-700 text-sm">
            <p><strong>Higher Purpose:</strong> "I want to help people find their authentic voice and express what matters to them."</p>
            <p><strong>Global Challenge:</strong> Climate Change and Environmental Degradation</p>
            <p><strong>AI Perspective:</strong> "Climate action needs storytellers who can help communities articulate their relationship with place and environment."</p>
            <p><strong>Bridge:</strong> "The Story-Climate Connection" - Monthly workshops where community members practice telling their personal environmental stories.</p>
          </div>
        </div>
      )}

      {/* Global Purpose Bridge Modal */}
      <GlobalPurposeBridgeModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        higherPurpose={higherPurpose}
        globalChallenge={effectiveChallenge}
        onComplete={handleModalComplete}
      />
    </>
  );
}