import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

// Define types for our navigation progress
export interface NavigationStep {
  id: string;
  label: string;
  path: string;
  estimatedTime?: number; // in minutes
  completed?: boolean;
  required?: boolean;
}

export interface NavigationSection {
  id: string;
  title: string;
  description?: string;
  steps: NavigationStep[];
  completed?: boolean;
  expanded?: boolean;
}

export interface NavigationProgress {
  currentStepId?: string;
  lastVisitedAt?: number;
  completedSteps: string[];
  expandedSections: string[];
  sections: NavigationSection[];
}

// Local storage key
const NAVIGATION_PROGRESS_KEY = 'app_navigation_progress';

// Default time values in milliseconds
const ONE_DAY = 24 * 60 * 60 * 1000;

export function useNavigationProgress() {
  const { toast } = useToast();
  const [localProgress, setLocalProgress] = useState<NavigationProgress | null>(null);
  
  // Get user progress from the server
  const { data: userData, isLoading: isUserDataLoading } = useQuery({
    queryKey: ['/api/user/profile'],
    staleTime: Infinity,
  });
  
  // Initialize from localStorage on first load
  useEffect(() => {
    const savedProgress = localStorage.getItem(NAVIGATION_PROGRESS_KEY);
    if (savedProgress) {
      try {
        const parsed = JSON.parse(savedProgress);
        setLocalProgress(parsed);
      } catch (error) {
        console.error('Error parsing navigation progress from localStorage:', error);
        // If parsing fails, we'll initialize with default values
      }
    }
  }, []);
  
  // Update progress on the server
  const updateServerProgress = useMutation({
    mutationFn: async (progress: number) => {
      const res = await apiRequest('PUT', '/api/user/progress', { progress });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/profile'] });
    },
    onError: (error) => {
      toast({
        title: "Failed to update progress on server",
        description: String(error),
        variant: "destructive",
      });
    }
  });
  
  // Save progress to localStorage
  const saveProgressToLocalStorage = (progress: NavigationProgress) => {
    try {
      localStorage.setItem(NAVIGATION_PROGRESS_KEY, JSON.stringify(progress));
      setLocalProgress(progress);
    } catch (error) {
      console.error('Error saving navigation progress to localStorage:', error);
      toast({
        title: "Failed to save progress locally",
        description: "Your progress may not be saved between sessions.",
        variant: "destructive",
      });
    }
  };
  
  // Calculate overall progress percentage
  const calculateOverallProgress = (): number => {
    if (!localProgress?.sections) return 0;
    
    const allSteps = localProgress.sections.flatMap(section => section.steps);
    const totalRequiredSteps = allSteps.filter(step => step.required !== false).length;
    const completedRequiredSteps = localProgress.completedSteps.filter(stepId => 
      allSteps.find(step => step.id === stepId && step.required !== false)
    ).length;
    
    return totalRequiredSteps > 0 
      ? Math.round((completedRequiredSteps / totalRequiredSteps) * 100)
      : 0;
  };
  
  // Mark a step as completed
  const markStepCompleted = (stepId: string) => {
    if (!localProgress) return;
    
    // Skip if already completed
    if (localProgress.completedSteps.includes(stepId)) return;
    
    const newProgress = {
      ...localProgress,
      completedSteps: [...localProgress.completedSteps, stepId],
      currentStepId: stepId,
      lastVisitedAt: Date.now()
    };
    
    saveProgressToLocalStorage(newProgress);
    
    // Update server progress
    const progressPercentage = calculateOverallProgress();
    updateServerProgress.mutate(progressPercentage);
  };
  
  // Set current step
  const setCurrentStep = (stepId: string) => {
    if (!localProgress) return;
    
    const newProgress = {
      ...localProgress,
      currentStepId: stepId,
      lastVisitedAt: Date.now()
    };
    
    saveProgressToLocalStorage(newProgress);
  };
  
  // Check if a step is accessible (can only access if previous steps are complete or it's already visited)
  const isStepAccessible = (stepId: string): boolean => {
    if (!localProgress) return false;
    
    // If the step is already completed, it's accessible
    if (localProgress.completedSteps.includes(stepId)) return true;
    
    // Get all steps in sequential order
    const allSteps = localProgress.sections.flatMap(section => section.steps);
    const allStepIds = allSteps.map(step => step.id);
    
    // Find the index of the current step
    const stepIndex = allStepIds.indexOf(stepId);
    if (stepIndex === -1) return false; // Step not found
    
    // If it's the first step, it's always accessible
    if (stepIndex === 0) return true;
    
    // Check if all previous steps are completed
    for (let i = 0; i < stepIndex; i++) {
      if (!localProgress.completedSteps.includes(allStepIds[i])) {
        return false; // Found an incomplete previous step
      }
    }
    
    return true; // All previous steps are completed
  };
  
  // Toggle section expansion
  const toggleSectionExpanded = (sectionId: string) => {
    if (!localProgress) return;
    
    const isCurrentlyExpanded = localProgress.expandedSections.includes(sectionId);
    const newExpandedSections = isCurrentlyExpanded
      ? localProgress.expandedSections.filter(id => id !== sectionId)
      : [...localProgress.expandedSections, sectionId];
    
    const newProgress = {
      ...localProgress,
      expandedSections: newExpandedSections
    };
    
    saveProgressToLocalStorage(newProgress);
  };
  
  // Initialize or update navigation sections
  const updateNavigationSections = (sections: NavigationSection[]) => {
    // If we have existing progress, merge with new sections
    if (localProgress) {
      // Keep track of completed steps and expanded sections
      const newProgress = {
        ...localProgress,
        sections: sections.map(section => ({
          ...section,
          expanded: localProgress.expandedSections.includes(section.id),
          steps: section.steps.map(step => ({
            ...step,
            completed: localProgress.completedSteps.includes(step.id)
          }))
        }))
      };
      
      saveProgressToLocalStorage(newProgress);
    } else {
      // Initialize with default values
      const defaultProgress: NavigationProgress = {
        completedSteps: [],
        expandedSections: [sections[0]?.id].filter(Boolean), // Expand first section by default
        sections: sections,
        lastVisitedAt: Date.now()
      };
      
      saveProgressToLocalStorage(defaultProgress);
    }
  };
  
  // Get last position for quick resume
  const getLastPosition = () => {
    if (!localProgress) return null;
    
    const { currentStepId, lastVisitedAt } = localProgress;
    
    // If last visit was more than a day ago, show quick resume
    const shouldShowQuickResume = lastVisitedAt && 
      (Date.now() - lastVisitedAt > ONE_DAY);
    
    if (currentStepId && shouldShowQuickResume) {
      const allSteps = localProgress.sections.flatMap(section => section.steps);
      const currentStep = allSteps.find(step => step.id === currentStepId);
      
      if (currentStep) {
        return {
          stepId: currentStepId,
          path: currentStep.path,
          label: currentStep.label,
          lastVisitedAt
        };
      }
    }
    
    return null;
  };
  
  return {
    progress: localProgress,
    isLoading: isUserDataLoading || localProgress === null,
    currentStepId: localProgress?.currentStepId,
    completedSteps: localProgress?.completedSteps || [],
    expandedSections: localProgress?.expandedSections || [],
    markStepCompleted,
    setCurrentStep,
    toggleSectionExpanded,
    updateNavigationSections,
    getLastPosition,
    calculateOverallProgress,
    isStepAccessible
  };
}