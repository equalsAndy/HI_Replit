import { 
  BookOpen, StarIcon, Activity, Sparkles 
} from 'lucide-react';
import { NavigationSection } from '../../shared/types';

// Navigation sections based on the spreadsheet
export const navigationSections: NavigationSection[] = [
  { 
    id: '1', 
    title: 'AllStarTeams Introduction', 
    icon: BookOpen,
    totalSteps: 2,
    completedSteps: 0,
    steps: [
      { id: '1-1', label: 'Welcome', path: '/welcome', type: 'Overview' },
      { id: '1-2', label: 'Your Profile', path: '/profile', type: 'Setup' }
    ]
  },
  { 
    id: '2', 
    title: 'Discover your Strengths', 
    icon: StarIcon,
    totalSteps: 4,
    completedSteps: 0,
    steps: [
      { id: '2-1', label: 'Intro to Strengths', path: '/intro-strengths', type: 'Learning' },
      { id: '2-2', label: 'Strengths Assessment', path: '/strengths-assessment', type: 'Assessment' },
      { id: '2-3', label: 'Star Card Preview', path: '/star-card-preview', type: 'Review' },
      { id: '2-4', label: 'Reflect', path: '/reflect', type: 'Writing' }
    ]
  },
  { 
    id: '3', 
    title: 'Find your Flow', 
    icon: Activity,
    totalSteps: 4,
    completedSteps: 0,
    steps: [
      { id: '3-1', label: 'Intro to Flow', path: '/intro-flow', type: 'Learning' },
      { id: '3-2', label: 'Flow Assessment', path: '/flow-assessment', type: 'Assessment' },
      { id: '3-3', label: 'Flow Card', path: '/flow-card', type: 'Review' },
      { id: '3-4', label: 'Rounding Out', path: '/rounding-out', type: 'Writing' }
    ]
  },
  { 
    id: '4', 
    title: 'Visualize your Potential', 
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