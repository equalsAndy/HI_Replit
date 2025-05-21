
import { StarIcon, BarChartIcon, Activity, Sparkles } from 'lucide-react';

export const navigationSections = [
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
    path: '/discover-strengths/intro',
    icon: BarChartIcon,
    totalSteps: 4,
    completedSteps: 0,
    steps: [
      { id: '2-1', label: 'Intro to Strengths', path: '/discover-strengths/intro', type: 'Learning' },
      { id: '2-2', label: 'Strengths Assessment', path: '/assessment', type: 'Activity' },
      { id: '2-3', label: 'Star Card Preview', path: '/starcard-preview', type: 'Learning' },
      { id: '2-4', label: 'Reflect', path: '/discover-strengths/reflect', type: 'Writing' }
    ]
  },
  { 
    id: '3', 
    title: 'Find your Flow', 
    path: '/find-your-flow/intro',
    icon: Activity,
    totalSteps: 4,
    completedSteps: 0,
    steps: [
      { id: '3-1', label: 'Intro to Flow', path: '/find-your-flow/intro', type: 'Learning' },
      { id: '3-2', label: 'Flow Assessment', path: '/flow-assessment', type: 'Activity' },
      { id: '3-3', label: 'Rounding Out', path: '/rounding-out', type: 'Writing' },
      { id: '3-4', label: 'Add Flow to Star Card', path: '/add-flow-starcard', type: 'Activity' }
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
      { id: '4-1', label: 'Ladder of Well-being', path: '/well-being', type: 'Learning' },
      { id: '4-2', label: 'Cantril Ladder', path: '/cantril-ladder', type: 'Activity and Writing' },
      { id: '4-3', label: 'Visualizing You', path: '/visualizing-you', type: 'Activity' },
      { id: '4-4', label: 'Your Future Self', path: '/future-self', type: 'Learning' },
      { id: '4-5', label: 'Your Statement', path: '/your-statement', type: 'Writing' }
    ]
  }
];

export const PROGRESS_STORAGE_KEY = 'allstar_navigation_progress';
