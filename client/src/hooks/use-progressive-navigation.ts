import { useStepProgression } from './use-step-progression';
import { useNavigationProgress } from './use-navigation-progress';

/**
 * Integration hook that bridges the old navigation system with the new progression system
 * This allows for gradual migration while maintaining backward compatibility
 */
export function useProgressiveNavigation(appType: 'ast' | 'ia' = 'ast') {
  // New progression system
  const progressiveSystem = useStepProgression(appType);
  
  // Old navigation system (fallback)
  const legacySystem = useNavigationProgress(appType);

  // Feature flag to enable/disable progressive navigation
  const ENABLE_PROGRESSIVE_NAVIGATION = process.env.NEXT_PUBLIC_ENABLE_PROGRESSIVE_NAVIGATION === 'true' || 
                                        typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('progressive') === '1';

  // Return the appropriate system based on feature flag
  if (ENABLE_PROGRESSIVE_NAVIGATION) {
    return {
      // Progressive system methods
      currentStepId: progressiveSystem.currentStepId,
      completedSteps: progressiveSystem.completedSteps,
      markStepCompleted: progressiveSystem.markStepCompleted,
      setCurrentStep: progressiveSystem.setCurrentStepId,
      isStepUnlocked: progressiveSystem.isStepUnlocked,
      getStepVisualState: progressiveSystem.getStepVisualState,
      validateStepData: progressiveSystem.validateStepData,
      navigateToStep: progressiveSystem.navigateToStep,
      getStepDependencies: progressiveSystem.getStepDependencies,
      
      // Bridge methods for compatibility
      canProceedToNext: (stepId: string) => progressiveSystem.isStepUnlocked(stepId),
      shouldShowGreenCheckmark: (stepId: string) => progressiveSystem.completedSteps.includes(stepId),
      isStepAccessible: (stepId: string) => progressiveSystem.isStepUnlocked(stepId),
      
      // System metadata
      isProgressiveMode: true,
      systemVersion: 'progressive'
    };
  } else {
    // Legacy system with progressive compatibility layer
    return {
      // Legacy system methods
      currentStepId: legacySystem.currentStepId,
      completedSteps: legacySystem.completedSteps,
      markStepCompleted: legacySystem.markStepCompleted,
      setCurrentStep: legacySystem.setCurrentStep,
      canProceedToNext: legacySystem.canProceedToNext,
      shouldShowGreenCheckmark: legacySystem.shouldShowGreenCheckmark,
      isStepAccessible: legacySystem.isStepAccessible,
      
      // Mock progressive methods for compatibility
      isStepUnlocked: (stepId: string) => true, // Legacy system allows all steps
      getStepVisualState: (stepId: string) => ({
        completed: legacySystem.completedSteps.includes(stepId),
        current: legacySystem.currentStepId === stepId,
        nextAvailable: false,
        locked: false
      }),
      validateStepData: async (stepId: string) => ({ hasData: true }),
      navigateToStep: async (stepId: string) => {
        legacySystem.setCurrentStep(stepId);
        return { success: true };
      },
      getStepDependencies: (stepId: string) => [],
      
      // System metadata
      isProgressiveMode: false,
      systemVersion: 'legacy'
    };
  }
}