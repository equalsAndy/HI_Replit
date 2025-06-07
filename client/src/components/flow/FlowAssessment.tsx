import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { HelpCircle, Sliders as SliderIcon } from 'lucide-react';

interface FlowQuestion {
  id: number;
  text: string;
}

// Flow assessment questions from the screenshot
const flowQuestions: FlowQuestion[] = [
  { id: 1, text: "I often feel deeply focused and energized by my work." },
  { id: 2, text: "The challenges I face are well matched to my skills." },
  { id: 3, text: "I lose track of time when I'm fully engaged." },
  { id: 4, text: "I feel in control of what I'm doing, even under pressure." },
  { id: 5, text: "I receive clear feedback that helps me stay on track." },
  { id: 6, text: "I know exactly what needs to be done in my work." },
  { id: 7, text: "I feel self-conscious and more spontaneous when I'm in flow." },
  { id: 8, text: "I do things automatically, almost effortlessly." },
  { id: 9, text: "I enjoy the process itself, not just the results." },
  { id: 10, text: "I have rituals or environments that help me quickly get into deep focus." },
  { id: 11, text: "I forget to take breaks because I'm so immersed." },
  { id: 12, text: "I want to recapture this experience again—it's deeply rewarding." },
];

import { useAssessmentWithReset } from '@/hooks/use-assessment-with-reset';
import { useNavigationProgress } from '@/hooks/use-navigation-progress';

interface FlowAssessmentProps {
  isCompleted?: boolean;
  onTabChange?: (tabId: string) => void;
  existingFlowScore?: number;
  readOnly?: boolean;
}

export default function FlowAssessment({ isCompleted = false, onTabChange, existingFlowScore, readOnly = false }: FlowAssessmentProps) {
  // Reset detection hooks
  const { progress: navigationProgress } = useNavigationProgress();
  const { assessmentData: flowAssessmentData, isReset: isFlowReset } = useAssessmentWithReset('flow-assessment', '/api/workshop-data/flow-assessment');
  
  // State for tracking answers - initialize with saved answers if available in localStorage
  const [answers, setAnswers] = useState<Record<number, number>>(() => {
    // Try to load saved answers from localStorage
    const savedAnswers = localStorage.getItem('flowAssessmentAnswers');
    if (savedAnswers) {
      try {
        return JSON.parse(savedAnswers);
      } catch (e) {
        console.error('Error parsing saved flow assessment answers:', e);
      }
    }
    return {};
  });
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showResult, setShowResult] = useState(isCompleted || !!existingFlowScore); // Show results page if assessment was completed or score exists
  const [autoAdvance, setAutoAdvance] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoAdvancePending, setAutoAdvancePending] = useState(false);
  const [adjustingQuestionId, setAdjustingQuestionId] = useState<number | null>(null);
  const [showScoring, setShowScoring] = useState(false);
  const [completedAssessmentData, setCompletedAssessmentData] = useState<any>(null);
  
  // Check for existing assessment data from API
  useEffect(() => {
    const checkForExistingAssessment = async () => {
      try {
        const response = await fetch('/api/workshop-data/flow-assessment', {
          credentials: 'include'
        });
        if (response.ok) {
          const data = await response.json();
          console.log('🔍 Flow Assessment: Checking assessment data structure:', data);
          
          if (data.success && data.data) {
            const flowData = data.data;
            console.log('🔍 Flow Assessment: FlowData found:', flowData);
            
            if (flowData && flowData.answers && flowData.flowScore !== undefined) {
              // Load existing answers 
              setAnswers(flowData.answers);
              // Store the completed assessment data
              setCompletedAssessmentData(flowData);
              // Always show results if we have completed assessment data
              if (flowData.completed) {
                console.log('✅ Flow Assessment: Found completed assessment - showing results');
                console.log('✅ Flow Assessment: Setting showResult to true and completedAssessmentData:', flowData);
                setShowResult(true);
              }
              console.log('✅ Flow Assessment: Loaded existing assessment with score:', flowData.flowScore);
              return;
            }
          } else {
            console.log('🔍 Flow Assessment: No existing assessment found');
          }
        }
        console.log('❌ Flow Assessment: No existing data found, starting fresh');
      } catch (error) {
        console.error('❌ Flow Assessment: Error checking for existing data:', error);
      }
    };

    if (!isFlowReset && navigationProgress !== null) {
      checkForExistingAssessment();
    }
  }, [isFlowReset, navigationProgress]);

  // If the assessment is marked as completed (from props), show results immediately
  useEffect(() => {
    if (isCompleted && Object.keys(answers).length > 0) {
      console.log('✅ Flow Assessment: Step marked as completed - showing results');
      setShowResult(true);
    }
  }, [isCompleted, answers]);

  // Reset flow assessment state when user progress is reset
  useEffect(() => {
    if (isFlowReset || navigationProgress === null) {
      console.log('🧹 RESETTING flow assessment state');
      setAnswers({});
      setCurrentQuestion(0);
      setShowResult(false);
      setAutoAdvance(true);
      setError(null);
      setAutoAdvancePending(false);
      setAdjustingQuestionId(null);
      setShowScoring(false);
      localStorage.removeItem('flowAssessmentAnswers');
    } else if (flowAssessmentData) {
      // Load existing assessment data if available
      if (flowAssessmentData.answers) {
        setAnswers(flowAssessmentData.answers);
      }
      if (flowAssessmentData.completed) {
        setShowResult(true);
      }
    }
  }, [isFlowReset, navigationProgress, flowAssessmentData]);
  
  // Save answers to localStorage whenever they change
  useEffect(() => {
    if (Object.keys(answers).length > 0) {
      localStorage.setItem('flowAssessmentAnswers', JSON.stringify(answers));
    }
  }, [answers]);
  
  // Using a ref for auto advance timeout to be able to clear it
  const autoAdvanceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Demo answers feature
  const fillDemoAnswers = () => {
    // Check if the assessment is already completed
    if (isCompleted) {
      return;
    }
    
    // Create demo answers for all questions (mostly 4s and 5s with some 3s)
    const demoAnswers: Record<number, number> = {};
    flowQuestions.forEach(q => {
      // Generate a random value between 3 and 5
      demoAnswers[q.id] = Math.floor(Math.random() * 3) + 3;
    });
    
    setAnswers(demoAnswers);
    
    // Go to the last question to show the Finish button
    setCurrentQuestion(flowQuestions.length - 1);
    
    // Ensure auto-advance is turned off when filling demo answers
    // This prevents automatic progression that could interfere with the Finish button
    setAutoAdvance(false);
    
    // Clear any errors
    setError(null);
  };
  
  // Calculate total score
  const calculateScore = () => {
    return Object.values(answers).reduce((sum, score) => sum + score, 0);
  };
  
  // Get interpretation based on score
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
  
  // Common function to handle value selections (used by slider and quick select)
  const handleValueSelection = (questionId: number, value: number) => {
    // Skip if already selected this value
    if (answers[questionId] === value) {
      return;
    }
    
    // Update answers immediately
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
    
    // Clear error
    setError(null);
    
    // Note: We DON'T auto-advance here - only the number buttons should trigger auto-advance
    // This prevents unwanted auto-advancing when using the slider
  };
  
  // Handle slider change - pass to common handler
  const handleSliderChange = (questionId: number, value: number[]) => {
    handleValueSelection(questionId, value[0]);
  };
  
  // Handle quick selection (clicking the thumb) - just display current value, don't set to 3
  const handleQuickSelect = (questionId: number) => {
    // Just show the current value as a tooltip
    // This doesn't change any values or trigger auto-advance
  };
  
  // Handle direct number click - this is the main way users select answers
  const handleNumberClick = (questionId: number, value: number) => {
    // First, check if we're already on another timeout
    if (autoAdvanceTimeoutRef.current) {
      clearTimeout(autoAdvanceTimeoutRef.current);
      autoAdvanceTimeoutRef.current = null;
    }

    // Skip if already selected this value
    if (answers[questionId] === value) {
      return;
    }
    
    // Create updated answers
    const updatedAnswers = {
      ...answers,
      [questionId]: value
    };
    
    // Update answers state
    setAnswers(updatedAnswers);
    
    // Persist answers to API as they're selected (auto-save)
    // This ensures user data is saved even if they don't click Finish
    // We'll handle this in the submit button for now as a simpler solution
    // Auto-persistence will be triggered when they click Finish
    
    // Clear error
    setError(null);
    
    // Auto-advance logic
    if (autoAdvance && currentQuestion < flowQuestions.length - 1) {
      // Show notification
      setAutoAdvancePending(true);
      
      // Auto-advance after delay
      const advanceTimeout = setTimeout(() => {
        // First hide notification
        setAutoAdvancePending(false);
        
        // Then advance to next question directly
        setCurrentQuestion(currentQ => currentQ + 1);
      }, 700);
      
      // Store timeout reference
      autoAdvanceTimeoutRef.current = advanceTimeout;
    } else {
      // Just show a brief notification that this value was selected
      setAutoAdvancePending(true);
      setTimeout(() => setAutoAdvancePending(false), 1500);
    }
  };
  
  // Handle submit
  const handleSubmit = async () => {
    // Clear any pending timeouts first
    if (autoAdvanceTimeoutRef.current) {
      clearTimeout(autoAdvanceTimeoutRef.current);
      autoAdvanceTimeoutRef.current = null;
    }
    
    // Calculate the total flow score based on all answers
    const flowScore = Object.values(answers).reduce((sum, val) => sum + val, 0);
    
    // Save the flow assessment data to the database
    try {
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
      } else {
        console.error('❌ Failed to save flow assessment:', response.status);
      }
    } catch (err) {
      console.error('❌ Error saving flow assessment:', err);
    }
    
    // Show the results dialog
    setShowResult(true);
  };
  
  // Close the result dialog
  const closeResultDialog = () => {
    setShowResult(false);
  };
  
  // Move to next question
  const nextQuestion = () => {
    // Check if current question has been answered
    if (!answers[question.id]) {
      setError("Please select an answer before proceeding.");
      return;
    }
    
    // Clear error and proceed
    setError(null);
    
    // Clear any pending auto-advance timeouts
    if (autoAdvanceTimeoutRef.current) {
      clearTimeout(autoAdvanceTimeoutRef.current);
      autoAdvanceTimeoutRef.current = null;
    }
    
    if (currentQuestion < flowQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      // If we're on the last question, allow submission regardless
      handleSubmit();
    }
  };
  
  // Check if all questions have been answered
  const allQuestionsAnswered = () => {
    return flowQuestions.every(q => !!answers[q.id]);
  };
  
  // Show a notification when auto-advance status changes
  const toggleAutoAdvance = (checked: boolean) => {
    const isEnabling = !!checked;
    setAutoAdvance(isEnabling);
    
    // Show notification about the status change
    setAutoAdvancePending(true);
    setTimeout(() => setAutoAdvancePending(false), 3000);
  };
  
  // Move to previous question
  const goToPrevQuestion = () => {
    if (currentQuestion > 0) {
      // Disable auto-advance when going back to previous questions
      if (autoAdvance) {
        setAutoAdvance(false);
        // Show notification that auto-advance was disabled
        setAutoAdvancePending(true);
        setTimeout(() => setAutoAdvancePending(false), 3000);
      }
      setCurrentQuestion(prev => prev - 1);
    }
  };
  
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
  
  // Reset answers for new questions when switching to a new one
  useEffect(() => {
    // Clear any error messages when moving to a new question
    setError(null);
    
    // Make sure there's no default selection for new questions
    // (existing answers are preserved, but new questions start unselected)
  }, [currentQuestion]);
  
  // Get current question and previous question
  const question = flowQuestions[currentQuestion];
  const currentValue = answers[question.id] || 0; // No default value
  
  // Get previous question for display
  const previousQuestion = currentQuestion > 0 ? flowQuestions[currentQuestion - 1] : null;
  const prevAnswer = previousQuestion ? answers[previousQuestion.id] || 0 : 0;
  
  // Debug logging to understand state
  console.log('🔍 Flow Assessment Render - State check:', {
    completedAssessmentData,
    showResult,
    isCompleted,
    existingFlowScore,
    readOnly
  });

  // If we have completed assessment data with a score, show detailed results
  if (completedAssessmentData && completedAssessmentData.flowScore !== undefined && showResult) {
    const interpretation = getInterpretation(completedAssessmentData.flowScore);
    
    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-center text-center flex-col">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Your Flow Assessment Results</h3>
            
            <div className="text-center mb-4">
              <p className="text-2xl font-bold text-indigo-700">
                {Math.min(completedAssessmentData.flowScore, flowQuestions.length * 5)} / {flowQuestions.length * 5}
              </p>
              <p className="text-lg font-semibold">
                {interpretation.level}
              </p>
            </div>
            
            <div className="mb-4 p-4 bg-indigo-50 rounded-lg text-left">
              <p>{interpretation.description}</p>
            </div>
            
            <p className="text-gray-600 mb-4">
              You've already completed the flow assessment. Your results have been saved to your profile.
              Continue to the next sections to add flow attributes to your Star Card.
            </p>
            
            <Button 
              onClick={() => onTabChange ? onTabChange("roundingout") : null}
              className="bg-indigo-700 hover:bg-indigo-800"
            >
              Continue to Rounding Out
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // If returning with an existing flow score, show results in read-only mode
  if (readOnly && existingFlowScore) {
    // Set up a view that shows the existing flow score and interpretation
    const interpretation = getInterpretation(existingFlowScore);
    
    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-center text-center flex-col">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Your Flow Assessment Results</h3>
            
            <div className="text-center mb-4">
              <p className="text-2xl font-bold text-indigo-700">
                {Math.min(existingFlowScore, flowQuestions.length * 5)} / {flowQuestions.length * 5}
              </p>
              <p className="text-lg font-semibold">
                {interpretation.level}
              </p>
            </div>
            
            <div className="mb-4 p-4 bg-indigo-50 rounded-lg text-left">
              <p>{interpretation.description}</p>
            </div>
            
            <p className="text-gray-600 mb-4">
              You've already completed the flow assessment. Your results have been saved to your profile.
              Continue to the next sections to add flow attributes to your Star Card.
            </p>
            
            <Button 
              onClick={() => onTabChange ? onTabChange("roundingout") : null}
              className="bg-indigo-700 hover:bg-indigo-800"
            >
              Continue to Rounding Out
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  // If the assessment is already completed (but no score is available), show a basic completion message
  if (isCompleted) {
    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-center text-center flex-col">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Flow Assessment Completed</h3>
            <p className="text-gray-600 mb-4">
              You've already completed the flow assessment. Your results have been saved to your profile.
              Continue to the next sections to add flow attributes to your Star Card.
            </p>
            
            <Button 
              onClick={() => onTabChange ? onTabChange("roundingout") : null}
              className="bg-indigo-700 hover:bg-indigo-800"
            >
              Continue to Rounding Out
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show results in content view instead of modal
  if (showResult) {
    const totalScore = calculateScore();
    const interpretation = getInterpretation(totalScore);
    
    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4 mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Your Flow Assessment Results</h3>
            <p className="text-gray-600 mb-4">Based on your responses to all {flowQuestions.length} questions.</p>
            
            <div className="mb-4">
              <p className="text-2xl font-bold text-indigo-700">
                {totalScore} / {flowQuestions.length * 5}
              </p>
              <p className="text-lg font-semibold">
                {interpretation.level}
              </p>
            </div>
            
            <div className="mb-6 p-4 bg-indigo-50 rounded-lg text-left">
              <p>{interpretation.description}</p>
            </div>

            {/* Questions and Answers Summary - Read-only */}
            <div className="mb-6 text-left">
              <h4 className="font-semibold mb-3">Your Answers Summary</h4>
              {/* Comment out adjustment functionality
              <p className="text-sm text-gray-600 mb-3">
                Review your answers below. Click an answer or the Adjust button to modify your responses.
              </p>
              */}
              
              <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-md">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Question
                      </th>
                      <th scope="col" className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Your Answer
                      </th>
                      {/* Comment out action column
                      <th scope="col" className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Action
                      </th>
                      */}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {flowQuestions.map((q) => (
                      <tr key={q.id} className={q.id % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="px-3 py-2 text-xs text-gray-700">
                          <span className="font-semibold mr-1">Question #{q.id}:</span> {q.text}
                        </td>
                        <td className="px-3 py-2 text-center">
                          <div className="flex justify-center">
                            <div 
                              className={`
                                px-4 py-1.5 rounded-full text-white text-sm font-medium shadow-sm
                                ${answers[q.id] === 1 ? 'bg-red-600' : 
                                  answers[q.id] === 2 ? 'bg-orange-500' : 
                                  answers[q.id] === 3 ? 'bg-indigo-600' : 
                                  answers[q.id] === 4 ? 'bg-green-600' : 
                                  answers[q.id] === 5 ? 'bg-purple-600' : 'bg-gray-400'}
                              `}
                            >
                              {answers[q.id] ? valueToLabel(answers[q.id]) : 'Not answered'}
                            </div>
                          </div>
                        </td>
                        {/* Comment out adjustment functionality
                        <td className="px-3 py-2 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (adjustingQuestionId === q.id) {
                                setAdjustingQuestionId(null);
                              } else {
                                setAdjustingQuestionId(q.id);
                              }
                            }}
                            className="text-xs"
                          >
                            {adjustingQuestionId === q.id ? 'Cancel' : 'Adjust'}
                          </Button>
                        </td>
                        */}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Scoring Information */}
            <div className="mb-6 border border-gray-200 rounded-md overflow-hidden">
              <button 
                onClick={() => setShowScoring(!showScoring)}
                className="w-full flex justify-between items-center p-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
              >
                <h4 className="font-semibold">Scoring & Interpretation</h4>
                <span className="text-gray-500">
                  {showScoring ? 
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    :
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  }
                </span>
              </button>
              
              {showScoring && (
                <div className="p-3 space-y-2 bg-white">
                  <p className="text-sm"><span className="font-medium">50-60: Flow Fluent</span> - You reliably access flow and have developed strong internal and external conditions to sustain it.</p>
                  <p className="text-sm"><span className="font-medium">39-49: Flow Aware</span> - You are familiar with the experience but have room to reinforce routines or reduce blockers.</p>
                  <p className="text-sm"><span className="font-medium">26-38: Flow Blocked</span> - You occasionally experience flow but face challenges in entry, recovery, or sustaining focus.</p>
                  <p className="text-sm"><span className="font-medium">12-25: Flow Distant</span> - You rarely feel in flow; foundational improvements to clarity, challenge, and environment are needed.</p>
                </div>
              )}
            </div>

            <div className="flex justify-center space-x-4">
              <Button 
                onClick={() => onTabChange ? onTabChange("roundingout") : null}
                className="bg-indigo-700 hover:bg-indigo-800"
              >
                Continue to Rounding Out
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Flow State Self-Assessment</h3>
          
          <Button 
            variant="outline" 
            onClick={fillDemoAnswers}
            className="text-xs py-1 px-2 h-auto border-dashed border-indigo-300 hover:border-indigo-500"
          >
            Fill Demo Answers
          </Button>
        </div>
        
        <p className="text-gray-600 mb-6">
          Rate your agreement with each statement on a scale from 1 (Never) to 5 (Always).
          Answer with a specific activity or task in mind where you most often seek or experience flow.
        </p>
        
        <div className="mb-8">
          <p className="font-medium mb-4">
            <span className="font-bold mr-1">Question #{question.id}:</span> {question.text}
          </p>
          
          <div className="mb-8 relative">
            <div className="h-16 relative">
              {/* Main track background */}
              <div className="absolute h-3 rounded-full bg-gray-200 w-full top-6 z-0 shadow-inner overflow-hidden">
                {/* Gradient fill - animated for smoother transitions */}
                <div 
                  className="absolute h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 transition-all duration-300 ease-out" 
                  style={{ width: currentValue ? `${((currentValue - 1) / 4) * 100}%` : '0%' }}
                ></div>
              </div>
              
              {/* Circle markers - perfectly aligned on the track */}
              <div className="absolute flex justify-between w-full px-0 z-10" style={{ top: '14px' }}>
                {[1, 2, 3, 4, 5].map((value) => {
                  // Define badge color for each value
                  const badgeColors = {
                    1: 'bg-red-600 border-red-400',
                    2: 'bg-orange-500 border-orange-400',
                    3: 'bg-indigo-600 border-indigo-400',
                    4: 'bg-green-600 border-green-400',
                    5: 'bg-purple-600 border-purple-400',
                  };
                  
                  const activeColor = badgeColors[value as keyof typeof badgeColors] || 'bg-indigo-600 border-indigo-400';
                  
                  return (
                    <div
                      key={value}
                      onClick={() => handleNumberClick(question.id, value)}
                      className={`
                        cursor-pointer w-6 h-6 rounded-full flex items-center justify-center
                        ${value <= currentValue 
                          ? `${activeColor} text-white shadow-md transform hover:scale-110 transition-transform` 
                          : 'bg-white border-2 border-gray-300 hover:border-indigo-300 transition-colors'}
                      `}
                    >
                      <span className="text-xs font-medium">{value}</span>
                    </div>
                  );
                })}
              </div>
              
              {/* Custom animated thumb */}
              <div 
                className="absolute cursor-grab active:cursor-grabbing z-20 transition-all duration-300" 
                style={{ 
                  left: currentValue ? `calc(${((currentValue - 1) / 4) * 100}%)` : '0%',
                  top: '3px',
                  transform: currentValue ? 'translateX(-50%) scale(1)' : 'translateX(-50%) scale(0.5)',
                  opacity: currentValue ? 1 : 0
                }}
              >
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button 
                        className="flex items-center justify-center w-12 h-12 rounded-full border-2 border-indigo-500 text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transform hover:scale-105 transition-all"
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                        }}
                      >
                        <span className="text-base font-bold">{currentValue || '?'}</span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs p-3 bg-indigo-900 text-white border-none">
                      <p className="font-medium">
                        {`Your selection: ${currentValue || '?'} - ${valueToLabel(currentValue) || 'Select a value'}`}
                      </p>
                      {autoAdvance && currentValue > 0 && (
                        <p className="text-xs mt-1 text-indigo-200">
                          Auto-advance is ON. Will move to next question automatically.
                        </p>
                      )}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
            
            <div className="flex justify-between text-sm font-medium text-gray-700 pt-2 px-1">
              <div className="flex flex-col items-center">
                <span className="text-red-600">Never</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-orange-500">Rarely</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-yellow-500">Sometimes</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-green-500">Often</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-indigo-600">Always</span>
              </div>
            </div>
          </div>
          
          {currentValue > 0 ? (
            <p className="text-center font-semibold mt-4">
              Your answer: {currentValue} - {valueToLabel(currentValue)}
            </p>
          ) : (
            <p className="text-center text-orange-600 font-medium mt-4">
              Please select your answer
            </p>
          )}
        </div>
        
        {/* Error message display - hide when auto advance is on */}
        {error && !autoAdvance && (
          <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200 text-red-600">
            {error}
          </div>
        )}
        
        <div className="flex flex-col items-center justify-center mb-4 space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="auto-advance" 
              checked={autoAdvance}
              onCheckedChange={toggleAutoAdvance}
              className="data-[state=checked]:bg-indigo-600"
            />
            <label
              htmlFor="auto-advance"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Auto Advance
            </label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>Check the box to advance to the next question after you select an answer. You can always go back and adjust your answers.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          {/* Auto-advance notification - only show when the autoAdvancePending flag is true */}
          {autoAdvancePending && (
            <div className="text-sm text-indigo-600 font-medium animate-pulse bg-indigo-50 p-2 rounded-md border border-indigo-100">
              {autoAdvance 
                ? "Auto-advance enabled. The assessment will move forward after you select an answer." 
                : "Auto-advance disabled. You'll need to click Next to proceed after answering."}
            </div>
          )}
        </div>

        {previousQuestion && (
          <div className="mb-4 bg-gray-50 p-3 rounded-md border border-gray-200">
            <p className="text-xs text-gray-500 mb-1">Previous Question (#{previousQuestion.id}):</p>
            <p className="text-xs text-gray-700 mb-1">{previousQuestion.text}</p>
            {prevAnswer > 0 && (
              <p className="text-xs font-medium text-indigo-600">Previous answer: {prevAnswer} - {valueToLabel(prevAnswer)}</p>
            )}
          </div>
        )}

        {/* Auto-advance notification */}
        {autoAdvancePending && (
          <div className="mb-4 p-2 rounded-md bg-indigo-50 border border-indigo-200 text-center">
            <p className="text-indigo-700 font-medium text-sm">
              {autoAdvance 
                ? "Auto-advance is ON. You'll automatically go to the next question after answering."
                : "Auto-advance has been turned OFF. You'll need to click Next after answering each question."}
            </p>
          </div>
        )}
        
        <div className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={goToPrevQuestion}
            disabled={currentQuestion === 0}
          >
            Go Back
          </Button>
          
          <div className="text-center">
            <div className="flex flex-col items-center">
              <div className="w-32 h-2 bg-gray-200 rounded-full mb-1 overflow-hidden">
                <div 
                  className="h-full bg-indigo-600 rounded-full" 
                  style={{ width: `${((currentQuestion + 1) / flowQuestions.length) * 100}%` }}
                ></div>
              </div>
              <span className="text-sm text-gray-500">
                Question {currentQuestion + 1} of {flowQuestions.length}
              </span>
            </div>
          </div>
          
          <Button 
            onClick={nextQuestion}
            className={`bg-indigo-700 hover:bg-indigo-800 ${autoAdvance && currentQuestion < flowQuestions.length - 1 ? 'opacity-50' : ''}`}
            disabled={
              // Disable only if we're not on the last question AND auto-advance is on AND we have a value
              (autoAdvance && currentQuestion < flowQuestions.length - 1 && currentValue > 0) || 
              // Or if we're on the last question but haven't selected a value
              (!currentValue && currentQuestion === flowQuestions.length - 1)
            }
            title={
              autoAdvance && currentValue > 0 && currentQuestion < flowQuestions.length - 1
                ? "Next question will advance automatically" 
                : currentQuestion === flowQuestions.length - 1 && !currentValue
                  ? "Please answer this question" 
                  : ""
            }
          >
            {currentQuestion === flowQuestions.length - 1 ? "Finish" : "Next"}
          </Button>
        </div>
      </div>
      
      {/* Modal dialog removed - results now shown in content view */}
    </div>
  );
}