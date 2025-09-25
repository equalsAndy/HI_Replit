import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, ChevronRight } from 'lucide-react';

interface ReflectionConfig {
  id: string;
  question: string;
  instruction: string;
  bullets: string[];
  examples: string[];
  strengthColor?: {
    bg: string;
    border: string;
    text: string;
    name: string;
  };
  minLength?: number;
}

interface ProgressiveReflectionProps {
  reflections: ReflectionConfig[];
  onComplete: (allReflections: Record<string, string>) => void;
  initialValues?: Record<string, string>;
  completionButtonText?: string;
  className?: string;
  title?: string;
  description?: string;
}

export default function ProgressiveReflection({
  reflections,
  onComplete,
  initialValues = {},
  completionButtonText = "Continue",
  className = "",
  title = "Reflections",
  description = "Complete each reflection to continue."
}: ProgressiveReflectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, string>>(initialValues);
  const [completedIndices, setCompletedIndices] = useState<Set<number>>(new Set());
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Initialize completed indices based on initial values
  useEffect(() => {
    const completed = new Set<number>();
    reflections.forEach((reflection, index) => {
      if (initialValues[reflection.id]?.trim()) {
        completed.add(index);
      }
    });
    setCompletedIndices(completed);
    
    // If user has some completed reflections, start from the first incomplete one
    let startIndex = 0;
    for (let i = 0; i < reflections.length; i++) {
      if (!completed.has(i)) {
        startIndex = i;
        break;
      }
    }
    setCurrentIndex(startIndex);
  }, [reflections, initialValues]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [responses, currentIndex]);

  const currentReflection = reflections[currentIndex];
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
    
    // Move to next uncompleted reflection or stay at current if all are done
    let nextIndex = currentIndex;
    for (let i = currentIndex + 1; i < reflections.length; i++) {
      if (!completedIndices.has(i) && responses[reflections[i].id]?.trim().length < (reflections[i].minLength || 25)) {
        nextIndex = i;
        break;
      }
    }
    
    // If no more uncompleted reflections, move to next available slot
    if (nextIndex === currentIndex && currentIndex < reflections.length - 1) {
      nextIndex = currentIndex + 1;
    }
    
    setCurrentIndex(nextIndex);
  };

  const handleReflectionClick = (index: number) => {
    // Allow clicking on any reflection that's completed or is the next in sequence
    const canAccess = completedIndices.has(index) || index <= Math.max(...Array.from(completedIndices), -1) + 1;
    if (canAccess) {
      setCurrentIndex(index);
    }
  };

  const allCompleted = reflections.every((reflection, index) => 
    completedIndices.has(index) && responses[reflection.id]?.trim().length >= (reflection.minLength || 25)
  );

  const handleComplete = () => {
    if (allCompleted) {
      onComplete(responses);
    }
  };

  if (!currentReflection) {
    return <div>No reflections available</div>;
  }

  return (
    <div className={`max-w-4xl mx-auto ${className}`}>
      {/* Header */}
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">{title}</h2>
        <p className="text-lg text-gray-600">{description}</p>
        <div className="flex justify-center mt-4">
          <div className="text-sm text-gray-500">
            {completedIndices.size} of {reflections.length} completed
          </div>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex justify-center">
          <div className="flex space-x-2">
            {reflections.map((reflection, index) => {
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
                        ? reflection.strengthColor?.bg.replace('bg-', 'bg-') + ' text-white' || 'bg-blue-500 text-white'
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
      </div>

      {/* Current Reflection */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        {/* Header with strength color if available */}
        <div className={`px-6 py-4 border-b border-gray-200 ${currentReflection.strengthColor?.bg || 'bg-gray-50'}`}>
          <h3 className={`text-xl font-bold ${currentReflection.strengthColor?.text || 'text-gray-900'}`}>
            {currentReflection.question}
          </h3>
        </div>

        <div className="p-6">
          {/* Instruction */}
          <div className="mb-6">
            <h4 className="font-semibold text-gray-900 mb-3">{currentReflection.instruction}</h4>
            
            {/* Bullets */}
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

            {/* Examples */}
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

          {/* Response Textarea */}
          <div className="mb-6">
            <textarea
              ref={textareaRef}
              value={currentResponse}
              onChange={(e) => handleResponseChange(e.target.value)}
              placeholder="Share your thoughts here..."
              className="w-full min-h-[150px] p-4 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              style={{ minHeight: '150px' }}
            />
            <div className="flex justify-between mt-2">
              <div className="text-sm text-gray-500">
                {currentResponse.trim().length} characters
                {currentReflection.minLength && (
                  <span className="ml-2">
                    (minimum {currentReflection.minLength} characters)
                  </span>
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
          <div className="flex justify-between">
            <div className="text-sm text-gray-500">
              Reflection {currentIndex + 1} of {reflections.length}
            </div>
            
            <div className="space-x-3">
              {currentIndex < reflections.length - 1 ? (
                <Button
                  onClick={handleNext}
                  disabled={!isCurrentComplete}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300"
                >
                  Next <ChevronRight className="ml-1 w-4 h-4" />
                </Button>
              ) : allCompleted ? (
                <Button
                  onClick={handleComplete}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {completionButtonText}
                </Button>
              ) : (
                <Button
                  disabled
                  className="bg-gray-300 cursor-not-allowed"
                >
                  Complete all reflections to continue
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Completed Reflections Preview */}
      {completedIndices.size > 0 && (
        <div className="mt-8 space-y-4">
          <h4 className="text-lg font-semibold text-gray-900">Your Completed Reflections:</h4>
          {Array.from(completedIndices)
            .sort((a, b) => a - b)
            .map(index => {
              const reflection = reflections[index];
              const response = responses[reflection.id];
              
              return (
                <div key={reflection.id} className="bg-gray-50 rounded-lg p-4 border">
                  <button
                    onClick={() => setCurrentIndex(index)}
                    className="w-full text-left"
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
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}
