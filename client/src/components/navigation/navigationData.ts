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
        contentKey: 'imaginal-intro'
      },
      { 
        id: 'ia-2-1', 
        title: 'The Triple Challenge', 
        type: 'video',
        contentKey: 'triple-challenge'
      },
      { 
        id: 'ia-3-1', 
        title: 'Imagination and AI', 
        type: 'video',
        contentKey: 'imaginal-solution'
      },
      { 
        id: 'ia-4-1', 
        title: 'Self-Assessment', 
        type: 'assessment',
        contentKey: 'five-c-assessment'
      },
      { 
        id: 'ia-4-2', 
        title: 'Review Results', 
        type: 'content',
        contentKey: 'imagination-results'
      },
      { 
        id: 'ia-5-1', 
        title: 'Teamwork Preparation', 
        type: 'video',
        contentKey: 'teamwork-prep'
      },
      { 
        id: 'ia-6-1', 
        title: 'Reality Discernment', 
        type: 'video',
        contentKey: 'reality-discernment'
      },
      { 
        id: 'ia-7-1', 
        title: 'The Neuroscience', 
        type: 'video',
        contentKey: 'neuroscience'
      },
      { 
        id: 'ia-8-1', 
        title: 'Next Steps', 
        type: 'content',
        contentKey: 'next-steps'
      }
    ]
  }
];

// AllStarTeams navigation sections (existing)
export const allStarTeamsNavigationSections = [
  {
    id: '1',
    title: 'DISCOVER YOUR STAR STRENGTHS',
    steps: [
      { id: '1-1', title: 'Introduction', type: 'video' },
      { id: '2-1', title: 'Intro to Star Strengths', type: 'video' },
      { id: '2-2', title: 'Star Strengths Self-Assessment', type: 'assessment' },
      { id: '2-3', title: 'Review Your Star Card', type: 'content' },
      { id: '2-4', title: 'Strength Reflection', type: 'content' }
    ]
  },
  {
    id: '2',
    title: 'IDENTIFY YOUR FLOW',
    steps: [
      { id: '3-1', title: 'Intro to Flow', type: 'video' },
      { id: '3-2', title: 'Flow Assessment', type: 'assessment' },
      { id: '3-3', title: 'Rounding Out', type: 'content' },
      { id: '3-4', title: 'Add Flow to Star Card', type: 'content' }
    ]
  },
  {
    id: '3',
    title: 'VISUALIZE YOUR POTENTIAL',
    steps: [
      { id: '4-1', title: 'Ladder of Well-being', type: 'content' },
      { id: '4-2', title: 'Well-being Reflections', type: 'content' },
      { id: '4-3', title: 'Visualizing You', type: 'content' },
      { id: '4-4', title: 'Your Future Self', type: 'content' },
      { id: '4-5', title: 'Final Reflection', type: 'content' }
    ]
  },
  {
    id: '4',
    title: 'NEXT STEPS',
    steps: [
      { id: '5-1', title: 'Download your Star Card', type: 'content' },
      { id: '5-2', title: 'Your Holistic Report', type: 'content' },
      { id: '5-3', title: 'Growth Plan (coming soon)', type: 'content' },
      { id: '5-4', title: 'Team Workshop Prep', type: 'content' }
    ]
  },
  {
    id: '5',
    title: 'MORE INFORMATION',
    steps: [
      { id: '6-1', title: 'Workshop Resources', type: 'content' }
    ]
  }
];

// Default export for backward compatibility
export const navigationSections = allStarTeamsNavigationSections;