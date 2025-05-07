import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

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
    if (currentQuestion < flowQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };
  
  // Move to previous question
  const prevQuestion = () => {
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
  
  // Get current question
  const question = flowQuestions[currentQuestion];
  const currentValue = answers[question.id] || 3;
  
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Flow State Self-Assessment</h3>
        
        <p className="text-gray-600 mb-6">
          Rate your agreement with each statement on a scale from 1 (Never) to 5 (Always).
          Answer with a specific activity or task in mind where you most often seek or experience flow.
        </p>
        
        <div className="mb-8">
          <p className="font-medium mb-4">{question.text}</p>
          
          <div className="mb-6">
            <Slider
              value={[currentValue]}
              min={1}
              max={5}
              step={1}
              onValueChange={(value) => handleSliderChange(question.id, value)}
              className="mb-2"
            />
            
            <div className="flex justify-between text-sm text-gray-500">
              <span>1 - Never</span>
              <span>2 - Rarely</span>
              <span>3 - Sometimes</span>
              <span>4 - Often</span>
              <span>5 - Always</span>
            </div>
          </div>
          
          <p className="text-center font-semibold mt-4">
            Your answer: {valueToLabel(currentValue)}
          </p>
        </div>
        
        <div className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={prevQuestion}
            disabled={currentQuestion === 0}
          >
            Previous
          </Button>
          
          <div className="text-center">
            <span className="text-sm text-gray-500">
              Question {currentQuestion + 1} of {flowQuestions.length}
            </span>
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
        <DialogContent className="max-w-md">
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
            
            <div className="space-y-3">
              <h4 className="font-semibold">Scoring & Interpretation</h4>
              <p className="text-sm"><span className="font-medium">50-60: Flow Fluent</span> - You reliably access flow and have developed strong internal and external conditions to sustain it.</p>
              <p className="text-sm"><span className="font-medium">39-49: Flow Aware</span> - You are familiar with the experience but have room to reinforce routines or reduce blockers.</p>
              <p className="text-sm"><span className="font-medium">26-38: Flow Blocked</span> - You occasionally experience flow but face challenges in entry, recovery, or sustaining focus.</p>
              <p className="text-sm"><span className="font-medium">12-25: Flow Distant</span> - You rarely feel in flow; foundational improvements to clarity, challenge, and environment are needed.</p>
            </div>
          </div>
          
          <DialogFooter>
            <Button onClick={closeResultDialog} className="bg-indigo-700 hover:bg-indigo-800">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}