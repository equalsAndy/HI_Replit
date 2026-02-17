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
        title: 'Overview',
        type: 'video',
        contentKey: 'ia-1-1'
      },
      {
        id: 'ia-1-2',
        title: 'What Is Imagination?',
        type: 'video',
        contentKey: 'ia-1-2'
      },
      {
        id: 'ia-1-3',
        title: 'Imagination Deficit',
        type: 'video',
        contentKey: 'ia-1-3'
      },
      {
        id: 'ia-1-4',
        title: 'The Bigger Picture',
        type: 'video',
        contentKey: 'ia-1-4'
      },
      {
        id: 'ia-1-5',
        title: 'Extra: Reality and Words',
        type: 'interactive',
        contentKey: 'ia-1-5'
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
        title: 'Prism Reflection',
        type: 'assessment',
        contentKey: 'ia-2-2'
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
        title: 'Inspiration Support',
        type: 'reflection',
        contentKey: 'ia-4-5'
      },
      {
        id: 'ia-4-6',
        title: 'Nothing is Unimaginable',
        type: 'video',
        contentKey: 'ia-4-6'
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
        id: 'ia-5-1',
        title: 'Imaginal Agility Matrix',
        type: 'video',
        contentKey: 'ia-5-1'
      },
      {
        id: 'ia-5-2',
        title: 'Capability Commitment',
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
        id: 'ia-5-4',
        title: 'HaiQ',
        type: 'interactive',
        contentKey: 'ia-5-4'
      },
      {
        id: 'ia-5-5',
        title: 'Development Arc',
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
      { id: '5-2', title: 'Beyond AST', type: 'resources', contentKey: 'extra-stuff' }, // Content: BeyondASTView
      { id: '5-3', title: 'Introducing Imaginal Agility', type: 'resources', contentKey: 'more-imaginal-agility' } // Content: IntroIAView
    ]
  }
];

// Default export for backward compatibility
export const navigationSections = allStarTeamsNavigationSections;
