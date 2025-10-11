import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useContinuity } from '@/hooks/useContinuity';
import { PositiveOutcomeModal, type ExpandedVision } from './PositiveOutcomeModal';
import { Eye, Lightbulb, Target, Sparkles } from 'lucide-react';

export default function PositiveOutcomeExercise() {
  const { state, setState } = useContinuity();
  const [modalOpen, setModalOpen] = React.useState(false);

  // Normalize ia_4_4 with a fallback (safe access even if state is null)
  const ia44 = state?.ia_4_4 ?? {};

  // Handle creating new expanded visions
  const handleCreateVision = (vision: Omit<ExpandedVision, 'id' | 'createdAt' | 'userId'>) => {
    setState((prev) => {
      const prevIA44 = prev.ia_4_4 || {};
      const existingVisions = Array.isArray(prevIA44.expanded_visions) ? prevIA44.expanded_visions : [];
      
      const newVision = {
        ...vision,
        id: `vision-${Date.now()}`,
        createdAt: new Date().toISOString(),
        userId: 'current-user'
      };

      return {
        ...prev,
        ia_4_4: {
          ...prevIA44,
          expanded_visions: [...existingVisions, newVision]
        }
      };
    });
  };

  // Handle modal completion
  const handleModalComplete = (expandedVisions: ExpandedVision[]) => {
    setState((prev) => {
      const prevIA44 = prev.ia_4_4 || {};
      
      return {
        ...prev,
        ia_4_4: {
          ...prevIA44,
          expanded_visions: expandedVisions,
          completed: true,
          last_updated: new Date().toISOString()
        }
      };
    });
    setModalOpen(false);
  };

  // Handle basic outcome input (for non-modal workflow)
  const handleOutcomeChange = (value: string) => {
    setState((prev) => {
      const prevIA44 = prev.ia_4_4 || {};
      
      return {
        ...prev,
        ia_4_4: {
          ...prevIA44,
          positive_outcome: value
        }
      };
    });
  };

  // Get existing expanded visions
  const existingVisions = Array.isArray(ia44.expanded_visions) ? ia44.expanded_visions : [];
  const currentOutcome = ia44.positive_outcome || '';

  return (
    <>
      {/* Basic Outcome Input */}
      <div className="mb-6 space-y-4">
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700">
            What would a positive outcome look like for this challenge?
          </label>
          <Textarea
            value={currentOutcome}
            onChange={(e) => handleOutcomeChange(e.target.value)}
            placeholder="Describe a positive outcome in a few lines... This will be the starting point for deeper visualization."
            rows={3}
            className="text-sm"
          />
          <p className="text-xs text-gray-500">
            Start with any positive outcome you can imagine - we'll make it more vivid and inspiring together.
          </p>
        </div>
      </div>

      {/* Main Visualization Section */}
      <div className="space-y-6">
        {/* Purpose Card */}
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
              <Eye className="w-6 h-6 text-purple-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-purple-800 mb-2">
                Imagining Positive Outcomes
              </h2>
              <p className="text-gray-700 mb-4">
                Help your positive future scenarios feel more real, inspiring, and achievable through 
                collaborative visualization. Work with AI to expand your initial ideas with vivid details, 
                emotional resonance, and tangible specifics.
              </p>
              <div className="bg-purple-100 border border-purple-300 rounded-lg p-4">
                <p className="text-lg font-medium text-purple-800 text-center">
                  Make your positive future feel alive and within reach.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Visualization Button */}
        <div className="text-center space-y-4">
          {!currentOutcome.trim() ? (
            <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center justify-center gap-3 mb-3">
                <Target className="w-6 h-6 text-yellow-600" />
                <h3 className="font-semibold text-yellow-800">Start with Your Positive Outcome</h3>
              </div>
              <p className="text-yellow-700 mb-4">
                Describe any positive outcome you're hoping for in the text area above. 
                It doesn't need to be perfect - we'll work together to make it vivid and inspiring.
              </p>
              <p className="text-sm text-yellow-600">
                Even a simple description like "I want this project to go well" is a great starting point.
              </p>
            </div>
          ) : (
            <Button
              onClick={() => setModalOpen(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 text-lg"
            >
              <Eye className="w-5 h-5 mr-2" />
              Imagine It Vividly
            </Button>
          )}
        </div>

        {/* Existing Visions Display */}
        {existingVisions.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              Your Vivid Visions
            </h3>
            
            <div className="grid gap-4">
              {existingVisions.map((vision, index) => (
                <Card key={vision.id || index} className="border-l-4 border-l-purple-500">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-gray-800 leading-relaxed mb-3">{vision.vividDescription}</p>
                          
                          {vision.aspects && vision.aspects.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {vision.aspects.map((aspect) => (
                                <span
                                  key={aspect}
                                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
                                >
                                  {getAspectLabel(aspect)}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            Vision #{index + 1}
                          </span>
                        </div>
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
                <Eye className="w-4 h-4 mr-2" />
                Create More Visions
              </Button>
            </div>
          </div>
        )}

        {/* Example Section */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-green-800 mb-3 flex items-center gap-2">
            💡 Example Visualization Process
          </h4>
          <div className="space-y-3 text-green-700">
            <div>
              <p><strong>Initial Outcome:</strong> "I want the presentation to go well."</p>
            </div>
            <div>
              <p><strong>AI Enhancement:</strong> "Picture yourself presenting with confidence, your ideas flowing clearly. You see nods of understanding, feel the energy in the room shift as they grasp your vision. Walking out, you know you've made a real impact."</p>
            </div>
            <div>
              <p><strong>Aspects Explored:</strong> Visual (room energy), Emotional (confidence), Impact (real influence)</p>
            </div>
            <div>
              <p><strong>Result:</strong> A vivid, inspiring vision that feels both achievable and energizing</p>
            </div>
          </div>
        </div>
      </div>

      {/* Positive Outcome Modal */}
      <PositiveOutcomeModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        initialOutcome={currentOutcome}
        onCreateVision={handleCreateVision}
        onComplete={handleModalComplete}
      />
    </>
  );
}

// Helper function to get readable aspect labels
function getAspectLabel(aspect: string): string {
  const aspectLabels: Record<string, string> = {
    emotional: 'How it feels',
    visual: 'What you see',
    impact: 'The impact',
    sensory: 'What you experience'
  };
  return aspectLabels[aspect] || aspect;
}