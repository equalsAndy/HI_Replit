import { useState, useEffect, useCallback } from 'react';

// Define the navigation structure types
export interface NavigationStep {
  id: string;
  title: string;
  path: string;
  status?: StepStatus;
  requiredSteps?: string[];
}

export interface NavigationSection {
  id: string;
  title: string;
  steps: NavigationStep[];
}

// Define the step status types
export type StepStatus = 'locked' | 'available' | 'current' | 'completed';

// Define the progress type stored in localStorage
export interface StepProgress {
  completedSteps: string[];
  currentStepId?: string;
  expandedSections: string[];
  lastVisited?: {
    stepId: string;
    timestamp: number;
  };
}

// Define the navigation sections with proper structure and step dependencies
// These would follow the structure from the provided Excel spreadsheet
export const NAVIGATION_SECTIONS: NavigationSection[] = [
  {
    id: 'intro',
    title: '1. Introduction',
    steps: [
      {
        id: 'intro-welcome',
        title: 'Welcome',
        path: '/intro/welcome',
      },
      {
        id: 'intro-video',
        title: 'Workshop Video',
        path: '/intro/video',
        requiredSteps: ['intro-welcome']
      }
    ]
  },
  {
    id: 'strengths',
    title: '2. Discover Your Strengths',
    steps: [
      {
        id: 'strengths-intro',
        title: 'Introduction',
        path: '/discover-strengths/intro',
        requiredSteps: ['intro-video']
      },
      {
        id: 'strengths-assessment',
        title: 'Core Strengths Assessment',
        path: '/discover-strengths/assessment',
        requiredSteps: ['strengths-intro']
      },
      {
        id: 'strengths-review',
        title: 'Review Your Star Profile',
        path: '/discover-strengths/review',
        requiredSteps: ['strengths-assessment']
      }
    ]
  },
  {
    id: 'flow',
    title: '3. Find Your Flow',
    steps: [
      {
        id: 'flow-intro',
        title: 'Understanding Flow States',
        path: '/flow/intro',
        requiredSteps: ['strengths-review']
      },
      {
        id: 'flow-assessment',
        title: 'Flow Assessment',
        path: '/flow/assessment',
        requiredSteps: ['flow-intro']
      },
      {
        id: 'flow-reflect',
        title: 'Reflect on Your Results',
        path: '/flow/reflect',
        requiredSteps: ['flow-assessment']
      }
    ]
  },
  {
    id: 'potential',
    title: '4. Visualize Your Potential',
    steps: [
      {
        id: 'potential-intro',
        title: 'Understanding Potential',
        path: '/potential/intro',
        requiredSteps: ['flow-reflect']
      },
      {
        id: 'potential-future-self',
        title: 'Your Future Self',
        path: '/potential/future-self',
        requiredSteps: ['potential-intro']
      },
      {
        id: 'potential-recap',
        title: 'Recap Your Insights',
        path: '/potential/recap',
        requiredSteps: ['potential-future-self']
      }
    ]
  }
];

// The localStorage key for storing progress
const PROGRESS_STORAGE_KEY = 'allStarTeams:navigationProgress';

export function useNavigationProgress() {
  // Initialize state with default values
  const [progress, setProgress] = useState<StepProgress>({
    completedSteps: [],
    expandedSections: [],
  });
  
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Load progress from localStorage on mount
  useEffect(() => {
    try {
      const savedProgress = localStorage.getItem(PROGRESS_STORAGE_KEY);
      if (savedProgress) {
        setProgress(JSON.parse(savedProgress));
      }
      setIsInitialized(true);
    } catch (error) {
      console.error('Error loading navigation progress:', error);
      setIsInitialized(true);
    }
  }, []);
  
  // Save progress to localStorage whenever it changes
  useEffect(() => {
    if (isInitialized) {
      try {
        localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
      } catch (error) {
        console.error('Error saving navigation progress:', error);
      }
    }
  }, [progress, isInitialized]);
  
  // Mark a step as completed
  const markStepCompleted = useCallback((stepId: string) => {
    setProgress(prev => {
      // Only add the step if it's not already in completedSteps
      if (!prev.completedSteps.includes(stepId)) {
        return {
          ...prev,
          completedSteps: [...prev.completedSteps, stepId],
          lastVisited: {
            stepId,
            timestamp: Date.now()
          }
        };
      }
      return prev;
    });
  }, []);
  
  // Reset all progress
  const resetProgress = useCallback(() => {
    setProgress({
      completedSteps: [],
      expandedSections: []
    });
  }, []);
  
  // Get the status of a specific step
  const getStepStatus = useCallback((stepId: string): StepStatus => {
    if (progress.completedSteps.includes(stepId)) {
      return 'completed';
    }
    
    if (progress.currentStepId === stepId) {
      return 'current';
    }
    
    // Check if all required steps are completed
    const allSteps = getAllStepsFlat();
    const step = allSteps.find(s => s.id === stepId);
    
    if (step?.requiredSteps) {
      const allRequiredStepsCompleted = step.requiredSteps.every(
        requiredId => progress.completedSteps.includes(requiredId)
      );
      
      return allRequiredStepsCompleted ? 'available' : 'locked';
    }
    
    // If this is the first step or has no dependencies, it's available
    return 'available';
  }, [progress.completedSteps, progress.currentStepId]);
  
  // Check if a step can be accessed
  const canAccessStep = useCallback((stepId: string): boolean => {
    const status = getStepStatus(stepId);
    return status === 'completed' || status === 'current' || status === 'available';
  }, [getStepStatus]);
  
  // Helper to get all steps as a flat array with status
  const getAllSteps = useCallback(() => {
    return NAVIGATION_SECTIONS.flatMap(section => 
      section.steps.map(step => ({
        ...step,
        status: getStepStatus(step.id)
      }))
    );
  }, [getStepStatus]);
  
  // Helper function to get all steps as a flat array without status
  const getAllStepsFlat = useCallback(() => {
    return NAVIGATION_SECTIONS.flatMap(section => section.steps);
  }, []);
  
  // Get all navigation sections
  const getNavigationSections = useCallback(() => {
    return NAVIGATION_SECTIONS;
  }, []);
  
  return {
    progress,
    markStepCompleted,
    resetProgress,
    getStepStatus,
    canAccessStep,
    getAllSteps,
    getNavigationSections,
    isInitialized
  };
}