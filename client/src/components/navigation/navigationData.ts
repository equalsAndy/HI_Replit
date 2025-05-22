import { 
  StarIcon, BarChartIcon, Activity, Sparkles, BookOpen,
  LightbulbIcon, Braces, Users, Puzzle
} from 'lucide-react';
import { NavigationSection } from '@/shared/types';

// Imaginal Agility navigation sections
export const imaginalAgilityNavigationSections: NavigationSection[] = [
  {
    id: '1',
    title: 'Imaginal Agility Program',
    path: '/imaginal-agility/intro',
    icon: LightbulbIcon,
    totalSteps: 8,
    completedSteps: 0,
    steps: [
      { id: '1-1', label: 'Introduction to Imaginal Agility', path: '/imaginal-agility/intro', type: 'Learning', contentKey: 'imaginal-intro' },
      { id: '1-2', label: 'The Triple Challenge', path: '/imaginal-agility/triple-challenge', type: 'Learning', contentKey: 'triple-challenge' },
      { id: '1-3', label: 'The Imaginal Agility Solution', path: '/imaginal-agility/solution', type: 'Learning', contentKey: 'imaginal-solution' },
      { id: '1-4', label: 'Your 5 Capabilities (5Cs)', path: '/imaginal-agility/capabilities', type: 'Learning', contentKey: 'five-capabilities' },
      { id: '1-5', label: 'Take the Imagination Assessment', path: '/imaginal-agility/imagination-assessment', type: 'Assessment', contentKey: 'imagination-assessment' },
      { id: '1-6', label: 'Complete the 5Cs Assessment', path: '/imaginal-agility/5cs-assessment', type: 'Assessment', contentKey: 'five-c-assessment' },
      { id: '1-7', label: 'Review Your Insights', path: '/imaginal-agility/insights', type: 'Learning', contentKey: 'insights-review' },
      { id: '1-8', label: 'Team Workshop', path: '/imaginal-agility/team-workshop', type: 'Workshop', contentKey: 'team-workshop' }
    ]
  }
];

// AllStarTeams navigation sections based on the spreadsheet
export const navigationSections: NavigationSection[] = [
  { 
    id: '1', 
    title: 'AllStarTeams Introduction', 
    path: '/intro/video',
    icon: StarIcon,
    totalSteps: 1,
    completedSteps: 0,
    steps: [
      { id: '1-1', label: 'Introduction Video', path: '/intro/video', type: 'Learning' }
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
      { id: '2-1', label: 'Intro to Strengths', path: '/discover-strengths/intro', type: 'Learning' },
      { id: '2-2', label: 'Strengths Assessment', path: '/discover-strengths/assessment', type: 'Assessment' },
      { id: '2-3', label: 'Star Card Preview', path: '/discover-strengths/star-card', type: 'Learning' },
      { id: '2-4', label: 'Reflect', path: '/discover-strengths/reflection', type: 'Reflection' }
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
      { id: '3-1', label: 'Intro to Flow', path: '/find-your-flow/intro', type: 'Learning' },
      { id: '3-2', label: 'Flow Assessment', path: '/find-your-flow/assessment', type: 'Assessment' },
      { id: '3-3', label: 'Rounding Out', path: '/find-your-flow/rounding-out', type: 'Learning' },
      { id: '3-4', label: 'Add Flow to Star Card', path: '/find-your-flow/star-card', type: 'Assessment' }
    ]
  },
  { 
    id: '4', 
    title: 'Visualize your Potential', 
    path: '/visualize-potential',
    icon: Sparkles,
    totalSteps: 6,
    completedSteps: 0,
    steps: [
      { id: '4-1', label: 'Ladder of Well-being', path: '/visualize-potential/wellbeing', type: 'Learning' },
      { id: '4-2', label: 'Well-being Reflections', path: '/visualize-potential/cantril-ladder', type: 'Learning' },
      { id: '4-3', label: 'Visualizing You', path: '/visualize-potential/visualizing-you', type: 'Learning' },
      { id: '4-4', label: 'Your Future Self', path: '/visualize-potential/future-self', type: 'Reflection' },
      { id: '4-5', label: 'Final Reflection', path: '/visualize-potential/your-statement', type: 'Reflection' }
    ]
  },
  { 
    id: '5', 
    title: 'Resources', 
    path: '/resources',
    icon: BookOpen,
    totalSteps: 3,
    completedSteps: 0,
    steps: [
      { id: '5-1', label: 'Workshop Guide', path: '/resources/workshop', type: 'Learning' },
      { id: '5-2', label: 'PDF Summary', path: '/resources/summary', type: 'Learning' },
      { id: '5-3', label: 'Your Star Card', path: '/resources/star-card', type: 'Learning' }
    ]
  }
];