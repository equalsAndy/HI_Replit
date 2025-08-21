import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useWorkshopStepData } from '@/hooks/useWorkshopStepData';
import { useContinuity } from '@/hooks/useContinuity';
import { ActionPlanningModal, type Interlude, type ActionStep } from './ActionPlanningModal';
import { Zap, Clock, Users, Target } from 'lucide-react';

// IA-3-5 data structure for proper typing
interface IA35StepData {
  selectedInterludes: string[];
  responses: Record<string, string>;
  completed: string[];
  meta?: {
    lastEditedAt: string;
  };
}

export default function ActionPlanningExercise() {
  const { state, setState } = useContinuity();
  const [modalOpen, setModalOpen] = React.useState(false);

  // Access IA-3-5 data using the workshop step data hook
  const { data: ia35Data } = useWorkshopStepData<IA35StepData>('ia', 'ia-3-5', {
    selectedInterludes: [],
    responses: {},
    completed: []
  });

  // Normalize ia_4_5 with a fallback (safe access even if state is null)
  const ia45 = state?.ia_4_5 ?? {};

  // Transform IA-3-5 data into Interlude format for the modal
  const availableInterludes = React.useMemo(() => {
    if (!ia35Data?.completed?.length || !ia35Data?.responses) {
      return [];
    }

    // Define interlude metadata from IA-3-5 structure
    const interludeMap: Record<string, { title: string; prompt: string }> = {
      'nature': {
        title: 'Walk in Nature',
        prompt: 'Describe a moment in nature that moved you. Where were you? What did you see, feel, hear?'
      },
      'beauty': {
        title: 'Capture Beauty', 
        prompt: 'Think of something beautiful you once paused to capture. Was it a photo, a sound, a detail? Why did it catch your eye?'
      },
      'journal': {
        title: 'Journal Thoughts',
        prompt: 'Recall a time when writing helped you understand something. What flowed out? What surprised you?'
      },
      'create': {
        title: 'Create Art',
        prompt: 'Remember a time when you were lost in making something. What were you creating? What feeling came with it?'
      },
      'vision': {
        title: 'Vision Board',
        prompt: 'Picture a time when you shaped a dream into images or words. What did you see? What pulled you forward?'
      },
      'play': {
        title: 'Play',
        prompt: 'When did you last lose yourself in play or laughter? What were you doing? Who were you with?'
      },
      'learn': {
        title: 'Learn New Skills',
        prompt: 'Think of a moment when learning something new made you feel alive. What were you discovering? What part lit you up?'
      },
      'heroes': {
        title: 'Read Heroes',
        prompt: 'Recall a story or figure that stirred something in you. What was their story — and what did it awaken in yours?'
      },
      'art': {
        title: 'Experience Art',
        prompt: 'Think of a performance, painting, or poem that struck you deep. What did it awaken? Why do you still remember it?'
      }
    };

    return ia35Data.completed.map(interludeId => ({
      id: interludeId,
      title: interludeMap[interludeId]?.title || interludeId,
      prompt: interludeMap[interludeId]?.prompt || '',
      response: ia35Data.responses[interludeId] || '',
      description: ia35Data.responses[interludeId] || '',
      type: 'awe' as const, // Will be categorized in modal
      createdAt: new Date()
    }));
  }, [ia35Data]);

  // Handle creating new action steps
  const handleCreateActionStep = (step: Omit<ActionStep, 'id' | 'createdAt'>) => {
    setState((prev) => {
      const prevIA45 = prev.ia_4_5 || {};
      const existingSteps = Array.isArray(prevIA45.action_steps) ? prevIA45.action_steps : [];
      
      const newStep = {
        ...step,
        id: `step-${Date.now()}`,
        createdAt: new Date().toISOString()
      };

      return {
        ...prev,
        ia_4_5: {
          ...prevIA45,
          action_steps: [...existingSteps, newStep]
        }
      };
    });
  };

  // Handle modal completion
  const handleModalComplete = (actionSteps: ActionStep[]) => {
    setState((prev) => {
      const prevIA45 = prev.ia_4_5 || {};
      
      return {
        ...prev,
        ia_4_5: {
          ...prevIA45,
          action_steps: actionSteps,
          completed: true,
          last_updated: new Date().toISOString()
        }
      };
    });
    setModalOpen(false);
  };

  // Get existing action steps
  const existingActionSteps = Array.isArray(ia45.action_steps) ? ia45.action_steps : [];

  // Check if we have IA-3-5 data
  const hasInterludes = availableInterludes.length > 0;

  return (
    <>
      {/* Display IA-3-5 inspiration moments summary */}
      {hasInterludes && (
        <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <h3 className="text-lg font-semibold text-purple-800 mb-3">
            Your Inspiration Moments (from IA-3-5)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {availableInterludes.slice(0, 6).map((interlude) => (
              <div key={interlude.id} className="p-3 bg-white border border-purple-200 rounded-lg">
                <h4 className="font-medium text-purple-700 text-sm">{interlude.title}</h4>
                <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                  {interlude.response.substring(0, 80)}...
                </p>
              </div>
            ))}
            {availableInterludes.length > 6 && (
              <div className="p-3 bg-purple-100 border border-purple-300 rounded-lg flex items-center justify-center">
                <span className="text-sm font-medium text-purple-700">
                  +{availableInterludes.length - 6} more
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Action Planning Section */}
      <div className="space-y-6">
        {/* Purpose Card */}
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
              <Zap className="w-6 h-6 text-purple-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-purple-800 mb-2">
                From Inspiration to Co-Creation
              </h2>
              <p className="text-gray-700 mb-4">
                Transform your inspiration moments into concrete, actionable steps. Bridge the gap between 
                inspiration and implementation by working with your collected moments of awe, art, movement, 
                and stillness to create practical next steps.
              </p>
              <div className="bg-purple-100 border border-purple-300 rounded-lg p-4">
                <p className="text-lg font-medium text-purple-800 text-center">
                  Turn moments of inspiration into steps for action.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Planning Button */}
        <div className="text-center space-y-4">
          {!hasInterludes ? (
            <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center justify-center gap-3 mb-3">
                <Target className="w-6 h-6 text-yellow-600" />
                <h3 className="font-semibold text-yellow-800">No Inspiration Moments Available</h3>
              </div>
              <p className="text-yellow-700 mb-4">
                To create action steps, you need to complete IA-3-5 (Inspiration Moments) first. 
                This exercise builds on those captured moments of inspiration.
              </p>
              <p className="text-sm text-yellow-600">
                Return to IA-3-5 to capture your interludes, then come back here to transform them into action.
              </p>
            </div>
          ) : (
            <Button
              onClick={() => setModalOpen(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 text-lg"
            >
              <Zap className="w-5 h-5 mr-2" />
              Create Action Steps
            </Button>
          )}
        </div>

        {/* Existing Action Steps Display */}
        {existingActionSteps.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-600" />
              Your Action Steps
            </h3>
            
            <div className="grid gap-4">
              {existingActionSteps.map((step, index) => (
                <Card key={step.id || index} className="border-l-4 border-l-purple-500">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-gray-800 font-medium mb-2">{step.description}</p>
                        {step.timeframe && (
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Clock className="w-4 h-4" />
                            <span>{step.timeframe}</span>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          Action #{index + 1}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center">
              <Button
                onClick={() => setModalOpen(true)}
                variant="outline"
                className="border-purple-300 text-purple-600 hover:bg-purple-50"
              >
                <Zap className="w-4 h-4 mr-2" />
                Add More Action Steps
              </Button>
            </div>
          </div>
        )}

        {/* Example Section */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-green-800 mb-3 flex items-center gap-2">
            💡 Example Action Planning
          </h4>
          <div className="space-y-3 text-green-700">
            <div>
              <p><strong>Inspiration Moment:</strong> "I felt most alive when I was teaching my nephew to paint. His joy in mixing colors reminded me why I fell in love with art."</p>
            </div>
            <div>
              <p><strong>AI Exploration:</strong> "What if you could create spaces where others experience that same joy in discovery? What would a small first step look like?"</p>
            </div>
            <div>
              <p><strong>Action Step:</strong> "Schedule one 'Creative Coffee' session this month where I invite a friend to try painting together at my kitchen table."</p>
            </div>
            <div>
              <p><strong>Timeframe:</strong> This month</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Planning Modal */}
      <ActionPlanningModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        interludes={availableInterludes}
        onCreateActionStep={handleCreateActionStep}
        onComplete={handleModalComplete}
      />
    </>
  );
}