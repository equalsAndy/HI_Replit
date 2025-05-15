import { useState, useEffect, useRef } from 'react';
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

interface FlowAssessmentProps {
  isCompleted?: boolean;
  onTabChange?: (tabId: string) => void;
}

export default function FlowAssessment({ isCompleted = false, onTabChange }: FlowAssessmentProps) {
  // State for tracking answers
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [autoAdvance, setAutoAdvance] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoAdvancePending, setAutoAdvancePending] = useState(false);
  
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
  
  // Common function to handle all value selections
  const handleValueSelection = (questionId: number, value: number) => {
    // Skip if already selected this value
    if (answers[questionId] === value) {
      return;
    }
    
    // Clear any existing timeout to prevent multiple advances
    if (autoAdvanceTimeoutRef.current) {
      clearTimeout(autoAdvanceTimeoutRef.current);
      autoAdvanceTimeoutRef.current = null;
    }
    
    // Update answers immediately
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
    
    // Clear error
    setError(null);
    
    // Handle auto-advance if enabled
    if (autoAdvance && currentQuestion < flowQuestions.length - 1) {
      // Create a new timeout
      autoAdvanceTimeoutRef.current = setTimeout(() => {
        nextQuestion();
      }, 700);
    }
  };
  
  // Handle slider change - pass to common handler
  const handleSliderChange = (questionId: number, value: number[]) => {
    handleValueSelection(questionId, value[0]);
  };
  
  // Handle quick selection (the "3" button) - pass to common handler
  const handleQuickSelect = (questionId: number) => {
    handleValueSelection(questionId, 3);
  };
  
  // Handle direct number click - pass to common handler
  const handleNumberClick = (questionId: number, value: number) => {
    handleValueSelection(questionId, value);
  };
  
  // Handle submit
  const handleSubmit = () => {
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
  
  // Move to previous question
  const goToPrevQuestion = () => {
    if (currentQuestion > 0) {
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
    // This effect ensures we only run the reset when changing questions
    if (!answers[question.id]) {
      // If no answer for this question, clear the current value
    }
    
    // Clear any error messages when moving to a new question
    setError(null);
  }, [currentQuestion]);
  
  // Get current question and previous question
  const question = flowQuestions[currentQuestion];
  const currentValue = answers[question.id] || 0; // No default value
  
  // Get previous question for display
  const previousQuestion = currentQuestion > 0 ? flowQuestions[currentQuestion - 1] : null;
  const prevAnswer = previousQuestion ? answers[previousQuestion.id] || 0 : 0;
  
  // If the assessment is already completed, show a completion message
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
                        onClick={() => handleQuickSelect(question.id)}
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
                      <p className="font-medium">{autoAdvance 
                        ? "Click to select '3 - Sometimes' and automatically advance" 
                        : `Your selection: ${currentValue || '?'} - ${valueToLabel(currentValue) || 'Select a value'}`}</p>
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
              onCheckedChange={(checked) => {
                const isEnabling = !!checked;
                setAutoAdvance(isEnabling);
                
                // Only show notification when enabling auto-advance and there's already an answer
                if (isEnabling && currentValue > 0) {
                  setAutoAdvancePending(true);
                  setTimeout(() => setAutoAdvancePending(false), 5000);
                } else {
                  // Make sure it's off when disabling
                  setAutoAdvancePending(false);
                }
              }}
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
            <div className="text-sm text-indigo-600 font-medium animate-pulse">
              Click your selection again to advance to the next question
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
            className={`bg-indigo-700 hover:bg-indigo-800 ${autoAdvance ? 'opacity-50' : ''}`}
            disabled={(autoAdvance && currentValue > 0) || (!currentValue && currentQuestion === flowQuestions.length - 1)}
            title={
              autoAdvance && currentValue > 0 
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
      
      {/* Results Dialog */}
      <Dialog open={showResult} onOpenChange={setShowResult}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Your Flow Assessment Results</DialogTitle>
            <DialogDescription>
              Based on your responses to all {flowQuestions.length} questions.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="text-center mb-4">
              <p className="text-2xl font-bold text-indigo-700">
                {calculateScore()} / {flowQuestions.length * 5}
              </p>
              <p className="text-lg font-semibold">
                {getInterpretation(calculateScore()).level}
              </p>
            </div>
            
            <div className="mb-4 p-4 bg-indigo-50 rounded-lg">
              <p>{getInterpretation(calculateScore()).description}</p>
            </div>
            
            {/* Questions and Answers Recap */}
            <div className="mb-6">
              <h4 className="font-semibold mb-3">Your Answers Summary</h4>
              <p className="text-sm text-gray-600 mb-3">
                Review your answers below. Adjust the sliders directly to modify any of your responses.
              </p>
              
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
                      <th scope="col" className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {flowQuestions.map((q) => (
                      <tr key={q.id} className={q.id % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="px-3 py-2 text-xs text-gray-700">
                          <span className="font-semibold mr-1">Question #{q.id}:</span> {q.text}
                        </td>
                        <td className="px-3 py-2 text-center">
                          <div className="flex items-center justify-center">
                            <div className="relative w-28 h-8 mx-2">
                              {/* Custom slider track */}
                              <div className="absolute h-2 rounded-full bg-gray-200 w-full top-3 z-0 shadow-inner overflow-hidden">
                                <div 
                                  className="absolute h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 transition-all duration-300 ease-out" 
                                  style={{ 
                                    width: answers[q.id] ? `${(answers[q.id] - 1) / 4 * 100}%` : '0%',
                                    display: answers[q.id] ? 'block' : 'none'
                                  }}
                                ></div>
                              </div>
                              
                              {/* Circle markers - perfectly aligned */}
                              <div className="absolute flex justify-between w-full px-0 z-10">
                                {[1, 2, 3, 4, 5].map((value) => {
                                  return (
                                    <div
                                      key={value}
                                      onClick={() => handleNumberClick(q.id, value)}
                                      className={`
                                        cursor-pointer w-4 h-4 rounded-full flex items-center justify-center mt-1
                                        ${answers[q.id] && value <= answers[q.id]
                                          ? 'bg-indigo-600 text-white shadow transform hover:scale-110 transition-transform' 
                                          : 'bg-white border border-gray-300 hover:border-indigo-300 transition-colors'}
                                      `}
                                    >
                                    </div>
                                  );
                                })}
                              </div>
                              
                              {/* Custom thumb */}
                              <div 
                                className="absolute cursor-pointer z-20 transition-all duration-300"
                                style={{ 
                                  left: `calc(${((answers[q.id] - 1) / 4) * 100}%)`,
                                  top: '-4px',
                                  transform: 'translateX(-50%)',
                                  display: answers[q.id] ? 'block' : 'none' // Hide if no answer
                                }}
                              >
                                <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-indigo-500 text-white bg-indigo-600 shadow-md">
                                  <span className="text-xs font-bold">{answers[q.id]}</span>
                                </div>
                              </div>
                            </div>
                            
                            <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-indigo-100 text-indigo-800 ml-2 min-w-[80px] text-center shadow-sm border border-indigo-200">
                              {answers[q.id] ? valueToLabel(answers[q.id]) : 'Not answered'}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-2 text-right text-xs">
                          <span className="inline-flex items-center px-2 py-1 rounded-md bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors cursor-pointer">
                            <SliderIcon className="h-3 w-3 mr-1" /> Adjust
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold">Scoring & Interpretation</h4>
              <p className="text-sm"><span className="font-medium">50-60: Flow Fluent</span> - You reliably access flow and have developed strong internal and external conditions to sustain it.</p>
              <p className="text-sm"><span className="font-medium">39-49: Flow Aware</span> - You are familiar with the experience but have room to reinforce routines or reduce blockers.</p>
              <p className="text-sm"><span className="font-medium">26-38: Flow Blocked</span> - You occasionally experience flow but face challenges in entry, recovery, or sustaining focus.</p>
              <p className="text-sm"><span className="font-medium">12-25: Flow Distant</span> - You rarely feel in flow; foundational improvements to clarity, challenge, and environment are needed.</p>
            </div>
          </div>
          
          <DialogFooter className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={() => {
                setShowResult(false);
                setCurrentQuestion(0);
              }}
            >
              Restart Assessment
            </Button>
            <Button onClick={closeResultDialog} className="bg-indigo-700 hover:bg-indigo-800">
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}