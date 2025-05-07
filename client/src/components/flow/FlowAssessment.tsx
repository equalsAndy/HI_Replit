import { useState, useEffect } from 'react';
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
import { HelpCircle } from 'lucide-react';

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

export default function FlowAssessment() {
  // State for tracking answers
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [autoAdvance, setAutoAdvance] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
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
  
  // Handle slider change
  const handleSliderChange = (questionId: number, value: number[]) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value[0]
    }));
    
    // Auto advance to next question after a short delay if enabled
    if (autoAdvance && currentQuestion < flowQuestions.length - 1) {
      setTimeout(() => {
        nextQuestion();
      }, 700); // delay to give user time to see their selection
    }
  };
  
  // Handle quick selection of default (3 - Sometimes)
  const handleQuickSelect = (questionId: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: 3
    }));
    
    // Auto advance to next question after a short delay if enabled
    if (autoAdvance && currentQuestion < flowQuestions.length - 1) {
      setTimeout(() => {
        nextQuestion();
      }, 700); // delay to give user time to see their selection
    }
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
    
    setError(null);
    
    if (currentQuestion < flowQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      // Check if all questions have been answered
      const allQuestionsAnswered = flowQuestions.every(q => !!answers[q.id]);
      if (!allQuestionsAnswered) {
        setError("Please answer all questions before submitting.");
        return;
      }
      handleSubmit();
    }
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
  
  // Get current question and previous question
  const question = flowQuestions[currentQuestion];
  const currentValue = answers[question.id] || 0; // No default value
  
  // Get previous question for display
  const previousQuestion = currentQuestion > 0 ? flowQuestions[currentQuestion - 1] : null;
  const prevAnswer = previousQuestion ? answers[previousQuestion.id] || 0 : 0;
  
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
            <span className="inline-block w-8 h-8 rounded-full bg-indigo-600 text-white text-center leading-8 mr-2">
              {question.id}
            </span>
            {question.text}
          </p>
          
          <div className="mb-6 relative">
            <div className="h-12 relative">
              <div className="absolute h-2 rounded-full bg-gray-200 w-full top-6 z-0">
                <div 
                  className="absolute h-2 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-600" 
                  style={{ width: `${((currentValue - 1) / 4) * 100}%` }}
                ></div>
              </div>
              
              {/* Custom slider track with positions for 1-5 */}
              <div className="absolute flex justify-between w-full top-4 px-1 z-10">
                {[1, 2, 3, 4, 5].map((value) => (
                  <div
                    key={value}
                    onClick={() => handleSliderChange(question.id, [value])}
                    className={`cursor-pointer w-4 h-4 rounded-full ${value <= currentValue ? 'bg-indigo-600' : 'bg-gray-300'}`}
                  />
                ))}
              </div>
              
              {/* Custom thumb that replaces the default white circle */}
              <div 
                className="absolute cursor-grab active:cursor-grabbing z-20" 
                style={{ 
                  left: `calc(${((currentValue - 1) / 4) * 100}% - 20px)`,
                  top: '-6px'
                }}
              >
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button 
                        onClick={() => handleQuickSelect(question.id)}
                        className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-indigo-500 text-indigo-600 bg-white hover:bg-indigo-50 shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                        }}
                      >
                        <span className="text-sm font-semibold">{currentValue}</span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>{autoAdvance 
                        ? "Click to select '3 - Sometimes' and automatically advance" 
                        : `Your current selection: ${currentValue} - ${valueToLabel(currentValue)}`}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
            
            <div className="flex justify-between text-sm text-gray-500 pt-4">
              <span>1 - Never</span>
              <span>2 - Rarely</span>
              <span>3 - Sometimes</span>
              <span>4 - Often</span>
              <span>5 - Always</span>
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
        
        {/* Error message display */}
        {error && (
          <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200 text-red-600">
            {error}
          </div>
        )}
        
        <div className="flex items-center justify-center mb-4">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="auto-advance" 
              checked={autoAdvance}
              onCheckedChange={(checked) => setAutoAdvance(!!checked)}
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
        </div>

        {previousQuestion && (
          <div className="mb-4 bg-gray-50 p-3 rounded-md border border-gray-200">
            <p className="text-xs text-gray-500 mb-1">Question #{previousQuestion.id}:</p>
            <p className="text-xs text-gray-700 mb-1">{previousQuestion.text}</p>
            {prevAnswer > 0 && (
              <p className="text-xs font-medium text-indigo-600">Your answer: {prevAnswer} - {valueToLabel(prevAnswer)}</p>
            )}
          </div>
        )}

        <div className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={goToPrevQuestion}
            disabled={currentQuestion === 0}
          >
            Previous
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
            className="bg-indigo-700 hover:bg-indigo-800"
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
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 mr-1 text-xs font-semibold">
                            {q.id}
                          </span>
                          {q.text}
                        </td>
                        <td className="px-3 py-2 text-center">
                          <div className="flex items-center justify-center">
                            <div className="relative w-24 h-6 mx-2">
                              {/* Custom slider track */}
                              <div className="absolute h-2 rounded-full bg-gray-200 w-full top-2 z-0">
                                <div 
                                  className="absolute h-2 rounded-full bg-gradient-to-r from-indigo-400 to-indigo-600" 
                                  style={{ width: `${((answers[q.id] || 3) - 1) / 4 * 100}%` }}
                                ></div>
                              </div>
                              
                              {/* Custom markers */}
                              <div className="absolute flex justify-between w-full px-1 z-10">
                                {[1, 2, 3, 4, 5].map((value) => (
                                  <div
                                    key={value}
                                    onClick={() => {
                                      setAnswers(prev => ({
                                        ...prev,
                                        [q.id]: value
                                      }));
                                    }}
                                    className={`cursor-pointer w-3 h-3 rounded-full mt-0.5 ${
                                      value <= (answers[q.id] || 3) ? 'bg-indigo-600' : 'bg-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                              
                              {/* Custom thumb */}
                              <div 
                                className="absolute cursor-pointer z-20"
                                style={{ 
                                  left: `calc(${(((answers[q.id] || 3) - 1) / 4) * 100}% - 8px)`,
                                  top: '-2px'
                                }}
                              >
                                <div className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-indigo-500 text-indigo-600 bg-white shadow-sm">
                                  <span className="text-xs font-semibold">{answers[q.id] || 3}</span>
                                </div>
                              </div>
                            </div>
                            
                            <span className="text-xs font-medium px-2 py-1 rounded-full bg-indigo-100 text-indigo-800 ml-2 min-w-[70px] text-center">
                              {valueToLabel(answers[q.id] || 3)}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-2 text-right text-xs text-gray-500">
                          Slide to change
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