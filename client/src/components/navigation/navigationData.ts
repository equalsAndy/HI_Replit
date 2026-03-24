import {
  StarIcon, BarChartIcon, Activity, Sparkles, BookOpen,
  LightbulbIcon, Braces, Users, Puzzle, Book, Zap, PenTool,
  Download, Calendar, Brain, Play
} from 'lucide-react';

// Type definitions for Imaginal Agility navigation
export interface IANavigationStep {
  id: string;
  title: string;
  type: string;
  contentKey: string;
}

export interface IANavigationSection {
  id: string;
  title: string;
  moduleNumber?: number; // Added for module badges
  expanded: boolean;
  steps: IANavigationStep[];
}

// Imaginal Agility navigation - 7-section hierarchical menu
export const imaginalAgilityNavigationSections: IANavigationSection[] = [
  {
    id: '1',
    title: 'WELCOME',
    moduleNumber: 1, // Added module badge
    expanded: true, // Default expanded
    steps: [
      {
        id: 'ia-1-1',
        title: 'Welcome',
        type: 'video',
        contentKey: 'ia-1-1'
      },
      {
        id: 'ia-1-2',
        title: 'Your Imagination: Always On',
        type: 'video',
        contentKey: 'ia-1-2'
      },
      {
        id: 'ia-1-3',
        title: 'Why This Matters Now',
        type: 'video',
        contentKey: 'ia-1-3'
      },
      {
        id: 'ia-1-4',
        title: 'The Bigger Picture',
        type: 'video',
        contentKey: 'ia-1-4',
        hidden: true
      }
    ]
  },
  {
    id: '2',
    title: 'THE i4C MODEL',
    moduleNumber: 2, // Added module badge
    expanded: true, // Default expanded
    steps: [
      {
        id: 'ia-2-1',
        title: 'i4C Prism Overview',
        type: 'video',
        contentKey: 'ia-2-1'
      },
      {
        id: 'ia-2-2',
        title: 'Understanding Your Capabilities',
        type: 'interactive',
        contentKey: 'ia-2-2'
      },
      {
        id: 'ia-2-3',
        title: 'Your Prism',
        type: 'assessment',
        contentKey: 'ia-2-3'
      }
    ]
  },
  {
    id: '3',
    title: 'LADDER OF IMAGINATION',
    moduleNumber: 3, // Added module badge
    expanded: true, // Default expanded
    steps: [
      {
        id: 'ia-3-1',
        title: 'Ladder Overview',
        type: 'video',
        contentKey: 'ia-3-1'
      },
      {
        id: 'ia-3-2',
        title: 'Autoflow',
        type: 'interactive',
        contentKey: 'ia-3-2'
      },
      {
        id: 'ia-3-3',
        title: 'Visualizing Your Potential',
        type: 'interactive',
        contentKey: 'ia-3-3'
      },
      {
        id: 'ia-3-4',
        title: 'From Insight to Intention',
        type: 'reflection',
        contentKey: 'ia-3-4'
      },
      {
        id: 'ia-3-5',
        title: 'Inspiration',
        type: 'reflection',
        contentKey: 'ia-3-5'
      },
      {
        id: 'ia-3-6',
        title: 'The Unimaginable',
        type: 'video',
        contentKey: 'ia-3-6'
      },
      {
        id: 'ia-3-7',
        title: 'Module 3 Reflection',
        type: 'reflection',
        contentKey: 'ia-3-7'
      }
    ]
  },
  {
    id: '4',
    title: 'ADVANCED LADDER OF IMAGINATION',
    moduleNumber: 4,
    expanded: false, // Opens when section 2 completes
    steps: [
      {
        id: 'ia-4-1',
        title: 'Advanced Ladder Overview',
        type: 'video',
        contentKey: 'ia-4-1'
      },
      {
        id: 'ia-4-2',
        title: 'Autoflow Mindful Prompts',
        type: 'interactive',
        contentKey: 'ia-4-2'
      },
      {
        id: 'ia-4-3',
        title: 'Visualization Stretch',
        type: 'interactive',
        contentKey: 'ia-4-3'
      },
      {
        id: 'ia-4-4',
        title: 'Higher Purpose Uplift',
        type: 'reflection',
        contentKey: 'ia-4-4'
      },
      {
        id: 'ia-4-5',
        title: 'Inviting the Muse',
        type: 'reflection',
        contentKey: 'ia-4-5'
      },
      {
        id: 'ia-4-6',
        title: 'Nothing is Unimaginable',
        type: 'video',
        contentKey: 'ia-4-6'
      },
      {
        id: 'ia-4-7',
        title: 'Module 4 Reflection',
        type: 'reflection',
        contentKey: 'ia-4-7'
      }
    ]
  },
  {
    id: '5',
    title: 'REVIEW & PLAN',
    moduleNumber: 5,
    expanded: false,
    steps: [
      {
        id: 'ia-5-4',
        title: 'HaiQ',
        type: 'interactive',
        contentKey: 'ia-5-4'
      },
      {
        id: 'ia-5-1',
        title: 'Your Capability Matrix',
        type: 'video',
        contentKey: 'ia-5-1'
      },
      {
        id: 'ia-5-2',
        title: 'Choose Your Focus',
        type: 'video',
        contentKey: 'ia-5-2'
      },
      {
        id: 'ia-5-3',
        title: 'Monthly Signal',
        type: 'video',
        contentKey: 'ia-5-3'
      },
      {
        id: 'ia-5-5',
        title: 'Your Development Path',
        type: 'interactive',
        contentKey: 'ia-5-5'
      }
    ]
  },
  {
    id: '6',
    title: 'TEAMWORK',
    expanded: false,
    steps: [
      {
        id: 'ia-6-1',
        title: 'Team Ladder',
        type: 'video',
        contentKey: 'ia-6-1'
      },
      {
        id: 'ia-6-2',
        title: 'Team Whiteboard',
        type: 'interactive',
        contentKey: 'ia-6-2'
      }
    ]
  },
  {
    id: '7',
    title: 'ORGANIZATION',
    expanded: false,
    steps: [
      {
        id: 'ia-7-1',
        title: 'New Paradigm',
        type: 'educational',
        contentKey: 'ia-7-1'
      }
    ]
  }
];

// All Star Teams navigation sections - 5 Module Structure (RENUMBERED)
export const allStarTeamsNavigationSections = [
  {
    id: '1',
    title: 'GETTING STARTED',
    moduleNumber: 1,
    steps: [
      { id: '1-1', title: 'The Self-Awareness Gap', type: 'video' }, // Content unchanged
      { id: '1-2', title: 'The Self-Awareness Opportunity', type: 'video' }, // Content unchanged
      { id: '1-3', title: 'About this Course', type: 'video' } // Content unchanged
    ]
  },
  {
    id: '2',
    title: 'STRENGTH AND FLOW',
    moduleNumber: 2,
    steps: [
      { id: '2-1', title: 'Star Strengths Assessment', type: 'video' }, // Content unchanged
      { id: '2-2', title: 'Flow Patterns', type: 'video' }, // Content: OLD 3-1 "Flow Patterns"
      { id: '2-4', title: 'Module 2 Recap', type: 'recap' } // Content: PLACEHOLDER
    ]
  },
  {
    id: '3',
    title: 'VISUALIZE YOUR POTENTIAL',
    moduleNumber: 3,
    steps: [
      { id: '3-1', title: 'Well-Being Ladder', type: 'interactive' }, // Content: OLD 4-1 "Well-Being Ladder"
      { id: '3-2', title: 'Your Future Self', type: 'reflection' }, // Content: OLD 4-4 "Your Future Self"
      { id: '3-3', title: 'One Insight', type: 'reflection' }, // Content: OLD 4-5 "Final Reflections"
      { id: '3-4', title: 'Workshop Recap', type: 'completion' } // Content: NEW completion component
    ]
  },
  {
    id: '4',
    title: 'TAKEAWAYS & NEXT STEPS',
    moduleNumber: 4,
    expanded: false, // Unlocked after Module 3 completion
    steps: [
      { id: '4-1', title: 'Download your Star Card', type: 'download' }, // Content: OLD 5-1
      { id: '4-2', title: 'Your Holistic Report', type: 'download' }, // Content: OLD 5-2
      { id: '4-3', title: 'Growth Plan', type: 'planning' }, // Content: OLD 5-3
      { id: '4-4', title: 'Team Workshop', type: 'collaboration' } // Content: OLD 5-4
    ]
  },
  {
    id: '5',
    title: 'MORE INFORMATION',
    moduleNumber: 5,
    expanded: false, // Unlocked after Module 3 completion
    steps: [
      { id: '5-1', title: 'More about AllStarTeams', type: 'resources', contentKey: 'workshop-resources' }, // Content: OLD 6-1
      { id: '5-2', title: 'Beyond AST', type: 'resources', contentKey: 'extra-stuff' }, // Content: PersonalProfileContainer (admins) / BeyondASTView (non-admins)
      { id: '5-3', title: 'Introducing Imaginal Agility', type: 'resources', contentKey: 'more-imaginal-agility' } // Content: IntroIAView
    ]
  }
];

// Product Mindset navigation - 5-module structure
export const productMindsetNavigationSections: IANavigationSection[] = [
  {
    id: '1',
    title: 'THE PRODUCT MINDSET',
    moduleNumber: 1,
    expanded: true,
    steps: [
      { id: 'pm-1-1', title: 'Welcome', type: 'video', contentKey: 'pm-1-1' },
      { id: 'pm-1-2', title: 'About You', type: 'interactive', contentKey: 'pm-1-2' },
      { id: 'pm-1-3', title: 'Everything is a Product', type: 'video', contentKey: 'pm-1-3' },
      { id: 'pm-1-4', title: 'The Missing Training', type: 'video', contentKey: 'pm-1-4' },
      { id: 'pm-1-5', title: 'Why Now', type: 'video', contentKey: 'pm-1-5' },
      { id: 'pm-1-6', title: 'Your Product Mindset Profile', type: 'assessment', contentKey: 'pm-1-6' },
      { id: 'pm-1-7', title: 'Strengths & Flow', type: 'video', contentKey: 'pm-1-7' },
      { id: 'pm-1-8', title: 'Human Capabilities', type: 'video', contentKey: 'pm-1-8' },
    ]
  },
  {
    id: '2',
    title: 'THE PRODUCT ROLE',
    moduleNumber: 2,
    expanded: false,
    steps: [
      { id: 'pm-2-1', title: 'How Product People Think', type: 'video', contentKey: 'pm-2-1' },
      { id: 'pm-2-2', title: 'The Role Decomposed', type: 'interactive', contentKey: 'pm-2-2' },
      { id: 'pm-2-3', title: 'Everyone is a Product Manager', type: 'video', contentKey: 'pm-2-3' },
      { id: 'pm-2-4', title: 'Navigating Stakeholders', type: 'interactive', contentKey: 'pm-2-4' },
      { id: 'pm-2-5', title: 'Your Product Team with AI', type: 'video', contentKey: 'pm-2-5' },
      { id: 'pm-2-6', title: 'The Agreeable Assistant Trap', type: 'interactive', contentKey: 'pm-2-6' },
    ]
  },
  {
    id: '3',
    title: 'THE TRANSLATION PROBLEM',
    moduleNumber: 3,
    expanded: false,
    steps: [
      { id: 'pm-3-1', title: 'The Questions Product People Ask', type: 'video', contentKey: 'pm-3-1' },
      { id: 'pm-3-2', title: 'What is a Value Proposition?', type: 'video', contentKey: 'pm-3-2' },
      { id: 'pm-3-3', title: 'Internal vs External Customers', type: 'video', contentKey: 'pm-3-3' },
      { id: 'pm-3-4', title: 'The Delight vs Friction Gap', type: 'interactive', contentKey: 'pm-3-4' },
      { id: 'pm-3-5', title: 'Metrics Beyond Revenue', type: 'interactive', contentKey: 'pm-3-5' },
      { id: 'pm-3-6', title: 'The Design Squiggle', type: 'video', contentKey: 'pm-3-6' },
      { id: 'pm-3-7', title: 'Squiggle Variations', type: 'interactive', contentKey: 'pm-3-7' },
    ]
  },
  {
    id: '4',
    title: 'PRACTICE',
    moduleNumber: 4,
    expanded: false,
    steps: [
      { id: 'pm-4-1', title: 'Know Your User', type: 'interactive', contentKey: 'pm-4-1' },
      { id: 'pm-4-2', title: 'Frame the Real Problem', type: 'interactive', contentKey: 'pm-4-2' },
      { id: 'pm-4-3', title: 'Translate a Concept', type: 'interactive', contentKey: 'pm-4-3' },
      { id: 'pm-4-4', title: 'Prioritize with Constraints', type: 'interactive', contentKey: 'pm-4-4' },
      { id: 'pm-4-5', title: 'Test Your Thinking', type: 'interactive', contentKey: 'pm-4-5' },
    ]
  },
  {
    id: '5',
    title: 'YOUR TOOLKIT',
    moduleNumber: 5,
    expanded: false,
    steps: [
      { id: 'pm-5-1', title: 'How AI Uses Context', type: 'video', contentKey: 'pm-5-1' },
      { id: 'pm-5-2', title: 'Writing System Prompts', type: 'interactive', contentKey: 'pm-5-2' },
      { id: 'pm-5-3', title: 'Individual vs Team Setup', type: 'video', contentKey: 'pm-5-3' },
      { id: 'pm-5-4', title: 'Configure AI to Challenge You', type: 'interactive', contentKey: 'pm-5-4' },
      { id: 'pm-5-5', title: 'Meet the PM Coach', type: 'interactive', contentKey: 'pm-5-5' },
      { id: 'pm-5-6', title: 'What Changed', type: 'assessment', contentKey: 'pm-5-6' },
      { id: 'pm-5-7', title: 'Your Action Plan', type: 'interactive', contentKey: 'pm-5-7' },
    ]
  }
];

// Default export for backward compatibility
export const navigationSections = allStarTeamsNavigationSections;
