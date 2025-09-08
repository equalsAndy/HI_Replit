import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

// Step completion interface
export interface StepCompletion {
  stepId: string;
  completed: boolean;
  completedAt?: Date;
  hasRequiredData?: boolean;
}

// Visual states for navigation
export interface StepVisualState {
  completed: boolean;
  current: boolean;
  nextAvailable: boolean;
  locked: boolean;
}

// Data dependency validation
interface DataValidationResult {
  hasData: boolean;
  missingData?: string[];
}

export function useStepProgression(appType: 'ast' | 'ia' = 'ast') {
  const [currentStepId, setCurrentStepId] = useState<string>(appType === 'ia' ? 'ia-1-1' : '1-1');
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  // Step dependency rules for AST
  const getStepDependencies = (stepId: string): string[] => {
    const dependencies: Record<string, string[]> = {
      // Module 1: Getting Started
      '1-1': [], // Always available
      '1-2': ['1-1'],
      '1-3': ['1-2'],

      // Module 2: Strength and Flow
      '2-1': ['1-3'], // Requires Module 1 completion
      '2-2': ['2-1'], // Requires 2-1 completion + Star Card data
      '2-3': ['2-2'], // Requires 2-2 completion + Flow assessment data
      '2-4': ['2-3'],

      // Module 3: Visualize Your Potential
      '3-1': ['2-4'], // Requires Module 2 completion
      '3-2': ['3-1'],
      '3-3': ['3-2'],
      '3-4': ['3-3'], // Workshop completion

      // Module 4: Takeaways & Next Steps (unlocked after 3-4)
      '4-1': ['3-4'],
      '4-2': ['4-1'],
      '4-3': ['4-2'],
      '4-4': ['4-3'],

      // Module 5: More Information (unlocked after 3-4)
      '5-1': ['3-4'],
      '5-2': ['5-1'],
      '5-3': ['3-4'] // Available early after Module 2
    };

    return dependencies[stepId] || [];
  };

  // Check if step is unlocked based on dependencies
  const isStepUnlocked = (stepId: string): boolean => {
    const dependencies = getStepDependencies(stepId);
    return dependencies.every(dep => completedSteps.includes(dep));
  };

  // Get visual state for navigation
  const getStepVisualState = (stepId: string): StepVisualState => {
    const completed = completedSteps.includes(stepId);
    const current = stepId === currentStepId;
    const unlocked = isStepUnlocked(stepId);
    const nextAvailable = !completed && unlocked && !current && isImmediateNextStep(stepId);

    return {
      completed,
      current,
      nextAvailable,
      locked: !unlocked && !current && !completed
    };
  };

  // Helper to identify immediate next step
  const isImmediateNextStep = (stepId: string): boolean => {
    const stepOrder = ['1-1', '1-2', '1-3', '2-1', '2-2', '2-3', '2-4', '3-1', '3-2', '3-3', '3-4', '4-1', '4-2', '4-3', '4-4', '5-1', '5-2', '5-3'];
    const currentIndex = Math.max(...completedSteps.map(id => stepOrder.indexOf(id)));
    const targetIndex = stepOrder.indexOf(stepId);
    return targetIndex === currentIndex + 1;
  };

  // Data dependency validation
  const validateStepData = async (stepId: string): Promise<DataValidationResult> => {
    try {
      switch (stepId) {
        case '2-2': // Flow Patterns - needs Star Card data
          const starCardResponse = await fetch('/api/workshop-data/starcard', { credentials: 'include' });
          if (starCardResponse.ok) {
            const starCardData = await starCardResponse.json();
            const hasValidStarCard = starCardData && (
              (starCardData.thinking && starCardData.thinking > 0) ||
              (starCardData.acting && starCardData.acting > 0) ||
              (starCardData.feeling && starCardData.feeling > 0) ||
              (starCardData.planning && starCardData.planning > 0)
            );
            
            return {
              hasData: hasValidStarCard,
              missingData: hasValidStarCard ? undefined : ['Star Strengths Assessment']
            };
          }
          return { hasData: false, missingData: ['Star Strengths Assessment'] };

        case '2-3': // Future Self - needs Star Card + Flow data
          const [starCardRes, flowRes] = await Promise.all([
            fetch('/api/workshop-data/starcard', { credentials: 'include' }),
            fetch('/api/workshop-data/flow-attributes', { credentials: 'include' })
          ]);

          const missingData: string[] = [];
          
          if (starCardRes.ok) {
            const starCardData = await starCardRes.json();
            const hasValidStarCard = starCardData && (
              (starCardData.thinking && starCardData.thinking > 0) ||
              (starCardData.acting && starCardData.acting > 0) ||
              (starCardData.feeling && starCardData.feeling > 0) ||
              (starCardData.planning && starCardData.planning > 0)
            );
            if (!hasValidStarCard) {
              missingData.push('Star Strengths Assessment');
            }
          } else {
            missingData.push('Star Strengths Assessment');
          }

          if (flowRes.ok) {
            const flowData = await flowRes.json();
            const hasFlowData = flowData?.success && flowData?.attributes && Array.isArray(flowData.attributes) && flowData.attributes.length > 0;
            if (!hasFlowData) {
              missingData.push('Flow Assessment');
            }
          } else {
            missingData.push('Flow Assessment');
          }

          return {
            hasData: missingData.length === 0,
            missingData: missingData.length > 0 ? missingData : undefined
          };

        default:
          return { hasData: true };
      }
    } catch (error) {
      console.error(`Error validating data for step ${stepId}:`, error);
      return { hasData: false, missingData: ['Data validation failed'] };
    }
  };

  // Mark step as completed
  const markStepCompleted = (stepId: string) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps(prev => [...prev, stepId]);
    }
  };

  // Navigate to step with validation
  const navigateToStep = async (stepId: string): Promise<{ success: boolean; error?: string }> => {
    // Check if step is unlocked
    if (!isStepUnlocked(stepId)) {
      const dependencies = getStepDependencies(stepId);
      const missingDeps = dependencies.filter(dep => !completedSteps.includes(dep));
      return {
        success: false,
        error: `Complete these steps first: ${missingDeps.join(', ')}`
      };
    }

    // Validate data dependencies for critical steps
    if (['2-2', '2-3'].includes(stepId)) {
      const validation = await validateStepData(stepId);
      if (!validation.hasData) {
        return {
          success: false,
          error: `Missing required data: ${validation.missingData?.join(', ')}`
        };
      }
    }

    setCurrentStepId(stepId);
    return { success: true };
  };

  return {
    currentStepId,
    completedSteps,
    setCurrentStepId,
    markStepCompleted,
    isStepUnlocked,
    getStepVisualState,
    validateStepData,
    navigateToStep,
    getStepDependencies
  };
}