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

// FEATURE FLAG SYSTEM - Easy toggle for restoration
const PROGRESSION_MODE = {
  SIMPLIFIED: 'simplified',
  COMPLEX: 'complex'
} as const;

const CURRENT_PROGRESSION_MODE = 'simplified' as const;

// SIMPLIFIED MODE: Only validate non-video requirements
const validateStepCompletionSimplified = (stepId: string, userAssessments: any): boolean => {
  console.log(`🔍 SIMPLIFIED VALIDATION: Step ${stepId}`);
  
  // Assessment steps - still require completion
  if (stepId === '2-2') {
    const isValid = !!userAssessments?.starCard;
    console.log(`📋 Star Card assessment: ${isValid ? 'COMPLETE' : 'REQUIRED'}`);
    return isValid;
  }
  
  if (stepId === '3-2') {
    const isValid = !!userAssessments?.flowAssessment;
    console.log(`📋 Flow assessment: ${isValid ? 'COMPLETE' : 'REQUIRED'}`);
    return isValid;
  }
  
  // Mixed requirement steps - only validate activity parts (not video)
  if (stepId === '4-1') {
    const isValid = !!userAssessments?.cantrilLadder;
    console.log(`🎚️ Cantril Ladder activity: ${isValid ? 'COMPLETE' : 'REQUIRED'}`);
    return isValid;
  }
  
  if (stepId === '4-2') {
    const isValid = !!userAssessments?.cantrilLadderReflection;
    console.log(`📝 Well-being reflection: ${isValid ? 'COMPLETE' : 'REQUIRED'}`);
    return isValid;
  }
  
  // All other steps: Next button always active
  console.log(`✅ SIMPLIFIED MODE: Next button always active for ${stepId}`);
  return true;
};

// SIMPLIFIED: Linear progression only
const calculateUnlockedSteps = (completedSteps: string[]): string[] => {
  const allSteps = ['1-1', '2-1', '2-2', '2-3', '2-4', '3-1', '3-2', '3-3', '3-4', '4-1', '4-2', '4-3', '4-4', '4-5'];
  const unlocked = ['1-1']; // First step always unlocked
  
  // Simple linear unlocking: each completed step unlocks exactly the next one
  for (let i = 0; i < allSteps.length - 1; i++) {
    const currentStep = allSteps[i];
    const nextStep = allSteps[i + 1];
    
    if (completedSteps.includes(currentStep)) {
      unlocked.push(nextStep);
      console.log(`📝 SIMPLIFIED MODE: Step ${currentStep} completed → unlocked ${nextStep}`);
    }
  }
  
  console.log('🔓 SIMPLIFIED MODE: Unlocked steps (linear only):', unlocked);
  return unlocked;
};

interface NavigationProgress {
  completedSteps: string[];
  currentStepId: string;
  appType: 'ast' | 'ia' | null;
  lastVisitedAt: string;
  unlockedSections: string[];
  unlockedSteps?: string[]; // Added for step-level unlocking
  videoProgress: { [stepId: string]: number };
  videoPositions: { [stepId: string]: number }; // New: track current playback positions
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
    unlockedSteps: ['1-1'], // Initialize with first step unlocked
    videoProgress: {},
    videoPositions: {} // New: track current playback positions
  });

  // Get user assessments for completion detection
  const { data: userAssessments = {} } = useUserAssessments();

  // DISABLED: Reset detection was causing continuous loops
  // The system was clearing progress data unnecessarily
  const serverProgress = null;

  // Load navigation progress from database on component mount - STATIC INITIALIZATION
  useEffect(() => {
    console.log('🔄 STATIC progress initialization - using fixed state');
    
    // Use a clean initial state with no progress
    const cleanProgress = {
      completedSteps: [],
      currentStepId: '1-1',
      appType: 'ast' as const,
      lastVisitedAt: new Date().toISOString(),
      unlockedSections: ['1'],
      unlockedSteps: ['1-1'],
      videoProgress: {
        '1-1': 0,
        '2-1': 0,
        '2-3': 0,
        '3-1': 0,
        '3-3': 0,
        '4-1': 0,
        '4-4': 0
      },
      videoPositions: {
        '1-1': 0,
        '2-1': 0,
        '2-3': 0,
        '3-1': 0,
        '3-3': 0,
        '4-1': 0,
        '4-4': 0
      }
    };
    
    console.log('✅ Setting clean progress state');
    setProgress(cleanProgress);
    
    // FORCE COMPLETE RESET - Clear all possible cached sources
    (window as any).currentVideoProgress = cleanProgress.videoProgress;
    localStorage.removeItem('navigationProgress');
    localStorage.removeItem('userProgress');
    localStorage.removeItem('videoProgress');
    sessionStorage.clear();
    
    // Force clear any existing cached state
    Object.keys(localStorage).forEach(key => {
      if (key.includes('progress') || key.includes('video') || key.includes('navigation')) {
        localStorage.removeItem(key);
      }
    });
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

  // Selective sync to prevent reset loops while maintaining video progress persistence
  const syncWithDatabase = async () => {
    try {
      const response = await fetch('/api/user/navigation-progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(progress)
      });
      
      if (response.ok) {
        console.log('✅ Navigation progress synced to database');
      } else {
        console.error('❌ Failed to sync navigation progress to database');
      }
    } catch (error) {
      console.error('❌ Error syncing navigation progress:', error);
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

  // Mode-aware validation function
  const validateStepCompletion = (stepId: string): boolean => {
    if (CURRENT_PROGRESSION_MODE === 'simplified') {
      return validateStepCompletionSimplified(stepId, userAssessments);
    } else {
      return true; // Complex mode disabled for now
    }
  };

  // SIMPLIFIED MODE: Only validate non-video requirements
  const validateStepCompletionSimplified = (stepId: string): { isComplete: boolean; reason?: string } => {
    console.log(`🔍 SIMPLIFIED VALIDATION: Step ${stepId}`);
    
    // Assessment steps - still require completion
    if (stepId === '2-2') {
      const isValid = !!userAssessments?.starCard;
      console.log(`📋 Star Card assessment: ${isValid ? 'COMPLETE' : 'REQUIRED'}`);
      return { isComplete: isValid, reason: isValid ? undefined : 'Star Card assessment required' };
    }
    
    if (stepId === '3-2') {
      const isValid = !!userAssessments?.flowAssessment;
      console.log(`📋 Flow assessment: ${isValid ? 'COMPLETE' : 'REQUIRED'}`);
      return { isComplete: isValid, reason: isValid ? undefined : 'Flow assessment required' };
    }
    
    // Mixed requirement steps - only validate activity parts (not video)
    if (stepId === '4-1') {
      const isValid = checkCantrilLadderSubmission(stepId); // Sliders only, not video
      console.log(`🎚️ Cantril Ladder activity: ${isValid ? 'COMPLETE' : 'REQUIRED'}`);
      return { isComplete: isValid, reason: isValid ? undefined : 'Cantril Ladder activity required' };
    }
    
    // Add other mixed-requirement validations as needed
    if (stepId === '4-2') {
      const isValid = !!userAssessments?.cantrilLadderReflection;
      console.log(`📝 Well-being reflection: ${isValid ? 'COMPLETE' : 'REQUIRED'}`);
      return { isComplete: isValid, reason: isValid ? undefined : 'Well-being reflection required' };
    }
    
    // All other steps: Next button always active
    console.log(`✅ SIMPLIFIED MODE: Next button always active for ${stepId}`);
    return { isComplete: true };
  };

  // Helper for Cantril Ladder validation
  const checkCantrilLadderSubmission = (stepId: string): boolean => {
    // Check if sliders completed and "I'm Done" button clicked
    return !!userAssessments?.cantrilLadder;
  };

  // Check if a step is completed using progression logic
  const checkStepCompletion = (stepId: string): boolean => {
    const completionResult = isStepCompleted(stepId, assessmentsArray, progress);
    return completionResult.isComplete;
  };

  // Calculate progress from user data including video progress
  const recalculateProgressFromData = (): NavigationProgress => {
    const allSteps = [
      '1-1', '2-1', '2-2', '2-3', '2-4', 
      '3-1', '3-2', '3-3', '3-4',
      '4-1', '4-2', '4-3', '4-4', '4-5'
    ];

    let actuallyCompleted: string[] = [];
    
    // First check video progress to mark video steps as complete
    const videoSteps = ['1-1', '2-1', '2-3', '3-1', '3-3', '4-1', '4-4'];
    videoSteps.forEach(stepId => {
      const videoProgress = progress?.videoProgress?.[stepId] || 0;
      // Mark video step complete if it has 90% progress for green checkmark
      if (videoProgress >= 90) {
        if (!actuallyCompleted.includes(stepId)) {
          actuallyCompleted.push(stepId);
          console.log(`✅ Video step ${stepId} completed with ${videoProgress}% progress`);
        }
      }
    });
    
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
    
    // Remove duplicates and sort
    actuallyCompleted = Array.from(new Set(actuallyCompleted));
    
    // Get unlocked sections and next step
    const unlockedSections = getUnlockedSections(actuallyCompleted);
    const nextStepId = getNextStepId(actuallyCompleted);

    // Initialize video progress for all video steps if not present
    const allVideoSteps = ['1-1', '2-1', '2-3', '3-1', '3-3', '4-1', '4-4'];
    const initializedVideoProgress = { ...(progress?.videoProgress || {}) };
    
    // Ensure all video steps have progress tracking initialized
    allVideoSteps.forEach(stepId => {
      if (!(stepId in initializedVideoProgress)) {
        initializedVideoProgress[stepId] = 0;
      }
    });

    // Initialize video positions for all video steps if not present
    const initializedVideoPositions = { ...(progress?.videoPositions || {}) };
    allVideoSteps.forEach(stepId => {
      if (!(stepId in initializedVideoPositions)) {
        initializedVideoPositions[stepId] = 0;
      }
    });

    return {
      completedSteps: actuallyCompleted,
      currentStepId: nextStepId || '1-1',
      appType: 'ast' as const,
      lastVisitedAt: new Date().toISOString(),
      unlockedSections,
      videoProgress: initializedVideoProgress,
      videoPositions: initializedVideoPositions
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
        let requiredProgress = 1; // Default 1% per original requirements
        if (stepId === '1-1') {
          requiredProgress = 1; // 1% for intro
        } else if (['2-1', '2-3', '3-1', '3-3', '4-1', '4-4'].includes(stepId)) {
          requiredProgress = 1; // 1% for main content videos
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

  // Helper: Get most current video progress with robust fallback
  const getCurrentVideoProgress = (stepId: string): number => {
    console.log(`🔍 Getting current progress for ${stepId}...`);
    
    // Priority 1: Global video tracking state (most current)
    if ((window as any).currentVideoProgress?.[stepId] !== undefined) {
      const globalProgress = (window as any).currentVideoProgress[stepId];
      console.log(`  ✅ Found in global state: ${globalProgress}%`);
      return globalProgress;
    }
    
    // Priority 2: Component navigation state
    const savedProgress = progress?.videoProgress?.[stepId] || 0;
    if (savedProgress > 0) {
      console.log(`  ✅ Found in saved state: ${savedProgress}%`);
      return savedProgress;
    }
    
    console.warn(`  ❌ No video progress found for ${stepId}, defaulting to 0%`);
    return 0;
  };

  // Helper: Identify video steps in AllStarTeams workshop
  const isVideoStep = (stepId: string): boolean => {
    const videoSteps = ['1-1', '2-1', '2-3', '3-1', '3-3', '4-1', '4-4'];
    return videoSteps.includes(stepId);
  };

  // Video threshold constants for dual-threshold system
  const VIDEO_THRESHOLDS = {
    NEXT_BUTTON: 5,    // 5% to enable Next button and unlock next step
    COMPLETION: 90     // 90% to show green checkmark and mark complete
  } as const;

  // Get video thresholds for a specific step
  const getVideoThresholds = (stepId: string) => {
    // Phase 1: Same thresholds for all video steps
    // Phase 2: Will be admin-configurable per step
    return {
      nextButtonThreshold: VIDEO_THRESHOLDS.NEXT_BUTTON,
      completionThreshold: VIDEO_THRESHOLDS.COMPLETION
    };
  };

  // Check if step meets Next button threshold (5%)
  const canProceedToNext = (stepId: string): boolean => {
    if (isVideoStep(stepId)) {
      const currentProgress = getCurrentVideoProgress(stepId);
      const thresholds = getVideoThresholds(stepId);
      return currentProgress >= thresholds.nextButtonThreshold;
    }
    return progress.completedSteps.includes(stepId);
  };

  // Check if step should show green checkmark (90% for videos)
  const shouldShowGreenCheckmark = (stepId: string): boolean => {
    if (isVideoStep(stepId)) {
      const currentProgress = getCurrentVideoProgress(stepId);
      const thresholds = getVideoThresholds(stepId);
      const isComplete = currentProgress >= thresholds.completionThreshold;
      
      console.log(`🏆 Green Checkmark Check for ${stepId}:`);
      console.log(`  📊 Progress: ${currentProgress}%`);
      console.log(`  🎯 Completion Threshold: ${thresholds.completionThreshold}%`);
      console.log(`  ${isComplete ? '✅ SHOW GREEN CHECKMARK' : '⏳ NO CHECKMARK YET'}`);
      
      return isComplete;
    }
    
    // Non-video steps: show checkmark when completed
    return progress.completedSteps.includes(stepId);
  };

  // Validate step completion before marking complete (uses 5% threshold for progression)
  const validateStepCompletion = (stepId: string): { isComplete: boolean; reason?: string } => {
    console.log(`🔍 VALIDATION START: Step ${stepId}`);
    
    // Video steps require completion based on step-specific thresholds
    if (isVideoStep(stepId)) {
      // Get current video progress using robust fallback system
      const currentProgress = getCurrentVideoProgress(stepId);
      const thresholds = getVideoThresholds(stepId);
      
      // Enhanced debugging logs
      console.log(`📹 Video Progress Debug for ${stepId}:`);
      console.log(`  📊 Global state: ${(window as any).currentVideoProgress?.[stepId] || 'undefined'}%`);
      console.log(`  📊 Saved state: ${progress?.videoProgress?.[stepId] || 'undefined'}%`);
      console.log(`  🎯 Current progress: ${currentProgress}%`);
      console.log(`  🚨 Next Button Threshold: ${thresholds.nextButtonThreshold}%`);
      console.log(`  🏁 Completion Threshold: ${thresholds.completionThreshold}%`);
      
      if (currentProgress < thresholds.nextButtonThreshold) {
        console.log(`  ❌ VALIDATION FAILED`);
        return { isComplete: false, reason: `Video must be watched to at least ${thresholds.nextButtonThreshold}% (${currentProgress.toFixed(2)}% watched)` };
      }
      console.log(`  ✅ VALIDATION PASSED (Can proceed but may not show checkmark yet)`);
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
      const stepSet = new Set(progress.completedSteps);
      stepSet.add(stepId);
      const newCompletedSteps = Array.from(stepSet);
      
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

  // Update video progress with database persistence and dual-threshold system
  const updateVideoProgress = (stepId: string, percentage: number, isPositionUpdate = false) => {
    const roundedProgress = Math.round(percentage * 100) / 100;
    
    if (isPositionUpdate) {
      // Update current position (for resume playback) - always update
      console.log(`🎬 VIDEO POSITION UPDATE: ${stepId} = ${roundedProgress}%`);
      
      setProgress(prev => ({
        ...prev,
        videoPositions: {
          ...prev.videoPositions,
          [stepId]: roundedProgress
        }
      }));
      
      return;
    }
    
    console.log(`🎬 VIDEO PROGRESS UPDATE: ${stepId} = ${roundedProgress}%`);
    
    // Store in global state for immediate validation access
    if (!(window as any).currentVideoProgress) {
      (window as any).currentVideoProgress = {};
      console.log('📹 Initialized global video progress tracking');
    }
    (window as any).currentVideoProgress[stepId] = roundedProgress;
    console.log(`  ✅ Stored in global state`);
    
    setProgress(prev => {
      const newProgress = {
        ...prev,
        videoProgress: {
          ...prev.videoProgress,
          [stepId]: Math.max(roundedProgress, prev.videoProgress[stepId] || 0) // Always maintain highest progress
        },
        videoPositions: {
          ...prev.videoPositions,
          [stepId]: roundedProgress // Also update position for this progress update
        },
        lastVisitedAt: new Date().toISOString()
      };
      
      const thresholds = getVideoThresholds(stepId);
      console.log(`🎬 Updated progress state:`, newProgress.videoProgress);
      console.log(`📊 Thresholds for ${stepId}: Next=${thresholds.nextButtonThreshold}%, Complete=${thresholds.completionThreshold}%`);
      
      // Auto-complete step when it reaches COMPLETION threshold (90%)
      if (!prev.completedSteps.includes(stepId) && roundedProgress >= thresholds.completionThreshold) {
        console.log(`✅ Auto-completing video step ${stepId} at ${roundedProgress}% (>= ${thresholds.completionThreshold}%)`);
        newProgress.completedSteps = [...prev.completedSteps, stepId];
        newProgress.unlockedSections = getUnlockedSections(newProgress.completedSteps);
      }
      
      // Update unlocked steps based on NEW 5% threshold for next button access
      const updateUnlockedSteps = (completedSteps: string[], videoProgress: { [stepId: string]: number }): string[] => {
        const allSteps = ['1-1', '2-1', '2-2', '2-3', '2-4', '3-1', '3-2', '3-3', '3-4', '4-1', '4-2', '4-3', '4-4', '4-5'];
        const unlocked = ['1-1']; // First step always unlocked
        
        for (let i = 0; i < allSteps.length - 1; i++) {
          const currentStep = allSteps[i];
          const nextStep = allSteps[i + 1];
          
          let canUnlockNext = false;
          
          // For video steps, check NEW 5% threshold
          if (isVideoStep(currentStep)) {
            const currentVideoProgress = videoProgress[currentStep] || 0;
            const stepThresholds = getVideoThresholds(currentStep);
            canUnlockNext = currentVideoProgress >= stepThresholds.nextButtonThreshold; // 5%
            
            console.log(`📹 Step ${currentStep}: ${currentVideoProgress}% (need ${stepThresholds.nextButtonThreshold}% to unlock ${nextStep}) - ${canUnlockNext ? 'UNLOCKED' : 'LOCKED'}`);
          } 
          // For assessment steps, check if completed
          else if (completedSteps.includes(currentStep)) {
            canUnlockNext = true;
            console.log(`📝 Step ${currentStep}: Completed - UNLOCKS ${nextStep}`);
          }
          
          if (canUnlockNext && !unlocked.includes(nextStep)) {
            unlocked.push(nextStep);
          }
        }
        
        return unlocked;
      };
      
      // Recalculate unlocked steps with new thresholds
      newProgress.unlockedSteps = updateUnlockedSteps(newProgress.completedSteps, newProgress.videoProgress);
      
      // Persist to database for any video progress increase
      if (roundedProgress > (prev.videoProgress[stepId] || 0)) {
        console.log(`🎬 Persisting video progress to database for ${stepId}: ${roundedProgress}%`);
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
      videoProgress: {},
      videoPositions: {}
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

  // Helper: Get current video position (for resume playback)
  const getCurrentVideoPosition = (stepId: string): number => {
    return progress.videoPositions[stepId] || 0;
  };

  // Helper: Update video position for resume tracking
  const updateVideoPosition = (stepId: string, position: number) => {
    updateVideoProgress(stepId, position, true);
  };

  // Helper function for checking if step is completed
  const isStepCompleted = (stepId: string) => progress.completedSteps.includes(stepId);
  
  // Helper function for getting video progress
  const getVideoProgress = (stepId: string) => getCurrentVideoProgress(stepId);
  
  // Helper function for saving progress to database
  const saveProgressToDatabase = () => syncWithDatabase();

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
    // Required by allstarteams.tsx
    isStepCompleted,
    getVideoProgress,
    saveProgressToDatabase,
    // New progression logic functions
    checkStepCompletion,
    recalculateProgress,
    getSectionProgressData,
    isStepAccessibleByProgression,
    SECTION_STEPS,
    // New dual-threshold functions
    shouldShowGreenCheckmark,  // For menu green checkmarks (90% threshold)
    getVideoThresholds,        // For components to check thresholds
    canProceedToNext,          // For Next button validation (5% threshold)
    validateStepCompletion,    // Updated validation with new thresholds
    getCurrentVideoProgress,   // Helper for getting current video progress
    getCurrentVideoPosition,   // Helper for getting video resume position
    updateVideoPosition,       // Helper for updating video position
    isVideoStep               // Helper for identifying video steps
  };
}