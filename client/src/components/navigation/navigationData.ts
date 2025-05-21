import { 
  StarIcon, BarChartIcon, Activity, Sparkles, BookOpen
} from 'lucide-react';
import { NavigationSection } from '@/shared/types';

// Navigation sections based on the spreadsheet
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
      { id: '3-4', label: 'Add Flow to Star Card', path: '/find-your-flow/star-card', type: 'Learning' }
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
      { id: '4-1', label: 'Ladder of Well-being', path: '/visualize-potential/wellbeing', type: 'Learning' },
      { id: '4-2', label: 'Cantril Ladder', path: '/visualize-potential/cantril-ladder', type: 'Learning' },
      { id: '4-3', label: 'Visualizing You', path: '/visualize-potential/visualizing-you', type: 'Learning' },
      { id: '4-4', label: 'Your Future Self', path: '/visualize-potential/future-self', type: 'Reflection' },
      { id: '4-5', label: 'Your Statement', path: '/visualize-potential/your-statement', type: 'Reflection' }
    ]
  },
  { 
    id: '5', 
    title: 'Resources', 
    path: '/resources',
    icon: BookOpen,
    totalSteps: 2,
    completedSteps: 0,
    steps: [
      { id: '5-1', label: 'Workshop Guide', path: '/resources/workshop', type: 'Learning' },
      { id: '5-2', label: 'PDF Summary', path: '/resources/summary', type: 'Learning' }
    ]
  }
];