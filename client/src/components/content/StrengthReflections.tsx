import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, ChevronRight } from 'lucide-react';
import { saveStrengthReflections, loadStrengthReflections } from '@/utils/saveStrengthReflections';

interface StrengthData {
  label: string;
  score: number;
  position: number;
}

interface StrengthReflectionsProps {
  strengths: StrengthData[];
  onComplete?: () => void;
  setCurrentContent?: (content: string) => void;
  markStepCompleted?: (stepId: string) => void;
}

const getStrengthColors = (label: string) => {
  switch (label.toUpperCase()) {
    case 'THINKING': return { bg: 'bg-green-500', text: 'text-white', name: 'THINKING' };
    case 'ACTING':   return { bg: 'bg-red-500',   text: 'text-white', name: 'ACTING' };
    case 'FEELING':  return { bg: 'bg-blue-500',  text: 'text-white', name: 'FEELING' };
    case 'PLANNING': return { bg: 'bg-yellow-500',text: 'text-white', name: 'PLANNING' };
    default:         return { bg: 'bg-gray-500', text: 'text-white', name: label.toUpperCase() };
  }
};

const getStrengthPrompt = (strengthLabel: string, position: number) => {
  const ordinal = position === 1 ? '1st' : position === 2 ? '2nd' : position === 3 ? '3rd' : '4th';
  
  const prompts = {
    THINKING: {
      instruction: "How and when do you use your Thinking strength?",
      bullets: [
        "Situations where your analytical skills uncovered insights",
        "How you've developed innovative solutions",
        "Times when your logical approach clarified complex issues",
        "How your strategic thinking opened new possibilities"
      ],
      examples: [
        "I use my analytical abilities when faced with ambiguous data. Recently, our team was trying to understand unusual customer behavior patterns, and I was able to identify the key variables and create a model that explained the trend.",
        "My innovative thinking helps when conventional approaches fall short. During a product development challenge, I suggested an entirely different framework that allowed us to reimagine the solution from first principles."
      ]
    },
    ACTING: {
      instruction: "How and when do you use your Acting strength?",
      bullets: [
        "Situations where you took initiative when others hesitated",
        "How you've turned ideas into tangible results",
        "Times when your decisiveness moved a project forward",
        "How your pragmatic approach solved practical problems"
      ],
      examples: [
        "I use my action-oriented approach when projects stall. Recently, our team was stuck in analysis paralysis, and I stepped in to create momentum by identifying the three most important next steps and delegating tasks.",
        "My decisive nature helps in crisis situations. During a recent system outage, I quickly prioritized recovery actions while others were still discussing options, which minimized downtime for our customers."
      ]
    },
    FEELING: {
      instruction: "How and when do you use your Feeling strength?",
      bullets: [
        "Situations where you built trust or resolved conflicts",
        "How you've created inclusive environments",
        "Times when your empathy improved team dynamics",
        "How your people-focused approach enhanced collaboration"
      ],
      examples: [
        "I use my relationship-building strengths when integrating new team members. Recently, I noticed a new colleague struggling to find their place, so I organized informal coffee chats and made sure to highlight their unique skills in meetings.",
        "My empathetic approach helps during difficult conversations. When we needed to deliver constructive feedback to a teammate, I focused on creating a safe space and framing the feedback as an opportunity for growth rather than criticism."
      ]
    },
    PLANNING: {
      instruction: "How and when do you use your Planning strength?",
      bullets: [
        "Situations where your organizational skills created clarity",
        "How you've implemented systems that improved efficiency",
        "Times when your structured approach prevented problems",
        "How your methodical nature helps maintain consistency"
      ],
      examples: [
        "I use my planning strength when our team takes on complex projects. Recently, I created a project timeline with clear milestones that helped everyone understand deadlines and dependencies, resulting in an on-time delivery.",
        "My methodical approach helps during busy periods. When our team faced multiple competing deadlines, I developed a prioritization framework that allowed us to focus on the most critical tasks first while keeping stakeholders informed."
      ]
    }
  };

  return prompts[strengthLabel as keyof typeof prompts] || { instruction: "", bullets: [], examples: [] };
};

export default function StrengthReflections({ 
  strengths, 
  onComplete, 
  setCurrentContent,
  markStepCompleted 
}: StrengthReflectionsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [completedIndices, setCompletedIndices] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Build reflection configs
  const reflectionConfigs = React.useMemo(() => {
    const strengthConfigs = strengths.map((s, i) => {
      const promptData = getStrengthPrompt(s.label.toUpperCase(), s.position);
      const strengthColor = getStrengthColors(s.label);
      
      return {
        id: `strength-${i+1}`,
        question: `Your ${s.position}${
          s.position === 1 ? 'st' : s.position === 2 ? 'nd' : s.position === 3 ? 'rd' : 'th'
        } strength is ${s.label.toUpperCase()}`,
        instruction: promptData.instruction,
        bullets: promptData.bullets,
        examples: promptData.examples,
        strengthColor,
        minLength: 25,
      };
    });

    const teamValuesConfig = {
      id: 'team-values',
      question: 'What You Value Most in Team Environments',
      instruction: 'Based on your strengths profile, certain team environments will help you perform at your best. Consider what team qualities or behaviors would complement your unique strengths distribution.',
      bullets: [
        'Team communication styles that work best for you',
        'The type of structure or flexibility you prefer',
        'How you like feedback to be given and received',
        'What makes you feel most supported and effective'
      ],
      examples: [
        'I thrive in team environments that balance structure with flexibility. I appreciate when teams establish clear expectations and deadlines, but also create space for adaptability when circumstances change.',
        'I value team environments where open communication is prioritized and every member\'s contributions are recognized. I work best when there\'s a culture of constructive feedback.'
      ],
      strengthColor: { bg: 'bg-orange-500', text: 'text-white', name: 'TEAM' },
      minLength: 25,
    };

    const uniqueContributionConfig = {
      id: 'unique-contribution',
      question: 'Your Unique Contribution',
      instruction: 'Your particular strengths profile creates a unique combination that you bring to your team. Think about how your top strengths work together to create value.',
      bullets: [
        'How your combination of strengths creates unique value',
        'What you bring that others might not',
        'How your perspective or approach differs from teammates',
        'The specific ways you help teams succeed'
      ],
      examples: [
        'I bring value through my combination of planning and empathy. I create structured processes while ensuring everyone feels heard and supported throughout implementation.',
        'My unique contribution comes from balancing analytical thinking with relationship building. This helps me develop solutions that are both technically sound and people-focused.'
      ],
      strengthColor: { bg: 'bg-purple-500', text: 'text-white', name: 'YOU' },
      minLength: 25,
    };

    return [...strengthConfigs, teamValuesConfig, uniqueContributionConfig];
  }, [strengths]);

  // Load existing reflections on mount
  useEffect(() => {
    const loadExistingReflections = async () => {
      setIsLoading(true);
      
      const existingReflections = await loadStrengthReflections();
      
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

  const handleResponseChange = async (value: string) => {
    if (!currentReflection) return;
    setResponses(prev => ({ ...prev, [currentReflection.id]: value }));
    
    // Auto-mark as completed if this is the last reflection and it meets minimum length
    const isLastReflection = currentIndex === reflectionConfigs.length - 1;
    const meetsMinLength = value.trim().length >= (currentReflection.minLength || 25);
    
    if (isLastReflection && meetsMinLength && !completedIndices.has(currentIndex)) {
      setCompletedIndices(prev => new Set([...prev, currentIndex]));
    }
    
    // Auto-save when editing completed reflections
    if (allReflectionsCompleted && isEditing) {
      const updatedResponses = { ...responses, [currentReflection.id]: value };
      try {
        await saveStrengthReflections(updatedResponses);
        console.log('✅ Auto-saved reflection:', currentReflection.id);
      } catch (error) {
        console.error('❌ Auto-save failed:', error);
      }
    }
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
    }
  };

  const allCompleted = reflectionConfigs.every((reflection, index) => {
    // Check if reflection is marked as completed OR if it's the current reflection and meets minimum length
    const isMarkedCompleted = completedIndices.has(index);
    const meetsMinLength = responses[reflection.id]?.trim().length >= (reflection.minLength || 25);
    const isCurrentAndValid = index === currentIndex && meetsMinLength;

    return (isMarkedCompleted || isCurrentAndValid) && meetsMinLength;
  });

  const handleComplete = async () => {
    if (!allCompleted) return;

    setIsSaving(true);
    try {
      // Save all reflections in single transaction
      const result = await saveStrengthReflections(responses);
      
      if (result.success) {
        console.log('✅ All reflections saved successfully');
        
        // Navigate to flow patterns
        markStepCompleted?.('2-1');
        setCurrentContent?.('flow-patterns');
        onComplete?.();
      } else {
        console.error('❌ Failed to save reflections:', result.error);
        alert('Failed to save reflections. Please try again.');
      }
    } catch (error) {
      console.error('❌ Error saving reflections:', error);
      alert('Failed to save reflections. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading your reflections...</p>
        <p className="text-sm text-gray-400 mt-2">Check console for loading details</p>
      </div>
    );
  }

  // Debug info (remove in production)
  if (process.env.NODE_ENV === 'development') {
    console.log('🎯 StrengthReflections Render State:');
    console.log('  - completedIndices:', Array.from(completedIndices));
    console.log('  - allCompleted:', allCompleted);
  }

  if (!currentReflection) {
    return <div>No reflections available</div>;
  }

  // Check if all reflections are completed and we're just viewing
  const allReflectionsCompleted = completedIndices.size === reflectionConfigs.length;
  // Show editing mode if: not all completed OR user clicked on a reflection to edit
  const isEditingMode = !allReflectionsCompleted || isEditing;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Reflect on Your Strengths</h2>
        <p className="text-lg text-gray-600 mb-4">
          Take time to reflect deeply on how your strengths show up in your life and work. 
          Understanding how your unique strengths work together helps you maximize your potential.
        </p>
        <div className="text-sm text-gray-500">
          {completedIndices.size} of {reflectionConfigs.length} completed
        </div>
      </div>

      {/* Progress Dots */}
      <div className="mb-8 flex justify-center">
        <div className="flex space-x-3">
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
                  w-16 h-16 rounded flex items-center justify-center text-xs font-bold transition-all border-2
                  ${isCompleted
                    ? `${reflection.strengthColor?.bg} text-white border-white shadow-md`
                    : isCurrent
                      ? `${reflection.strengthColor?.bg} text-white border-white shadow-lg`
                      : canAccess
                        ? 'bg-gray-200 text-gray-700 hover:bg-gray-300 border-gray-300'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
                  }
                `}
              >
                <span className="text-center leading-tight">
                  {index < 4 ? (
                    // StarCard-style strength squares
                    reflection.strengthColor?.name || `STR${index + 1}`
                  ) : index === 4 ? (
                    // Team Values square
                    'TEAM'
                  ) : (
                    // Unique Contribution square
                    'YOU'
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Current Reflection - Only show if not all completed or if editing a specific reflection */}
      {isEditingMode && (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className={`px-6 py-4 border-b border-gray-200 ${currentReflection.strengthColor?.bg || 'bg-gray-50'}`}>
            <h3 className={`text-xl font-bold ${currentReflection.strengthColor?.text || 'text-gray-900'}`}>
              {currentReflection.question}
            </h3>
          </div>

          <div className="p-6">
            {/* Instruction and guidance */}
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-3">{currentReflection.instruction}</h4>
              
              {currentReflection.bullets.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Consider reflecting on:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                    {currentReflection.bullets.map((bullet, index) => (
                      <li key={index}>{bullet}</li>
                    ))}
                  </ul>
                </div>
              )}

              {currentReflection.examples.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Examples:</p>
                  {currentReflection.examples.map((example, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded text-sm text-gray-700 mb-2 italic">
                      "{example}"
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Textarea */}
            <div className="mb-6">
              <textarea
                ref={textareaRef}
                value={currentResponse}
                onChange={(e) => handleResponseChange(e.target.value)}
                placeholder="Share your thoughts here..."
                className="w-full min-h-[150px] p-4 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isSaving}
              />
              <div className="flex justify-between mt-2">
                <div className="text-sm text-gray-500">
                  {currentResponse.trim().length} characters
                  {currentReflection.minLength && (
                    <span className="ml-2">(minimum {currentReflection.minLength})</span>
                  )}
                </div>
                {isCurrentComplete && (
                  <div className="text-sm text-green-600 flex items-center">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Complete
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500">
                Reflection {currentIndex + 1} of {reflectionConfigs.length}
                {allReflectionsCompleted && isEditing && (
                  <span className="ml-2 text-blue-600">• Editing</span>
                )}
              </div>
              
              <div className="space-x-3">
                {allReflectionsCompleted && isEditing ? (
                  <Button
                    onClick={() => setIsEditing(false)}
                    className="bg-gray-600 hover:bg-gray-700"
                  >
                    Done Editing
                  </Button>
                ) : currentIndex < reflectionConfigs.length - 1 ? (
                  <Button
                    onClick={handleNext}
                    disabled={!isCurrentComplete || isSaving}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300"
                  >
                    Next <ChevronRight className="ml-1 w-4 h-4" />
                  </Button>
                ) : allCompleted ? (
                  <Button
                    onClick={handleComplete}
                    disabled={isSaving}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-green-400"
                  >
                    {isSaving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      'Continue to Flow Patterns'
                    )}
                  </Button>
                ) : (
                  <Button disabled className="bg-gray-300 cursor-not-allowed">
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
          <h4 className="text-lg font-semibold text-gray-900 mb-2">Your Completed Reflections:</h4>
          <p className="text-sm text-gray-600 mb-4">Click on any completed reflection below to review and edit your response.</p>
          <div className="space-y-3">
            {Array.from(completedIndices)
              .sort((a, b) => a - b)
              .map(index => {
                const reflection = reflectionConfigs[index];
                const response = responses[reflection.id];
                
                return (
                  <button
                    key={reflection.id}
                    onClick={() => {
                      setCurrentIndex(index);
                      // Force editing mode when clicking on a completed reflection
                      if (allReflectionsCompleted) {
                        setIsEditing(true);
                      }
                    }}
                    className="w-full bg-gray-50 hover:bg-gray-100 rounded-lg p-4 border text-left transition-colors"
                  >
                    <h5 className="font-semibold text-gray-900 mb-2 flex items-center">
                      <div className={`w-16 h-16 rounded flex items-center justify-center text-xs font-bold text-white mr-3 ${reflection.strengthColor?.bg}`}>
                        {index < 4 ? (
                          reflection.strengthColor?.name || `STR${index + 1}`
                        ) : index === 4 ? (
                          'TEAM'
                        ) : (
                          'YOU'
                        )}
                      </div>
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
        <div className="mt-8 text-center">
          <Button
            onClick={handleComplete}
            disabled={isSaving}
            className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-lg px-8 py-3"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              'Continue to Flow Patterns'
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
