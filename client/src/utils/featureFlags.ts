// src/utils/featureFlags.ts

// Detect environment
export function getEnvironment(): 'development' | 'staging' | 'production' {
  if (
    typeof window !== 'undefined' &&
    window.location.hostname.includes('localhost')
  ) {
    return 'development';
  }
  if (
    typeof window !== 'undefined' &&
    window.location.hostname.includes('app2.heliotropeimaginal.com')
  ) {
    return 'staging';
  }
  if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
    return 'development';
  }
  return 'production';
}

// Feature flag config
export const featureFlags: {
  showEnvironmentBadge: boolean;
  environmentBadgeType: 'DEV' | 'STAGING' | null;
} = {
  showEnvironmentBadge: getEnvironment() !== 'production',
  environmentBadgeType:
    getEnvironment() === 'development'
      ? 'DEV'
      : getEnvironment() === 'staging'
      ? 'STAGING'
      : null,
};

// Helper to check if a feature is enabled
export function isFeatureEnabled(flagName: keyof typeof featureFlags): boolean {
  return Boolean(featureFlags[flagName]);
}

// Helper to get the environment badge type
export function getEnvironmentBadge(): 'DEV' | 'STAGING' | null {
  return featureFlags.environmentBadgeType;
}
