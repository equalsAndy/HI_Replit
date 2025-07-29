// Client-side feature flag utilities
export interface ClientFeatureFlag {
  enabled: boolean;
  environment: 'development' | 'staging' | 'production' | 'all';
  description: string;
}

// Client feature flags (sync with server flags where needed)
export const clientFeatureFlags: Record<string, ClientFeatureFlag> = {
  debugPanel: {
    enabled: import.meta.env.VITE_FEATURE_DEBUG_PANEL === 'true',
    environment: 'development',
    description: 'Development debugging panel and tools'
  },
  feedbackSystem: {
    enabled: true, // Always enabled - will check environment in isFeatureEnabled
    environment: 'staging', 
    description: 'User feedback collection and management system'
  },
  videoManagement: {
    enabled: true,
    environment: 'all',
    description: 'Enhanced video management features'
  },
  reflectionModal: {
    enabled: true, // Re-enabled until chat popup is ready
    environment: 'all',
    description: 'Original modal-based Reflection Talia interface'
  }
};

export function isFeatureEnabled(featureName: string): boolean {
  const flag = clientFeatureFlags[featureName];
  if (!flag) return false;
  
  // Use import.meta.env for environment detection to avoid fetch loops
  const currentEnv = import.meta.env.NODE_ENV || 'production';
  
  // For feedback system, enable in development and staging
  if (featureName === 'feedbackSystem') {
    const isDev = window.location.hostname === 'localhost' || 
                  window.location.hostname === '127.0.0.1' ||
                  window.location.port === '8080';
    const isStaging = window.location.hostname === '34.220.143.127' ||
                      window.location.hostname.includes('staging');
    return isDev || isStaging;
  }
  
  // Check if feature is enabled for current environment
  const environmentMatch = flag.environment === 'all' || flag.environment === currentEnv;
  
  return flag.enabled && environmentMatch;
}

// Get current environment
export function getCurrentEnvironment(): string {
  return import.meta.env.NODE_ENV || 'production';
}

// Check if we're in development mode
export function isDevelopment(): boolean {
  return import.meta.env.NODE_ENV === 'development';
}

// Get all enabled features for current environment
export function getEnabledFeatures(): string[] {
  return Object.entries(clientFeatureFlags)
    .filter(([name]) => isFeatureEnabled(name))
    .map(([name]) => name);
}