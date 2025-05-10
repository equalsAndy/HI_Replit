import { useState } from "react";
import MainContainer from "@/components/layout/MainContainer";
import { useApplication } from "@/hooks/use-application";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Link, useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Type definitions for the assessment
type FiveC = 'imagination' | 'curiosity' | 'empathy' | 'creativity' | 'courage';

type Question = {
  id: FiveC;
  title: string;
  statement: string;
  prompt: string;
};

type Rating = {
  [key in FiveC]: number;
};

type Reflection = {
  [key in FiveC]: string;
};

const questions: Question[] = [
  {
    id: 'imagination',
    title: 'Imagination',
    statement: 'I naturally think beyond what is currently possible.',
    prompt: 'Describe a time when you envisioned something beyond current reality:'
  },
  {
    id: 'curiosity',
    title: 'Curiosity',
    statement: 'I ask questions that challenge conventional thinking.',
    prompt: 'Describe an instance when your curiosity led to new insight:'
  },
  {
    id: 'empathy',
    title: 'Empathy',
    statement: 'I can easily understand perspectives that differ from my own.',
    prompt: 'Share a moment where empathy shifted your approach:'
  },
  {
    id: 'creativity',
    title: 'Creativity',
    statement: 'I regularly generate new ideas or solutions that others consider valuable.',
    prompt: 'Describe a creative solution you contributed recently:'
  },
  {
    id: 'courage',
    title: 'Courage',
    statement: 'I take bold action even when the outcome is uncertain.',
    prompt: 'Recall a moment when you acted with courage despite risk:'
  }
];

export default function FiveCsAssessment() {
  const { appName } = useApplication();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [ratings, setRatings] = useState<Rating>({
    imagination: 0,
    curiosity: 0,
    empathy: 0,
    creativity: 0,
    courage: 0
  });
  const [reflections, setReflections] = useState<Reflection>({
    imagination: '',
    curiosity: '',
    empathy: '',
    creativity: '',
    courage: ''
  });
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  const question = questions[currentQuestion];
  
  const handleRatingChange = (value: string) => {
    setRatings({
      ...ratings,
      [question.id]: parseInt(value)
    });
  };
  
  const handleReflectionChange = (value: string) => {
    setReflections({
      ...reflections,
      [question.id]: value
    });
  };
  
  const nextQuestion = () => {
    if (ratings[question.id] === 0) {
      toast({
        title: "Please select a rating",
        description: "You need to rate yourself before moving to the next question.",
        variant: "destructive"
      });
      return;
    }
    
    if (reflections[question.id].trim() === '') {
      toast({
        title: "Please provide a reflection",
        description: "Your reflection helps provide context for your rating.",
        variant: "destructive"
      });
      return;
    }
    
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };
  
  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };
  
  // Mutation to submit assessment results
  const submitMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/5cs-assessment/submit', {
        ratings,
        reflections
      });
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Assessment Submitted",
        description: "Your 5Cs assessment has been saved successfully."
      });
      // Navigate to results page
      navigate('/insights-dashboard');
    },
    onError: (error) => {
      toast({
        title: "Submission Failed",
        description: String(error),
        variant: "destructive"
      });
    }
  });
  
  const handleSubmit = () => {
    // Validate the current question first
    if (ratings[question.id] === 0) {
      toast({
        title: "Please select a rating",
        description: "You need to rate yourself before submitting.",
        variant: "destructive"
      });
      return;
    }
    
    if (reflections[question.id].trim() === '') {
      toast({
        title: "Please provide a reflection",
        description: "Your reflection helps provide context for your rating.",
        variant: "destructive"
      });
      return;
    }
    
    // Check if all questions are answered
    const allAnswered = Object.values(ratings).every(rating => rating > 0) &&
                         Object.values(reflections).every(reflection => reflection.trim() !== '');
    
    if (!allAnswered) {
      toast({
        title: "Incomplete Assessment",
        description: "Please answer all questions before submitting.",
        variant: "destructive"
      });
      return;
    }
    
    // Submit the assessment
    submitMutation.mutate();
  };
  
  const totalQuestions = questions.length;
  const progress = ((currentQuestion + 1) / totalQuestions) * 100;
  
  return (
    <MainContainer stepId="B" showStepNavigation={true}>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">5Cs Self-Assessment</h1>
        <p className="text-lg mb-6">
          This brief assessment helps reflect on your five Enduring Capabilities
          essential for thriving professionally in an AI-enhanced world.
        </p>
        
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
          <div 
            className="bg-purple-600 h-2.5 rounded-full" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <span className="text-purple-600 font-bold mr-2">{currentQuestion + 1}.</span> {question.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-3">Rate yourself on the following statement:</h3>
              <p className="text-gray-700 italic mb-4">"{question.statement}"</p>
              
              <RadioGroup 
                className="grid grid-cols-5 gap-2" 
                value={ratings[question.id].toString()}
                onValueChange={handleRatingChange}
              >
                {[1, 2, 3, 4, 5].map((value) => (
                  <div key={value} className="flex flex-col items-center">
                    <RadioGroupItem 
                      value={value.toString()} 
                      id={`rating-${value}`} 
                      className="peer sr-only" 
                    />
                    <Label 
                      htmlFor={`rating-${value}`}
                      className="flex flex-col items-center justify-center w-full p-2 text-gray-500 border border-gray-200 cursor-pointer peer-checked:bg-purple-100 peer-checked:text-purple-600 peer-checked:border-purple-600 rounded-md"
                    >
                      <span className="text-xl font-bold">{value}</span>
                      <span className="text-xs">
                        {value === 1 && "Not at all"}
                        {value === 2 && "Rarely"}
                        {value === 3 && "Sometimes"}
                        {value === 4 && "Often"}
                        {value === 5 && "Very much"}
                      </span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            
            <div>
              <h3 className="font-semibold mb-3">Reflection Question:</h3>
              <p className="text-gray-700 mb-2">{question.prompt}</p>
              <Textarea 
                placeholder="Type your reflection here..."
                className="min-h-[120px]"
                value={reflections[question.id]}
                onChange={(e) => handleReflectionChange(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={prevQuestion}
              disabled={currentQuestion === 0}
            >
              Previous
            </Button>
            
            {currentQuestion < totalQuestions - 1 ? (
              <Button onClick={nextQuestion}>
                Next
              </Button>
            ) : (
              <Button 
                onClick={handleSubmit}
                disabled={submitMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                {submitMutation.isPending ? "Submitting..." : "Complete Assessment"}
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </MainContainer>
  );
}