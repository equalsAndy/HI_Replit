
import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';

export function useLearningState() {
  const [location, navigate] = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [currentContent, setCurrentContent] = useState<string>("welcome");
  const [isAssessmentModalOpen, setIsAssessmentModalOpen] = useState(false);

  // Fetch user profile data
  const { data: user } = useQuery<{
    id: number;
    name: string;
    username: string;
    title?: string;
    organization?: string;
  }>({ queryKey: ['/api/auth/me'] });

  // Fetch star card data  
  const { data: starCard } = useQuery<{
    id?: number;
    userId: number;
    thinking: number;
    acting: number;
    feeling: number;
    planning: number;
    state?: string;
    createdAt?: string;
    imageUrl?: string | null;
  }>({
    queryKey: ['/api/starcard'],
    enabled: !!user,
    staleTime: Infinity,
  });

  // Mark a step as completed
  const markStepCompleted = (stepId: string) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps([...completedSteps, stepId]);
    }
  };

  return {
    user,
    starCard,
    drawerOpen,
    setDrawerOpen,
    currentContent,
    setCurrentContent,
    completedSteps,
    markStepCompleted,
    isAssessmentModalOpen,
    setIsAssessmentModalOpen,
    navigate
  };
}
