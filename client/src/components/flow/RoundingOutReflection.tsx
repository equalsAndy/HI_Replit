import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { useTestUser } from '@/hooks/useTestUser';
import { FileText } from 'lucide-react';

interface RoundingOutQuestion {
  id: number;
  text: string;
  hint?: string;
}

interface RoundingOutProps {
  onComplete?: () => void;
}

// Rounding Out Questions
const roundingOutQuestions: RoundingOutQuestion[] = [
  {
    id: 1,
    text: "When does stress or distraction tend to show up for you?",
    hint: "Reflect on patterns, triggers, or situations that knock you off balance."
  },
  {
    id: 2,
    text: "Which strengths or qualities do you need to nurture — and why?",
    hint: "Consider what parts of you need extra care, attention, or encouragement to thrive."
  },
  {
    id: 3,
    text: "How will you harness your strengths to create forward momentum — especially when things feel uncertain or stuck?",
    hint: "Consider how your natural abilities could help you move through challenges or take meaningful next steps."
  }
];

export default function RoundingOutReflection({ onComplete }: RoundingOutProps) {
  // State for tracking current question and answers
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showExample, setShowExample] = useState(false);
  const { shouldShowDemoButtons } = useTestUser();
  
  // Get current question
  const question = roundingOutQuestions[currentQuestion];
  const currentAnswer = answers[question.id] || '';
  
  // Move to next question
  const nextQuestion = () => {
    if (currentQuestion < roundingOutQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setShowExample(false);
    } else {
      // All questions answered - add auto-scroll to continue button
      setTimeout(() => {
        const continueButton = document.querySelector('[data-continue-button="true"]');
        if (continueButton) {
          continueButton.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
        }
      }, 1000); // Delay to ensure DOM updates
      
      if (onComplete) {
        onComplete();
      }
    }
  };
  
  // Move to previous question
  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
      setShowExample(false);
    }
  };
  
  // Update answer for current question
  const handleAnswerChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAnswers(prev => ({
      ...prev,
      [question.id]: e.target.value
    }));
  };
  
  // Toggle example visibility
  const toggleExample = () => {
    setShowExample(prev => !prev);
  };

  // Function to populate with meaningful demo data
  const fillWithDemoData = () => {
    if (!shouldShowDemoButtons) {
      console.warn('Demo functionality only available to test users');
      return;
    }
    
    const demoAnswers = {
      1: "When I have too many interruptions throughout the day or when I'm constantly switching between different types of tasks. Also when I'm working on something that doesn't align with my natural strengths - I notice stress building up and my focus becoming scattered.",
      2: "I need to nurture my planning strength by creating more structured approaches to complex projects. This means taking time upfront to think through dependencies and potential obstacles, rather than jumping straight into execution mode.",
      3: "I'll use my planning strength to break down uncertain situations into smaller, manageable pieces with clear next steps. When things feel stuck, I can create momentum by identifying the smallest possible action that moves us forward and builds from there."
    };
    
    setAnswers(demoAnswers);
    // Jump to the last question
    setCurrentQuestion(roundingOutQuestions.length - 1);
  };
  
  // Example answers for each question
  const getExampleAnswer = (questionId: number) => {
    switch (questionId) {
      case 1:
        return "When I'm coding a new feature or deep in problem-solving, I often lose track of time. Also when I'm designing or creating presentations that communicate complex ideas visually.";
      case 2:
        return "Constant meeting interruptions make it hard to get into a flow state. Unclear expectations about deliverables also make it difficult to focus deeply.";
      case 3:
        return "I find it easier to get into flow when I have a clear goal, a quiet environment, and my notifications turned off. Having the right level of challenge is important - not too easy, not too difficult.";
      case 4:
        return "I could block out specific 'deep work' time slots (at least 90 minutes) on my calendar each day where I don't accept meetings and turn off all notifications.";
      default:
        return "";
    }
  };
  
  // Calculate progress percentage
  const progressPercentage = ((currentQuestion + 1) / roundingOutQuestions.length) * 100;
  
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium text-gray-500">
              Question {currentQuestion + 1} of {roundingOutQuestions.length}
            </span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={toggleExample}
              className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50"
            >
              {showExample ? "Hide Example" : "Show Example"}
            </Button>
          </div>
          
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-600 rounded-full"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
        
        <h3 className="text-lg font-semibold mb-2">{question.text}</h3>
        
        {question.hint && (
          <p className="text-sm text-gray-600 mb-3">{question.hint}</p>
        )}
        
        {showExample && (
          <div className="mb-4 p-3 bg-indigo-50 border border-indigo-100 rounded-md">
            <p className="text-sm text-indigo-900">
              <span className="font-medium">Example: </span>
              {getExampleAnswer(question.id)}
            </p>
          </div>
        )}
        
        <Textarea
          value={currentAnswer}
          onChange={handleAnswerChange}
          placeholder="Your answer here..."
          className="min-h-[120px] mb-4 border border-gray-300"
        />
        
        <div className="flex justify-center">
          <div className="flex items-center gap-3">
            {currentQuestion > 0 && (
              <Button
                variant="outline"
                onClick={prevQuestion}
              >
                Previous
              </Button>
            )}
            {shouldShowDemoButtons && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={fillWithDemoData}
                className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
              >
                <FileText className="w-3 h-3 mr-1" />
                Use Demo Data
              </Button>
            )}
            <Button
              onClick={nextQuestion}
              className="bg-green-600 hover:bg-green-700"
              disabled={currentAnswer.trim().length === 0}
              data-continue-button={currentQuestion === roundingOutQuestions.length - 1 ? "true" : undefined}
            >
              {currentQuestion === roundingOutQuestions.length - 1 ? "Finish" : "Next"}
            </Button>
          </div>
        </div>
      </Card>
      
      {/* No summary at the end - just proceed to next section */}
    </div>
  );
}