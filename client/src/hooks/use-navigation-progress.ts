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
  appType?: string; // 'ast' or 'imaginal-agility'
}

// Local storage keys for caching
const NAVIGATION_PROGRESS_KEY = 'app_navigation_progress';
const LAST_SYNC_KEY = 'navigation_last_sync';

// Default time values in milliseconds
const ONE_DAY = 24 * 60 * 60 * 1000;

export function useNavigationProgress() {
  const { toast } = useToast();
  const [localProgress, setLocalProgress] = useState<NavigationProgress | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Get user progress from the server
  const { data: userData, isLoading: isUserDataLoading } = useQuery({
    queryKey: ['/api/user/profile'],
    staleTime: 60000, // 1 minute cache
    refetchOnWindowFocus: false,
  });

  // Get current app type
  const currentApp = sessionStorage.getItem('selectedApp') || 'ast';
  
  // Load progress from database on user change or app change
  useEffect(() => {
    if (!userData?.user?.id || isInitialized) return;
    
    const loadProgressFromDatabase = async () => {
      try {
        // First try localStorage for immediate response
        const cachedProgress = localStorage.getItem(`${NAVIGATION_PROGRESS_KEY}_${currentApp}_${userData.user.id}`);
        const lastSync = localStorage.getItem(`${LAST_SYNC_KEY}_${currentApp}_${userData.user.id}`);
        
        if (cachedProgress && lastSync) {
          const cacheAge = Date.now() - parseInt(lastSync);
          if (cacheAge < 300000) { // Use cache if less than 5 minutes old
            const parsed = JSON.parse(cachedProgress);
            setLocalProgress(parsed);
            setIsInitialized(true);
            return;
          }
        }
        
        // Load from database
        const response = await apiRequest('GET', '/api/user/navigation-progress');
        const result = await response.json();
        
        if (result.success && result.progress) {
          const dbProgress = JSON.parse(result.progress);
          // Only use database progress if it matches current app
          if (dbProgress.appType === currentApp) {
            setLocalProgress(dbProgress);
            // Cache in localStorage
            localStorage.setItem(`${NAVIGATION_PROGRESS_KEY}_${currentApp}_${userData.user.id}`, result.progress);
            localStorage.setItem(`${LAST_SYNC_KEY}_${currentApp}_${userData.user.id}`, Date.now().toString());
          }
        }
        
        setIsInitialized(true);
      } catch (error) {
        console.error('Error loading navigation progress from database:', error);
        // Fall back to localStorage
        const cachedProgress = localStorage.getItem(`${NAVIGATION_PROGRESS_KEY}_${currentApp}_${userData.user.id}`);
        if (cachedProgress) {
          try {
            const parsed = JSON.parse(cachedProgress);
            setLocalProgress(parsed);
          } catch (parseError) {
            console.error('Error parsing cached progress:', parseError);
          }
        }
        setIsInitialized(true);
      }
    };
    
    loadProgressFromDatabase();
  }, [userData?.user?.id, currentApp, isInitialized]);
  
  // Update navigation progress on the server
  const updateServerProgress = useMutation({
    mutationFn: async (navigationProgress: NavigationProgress) => {
      const res = await apiRequest('PUT', '/api/user/navigation-progress', { 
        navigationProgress: JSON.stringify(navigationProgress)
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/profile'] });
    },
    onError: (error) => {
      console.error('Failed to sync progress to database:', error);
      // Don't show toast for sync errors to avoid being annoying
    }
  });
  
  // Save progress to localStorage and database
  const saveProgress = (progress: NavigationProgress) => {
    try {
      // Add app type and user ID to progress
      const progressWithMeta = {
        ...progress,
        appType: currentApp,
        lastVisitedAt: Date.now()
      };
      
      setLocalProgress(progressWithMeta);
      
      // Save to localStorage immediately for responsiveness
      if (userData?.user?.id) {
        const cacheKey = `${NAVIGATION_PROGRESS_KEY}_${currentApp}_${userData.user.id}`;
        const syncKey = `${LAST_SYNC_KEY}_${currentApp}_${userData.user.id}`;
        localStorage.setItem(cacheKey, JSON.stringify(progressWithMeta));
        localStorage.setItem(syncKey, Date.now().toString());
        
        // Sync to database (async, non-blocking)
        updateServerProgress.mutate(progressWithMeta);
      }
    } catch (error) {
      console.error('Error saving navigation progress:', error);
      toast({
        title: "Failed to save progress",
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
    };
    
    saveProgress(newProgress);
  };
  
  // Set current step
  const setCurrentStep = (stepId: string) => {
    if (!localProgress) return;
    
    const newProgress = {
      ...localProgress,
      currentStepId: stepId,
    };
    
    saveProgress(newProgress);
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
    
    saveProgress(newProgress);
  };
  
  // Initialize or update navigation sections
  const updateNavigationSections = (sections: NavigationSection[]) => {
    // If we have existing progress, merge with new sections
    if (localProgress && isInitialized) {
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
      
      saveProgress(newProgress);
    } else if (isInitialized) {
      // Initialize with default values
      const defaultProgress: NavigationProgress = {
        completedSteps: [],
        expandedSections: [sections[0]?.id].filter(Boolean), // Expand first section by default
        sections: sections,
        appType: currentApp
      };
      
      saveProgress(defaultProgress);
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
    isLoading: isUserDataLoading || !isInitialized,
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