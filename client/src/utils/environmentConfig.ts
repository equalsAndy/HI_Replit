/**
 * Environment-based Configuration Utility
 * ======================================
 * Manages environment-specific feature visibility and access controls
 */

export type Environment = 'development' | 'staging' | 'production';

export interface AdminTabConfig {
  id: string;
  name: string;
  component: string;
  environments: Environment[];
  requiresAdmin?: boolean;
  icon?: string;
}

/**
 * Admin tab configurations with environment restrictions
 */
export const ADMIN_TABS: AdminTabConfig[] = [
  {
    id: 'users',
    name: 'User Management',
    component: 'UserManagement',
    environments: ['development', 'staging', 'production'],
    requiresAdmin: true,
    icon: 'Users'
  },
  {
    id: 'invites',
    name: 'Invite Management',
    component: 'InviteManagement', 
    environments: ['development', 'staging', 'production'],
    requiresAdmin: true,
    icon: 'UserPlus'
  },
  {
    id: 'videos',
    name: 'Video Management',
    component: 'SimpleVideoManagement',
    environments: ['development'], // Dev only for now
    requiresAdmin: true,
    icon: 'Video'
  },
  {
    id: 'ai',
    name: 'AI Management',
    component: 'AIManagement',
    environments: ['development', 'staging'], // Not ready for production
    requiresAdmin: true,
    icon: 'Bot'
  },
  {
    id: 'feedback',
    name: 'Feedback Management',
    component: 'FeedbackManagement',
    environments: ['development', 'staging', 'production'],
    requiresAdmin: true,
    icon: 'MessageSquare'
  }
];

/**
 * AI Management sub-tab configurations
 */
export const AI_SUB_TABS: AdminTabConfig[] = [
  {
    id: 'ai-management',
    name: 'AI Config',
    component: 'AIManagement',
    environments: ['development', 'staging'],
    requiresAdmin: true,
    icon: 'Settings'
  },
  {
    id: 'training-docs',
    name: 'Training Docs',
    component: 'TrainingDocumentsManagement',
    environments: ['development', 'staging'],
    requiresAdmin: true,
    icon: 'BookOpen'
  }
];

/**
 * Get current environment from window or default to development
 */
export const getCurrentEnvironment = (): Environment => {
  // Try to get from build-time environment variable
  const buildEnv = import.meta.env.VITE_NODE_ENV as Environment;
  if (buildEnv && ['development', 'staging', 'production'].includes(buildEnv)) {
    return buildEnv;
  }
  
  // Try to detect from URL
  const hostname = window.location.hostname;
  if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
    return 'development';
  } else if (hostname.includes('staging') || hostname.includes('app2')) {
    return 'staging';
  } else if (hostname.includes('app.heliotrope') || hostname.includes('production')) {
    return 'production';
  }
  
  // Default to development
  return 'development';
};

/**
 * Check if a tab should be visible in the current environment
 */
export const isTabVisible = (tab: AdminTabConfig, currentEnv: Environment): boolean => {
  return tab.environments.includes(currentEnv);
};

/**
 * Get filtered tabs for current environment
 */
export const getVisibleTabs = (tabs: AdminTabConfig[], currentEnv: Environment): AdminTabConfig[] => {
  return tabs.filter(tab => isTabVisible(tab, currentEnv));
};

/**
 * Get environment display info
 */
export const getEnvironmentInfo = (env: Environment) => {
  switch (env) {
    case 'development':
      return {
        name: 'Development',
        color: 'green',
        icon: '🔧',
        description: 'All features available for testing'
      };
    case 'staging':
      return {
        name: 'Staging',
        color: 'yellow',
        icon: '🚀',
        description: 'Pre-production testing environment'
      };
    case 'production':
      return {
        name: 'Production',
        color: 'red',
        icon: '🌐',
        description: 'Live production environment'
      };
    default:
      return {
        name: 'Unknown',
        color: 'gray',
        icon: '❓',
        description: 'Unknown environment'
      };
  }
};