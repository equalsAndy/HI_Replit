import { useState, useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { 
  isStepCompleted, 
  getSectionProgress, 
  getUnlockedSections, 
  getNextStepId,
  isStepAccessible,
  SECTION_STEPS,
  type NavigationProgressData 
} from '@/utils/progressionLogic';
import { detectSuspiciousProgress, clearSuspiciousLocalStorage } from '../utils/progressValidation';

interface NavigationProgress {
  completedSteps: string[];
  currentStepId: string;
  appType: 'ast' | 'ia' | null;
  lastVisitedAt: string;
  unlockedSections: string[];
  videoProgress: { [stepId: string]: number };
}

// Helper function to clear workshop localStorage
const clearWorkshopLocalStorage = () => {
  console.log('🧹 CLEARING workshop localStorage...');
  
  const keysToRemove = [
    'navigationProgress',
    'allstarteams-navigation-progress',
    'imaginal-agility-navigation-progress',
    'allstar_navigation_progress',
    'allstarteams_starCard',
    'allstarteams_flowAttributes',
    'allstarteams_progress',
    'allstarteams_completedActivities',
    'allstarteams_strengths',
    'allstarteams_values',
    'allstarteams_passions',
    'allstarteams_growthAreas',
    'workshop_progress',
    'currentContent',
    'completedSteps',
    'starCardData',
    'user-preferences',
    'workshop-progress',
    'assessment-data'
  ];
  
  keysToRemove.forEach(key => {
    if (localStorage.getItem(key)) {
      console.log('🧹 Removing localStorage key:', key);
      localStorage.removeItem(key);
    }
  });
  
  // Clear any keys containing workshop-related terms
  Object.keys(localStorage).forEach(key => {
    if (key.includes('workshop') || 
        key.includes('ast') || 
        key.includes('assessment') ||
        key.includes('starcard') ||
        key.includes('flow') ||
        key.includes('allstarteams') ||
        key.includes('imaginal-agility')) {
      console.log('🧹 Removing localStorage key:', key);
      localStorage.removeItem(key);
    }
  });
  
  console.log('✅ Workshop localStorage cleared');
};

// Helper function to invalidate React Query caches
const invalidateWorkshopQueries = (queryClient: any) => {
  console.log('🔄 INVALIDATING workshop queries...');
  
  // Invalidate all workshop-related queries
  queryClient.invalidateQueries({ queryKey: ['starcard'] });
  queryClient.invalidateQueries({ queryKey: ['navigation-progress'] });
  queryClient.invalidateQueries({ queryKey: ['user-assessments'] });
  queryClient.invalidateQueries({ queryKey: ['flow-assessment'] });
  queryClient.invalidateQueries({ queryKey: ['flow-attributes'] });
  queryClient.invalidateQueries({ queryKey: ['rounding-out'] });
  queryClient.invalidateQueries({ queryKey: ['future-self'] });
  queryClient.invalidateQueries({ queryKey: ['cantril-ladder'] });
  queryClient.invalidateQueries({ queryKey: ['final-insights'] });
  queryClient.invalidateQueries({ queryKey: ['step-by-step-reflection'] });
  queryClient.invalidateQueries({ queryKey: ['/api/starcard'] });
  queryClient.invalidateQueries({ queryKey: ['/api/flow-attributes'] });
  queryClient.invalidateQueries({ queryKey: ['/api/user'] });
  queryClient.invalidateQueries({ queryKey: ['/api/user/me'] });
  queryClient.invalidateQueries({ queryKey: ['/api/user/assessments'] });
  queryClient.invalidateQueries({ queryKey: ['/api/user/profile'] });
  queryClient.invalidateQueries({ queryKey: ['/api/workshop-data/starcard'] });
  queryClient.invalidateQueries({ queryKey: ['/api/workshop-data/flow-assessment'] });
  queryClient.invalidateQueries({ queryKey: ['/api/workshop-data/flow-attributes'] });
  queryClient.invalidateQueries({ queryKey: ['/api/workshop-data/step-by-step-reflection'] });
  
  // Force remove cached navigation progress queries
  queryClient.removeQueries({ queryKey: ['navigation-progress'] });
  queryClient.removeQueries({ queryKey: ['/api/user/me'] });
  queryClient.removeQueries({ queryKey: ['/api/user/profile'] });
  
  console.log('✅ Workshop queries invalidated');
};

// Query for user assessments to check completion states
const useUserAssessments = () => {
  return useQuery({
    queryKey: ['user-assessments'],
    queryFn: async () => {
      const response = await fetch('/api/workshop-data/userAssessments', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch assessments');
      const result = await response.json();
      return result.currentUser?.assessments || {};
    },
    staleTime: 10000 // Cache for 10 seconds
  });
};

export function useNavigationProgress() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const lastKnownProgressRef = useRef<NavigationProgress | null>(null);
  
  const [progress, setProgress] = useState<NavigationProgress>({
    completedSteps: [],
    currentStepId: '1-1', // Start with first step
    appType: 'ast',
    lastVisitedAt: new Date().toISOString(),
    unlockedSections: ['1'], // Only Introduction is unlocked initially
    videoProgress: {}
  });

  // Get user assessments for completion detection
  const { data: userAssessments = {} } = useUserAssessments();

  // Query for server navigation progress with reset detection
  const { data: serverProgress } = useQuery({
    queryKey: ['navigation-progress'],
    queryFn: async () => {
      const response = await fetch('/api/user/navigation-progress', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch progress');
      const result = await response.json();
      return result.success ? (result.navigationProgress ? JSON.parse(result.navigationProgress) : null) : null;
    },
    refetchInterval: 30000, // Check every 30 seconds for reset
    refetchIntervalInBackground: true
  });

  // Enhanced reset detection - detects when server progress becomes null
  useEffect(() => {
    if (serverProgress !== undefined) {
      const currentProgress = serverProgress;
      const lastKnownProgress = lastKnownProgressRef.current;
      
      // Check if we've transitioned from having progress to null (reset scenario)
      const hasBeenReset = (
        lastKnownProgress !== null && 
        currentProgress === null
      ) || (
        lastKnownProgress && 
        lastKnownProgress.completedSteps && 
        lastKnownProgress.completedSteps.length > 0 && 
        currentProgress === null
      );
      
      // Also check if local storage has progress but server doesn't (another reset indicator)
      const localProgress = localStorage.getItem('navigationProgress');
      const hasLocalProgress = localProgress && JSON.parse(localProgress).completedSteps?.length > 0;
      const hasServerProgress = currentProgress && currentProgress.completedSteps?.length > 0;
      
      if (hasBeenReset || (hasLocalProgress && !hasServerProgress)) {
        console.log('🚨 USER RESET DETECTED - clearing all caches');
        console.log('Reset reason:', hasBeenReset ? 'Server progress became null' : 'Local progress exists but server has none');
        
        // Clear localStorage immediately
        clearWorkshopLocalStorage();
        
        // Invalidate all workshop-related queries
        invalidateWorkshopQueries(queryClient);
        
        // Reset local progress state immediately
        const resetData = {
          completedSteps: [],
          currentStepId: '',
          appType: null,
          lastVisitedAt: new Date().toISOString(),
          unlockedSections: ['1'],
          videoProgress: {}
        };
        setProgress(resetData);
        
        // Force a page reload to ensure all components see the reset
        setTimeout(() => {
          window.location.reload();
        }, 1000);
        
        // Notify user
        toast({
          title: "Workshop Reset",
          description: "Your progress has been reset. The page will refresh to show changes.",
          variant: "default"
        });
      }
      
      lastKnownProgressRef.current = currentProgress;
    }
  }, [serverProgress, toast, queryClient]);

  // Load navigation progress from database on component mount
  useEffect(() => {
    const initializeProgress = async () => {
      console.log('🔄 INITIALIZING navigation progress from database');
      
      try {
        const response = await fetch('/api/user/navigation-progress', {
          method: 'GET',
          credentials: 'include',
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success && result.progress) {
            const dbProgress = JSON.parse(result.progress);
            console.log('✅ Loaded progress from database:', dbProgress);
            
            // Use database progress if it has meaningful data
            if (dbProgress.appType && (dbProgress.completedSteps.length > 0 || dbProgress.currentStepId !== '1-1')) {
              setProgress({
                ...dbProgress,
                lastVisitedAt: new Date().toISOString()
              });
              return;
            }
          }
        }
      } catch (error) {
        console.error('Error loading navigation progress from database:', error);
      }
      
      // Calculate initial state based on existing user data
      const initialProgress = recalculateProgressFromData();
      setProgress(initialProgress);
      console.log('✅ Initial state calculated from user data:', initialProgress);
    };
    
    initializeProgress();
  }, []);

  // Save progress to both local storage and database whenever it changes
  useEffect(() => {
    // Don't sync completely empty state, but allow sync of initial state with appType
    if (progress.completedSteps.length === 0 && progress.currentStepId === '' && !progress.appType) {
      return;
    }
    
    localStorage.setItem('navigationProgress', JSON.stringify(progress));
    
    // Auto-sync with database
    const syncToDatabase = async () => {
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
          console.log('✅ Navigation progress auto-synced with database');
        } else {
          console.error('❌ Failed to sync navigation progress with database');
        }
      } catch (error) {
        console.error('❌ Error syncing navigation progress:', error);
      }
    };
    
    syncToDatabase();
  }, [progress]);

  // Manual sync function for backward compatibility
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

  // Convert assessments to array format for progression logic
  const assessmentsArray = Object.keys(userAssessments).map(assessmentType => ({
    assessmentType,
    results: JSON.stringify(userAssessments[assessmentType])
  }));

  // Check if a step is completed using progression logic
  const checkStepCompletion = (stepId: string): boolean => {
    const completionResult = isStepCompleted(stepId, assessmentsArray, progress);
    return completionResult.isComplete;
  };

  // Calculate progress from user data without overriding existing state
  const recalculateProgressFromData = (): NavigationProgress => {
    const allSteps = [
      '1-1', '2-1', '2-2', '2-3', '2-4', 
      '3-1', '3-2', '3-3', '3-4',
      '4-1', '4-2', '4-3', '4-4', '4-5'
    ];

    let actuallyCompleted: string[] = [];
    
    // Check what steps should be completed based on user assessment data
    console.log('🔍 Checking user assessments:', userAssessments);
    
    if (userAssessments && Object.keys(userAssessments).length > 0) {
      // If user has starCard assessment, they've completed the star assessment flow
      if (userAssessments.starCard) {
        actuallyCompleted.push('1-1', '2-1', '2-2'); // Introduction, video, assessment
        console.log('✅ Star Card assessment found - marking steps 1-1, 2-1, 2-2 complete');
      }
      
      // If user has flowAttributes, they've completed flow assessment
      if (userAssessments.flowAttributes) {
        actuallyCompleted.push('3-1', '3-2'); // Flow intro and assessment
        console.log('✅ Flow Attributes assessment found - marking steps 3-1, 3-2 complete');
      }
    } else {
      // Also check for star card data in global state as fallback
      const starCardData = (window as any).globalStarCardData;
      if (starCardData && (starCardData.thinking > 0 || starCardData.acting > 0 || starCardData.feeling > 0 || starCardData.planning > 0)) {
        actuallyCompleted.push('1-1', '2-1', '2-2');
        console.log('✅ Star Card data found in global state - marking steps 1-1, 2-1, 2-2 complete');
      }
    }
    
    // Get unlocked sections and next step
    const unlockedSections = getUnlockedSections(actuallyCompleted);
    const nextStepId = getNextStepId(actuallyCompleted);

    return {
      completedSteps: actuallyCompleted,
      currentStepId: nextStepId || '1-1',
      appType: 'ast' as const,
      lastVisitedAt: new Date().toISOString(),
      unlockedSections,
      videoProgress: {}
    };
  };

  // Recalculate progress based on current data
  const recalculateProgress = (): NavigationProgress => {
    const allSteps = [
      '1-1', '2-1', '2-2', '2-3', '2-4', 
      '3-1', '3-2', '3-3', '3-4',
      '4-1', '4-2', '4-3', '4-4', '4-5'
    ];

    // Always start with empty for a clean state
    let actuallyCompleted: string[] = [];

    // Start with clean state - no false positives
    actuallyCompleted = [];
    
    // Only mark steps complete based on actual data verification, not pre-existing state
    for (const stepId of allSteps) {
      // Video steps require actual video completion
      if (['1-1', '2-1', '2-3', '3-1', '3-3', '4-1', '4-4'].includes(stepId)) {
        const videoProgress = progress.videoProgress[stepId] || 0;
        
        // Step-specific completion thresholds
        let requiredProgress = 5; // Default 5%
        if (stepId === '1-1') {
          requiredProgress = 5; // 5% for intro
        } else if (['2-1', '2-3', '3-1', '3-3', '4-1', '4-4'].includes(stepId)) {
          requiredProgress = 5; // 5% for main content videos
        }
        
        if (videoProgress >= requiredProgress) {
          actuallyCompleted.push(stepId);
          console.log(`✅ Video step ${stepId} verified complete: ${videoProgress.toFixed(2)}% >= ${requiredProgress}%`);
        } else if (videoProgress > 0) {
          console.log(`⏳ Video step ${stepId} in progress: ${videoProgress.toFixed(2)}% (needs ${requiredProgress}%)`);
        }
        continue;
      }
      
      // Assessment steps require actual assessment data
      if (userAssessments && Object.keys(userAssessments).length > 0) {
        const isComplete = checkStepCompletion(stepId);
        if (isComplete) {
          actuallyCompleted.push(stepId);
          console.log(`✅ Assessment step ${stepId} verified complete`);
        }
      }
    }
    
    // Get unlocked sections based on completed steps
    const unlockedSections = getUnlockedSections(actuallyCompleted);
    
    // Get next step ID
    const nextStepId = getNextStepId(actuallyCompleted);

    return {
      ...progress,
      completedSteps: actuallyCompleted,
      currentStepId: nextStepId || actuallyCompleted[actuallyCompleted.length - 1] || '1-1',
      unlockedSections,
      lastVisitedAt: new Date().toISOString()
    };
  };

  // Validate step completion before marking complete
  const validateStepCompletion = (stepId: string): { isComplete: boolean; reason?: string } => {
    console.log(`🔍 Validating completion for step ${stepId}`);
    
    // Video steps require completion based on step-specific thresholds
    if (['1-1', '2-1', '2-3', '3-1', '3-3', '4-1', '4-4'].includes(stepId)) {
      const videoProgress = progress.videoProgress[stepId] || 0;
      
      // Different completion thresholds for different video steps
      let requiredProgress = 1; // Default 1% for most videos
      if (stepId === '1-1') {
        requiredProgress = 0.5; // 0.5% for step 1-1 intro
      } else if (['2-1', '3-1', '4-1', '4-4'].includes(stepId)) {
        requiredProgress = 85; // 85% for main content videos to ensure they're actually watched
      }
      
      if (videoProgress < requiredProgress) {
        return { isComplete: false, reason: `Video must be watched to at least ${requiredProgress}% (${videoProgress.toFixed(2)}% watched)` };
      }
      console.log(`✅ Video step ${stepId} verified complete: ${videoProgress.toFixed(2)}% >= ${requiredProgress}%`);
      return { isComplete: true };
    }
    
    // Assessment steps require assessment data
    if (stepId === '2-2') {
      // Star Card assessment
      if (!userAssessments?.starCard) {
        return { isComplete: false, reason: 'Star Card assessment must be completed' };
      }
      return { isComplete: true };
    }
    
    if (stepId === '3-2') {
      // Flow attributes assessment
      if (!userAssessments?.flowAttributes) {
        return { isComplete: false, reason: 'Flow assessment must be completed' };
      }
      return { isComplete: true };
    }
    
    // Reflection steps require text input completion with minimum 10 characters
    if (['2-4', '3-4', '4-2', '4-3', '4-5'].includes(stepId)) {
      const MINIMUM_REFLECTION_LENGTH = 10;
      
      // Map steps to their required reflection fields
      const stepReflectionFields = {
        '2-4': ['strength1', 'strength2', 'strength3', 'strength4', 'teamValues', 'uniqueContribution'],
        '3-4': ['flowAttributesText'], // Flow attributes text before adding to star card
        '4-2': ['ladderReflection'],
        '4-3': ['futureVisionReflection'],
        '4-5': ['finalReflection']
      };
      
      const requiredFields = stepReflectionFields[stepId as keyof typeof stepReflectionFields] || [];
      
      for (const field of requiredFields) {
        // For step 2-4, check stepByStepReflection assessment results
        let fieldValue;
        if (stepId === '2-4') {
          fieldValue = userAssessments?.stepByStepReflection?.results?.reflections?.[field];
        } else {
          fieldValue = userAssessments?.[field];
        }
        
        if (!fieldValue || typeof fieldValue !== 'string' || fieldValue.trim().length < MINIMUM_REFLECTION_LENGTH) {
          console.log(`❌ Field ${field} validation failed:`, fieldValue?.length || 0, 'characters');
          return { 
            isComplete: false, 
            reason: `Reflection must be at least ${MINIMUM_REFLECTION_LENGTH} characters long` 
          };
        }
      }
      
      return { isComplete: true };
    }
    
    // Step 3-4 specifically requires flow attributes to be added to star card
    if (stepId === '3-4') {
      // Check if star card has flow attributes added
      const starCardData = userAssessments?.starCard;
      const hasFlowAttributes = starCardData?.flowAttributes && 
        Array.isArray(starCardData.flowAttributes) && 
        starCardData.flowAttributes.length > 0;
      
      if (!hasFlowAttributes) {
        return { 
          isComplete: false, 
          reason: 'Flow attributes must be added to your star card before proceeding to ladder of wellbeing' 
        };
      }
      return { isComplete: true };
    }
    
    // Default: allow completion for other steps
    return { isComplete: true };
  };

  // Mark a step as completed with strict validation
  const markStepCompleted = (stepId: string) => {
    console.log(`markStepCompleted called with:`, stepId, "completedSteps:", progress.completedSteps);
    
    // Prevent completing steps that are already complete
    if (progress.completedSteps.includes(stepId)) {
      console.log(`Step ${stepId} already completed`);
      return;
    }
    
    // Validate completion requirements
    const validation = validateStepCompletion(stepId);
    if (!validation.isComplete) {
      console.log(`❌ Step ${stepId} validation failed: ${validation.reason}`);
      // Validation failed - step cannot be completed yet
      return;
    }
    
    console.log(`✅ Step ${stepId} validation passed - marking complete`);
    
    // For video steps, mark completed when validation passes
    if (['1-1', '2-1', '2-3', '3-1', '3-3', '4-1', '4-4'].includes(stepId)) {
      const uniqueSteps = [...new Set([...progress.completedSteps, stepId])];
      const newCompletedSteps = uniqueSteps;
      
      const newProgress = {
        ...progress,
        completedSteps: newCompletedSteps,
        currentStepId: getNextStepId(newCompletedSteps) || stepId,
        unlockedSections: getUnlockedSections(newCompletedSteps),
        lastVisitedAt: new Date().toISOString()
      };
      setProgress(newProgress);
      syncWithDatabase();
      return;
    }
    
    // For other steps, recalculate based on actual data
    const updatedProgress = recalculateProgress();
    setProgress(updatedProgress);
    syncWithDatabase();
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

  // Sequential progression rules based on specifications
  const getNextUnlockedSection = (completedSteps: string[]) => {
    // Section 1 (Introduction) is always unlocked initially
    const unlocked = ['1'];
    
    // Section 2 unlocks after completing 1-1 (Introduction Video)
    if (completedSteps.includes('1-1')) {
      unlocked.push('2');
    }
    
    // Section 3 unlocks after completing all of Section 2 (2-1, 2-2, 2-3, 2-4)
    if (['2-1', '2-2', '2-3', '2-4'].every(step => completedSteps.includes(step))) {
      unlocked.push('3');
    }
    
    // Section 4 unlocks after completing all of Section 3 (3-1, 3-2, 3-3, 3-4)
    if (['3-1', '3-2', '3-3', '3-4'].every(step => completedSteps.includes(step))) {
      unlocked.push('4');
    }
    
    // Section 5 (Resources) unlocks after completing 4-5 (Final Reflection)
    if (completedSteps.includes('4-5')) {
      unlocked.push('5');
    }
    
    return unlocked;
  };

  // Update video progress with database persistence
  const updateVideoProgress = (stepId: string, percentage: number) => {
    console.log(`🎬 Updating video progress for ${stepId}: ${percentage}%`);
    setProgress(prev => {
      const newProgress = {
        ...prev,
        videoProgress: {
          ...prev.videoProgress,
          [stepId]: percentage
        },
        lastVisitedAt: new Date().toISOString()
      };
      console.log(`🎬 Updated progress state:`, newProgress.videoProgress);
      
      // Auto-complete step if video meets threshold and not already completed
      if (!prev.completedSteps.includes(stepId)) {
        let requiredProgress = 1; // Default 1%
        if (stepId === '1-1') {
          requiredProgress = 0.5; // 0.5% for intro
        } else if (['2-1', '2-3', '3-1', '3-3', '4-1', '4-4'].includes(stepId)) {
          requiredProgress = 85; // 85% for main content videos
        }
        
        if (percentage >= requiredProgress) {
          console.log(`✅ Auto-completing video step ${stepId} at ${percentage.toFixed(2)}%`);
          newProgress.completedSteps = [...prev.completedSteps, stepId];
          newProgress.unlockedSections = getUnlockedSections(newProgress.completedSteps);
          
          // Step completed automatically - no notification needed
        }
      }
      
      // Persist to database when reaching key thresholds
      if (percentage >= 1 && (!prev.videoProgress[stepId] || prev.videoProgress[stepId] < 1)) {
        console.log(`🎬 Persisting video progress to database for ${stepId}: ${percentage}%`);
        syncProgressToDatabase(newProgress);
      }
      
      return newProgress;
    });
  };

  // Sync progress to database helper
  const syncProgressToDatabase = async (progressData: NavigationProgress) => {
    try {
      const response = await fetch('/api/user/navigation-progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(progressData)
      });
      
      if (response.ok) {
        console.log('✅ Video progress synced to database');
      } else {
        console.error('❌ Failed to sync video progress to database');
      }
    } catch (error) {
      console.error('❌ Error syncing video progress:', error);
    }
  };

  // Check if step can be unlocked (within an unlocked section)
  const isStepUnlocked = (stepId: string, sectionId: string) => {
    const unlockedSections = getNextUnlockedSection(progress.completedSteps);
    if (!unlockedSections.includes(sectionId)) return false;
    
    // Within a section, steps must be completed sequentially
    const stepNumber = parseInt(stepId.split('-')[1]);
    const sectionSteps = [`${sectionId}-1`, `${sectionId}-2`, `${sectionId}-3`, `${sectionId}-4`, `${sectionId}-5`];
    
    // First step of an unlocked section is always available
    if (stepNumber === 1) return true;
    
    // Other steps require previous step completion
    for (let i = 1; i < stepNumber; i++) {
      if (!progress.completedSteps.includes(`${sectionId}-${i}`)) {
        return false;
      }
    }
    
    return true;
  };

  // Reset progress
  const resetProgress = () => {
    const resetData = {
      completedSteps: [],
      currentStepId: '',
      appType: null,
      lastVisitedAt: new Date().toISOString(),
      unlockedSections: ['1'],
      videoProgress: {}
    };
    setProgress(resetData);
    localStorage.removeItem('navigationProgress');
  };

  // Add section progress calculation functions
  const getSectionProgressData = (sectionSteps: string[]) => {
    return getSectionProgress(sectionSteps, progress.completedSteps);
  };

  // Check if step is accessible based on progression rules
  const isStepAccessibleByProgression = (stepId: string) => {
    return isStepAccessible(stepId, progress.completedSteps);
  };

  return {
    progress,
    markStepCompleted,
    updateCurrentStep,
    resetProgress,
    syncWithDatabase,
    loadFromDatabase,
    updateVideoProgress,
    isStepUnlocked,
    getNextUnlockedSection,
    // New progression logic functions
    checkStepCompletion,
    recalculateProgress,
    getSectionProgressData,
    isStepAccessibleByProgression,
    SECTION_STEPS
  };
}