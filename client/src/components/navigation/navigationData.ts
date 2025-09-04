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

// All Star Teams navigation sections - 5 Module Structure (RENUMBERED)
export const allStarTeamsNavigationSections = [
  {
    id: '1',
    title: 'MODULE 1: GETTING STARTED',
    moduleNumber: 1,
    steps: [
      { id: '1-1', title: 'On Self-Awareness', type: 'video' }, // Content unchanged
      { id: '1-2', title: 'The Self-Awareness Opportunity', type: 'video' }, // Content unchanged
      { id: '1-3', title: 'About this Course', type: 'video' } // Content unchanged
    ]
  },
  {
    id: '2',
    title: 'MODULE 2: STRENGTH AND FLOW',
    moduleNumber: 2,
    steps: [
      { id: '2-1', title: 'Star Strengths Assessment', type: 'video' }, // Content unchanged
      { id: '2-2', title: 'Flow Patterns', type: 'video' }, // Content: OLD 3-1 "Flow Patterns"
      { id: '2-3', title: 'Your Future Self', type: 'reflection' }, // Content: OLD 4-4 "Your Future Self"
      { id: '2-4', title: 'Module 2 Recap', type: 'recap' } // Content: PLACEHOLDER
    ]
  },
  {
    id: '3',
    title: 'MODULE 3: VISUALIZE YOUR POTENTIAL',
    moduleNumber: 3,
    steps: [
      { id: '3-1', title: 'Well-Being Ladder', type: 'interactive' }, // Content: OLD 4-1 "Well-Being Ladder"
      { id: '3-2', title: 'Rounding Out', type: 'reflection' }, // Content: OLD 3-2 "Rounding Out"
      { id: '3-3', title: 'Final Reflections', type: 'reflection' }, // Content: OLD 4-5 "Final Reflections"
      { id: '3-4', title: 'Finish Workshop', type: 'completion' } // Content: NEW completion component
    ]
  },
  {
    id: '4',
    title: 'MODULE 4: TAKEAWAYS & NEXT STEPS',
    moduleNumber: 4,
    expanded: false, // Unlocked after Module 3 completion
    steps: [
      { id: '4-1', title: 'Download your Star Card', type: 'download' }, // Content: OLD 5-1
      { id: '4-2', title: 'Your Holistic Report', type: 'download' }, // Content: OLD 5-2
      { id: '4-3', title: 'Growth Plan', type: 'planning' }, // Content: OLD 5-3
      { id: '4-4', title: 'Team Workshop Prep', type: 'collaboration' } // Content: OLD 5-4
    ]
  },
  {
    id: '5',
    title: 'MODULE 5: MORE INFORMATION',
    moduleNumber: 5,
    expanded: false, // Unlocked after Module 3 completion
    steps: [
      { id: '5-1', title: 'More about AllStarTeams', type: 'resources' }, // Content: OLD 6-1
      { id: '5-2', title: 'Interesting Extra Stuff', type: 'resources' }, // Content: PLACEHOLDER
      { id: '5-3', title: 'Introducing Imaginal Agility', type: 'resources' } // Content: PLACEHOLDER
    ]
  }
];

// Default export for backward compatibility
export const navigationSections = allStarTeamsNavigationSections;
