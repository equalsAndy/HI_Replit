import { 
  StarIcon, BarChartIcon, Activity, Sparkles, BookOpen,
  LightbulbIcon, Braces, Users, Puzzle, Book, Zap, PenTool,
  Download, Calendar, Brain, Play
} from 'lucide-react';

// Imaginal Agility navigation - Single collapsible menu with all steps
export const imaginalAgilityNavigationSections = [
  {
    id: '1',
    title: 'IMAGINAL AGILITY WORKSHOP',
    steps: [
      { 
        id: 'ia-1-1', 
        title: 'Introduction to Imaginal Agility', 
        type: 'video',
        contentKey: 'ia-1-1'
      },
      { 
        id: 'ia-2-1', 
        title: 'The Triple Challenge', 
        type: 'video',
        contentKey: 'ia-2-1'
      },
      { 
        id: 'ia-3-1', 
        title: 'The Imaginal Agility Solution', 
        type: 'video',
        contentKey: 'ia-3-1'
      },
      { 
        id: 'ia-4-1', 
        title: 'Self-Assessment', 
        type: 'assessment',
        contentKey: 'ia-4-1'
      },
      { 
        id: 'ia-5-1', 
        title: 'Assessment Results', 
        type: 'viewing',
        contentKey: 'ia-5-1'
      },
      { 
        id: 'ia-6-1', 
        title: 'Teamwork Preparation', 
        type: 'collaboration',
        contentKey: 'ia-6-1'
      },
      { 
        id: 'ia-8-1', 
        title: 'Neuroscience', 
        type: 'video',
        contentKey: 'ia-8-1'
      }
    ]
  }
];

// AllStarTeams navigation sections (corrected structure)
export const allStarTeamsNavigationSections = [
  {
    id: '1',
    title: '', // No title for introduction section
    steps: [
      { id: '1-1', title: 'Introduction', type: 'video' }
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