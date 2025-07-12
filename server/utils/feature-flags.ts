// Feature flag system for safe development and deployment
export interface FeatureFlag {
  enabled: boolean;
  environment: 'development' | 'production' | 'both';
  description: string;
}

export const featureFlags: Record<string, FeatureFlag> = {
  workshopLocking: {
    enabled: true,
    environment: 'development',
    description: 'Lock workshop inputs after completion'
  },
  holisticReports: {
    enabled: false, 
    environment: 'development',
    description: 'Claude API-powered personalized reports'
  },
  facilitatorConsole: {
    enabled: false,
    environment: 'development', 
    description: 'Facilitator cohort management system'
  }
};

export function isFeatureEnabled(featureName: string, environment?: string): boolean {
  const flag = featureFlags[featureName];
  if (!flag) return false;
  
  const currentEnv = environment || process.env.ENVIRONMENT || 'production';
  
  return flag.enabled && (
    flag.environment === 'both' || 
    flag.environment === currentEnv
  );
}