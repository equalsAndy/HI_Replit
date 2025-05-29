import { 
  StarIcon, BarChartIcon, Activity, Sparkles, BookOpen,
  LightbulbIcon, Braces, Users, Puzzle, Book, Zap, PenTool,
  Download, Calendar, Brain
} from 'lucide-react';
import { NavigationSection } from '@/shared/types';

// Imaginal Agility navigation sections
export const imaginalAgilityNavigationSections: NavigationSection[] = [
  {
    id: '1',
    title: 'Imaginal Agility Program',
    path: '/imaginal-agility/intro',
    totalSteps: 6,
    completedSteps: 0,
    steps: [
      { 
        id: '1-1', 
        label: 'Introduction to Imaginal Agility', 
        path: '/imaginal-agility/intro', 
        type: 'Learning', 
        contentKey: 'imaginal-intro',
        icon: Book,
        autoPlay: true,
        minWatchPercent: 1,
        locked: false // Only this step starts unlocked
      },
      { 
        id: '1-2', 
        label: 'The Triple Challenge', 
        path: '/imaginal-agility/triple-challenge', 
        type: 'Learning', 
        contentKey: 'triple-challenge',
        icon: Book,
        autoPlay: true,
        minWatchPercent: 1,
        locked: true
      },
      { 
        id: '1-3', 
        label: 'The Imaginal Agility Solution', 
        path: '/imaginal-agility/solution', 
        type: 'Learning', 
        contentKey: 'imaginal-solution',
        icon: Book,
        autoPlay: true,
        minWatchPercent: 1,
        locked: true
      },
      { 
        id: '1-4', 
        label: 'Your 5 Capabilities (5Cs)', 
        path: '/imaginal-agility/capabilities', 
        type: 'Learning', 
        contentKey: 'five-capabilities',
        icon: Book,
        autoPlay: true,
        minWatchPercent: 1,
        locked: true
      },
      { 
        id: '1-5', 
        label: 'Take the Imagination Assessment', 
        path: '/imaginal-agility/imagination-assessment', 
        type: 'Assessment', 
        contentKey: 'imagination-assessment',
        icon: Zap,
        isModal: true,
        locked: true
      },
      { 
        id: '1-6', 
        label: 'Review your Results', 
        path: '/imaginal-agility/results', 
        type: 'Learning', 
        contentKey: 'assessment-results',
        icon: Book,
        locked: true
      }
    ]
  }
];

// AllStarTeams navigation sections based on progression specifications
export const navigationSections: NavigationSection[] = [
  { 
    id: '1', 
    title: '', 
    path: '/intro/video',
    totalSteps: 1,
    completedSteps: 0,
    steps: [
      { id: '1-1', label: 'Welcome', path: '/intro/video', type: 'Learning', contentKey: 'welcome', icon: Book, autoPlay: true, minWatchPercent: 1 }
    ]
  },
  { 
    id: '2', 
    title: 'DISCOVER YOUR STAR STRENGTHS', 
    path: '/discover-strengths',
    totalSteps: 4,
    completedSteps: 0,
    steps: [
      { id: '2-1', label: 'Intro to Star Strengths', path: '/discover-strengths/intro', type: 'Learning', contentKey: 'intro-strengths', icon: Book, autoPlay: true, minWatchPercent: 1 },
      { id: '2-2', label: 'Star Strengths Self-Assessment', path: '/discover-strengths/assessment', type: 'Assessment', contentKey: 'strengths-assessment', icon: Activity, isModal: true },
      { id: '2-3', label: 'Review Your Star Card', path: '/discover-strengths/star-card', type: 'Learning', contentKey: 'star-card-preview', icon: Book, autoPlay: true, minWatchPercent: 1 },
      { id: '2-4', label: 'Strength Reflection', path: '/discover-strengths/reflection', type: 'Reflection', contentKey: 'strengths-reflection', icon: PenTool, requireAllAnswers: true }
    ]
  },
  { 
    id: '3', 
    title: 'IDENTIFY YOUR FLOW', 
    path: '/find-your-flow',
    totalSteps: 4,
    completedSteps: 0,
    steps: [
      { id: '3-1', label: 'Intro to Flow', path: '/find-your-flow/intro', type: 'Learning', contentKey: 'intro-flow', icon: Book, autoPlay: true, minWatchPercent: 1 },
      { id: '3-2', label: 'Flow Assessment', path: '/find-your-flow/assessment', type: 'Assessment', contentKey: 'flow-assessment', icon: Activity, isModal: true },
      { id: '3-3', label: 'Rounding Out', path: '/find-your-flow/rounding-out', type: 'Learning', contentKey: 'rounding-out', icon: Book, autoPlay: true, minWatchPercent: 1, requireAllInputs: true },
      { id: '3-4', label: 'Add Flow to Star Card', path: '/find-your-flow/star-card', type: 'Assessment', contentKey: 'flow-star-card', icon: Activity, requireExactWords: 4 }
    ]
  },
  { 
    id: '4', 
    title: 'VISUALIZE FUTURE GROWTH', 
    path: '/visualize-potential',
    totalSteps: 5,
    completedSteps: 0,
    steps: [
      { id: '4-1', label: 'Ladder of Well-being', path: '/visualize-potential/wellbeing', type: 'Learning', contentKey: 'ladder-wellbeing', icon: Book, autoPlay: true, minWatchPercent: 1, hasSliders: true },
      { id: '4-2', label: 'Well-being Reflections', path: '/visualize-potential/cantril-ladder', type: 'Learning', contentKey: 'wellbeing-reflections', icon: PenTool, requireAllAnswers: true },
      { id: '4-3', label: 'Visualizing You', path: '/visualize-potential/visualizing-you', type: 'Learning', contentKey: 'visualizing-you', icon: Activity },
      { id: '4-4', label: 'Your Future Self', path: '/visualize-potential/future-self', type: 'Reflection', contentKey: 'future-self', icon: Book, autoPlay: true, minWatchPercent: 1, requireAllAnswers: true },
      { id: '4-5', label: 'Final Reflection', path: '/visualize-potential/your-statement', type: 'Reflection', contentKey: 'final-reflection', icon: Book, requireAllAnswers: true }
    ]
  },
  { 
    id: '5', 
    title: 'NEXT STEPS', 
    path: '/next-steps',
    totalSteps: 4,
    completedSteps: 0,
    locked: false,
    steps: [
      { id: '5-1', label: 'Download your Star Card', path: '/next-steps/star-card', type: 'Learning', contentKey: 'download-star-card', icon: Download, downloadOnly: true },
      { id: '5-2', label: 'Your Holistic Report', path: '/next-steps/holistic-report', type: 'Learning', contentKey: 'holistic-report', icon: Download },
      { id: '5-3', label: 'Growth Plan (coming soon)', path: '/next-steps/growth-plan', type: 'Learning', contentKey: 'growth-plan', icon: Calendar },
      { id: '5-4', label: 'Team Workshop Prep', path: '/next-steps/team-prep', type: 'Learning', contentKey: 'team-workshop-prep', icon: Activity }
    ]
  },
  { 
    id: '6', 
    title: 'MORE INFORMATION', 
    path: '/more-information',
    totalSteps: 4,
    completedSteps: 0,
    locked: false,
    steps: [
      { id: '6-1', label: 'Methodology', path: '/more-information/methodology', type: 'Learning', contentKey: 'methodology', icon: Brain },
      { id: '6-2', label: 'Neuroscience', path: '/more-information/neuroscience', type: 'Learning', contentKey: 'neuroscience', icon: Brain },
      { id: '6-3', label: 'Compendium', path: '/more-information/compendium', type: 'Learning', contentKey: 'compendium', icon: Brain },
      { id: '6-4', label: 'Background', path: '/more-information/background', type: 'Learning', contentKey: 'background', icon: Brain }
    ]
  }
];