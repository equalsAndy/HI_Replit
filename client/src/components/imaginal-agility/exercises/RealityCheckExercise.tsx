import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface RealityCheckExerciseProps {
  onComplete: () => void;
}

interface Scenario {
  id: number;
  title: string;
  content: string;
  questions: Array<{
    question: string;
    options: string[];
    correct: number;
    explanation: string;
  }>;
  metadata: {
    timer_seconds: number;
  };
}

const RealityCheckExercise: React.FC<RealityCheckExerciseProps> = ({ onComplete }) => {
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [loading, setLoading] = useState(true);
  const [timer, setTimer] = useState(3);
  const [timerActive, setTimerActive] = useState(false);
  const [showQuestions, setShowQuestions] = useState(false);
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});
  const [showFeedback, setShowFeedback] = useState(false);
  const [canProceed, setCanProceed] = useState(false);

  useEffect(() => {
    loadScenario();
  }, []);

  const loadScenario = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/discernment/scenarios/reality_check', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setScenario(data.scenario);
        setTimer(data.scenario.metadata.timer_seconds || 3);
      } else {
        console.error('Failed to load scenario');
      }
    } catch (error) {
      console.error('Error loading scenario:', error);
    } finally {
      setLoading(false);
    }
  };

  const startTimer = () => {
    setTimerActive(true);
    setShowQuestions(true);
    
    const countdown = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(countdown);
          setTimerActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleAnswerSelect = (questionIndex: number, answerIndex: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: answerIndex
    }));
  };

  const handleSubmit = async () => {
    setShowFeedback(true);
    setCanProceed(true);
    
    // Track progress
    if (scenario) {
      try {
        await fetch('/api/discernment/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ scenarioId: scenario.id })
        });
      } catch (error) {
        console.error('Error tracking progress:', error);
      }
    }
  };

  const checkAllAnswered = () => {
    if (!scenario) return false;
    return scenario.questions.every((_, index) => answers[index] !== undefined);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!scenario) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Failed to load exercise scenario.</p>
        <button 
          onClick={loadScenario}
          className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
        <div className="flex items-center">
          <Clock className="w-5 h-5 text-yellow-600 mr-2" />
          <h4 className="text-yellow-800 font-semibold">The 3-Second Reality Check</h4>
        </div>
        <p className="text-yellow-700 mt-2">
          You'll see content that might trigger an immediate emotional reaction. Take exactly 3 seconds to pause and think before responding.
        </p>
      </div>

      {/* Scenario Content */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">{scenario.title}</h3>
        <div className="prose max-w-none text-gray-700">
          <div dangerouslySetInnerHTML={{ __html: scenario.content }} />
        </div>
      </div>

      {/* Timer or Start Button */}
      {!showQuestions ? (
        <div className="text-center">
          <button
            onClick={startTimer}
            className="bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Start 3-Second Reality Check
          </button>
        </div>
      ) : (
        <>
          {/* Timer Display */}
          {timerActive && (
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 border-4 border-purple-500 rounded-full">
                <span className="text-2xl font-bold text-purple-600">{timer}</span>
              </div>
              <p className="text-purple-600 font-semibold mt-2">Take a moment to think...</p>
            </div>
          )}

          {/* Questions (shown after timer) */}
          {!timerActive && (
            <div className="space-y-6">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 className="font-semibold text-purple-800 mb-2">Now answer these questions:</h4>
                <p className="text-purple-700 text-sm">
                  The 3-second pause helps you engage your analytical thinking before emotional reactions take over.
                </p>
              </div>

              {scenario.questions.map((question, qIndex) => (
                <div key={qIndex} className="bg-white p-6 rounded-lg border">
                  <h5 className="font-semibold text-gray-800 mb-3">{question.question}</h5>
                  <div className="space-y-2">
                    {question.options.map((option, oIndex) => (
                      <label key={oIndex} className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          type="radio"
                          name={`question-${qIndex}`}
                          value={oIndex}
                          checked={answers[qIndex] === oIndex}
                          onChange={() => handleAnswerSelect(qIndex, oIndex)}
                          className="mr-3 text-purple-600"
                        />
                        <span className="text-gray-700">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}

              {/* Submit Button */}
              {!showFeedback && checkAllAnswered() && (
                <button
                  onClick={handleSubmit}
                  className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Submit Answers
                </button>
              )}

              {/* Feedback */}
              {showFeedback && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 space-y-4">
                  <h4 className="font-semibold text-green-800">Great work on the reality check!</h4>
                  
                  {scenario.questions.map((question, qIndex) => (
                    <div key={qIndex} className="bg-white p-4 rounded border-l-4 border-green-400">
                      <p className="font-medium text-gray-800 mb-2">{question.question}</p>
                      <p className="text-sm text-gray-600 mb-2">
                        Your answer: <span className="font-medium">{question.options[answers[qIndex]]}</span>
                        {answers[qIndex] === question.correct ? 
                          <span className="text-green-600 ml-2">✓ Correct</span> : 
                          <span className="text-orange-600 ml-2">Different perspective</span>
                        }
                      </p>
                      <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                        <strong>Key insight:</strong> {question.explanation}
                      </p>
                    </div>
                  ))}

                  {canProceed && (
                    <button
                      onClick={onComplete}
                      className="w-full bg-gradient-to-r from-purple-600 to-purple-800 text-white py-3 rounded-lg hover:opacity-90 transition-opacity"
                    >
                      Continue to Visual Detection Challenge
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default RealityCheckExercise;