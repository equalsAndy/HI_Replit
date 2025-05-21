import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { AssessmentPieChart } from './AssessmentPieChart';

interface QuestionOption {
  id: string;
  text: string;
  quadrant: string;
}

interface Question {
  id: number;
  text: string;
  options: QuestionOption[];
}

interface AssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: (data: any) => void;
}

export function AssessmentModal({ isOpen, onClose, onComplete }: AssessmentModalProps) {
  const { toast } = useToast();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{[key: number]: { [key: string]: number }}>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [results, setResults] = useState<any>(null);
  
  // Fetch questions when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchQuestions();
    }
  }, [isOpen]);
  
  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setCurrentQuestionIndex(0);
      setAnswers({});
      setResults(null);
    }
  }, [isOpen]);
  
  // Fetch assessment questions
  const fetchQuestions = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/assessment/questions');
      const data = await response.json();
      setQuestions(data);
    } catch (error) {
      toast({
        title: "Error fetching questions",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle selecting an option
  const handleSelectOption = (questionId: number, optionId: string, rank: number) => {
    setAnswers(prev => {
      const questionAnswers = prev[questionId] || {};
      return {
        ...prev,
        [questionId]: {
          ...questionAnswers,
          [optionId]: rank
        }
      };
    });
  };
  
  // Check if all options for current question are ranked
  const isCurrentQuestionComplete = () => {
    if (!questions[currentQuestionIndex]) return false;
    
    const questionId = questions[currentQuestionIndex].id;
    const optionCount = questions[currentQuestionIndex].options.length;
    const answeredCount = Object.keys(answers[questionId] || {}).length;
    
    return answeredCount === optionCount;
  };
  
  // Navigate to next question
  const goToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // If this is the last question, show results
      submitAssessment();
    }
  };
  
  // Navigate to previous question
  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };
  
  // Cancel assessment
  const cancelAssessment = () => {
    if (Object.keys(answers).length > 0) {
      // Show confirmation if there are answers
      if (window.confirm("Are you sure you want to cancel? All your answers will be lost.")) {
        onClose();
      }
    } else {
      onClose();
    }
  };
  
  // Submit assessment answers
  const submitAssessment = async () => {
    setIsSubmitting(true);
    
    try {
      // Format answers for the API
      const formattedAnswers = Object.entries(answers).map(([questionId, rankings]) => ({
        questionId: parseInt(questionId),
        rankings
      }));
      
      // Start assessment
      await apiRequest('POST', '/api/assessment/start', {});
      
      // Submit each answer
      for (const answer of formattedAnswers) {
        await apiRequest('POST', '/api/assessment/answer', answer);
      }
      
      // Complete assessment and get results
      const response = await apiRequest('POST', '/api/assessment/complete', {});
      const result = await response.json();
      
      // Set results
      setResults(result);
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['/api/starcard'] });
      
      // Notify completion
      toast({
        title: "Assessment Completed",
        description: "Your strengths profile has been created.",
      });
      
      // Call onComplete callback if provided
      if (onComplete) {
        onComplete(result);
      }
    } catch (error) {
      toast({
        title: "Error submitting assessment",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Render option selection UI
  const renderOptionSelection = () => {
    if (isLoading || !questions.length) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      );
    }
    
    const currentQuestion = questions[currentQuestionIndex];
    const questionAnswers = answers[currentQuestion.id] || {};
    
    // Calculate which ranks are already assigned
    const assignedRanks = Object.values(questionAnswers);
    
    // Get available ranks (those not yet assigned)
    const availableRanks = [1, 2, 3, 4].filter(rank => !assignedRanks.includes(rank));
    
    return (
      <div>
        <h3 className="text-lg font-medium mb-4">Question {currentQuestionIndex + 1} of {questions.length}</h3>
        <p className="mb-6">{currentQuestion.text}</p>
        
        <div className="space-y-4">
          {currentQuestion.options.map((option) => {
            const selectedRank = questionAnswers[option.id];
            
            return (
              <Card key={option.id} className="p-4 relative">
                <div className="flex items-center justify-between">
                  <p>{option.text}</p>
                  
                  <div className="flex items-center space-x-2">
                    {selectedRank ? (
                      <div className="flex items-center">
                        <span className="mr-2 font-medium">Rank: {selectedRank}</span>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => {
                            // Remove this rank
                            const newAnswers = { ...questionAnswers };
                            delete newAnswers[option.id];
                            setAnswers({ ...answers, [currentQuestion.id]: newAnswers });
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        {availableRanks.map(rank => (
                          <Button 
                            key={rank}
                            size="sm"
                            variant="outline"
                            onClick={() => handleSelectOption(currentQuestion.id, option.id, rank)}
                          >
                            {rank}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
        
        <div className="mt-8 flex justify-between">
          <Button 
            variant="outline" 
            onClick={goToPreviousQuestion}
            disabled={currentQuestionIndex === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-2" /> Previous
          </Button>
          
          <Button 
            onClick={goToNextQuestion}
            disabled={!isCurrentQuestionComplete()}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            {currentQuestionIndex < questions.length - 1 ? (
              <>Next <ChevronRight className="h-4 w-4 ml-2" /></>
            ) : (
              'Complete Assessment'
            )}
          </Button>
        </div>
      </div>
    );
  };
  
  // Render results
  const renderResults = () => {
    if (!results) return null;
    
    const { thinking, acting, feeling, planning } = results;
    
    return (
      <div className="space-y-6">
        <h3 className="text-xl font-bold">Your Strengths Assessment Results</h3>
        
        <div className="mb-6">
          <AssessmentPieChart
            thinking={thinking || 0}
            acting={acting || 0}
            feeling={feeling || 0}
            planning={planning || 0}
          />
          
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-[rgb(1,162,82)] mr-2"></div>
              <span>Thinking: {thinking}%</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-[rgb(241,64,64)] mr-2"></div>
              <span>Acting: {acting}%</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-[rgb(22,126,253)] mr-2"></div>
              <span>Feeling: {feeling}%</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-[rgb(255,203,47)] mr-2"></div>
              <span>Planning: {planning}%</span>
            </div>
          </div>
        </div>
        
        <p className="text-gray-600">
          Your strengths profile has been saved. You can now continue with your learning journey.
        </p>
        
        <Button 
          onClick={onClose}
          className="w-full bg-indigo-600 hover:bg-indigo-700"
        >
          Continue
        </Button>
      </div>
    );
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && cancelAssessment()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>AllStarTeams Strengths Assessment</DialogTitle>
            <Button variant="ghost" size="sm" onClick={cancelAssessment}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="py-4">
          {results ? renderResults() : renderOptionSelection()}
        </div>
        
        {!results && (
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={cancelAssessment}
            >
              Cancel Assessment
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}