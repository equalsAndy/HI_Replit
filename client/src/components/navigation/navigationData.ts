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

// Imaginal Agility navigation - 7-section hierarchical menu with 26 steps
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
        title: 'HaiQ', 
        type: 'assessment',
        contentKey: 'ia-5-1'
      },
      { 
        id: 'ia-5-2', 
        title: 'ROI 2.0', 
        type: 'viewing',
        contentKey: 'ia-5-2'
      },
      { 
        id: 'ia-5-3', 
        title: 'Course Completion Badge', 
        type: 'achievement',
        contentKey: 'ia-5-3'
      },
      { 
        id: 'ia-5-4', 
        title: 'Imaginal Agility Compendium', 
        type: 'download',
        contentKey: 'ia-5-4'
      },
      { 
        id: 'ia-5-5', 
        title: 'Community of Practice', 
        type: 'collaboration',
        contentKey: 'ia-5-5'
      }
    ]
  },
  {
    id: '6',
    title: 'QUARTERLY TUNE-UP',
    expanded: false, // Default collapsed
    steps: [
      { 
        id: 'ia-6-1', 
        title: 'Orientation', 
        type: 'video',
        contentKey: 'ia-6-1'
      },
      { 
        id: 'ia-6-2', 
        title: 'Practices', 
        type: 'interactive',
        contentKey: 'ia-6-2'
      }
    ]
  },
  {
    id: '7',
    title: 'ADDITIONAL INFO',
    expanded: false, // Default collapsed
    steps: [
      { 
        id: 'ia-7-1', 
        title: 'The Neuroscience of Imagination', 
        type: 'video',
        contentKey: 'ia-7-1'
      },
      { 
        id: 'ia-7-2', 
        title: 'About Heliotrope Imaginal', 
        type: 'video',
        contentKey: 'ia-7-2'
      }
    ]
  }
];

// All Star Teams navigation sections
export const allStarTeamsNavigationSections = [
  {
    id: '1',
    title: 'STAR',
    steps: [
      { id: '1-1', title: 'Introduction to Star Cards', type: 'video' }
    ]
  },
  {
    id: '2',
    title: 'DISCOVER YOUR STAR STRENGTHS',
    steps: [
      { id: '2-1', title: 'Intro to Star Strengths', type: 'video' },
      { id: '2-2', title: 'Star Strengths Self-Assessment', type: 'assessment' },
      { id: '2-3', title: 'Review Your Star Card', type: 'viewing' },
      { id: '2-4', title: 'Strength Reflection', type: 'reflection' }
    ]
  },
  {
    id: '3',
    title: 'IDENTIFY YOUR FLOW',
    steps: [
      { id: '3-1', title: 'Intro to Flow', type: 'video' },
      { id: '3-2', title: 'Flow Assessment', type: 'assessment' },
      { id: '3-3', title: 'Rounding Out', type: 'video' },
      { id: '3-4', title: 'Add Flow to Star Card', type: 'adding' }
    ]
  },
  {
    id: '4',
    title: 'VISUALIZE YOUR POTENTIAL',
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
    title: 'NEXT STEPS',
    steps: [
      { id: '5-1', title: 'Download your Star Card', type: 'download' },
      { id: '5-2', title: 'Your Holistic Report', type: 'download' },
      { id: '5-3', title: 'Growth Plan', type: 'planning' },
      { id: '5-4', title: 'Team Workshop Prep', type: 'collaboration' }
    ]
  },
  {
    id: '6',
    title: 'MORE INFORMATION',
    steps: [
      { id: '6-1', title: 'Workshop Resources', type: 'resources' }
    ]
  }
];

// Default export for backward compatibility
export const navigationSections = allStarTeamsNavigationSections;
