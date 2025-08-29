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
  expanded: boolean;
  steps: IANavigationStep[];
}

// Imaginal Agility navigation - 8-section hierarchical menu with 28 steps
export const imaginalAgilityNavigationSections: IANavigationSection[] = [
  {
    id: '1',
    title: 'WELCOME',
    expanded: true, // Default expanded
    steps: [
      { 
        id: 'ia-1-1', 
        title: 'Orientation', 
        type: 'video',
        contentKey: 'ia-1-1'
      },
      { 
        id: 'ia-1-2', 
        title: 'AI\'s 4X Mental Challenge', 
        type: 'video',
        contentKey: 'ia-1-2'
      }
    ]
  },
  {
    id: '2',
    title: 'THE I4C MODEL',
    expanded: true, // Default expanded
    steps: [
      { 
        id: 'ia-2-1', 
        title: 'I4C Prism Overview', 
        type: 'video',
        contentKey: 'ia-2-1'
      },
      { 
        id: 'ia-2-2', 
        title: 'Self-Assessment', 
        type: 'assessment',
        contentKey: 'ia-2-2'
      }
    ]
  },
  {
    id: '3',
    title: 'LADDER OF IMAGINATION',
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
    expanded: false, // Default collapsed
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
    title: 'OUTCOMES & BENEFITS',
    expanded: false, // Default collapsed
    steps: [
      { 
        id: 'ia-5-1', 
        title: 'Overview', 
        type: 'video',
        contentKey: 'ia-5-1'
      }
      // Other steps temporarily hidden
      // { 
      //   id: 'ia-5-2', 
      //   title: 'ROI 2.0', 
      //   type: 'viewing',
      //   contentKey: 'ia-5-2'
      // },
      // { 
      //   id: 'ia-5-3', 
      //   title: 'Course Completion Badge', 
      //   type: 'achievement',
      //   contentKey: 'ia-5-3'
      // },
      // { 
      //   id: 'ia-5-4', 
      //   title: 'Imaginal Agility Compendium', 
      //   type: 'download',
      //   contentKey: 'ia-5-4'
      // },
      // { 
      //   id: 'ia-5-5', 
      //   title: 'Community of Practice', 
      //   type: 'collaboration',
      //   contentKey: 'ia-5-5'
      // }
    ]
  },
  {
    id: '6',
    title: 'QUARTERLY TUNE-UP',
    expanded: false, // Default collapsed
    steps: [
      { 
        id: 'ia-6-1', 
        title: 'Teamwork Preparation', 
        type: 'video',
        contentKey: 'ia-6-1'
      },
      { 
        id: 'ia-6-coming-soon', 
        title: 'Coming Soon', 
        type: 'coming-soon',
        contentKey: 'ia-6-coming-soon'
      }
      // ia-6-2 remains hidden for now
      // { 
      //   id: 'ia-6-2', 
      //   title: 'Practices', 
      //   type: 'interactive',
      //   contentKey: 'ia-6-2'
      // }
    ]
  },
  {
    id: '7',
    title: 'TEAM LADDER OF IMAGINATION',
    expanded: false, // Expanded only after ia-4-6 completion
    steps: [
      { 
        id: 'ia-7-1', 
        title: 'Welcome', 
        type: 'video',
        contentKey: 'ia-7-1'
      },
      { 
        id: 'ia-7-2', 
        title: 'Team Whiteboard Workspace', 
        type: 'interactive',
        contentKey: 'ia-7-2'
      }
    ]
  },
  // TEMPORARILY HIDDEN - Section 8 will be enabled later
  // {
  //   id: '8',
  //   title: 'MORE INFO',
  //   expanded: false, // Default collapsed
  //   steps: [
  //     { 
  //       id: 'ia-8-1', 
  //       title: 'The Neuroscience of Imagination', 
  //       type: 'video',
  //       contentKey: 'ia-8-1'
  //     },
  //     { 
  //       id: 'ia-8-2', 
  //       title: 'About Heliotrope Imaginal', 
  //       type: 'video',
  //       contentKey: 'ia-8-2'
  //     }
  //   ]
  // }
];

// All Star Teams navigation sections
export const allStarTeamsNavigationSections = [
  {
    id: '1',
    title: 'GETTING STARTED',
    moduleNumber: 1,
    steps: [
      { id: '1-1', title: 'On Self-Awareness', type: 'video' },
      { id: '1-2', title: 'Positive Psychology', type: 'video' },
      { id: '1-3', title: 'About this Course', type: 'video' }
    ]
  },
  {
    id: '2',
    title: 'STRENGTH AND FLOW',
    moduleNumber: 2,
    steps: [
      { id: '2-1', title: 'Star Strengths Assessment', type: 'video' },
      { id: '3-1', title: 'Flow Patterns', type: 'video' },
      { id: '3-2', title: 'Rounding Out', type: 'reflection' },
      { id: '3-3', title: 'Module 2 Recap', type: 'adding' }
    ]
  },
  {
    id: '4',
    title: 'VISUALIZE YOUR POTENTIAL',
    moduleNumber: 3,
    steps: [
      { id: '4-1', title: 'Ladder of Well-being', type: 'interactive' },
      { id: '4-2', title: 'Well-being Reflections', type: 'video' },
      { id: '4-3', title: 'Visualizing You', type: 'visual' },
      { id: '4-4', title: 'Your Future Self', type: 'reflection' },
      { id: '4-5', title: 'Final Reflection', type: 'reflection' }
    ]
  },
  {
    id: '5',
    title: 'TAKEAWAYS & NEXT STEPS',
    moduleNumber: 4,
    steps: [
      { id: '5-1', title: 'Download your Star Card', type: 'download' },
      { id: '5-2', title: 'Your Holistic Report', type: 'download' },
      { id: '5-3', title: 'Growth Plan (Preview)', type: 'planning' },
      { id: '5-4', title: 'Team Workshop Prep (Preview)', type: 'collaboration' }
    ]
  },
  {
    id: '6',
    title: 'MORE INFORMATION',
    moduleNumber: 5,
    steps: [
      { id: '6-1', title: 'More about AllStarTeams', type: 'resources' }
    ]
  }
];

// Default export for backward compatibility
export const navigationSections = allStarTeamsNavigationSections;
