import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AssessmentQuestion from "@/components/assessment/AssessmentQuestion";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { RankedOption } from "@shared/schema";

export default function Assessment() {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Map<number, RankedOption[]>>(new Map());
  
  // Get user profile to ensure they're logged in
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['/api/user/profile'],
    staleTime: Infinity,
  });
  
  // Start the assessment if needed
  const { data: assessment, isLoading: assessmentLoading } = useQuery({
    queryKey: ['/api/assessment/start'],
    enabled: !!user,
    staleTime: Infinity,
  });
  
  // Get assessment questions
  const { data: questions, isLoading: questionsLoading } = useQuery({
    queryKey: ['/api/assessment/questions'],
    enabled: !!assessment,
    staleTime: Infinity,
  });
  
  // Complete assessment mutation
  const completeAssessment = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/assessment/complete', {});
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Assessment completed!",
        description: "Your Star Card has been generated.",
        variant: "default",
      });
      navigate('/');
    },
    onError: (error) => {
      toast({
        title: "Failed to complete assessment",
        description: String(error),
        variant: "destructive",
      });
    }
  });
  
  // Handle answer submission
  const handleAnswerSubmit = (rankings: RankedOption[]) => {
    if (!questions) return;
    
    const currentQuestion = questions[currentQuestionIndex];
    setUserAnswers(prev => {
      const updated = new Map(prev);
      updated.set(currentQuestion.id, rankings);
      return updated;
    });
    
    // Move to next question or complete if this was the last
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // This was the last question, complete the assessment
      completeAssessment.mutate();
    }
  };
  
  // Handle return to dashboard
  const handleReturnToDashboard = () => {
    navigate('/');
  };
  
  // Show loading state
  if (userLoading || assessmentLoading || questionsLoading) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center p-8">
              <p className="text-lg">Loading assessment...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Ensure we have questions
  if (!questions || questions.length === 0) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center p-8">
              <p className="text-lg text-red-500">No assessment questions found.</p>
              <Button 
                onClick={handleReturnToDashboard}
                className="mt-4"
              >
                Return to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const currentQuestion = questions[currentQuestionIndex];
  
  return (
    <div className="container mx-auto py-10">
      <AssessmentQuestion
        question={currentQuestion}
        questionNumber={currentQuestionIndex + 1}
        totalQuestions={questions.length}
        onComplete={handleAnswerSubmit}
        onReturn={handleReturnToDashboard}
      />
    </div>
  );
}
