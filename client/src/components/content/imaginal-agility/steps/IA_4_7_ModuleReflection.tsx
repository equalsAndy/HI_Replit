import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useQuery } from '@tanstack/react-query';
import { useWorkshopStepData } from '@/hooks/useWorkshopStepData';
import ScrollIndicator from '@/components/ui/ScrollIndicator';
import { ScenarioReflectionModal } from '@/components/ia/ScenarioReflectionModal';

interface IA47ContentProps {
  onNext?: (stepId: string) => void;
}

type CapabilityKey = 'imagination' | 'curiosity' | 'caring' | 'creativity' | 'courage';

const CAPABILITIES: { key: CapabilityKey; label: string; color: string }[] = [
  { key: 'imagination', label: 'Imagination', color: '#8b5cf6' },
  { key: 'curiosity',   label: 'Curiosity',   color: '#10b981' },  // green — matches icon
  { key: 'caring',      label: 'Caring',      color: '#3b82f6' },  // blue — matches icon
  { key: 'creativity',  label: 'Creativity',  color: '#f59e0b' },
  { key: 'courage',     label: 'Courage',     color: '#ef4444' },
];

const RATING_ANCHORS: Record<number, string> = {
  1: 'Not really',
  2: 'Slightly',
  3: 'Somewhat',
  4: 'Quite a bit',
  5: 'Central',
};

interface IA47StepData {
  scenario_notes: string;
  reused_scenario: boolean;
  modified_scenario: boolean;
  ai_conversation: Array<{ role: 'user' | 'assistant'; content: string }>;
  capability_ratings: Record<string, number>;
  ai_summary?: string;
}

const INITIAL_DATA: IA47StepData = {
  scenario_notes: '',
  reused_scenario: false,
  modified_scenario: false,
  ai_conversation: [],
  capability_ratings: {},
  ai_summary: '',
};

const IA_4_7_ModuleReflection: React.FC<IA47ContentProps> = ({ onNext }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [exerciseComplete, setExerciseComplete] = useState(false);
  const [scenarioChoice, setScenarioChoice] = useState<'reuse' | 'new' | null>(null);

  // Persist ia-4-7 step data
  const { data, updateData, saving, loaded } = useWorkshopStepData<IA47StepData>(
    'ia',
    'ia-4-7',
    INITIAL_DATA,
    { debounceMs: 1500, enableAutoSave: true }
  );

  // Fetch ia-3-7 data for scenario reuse + comparison
  const { data: ia37Response } = useQuery({
    queryKey: ['/api/workshop-data/step/ia/ia-3-7'],
    queryFn: async () => {
      const res = await fetch('/api/workshop-data/step/ia/ia-3-7', { credentials: 'include' });
      if (!res.ok) return null;
      return res.json();
    },
    retry: false,
  });
  const ia37Data = (ia37Response as any)?.data || null;

  // Check if exercise was already completed on load
  useEffect(() => {
    if (loaded && data.capability_ratings) {
      const ratedCount = CAPABILITIES.filter(c => data.capability_ratings[c.key] >= 1).length;
      if (ratedCount === 5) {
        setExerciseComplete(true);
      }
    }
  }, [loaded, data.capability_ratings]);

  const hasScenario = data.scenario_notes.trim().length > 0;
  const ratedCount = CAPABILITIES.filter(c => data.capability_ratings[c.key] >= 1).length;
  const allRated = ratedCount === 5;

  // Handle scenario reuse choice
  const handleReuseScenario = () => {
    setScenarioChoice('reuse');
    if (ia37Data?.scenario_notes) {
      updateData({
        scenario_notes: ia37Data.scenario_notes,
        reused_scenario: true,
        modified_scenario: false,
      });
    }
  };

  const handleNewScenario = () => {
    setScenarioChoice('new');
    updateData({
      scenario_notes: '',
      reused_scenario: false,
      modified_scenario: false,
    });
  };

  // Handle scenario text changes (detect modifications to reused scenario)
  const handleScenarioChange = (text: string) => {
    const isModified = data.reused_scenario && ia37Data?.scenario_notes && text !== ia37Data.scenario_notes;
    updateData({
      scenario_notes: text,
      modified_scenario: isModified,
    });
  };

  // Handle modal completion
  const handleModalComplete = (result: {
    ratings: Record<string, number>;
    conversation: Array<{ role: 'user' | 'assistant'; content: string }>;
    summary?: string;
  }) => {
    updateData({
      capability_ratings: result.ratings,
      ai_conversation: result.conversation,
      ai_summary: result.summary || '',
    });
    setExerciseComplete(true);
    setModalOpen(false);
  };

  // Determine whether to show scenario choice vs textarea
  const showScenarioChoice = ia37Data?.scenario_notes && scenarioChoice === null && !data.reused_scenario && !data.scenario_notes;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <ScrollIndicator idleTime={3000} position="nav-adjacent" colorScheme="purple" />

      {/* Section 1: Module Recap */}
      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-8 border border-purple-200 mb-8">
        <h1 className="text-3xl font-bold text-purple-700 mb-4">
          Grounding What You've Explored
        </h1>
        <p className="text-lg text-gray-700 leading-relaxed">
          In this module you've partnered with AI to go deeper — reframing challenges, stretching your
          visualization, connecting to purpose, and exploring what once seemed unimaginable. Each exercise
          used AI as a thinking partner while the real insight came from you.
        </p>
        <p className="text-lg text-gray-700 leading-relaxed mt-4">
          Let's use that same partnership one more time to reflect on a real situation.
        </p>
      </div>

      {/* Section 2: Scenario Prompt */}
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200 mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          A Moment That Mattered
        </h2>

        {/* Scenario choice: reuse from ia-3-7 or new */}
        {showScenarioChoice ? (
          <>
            <p className="text-gray-600 mb-4">You reflected on this situation in Module 3:</p>
            <div className="bg-purple-50/60 border border-purple-100 rounded-lg px-4 py-3 text-gray-800 mb-6 italic">
              "{ia37Data.scenario_notes}"
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleReuseScenario}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                Explore this situation again
              </Button>
              <Button
                variant="outline"
                onClick={handleNewScenario}
                className="border-purple-300 text-purple-700 hover:bg-purple-50"
              >
                Choose a different situation
              </Button>
            </div>
          </>
        ) : (
          <>
            <p className="text-gray-600 mb-6">
              {data.reused_scenario
                ? 'Feel free to add or adjust anything.'
                : 'Think of a recent situation at work that felt challenging but meaningful — a decision you had to make, a conversation that was difficult, a problem you were trying to solve.'
              }
            </p>
            <Textarea
              placeholder="A few words to place yourself back in the moment..."
              value={data.scenario_notes}
              onChange={(e) => handleScenarioChange(e.target.value)}
              className="min-h-[120px] border-gray-200 focus:border-purple-400"
            />
            {data.scenario_notes.length > 0 && (
              <p className="text-sm text-gray-400 mt-2 text-right">
                {data.scenario_notes.length} characters
              </p>
            )}

            {/* Switch scenario link */}
            {ia37Data?.scenario_notes && scenarioChoice === 'new' && (
              <button
                onClick={handleReuseScenario}
                className="text-sm text-purple-600 hover:text-purple-800 underline mt-2"
              >
                Use Module 3 scenario instead
              </button>
            )}
            {ia37Data?.scenario_notes && scenarioChoice === 'reuse' && (
              <button
                onClick={handleNewScenario}
                className="text-sm text-purple-600 hover:text-purple-800 underline mt-2"
              >
                Choose a different situation
              </button>
            )}
          </>
        )}

        {/* Begin Reflection button */}
        {hasScenario && !exerciseComplete && (
          <div className="mt-6">
            <Button
              onClick={() => setModalOpen(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg"
            >
              Begin Reflection
            </Button>
          </div>
        )}
      </div>

      {/* Section 3: Results View — after modal completes */}
      {exerciseComplete && allRated && (
        <div className="mb-8">
          {/* AI Summary */}
          {data.ai_summary && (
            <div className="bg-purple-50/60 border border-purple-100 rounded-xl p-6 mb-6">
              <p className="text-gray-800 leading-relaxed italic">
                {data.ai_summary}
              </p>
            </div>
          )}

          {/* Capability Ratings */}
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Ratings</h3>
            <div className="space-y-3">
              {CAPABILITIES.map(({ key, label, color }) => {
                const rating = data.capability_ratings[key] || 0;
                return (
                  <div key={key} className="flex items-center gap-4">
                    <span className="w-28 text-sm font-semibold" style={{ color }}>{label}</span>
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5].map(n => (
                        <div
                          key={n}
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: n <= rating ? color : '#e5e7eb' }}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">{rating} — {RATING_ANCHORS[rating]}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Side-by-side comparison with ia-3-7 */}
          {ia37Data?.capability_ratings && (
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200 mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                What you noticed on your own, and what surfaced with a thinking partner:
              </h3>
              <div className="overflow-x-auto mt-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 pr-4 text-gray-600 font-medium">Capability</th>
                      <th className="text-center py-2 px-4 text-gray-600 font-medium">Solo</th>
                      <th className="text-center py-2 px-4 text-gray-600 font-medium">With AI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {CAPABILITIES.map(({ key, label, color }) => {
                      const soloRating = ia37Data.capability_ratings[key] || 0;
                      const aiRating = data.capability_ratings[key] || 0;
                      return (
                        <tr key={key} className="border-b border-gray-100">
                          <td className="py-3 pr-4 font-semibold" style={{ color }}>{label}</td>
                          <td className="py-3 px-4">
                            <div className="flex justify-center gap-1">
                              {[1, 2, 3, 4, 5].map(n => (
                                <div
                                  key={n}
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: n <= soloRating ? color : '#e5e7eb' }}
                                />
                              ))}
                              <span className="ml-1 text-gray-500">({soloRating})</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex justify-center gap-1">
                              {[1, 2, 3, 4, 5].map(n => (
                                <div
                                  key={n}
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: n <= aiRating ? color : '#e5e7eb' }}
                                />
                              ))}
                              <span className="ml-1 text-gray-500">({aiRating})</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <p className="text-sm text-gray-500 mt-4 italic">
                Shifts between solo and AI-partnered ratings aren't right or wrong — they show what a
                different kind of reflection surfaces.
              </p>
            </div>
          )}

          {/* Closing text */}
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200 mb-6">
            <p className="text-gray-700 leading-relaxed">
              These scenario reflections — along with your Prism self-assessment — feed into your
              Activation Matrix in Module 5, where you'll see all three perspectives together.
            </p>
          </div>

          {/* Re-open modal to adjust */}
          {hasScenario && (
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={() => setModalOpen(true)}
                className="text-sm text-purple-600 hover:text-purple-800 underline"
              >
                Revisit reflection
              </button>
            </div>
          )}

          <div className="flex justify-end">
            <Button
              onClick={() => onNext?.('ia-5-1')}
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Continue to Module 5 →'}
            </Button>
          </div>
        </div>
      )}

      {/* Scenario Reflection Modal */}
      <ScenarioReflectionModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        scenarioNotes={data.scenario_notes}
        existingRatings={exerciseComplete ? data.capability_ratings : {}}
        existingConversation={data.ai_conversation || []}
        onComplete={handleModalComplete}
      />
    </div>
  );
};

export default IA_4_7_ModuleReflection;
