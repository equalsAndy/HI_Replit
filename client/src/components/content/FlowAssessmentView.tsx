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
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
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
      // Complete assessment and show results
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
    
    // Navigate to next step
    setShowResults(false);
    setCurrentContent("flow-rounding-out");
  };
  
  // Adjust a specific answer
  const handleAdjustAnswer = (questionId: number) => {
    setShowResults(false);
    setCurrentQuestion(questionId - 1);
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
  
  return (
    <>
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Finding Your Flow State</h1>
      <p className="text-lg text-gray-600 mb-6">
        Learn about the flow and discover how to optimize your work experience
      </p>
      
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
          
          <p className="text-gray-600 mb-6">
            Rate your agreement with each statement on a scale from 1 (Never) to 5 (Always). Answer with a specific activity or task in mind where you most often seek or experience flow.
          </p>
          
          <div className="mb-8">
            <h4 className="font-medium mb-4">Question #{question.id}: {question.text}</h4>
            
            <div className="mb-2">
              <Slider
                value={currentValue ? [currentValue] : [0]}
                min={1}
                max={5}
                step={1}
                className="w-full"
                onValueChange={(val) => handleAnswerSelect(val[0])}
              />
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-red-500">Never</span>
              <span className="text-orange-500">Rarely</span>
              <span className="text-yellow-500">Sometimes</span>
              <span className="text-green-500">Often</span>
              <span className="text-blue-500">Always</span>
            </div>
            
            <div className="flex justify-center gap-4 mt-4">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer border ${currentValue === 1 ? 'bg-red-500 text-white' : 'border-red-500 text-red-500'}`}
                onClick={() => handleAnswerSelect(1)}
              >
                1
              </div>
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer border ${currentValue === 2 ? 'bg-orange-500 text-white' : 'border-orange-500 text-orange-500'}`}
                onClick={() => handleAnswerSelect(2)}
              >
                2
              </div>
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer border ${currentValue === 3 ? 'bg-yellow-500 text-white' : 'border-yellow-500 text-yellow-500'}`}
                onClick={() => handleAnswerSelect(3)}
              >
                3
              </div>
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer border ${currentValue === 4 ? 'bg-green-500 text-white' : 'border-green-500 text-green-500'}`}
                onClick={() => handleAnswerSelect(4)}
              >
                4
              </div>
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer border ${currentValue === 5 ? 'bg-blue-500 text-white' : 'border-blue-500 text-blue-500'}`}
                onClick={() => handleAnswerSelect(5)}
              >
                5
              </div>
            </div>
            
            {error && (
              <div className="text-red-500 text-center mt-2">{error}</div>
            )}
          </div>
          
          <div className="flex justify-center items-center mb-4">
            <div className="flex items-center gap-2">
              <Checkbox 
                id="auto-advance" 
                checked={autoAdvance} 
                onCheckedChange={(checked) => setAutoAdvance(!!checked)}
              />
              <label htmlFor="auto-advance" className="text-sm cursor-pointer">
                Auto Advance
              </label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span><HelpCircle className="w-4 h-4 text-gray-400" /></span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="w-64 text-xs">When enabled, the assessment will automatically move to the next question after you select an answer.</p>
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
            >
              Go Back
            </Button>
            
            <div className="text-sm text-gray-500">
              Question {currentQuestion + 1} of {flowQuestions.length}
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
    </>
  );
};

export default FlowAssessmentView;