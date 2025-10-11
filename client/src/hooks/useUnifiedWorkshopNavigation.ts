import { useState, useEffect } from 'react';

// Event system for syncing multiple hook instances
const NAVIGATION_EVENT = 'navigation-state-update';

interface NavigationUpdateEvent extends CustomEvent {
  detail: {
    workshop: string;
    updates: Partial<NavigationState>;
    source: string;
  };
}

// ============================================================================
// SIMPLIFIED UNIFIED NAVIGATION SYSTEM FOR AST & IA WORKSHOPS
// LOGIC-ONLY CHANGES - MAINTAINS EXACT CURRENT AST LOOK & FEEL
// ============================================================================

export interface NavigationState {
  currentStep: string;           // Which step user is viewing
  completedSteps: string[];      // Array of completed step IDs  
  nextStep: string;              // Next uncompleted step that gets the dot
  progressOrder: string[];       // Hidden: step sequence
  visibleSteps: string[];        // Filtered visible steps
  stepConfig: { [stepId: string]: { hidden?: boolean; reason?: string } };
}

export interface StepVisualState {
  showRoundedHighlight: boolean;  // Only one at a time (purple background)
  showGreenCheckmark: boolean;    // Completed steps
  showLightBlueShading: boolean;  // Current step when it's next unfinished
  showDarkDot: boolean;          // Next unfinished when viewing it
  showPulsatingDot: boolean;     // Next unfinished when not viewing it but went back
  isLocked: boolean;             // Not yet accessible
}

// Workshop configurations
const WORKSHOP_CONFIGS = {
  ast: {
    // ONLY MODULES 1-3 are progressive steps
    progressiveSteps: ['1-1', '1-2', '1-3', '2-1', '2-2', '2-3', '2-4', '3-1', '3-2', '3-3', '3-4'],
    // Modules 4-5 unlock all at once after 3-4 completion
    unlockAllSteps: ['4-1', '4-2', '4-3', '4-4', '5-1', '5-2', '5-3'],
    // FIXED: All completed steps get checkmarks in AST (not just activities)
    activitySteps: [], // No special activity-only checkmarks
    startStep: '1-1',
    workshopCompletionStep: '3-4' // After this, all of modules 4-5 unlock
  },
  ia: {
    progressiveSteps: ['ia-1-1', 'ia-1-2', 'ia-2-1', 'ia-2-2', 'ia-3-1', 'ia-3-2', 'ia-3-3', 'ia-3-4', 'ia-3-5', 'ia-3-6', 'ia-4-1', 'ia-4-2', 'ia-4-3', 'ia-4-4', 'ia-4-5', 'ia-4-6'],
    unlockAllSteps: ['ia-5-1', 'ia-5-2', 'ia-5-3', 'ia-5-4', 'ia-5-5', 'ia-6-1', 'ia-6-2', 'ia-7-1', 'ia-7-2'],
    activitySteps: ['ia-2-2', 'ia-5-1'], // I4C assessment, completion activities
    startStep: 'ia-1-1',
    workshopCompletionStep: 'ia-4-6'
  }
};

export function useUnifiedWorkshopNavigation(workshop: 'ast' | 'ia' = 'ast') {
  const config = WORKSHOP_CONFIGS[workshop];
  const allSteps = [...config.progressiveSteps, ...config.unlockAllSteps];
  
  // Initialize with proper nextStep calculation
  const initialState: NavigationState = {
    currentStep: config.startStep,
    completedSteps: [],
    nextStep: config.startStep, // Initial next step is the start step
    progressOrder: allSteps,
    visibleSteps: allSteps,
    stepConfig: {}
  };
  
  const [navigationState, setNavigationState] = useState<NavigationState>(initialState);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const instanceId = `${workshop}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // console.log(`📌 Navigation initialized for ${workshop}:`, navigationState);

  // ============================================================================
  // CORE STATE CALCULATIONS - AST SPECIFIC LOGIC
  // ============================================================================

  const getVisibleSteps = (): string[] => {
    return navigationState.progressOrder.filter(stepId => !navigationState.stepConfig[stepId]?.hidden);
  };

  const getAccessibleSteps = (): string[] => {
    const visible = getVisibleSteps();
    const completed = navigationState.completedSteps;

    // Check if workshop is completed (reached completion step)
    const workshopCompleted = completed.includes(config.workshopCompletionStep);

    if (workshopCompleted) {
      // After workshop completion, ALL visible steps are accessible
      return visible;
    }

    // During workshop: progressive steps follow sequence, others locked
    const accessible: string[] = [];

    // ALWAYS make completed steps accessible for navigation (can view but not edit)
    for (const stepId of visible) {
      if (completed.includes(stepId)) {
        accessible.push(stepId);
      }
    }

    // Progressive steps (Modules 1-3 for AST): follow linear sequence
    for (let i = 0; i < config.progressiveSteps.length; i++) {
      const stepId = config.progressiveSteps[i];
      if (!visible.includes(stepId)) continue;
      if (accessible.includes(stepId)) continue; // Already added as completed

      // First step always accessible
      if (i === 0) {
        accessible.push(stepId);
        continue;
      }

      // Other steps accessible if previous step completed
      const previousStep = config.progressiveSteps[i - 1];
      const isPreviousCompleted = completed.includes(previousStep);

      if (isPreviousCompleted) {
        accessible.push(stepId);
      }
    }

    return accessible;
  };

  const getNextUnfinishedStep = (): string => {
    const accessible = getAccessibleSteps();
    return accessible.find(stepId => !navigationState.completedSteps.includes(stepId)) || accessible[accessible.length - 1];
  };

  // ============================================================================
  // VISUAL STATE CALCULATION - FIXES LOGIC WHILE MAINTAINING EXACT AST LOOK
  // ============================================================================

  const getStepVisualState = (stepId: string, overrideCurrentStep?: string): StepVisualState => {
    const effectiveCurrentStep = overrideCurrentStep || navigationState.currentStep;
    const isCurrentStep = stepId === effectiveCurrentStep;
    const isCompleted = navigationState.completedSteps.includes(stepId);
    const isVisible = getVisibleSteps().includes(stepId);
    const isAccessible = getAccessibleSteps().includes(stepId);
    const nextStep = navigationState.nextStep; // Use calculated nextStep from state
    const isNextStep = stepId === nextStep;
    
    // FIXED: Check if user navigated back to any completed step (not necessarily the next step)
    const userViewingCompletedStep = navigationState.completedSteps.includes(navigationState.currentStep);
    const isNavigatingBack = userViewingCompletedStep && navigationState.currentStep !== nextStep;

    // Not visible = locked
    if (!isVisible) {
      return {
        showRoundedHighlight: false,
        showGreenCheckmark: false,
        showLightBlueShading: false,
        showDarkDot: false,
        showPulsatingDot: false,
        isLocked: true
      };
    }

    // Not accessible = locked (but visible in menu)
    if (!isAccessible) {
      return {
        showRoundedHighlight: false,
        showGreenCheckmark: false,
        showLightBlueShading: false,
        showDarkDot: false,
        showPulsatingDot: false,
        isLocked: true
      };
    }

    const visualState = {
      // FIXED: Blue highlight - Shows ONLY on currentStep (only one at a time)
      showRoundedHighlight: isCurrentStep,
      
      // Green checkmark: Shows for completed steps (all completed in AST, not just activities)
      showGreenCheckmark: isCompleted,
      
      // Light blue shading: ONLY when current step is also the next unfinished step
      showLightBlueShading: isCurrentStep && isNextStep,
      
      // FIXED: Blue dot - Shows ONLY on nextStep when currently viewing it (only one at a time)
      showDarkDot: isCurrentStep && isNextStep,
      
      // FIXED: Pulsating dot - Shows ONLY on nextStep when user went back to any completed step
      showPulsatingDot: !isCurrentStep && isNextStep && isNavigatingBack,
      
      // Locked: Not accessible yet
      isLocked: false // Already filtered out above
    };
    
    return visualState;
  };

  // ============================================================================
  // STATE UPDATE FUNCTIONS
  // ============================================================================

  const updateState = (updates: Partial<NavigationState>, source = 'local') => {
    setNavigationState(prev => {
      const newState = { ...prev, ...updates };
      
      // Debug logging for currentStep changes
      if (updates.currentStep && updates.currentStep !== prev.currentStep) {
        console.log(`📝 State Update: currentStep changed from '${prev.currentStep}' to '${updates.currentStep}' (source: ${source})`);
        console.log(`📝 Full update payload:`, updates);
        console.log(`📝 Previous state:`, { currentStep: prev.currentStep, completedSteps: prev.completedSteps });
      }
      
      // Recalculate derived values
      newState.visibleSteps = newState.progressOrder.filter(stepId => !newState.stepConfig[stepId]?.hidden);
      
      // FIXED: Recalculate nextStep based on new state
      const accessible = getAccessibleStepsForState(newState);
      const previousNextStep = newState.nextStep;
      newState.nextStep = accessible.find(stepId => !newState.completedSteps.includes(stepId)) || accessible[accessible.length - 1];
      
      // Debug logging for nextStep changes
      if (newState.nextStep !== previousNextStep) {
        console.log(`🎯 Next step calculated: '${newState.nextStep}' (was: '${previousNextStep}')`);
      }
      
      // Broadcast state change to other hook instances (but not if this update came from an event)
      if (source === 'local') {
        const event = new CustomEvent(NAVIGATION_EVENT, {
          detail: {
            workshop,
            updates,
            source: instanceId
          }
        }) as NavigationUpdateEvent;
        
        window.dispatchEvent(event);
      }
      
      return newState;
    });
  };

  // Helper function to get accessible steps for a given state (used in updateState)
  const getAccessibleStepsForState = (state: NavigationState): string[] => {
    const visible = state.progressOrder.filter(stepId => !state.stepConfig[stepId]?.hidden);
    const completed = state.completedSteps;

    // Check if workshop is completed (reached completion step)
    const workshopCompleted = completed.includes(config.workshopCompletionStep);

    if (workshopCompleted) {
      // After workshop completion, ALL visible steps are accessible
      return visible;
    }

    // During workshop: progressive steps follow sequence, others locked
    const accessible: string[] = [];

    // ALWAYS make completed steps accessible for navigation (can view but not edit)
    for (const stepId of visible) {
      if (completed.includes(stepId)) {
        accessible.push(stepId);
      }
    }

    // Progressive steps (Modules 1-3 for AST): follow linear sequence
    for (let i = 0; i < config.progressiveSteps.length; i++) {
      const stepId = config.progressiveSteps[i];
      if (!visible.includes(stepId)) continue;
      if (accessible.includes(stepId)) continue; // Already added as completed

      // First step always accessible
      if (i === 0) {
        accessible.push(stepId);
        continue;
      }

      // Other steps accessible if previous step completed
      const previousStep = config.progressiveSteps[i - 1];
      const isPreviousCompleted = completed.includes(previousStep);

      if (isPreviousCompleted) {
        accessible.push(stepId);
      }
    }

    return accessible;
  };

  const navigateToStep = (stepId: string) => {
    const accessibleSteps = getAccessibleSteps();
    if (!accessibleSteps.includes(stepId)) {
      console.warn(`Step ${stepId} is not accessible`);
      return;
    }

    console.log(`🧭 Navigating to step: ${stepId}`);
    updateState({ currentStep: stepId });

    // Auto-save navigation progress when user navigates to different step
    console.log(`💾 Auto-saving navigation progress for step navigation to ${stepId}...`);
    saveToDatabase().catch(error => {
      console.error('❌ CRITICAL: Failed to save navigation step to database:', error);
      // Consider showing a user notification here
    });
  };

  const completeStep = async (stepId: string, options: { autoAdvance?: boolean } = { autoAdvance: true }) => {
    if (navigationState.completedSteps.includes(stepId)) {
      return; // Already completed
    }

    console.log(`✅ Marking step ${stepId} as completed (autoAdvance: ${options.autoAdvance})`);
    const newCompletedSteps = [...navigationState.completedSteps, stepId];

    let nextStepId = navigationState.currentStep; // Default to keeping current step

    if (options.autoAdvance) {
      // Auto-advance currentStep when completing steps
      const progressiveSteps = config.progressiveSteps;
      const currentIndex = progressiveSteps.indexOf(stepId);

      if (currentIndex >= 0 && currentIndex < progressiveSteps.length - 1) {
        nextStepId = progressiveSteps[currentIndex + 1];
        console.log(`🎯 Auto-advancing currentStep from '${stepId}' to '${nextStepId}'`);
      } else {
        console.log(`🎯 Step '${stepId}' completed but keeping currentStep as '${stepId}' (no next step in sequence)`);
        nextStepId = stepId;
      }
    } else {
      console.log(`🎯 Step '${stepId}' completed but NOT auto-advancing currentStep (staying on '${navigationState.currentStep}')`);
    }

    console.log(`📋 Adding ${stepId} to completed steps: [${newCompletedSteps.join(', ')}]`);

    // Update completedSteps and optionally currentStep
    updateState({
      completedSteps: newCompletedSteps,
      currentStep: nextStepId
    });

    // CRITICAL FIX: Save immediately with the correct values instead of using stale closure
    const savePromise = setTimeout(async () => {
      console.log(`💾 Auto-saving navigation progress after completing step ${stepId}...`);
      
      // Use the calculated values directly instead of stale navigationState
      const currentSaveData = {
        currentStepId: nextStepId, // Use calculated next step
        completedSteps: newCompletedSteps, // Use calculated completed steps
        appType: workshop,
        stepConfig: navigationState.stepConfig
      };
      
      console.log(`📊 State being saved: currentStep=${currentSaveData.currentStepId}, completed=[${currentSaveData.completedSteps.join(', ')}]`);

      try {
        const response = await fetch('/api/workshop-data/navigation-progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(currentSaveData)
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`❌ Save failed with status ${response.status}:`, errorText);
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        } else {
          const responseData = await response.json();
          console.log(`✅ Navigation state saved successfully:`, responseData);
          console.log(`📊 Saved state: currentStep=${currentSaveData.currentStepId}, completed=[${currentSaveData.completedSteps.join(', ')}]`);
        }
        console.log(`✅ Step completion successfully saved to database`);
      } catch (error) {
        console.error('❌ CRITICAL: Failed to save step completion to database:', error);
        console.error('📋 Failed state data:', currentSaveData);
      }
    }, 100);
  };

  const hideStep = (stepId: string, reason: string = 'configuration') => {
    const newStepConfig = {
      ...navigationState.stepConfig,
      [stepId]: { hidden: true, reason }
    };
    updateState({ stepConfig: newStepConfig });
  };

  const showStep = (stepId: string) => {
    const newStepConfig = { ...navigationState.stepConfig };
    delete newStepConfig[stepId];
    updateState({ stepConfig: newStepConfig });
  };

  // ============================================================================
  // NAVIGATION ACTIONS
  // ============================================================================

  const goToNextStep = async () => {
    // FIXED: Calculate accessibility AFTER marking current step as completed
    const newCompletedSteps = [...navigationState.completedSteps, navigationState.currentStep];
    const tempState = { ...navigationState, completedSteps: newCompletedSteps };
    const accessibleSteps = getAccessibleStepsForState(tempState);
    const currentIndex = accessibleSteps.indexOf(navigationState.currentStep);

    if (currentIndex < accessibleSteps.length - 1) {
      const nextStepId = accessibleSteps[currentIndex + 1];

      // FIXED: Update both completion and current step in one update
      updateState({
        completedSteps: newCompletedSteps,
        currentStep: nextStepId
      });

      // Add a small delay to ensure React state updates have been applied
      await new Promise(resolve => setTimeout(resolve, 50));

      return nextStepId;
    }
    return null;
  };

  const goToPreviousStep = () => {
    const accessibleSteps = getAccessibleSteps();
    const currentIndex = accessibleSteps.indexOf(navigationState.currentStep);
    if (currentIndex > 0) {
      const previousStepId = accessibleSteps[currentIndex - 1];
      navigateToStep(previousStepId);
      return previousStepId;
    }
    return null;
  };

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const isStepCompleted = (stepId: string): boolean => {
    return navigationState.completedSteps.includes(stepId);
  };

  const isStepCurrent = (stepId: string): boolean => {
    return navigationState.currentStep === stepId;
  };

  const isStepAccessible = (stepId: string): boolean => {
    const accessible = getAccessibleSteps();
    return accessible.includes(stepId);
  };

  const getStepIndex = (stepId: string): number => {
    return getAccessibleSteps().indexOf(stepId);
  };

  const getProgressPercentage = (): number => {
    const accessibleSteps = getAccessibleSteps();
    if (accessibleSteps.length === 0) return 0;
    return Math.round((navigationState.completedSteps.length / accessibleSteps.length) * 100);
  };

  const isWorkshopCompleted = (): boolean => {
    return navigationState.completedSteps.includes(config.workshopCompletionStep);
  };

  // ============================================================================
  // COMPATIBILITY FUNCTIONS (match existing AST navigation interface)
  // ============================================================================

  const isStepAccessibleByProgression = (stepId: string): boolean => {
    return isStepAccessible(stepId);
  };

  const getSectionProgressData = (sectionStepIds: string[]) => {
    const completedCount = sectionStepIds.filter(stepId => navigationState.completedSteps.includes(stepId)).length;
    return {
      completed: completedCount,
      total: sectionStepIds.length,
      percentage: Math.round((completedCount / sectionStepIds.length) * 100),
      display: `${completedCount}/${sectionStepIds.length}`,
      isComplete: completedCount === sectionStepIds.length
    };
  };

  // Video progress tracking (compatibility functions)
  const updateVideoProgress = (stepId: string, progress: number) => {
    // Implementation depends on video progress tracking requirements
  };

  const getVideoProgress = (stepId: string): number => {
    // Return 0 for now, implement as needed
    return 0;
  };

  const canProceedToNext = (): boolean => {
    const accessibleSteps = getAccessibleSteps();
    const currentIndex = accessibleSteps.indexOf(navigationState.currentStep);
    return currentIndex < accessibleSteps.length - 1;
  };

  // ============================================================================
  // PERSISTENCE - MODIFIED FOR MANUAL CONTROL
  // ============================================================================

  const saveToDatabase = async () => {
    try {
      console.log(`🔄 Attempting to save navigation state...`);
      console.log(`📤 Payload:`, {
        currentStepId: navigationState.currentStep,
        completedSteps: navigationState.completedSteps,
        appType: workshop,
        stepConfig: navigationState.stepConfig
      });

      const response = await fetch('/api/workshop-data/navigation-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          currentStepId: navigationState.currentStep,
          completedSteps: navigationState.completedSteps,
          appType: workshop,
          stepConfig: navigationState.stepConfig
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Save failed with status ${response.status}:`, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      } else {
        const responseData = await response.json();
        console.log(`✅ Navigation state saved successfully:`, responseData);
        console.log(`📊 Saved state: currentStep=${navigationState.currentStep}, completed=[${navigationState.completedSteps.join(', ')}]`);
      }
    } catch (error) {
      console.error('❌ Critical error saving navigation state:', error);
      console.error('📋 Failed state data:', {
        currentStepId: navigationState.currentStep,
        completedSteps: navigationState.completedSteps,
        appType: workshop
      });
      throw error; // Re-throw to ensure calling code knows about the failure
    }
  };

  // Manual save function - only call this when you want to persist to database
  const saveProgress = async () => {
    await saveToDatabase();
  };

  const loadFromDatabase = async () => {
    try {
      console.log(`🔄 Loading ${workshop} navigation state from database...`);
      setIsLoading(true);
      const response = await fetch(`/api/workshop-data/navigation-progress/${workshop}`, {
        credentials: 'include'
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`📥 Database response for ${workshop}:`, result);
        
        if (result.success && result.data) {
          const dbData = result.data;
          console.log(`📊 Loading navigation state: currentStepId='${dbData.currentStepId}', completedSteps=[${(dbData.completedSteps || []).join(', ')}]`);
          
          // CRITICAL FIX: Ensure currentStep is properly mapped from currentStepId
          const currentStepToLoad = dbData.currentStepId || config.startStep;
          console.log(`🎯 Setting currentStep to: '${currentStepToLoad}'`);
          
          // CRITICAL FIX: Force React state update by using a callback to ensure synchronous update
          setNavigationState(prevState => {
            const newState = {
              ...prevState,
              currentStep: currentStepToLoad,
              completedSteps: dbData.completedSteps || [],
              stepConfig: dbData.stepConfig || {},
              visibleSteps: prevState.progressOrder.filter(stepId => !(dbData.stepConfig || {})[stepId]?.hidden),
            };
            
            // Recalculate nextStep
            const accessible = getAccessibleStepsForState(newState);
            newState.nextStep = accessible.find(stepId => !newState.completedSteps.includes(stepId)) || accessible[accessible.length - 1];
            
            console.log(`✅ DIRECT setState: Navigation state loaded for ${workshop}`, {
              currentStep: newState.currentStep,
              completedSteps: newState.completedSteps,
              nextStep: newState.nextStep
            });
            
            return newState;
          });
          
          console.log(`✅ Navigation state loaded successfully for ${workshop}`);
        } else {
          console.log(`ℹ️ No navigation data found in database for ${workshop}, using defaults`);
        }
      } else {
        console.error(`❌ Failed to load navigation state for ${workshop}: HTTP ${response.status}`);
      }
    } catch (error) {
      console.error(`❌ Error loading navigation state for ${workshop}:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load state on mount - MODIFIED to always load initial state from database
  useEffect(() => {
    // Always load from database on initial mount to get current progress
    // This ensures auto-navigation works correctly when user returns
    loadFromDatabase();
  }, [workshop]);
  
  // Manual refresh function for debugging
  const forceRefreshFromDatabase = async () => {
    console.log(`🔄 FORCE REFRESH: Manually reloading ${workshop} navigation state...`);
    await loadFromDatabase();
  };

  // DISABLED: Auto-save on state changes to prevent overriding manual navigation
  // This was saving currentStep changes back to database, making manual navigation impossible
  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     saveToDatabase();
  //   }, 1000);
    
  //   return () => clearTimeout(timer);
  // }, [navigationState.currentStep, navigationState.completedSteps, navigationState.stepConfig]);

  // Listen for navigation updates from other hook instances
  useEffect(() => {
    const handleNavigationUpdate = (event: NavigationUpdateEvent) => {
      // Only respond to updates for the same workshop and from different instances
      if (event.detail.workshop === workshop && event.detail.source !== instanceId) {
        updateState(event.detail.updates, 'event');
      }
    };

    window.addEventListener(NAVIGATION_EVENT, handleNavigationUpdate as EventListener);
    
    return () => {
      window.removeEventListener(NAVIGATION_EVENT, handleNavigationUpdate as EventListener);
    };
  }, [workshop, instanceId]);

  // ============================================================================
  // PUBLIC API - MAINTAINS COMPATIBILITY WITH EXISTING AST CODE
  // ============================================================================

  return {
    // Current state
    currentStep: navigationState.currentStep,
    currentStepId: navigationState.currentStep, // Alias for compatibility
    completedSteps: navigationState.completedSteps,
    nextStep: navigationState.nextStep,
    visibleSteps: navigationState.visibleSteps,
    progressPercentage: getProgressPercentage(),
    isLoading, // Add loading state to prevent premature auto-navigation

    // Visual state
    getStepVisualState,

    // Navigation actions
    navigateToStep,
    completeStep,
    goToNextStep,
    goToPreviousStep,

    // Step management
    hideStep,
    showStep,

    // Utilities
    isStepCompleted,
    isStepCurrent,
    isStepAccessible,
    isStepAccessibleByProgression, // Compatibility alias
    getStepIndex,
    getSectionProgressData, // Compatibility function
    isWorkshopCompleted,

    // Additional compatibility functions
    updateVideoProgress,
    canProceedToNext,
    getVideoProgress,
    markStepCompleted: (stepId: string, options?: { autoAdvance?: boolean }) => completeStep(stepId, options), // Alias for compatibility

    // Manual persistence control
    saveProgress, // Call this to manually save to database
    forceRefreshFromDatabase, // Force reload from database for debugging

    // Legacy compatibility object
    progress: {
      currentStepId: navigationState.currentStep,
      completedSteps: navigationState.completedSteps,
      sectionExpansion: { '1': true, '2': true, '3': true, '4': isWorkshopCompleted(), '5': isWorkshopCompleted() }
    },

    // Raw state (for debugging)
    _navigationState: navigationState,
    
    // Global debugging functions
    _debugCurrentState: () => {
      console.log(`🔍 DEBUG ${workshop} Navigation State:`, {
        currentStep: navigationState.currentStep,
        completedSteps: navigationState.completedSteps,
        nextStep: navigationState.nextStep,
        visibleSteps: navigationState.visibleSteps,
        isLoading
      });
    },
    _debugVisualState: (stepId: string) => {
      const visualState = getStepVisualState(stepId);
      console.log(`🎨 DEBUG Visual State for ${stepId}:`, visualState);
      return visualState;
    }
  };
}
