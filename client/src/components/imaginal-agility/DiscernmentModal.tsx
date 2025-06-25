import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Clock, Eye, CheckCircle, AlertCircle } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';

interface DiscernmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface DiscernmentScenario {
  id: number;
  exercise_type: 'reality_check' | 'visual_detection' | 'toolkit_practice';
  title: string;
  content: string;
  questions: any[];
  metadata?: any;
  difficulty_level: number;
}

export function DiscernmentModal({ isOpen, onClose }: DiscernmentModalProps) {
  const [currentExercise, setCurrentExercise] = useState(1); // 1: reality_check, 2: visual_detection, 3: toolkit_practice
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
  const [showTimer, setShowTimer] = useState(false);
  const [timeLeft, setTimeLeft] = useState(3);
  const [showQuestions, setShowQuestions] = useState(false);
  const [responses, setResponses] = useState<any>({});
  const [feedback, setFeedback] = useState<{type: 'correct' | 'incorrect', message: string} | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [scenarioStarted, setScenarioStarted] = useState(false);
  
  // Fetch scenarios for current exercise type
  const { data: scenarios, isLoading } = useQuery({
    queryKey: [`/api/discernment/scenarios/${getExerciseType(currentExercise)}`],
    enabled: isOpen
  });

  // Save progress mutation
  const saveProgressMutation = useMutation({
    mutationFn: async (progressData: any) => {
      return apiRequest('/api/discernment/progress', {
        method: 'POST',
        body: JSON.stringify(progressData),
        headers: { 'Content-Type': 'application/json' }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/discernment/progress'] });
    }
  });

  // Timer effect for reality check exercise
  useEffect(() => {
    if (showTimer && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (showTimer && timeLeft === 0) {
      setShowQuestions(true);
    }
  }, [showTimer, timeLeft]);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      resetModal();
    }
  }, [isOpen]);

  function getExerciseType(exercise: number): string {
    switch (exercise) {
      case 1: return 'reality_check';
      case 2: return 'visual_detection';
      case 3: return 'toolkit_practice';
      default: return 'reality_check';
    }
  }

  function getExerciseTitle(exercise: number): string {
    switch (exercise) {
      case 1: return 'The 3-Second Reality Check';
      case 2: return 'Visual Real vs. Fake Challenge';
      case 3: return 'The 5-Test Toolkit Practice';
      default: return 'Reality Check';
    }
  }

  function getExerciseDescription(exercise: number): string {
    switch (exercise) {
      case 1: return 'Practice recognizing content designed to trigger immediate emotional reactions in professional contexts';
      case 2: return 'Learn to spot visual manipulation and AI-generated content in professional contexts';
      case 3: return 'Apply all five discernment tests to complex workplace scenarios';
      default: return '';
    }
  }

  function startScenario() {
    setScenarioStarted(true);
    if (currentExercise === 1) {
      // Reality check - start timer
      setShowTimer(true);
      setTimeLeft(3);
      setShowQuestions(false);
    } else {
      // Visual detection and toolkit - show questions immediately
      setShowQuestions(true);
    }
    setFeedback(null);
  }

  function handleResponse(questionId: string, answer: any) {
    setResponses(prev => ({
      ...prev,
      [questionId]: answer
    }));
  }

  function submitScenario() {
    const currentScenario = scenarios?.[currentScenarioIndex];
    if (!currentScenario) return;

    // Simple validation - check if user provided responses
    const hasResponses = Object.keys(responses).length > 0;
    
    if (!hasResponses) {
      setFeedback({
        type: 'incorrect',
        message: 'Please provide your responses before continuing.'
      });
      return;
    }

    // Show positive feedback
    setFeedback({
      type: 'correct',
      message: 'Great job! You completed this scenario successfully. Moving to the next challenge...'
    });

    // Save progress
    saveProgressMutation.mutate({
      exerciseType: getExerciseType(currentExercise),
      scenarioId: currentScenario.id,
      responses: responses
    });

    // Move to next scenario or exercise after delay
    setTimeout(() => {
      if (currentScenarioIndex < (scenarios?.length || 0) - 1) {
        setCurrentScenarioIndex(currentScenarioIndex + 1);
        resetScenario();
      } else if (currentExercise < 3) {
        setCurrentExercise(currentExercise + 1);
        setCurrentScenarioIndex(0);
        resetScenario();
      } else {
        setIsCompleted(true);
      }
    }, 2000);
  }

  function resetScenario() {
    setShowTimer(false);
    setTimeLeft(3);
    setShowQuestions(false);
    setResponses({});
    setFeedback(null);
    setScenarioStarted(false);
  }

  function resetModal() {
    setCurrentExercise(1);
    setCurrentScenarioIndex(0);
    resetScenario();
    setIsCompleted(false);
  }

  function getProgressPercentage() {
    if (!scenarios?.length) return 0;
    const totalScenarios = scenarios.length * 3; // 3 exercises
    const completedScenarios = (currentExercise - 1) * scenarios.length + currentScenarioIndex;
    return Math.min((completedScenarios / totalScenarios) * 100, 100);
  }

  const currentScenario = scenarios?.[currentScenarioIndex];

  if (!isOpen) return null;

  if (isCompleted) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-5">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-8 text-center animate-in fade-in-0 zoom-in-95 duration-300">
          <div className="text-6xl mb-6">🎉</div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Congratulations!
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            You've successfully completed all three discernment training exercises. You're now better equipped to identify and evaluate digital content in professional environments.
          </p>
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h4 className="font-semibold text-purple-600 mb-3">Key Takeaways</h4>
            <div className="space-y-2 text-left">
              <div className="flex items-start gap-3">
                <span className="text-purple-600 mt-1">⚡</span>
                <span className="text-sm">Take 3 seconds to pause before reacting to provocative content</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-purple-600 mt-1">👁️</span>
                <span className="text-sm">Look for visual inconsistencies in images and videos</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-purple-600 mt-1">🔍</span>
                <span className="text-sm">Apply the 5-test framework for comprehensive content evaluation</span>
              </div>
            </div>
          </div>
          <div className="flex gap-4 justify-center">
            <Button onClick={resetModal} variant="outline">
              Practice Again
            </Button>
            <Button onClick={onClose} className="bg-purple-600 hover:bg-purple-700">
              Continue Workshop
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-5">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden animate-in fade-in-0 zoom-in-95 duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white p-6 flex justify-between items-center">
          <h2 className="text-2xl font-semibold">Practice Discernment Exercise</h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-10 rounded-full p-2 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="bg-gray-200 h-2">
          <div 
            className="bg-gradient-to-r from-purple-600 to-purple-800 h-full transition-all duration-300"
            style={{ width: `${getProgressPercentage()}%` }}
          />
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Exercise Info */}
          <div className="text-center mb-8">
            <div className="text-purple-600 font-semibold mb-2">
              Exercise {currentExercise} of 3 • Scenario {currentScenarioIndex + 1} of {scenarios?.length || 0}
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              {getExerciseTitle(currentExercise)}
            </h3>
            <p className="text-gray-600 text-lg leading-relaxed">
              {getExerciseDescription(currentExercise)}
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
          ) : currentScenario ? (
            <div className="space-y-6">
              {/* Scenario Content */}
              <div className="bg-gray-50 border-l-4 border-purple-600 p-6 rounded-lg relative min-h-32">
                {/* Breaking News Badge */}
                {currentScenario.title.toLowerCase().includes('breaking') && (
                  <div className="inline-block bg-red-600 text-white px-3 py-1 rounded text-sm font-bold mb-3">
                    BREAKING NEWS
                  </div>
                )}
                
                {/* Timer for reality check */}
                {currentExercise === 1 && showTimer && (
                  <div className={`absolute top-4 right-4 px-4 py-2 rounded-full font-bold text-lg transition-all duration-300 z-10 min-w-16 text-center ${
                    timeLeft === 0 
                      ? 'bg-green-600 text-white' 
                      : 'bg-purple-600 text-white animate-pulse'
                  }`}>
                    {timeLeft === 0 ? '✓' : timeLeft}
                  </div>
                )}
                
                <div 
                  className="text-gray-700 space-y-3"
                  dangerouslySetInnerHTML={{ __html: currentScenario.content }}
                />

                {/* Start button */}
                {!scenarioStarted && (
                  <div className="mt-6 text-center">
                    <Button
                      onClick={startScenario}
                      className="bg-purple-600 hover:bg-purple-700 px-8 py-3"
                    >
                      {currentExercise === 1 ? (
                        <>
                          <Clock className="mr-2" size={18} />
                          Start 3-Second Timer
                        </>
                      ) : currentExercise === 2 ? (
                        <>
                          <Eye className="mr-2" size={18} />
                          Begin Visual Analysis
                        </>
                      ) : (
                        <>
                          <CheckCircle className="mr-2" size={18} />
                          Apply 5-Test Toolkit
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>

              {/* Visual Detection Clues */}
              {currentExercise === 2 && showQuestions && currentScenario.metadata?.clues && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="text-yellow-800 font-semibold mb-3 flex items-center gap-2">
                    <Eye size={18} />
                    Visual Analysis Clues
                  </h4>
                  <ul className="space-y-2">
                    {currentScenario.metadata.clues.map((clue: string, index: number) => (
                      <li key={index} className="text-yellow-700 text-sm flex items-start gap-2">
                        <span className="text-yellow-600 mt-1">👀</span>
                        {clue}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Questions */}
              {showQuestions && currentScenario.questions && (
                <div className="space-y-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-300">
                  {currentScenario.questions.map((question: any, qIndex: number) => (
                    <div key={qIndex} className="bg-white border border-gray-200 rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">
                        {question.question}
                      </h4>
                      
                      {question.type === 'multiple_choice' || question.options ? (
                        <div className="space-y-3">
                          {question.options.map((option: string, oIndex: number) => (
                            <label
                              key={oIndex}
                              className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
                                responses[`q${qIndex}`] === option ? 'border-purple-600 bg-purple-50' : 'border-gray-200'
                              }`}
                            >
                              <input
                                type="radio"
                                name={`question-${qIndex}`}
                                value={option}
                                checked={responses[`q${qIndex}`] === option}
                                onChange={(e) => handleResponse(`q${qIndex}`, e.target.value)}
                                className="text-purple-600"
                              />
                              <span>{option}</span>
                            </label>
                          ))}
                        </div>
                      ) : question.type === 'textarea' || question.type === 'text' ? (
                        <div>
                          {question.hint && (
                            <p className="text-sm text-gray-500 mb-2 italic">Hint: {question.hint}</p>
                          )}
                          <textarea
                            className="w-full p-3 border border-gray-200 rounded-lg resize-none min-h-20"
                            rows={3}
                            placeholder="Type your response here..."
                            value={responses[`q${qIndex}`] || ''}
                            onChange={(e) => handleResponse(`q${qIndex}`, e.target.value)}
                          />
                        </div>
                      ) : question.type === 'checkbox' ? (
                        <div className="space-y-2">
                          {question.options.map((option: string, oIndex: number) => (
                            <label
                              key={oIndex}
                              className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50"
                            >
                              <input
                                type="checkbox"
                                checked={(responses[`q${qIndex}`] || []).includes(option)}
                                onChange={(e) => {
                                  const current = responses[`q${qIndex}`] || [];
                                  if (e.target.checked) {
                                    handleResponse(`q${qIndex}`, [...current, option]);
                                  } else {
                                    handleResponse(`q${qIndex}`, current.filter((item: string) => item !== option));
                                  }
                                }}
                                className="text-purple-600"
                              />
                              <span>{option}</span>
                            </label>
                          ))}
                        </div>
                      ) : question.type === 'binary' || (currentExercise === 2 && question.options?.length === 2) ? (
                        <div className="flex gap-4 justify-center">
                          <Button
                            variant={responses[`q${qIndex}`] === 'Real' ? 'default' : 'outline'}
                            onClick={() => handleResponse(`q${qIndex}`, 'Real')}
                            className="min-w-24 bg-blue-600 hover:bg-blue-700"
                          >
                            Real
                          </Button>
                          <Button
                            variant={responses[`q${qIndex}`] === 'Fake' ? 'default' : 'outline'}
                            onClick={() => handleResponse(`q${qIndex}`, 'Fake')}
                            className="min-w-24 bg-red-600 hover:bg-red-700"
                          >
                            Fake
                          </Button>
                        </div>
                      ) : null}
                    </div>
                  ))}

                  {/* Submit button */}
                  {!feedback && (
                    <div className="text-center">
                      <Button
                        onClick={submitScenario}
                        disabled={Object.keys(responses).length === 0}
                        className="bg-purple-600 hover:bg-purple-700 px-8 py-3"
                      >
                        Submit Response
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Feedback */}
              {feedback && (
                <div className={`p-6 rounded-lg animate-in fade-in-0 slide-in-from-bottom-4 duration-300 ${
                  feedback.type === 'correct' 
                    ? 'bg-green-50 border border-green-200 text-green-800' 
                    : 'bg-red-50 border border-red-200 text-red-800'
                }`}>
                  <div className="flex items-center gap-3">
                    {feedback.type === 'correct' ? (
                      <CheckCircle className="text-green-600" size={24} />
                    ) : (
                      <AlertCircle className="text-red-600" size={24} />
                    )}
                    <h4 className="font-semibold">
                      {feedback.type === 'correct' ? 'Well Done!' : 'Try Again'}
                    </h4>
                  </div>
                  <p className="mt-2">{feedback.message}</p>
                  {feedback.type === 'correct' && currentScenario.questions?.[0]?.explanation && (
                    <p className="mt-3 text-sm font-medium">
                      💡 {currentScenario.questions[0].explanation}
                    </p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">No scenarios available for this exercise.</p>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={() => {
                if (currentExercise > 1) {
                  setCurrentExercise(currentExercise - 1);
                  setCurrentScenarioIndex(0);
                  resetScenario();
                }
              }}
              disabled={currentExercise === 1}
              className="flex items-center gap-2"
            >
              ← Previous Exercise
            </Button>
            
            <div className="flex gap-2">
              {[1, 2, 3].map((step) => (
                <div
                  key={step}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    step === currentExercise
                      ? 'bg-purple-600'
                      : step < currentExercise
                      ? 'bg-purple-300'
                      : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>

            <Button
              onClick={() => {
                if (currentExercise < 3) {
                  setCurrentExercise(currentExercise + 1);
                  setCurrentScenarioIndex(0);
                  resetScenario();
                } else {
                  setIsCompleted(true);
                }
              }}
              disabled={!feedback || feedback.type !== 'correct'}
              className="bg-purple-600 hover:bg-purple-700 flex items-center gap-2"
            >
              {currentExercise === 3 && currentScenarioIndex === (scenarios?.length || 1) - 1
                ? 'Complete Training' 
                : 'Next →'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}