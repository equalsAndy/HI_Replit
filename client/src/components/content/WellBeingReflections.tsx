import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, ChevronRight, ChevronDown, ChevronUp, Lightbulb, ListChecks } from 'lucide-react';
import { saveCantrilReflections, loadCantrilReflections } from '@/utils/saveCantrilReflections';

interface WellBeingReflectionsProps {
  onComplete?: () => void;
  setCurrentContent?: (content: string) => void;
  markStepCompleted?: (stepId: string) => void;
}

const getWellBeingPrompt = (reflectionIndex: number) => {
  const prompts = {
    1: {
      question: "What factors shape your current well-being rating?",
      instruction: "Reflect on the main elements contributing to your current well-being position on the ladder.",
      bullets: [
        "Work satisfaction and professional fulfillment",
        "Relationships with family, friends, and colleagues", 
        "Physical health and energy levels",
        "Financial security and stability",
        "Personal growth and learning opportunities",
        "Sense of purpose and meaning"
      ],
      examples: [
        "My current well-being is shaped by meaningful work that aligns with my strengths, supportive relationships with colleagues and family, good physical health through regular exercise, and financial stability. I feel energized when I can use my planning and analytical skills to solve complex problems.",
        "The main factors affecting my current position are a job that challenges me in the right ways, strong connections with my team, regular exercise that keeps me energized, and feeling financially secure. I also value the continuous learning opportunities in my role."
      ]
    },
    2: {
      question: "What improvements do you envision in one year?",
      instruction: "Describe specific achievements or changes that would make your life better and move you up the ladder.",
      bullets: [
        "Career advancement or new role opportunities",
        "Improved work-life balance and boundaries",
        "Stronger relationships and social connections",
        "Better health habits and physical wellness",
        "Enhanced skills and personal development",
        "Greater sense of purpose and impact"
      ],
      examples: [
        "In one year, I envision having greater autonomy in my role, leading a high-performing team that leverages everyone's strengths effectively, maintaining excellent work-life balance, and feeling confident about my career trajectory. I want to be recognized as a go-to person for strategic thinking and team development.",
        "I see myself in a role with more leadership responsibilities, having developed stronger public speaking skills, maintaining better work-life boundaries, and feeling more confident in my ability to influence positive change in my organization."
      ]
    },
    3: {
      question: "What will be noticeably different in your experience?",
      instruction: "Think about concrete, tangible changes you'll experience in your daily life.",
      bullets: [
        "Changes in daily routines and work patterns",
        "Different types of conversations and interactions",
        "New environments or settings you'll be in",
        "Enhanced confidence in specific situations",
        "Improved stress levels and emotional well-being",
        "Different ways you'll spend your time and energy"
      ],
      examples: [
        "I'll have more flexible work arrangements, be managing or mentoring team members, have completed a leadership development program, improved my public speaking skills, and established better boundaries between work and personal time. My stress levels will be lower and my sense of purpose higher.",
        "Daily life will include leading team meetings with confidence, having more strategic conversations, spending time mentoring others, maintaining consistent exercise routines, and feeling more relaxed during evenings and weekends due to better work boundaries."
      ]
    },
    4: {
      question: "What progress would you expect in 3 months?",
      instruction: "Identify one specific indicator that shows you're moving up the ladder.",
      bullets: [
        "Specific skills you'll have developed or improved",
        "New responsibilities or projects you'll have taken on",
        "Changes in how others interact with you",
        "Improvements in your daily routines or habits",
        "Enhanced confidence in particular areas",
        "Measurable outcomes or achievements"
      ],
      examples: [
        "I'll have initiated at least two process improvements using my analytical skills, received positive feedback on a leadership opportunity I've taken on, and established a consistent routine for professional development. I'll notice feeling more confident in meetings and decision-making.",
        "Within three months, I'll have completed my first major presentation to senior leadership, established weekly one-on-ones with my team members, and received feedback showing improved communication skills. I'll feel noticeably more confident in leadership situations."
      ]
    },
    5: {
      question: "What actions will you commit to this quarter?",
      instruction: "Name 1-2 concrete steps you'll take before your first quarterly check-in.",
      bullets: [
        "Specific learning opportunities you'll pursue",
        "New relationships or connections you'll build",
        "Projects or initiatives you'll volunteer for",
        "Skills practice or development activities",
        "Routine changes you'll implement",
        "Conversations or meetings you'll schedule"
      ],
      examples: [
        "I will schedule monthly one-on-ones with my manager to discuss growth opportunities, sign up for a leadership workshop or online course, volunteer to lead a cross-functional project, and implement a weekly planning routine that aligns my daily work with my long-term goals.",
        "This quarter, I'll enroll in a public speaking course, schedule bi-weekly coffee chats with colleagues in other departments, volunteer to present at our next team meeting, and establish a daily reflection practice to track my progress toward my well-being goals."
      ]
    }
  };

  return prompts[reflectionIndex as keyof typeof prompts] || { question: "", instruction: "", bullets: [], examples: [] };
};

export default function WellBeingReflections({ 
  onComplete, 
  setCurrentContent,
  markStepCompleted 
}: WellBeingReflectionsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [completedIndices, setCompletedIndices] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  
  // Expandable sections state
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showExamples, setShowExamples] = useState(false);
  const [userHasInteractedWithSuggestions, setUserHasInteractedWithSuggestions] = useState(false);
  const [userHasInteractedWithExamples, setUserHasInteractedWithExamples] = useState(false);

  // Build reflection configs
  const reflectionConfigs = React.useMemo(() => {
    return [1, 2, 3, 4, 5].map((reflectionNum) => {
      const promptData = getWellBeingPrompt(reflectionNum);
      
      return {
        id: `wellbeing-${reflectionNum}`,
        question: promptData.question,
        instruction: promptData.instruction,
        bullets: promptData.bullets,
        examples: promptData.examples,
        strengthColor: { bg: 'bg-purple-500', text: 'text-white', name: 'WELL-BEING' },
        minLength: 25,
      };
    });
  }, []);

  // Load existing reflections on mount
  useEffect(() => {
    const loadExistingReflections = async () => {
      setIsLoading(true);
      
      const existingReflections = await loadCantrilReflections();
      
      if (Object.keys(existingReflections).length > 0) {
        setResponses(existingReflections);
        // User has existing data, so they've interacted before
        setUserHasInteractedWithSuggestions(true);
        setUserHasInteractedWithExamples(true);
        
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
      } else {
        // No existing data - show suggestions for first-time users
        setShowSuggestions(true);
      }
      
      setIsLoading(false);
    };

    if (reflectionConfigs.length > 0) {
      loadExistingReflections();
    }
  }, [reflectionConfigs]);
  
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
      setIsEditing(true);
      // Bring editor back into view when jumping from lower in the list
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
  // Show editing mode if: not all completed OR user clicked on a reflection to edit
  const isEditingMode = !allReflectionsCompleted || isEditing;

  // Debug logging for completion state
  if (process.env.NODE_ENV === 'development') {
    console.log('🎯 WellBeingReflections Completion Check:');
    console.log('  - Current index:', currentIndex);
    console.log('  - Completed indices:', Array.from(completedIndices));
    console.log('  - All completed:', allCompleted);
    reflectionConfigs.forEach((config, index) => {
      const hasResponse = responses[config.id]?.trim().length >= (config.minLength || 25);
      const isMarkedComplete = completedIndices.has(index);
      console.log(`  - ${config.id}: response=${hasResponse}, marked=${isMarkedComplete}`);
    });
  }

  const handleComplete = async () => {
    if (!allCompleted) return;

    setIsSaving(true);
    try {
      // Save all reflections in single transaction
      const result = await saveCantrilReflections(responses);
      
      if (result.success) {
        console.log('✅ All well-being reflections saved successfully');
        
        // Navigate to future self step first
        markStepCompleted?.('3-1');
        onComplete?.();
        
        // Auto-scroll to final continue button after state updates and rendering completes
        setTimeout(() => {
          const continueButton = document.querySelector('[data-continue-button="true"]');
          if (continueButton) {
            continueButton.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'center' 
            });
          }
        }, 1000); // Increased delay to ensure DOM updates
        
      } else {
        console.error('❌ Failed to save well-being reflections:', result.error);
        alert('Failed to save reflections. Please try again.');
      }
    } catch (error) {
      console.error('❌ Error saving well-being reflections:', error);
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
        <p className="text-gray-600">Loading your well-being reflections...</p>
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
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Well-Being Reflection Questions
        </h2>
        <p className="text-lg text-gray-600 mb-4">
          Now that you've positioned yourself on the Cantril Ladder, reflect on the factors that shape 
          your current well-being and your vision for climbing higher.
        </p>
        <div className="text-base text-gray-500">
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

      {/* Current Reflection - Only show if not all completed or if editing a specific reflection */}
      {isEditingMode && (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-purple-500">
          <h3 className="text-xl font-bold text-white">
            {currentReflection.question}
          </h3>
        </div>

        <div className="p-6">
          {/* Main question instruction */}
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

          {/* Response Textarea - Enhanced */}
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
              ) : allReflectionsCompleted && isEditing ? (
                <Button
                  onClick={() => setIsEditing(false)}
                  className="bg-gray-600 hover:bg-gray-700 text-base px-6 py-3"
                >
                  Done Editing
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
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            Your Completed Reflections{!allReflectionsCompleted ? ' (click to edit)' : ''}:
          </h4>
          {!allReflectionsCompleted && (
            <p className="text-base text-gray-600 mb-4">Click on any completed reflection below to review and edit your response.</p>
          )}
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
                    <h5 className="font-semibold text-gray-900 mb-2 flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      {reflection.question}
                    </h5>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {response?.substring(0, 150)}
                      {response && response.length > 150 ? '...' : ''}
                    </p>
                  </button>
                );
              })}
          </div>
        </div>
      )}

      {/* Continue Button when all completed and not editing */}
      {allReflectionsCompleted && !isEditingMode && (
        <div className="mt-12 text-center border-t border-gray-200 pt-8">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Ready to Continue?</h4>
          <p className="text-gray-600 mb-6">You've completed all your well-being reflections. Continue to explore your Future Self.</p>
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
              'Continue to Future Self'
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
