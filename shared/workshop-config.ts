export interface WorkshopConfig {
  /** Short identifier used in DB, URLs, and API calls: 'ast', 'ia', 'pm' */
  id: string;
  /** URL path segment: 'allstarteams', 'imaginal-agility', 'product-mindset' */
  urlSlug: string;
  /** Display name */
  name: string;
  /** Theme color name (Tailwind) */
  primaryColor: string;
  /** Gradient classes for UI cards and loading spinners */
  gradientFrom: string;
  gradientTo: string;
  /** User access field name on the users table */
  accessField: string;
  /** User completion field name on the users table */
  completionField: string;
  /** User completion timestamp field */
  completionTimestampField: string;
  /** Brief tagline for selection page */
  tagline: string;
  /** Brief description for selection page */
  description: string;
  /** Feature bullet points for selection page */
  features: string[];
  /** Default first step ID */
  defaultFirstStep: string;
  /** Whether this workshop is currently enabled/available */
  enabled: boolean;
}

export const WORKSHOP_CONFIGS: Record<string, WorkshopConfig> = {
  ast: {
    id: 'ast',
    urlSlug: 'allstarteams',
    name: 'AllStarTeams',
    primaryColor: 'indigo',
    gradientFrom: 'from-blue-50',
    gradientTo: 'to-blue-200',
    accessField: 'astAccess',
    completionField: 'astWorkshopCompleted',
    completionTimestampField: 'astCompletedAt',
    tagline: 'Discover Your Natural Strengths',
    description: 'Explore your unique talents and learn how to leverage them for peak performance. Develop self-awareness and build confidence in your natural abilities.',
    features: [
      'Personal strengths assessment',
      'Flow state patterns analysis',
      'Personalized star card',
    ],
    defaultFirstStep: '1-1',
    enabled: true,
  },
  ia: {
    id: 'ia',
    urlSlug: 'imaginal-agility',
    name: 'Imaginal Agility',
    primaryColor: 'purple',
    gradientFrom: 'from-purple-50',
    gradientTo: 'to-purple-200',
    accessField: 'iaAccess',
    completionField: 'iaWorkshopCompleted',
    completionTimestampField: 'iaCompletedAt',
    tagline: 'Accelerate Your Personal Growth',
    description: 'Transform your mindset and unlock new possibilities for growth. Develop agility in how you approach challenges and opportunities.',
    features: [
      'Mindset transformation exercises',
      'Adaptive learning strategies',
      'Growth acceleration techniques',
    ],
    defaultFirstStep: 'ia-1-1',
    enabled: true,
  },
  pm: {
    id: 'pm',
    urlSlug: 'product-mindset',
    name: 'Product Mindset',
    primaryColor: 'teal',
    gradientFrom: 'from-teal-50',
    gradientTo: 'to-teal-200',
    accessField: 'pmAccess',
    completionField: 'pmWorkshopCompleted',
    completionTimestampField: 'pmCompletedAt',
    tagline: 'Think Like a Product Person',
    description: 'Learn why product thinking is a universal competency — for every function, every team, and every initiative. Discover why frameworks need translation, practice with AI, and build your ongoing toolkit.',
    features: [
      'Product thinking for any role or function',
      'AI-powered practice exercises',
      'Your personal PM Coach',
    ],
    defaultFirstStep: 'pm-1-1',
    enabled: true,
  },
};

/** Get all enabled workshops */
export const getEnabledWorkshops = () =>
  Object.values(WORKSHOP_CONFIGS).filter(w => w.enabled);

/** Get all workshop IDs */
export const ALL_WORKSHOP_IDS = Object.keys(WORKSHOP_CONFIGS);

/** Type for workshop short IDs */
export type WorkshopId = keyof typeof WORKSHOP_CONFIGS;
