import React, { useState, useEffect } from 'react';
import { Search, CheckCircle, Clock, User, Globe, AlertTriangle, TrendingUp } from 'lucide-react';

interface ToolkitPracticeExerciseProps {
  onComplete: () => void;
}

interface Scenario {
  id: number;
  title: string;
  content: string;
  questions: Array<{
    question: string;
    type: 'textarea' | 'checkbox';
    options?: string[];
    hint?: string;
  }>;
  metadata: {
    tests: string[];
  };
}

const ToolkitPracticeExercise: React.FC<ToolkitPracticeExerciseProps> = ({ onComplete }) => {
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<{ [key: number]: any }>({});
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    loadScenario();
  }, []);

  const loadScenario = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/discernment/scenarios/toolkit_practice', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setScenario(data.scenario);
      } else {
        console.error('Failed to load scenario');
      }
    } catch (error) {
      console.error('Error loading scenario:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTextareaChange = (questionIndex: number, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: value
    }));
  };

  const handleCheckboxChange = (questionIndex: number, optionIndex: number, checked: boolean) => {
    setAnswers(prev => {
      const currentAnswers = prev[questionIndex] || [];
      if (checked) {
        return {
          ...prev,
          [questionIndex]: [...currentAnswers, optionIndex]
        };
      } else {
        return {
          ...prev,
          [questionIndex]: currentAnswers.filter((idx: number) => idx !== optionIndex)
        };
      }
    });
  };

  const handleSubmit = async () => {
    setShowFeedback(true);
    
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

  const checkCompletion = () => {
    if (!scenario) return false;
    return scenario.questions.every((question, index) => {
      if (question.type === 'textarea') {
        return answers[index] && answers[index].trim().length > 0;
      } else {
        return answers[index] && answers[index].length > 0;
      }
    });
  };

  const getTestIcon = (testName: string) => {
    switch (testName) {
      case 'source_test': return <User className="w-5 h-5" />;
      case 'context_test': return <Globe className="w-5 h-5" />;
      case 'timing_test': return <Clock className="w-5 h-5" />;
      case 'motivation_test': return <AlertTriangle className="w-5 h-5" />;
      case 'pattern_test': return <TrendingUp className="w-5 h-5" />;
      default: return <Search className="w-5 h-5" />;
    }
  };

  const getTestTitle = (testName: string) => {
    switch (testName) {
      case 'source_test': return 'Source Test';
      case 'context_test': return 'Context Test';
      case 'timing_test': return 'Timing Test';
      case 'motivation_test': return 'Motivation Test';
      case 'pattern_test': return 'Pattern Test';
      default: return 'Analysis Test';
    }
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
      <div className="bg-purple-50 border-l-4 border-purple-400 p-4">
        <div className="flex items-center">
          <Search className="w-5 h-5 text-purple-600 mr-2" />
          <h4 className="text-purple-800 font-semibold">The 5-Test Toolkit Practice</h4>
        </div>
        <p className="text-purple-700 mt-2">
          Apply systematic analysis to evaluate suspicious content using five key tests.
        </p>
      </div>

      {/* Scenario Content */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">{scenario.title}</h3>
        <div className="prose max-w-none text-gray-700">
          <div dangerouslySetInnerHTML={{ __html: scenario.content }} />
        </div>
      </div>

      {/* 5-Test Framework Overview */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6">
        <h4 className="font-semibold text-purple-800 mb-4">The 5-Test Systematic Framework:</h4>
        <div className="grid md:grid-cols-5 gap-4">
          <div className="text-center">
            <User className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <h5 className="font-medium text-sm">Source Test</h5>
            <p className="text-xs text-gray-600">Who created this?</p>
          </div>
          <div className="text-center">
            <Globe className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <h5 className="font-medium text-sm">Context Test</h5>
            <p className="text-xs text-gray-600">What's the situation?</p>
          </div>
          <div className="text-center">
            <Clock className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <h5 className="font-medium text-sm">Timing Test</h5>
            <p className="text-xs text-gray-600">Why now?</p>
          </div>
          <div className="text-center">
            <AlertTriangle className="w-8 h-8 text-orange-600 mx-auto mb-2" />
            <h5 className="font-medium text-sm">Motivation Test</h5>
            <p className="text-xs text-gray-600">What's the agenda?</p>
          </div>
          <div className="text-center">
            <TrendingUp className="w-8 h-8 text-red-600 mx-auto mb-2" />
            <h5 className="font-medium text-sm">Pattern Test</h5>
            <p className="text-xs text-gray-600">Does this fit a pattern?</p>
          </div>
        </div>
      </div>

      {/* Tests/Questions */}
      <div className="space-y-6">
        {scenario.questions.map((question, qIndex) => {
          const testName = scenario.metadata.tests[qIndex] || 'test';
          
          return (
            <div key={qIndex} className="bg-white p-6 rounded-lg border-l-4 border-purple-500">
              <h4 className="flex items-center gap-2 text-purple-600 font-semibold mb-3">
                {getTestIcon(testName)}
                {getTestTitle(testName)}
              </h4>
              <p className="mb-4 text-gray-700">{question.question}</p>

              {question.type === 'textarea' ? (
                <textarea
                  value={answers[qIndex] || ''}
                  onChange={(e) => handleTextareaChange(qIndex, e.target.value)}
                  placeholder={question.hint || 'Enter your analysis...'}
                  className="w-full p-3 border border-gray-300 rounded-lg resize-vertical min-h-[100px] focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              ) : (
                <div className="space-y-2">
                  {question.options?.map((option, oIndex) => (
                    <label key={oIndex} className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={(answers[qIndex] || []).includes(oIndex)}
                        onChange={(e) => handleCheckboxChange(qIndex, oIndex, e.target.checked)}
                        className="mr-3 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Submit Button */}
      {!showFeedback && checkCompletion() && (
        <button
          onClick={handleSubmit}
          className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors"
        >
          Complete Analysis
        </button>
      )}

      {/* Feedback */}
      {showFeedback && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <h4 className="font-semibold text-green-800">Great systematic analysis!</h4>
          </div>
          <p className="text-green-700 mb-4">
            You've applied all five discernment tests. This methodical approach helps you evaluate any suspicious content objectively rather than emotionally.
          </p>
          <button
            onClick={onComplete}
            className="w-full bg-gradient-to-r from-purple-600 to-purple-800 text-white py-3 rounded-lg hover:opacity-90 transition-opacity"
          >
            Complete All Exercises
          </button>
        </div>
      )}
    </div>
  );
};

export default ToolkitPracticeExercise;