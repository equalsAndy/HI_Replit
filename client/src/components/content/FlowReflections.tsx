import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, ChevronRight, ChevronDown, ChevronUp, Lightbulb, ListChecks } from 'lucide-react';
import { saveFlowReflections, loadFlowReflections } from '@/utils/saveFlowReflections';

interface FlowReflectionsProps {
  onComplete?: () => void;
  setCurrentContent?: (content: string) => void;
  markStepCompleted?: (stepId: string) => void;
}

const getFlowPrompt = (flowIndex: number) => {
  const prompts = {
    1: {
      question: "When does flow happen most naturally for you?",
      instruction: "Reflect on when you get 'in the zone' and lose track of time. What activities or conditions create this experience?",
      bullets: [
        "Specific activities or types of work that engage you deeply",
        "Time of day when you feel most focused and energized",
        "Environmental conditions that support your concentration",
        "Types of challenges that capture your full attention"
      ],
      examples: [
        "Flow happens most naturally for me when I'm working on complex problem-solving tasks that require deep thinking. Usually in the morning when my mind is fresh, especially when I have a clear challenge to work through and minimal interruptions.",
        "When I'm working on a creative problem or designing something new, I often lose track of time. I also experience flow when I'm fully engaged in deep conversations with my team about important projects."
      ]
    },
    2: {
      question: "What typically blocks or interrupts your flow state?",
      instruction: "Consider what prevents you from getting into flow or pulls you out when you're already there.",
      bullets: [
        "External interruptions and distractions that break your concentration",
        "Internal thoughts or worries that pull your attention away",
        "Environmental factors that make it hard to focus",
        "Task characteristics that prevent deep engagement"
      ],
      examples: [
        "Constant notifications, meetings that could have been emails, and unclear project requirements really disrupt my flow. Also when I'm working on tasks that don't match my strengths or when there's too much context switching between different types of work.",
        "Constant notifications, interruptions from colleagues, and switching between too many tasks at once. Also, when I'm feeling overwhelmed or when the task feels either too easy or impossibly difficult."
      ]
    },
    3: {
      question: "What conditions help you get into flow more easily?",
      instruction: "Think about your environment, mindset, time of day, or other factors that make flow more accessible.",
      bullets: [
        "Physical environment and workspace setup that supports focus",
        "Mental preparation or routines that help you concentrate",
        "Resources and tools that need to be readily available",
        "Personal energy and motivation factors"
      ],
      examples: [
        "I need a quiet environment, clear goals for what I'm trying to accomplish, and ideally 2-3 hours of uninterrupted time. Having all my resources and tools easily accessible also helps me get into flow more quickly.",
        "A quiet environment, clear objectives, having all the resources I need available, and feeling well-rested. Music also helps me focus, and working during my peak energy hours in the morning."
      ]
    },
    4: {
      question: "How could you create more opportunities for flow in your work and life?",
      instruction: "Consider specific changes or practices you could implement to experience flow more regularly.",
      bullets: [
        "Changes to your schedule or workflow to protect flow time",
        "Environmental modifications that would support deeper focus",
        "Communication strategies to minimize interruptions",
        "Personal practices to optimize your readiness for flow"
      ],
      examples: [
        "I could block out specific deep work hours on my calendar, turn off notifications during focused work periods, and better align my most challenging tasks with my peak energy times. I'd also advocate for fewer but more meaningful meetings.",
        "I could set specific blocks of uninterrupted time for deep work, turn off notifications during focused work periods, and break larger projects into smaller, manageable challenges that match my skill level."
      ]
    }
  };

  return prompts[flowIndex as keyof typeof prompts] || { question: "", instruction: "", bullets: [], examples: [] };
};

export default function FlowReflections({ 
  onComplete, 
  setCurrentContent,
  markStepCompleted 
}: FlowReflectionsProps) {
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
    return [1, 2, 3, 4].map((flowNum) => {
      const promptData = getFlowPrompt(flowNum);
      
      return {
        id: `flow-${flowNum}`,
        question: promptData.question,
        instruction: promptData.instruction,
        bullets: promptData.bullets,
        examples: promptData.examples,
        strengthColor: { bg: 'bg-indigo-500', text: 'text-white', name: 'FLOW REFLECTION' },
        minLength: 25,
      };
    });
  }, []);

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
      
      const existingReflections = await loadFlowReflections();
      
      if (Object.keys(existingReflections).length > 0) {
        setResponses(existingReflections);
        
        // Mark completed reflections
        const completed = new Set<number>();
        reflectionConfigs.forEach((config, index) => {
          if (existingReflections[config.id]?.trim()) {
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
  const isCurrentComplete = currentResponse.trim().length >= (currentReflection?.minLength || 25);

  const handleResponseChange = (value: string) => {
    if (!currentReflection) return;
    setResponses(prev => ({ ...prev, [currentReflection.id]: value }));
    // Removed auto-completion logic that was causing premature completion
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
      // Bring the editor back into view when jumping from lower on the page
      setTimeout(() => {
        topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 0);
    }
  };

  const allCompleted = reflectionConfigs.every((reflection, index) => {
    const hasResponse = responses[reflection.id]?.trim().length >= (reflection.minLength || 25);
    const isMarkedComplete = completedIndices.has(index);
    return hasResponse && isMarkedComplete;
  });

  // Check if all reflections completed for UI control
  const allReflectionsCompleted = completedIndices.size === reflectionConfigs.length;

  const handleComplete = async () => {
    if (!allCompleted) return;

    setIsSaving(true);
    try {
      // Save all reflections in single transaction
      const result = await saveFlowReflections(responses);

      if (result.success) {
        console.log('✅ All flow reflections saved successfully');

        // Mark step 2-2 as completed and wait for navigation to update
        // The markStepCompleted function will auto-advance to 2-4 (module-2-recap)
        console.log('🎯 FlowReflections: Marking step 2-2 as completed');
        await markStepCompleted?.('2-2');

        // Set content to module-2-recap (step 2-4) after step completion
        console.log('🎯 FlowReflections: Setting current content to module-2-recap');
        setCurrentContent?.('module-2-recap');
        onComplete?.();

        // Auto-scroll to top after navigation
        setTimeout(() => {
          document.getElementById('content-top')?.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }, 100);

      } else {
        console.error('❌ Failed to save flow reflections:', result.error);
        alert('Failed to save reflections. Please try again.');
      }
    } catch (error) {
      console.error('❌ Error saving flow reflections:', error);
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading your flow reflections...</p>
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
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Reflect on Your Flow State</h2>
        <p className="text-lg text-gray-600 mb-4">
          Now that you understand flow principles, reflect on your personal experience with flow states
          and how you can create more opportunities for deep engagement.
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
                      ? 'bg-indigo-500 text-white'
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
          <div className="px-6 py-4 border-b border-gray-200 bg-indigo-500">
            <h3 className="text-2xl font-bold text-white">
              {currentReflection.question}
            </h3>
          </div>

          <div className="p-6">
            {/* Main Instruction - larger font */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">{currentReflection.instruction}</h4>
              
              {/* Expandable Suggestions Section */}
              {currentReflection.bullets.length > 0 && (
                <div className="mb-4">
                  <button
                    onClick={toggleSuggestions}
                    className="flex items-center w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border transition-all duration-200"
                  >
                    <ListChecks className="w-5 h-5 text-indigo-600 mr-3" />
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

            {/* Textarea - Enhanced */}
            <div className="mb-6">
              <label className="block text-lg font-medium text-gray-900 mb-3">
                Your Response
              </label>
              <textarea
                ref={textareaRef}
                value={currentResponse}
                onChange={(e) => handleResponseChange(e.target.value)}
                placeholder="Share your thoughts here..."
                className="w-full min-h-[180px] p-4 text-base leading-relaxed border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
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
                    className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-base px-6 py-3"
                  >
                    Next <ChevronRight className="ml-2 w-5 h-5" />
                  </Button>
                ) : !completedIndices.has(currentIndex) && isCurrentComplete ? (
                  <Button
                    onClick={handleNext}
                    disabled={isSaving}
                    className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-base px-6 py-3"
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
        <div className={allReflectionsCompleted ? "mt-8" : "mt-8"}>
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

      {/* Continue Button - positioned clearly after completed reflections */}
      {allCompleted && (
        <div className="mt-12 text-center border-t border-gray-200 pt-8">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Ready to Continue?</h4>
          <p className="text-gray-600 mb-6">You've completed all your flow reflections. Continue to Module Recap.</p>
          <Button
            onClick={handleComplete}
            disabled={isSaving}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 text-primary-foreground h-10 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-lg px-8 py-3"
            data-continue-button="true"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              'Continue to Module Recap'
            )}
          </Button>
        </div>
      )}
    </div>
  );
};
