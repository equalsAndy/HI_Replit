import { ReactNode, useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Book, Star, PieChart, Target } from 'lucide-react';
import { useApplication } from '@/hooks/use-application';
import { useNavigationProgress, NavigationSection } from '@/hooks/use-navigation-progress';
import { NavigationHeader } from './NavigationHeader';
import { NavigationSidebar } from './NavigationSidebar';
import { MobileNavigation } from './MobileNavigation';
import { QuickResumeModal } from './QuickResumeModal';
import { Button } from '@/components/ui/button';

interface NavigationProps {
  children: ReactNode;
  currentStepId?: string;
}

export function Navigation({ children, currentStepId }: NavigationProps) {
  const [location] = useLocation();
  const { currentApp } = useApplication();
  const { updateNavigationSections, setCurrentStep } = useNavigationProgress();
  const [showMobileNav, setShowMobileNav] = useState(false);
  
  // Define navigation structure based on the image provided
  const newJourneySections = [
    { id: 'F1', title: 'Star Self-Assessment', path: '/assessment' },
    { id: 'F2', title: 'Core Strengths', path: '/core-strengths' },
    { id: 'F3', title: 'Flow State', path: '/find-your-flow' },
    { id: 'F4', title: 'Rounding Out', path: '/rounding-out' },
    { id: 'F5', title: 'Visualizing Potential', path: '/visualize-yourself' },
    { id: 'F6', title: 'Ladder of Well-Being', path: '/well-being' },
    { id: 'F7', title: 'Future Self', path: '/future-self' },
  ];
  
  // Define our navigation structure based on the current application
  useEffect(() => {
    // Define AllStarTeams navigation
    const allStarTeamsNavigation: NavigationSection[] = [
      {
        id: 'foundations',
        title: 'Foundations',
        steps: [
          { id: 'A1', label: 'Welcome', path: '/foundations', estimatedTime: 5, required: true },
          { id: 'A2', label: 'Your Learning Journey', path: '/learning-overview', estimatedTime: 5, required: true },
          { id: 'A3', label: 'Understanding Strengths', path: '/strength-model', estimatedTime: 10, required: true },
        ]
      },
      {
        id: 'core-strengths',
        title: 'Reflect On Your Strengths',
        steps: [
          { id: 'B1', label: 'Core Strengths Overview', path: '/core-strengths', estimatedTime: 5, required: true },
          { id: 'B2', label: 'Strength Reflection', path: '/strength-reflection', estimatedTime: 15, required: true },
          { id: 'B3', label: 'Knowledge Check', path: '/strength-check', estimatedTime: 3, required: true },
        ]
      },
      {
        id: 'flow-assessment',
        title: 'Identify Your Flow',
        steps: [
          { id: 'C1', label: 'Flow Assessment', path: '/flow-assessment', estimatedTime: 5, required: true },
          { id: 'C2', label: 'Find Your Flow', path: '/find-your-flow', estimatedTime: 10, required: true },
          { id: 'C3', label: 'Flow Attributes', path: '/flow-attributes', estimatedTime: 5, required: true },
        ]
      },
      {
        id: 'rounding-out',
        title: 'Rounding Out',
        steps: [
          { id: 'D1', label: 'Balance Your Strengths', path: '/rounding-out', estimatedTime: 10, required: true },
          { id: 'D2', label: 'Team Integration', path: '/team-integration', estimatedTime: 10, required: false },
          { id: 'D3', label: 'Practice Scenarios', path: '/practice-scenarios', estimatedTime: 15, required: false },
        ]
      },
      {
        id: 'completion',
        title: 'Complete Your Star Card',
        steps: [
          { id: 'E1', label: 'Star Card Overview', path: '/star-card-overview', estimatedTime: 5, required: true },
          { id: 'E2', label: 'Your Star Card', path: '/report', estimatedTime: 10, required: true },
        ]
      }
    ];
    
    // Define Imaginal Agility navigation
    const imaginalAgilityNavigation: NavigationSection[] = [
      {
        id: 'foundations',
        title: 'Imagination Foundations',
        steps: [
          { id: 'A1', label: 'Welcome', path: '/foundations', estimatedTime: 5, required: true },
          { id: 'A2', label: 'Your Learning Journey', path: '/learning-overview', estimatedTime: 5, required: true },
          { id: 'A3', label: 'Understanding Imagination', path: '/imagination-model', estimatedTime: 10, required: true },
        ]
      },
      {
        id: 'assessment',
        title: 'Imagination Assessment',
        steps: [
          { id: 'B1', label: 'Assessment Overview', path: '/imagination-assessment', estimatedTime: 5, required: true },
          { id: 'B2', label: 'Complete Assessment', path: '/imagination-questionnaire', estimatedTime: 15, required: true },
          { id: 'B3', label: 'Knowledge Check', path: '/imagination-check', estimatedTime: 3, required: true },
        ]
      },
      {
        id: 'agility',
        title: 'Agility Spectrum',
        steps: [
          { id: 'C1', label: 'Understanding Agility', path: '/agility-spectrum', estimatedTime: 10, required: true },
          { id: 'C2', label: 'Your Agility Profile', path: '/agility-profile', estimatedTime: 10, required: true },
        ]
      },
      {
        id: 'integration',
        title: 'Creative Integration',
        steps: [
          { id: 'D1', label: 'Integration Approaches', path: '/creative-integration', estimatedTime: 10, required: true },
          { id: 'D2', label: 'Practical Applications', path: '/practical-applications', estimatedTime: 15, required: false },
        ]
      },
      {
        id: 'completion',
        title: 'Your Agility Profile',
        steps: [
          { id: 'E1', label: 'Profile Overview', path: '/profile-overview', estimatedTime: 5, required: true },
          { id: 'E2', label: 'Your Profile', path: '/agility-report', estimatedTime: 10, required: true },
        ]
      }
    ];
    
    // Update navigation based on current app
    const navigationSections = currentApp === 'allstarteams' 
      ? allStarTeamsNavigation 
      : imaginalAgilityNavigation;
    
    updateNavigationSections(navigationSections);
  }, [currentApp, updateNavigationSections]);
  
  // Set current step based on props
  useEffect(() => {
    if (currentStepId) {
      setCurrentStep(currentStepId);
    }
  }, [currentStepId, setCurrentStep]);
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Fixed navigation header */}
      <NavigationHeader />
      
      {/* Quick Resume Modal */}
      <QuickResumeModal />
      
      {/* Mobile Menu Toggle Button (shows at the top on mobile) */}
      <div className="md:hidden mx-4 mt-4">
        <Button 
          variant="outline" 
          className="w-full flex items-center justify-center gap-2 border-yellow-400 text-yellow-700"
          onClick={() => setShowMobileNav(!showMobileNav)}
        >
          {showMobileNav ? 'Hide Learning Journey' : 'Show Learning Journey'}
        </Button>
      </div>
      
      {/* Mobile Navigation */}
      {showMobileNav && (
        <div className="md:hidden mt-4 mx-4 p-4 bg-white rounded-md border border-gray-200 shadow-sm">
          <MobileNavigation 
            currentSectionId={currentStepId}
            customSections={newJourneySections}
          />
        </div>
      )}
      
      {/* Main content area */}
      <main className="flex-1 container mx-auto px-4 py-6 md:py-8">
        <div className="md:grid md:grid-cols-4 gap-6">
          {/* Navigation sidebar on desktop */}
          <div className="hidden md:block md:col-span-1">
            <div className="sticky top-20">
              <NavigationSidebar />
            </div>
          </div>
          
          {/* Main content */}
          <div className="md:col-span-3">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}