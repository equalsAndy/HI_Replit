
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
  }>({ queryKey: ['/api/user/profile'] });

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
import { useState, useEffect } from 'react';
import { PROGRESS_STORAGE_KEY } from '@/components/navigation/navigationData';

export function useLearningState() {
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [currentContent, setCurrentContent] = useState<string>("welcome");
  
  useEffect(() => {
    const savedProgress = localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (savedProgress) {
      try {
        const { completed } = JSON.parse(savedProgress);
        if (Array.isArray(completed)) {
          setCompletedSteps(completed);
        }
      } catch (error) {
        console.error('Error loading navigation progress:', error);
      }
    }
  }, []);

  const markStepCompleted = (stepId: string) => {
    if (!completedSteps.includes(stepId)) {
      const newCompletedSteps = [...completedSteps, stepId];
      setCompletedSteps(newCompletedSteps);
      localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify({ completed: newCompletedSteps }));
    }
  };

  const isStepAccessible = (sectionId: string, stepId: string) => {
    const sectionIndex = parseInt(sectionId) - 1;
    const stepIndex = parseInt(stepId.split('-')[1]) - 1;
    
    if (sectionIndex === 0 && stepIndex === 0) return true;
    
    if (stepIndex === 0 && sectionIndex > 0) {
      const prevSection = navigationSections[sectionIndex - 1];
      return prevSection.steps.every(step => completedSteps.includes(step.id));
    }
    
    const prevStepId = `${sectionId}-${stepIndex}`;
    return completedSteps.includes(prevStepId);
  };

  return {
    completedSteps,
    currentContent,
    setCurrentContent,
    markStepCompleted,
    isStepAccessible
  };
}
