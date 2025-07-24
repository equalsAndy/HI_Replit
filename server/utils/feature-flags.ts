// Feature flag system for safe development and deployment
export interface FeatureFlag {
  enabled: boolean;
  environment: 'development' | 'staging' | 'production' | 'all';
  description: string;
  dependencies?: string[];
  aiRelated?: boolean;
}

export const featureFlags: Record<string, FeatureFlag> = {
  workshopLocking: {
    enabled: true,
    environment: 'staging',
    description: 'Lock workshop inputs after completion'
  },
  holisticReports: {
    enabled: false, 
    environment: 'development',
    description: 'Claude API-powered personalized reports',
    aiRelated: true
  },
  facilitatorConsole: {
    enabled: true,
    environment: 'staging', 
    description: 'Facilitator cohort management system'
  },
  aiCoaching: {
    enabled: false,
    environment: 'development',
    description: 'AI-powered coaching chatbot system',
    aiRelated: true,
    dependencies: ['holisticReports']
  },
  videoManagement: {
    enabled: true,
    environment: 'all',
    description: 'Enhanced video management and progress tracking'
  },
  debugPanel: {
    enabled: true,
    environment: 'development',
    description: 'Development debugging panel and tools'
  }
};

export function isFeatureEnabled(featureName: string, environment?: string): boolean {
  const flag = featureFlags[featureName];
  if (!flag) return false;
  
  const currentEnv = environment || process.env.ENVIRONMENT || 'production';
  
  // Check if feature is enabled for current environment
  const environmentMatch = flag.environment === 'all' || flag.environment === currentEnv;
  
  // Check dependencies if they exist
  if (flag.dependencies && flag.dependencies.length > 0) {
    const dependenciesMet = flag.dependencies.every(dep => isFeatureEnabled(dep, environment));
    return flag.enabled && environmentMatch && dependenciesMet;
  }
  
  return flag.enabled && environmentMatch;
}

export function validateFlagConfiguration(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check for circular dependencies
  const checkCircularDeps = (flagName: string, visited: Set<string> = new Set()): boolean => {
    if (visited.has(flagName)) {
      errors.push(`Circular dependency detected involving flag: ${flagName}`);
      return false;
    }
    
    const flag = featureFlags[flagName];
    if (!flag?.dependencies) return true;
    
    visited.add(flagName);
    
    for (const dep of flag.dependencies) {
      if (!featureFlags[dep]) {
        errors.push(`Flag '${flagName}' depends on non-existent flag '${dep}'`);
        return false;
      }
      if (!checkCircularDeps(dep, new Set(visited))) {
        return false;
      }
    }
    
    return true;
  };
  
  // Check each flag
  for (const [flagName, flag] of Object.entries(featureFlags)) {
    // Validate environment values
    const validEnvironments = ['development', 'staging', 'production', 'all'];
    if (!validEnvironments.includes(flag.environment)) {
      errors.push(`Invalid environment '${flag.environment}' for flag '${flagName}'`);
    }
    
    // Check dependencies
    if (flag.dependencies) {
      for (const dep of flag.dependencies) {
        if (!featureFlags[dep]) {
          errors.push(`Flag '${flagName}' depends on non-existent flag '${dep}'`);
        }
      }
      checkCircularDeps(flagName);
    }
  }
  
  return { valid: errors.length === 0, errors };
}

export function getAIFeatures(): Record<string, FeatureFlag> {
  return Object.fromEntries(
    Object.entries(featureFlags).filter(([_, flag]) => flag.aiRelated)
  );
}

export function getFlagsByEnvironment(environment: string): Record<string, boolean> {
  return Object.fromEntries(
    Object.entries(featureFlags).map(([name]) => [
      name,
      isFeatureEnabled(name, environment)
    ])
  );
}