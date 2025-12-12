import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ChevronLeft, ChevronRight, Check, HelpCircle } from 'lucide-react';
import { useTestUser } from '@/hooks/useTestUser';
import { useToast } from '@/hooks/use-toast';

interface FlowAssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: (results: any) => void;
}

interface FlowQuestion {
  id: number;
  text: string;
}

// Flow assessment questions from the original component
const flowQuestions: FlowQuestion[] = [
  { id: 1, text: "I often feel deeply focused and energized by my work." },
  { id: 2, text: "The challenges I face are well matched to my skills." },
  { id: 3, text: "I lose track of time when I'm fully engaged." },
  { id: 4, text: "I feel in control of what I'm doing, even under pressure." },
  { id: 5, text: "I receive clear feedback that helps me stay on track." },
  { id: 6, text: "I know exactly what needs to be done in my work." },
  { id: 7, text: "I feel more spontaneous when I'm in flow." },
  { id: 8, text: "I can do things almost effortlessly." },
  { id: 9, text: "I enjoy the process itself, not just the results." },
  { id: 10, text: "I have rituals or environments that help me quickly get into deep focus." },
  { id: 11, text: "I forget to take breaks because I'm so immersed." },
  { id: 12, text: "I want to recapture this experience again—it's deeply rewarding." },
];

const FlowAssessmentModal = ({ isOpen, onClose, onComplete }: FlowAssessmentModalProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [autoAdvance, setAutoAdvance] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const { shouldShowDemoButtons } = useTestUser();
  const { toast } = useToast();

  // Demo answers for testing
  const demoAnswers = () => {
    const demoData: Record<number, number> = {};
    flowQuestions.forEach(q => {
      // Generate random values between 3 and 5 for realistic demo data
      demoData[q.id] = Math.floor(Math.random() * 3) + 3;
    });
    return demoData;
  };

  // Load existing assessment data when modal opens
  useEffect(() => {
    if (isOpen) {
      const loadExistingData = async () => {
        try {
          const response = await fetch('/api/workshop-data/flow-assessment', {
            credentials: 'include'
          });
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.data && data.data.answers) {
              setAnswers(data.data.answers);
              if (data.data.completed) {
                setShowResults(true);
              }
            }
          }
        } catch (error) {
          console.error('Error loading existing flow assessment:', error);
        }
      };
      loadExistingData();
    }
  }, [isOpen]);

  // Convert number to label
  const valueToLabel = (value: number) => {
    switch (value) {
      case 1: return "Never";
      case 2: return "Rarely";
      case 3: return "Sometimes";
      case 4: return "Often";
      case 5: return "Always";
      default: return "";
    }
  };

  // Handle answer selection with 1-second delay
  const handleAnswerSelection = (questionId: number, value: number) => {
    // Skip if already selected
    if (answers[questionId] === value) return;

    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));

    // Auto-advance after 1 second delay (1 second more than IA-2-2)
    if (autoAdvance && currentQuestion < flowQuestions.length - 1) {
      setTimeout(() => {
        setCurrentQuestion(prev => prev + 1);
      }, 1500); // 1.5 seconds total (1 second more than typical)
    }
  };

  const fillDemoAnswers = () => {
    if (!shouldShowDemoButtons) {
      console.warn('Demo functionality only available to test users');
      return;
    }
    
    setIsDemoMode(true);
    setAnswers(demoAnswers());
    // Jump to last question but don't auto-submit
    setCurrentQuestion(flowQuestions.length - 1);
  };

  // Calculate total score and get interpretation
  const calculateScore = () => {
    return Object.values(answers).reduce((sum, score) => sum + score, 0);
  };

  const getInterpretation = (score: number) => {
    if (score >= 50) {
      return {
        level: "Flow Fluent",
        description: "You reliably access flow and have developed strong internal and external conditions to sustain it."
      };
    } else if (score >= 39) {
      return {
        level: "Flow Aware", 
        description: "You are familiar with the experience but have room to reinforce routines or reduce blockers."
      };
    } else if (score >= 26) {
      return {
        level: "Flow Blocked",
        description: "You occasionally experience flow but face challenges in entry, recovery, or sustaining focus."
      };
    } else {
      return {
        level: "Flow Distant",
        description: "You rarely feel in flow; foundational improvements to clarity, challenge, and environment are needed."
      };
    }
  };

  const handleFinishAssessment = async () => {
    setSaving(true);
    try {
      const flowScore = calculateScore();
      
      const response = await fetch('/api/workshop-data/flow-assessment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          answers,
          flowScore,
          completed: true
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Flow assessment saved successfully:', result);
        setShowResults(true);
        
        if (onComplete) {
          onComplete({ answers, flowScore, completed: true });
        }
        
        toast({
          title: "Assessment Complete!",
          description: "Your flow assessment has been saved successfully.",
        });
      } else {
        throw new Error('Failed to save assessment');
      }
    } catch (error) {
      console.error('❌ Error saving flow assessment:', error);
      toast({
        title: "Save Error",
        description: "Failed to save your assessment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const nextQuestion = () => {
    if (currentQuestion < flowQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else if (Object.keys(answers).length === flowQuestions.length) {
      handleFinishAssessment();
    }
  };

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      // Disable auto-advance when going back
      setAutoAdvance(false);
    }
  };

  const resetAssessment = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setShowResults(false);
    setIsDemoMode(false);
    setAutoAdvance(false);
  };

  const progress = ((currentQuestion + 1) / flowQuestions.length) * 100;
  const currentQ = flowQuestions[currentQuestion];
  const isAnswered = answers[currentQ?.id] !== undefined;
  const allQuestionsAnswered = Object.keys(answers).length === flowQuestions.length;

  // Results view
  if (showResults) {
    const totalScore = calculateScore();
    const interpretation = getInterpretation(totalScore);
    
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-blue-900">Your Flow Assessment Results</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="text-center">
              {isDemoMode && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 inline-block mb-4">
                  <p className="text-blue-800 text-sm font-medium">
                    📊 Demo Results - Sample data for testing purposes
                  </p>
                </div>
              )}
              
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4 mx-auto">
                <Check className="h-8 w-8 text-blue-600" />
              </div>
              
              <div className="mb-6">
                <p className="text-3xl font-bold text-blue-700 mb-2">
                  {totalScore} / {flowQuestions.length * 5}
                </p>
                <p className="text-xl font-semibold text-gray-800">
                  {interpretation.level}
                </p>
              </div>
              
              <div className="mb-6 p-4 bg-blue-50 rounded-lg text-left max-w-2xl mx-auto">
                <p className="text-gray-700">{interpretation.description}</p>
              </div>
            </div>

            {/* Questions Summary */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Responses Summary</h3>
              <div className="max-h-60 overflow-y-auto">
                <div className="space-y-2">
                  {flowQuestions.map((q) => (
                    <div key={q.id} className="flex justify-between items-start p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1 pr-4">
                        <span className="text-sm font-medium text-gray-900">Q{q.id}:</span>
                        <span className="text-sm text-gray-700 ml-2">{q.text}</span>
                      </div>
                      <div className={`
                        px-3 py-1 rounded-full text-xs font-medium text-white
                        ${answers[q.id] === 1 ? 'bg-red-500' : 
                          answers[q.id] === 2 ? 'bg-orange-500' : 
                          answers[q.id] === 3 ? 'bg-yellow-600' : 
                          answers[q.id] === 4 ? 'bg-green-500' : 
                          answers[q.id] === 5 ? 'bg-blue-600' : 'bg-gray-400'}
                      `}>
                        {answers[q.id] ? valueToLabel(answers[q.id]) : 'Not answered'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-center space-x-4">
              <button 
                onClick={resetAssessment}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Retake Assessment
              </button>
              <button 
                onClick={onClose}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold text-blue-900">Flow State Self-Assessment</DialogTitle>
              <p className="text-gray-600 mt-2">
                Rate your agreement with each statement. Answer with a specific activity or task in mind where you most often seek or experience flow.
              </p>
            </div>
            {shouldShowDemoButtons && (
              <button
                onClick={fillDemoAnswers}
                className="ml-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-200 transition-colors text-sm font-medium"
              >
                Use Demo Data
              </button>
            )}
          </div>
          {isDemoMode && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center mt-3">
              <p className="text-blue-800 text-sm font-medium">
                Demo mode activated! All questions filled with sample answers.
              </p>
            </div>
          )}
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Bar */}
          <div>
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Question {currentQuestion + 1} of {flowQuestions.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Auto-advance toggle */}
          <div className="flex items-center justify-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={autoAdvance}
                onChange={(e) => setAutoAdvance(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Auto-advance after selection</span>
            </label>
            <div className="relative">
              <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
            </div>
          </div>

          {/* Question Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="space-y-6">
              {/* Question Text */}
              <div className="text-center">
                <h2 className="text-xl font-semibold text-gray-900 leading-relaxed mb-2">
                  {currentQ.text}
                </h2>
              </div>

              {/* Rating Scale - Circular buttons like IA-2-2 */}
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm text-gray-600">
                  <span>Never</span>
                  <span>Always</span>
                </div>
                
                <div className="flex justify-center space-x-8">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      onClick={() => handleAnswerSelection(currentQ.id, value)}
                      className={`
                        w-16 h-16 rounded-full border-2 flex items-center justify-center text-lg font-bold transition-all hover:scale-105
                        ${answers[currentQ.id] === value 
                          ? 'bg-blue-600 border-blue-600 text-white shadow-lg' 
                          : 'border-gray-300 text-gray-600 hover:border-blue-300 hover:text-blue-600'
                        }
                      `}
                    >
                      {value}
                    </button>
                  ))}
                </div>

                <div className="flex justify-between text-xs text-gray-500 px-2">
                  <span>Never</span>
                  <span>Rarely</span>
                  <span>Sometimes</span>
                  <span>Often</span>
                  <span>Always</span>
                </div>

                {answers[currentQ.id] && (
                  <div className="text-center">
                    <p className="text-blue-700 font-semibold">
                      Your answer: {answers[currentQ.id]} - {valueToLabel(answers[currentQ.id])}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <button
              onClick={previousQuestion}
              disabled={currentQuestion === 0}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <span className="text-sm text-gray-500">
              {Object.keys(answers).length} of {flowQuestions.length} answered
            </span>

            <button
              onClick={nextQuestion}
              disabled={!isAnswered || saving}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>{saving ? 'Saving...' : currentQuestion === flowQuestions.length - 1 ? 'Finish Assessment' : 'Next'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Completion Status */}
          {allQuestionsAnswered && currentQuestion === flowQuestions.length - 1 && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
              <p className="text-green-800 font-medium">
                All questions completed! Click "Finish Assessment" to save your results and see your flow profile.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FlowAssessmentModal;