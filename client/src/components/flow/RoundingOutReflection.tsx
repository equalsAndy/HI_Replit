import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';

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
    text: "What activities or tasks consistently put you in a flow state?",
    hint: "Consider both work and personal activities where you lose track of time and feel completely engaged."
  },
  {
    id: 2,
    text: "What are the biggest barriers to experiencing flow in your work?",
    hint: "These might include distractions, unclear goals, or skill mismatches."
  },
  {
    id: 3,
    text: "What conditions help you get into flow more easily?",
    hint: "Think about your environment, mindset, or preparation that facilitates flow."
  },
  {
    id: 4,
    text: "What one change could you make to experience more flow in your work?",
    hint: "Consider a specific, actionable change you could implement within the next week."
  }
];

export default function RoundingOutReflection({ onComplete }: RoundingOutProps) {
  // State for tracking current question and answers
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showExample, setShowExample] = useState(false);
  
  // Get current question
  const question = roundingOutQuestions[currentQuestion];
  const currentAnswer = answers[question.id] || '';
  
  // Move to next question
  const nextQuestion = () => {
    if (currentQuestion < roundingOutQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setShowExample(false);
    } else {
      // All questions answered
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
        
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={prevQuestion}
            disabled={currentQuestion === 0}
          >
            Previous
          </Button>
          
          <Button
            onClick={nextQuestion}
            className="bg-indigo-700 hover:bg-indigo-800 ml-2"
            disabled={currentAnswer.trim().length === 0}
          >
            {currentQuestion === roundingOutQuestions.length - 1 ? "Finish" : "Next"}
          </Button>
        </div>
      </Card>
      
      {/* Show summary of all answers when finished */}
      {currentQuestion === roundingOutQuestions.length - 1 && Object.keys(answers).length === roundingOutQuestions.length && (
        <Card className="p-6 mt-6">
          <h3 className="text-lg font-semibold mb-4">Your Flow Reflection Summary</h3>
          
          <div className="space-y-4">
            {roundingOutQuestions.map(q => (
              <div key={q.id}>
                <p className="font-medium">{q.text}</p>
                <p className="text-gray-700 whitespace-pre-wrap">{answers[q.id]}</p>
              </div>
            ))}
          </div>
          
          <div className="mt-6 flex justify-end">
            <Button
              onClick={() => onComplete && onComplete()}
              className="bg-indigo-700 hover:bg-indigo-800"
            >
              Continue to Add Flow to Star Card
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}