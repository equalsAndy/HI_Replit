import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ContentViewProps } from '../../shared/types';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import { InfoIcon, HelpCircle, X, ChevronRight } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

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
  { id: 7, text: "I feel less self-conscious and more spontaneous when I'm in flow." },
  { id: 8, text: "I do things automatically, almost effortlessly." },
  { id: 9, text: "I enjoy the process itself, not just the results." },
  { id: 10, text: "I have rituals or environments that help me quickly get into deep focus." },
  { id: 11, text: "I forget to take breaks because I'm so immersed." },
  { id: 12, text: "I want to recapture this experience again—it's deeply rewarding." },
];

const FlowAssessmentView: React.FC<ContentViewProps> = ({
  navigate,
  markStepCompleted,
  setCurrentContent,
  starCard
}) => {
  // Check for existing flow score in local storage
  const [hasCompletedAssessment, setHasCompletedAssessment] = useState(() => {
    try {
      const savedAnswers = localStorage.getItem('flowAssessmentAnswers');
      return !!savedAnswers;
    } catch (e) {
      return false;
    }
  });
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>(() => {
    try {
      const savedAnswers = localStorage.getItem('flowAssessmentAnswers');
      return savedAnswers ? JSON.parse(savedAnswers) : {};
    } catch (e) {
      return {};
    }
  });
  const [autoAdvance, setAutoAdvance] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [showScoringInfo, setShowScoringInfo] = useState(false);
  
  // Get current question
  const question = flowQuestions[currentQuestion];
  const currentValue = answers[question?.id] || 0;
  
  // Handle answer selection
  const handleAnswerSelect = (value: number) => {
    // Update answers
    setAnswers(prev => ({
      ...prev,
      [question.id]: value
    }));
    
    // Clear any errors
    setError(null);
    
    // Auto advance to next question if enabled
    if (autoAdvance && currentQuestion < flowQuestions.length - 1) {
      setTimeout(() => {
        setCurrentQuestion(prev => prev + 1);
      }, 700);
    }
  };
  
  // Handle next question
  const handleNext = () => {
    if (!answers[question.id]) {
      setError("Please select an answer before proceeding");
      return;
    }
    
    if (currentQuestion < flowQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      // Calculate flow score
      const flowScore = Object.values(answers).reduce((sum, val) => sum + val, 0);
      
      // Save to API in a real implementation
      console.log("Flow assessment completed with score:", flowScore);
      
      // Mark step as completed
      markStepCompleted('3-2');
      
      // Save assessment to localStorage
      localStorage.setItem('flowAssessmentAnswers', JSON.stringify(answers));
      setHasCompletedAssessment(true);
      
      // Show results modal
      setShowResults(true);
    }
  };
  
  // Handle previous question
  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };
  
  // Handle assessment completion
  const handleComplete = () => {
    // Calculate flow score
    const flowScore = Object.values(answers).reduce((sum, val) => sum + val, 0);
    
    // Save to API in a real implementation
    console.log("Flow assessment completed with score:", flowScore);
    
    // Mark step as completed
    markStepCompleted('3-2');
    
    // Save assessment to localStorage
    localStorage.setItem('flowAssessmentAnswers', JSON.stringify(answers));
    setHasCompletedAssessment(true);
  };
  
  // State to track which popover is open
  const [openPopoverId, setOpenPopoverId] = useState<number | null>(null);
  
  // Update a specific answer directly in the results modal
  const handleUpdateAnswer = (questionId: number, newValue: number) => {
    // Update the answer
    setAnswers(prev => ({
      ...prev,
      [questionId]: newValue
    }));
    
    // Log for debugging
    console.log(`Updated answer for question #${questionId} to ${newValue}`);
    
    // Close the popover immediately after selection
    setOpenPopoverId(null);
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
  
  // Get color for label badge
  const getColorForValue = (value: number) => {
    switch (value) {
      case 1: return "bg-red-500 text-white";
      case 2: return "bg-orange-500 text-white";
      case 3: return "bg-yellow-500 text-white";
      case 4: return "bg-green-500 text-white";
      case 5: return "bg-purple-600 text-white";
      default: return "bg-gray-200 text-gray-800";
    }
  };
  
  // Calculate total score
  const totalScore = Object.values(answers).reduce((sum, val) => sum + val, 0);
  const interpretation = getInterpretation(totalScore);
  
  // Fill demo answers
  const fillDemoAnswers = () => {
    const demoAnswers: Record<number, number> = {};
    flowQuestions.forEach(q => {
      // Generate a random value between 3 and 5
      demoAnswers[q.id] = Math.floor(Math.random() * 3) + 3;
    });
    
    setAnswers(demoAnswers);
    setCurrentQuestion(flowQuestions.length - 1);
  };
  
  // Determine if we should show the assessment or results
  const renderContent = () => {
    if (hasCompletedAssessment) {
      // Show results summary if assessment was already completed
      return (
        <Card className="border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold mb-3">Your Flow State Results</h2>
          
          <p className="mb-4">
            You've completed the flow state assessment. Here's what your results reveal about your flow experience:
          </p>
          
          {/* Score display */}
          <div className="text-center my-6">
            <div className="text-4xl font-bold text-indigo-600 mb-2">
              {totalScore} / {flowQuestions.length * 5}
            </div>
            <div className="text-xl font-semibold text-gray-800">
              {interpretation.level}
            </div>
          </div>
          
          {/* Interpretation box */}
          <div className="bg-blue-50 p-4 rounded-md text-blue-800 mb-6">
            <p>{interpretation.description}</p>
          </div>
          
          {/* Scoring info accordion */}
          <div 
            className="border rounded-md p-4 cursor-pointer" 
            onClick={() => setShowScoringInfo(!showScoringInfo)}
          >
            <div className="flex justify-between items-center">
              <h4 className="font-medium">Scoring & Interpretation</h4>
              <ChevronRight 
                className={`h-5 w-5 transition-transform ${showScoringInfo ? 'rotate-90' : ''}`} 
              />
            </div>
            
            {showScoringInfo && (
              <div className="mt-4 space-y-2 text-sm text-gray-600">
                <p className="font-medium">Flow Score Interpretation:</p>
                <p className="text-sm"><span className="font-medium">50-60: Flow Fluent</span> - You reliably access flow and have developed strong internal and external conditions to sustain it.</p>
                <p className="text-sm"><span className="font-medium">39-49: Flow Aware</span> - You are familiar with the experience but have room to reinforce routines or reduce blockers.</p>
                <p className="text-sm"><span className="font-medium">26-38: Flow Blocked</span> - You occasionally experience flow but face challenges in entry, recovery, or sustaining focus.</p>
                <p className="text-sm"><span className="font-medium">12-25: Flow Distant</span> - You rarely feel in flow; foundational improvements to clarity, challenge, and environment are needed.</p>
              </div>
            )}
          </div>
          
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-3">Next Steps</h3>
            <p className="mb-4">
              Now that you understand your flow profile, you can use these insights to create more optimal conditions for flow in your work and personal life.
            </p>
          </div>
          
          <div className="mt-6 flex justify-end">
            <Button 
              className="bg-indigo-600 hover:bg-indigo-700"
              onClick={() => {
                markStepCompleted('3-2');
                setCurrentContent("flow-rounding-out");
              }}
            >
              Continue to Rounding Out
            </Button>
          </div>
        </Card>
      );
    } else {
      // Show original assessment
      return (
        <Card className="border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold mb-3">Your Flow State Self-Assessment</h2>
          
          <p className="mb-4">
            Purpose: This exercise is designed to help you easily understand what "flow" is and recognize when you are in it, personally and professionally.
          </p>
          
          <p className="mb-6">
            Instructions: Rate your agreement with each of the following statements on a scale from 1 (Never) to 5 (Always). Answer with a specific activity or task in mind where you most often seek or experience flow.
          </p>
          
          <Card className="border border-gray-200 p-6 mb-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Flow State Self-Assessment</h3>
              <Button 
                variant="outline" 
                onClick={fillDemoAnswers}
                className="text-xs py-1 px-2 h-auto border-dashed border-indigo-300 hover:border-indigo-500"
              >
                Fill Demo Answers
              </Button>
            </div>
            
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
                      // Determine the styling based on whether this value is selected
                      const isSelected = value <= currentValue;
                      let bgColor = "bg-white";
                      let textColor = "text-gray-800";
                      let borderStyle = "border-2 border-gray-300 hover:border-indigo-300";
                      
                      if (isSelected) {
                        switch (value) {
                          case 1:
                            bgColor = "bg-red-500";
                            textColor = "text-white";
                            borderStyle = "border-red-400";
                            break;
                          case 2:
                            bgColor = "bg-orange-500";
                            textColor = "text-white";
                            borderStyle = "border-orange-400";
                            break;
                          case 3:
                            bgColor = "bg-yellow-500";
                            textColor = "text-white";
                            borderStyle = "border-yellow-400";
                            break;
                          case 4:
                            bgColor = "bg-green-500";
                            textColor = "text-white";
                            borderStyle = "border-green-400";
                            break;
                          case 5:
                            bgColor = "bg-purple-600";
                            textColor = "text-white";
                            borderStyle = "border-purple-400";
                            break;
                        }
                      }
                      
                      return (
                        <div
                          key={value}
                          onClick={() => handleAnswerSelect(value)}
                          className={`
                            cursor-pointer w-6 h-6 rounded-full flex items-center justify-center
                            ${bgColor} ${textColor} ${borderStyle}
                            ${isSelected ? 'shadow-md transform hover:scale-110 transition-transform' : 'transition-colors'}
                          `}
                        >
                          <span className="text-xs font-medium">{value}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-red-500">Never</span>
                  <span className="text-orange-500">Rarely</span>
                  <span className="text-yellow-500">Sometimes</span>
                  <span className="text-green-500">Often</span>
                  <span className="text-purple-600">Always</span>
                </div>
              </div>
              
              <div className="text-center">
                {currentValue > 0 ? (
                  <p className="text-indigo-600 font-medium">
                    Please select your answer
                  </p>
                ) : null}
              </div>
            </div>
            
            <div className="flex flex-col items-center justify-center mb-4 space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="auto-advance" 
                  checked={autoAdvance}
                  onCheckedChange={(checked) => setAutoAdvance(!!checked)}
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
            </div>
            
            <div className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={handleBack}
                disabled={currentQuestion === 0}
                className="px-4"
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
                className="bg-indigo-600 hover:bg-indigo-700"
                onClick={handleNext}
              >
                {currentQuestion < flowQuestions.length - 1 ? 'Next' : 'Finish'}
              </Button>
            </div>
          </Card>
        </Card>
      );
    }
  };

  return (
    <>
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Finding Your Flow State</h1>
      <p className="text-lg text-gray-600 mb-6">
        Learn about the flow and discover how to optimize your work experience
      </p>
      
      {/* If assessment has been completed, show results */}
      {hasCompletedAssessment ? (
        <Card className="border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold mb-3">Your Flow State Results</h2>
          
          <p className="mb-4">
            You've completed the flow state assessment. Here's what your results reveal about your flow experience:
          </p>
          
          {/* Score display */}
          <div className="text-center my-6">
            <div className="text-4xl font-bold text-indigo-600 mb-2">
              {totalScore} / {flowQuestions.length * 5}
            </div>
            <div className="text-xl font-semibold text-gray-800">
              {interpretation.level}
            </div>
          </div>
          
          {/* Interpretation box */}
          <div className="bg-blue-50 p-4 rounded-md text-blue-800 mb-6">
            <p>{interpretation.description}</p>
          </div>
          
          {/* Scoring info accordion */}
          <div 
            className="border rounded-md p-4 cursor-pointer" 
            onClick={() => setShowScoringInfo(!showScoringInfo)}
          >
            <div className="flex justify-between items-center">
              <h4 className="font-medium">Scoring & Interpretation</h4>
              <ChevronRight 
                className={`h-5 w-5 transition-transform ${showScoringInfo ? 'rotate-90' : ''}`} 
              />
            </div>
            
            {showScoringInfo && (
              <div className="mt-4 space-y-2 text-sm text-gray-600">
                <p className="font-medium">Flow Score Interpretation:</p>
                <p className="text-sm"><span className="font-medium">50-60: Flow Fluent</span> - You reliably access flow and have developed strong internal and external conditions to sustain it.</p>
                <p className="text-sm"><span className="font-medium">39-49: Flow Aware</span> - You are familiar with the experience but have room to reinforce routines or reduce blockers.</p>
                <p className="text-sm"><span className="font-medium">26-38: Flow Blocked</span> - You occasionally experience flow but face challenges in entry, recovery, or sustaining focus.</p>
                <p className="text-sm"><span className="font-medium">12-25: Flow Distant</span> - You rarely feel in flow; foundational improvements to clarity, challenge, and environment are needed.</p>
              </div>
            )}
          </div>
          
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-3">Next Steps</h3>
            <p className="mb-4">
              Now that you understand your flow profile, you can use these insights to create more optimal conditions for flow in your work and personal life.
            </p>
          </div>
          
          <div className="mt-6 flex justify-end">
            <Button 
              className="bg-indigo-600 hover:bg-indigo-700"
              onClick={() => {
                markStepCompleted('3-2');
                setCurrentContent("flow-rounding-out");
              }}
            >
              Continue to Rounding Out
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold mb-3">Your Flow State Self-Assessment</h2>
          
          <p className="mb-4">
            Purpose: This exercise is designed to help you easily understand what "flow" is and recognize when you are in it, personally and professionally.
          </p>
          
          <p className="mb-6">
            Instructions: Rate your agreement with each of the following statements on a scale from 1 (Never) to 5 (Always). Answer with a specific activity or task in mind where you most often seek or experience flow.
          </p>
          
          <Card className="border border-gray-200 p-6 mb-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Flow State Self-Assessment</h3>
              <Button 
                variant="outline" 
                onClick={fillDemoAnswers}
                className="text-xs py-1 px-2 h-auto border-dashed border-indigo-300 hover:border-indigo-500"
              >
                Fill Demo Answers
              </Button>
            </div>
            
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
                      // Determine the styling based on whether this value is selected
                      const isSelected = value <= currentValue;
                      let bgColor = "bg-white";
                      let textColor = "text-gray-800";
                      let borderStyle = "border-2 border-gray-300 hover:border-indigo-300";
                      
                      if (isSelected) {
                        switch (value) {
                          case 1:
                            bgColor = "bg-red-500";
                            textColor = "text-white";
                            borderStyle = "border-red-400";
                            break;
                          case 2:
                            bgColor = "bg-orange-500";
                            textColor = "text-white";
                            borderStyle = "border-orange-400";
                            break;
                          case 3:
                            bgColor = "bg-yellow-500";
                            textColor = "text-white";
                            borderStyle = "border-yellow-400";
                            break;
                          case 4:
                            bgColor = "bg-green-500";
                            textColor = "text-white";
                            borderStyle = "border-green-400";
                            break;
                          case 5:
                            bgColor = "bg-purple-600";
                            textColor = "text-white";
                            borderStyle = "border-purple-400";
                            break;
                        }
                      }
                      
                      return (
                        <div
                          key={value}
                          onClick={() => handleAnswerSelect(value)}
                          className={`
                            cursor-pointer w-6 h-6 rounded-full flex items-center justify-center
                            ${bgColor} ${textColor} ${borderStyle}
                            ${isSelected ? 'shadow-md transform hover:scale-110 transition-transform' : 'transition-colors'}
                          `}
                        >
                          <span className="text-xs font-medium">{value}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-red-500">Never</span>
                  <span className="text-orange-500">Rarely</span>
                  <span className="text-yellow-500">Sometimes</span>
                  <span className="text-green-500">Often</span>
                  <span className="text-purple-600">Always</span>
                </div>
              </div>
              
              <div className="text-center">
                {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
              </div>
            </div>
            
            <div className="flex flex-col items-center justify-center mb-4 space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="auto-advance" 
                  checked={autoAdvance}
                  onCheckedChange={(checked) => setAutoAdvance(!!checked)}
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
            </div>
            
            <div className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={handleBack}
                disabled={currentQuestion === 0}
                className="px-4"
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
                className="bg-indigo-600 hover:bg-indigo-700"
                onClick={handleNext}
              >
                {currentQuestion < flowQuestions.length - 1 ? 'Next' : 'Finish'}
              </Button>
            </div>
          </Card>
        </Card>
      )}
      
      {/* Results Modal */}
      <Dialog open={showResults} onOpenChange={setShowResults}>
        <DialogContent className="max-w-4xl p-0 gap-0 overflow-hidden bg-white rounded-lg">
          <div className="flex justify-between items-center p-4 border-b">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Your Flow Assessment Results</h2>
              <p className="text-gray-500 text-sm">Based on your responses to all {flowQuestions.length} questions.</p>
            </div>
            {/* Close button removed to avoid duplicate X in corner */}
          </div>
          
          <div className="p-6 overflow-y-auto max-h-[80vh]">
            {/* Score display */}
            <div className="text-center my-6">
              <div className="text-4xl font-bold text-indigo-600 mb-2">
                {totalScore} / {flowQuestions.length * 5}
              </div>
              <div className="text-xl font-semibold text-gray-800">
                {interpretation.level}
              </div>
            </div>
            
            {/* Interpretation box */}
            <div className="bg-blue-50 p-4 rounded-md text-blue-800 mb-6">
              <p>{interpretation.description}</p>
            </div>
            
            {/* Answers summary */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Your Answers Summary</h3>
              <p className="text-gray-600 mb-4">Review your answers below. Click an answer or the Adjust button to modify your responses.</p>
              
              <div className="border rounded-md divide-y">
                <div className="grid grid-cols-[1fr,auto,auto] p-3 bg-gray-50 text-sm text-gray-500 font-medium sticky top-0 z-10">
                  <div>QUESTION</div>
                  <div>YOUR ANSWER</div>
                  <div>ACTION</div>
                </div>
                
                <div className="max-h-72 overflow-y-auto divide-y">
                  {flowQuestions.map((q) => {
                    const answerValue = answers[q.id] || 0;
                    if (answerValue === 0) return null;
                    
                    return (
                      <div key={q.id} className="grid grid-cols-[1fr,auto,auto] items-center p-3">
                        <div className="pr-4">
                          <p className="text-gray-800">Question #{q.id}: {q.text}</p>
                        </div>
                        
                        <div className="px-3">
                          <div className={`px-4 py-1 rounded-full text-sm font-medium ${getColorForValue(answerValue)}`}>
                            {valueToLabel(answerValue)}
                          </div>
                        </div>
                        
                        <div className="text-center">
                          <Popover open={openPopoverId === q.id} onOpenChange={(open) => {
                            if (open) {
                              setOpenPopoverId(q.id);
                            } else {
                              setOpenPopoverId(null);
                            }
                          }}>
                            <PopoverTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 transition-colors" 
                              >
                                <span className="text-indigo-600 mr-1">⚙</span> Adjust
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80 p-3">
                              <div className="space-y-4">
                                <h4 className="font-medium text-sm">Adjust your answer:</h4>
                                <p className="text-sm text-gray-500">{q.text}</p>
                                <div className="flex justify-between items-center gap-2">
                                  {[1, 2, 3, 4, 5].map((value) => (
                                    <div
                                      key={value}
                                      onClick={() => handleUpdateAnswer(q.id, value)}
                                      className={`
                                        cursor-pointer w-8 h-8 rounded-full flex items-center justify-center
                                        ${value === answerValue 
                                          ? value === 1 ? 'bg-red-500 text-white shadow-md' 
                                          : value === 2 ? 'bg-orange-500 text-white shadow-md'
                                          : value === 3 ? 'bg-yellow-500 text-white shadow-md'
                                          : value === 4 ? 'bg-green-500 text-white shadow-md'
                                          : 'bg-purple-600 text-white shadow-md'
                                          : 'bg-gray-100 hover:bg-gray-200 transition-colors duration-200'}
                                        transform hover:scale-110 transition-transform duration-200
                                      `}
                                    >
                                      {value}
                                    </div>
                                  ))}
                                </div>
                                <div className="flex justify-between text-xs">
                                  <span className="text-red-500">Never</span>
                                  <span className="text-orange-500">Rarely</span>
                                  <span className="text-yellow-500">Sometimes</span>
                                  <span className="text-green-500">Often</span>
                                  <span className="text-purple-600">Always</span>
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            
            {/* Scoring information */}
            <div className="border rounded-md overflow-hidden mb-6">
              <div 
                className="flex items-center justify-between p-3 cursor-pointer bg-white hover:bg-gray-50" 
                onClick={() => setShowScoringInfo(!showScoringInfo)}
              >
                <h3 className="text-lg font-semibold">Scoring & Interpretation</h3>
                <ChevronRight className={`h-5 w-5 transition-transform ${showScoringInfo ? 'rotate-90' : ''}`} />
              </div>
              
              {showScoringInfo && (
                <div className="p-4 bg-gray-50 text-sm text-gray-600 border-t">
                  <p className="mb-2">Your Flow Score is calculated by adding up your responses to all {flowQuestions.length} questions:</p>
                  
                  <ul className="list-disc pl-5 mb-3 space-y-1">
                    <li><strong>50-60 points:</strong> Flow Fluent - You reliably access flow states.</li>
                    <li><strong>39-49 points:</strong> Flow Aware - You experience flow but have room to improve.</li>
                    <li><strong>26-38 points:</strong> Flow Blocked - You struggle with consistency in flow.</li>
                    <li><strong>12-25 points:</strong> Flow Distant - Flow is a rare experience for you.</li>
                  </ul>
                  
                  <p>This assessment is based on Mihaly Csikszentmihalyi's flow research and identifies your current relationship with flow states.</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="border-t p-4 bg-gray-50 flex justify-end">
            <Button 
              onClick={handleComplete}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              Continue to Rounding Out
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FlowAssessmentView;