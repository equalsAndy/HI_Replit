import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { AssessmentQuestion, RankedOption } from '@shared/schema';

export function useAssessment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<number, RankedOption[]>>(new Map());

  // Get all questions
  const { data: questions, isLoading: questionsLoading } = useQuery({
    queryKey: ['/api/assessment/questions'],
    staleTime: Infinity
  });

  // Start assessment
  const startAssessment = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/assessment/start', {});
      return res.json();
    },
    onSuccess: () => {
      setCurrentQuestionIndex(0);
      setAnswers(new Map());
    },
    onError: (error) => {
      toast({
        title: "Failed to start assessment",
        description: String(error),
        variant: "destructive",
      });
    }
  });

  // Save answer
  const saveAnswer = useMutation({
    mutationFn: async ({ questionId, rankings }: { questionId: number, rankings: RankedOption[] }) => {
      const res = await apiRequest('POST', '/api/assessment/answer', { questionId, ranking: rankings });
      return res.json();
    },
    onSuccess: (_, variables) => {
      // Add answer to local state
      setAnswers(prev => {
        const updated = new Map(prev);
        updated.set(variables.questionId, variables.rankings);
        return updated;
      });

      // Move to next question if possible
      if (questions && currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      }
    },
    onError: (error) => {
      toast({
        title: "Failed to save answer",
        description: String(error),
        variant: "destructive",
      });
    }
  });

  // Complete assessment
  const completeAssessment = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/assessment/complete', {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/profile'] });
      queryClient.invalidateQueries({ queryKey: ['/api/starcard'] });
      
      toast({
        title: "Assessment completed!",
        description: "Your Star Card has been generated.",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to complete assessment",
        description: String(error),
        variant: "destructive",
      });
    }
  });

  // Handle submitting an answer
  const submitAnswer = (rankings: RankedOption[]) => {
    if (!questions) return;
    
    const currentQuestion = questions[currentQuestionIndex];
    saveAnswer.mutate({ questionId: currentQuestion.id, rankings });
  };

  // Handle completing the assessment
  const finishAssessment = () => {
    if (!questions) return;
    
    // Check if all questions are answered
    const isComplete = questions.every(question => answers.has(question.id));
    
    if (isComplete) {
      completeAssessment.mutate();
      return true;
    } else {
      toast({
        title: "Assessment incomplete",
        description: "Please answer all questions before completing.",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    currentQuestionIndex,
    currentQuestion: questions?.[currentQuestionIndex],
    totalQuestions: questions?.length || 0,
    isLoading: questionsLoading || startAssessment.isPending,
    isSaving: saveAnswer.isPending,
    isCompleting: completeAssessment.isPending,
    answers,
    startAssessment: startAssessment.mutate,
    submitAnswer,
    finishAssessment,
    setCurrentQuestionIndex
  };
}
