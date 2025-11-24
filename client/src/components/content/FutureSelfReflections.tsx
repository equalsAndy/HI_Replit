import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, ChevronRight, ChevronDown, ChevronUp, Lightbulb, ListChecks } from 'lucide-react';
import { saveFutureSelfComplete, loadFutureSelfComplete } from '@/utils/saveFutureSelfReflections';

interface FutureSelfReflectionsProps {
  onComplete?: () => void;
  setCurrentContent?: (content: string) => void;
  markStepCompleted?: (stepId: string) => void;
  imageCount?: number; // Add imageCount prop
}

const getFutureSelfPrompt = (reflectionIndex: number, imageCount: number = 1) => {
  const prompts = {
    1: {
      question: imageCount === 1 ? "What does your selected image mean to you?" : "What do your selected images mean to you?",
      instruction: imageCount === 1 
        ? "Reflect on the deeper meaning and personal significance of the image you chose to represent your future self."
        : "Reflect on the deeper meaning and personal significance of the images you chose to represent your future self.",
      bullets: imageCount === 1 ? [
        "What emotions or feelings does this image evoke in you?",
        "How does this image connect to your aspirations and goals?",
        "What specific elements in the image resonate with your vision?",
        "What does this image represent about your ideal future state?"
      ] : [
        "What emotions or feelings do these images evoke in you?",
        "How do these images connect to your aspirations and goals?",
        "What specific elements in the images resonate with your vision?",
        "What do these images represent about your ideal future state?"
      ],
      examples: imageCount === 1 ? [
        "This image of a mountain peak represents my aspiration to reach new heights in my leadership abilities. The vastness of the view symbolizes the broader perspective I want to develop, and the journey to reach the summit reflects my commitment to continuous growth and perseverance.",
        "The image of a thriving garden speaks to my desire to cultivate meaningful relationships and nurture growth in others. Each plant represents someone I've helped develop, and the interconnected ecosystem reflects how I want to create collaborative, supportive environments."
      ] : [
        "These images work together to represent my multifaceted vision. The mountain peak shows my aspiration for leadership growth, while the garden represents my commitment to nurturing others. Together, they capture both my personal development goals and my desire to create positive impact.",
        "I chose these images because they complement each other - one represents my professional ambitions and strategic thinking, while the other reflects my values around collaboration and community building. They show different aspects of who I want to become."
      ]
    },
    2: {
      question: "Describe Your Future Self",
      instruction: "Write 3 or 4 sentences about who you imagine becoming. Use these prompts to guide you:",
      bullets: [
        "In 5 years, what capacities or qualities are you developing?",
        "What does life look like when aligned with flow and well-being?",
        "How are you contributing to others — team, family, or community?"
      ],
      examples: [
        "In 5 years, I see myself growing into a confident leader who creates psychological safety for my team. My life aligned with flow involves dedicated time for deep work, meaningful collaboration, and continuous learning. I contribute to others by mentoring junior colleagues and helping my organization become more human-centered.",
        "I'm developing into someone who balances strategic thinking with empathetic leadership. My days are structured around my peak energy times, with clear boundaries between focused work and collaborative time. I contribute by building bridges between different teams and helping translate complex ideas into actionable plans."
      ]
    }
  };

  return prompts[reflectionIndex as keyof typeof prompts] || { question: "", instruction: "", bullets: [], examples: [] };
};

const FutureSelfReflections: React.FC<FutureSelfReflectionsProps> = ({
  onComplete,
  setCurrentContent,
  markStepCompleted,
  imageCount = 1 // Default to 1 if not provided
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [completedIndices, setCompletedIndices] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Expandable section states
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showExamples, setShowExamples] = useState(false);
  const [userHasInteractedWithSuggestions, setUserHasInteractedWithSuggestions] = useState(false);
  const [userHasInteractedWithExamples, setUserHasInteractedWithExamples] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const topRef = useRef<HTMLDivElement>(null);

  // Build reflection configs
  const reflectionConfigs = React.useMemo(() => {
    return [1, 2].map((reflectionNum) => {
      const promptData = getFutureSelfPrompt(reflectionNum, imageCount);
      console.log(`Building config for reflection ${reflectionNum}:`, promptData.question);

      return {
        id: reflectionNum === 1 ? 'image-meaning' : 'future-self-1',
        question: promptData.question,
        instruction: promptData.instruction,
        bullets: promptData.bullets,
        examples: promptData.examples,
        strengthColor: { bg: 'bg-purple-500', text: 'text-white', name: 'FUTURE SELF REFLECTION' },
        minLength: 50,
      };
    });
  }, [imageCount]);

  // Smart defaults: Auto-expand suggestions for first reflection if user hasn't interacted
  useEffect(() => {
    if (currentIndex === 0 && !userHasInteractedWithSuggestions && !userHasInteractedWithExamples) {
      setShowSuggestions(true);
    }
  }, [currentIndex, userHasInteractedWithSuggestions, userHasInteractedWithExamples]);

  // Reset expandable states when changing reflections, but respect user preferences
  useEffect(() => {
    // Only reset if user hasn't set their preferences
    if (!userHasInteractedWithSuggestions && !userHasInteractedWithExamples) {
      setShowSuggestions(currentIndex === 0); // Show for first reflection
      setShowExamples(false);
    }
  }, [currentIndex, userHasInteractedWithSuggestions, userHasInteractedWithExamples]);

  // Load existing reflections on mount
  useEffect(() => {
    const loadExistingReflections = async () => {
      setIsLoading(true);

      const existingData = await loadFutureSelfComplete();

      if (Object.keys(existingData.reflections).length > 0 || existingData.imageData.imageMeaning) {
        const allResponses = {
          'image-meaning': existingData.imageData.imageMeaning || '',
          'future-self-1': existingData.reflections['future-self-1'] || ''
        };
        setResponses(allResponses);

        // Mark completed reflections
        const completed = new Set<number>();
        reflectionConfigs.forEach((config, index) => {
          if (allResponses[config.id]?.trim()) {
            completed.add(index);
          }
        });
        setCompletedIndices(completed);

        // Start from first incomplete reflection
        let startIndex = 0;
        for (let i = 0; i < reflectionConfigs.length; i++) {
          if (!completed.has(i)) {
            startIndex = i;
            break;
          }
        }
        setCurrentIndex(startIndex);
      }

      setIsLoading(false);
    };

    if (reflectionConfigs.length > 0) {
      loadExistingReflections();
    }
  }, [reflectionConfigs]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [responses, currentIndex]);

  const currentReflection = reflectionConfigs[currentIndex];
  const currentResponse = responses[currentReflection?.id] || '';
  const isCurrentComplete = currentResponse.trim().length >= (currentReflection?.minLength || 50);

  const handleResponseChange = (value: string) => {
    if (!currentReflection) return;
    setResponses(prev => ({ ...prev, [currentReflection.id]: value }));
  };

  const handleNext = () => {
    if (!isCurrentComplete) return;

    // Mark current as completed
    setCompletedIndices(prev => new Set([...prev, currentIndex]));

    // Move to next reflection or stay if at end
    if (currentIndex < reflectionConfigs.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleReflectionClick = (index: number) => {
    // Allow clicking on completed reflections or next in sequence
    const canAccess = completedIndices.has(index) || index <= Math.max(...Array.from(completedIndices), -1) + 1;
    if (canAccess) {
      setCurrentIndex(index);
      // Bring the editor back into view when jumping from summaries
      setTimeout(() => {
        topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 0);
    }
  };

  const allCompleted = reflectionConfigs.every((reflection, index) => {
    const hasResponse = responses[reflection.id]?.trim().length >= (reflection.minLength || 50);
    const isMarkedComplete = completedIndices.has(index);
    return hasResponse && isMarkedComplete;
  });

  // Check if all reflections completed for UI control
  const allReflectionsCompleted = completedIndices.size === reflectionConfigs.length;

  const handleComplete = async () => {
    if (!allCompleted) return;

    setIsSaving(true);
    try {
      // Save all reflections with image data
      // Get existing image data first
      const existingData = await loadFutureSelfComplete();
      
      const reflectionsData = {
        'future-self-1': responses['future-self-1'] || ''
      };

      const imageData = {
        selectedImages: existingData.imageData.selectedImages, // Preserve existing images
        imageMeaning: responses['image-meaning'] || ''
      };

      const result = await saveFutureSelfComplete(reflectionsData, imageData);

      if (result.success) {
        console.log('✅ All future self reflections saved successfully');

        markStepCompleted?.('3-2');

        // Navigate to final reflection (3-4)
        setTimeout(() => {
          setCurrentContent?.('final-reflection');
          onComplete?.();

          // Auto-scroll to final continue button after navigation and rendering completes
          setTimeout(() => {
            const continueButton = document.querySelector('[data-continue-button="true"]');
            if (continueButton) {
              continueButton.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
              });
            }
          }, 500);
        }, 100);

      } else {
        console.error('❌ Failed to save future self reflections:', result.error);
        alert('Failed to save reflections. Please try again.');
      }
    } catch (error) {
      console.error('❌ Error saving future self reflections:', error);
      alert('Failed to save reflections. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle expandable section toggles
  const toggleSuggestions = () => {
    setShowSuggestions(!showSuggestions);
    setUserHasInteractedWithSuggestions(true);
  };

  const toggleExamples = () => {
    setShowExamples(!showExamples);
    setUserHasInteractedWithExamples(true);
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading your future self reflections...</p>
      </div>
    );
  }

  if (!currentReflection) {
    return <div>No reflections available</div>;
  }

  return (
    <div className="max-w-4xl mx-auto" ref={topRef}>
      {/* Header */}
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Future Self Reflections</h2>
        <p className="text-lg text-gray-600 mb-4">
          Reflect on the meaning of your selected image and envision your future self living
          a flow-aligned life of growth and contribution.
        </p>
        <div className="text-sm text-gray-500">
          {completedIndices.size} of {reflectionConfigs.length} completed
        </div>
      </div>

      {/* Progress Dots */}
      <div className="mb-8 flex justify-center">
        <div className="flex space-x-2">
          {reflectionConfigs.map((reflection, index) => {
            const isCompleted = completedIndices.has(index);
            const isCurrent = index === currentIndex;
            const canAccess = isCompleted || index <= Math.max(...Array.from(completedIndices), -1) + 1;

            return (
              <button
                key={reflection.id}
                onClick={() => handleReflectionClick(index)}
                disabled={!canAccess}
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all
                  ${isCompleted
                    ? 'bg-green-500 text-white'
                    : isCurrent
                      ? 'bg-purple-500 text-white'
                      : canAccess
                        ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }
                `}
              >
                {isCompleted ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  index + 1
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Current Reflection - Only show if not all completed */}
      {!allReflectionsCompleted && (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-purple-500">
          <h3 className="text-2xl font-bold text-white">
            {currentReflection.question}
          </h3>
        </div>

        <div className="p-6">
          {/* Main Instruction */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">{currentReflection.instruction}</h4>

            {/* Expandable Suggestions Section */}
            {currentReflection.bullets.length > 0 && (
              <div className="mb-4">
                <button
                  onClick={toggleSuggestions}
                  className="flex items-center w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border transition-all duration-200"
                >
                  <ListChecks className="w-5 h-5 text-purple-600 mr-3" />
                  <span className="text-base font-medium text-gray-800 flex-1">
                    Reflection Inspiration
                  </span>
                  {showSuggestions ? (
                    <ChevronUp className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  )}
                </button>

                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  showSuggestions ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}>
                  <div className="pt-4 pl-11">
                    <p className="text-base text-gray-600 mb-3">Consider reflecting on:</p>
                    <ul className="list-disc list-inside space-y-2 text-base text-gray-700">
                      {currentReflection.bullets.map((bullet, index) => (
                        <li key={index} className="leading-relaxed">{bullet}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Expandable Examples Section */}
            {currentReflection.examples.length > 0 && (
              <div className="mb-4">
                <button
                  onClick={toggleExamples}
                  className="flex items-center w-full text-left p-3 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-all duration-200"
                >
                  <Lightbulb className="w-5 h-5 text-blue-600 mr-3" />
                  <span className="text-base font-medium text-gray-800 flex-1">
                    Example Responses
                  </span>
                  {showExamples ? (
                    <ChevronUp className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  )}
                </button>

                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  showExamples ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}>
                  <div className="pt-4 pl-11">
                    {currentReflection.examples.map((example, index) => (
                      <div key={index} className="bg-blue-50 p-4 rounded-lg text-base text-gray-700 mb-3 italic leading-relaxed border-l-4 border-blue-300">
                        "{example}"
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Textarea */}
          <div className="mb-6">
            <label className="block text-lg font-medium text-gray-900 mb-3">
              Your Response
            </label>
            <textarea
              ref={textareaRef}
              value={currentResponse}
              onChange={(e) => handleResponseChange(e.target.value)}
              placeholder="Share your thoughts here..."
              className="w-full min-h-[180px] p-4 text-base leading-relaxed border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
              disabled={isSaving}
            />
            <div className="flex justify-between mt-3">
              <div className="text-base text-gray-500">
                {currentResponse.trim().length} characters
                {currentReflection.minLength && (
                  <span className="ml-2">(minimum {currentReflection.minLength})</span>
                )}
              </div>
              {isCurrentComplete && (
                <div className="text-base text-green-600 flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Complete
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center">
            <div className="text-base text-gray-500">
              Reflection {currentIndex + 1} of {reflectionConfigs.length}
            </div>

            <div className="space-x-3">
              {currentIndex < reflectionConfigs.length - 1 ? (
                <Button
                  onClick={handleNext}
                  disabled={!isCurrentComplete || isSaving}
                  className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-base px-6 py-3"
                >
                  Next <ChevronRight className="ml-2 w-5 h-5" />
                </Button>
              ) : !completedIndices.has(currentIndex) && isCurrentComplete ? (
                <Button
                  onClick={handleNext}
                  disabled={isSaving}
                  className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-base px-6 py-3"
                >
                  Mark Complete <ChevronRight className="ml-2 w-5 h-5" />
                </Button>
              ) : (
                <Button disabled className="bg-gray-300 cursor-not-allowed text-base px-6 py-3">
                  Complete all reflections to continue
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Completed Reflections Summary */}
      {completedIndices.size > 0 && (
        <div className="mt-8">
          <h4 className="text-xl font-semibold text-gray-900 mb-4">Your Completed Reflections:</h4>
          <div className="space-y-3">
            {Array.from(completedIndices)
              .sort((a, b) => a - b)
              .map(index => {
                const reflection = reflectionConfigs[index];
                const response = responses[reflection.id];

                return (
                  <button
                    key={reflection.id}
                    onClick={() => handleReflectionClick(index)}
                    className="w-full bg-gray-50 hover:bg-gray-100 rounded-lg p-4 border text-left transition-colors"
                  >
                    <h5 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                      {reflection.question}
                    </h5>
                    <p className="text-base text-gray-600 line-clamp-2 leading-relaxed">
                      {response?.substring(0, 150)}
                      {response && response.length > 150 ? '...' : ''}
                    </p>
                  </button>
                );
              })}
          </div>
        </div>
      )}

      {/* Continue to Final Reflection */}
      {allCompleted && (
        <div className="mt-12 border-t border-gray-200 pt-8">
          <div className="text-center">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Ready to Continue?</h4>
            <p className="text-gray-600 mb-6">
              You've completed both future self reflections. Your next step will be to create your intention statement in Your Final Reflection.
            </p>
            <Button
              onClick={handleComplete}
              disabled={isSaving}
              className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-lg px-8 py-3"
              data-continue-button="true"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                'Continue to Your Final Reflection'
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FutureSelfReflections;
