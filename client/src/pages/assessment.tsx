import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormControl } from "@/components/ui/form";
import AssessmentQuestion from "@/components/assessment/AssessmentQuestion";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { RankedOption } from "@shared/schema";
import { useForm } from "react-hook-form";
import { Link } from "wouter";

export default function Assessment() {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const [startAssessment, setStartAssessment] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Map<number, RankedOption[]>>(new Map());
  
  const form = useForm({
    defaultValues: {
      email: "",
    },
  });
  
  // Get user profile to ensure they're logged in
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['/api/user/profile'],
    staleTime: Infinity,
  });
  
  // Start the assessment if needed
  const { data: assessment, isLoading: assessmentLoading } = useQuery({
    queryKey: ['/api/assessment/start'],
    enabled: !!user && startAssessment,
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
      navigate('/report');
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
  
  // Handle begin assessment
  const onSubmit = (data: { email: string }) => {
    // In a real app, this would validate the email or code
    setStartAssessment(true);
  };
  
  // If in assessment mode, show the assessment UI
  if (startAssessment) {
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
  
  // Otherwise, show the assessment introduction page
  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-5xl font-bold text-gray-800 mb-8">Your Star Self-Assessment</h1>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div>
            <div className="aspect-video mb-4">
              <iframe 
                className="w-full h-full"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ" 
                title="Star Assessment Introduction" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen>
              </iframe>
            </div>
            <div className="text-left bg-gray-100 p-4 rounded-md">
              <h3 className="font-bold mb-2">DESIGN RATIONALE</h3>
              <p className="mb-2"><strong>Ancient Philosophy</strong> – The star symbolizes integration, wholeness, and wellbeing.</p>
              <p className="mb-2"><strong>Psychology</strong> – The star symbolizes excellence and achievement universally.</p>
              <p className="mb-2"><strong>Neuroscience</strong> – Explains Star strengths color symbolism.</p>
              <p className="mb-2"><strong>Common Sense</strong> – Five is easy to remember. Reduces cognitive overload.</p>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-left">
              <h3 className="text-xl font-bold text-red-600 mb-4">CLICK HERE TO ACCESS YOUR STAR SELF-ASSESSMENT</h3>
              <p className="mb-4 font-bold">ENTER YOUR PERSONAL CODE PROVIDED</p>
              <p className="mb-6">WHAT YOU WILL SEE</p>
              
              <p className="mb-6">Welcome to All Star Teams</p>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input 
                            placeholder="Enter your primary email to get started" 
                            {...field} 
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-between">
                    <Button type="button" variant="outline">Cancel</Button>
                    <Button type="submit">Submit</Button>
                  </div>
                </form>
              </Form>
              
              <div className="mt-8">
                <ol className="list-decimal pl-5 space-y-1">
                  <li>KEEP SEPARATE TAB OPEN</li>
                  <li>COMPLETE YOUR SCENARIO QUESTIONS - APPROX. 25 MINUTES</li>
                  <li>DOWNLOAD YOUR STAR REPORT - REVIEW NEXT EXERCISE 2B</li>
                  <li>DOWNLOAD YOUR STAR CARD - USE LATER FOR EXERCISE 3D</li>
                  <li>RETURN HERE</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8">
          <Link href="/">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded">
              NEXT
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
