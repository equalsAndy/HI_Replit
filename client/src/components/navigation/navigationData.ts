import { 
  StarIcon, BarChartIcon, Activity, Sparkles, BookOpen,
  LightbulbIcon, Braces, Users, Puzzle, Book, Zap, PenTool
} from 'lucide-react';
import { NavigationSection } from '@/shared/types';

// Imaginal Agility navigation sections
export const imaginalAgilityNavigationSections: NavigationSection[] = [
  {
    id: '1',
    title: 'Imaginal Agility Program',
    path: '/imaginal-agility/intro',
    icon: LightbulbIcon,
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
    title: 'AllStarTeams Introduction', 
    path: '/intro/video',
    icon: Book, // Book icon for video content
    totalSteps: 1,
    completedSteps: 0,
    steps: [
      { id: '1-1', label: 'Introduction Video', path: '/intro/video', type: 'Learning', contentKey: 'welcome', icon: Book, autoPlay: true, minWatchPercent: 1 }
    ]
  },
  { 
    id: '2', 
    title: 'Discover your Strengths', 
    path: '/discover-strengths',
    icon: BarChartIcon,
    totalSteps: 4,
    completedSteps: 0,
    steps: [
      { id: '2-1', label: 'Intro to Strengths', path: '/discover-strengths/intro', type: 'Learning', contentKey: 'intro-strengths', icon: Book, autoPlay: true, minWatchPercent: 1 },
      { id: '2-2', label: 'Strengths Assessment', path: '/discover-strengths/assessment', type: 'Assessment', contentKey: 'strengths-assessment', icon: Zap, isModal: true },
      { id: '2-3', label: 'Star Card Preview', path: '/discover-strengths/star-card', type: 'Learning', contentKey: 'star-card-preview', icon: Book, autoPlay: true, minWatchPercent: 1 },
      { id: '2-4', label: 'Reflect', path: '/discover-strengths/reflection', type: 'Reflection', contentKey: 'strengths-reflection', icon: PenTool, requireAllAnswers: true }
    ]
  },
  { 
    id: '3', 
    title: 'Find your Flow', 
    path: '/find-your-flow',
    icon: Activity,
    totalSteps: 4,
    completedSteps: 0,
    steps: [
      { id: '3-1', label: 'Intro to Flow', path: '/find-your-flow/intro', type: 'Learning', contentKey: 'intro-flow', icon: Book, autoPlay: true, minWatchPercent: 1 },
      { id: '3-2', label: 'Flow Assessment', path: '/find-your-flow/assessment', type: 'Assessment', contentKey: 'flow-assessment', icon: Zap, isModal: true },
      { id: '3-3', label: 'Rounding Out', path: '/find-your-flow/rounding-out', type: 'Learning', contentKey: 'rounding-out', icon: Book, autoPlay: true, minWatchPercent: 1, requireAllInputs: true },
      { id: '3-4', label: 'Add Flow to Star Card', path: '/find-your-flow/star-card', type: 'Assessment', contentKey: 'flow-star-card', icon: Zap, requireExactWords: 4 }
    ]
  },
  { 
    id: '4', 
    title: 'Visualize your Potential', 
    path: '/visualize-potential',
    icon: Sparkles,
    totalSteps: 5,
    completedSteps: 0,
    steps: [
      { id: '4-1', label: 'Ladder of Well-being', path: '/visualize-potential/wellbeing', type: 'Learning', contentKey: 'ladder-wellbeing', icon: Book, autoPlay: true, minWatchPercent: 1, hasSliders: true },
      { id: '4-2', label: 'Well-being Reflections', path: '/visualize-potential/cantril-ladder', type: 'Learning', contentKey: 'wellbeing-reflections', icon: Book, requireAllAnswers: true },
      { id: '4-3', label: 'Visualizing You', path: '/visualize-potential/visualizing-you', type: 'Learning', contentKey: 'visualizing-you', icon: Book },
      { id: '4-4', label: 'Your Future Self', path: '/visualize-potential/future-self', type: 'Reflection', contentKey: 'future-self', icon: PenTool, autoPlay: true, minWatchPercent: 1, requireAllAnswers: true },
      { id: '4-5', label: 'Final Reflection', path: '/visualize-potential/your-statement', type: 'Reflection', contentKey: 'final-reflection', icon: PenTool, requireAllAnswers: true }
    ]
  },
  { 
    id: '5', 
    title: 'Resources', 
    path: '/resources',
    icon: BookOpen,
    totalSteps: 2,
    completedSteps: 0,
    locked: false, // Always unlocked
    steps: [
      { id: '5-1', label: 'Your Star Card', path: '/resources/star-card', type: 'Learning', contentKey: 'your-star-card', icon: StarIcon, downloadOnly: true },
      { id: '5-2', label: 'Your Star Report', path: '/resources/summary', type: 'Learning', contentKey: 'star-report', icon: Book }
    ]
  }
];