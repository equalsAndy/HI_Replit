import { useState, useEffect } from 'react';
import { queryClient } from '@/lib/queryClient';

interface NavigationProgress {
  completedSteps: string[];
  currentStepId: string;
  appType: 'ast' | 'ia' | null;
  lastVisitedAt: string;
}

export function useNavigationProgress() {
  const [progress, setProgress] = useState<NavigationProgress>({
    completedSteps: [],
    currentStepId: '',
    appType: null,
    lastVisitedAt: new Date().toISOString()
  });

  // Load progress from local storage on mount
  useEffect(() => {
    const savedProgress = localStorage.getItem('navigationProgress');
    if (savedProgress) {
      try {
        const parsed = JSON.parse(savedProgress);
        setProgress(parsed);
      } catch (error) {
        console.error('Error parsing saved navigation progress:', error);
      }
    }
  }, []);

  // Save progress to local storage whenever it changes
  useEffect(() => {
    localStorage.setItem('navigationProgress', JSON.stringify(progress));
  }, [progress]);

  // Sync with database
  const syncWithDatabase = async () => {
    try {
      const response = await fetch('/api/user/navigation-progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(progress),
      });

      if (response.ok) {
        console.log('Navigation progress synced with database');
      } else {
        console.error('Failed to sync navigation progress with database');
      }
    } catch (error) {
      console.error('Error syncing navigation progress:', error);
    }
  };

  // Load progress from database when user logs in
  const loadFromDatabase = async () => {
    try {
      const response = await fetch('/api/user/navigation-progress', {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.navigationProgress) {
          const dbProgress = JSON.parse(result.navigationProgress);
          
          // Merge database progress with local storage (database takes precedence)
          const mergedProgress = {
            ...progress,
            ...dbProgress,
            completedSteps: dbProgress.completedSteps || progress.completedSteps,
            lastVisitedAt: new Date().toISOString()
          };
          
          setProgress(mergedProgress);
          console.log('Navigation progress loaded from database:', mergedProgress);
        }
      }
    } catch (error) {
      console.error('Error loading navigation progress from database:', error);
    }
  };

  // Mark a step as completed
  const markStepCompleted = (stepId: string) => {
    setProgress(prev => ({
      ...prev,
      completedSteps: prev.completedSteps.includes(stepId) 
        ? prev.completedSteps 
        : [...prev.completedSteps, stepId],
      currentStepId: stepId,
      lastVisitedAt: new Date().toISOString()
    }));
  };

  // Update current step
  const updateCurrentStep = (stepId: string, appType: 'ast' | 'ia' | null = null) => {
    setProgress(prev => ({
      ...prev,
      currentStepId: stepId,
      appType: appType || prev.appType,
      lastVisitedAt: new Date().toISOString()
    }));
  };

  // Reset progress
  const resetProgress = () => {
    const resetData = {
      completedSteps: [],
      currentStepId: '',
      appType: null,
      lastVisitedAt: new Date().toISOString()
    };
    setProgress(resetData);
    localStorage.removeItem('navigationProgress');
  };

  return {
    progress,
    markStepCompleted,
    updateCurrentStep,
    resetProgress,
    syncWithDatabase,
    loadFromDatabase
  };
}