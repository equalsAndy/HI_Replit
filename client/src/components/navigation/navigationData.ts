import { 
  StarIcon, BarChartIcon, Activity, Sparkles, BookOpen,
  LightbulbIcon, Braces, Users, Puzzle, Book, Zap, PenTool,
  Download, Calendar, Brain
} from 'lucide-react';
import { NavigationSection } from '../../../shared/types';

// Imaginal Agility navigation sections - Updated to match new 9-step structure
export const imaginalAgilityNavigationSections: NavigationSection[] = [
  {
    id: '1',
    title: 'Imaginal Agility Workshop',
    path: '/imaginal-agility/ia-1-1',
    icon: Brain,
    totalSteps: 9,
    completedSteps: 0,
    steps: [
      { 
        id: 'ia-1-1', 
        label: '🎥 Introduction to Imaginal Agility', 
        path: '/imaginal-agility/ia-1-1', 
        type: 'Learning', 
        contentKey: 'ia-1-1',
        icon: Book,
        autoPlay: true,
        minWatchPercent: 1,
        locked: false // Only this step starts unlocked
      },
      { 
        id: 'ia-2-1', 
        label: '🎥 The Triple Challenge', 
        path: '/imaginal-agility/ia-2-1', 
        type: 'Learning', 
        contentKey: 'ia-2-1',
        icon: Book,
        autoPlay: true,
        minWatchPercent: 1,
        locked: true
      },
      { 
        id: 'ia-3-1', 
        label: '🎥 Imaginal Agility Solution', 
        path: '/imaginal-agility/ia-3-1', 
        type: 'Learning', 
        contentKey: 'ia-3-1',
        icon: Book,
        autoPlay: true,
        minWatchPercent: 1,
        locked: true
      },
      { 
        id: 'ia-4-1', 
        label: '⚡ Self-Assessment', 
        path: '/imaginal-agility/ia-4-1', 
        type: 'Assessment', 
        contentKey: 'ia-4-1',
        icon: Zap,
        isModal: true,
        locked: true
      },
      { 
        id: 'ia-4-2', 
        label: '📊 Review Results', 
        path: '/imaginal-agility/ia-4-2', 
        type: 'Learning', 
        contentKey: 'ia-4-2',
        icon: BarChartIcon,
        locked: true
      },
      { 
        id: 'ia-5-1', 
        label: '🎥 Teamwork Preparation', 
        path: '/imaginal-agility/ia-5-1', 
        type: 'Learning', 
        contentKey: 'ia-5-1',
        icon: Book,
        autoPlay: true,
        minWatchPercent: 1,
        locked: true
      },
      { 
        id: 'ia-6-1', 
        label: '🔍 Discernment Guide', 
        path: '/imaginal-agility/ia-6-1', 
        type: 'Learning', 
        contentKey: 'ia-6-1',
        icon: Brain,
        locked: true
      },
      { 
        id: 'ia-7-1', 
        label: '🎥 The Neuroscience', 
        path: '/imaginal-agility/ia-7-1', 
        type: 'Learning', 
        contentKey: 'ia-7-1',
        icon: Book,
        autoPlay: true,
        minWatchPercent: 1,
        locked: true
      },
      { 
        id: 'ia-8-1', 
        label: '📖 More About Workshop', 
        path: '/imaginal-agility/ia-8-1', 
        type: 'Learning', 
        contentKey: 'ia-8-1',
        icon: BookOpen,
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
    totalSteps: 1,
    completedSteps: 0,
    steps: [
      { id: '1-1', label: 'Introduction', path: '/intro/video', type: 'Learning', contentKey: 'welcome', icon: Book, autoPlay: true, minWatchPercent: 1 }
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
      { id: '2-2', label: 'Star Strengths Self-Assessment', path: '/discover-strengths/assessment', type: 'Assessment', contentKey: 'strengths-assessment', icon: Zap, isModal: true },
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
      { id: '3-1', label: 'Intro to Flow', path: '/find-your-flow/intro', type: 'Learning', contentKey: 'intro-to-flow', icon: Book, autoPlay: true, minWatchPercent: 1 },
      { id: '3-2', label: 'Flow Assessment', path: '/find-your-flow/assessment', type: 'Assessment', contentKey: 'flow-assessment', icon: Zap, isModal: true },
      { id: '3-3', label: 'Rounding Out', path: '/find-your-flow/rounding-out', type: 'Learning', contentKey: 'flow-rounding-out', icon: PenTool, autoPlay: true, minWatchPercent: 1 },
      { id: '3-4', label: 'Add Flow to Star Card', path: '/find-your-flow/star-card', type: 'Activity', contentKey: 'flow-star-card', icon: Zap }
    ]
  },
  { 
    id: '4', 
    title: 'VISUALIZE YOUR POTENTIAL', 
    path: '/visualize-potential',
    totalSteps: 5,
    completedSteps: 0,
    steps: [
      { id: '4-1', label: 'Ladder of Well-being', path: '/visualize-potential/wellbeing', type: 'Learning', contentKey: 'ladder-wellbeing', icon: Book, autoPlay: true, minWatchPercent: 1, hasSliders: true },
      { id: '4-2', label: 'Well-being Reflections', path: '/visualize-potential/cantril-ladder', type: 'Learning', contentKey: 'wellbeing-reflections', icon: PenTool, requireAllAnswers: true },
      { id: '4-3', label: 'Visualizing You', path: '/visualize-potential/visualizing-you', type: 'Activity', contentKey: 'visualizing-you', icon: Zap },
      { id: '4-4', label: 'Your Future Self', path: '/visualize-potential/future-self', type: 'Reflection', contentKey: 'future-self', icon: PenTool, autoPlay: true, minWatchPercent: 1, requireAllAnswers: true },
      { id: '4-5', label: 'Final Reflection', path: '/visualize-potential/your-statement', type: 'Reflection', contentKey: 'final-reflection', icon: PenTool, requireAllAnswers: true }
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
      { id: '5-1', label: 'Download your Star Card', path: '/next-steps/star-card', type: 'Learning', contentKey: 'download-star-card', downloadOnly: true },
      { id: '5-2', label: 'Your Holistic Report', path: '/next-steps/holistic-report', type: 'Learning', contentKey: 'holistic-report' },
      { id: '5-3', label: 'Growth Plan (coming soon)', path: '/next-steps/growth-plan', type: 'Learning', contentKey: 'growth-plan' },
      { id: '5-4', label: 'Team Workshop Prep', path: '/next-steps/team-prep', type: 'Learning', contentKey: 'team-workshop-prep' }
    ]
  },
  { 
    id: '6', 
    title: 'MORE INFORMATION', 
    path: '/more-information',
    totalSteps: 1,
    completedSteps: 0,
    locked: false,
    steps: [
      { id: '6-1', label: 'Workshop Resources', path: '/more-information/workshop-resources', type: 'Learning', contentKey: 'workshop-resources', icon: Brain }
    ]
  }
];