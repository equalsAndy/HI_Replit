// Video progress tracking and unlocking configuration

export interface VideoUnlockConfig {
  stepId: string;
  workshopType: 'allstarteams' | 'imaginal-agility';
  requiredWatchPercentage: number;
  nextStepId?: string;
  unlockDelay?: number; // Optional delay in seconds before unlocking
}

export interface ModeSpecificConfig {
  student: VideoUnlockConfig;
  professional: VideoUnlockConfig;
}

// Default configurations for AllStarTeams workshop
export const allStarTeamsVideoConfig: Record<string, VideoUnlockConfig | ModeSpecificConfig> = {
  '1-1': {
    // Mode-specific requirements for introduction video
    student: {
      stepId: '1-1',
      workshopType: 'allstarteams',
      requiredWatchPercentage: 50, // Students only need 50%
      nextStepId: '2-1'
    },
    professional: {
      stepId: '1-1', 
      workshopType: 'allstarteams',
      requiredWatchPercentage: 75, // Professionals need 75%
      nextStepId: '2-1'
    }
  },
  '2-1': {
    stepId: '2-1',
    workshopType: 'allstarteams',
    requiredWatchPercentage: 60, // Same for both modes
    nextStepId: '3-1'
  },
  '3-1': {
    stepId: '3-1',
    workshopType: 'allstarteams', 
    requiredWatchPercentage: 70,
    nextStepId: '4-1'
  },
  '4-1': {
    stepId: '4-1',
    workshopType: 'allstarteams',
    requiredWatchPercentage: 80,
    nextStepId: '4-4'
  },
  '4-4': {
    stepId: '4-4',
    workshopType: 'allstarteams',
    requiredWatchPercentage: 90, // Final video requires full viewing
    // No nextStepId - this is the end
  }
};

// Default configurations for Imaginal Agility workshop
export const imaginalAgilityVideoConfig: Record<string, VideoUnlockConfig | ModeSpecificConfig> = {
  'ia-1-1': {
    student: {
      stepId: 'ia-1-1',
      workshopType: 'imaginal-agility',
      requiredWatchPercentage: 40,
      nextStepId: 'ia-2-1'
    },
    professional: {
      stepId: 'ia-1-1',
      workshopType: 'imaginal-agility', 
      requiredWatchPercentage: 70,
      nextStepId: 'ia-2-1'
    }
  },
  'ia-2-1': {
    stepId: 'ia-2-1',
    workshopType: 'imaginal-agility',
    requiredWatchPercentage: 65,
    nextStepId: 'ia-3-1'
  },
  'ia-3-1': {
    stepId: 'ia-3-1',
    workshopType: 'imaginal-agility',
    requiredWatchPercentage: 75
    // Final step
  }
};

// Helper function to get video requirements for a specific user
export function getVideoRequirements(
  stepId: string, 
  workshopType: 'allstarteams' | 'imaginal-agility',
  userMode: 'student' | 'professional' = 'professional'
): VideoUnlockConfig | null {
  
  const config = workshopType === 'allstarteams' 
    ? allStarTeamsVideoConfig 
    : imaginalAgilityVideoConfig;
    
  const stepConfig = config[stepId];
  
  if (!stepConfig) {
    return null;
  }
  
  // Check if it's a mode-specific config
  if ('student' in stepConfig && 'professional' in stepConfig) {
    return stepConfig[userMode];
  }
  
  // Return the general config
  return stepConfig as VideoUnlockConfig;
}

// Helper function to check if user can proceed to next step
export function canProceedToNextStep(
  stepId: string,
  watchedPercentage: number,
  workshopType: 'allstarteams' | 'imaginal-agility',
  userMode: 'student' | 'professional' = 'professional'
): { canProceed: boolean; nextStepId?: string; requirementMet: boolean } {
  
  const requirements = getVideoRequirements(stepId, workshopType, userMode);
  
  if (!requirements) {
    // No video requirements for this step, allow proceeding
    return { canProceed: true, requirementMet: true };
  }
  
  const requirementMet = watchedPercentage >= requirements.requiredWatchPercentage;
  
  return {
    canProceed: requirementMet,
    nextStepId: requirements.nextStepId,
    requirementMet
  };
}

// Helper function for admin interface to get default requirements
export function getDefaultRequirements(
  workshopType: 'allstarteams' | 'imaginal-agility',
  userMode: 'student' | 'professional' = 'professional'
): number {
  // Default watch percentages by mode
  const defaults = {
    student: 50,
    professional: 75
  };
  
  return defaults[userMode];
}

// Export configuration for admin interface
export const videoManagementConfig = {
  allStarTeamsVideoConfig,
  imaginalAgilityVideoConfig,
  getVideoRequirements,
  canProceedToNextStep,
  getDefaultRequirements
};
