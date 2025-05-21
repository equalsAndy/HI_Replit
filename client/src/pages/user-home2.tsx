import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import UserHomeNavigation from '@/components/navigation/UserHomeNavigation';
import ContentViews from '@/components/content/ContentViews';
import { AssessmentModal } from '@/components/assessment/AssessmentModal';
import { 
  ChevronLeft, ChevronRight, StarIcon, BarChartIcon, 
  Activity, Sparkles, Lock, BookOpen, ClipboardCheck, Edit, Star,
  CheckCircle, FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import StarCard from '@/components/starcard/StarCard';
import StepByStepReflection from '@/components/reflection/StepByStepReflection';
import FlowAssessment from '@/components/flow/FlowAssessment';

// Navigation sections based on the spreadsheet
const navigationSections = [
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

const PROGRESS_STORAGE_KEY = 'allstar_navigation_progress';

export default function UserHome2() {
  const [location, navigate] = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [currentContent, setCurrentContent] = useState<string>("welcome");
  const [isAssessmentModalOpen, setIsAssessmentModalOpen] = useState(false);

  const { data: user } = useQuery<{
    id: number;
    name: string;
    username: string;
    title?: string;
    organization?: string;
  }>({ queryKey: ['/api/user/profile'] });

  const { data: starCard } = useQuery<{
    id?: number;
    userId: number;
    thinking: number;
    acting: number;
    feeling: number;
    planning: number;
    state?: string;
    createdAt?: string;
    imageUrl?: string | null;
  }>({
    queryKey: ['/api/starcard'],
    enabled: !!user,
    staleTime: Infinity,
  });

  useEffect(() => {
    const savedProgress = localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (savedProgress) {
      try {
        const { completed } = JSON.parse(savedProgress);
        if (Array.isArray(completed)) {
          setCompletedSteps(completed);
        }
      } catch (error) {
        console.error('Error loading navigation progress:', error);
      }
    }
  }, []);

  const toggleDrawer = () => setDrawerOpen(!drawerOpen);

  const markStepCompleted = (stepId: string) => {
    if (!completedSteps.includes(stepId)) {
      const newCompletedSteps = [...completedSteps, stepId];
      setCompletedSteps(newCompletedSteps);
      localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify({ completed: newCompletedSteps }));
    }
  };

  const isStepAccessible = (sectionId: string, stepId: string) => {
    const sectionIndex = parseInt(sectionId) - 1;
    const stepIndex = parseInt(stepId.split('-')[1]) - 1;

    if (sectionIndex === 0 && stepIndex === 0) return true;

    if (stepIndex === 0 && sectionIndex > 0) {
      const prevSection = navigationSections[sectionIndex - 1];
      return prevSection.steps.every(step => completedSteps.includes(step.id));
    }

    const prevStepId = `${sectionId}-${stepIndex}`;
    return completedSteps.includes(prevStepId);
  };

  const handleAssessmentComplete = (result: any) => {
    markStepCompleted('2-2');
  };

  const handleStepClick = (step: any) => {
    // Handle navigation based on the specific step
    if (step.id === '2-1') {
      setCurrentContent("intro-strengths");
      markStepCompleted(step.id);
    } else if (step.id === '2-2') {
      setCurrentContent("strengths-assessment");
    } else if (step.id === '2-3') {
      setCurrentContent("star-card-preview");
      markStepCompleted(step.id);
    } else if (step.id === '2-4') {
      setCurrentContent("reflection");
      markStepCompleted(step.id);
    } else if (step.id === '3-1') {
      setCurrentContent("intro-flow");
      markStepCompleted(step.id);
    } else {
      navigate(step.path);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <AssessmentModal 
        isOpen={isAssessmentModalOpen} 
        onClose={() => setIsAssessmentModalOpen(false)}
        onComplete={handleAssessmentComplete}
      />

      <UserHomeNavigation
        drawerOpen={drawerOpen}
        toggleDrawer={toggleDrawer}
        completedSteps={completedSteps}
        isStepAccessible={isStepAccessible}
        onStepClick={handleStepClick}
      />

      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-6 py-8">
          <ContentViews
            currentContent={currentContent}
            user={user}
            starCard={starCard}
            isAssessmentModalOpen={isAssessmentModalOpen}
            setIsAssessmentModalOpen={setIsAssessmentModalOpen}
            handleAssessmentComplete={handleAssessmentComplete}
            markStepCompleted={markStepCompleted}
            navigate={navigate}
          />
        </div>
      </div>
    </div>
  );
}