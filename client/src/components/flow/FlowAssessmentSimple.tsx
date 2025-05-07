import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
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
import { useLocation } from 'wouter';

interface FlowQuestion {
  id: number;
  text: string;
}

// Flow assessment questions
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

// Debug logging
const DEBUG = true;
const log = (message: string, data?: any) => {
  if (!DEBUG) return;
  if (data) {
    console.log(`[FlowAssessment] ${message}`, data);
  } else {
    console.log(`[FlowAssessment] ${message}`);
  }
};

export default function FlowAssessmentSimple() {
  // Location for navigation
  const [location, navigate] = useLocation();
  
  // Basic state
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [autoAdvance, setAutoAdvance] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  
  // Get current question
  const question = flowQuestions[currentQuestion];
  const currentValue = answers[question.id] || 0;
  
  // Get previous question for display
  const previousQuestion = currentQuestion > 0 ? flowQuestions[currentQuestion - 1] : null;
  const prevAnswer = previousQuestion ? answers[previousQuestion.id] || 0 : 0;

  // Calculate score
  const calculateScore = () => {
    return Object.values(answers).reduce((sum, score) => sum + score, 0);
  };
  
  // Get interpretation
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

  // Value to label conversion
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

  // SIMPLE DIRECT EVENT HANDLERS - NO MAGIC
  
  // Handle selection
  const handleSelection = (value: number) => {
    // Skip if it's the same value to prevent unnecessary updates
    if (answers[question.id] === value) {
      return;
    }
    
    log(`Selection made: ${value} for question ${question.id}`);
    
    // Store the value
    setAnswers(prev => {
      const newAnswers = {
        ...prev,
        [question.id]: value
      };
      
      // Clear error
      setError(null);
      
      // Clear any temporary message
      if (message) {
        setMessage(null);
      }
      
      // Auto advance if enabled - using a separate function call
      // to ensure we have the latest state
      if (autoAdvance) {
        log("Auto-advancing after selection");
        // Allow a brief moment to see the selection before advancing
        setTimeout(() => {
          const currentQ = question.id;
          if (newAnswers[currentQ]) {
            // Directly call next with answer validated
            if (currentQuestion < flowQuestions.length - 1) {
              setCurrentQuestion(prevQ => prevQ + 1);
            } else {
              // On last question, show results if all questions are answered
              const allAnswered = flowQuestions.every(q => !!newAnswers[q.id]);
              if (allAnswered) {
                setShowResults(true);
              }
            }
          }
        }, 700);
      }
      
      return newAnswers;
    });
  };
  
  // Next button handler
  const goToNextQuestion = () => {
    // Create a local reference to prevent closure issues
    const currentQ = question.id;
    
    log(`Advancing from question ${currentQ}, answer=${answers[currentQ]}`);
    
    // Validate answer
    if (!answers[currentQ]) {
      setError("Please select an answer before proceeding");
      return;
    }
    
    // Clear error
    setError(null);
    
    // Check if on last question
    if (currentQuestion >= flowQuestions.length - 1) {
      // Check all answers are provided
      const allAnswered = flowQuestions.every(q => !!answers[q.id]);
      if (!allAnswered) {
        setError("Please answer all questions before finishing");
        return;
      }
      
      // Show results
      setShowResults(true);
    } else {
      // Advance to next question
      setCurrentQuestion(prevQuestion => prevQuestion + 1);
    }
  };
  
  // Previous button handler
  const goToPrevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };
  
  // Toggle auto-advance
  const toggleAutoAdvance = (checked: boolean) => {
    log(`Auto-advance toggled: ${checked}`);
    
    // Update auto-advance state
    setAutoAdvance(checked);
    
    // Show temporary message when turning on auto-advance with existing answer
    if (checked && answers[question.id]) {
      setMessage("Click your selection again to advance to the next question");
      
      // Clear the message after 5 seconds
      setTimeout(() => {
        setMessage(null);
      }, 5000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Flow State Self-Assessment</h3>
        
        <p className="text-gray-600 mb-6">
          Rate your agreement with each statement on a scale from 1 (Never) to 5 (Always).
          Answer with a specific activity or task in mind where you most often seek or experience flow.
        </p>
        
        <div className="mb-8">
          <p className="font-medium mb-4">
            <span className="font-bold mr-1">Question #{question.id}:</span> {question.text}
          </p>
          
          {/* Simple number selection interface */}
          <div className="mb-8">
            <div className="flex justify-between items-center max-w-xl mx-auto">
              {[1, 2, 3, 4, 5].map((value) => (
                <div key={value} className="flex flex-col items-center space-y-2">
                  <button
                    onClick={() => handleSelection(value)}
                    className={`
                      w-12 h-12 rounded-full flex items-center justify-center 
                      transition-all duration-200 transform hover:scale-110
                      ${currentValue === value 
                        ? 'bg-indigo-600 text-white font-bold shadow-lg border-2 border-indigo-400' 
                        : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-indigo-400'}
                    `}
                  >
                    {value}
                  </button>
                  <span className={`text-sm font-medium ${
                    value === 1 ? 'text-red-600' :
                    value === 2 ? 'text-orange-500' :
                    value === 3 ? 'text-yellow-500' :
                    value === 4 ? 'text-green-500' :
                    'text-indigo-600'
                  }`}>
                    {valueToLabel(value)}
                  </span>
                </div>
              ))}
            </div>
            

          </div>
          
          {/* Current selection display */}
          {currentValue ? (
            <p className="text-center font-semibold text-indigo-700 mt-4">
              Your answer: {currentValue} - {valueToLabel(currentValue)}
            </p>
          ) : (
            <p className="text-center text-orange-600 font-medium mt-4">
              Please select your answer
            </p>
          )}
        </div>
        
        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200 text-red-600">
            {error}
          </div>
        )}
        
        {/* Auto-advance toggle */}
        <div className="flex flex-col items-center justify-center mb-4 space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="auto-advance-simple" 
              checked={autoAdvance}
              onCheckedChange={(checked) => toggleAutoAdvance(!!checked)}
            />
            <label
              htmlFor="auto-advance-simple"
              className="text-sm font-medium leading-none"
            >
              Auto Advance
            </label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div><HelpCircle className="h-4 w-4 text-gray-400 cursor-help" /></div>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>Check the box to advance to the next question after you select an answer.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          {/* Temporary message */}
          {message && (
            <div className="text-sm text-indigo-600 font-medium animate-pulse">
              {message}
            </div>
          )}
        </div>

        {/* Previous question display */}
        {previousQuestion && (
          <div className="mb-4 bg-gray-50 p-3 rounded-md border border-gray-200">
            <p className="text-xs text-gray-500 mb-1">Previous Question (#{previousQuestion.id}):</p>
            <p className="text-xs text-gray-700 mb-1">{previousQuestion.text}</p>
            {prevAnswer > 0 && (
              <p className="text-xs font-medium text-indigo-600">
                Previous answer: {prevAnswer} - {valueToLabel(prevAnswer)}
              </p>
            )}
          </div>
        )}

        {/* Navigation with progress bar */}
        <div className="space-y-4">
          {/* Progress bar */}
          <div className="flex flex-col items-center justify-center">
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-600 rounded-full" 
                style={{ width: `${((currentQuestion + 1) / flowQuestions.length) * 100}%` }}
              ></div>
            </div>
            <div className="flex justify-between w-full mt-1 text-xs text-gray-500">
              <span>Question {currentQuestion + 1}</span>
              <span>of {flowQuestions.length}</span>
            </div>
          </div>
          
          {/* Navigation buttons */}
          <div className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={goToPrevQuestion}
              disabled={currentQuestion === 0}
            >
              Go Back
            </Button>
            
            <Button 
              onClick={goToNextQuestion}
              disabled={!currentValue || (autoAdvance && currentValue > 0)}
              className={`bg-indigo-700 hover:bg-indigo-800 ${autoAdvance ? 'opacity-50' : ''}`}
            >
              {currentQuestion === flowQuestions.length - 1 ? "Finish" : "Next"}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Results Dialog */}
      <Dialog open={showResults} onOpenChange={setShowResults}>
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
            
            {/* Questions and Answers Summary */}
            <div className="mb-6">
              <h4 className="font-semibold mb-3">Your Answers Summary</h4>
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
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {flowQuestions.map((q) => (
                      <tr key={q.id} className={q.id % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="px-3 py-2 text-xs text-gray-700">
                          <span className="font-semibold mr-1">Question #{q.id}:</span> {q.text}
                        </td>
                        <td className="px-3 py-2 text-center">
                          <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-indigo-100 text-indigo-800 shadow-sm border border-indigo-200">
                            {answers[q.id] ? `${answers[q.id]} - ${valueToLabel(answers[q.id])}` : 'Not answered'}
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
                setShowResults(false);
                setCurrentQuestion(0);
              }}
            >
              Restart Assessment
            </Button>
            <Button 
              onClick={() => {
                // Close the results dialog
                setShowResults(false);
                
                // Save progress to server (in a real app)
                // Here we're just navigating to the rounding-out page
                log("Flow assessment completed, navigating to rounding-out page");
                
                // Navigate to the rounding-out page
                navigate("/rounding-out");
              }} 
              className="bg-indigo-700 hover:bg-indigo-800"
            >
              Continue to Rounding Out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}