import React, { ReactNode, useEffect, useState, useRef } from 'react';
import { useLocation } from 'wouter';
import { Video, BookOpen, Zap, Glasses, PenLine, Download, Activity, CheckCircle } from 'lucide-react';
import { useApplication } from '@/hooks/use-application';
import { useNavigationProgress, NavigationSection } from '@/hooks/use-navigation-progress';
import { NavigationHeader } from './NavigationHeader';
import { NavigationSidebar } from './NavigationSidebar';
import { MobileNavigation } from './MobileNavigation';
import { QuickResumeModal } from './QuickResumeModal';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';

interface NavigationProps {
  children: ReactNode;
  currentStepId?: string;
}

export function Navigation({ children, currentStepId }: NavigationProps) {
  const [location] = useLocation();
  const { currentApp } = useApplication();
  
  // Convert currentApp to app type for navigation hook
  const appType: 'ast' | 'ia' = currentApp === 'imaginal-agility' ? 'ia' : 'ast';
  
  const { updateNavigationSections, setCurrentStep } = useNavigationProgress(appType);
  const [showMobileNav, setShowMobileNav] = useState(false);

  // Get user data for content access preference
  const { data: userData } = useQuery<{
    success: boolean;
    user: {
      id: number;
      name: string;
      username: string;
      role?: string;
      contentAccess?: string;
      isTestUser: boolean;
    }
  }>({
    queryKey: ['/api/auth/me'],
    staleTime: 5 * 60 * 1000, // 5 minutes - prevent auth loop
    refetchOnMount: false, // Don't refetch on every mount
    refetchOnWindowFocus: false, // Don't refetch on window focus
  });

  // ALWAYS LOG THIS TO SEE IF COMPONENT IS RUNNING
  console.log('🚀 Navigation Component Loaded!');
  console.log('🚀 currentApp object:', currentApp);
  console.log('🚀 userData object:', userData);

  // Check if user should see student interface for week-based navigation
  // Check contentAccess first (for admin/facilitator interface toggle), then fall back to role
  const userRole = userData?.user?.role;
  const contentAccess = userData?.user?.contentAccess;
  const isStudentContent = contentAccess === 'student' || userRole === 'student';
  const isStudentOrFacilitator = isStudentContent || userRole === 'facilitator';

  // DEBUG: Log role detection
  console.log('🔍 Navigation Debug:');
  console.log('- userRole:', userRole);
  console.log('- contentAccess:', contentAccess);
  console.log('- isStudentContent:', isStudentContent);
  console.log('- isStudentOrFacilitator:', isStudentOrFacilitator);
  console.log('- userData?.user:', userData?.user);
  console.log('- Navigation structure will be:', isStudentOrFacilitator ? 'WEEK-BASED' : 'SESSION-BASED');

  // CRITICAL DEBUG: Force log when contentAccess is student
  if (contentAccess === 'student') {
    console.log('🚨 CRITICAL: User has contentAccess="student" - should show WEEK-BASED navigation!');
    console.log('🚨 Full userData object:', JSON.stringify(userData, null, 2));
  }

  // Function to get navigation sections based on user role
  const getJourneySections = () => {
    if (isStudentOrFacilitator) {
      // Student/Facilitator week-based structure
      return [
        { 
          id: '1', 
          title: 'GETTING STARTED',
          path: '/intro',
          totalSteps: 1,
          completedSteps: 0,
          icon: 'Video',
          iconColor: 'text-blue-600',
          steps: [
            { id: '1-1', label: 'Introduction', path: '/intro/video', type: 'Learning', icon: 'Video', iconColor: 'text-blue-600' },
          ]
        },
        { 
          id: '2', 
          title: 'WEEK 1: DISCOVER YOUR STAR STRENGTHS', 
          path: '/discover-strengths',
          totalSteps: 3,
          completedSteps: 0,
          icon: 'BookOpen',
          iconColor: 'text-purple-600',
          steps: [
            { id: '2-2', label: 'Star Strengths Self-Assessment', path: '/assessment', type: 'Activity', icon: 'Activity', iconColor: 'text-yellow-600' },
            { id: '2-3', label: 'Review Your Star Card', path: '/starcard-preview', type: 'Learning', icon: 'BookOpen', iconColor: 'text-pink-600' },
            { id: '2-4', label: 'Strength Reflection', path: '/discover-strengths/reflect', type: 'Writing', icon: 'PenLine', iconColor: 'text-pink-600' },
          ]
        },
        { 
          id: '3', 
          title: 'WEEK 2: IDENTIFY YOUR FLOW', 
          path: '/find-your-flow',
          totalSteps: 4,
          completedSteps: 0,
          icon: 'BookOpen',
          iconColor: 'text-green-600',
          steps: [
            { id: '3-1', label: 'Intro to Flow', path: '/find-your-flow/intro', type: 'Learning', icon: 'BookOpen', iconColor: 'text-blue-600' },
            { id: '3-2', label: 'Flow Assessment', path: '/flow-assessment', type: 'Activity', icon: 'Activity', iconColor: 'text-yellow-600' },
            { id: '3-3', label: 'Rounding Out', path: '/rounding-out', type: 'Writing', icon: 'PenLine', iconColor: 'text-pink-600' },
            { id: '3-4', label: 'Add Flow to Star Card', path: '/add-flow-starcard', type: 'Activity', icon: 'Zap', iconColor: 'text-yellow-600' },
          ]
        },
        { 
          id: '4', 
          title: 'WEEK 3: VISUALIZE YOUR POTENTIAL Part 1', 
          path: '/visualize-potential',
          totalSteps: 2,
          completedSteps: 0,
          icon: 'Zap',
          iconColor: 'text-indigo-600',
          steps: [
            { id: '4-1', label: 'Ladder of Well-being', path: '/well-being', type: 'Learning', icon: 'PenLine', iconColor: 'text-pink-600' },
            { id: '4-2', label: 'Well-being Reflections', path: '/cantril-ladder', type: 'Activity and Writing', icon: 'PenLine', iconColor: 'text-pink-600' },
          ]
        },
        { 
          id: '5', 
          title: 'WEEK 4: VISUALIZE YOUR POTENTIAL Part 2', 
          path: '/visualize-potential-2',
          totalSteps: 3,
          completedSteps: 0,
          icon: 'Zap',
          iconColor: 'text-indigo-600',
          steps: [
            { id: '4-3', label: 'Visualizing You', path: '/visualizing-you', type: 'Activity', icon: 'PenLine', iconColor: 'text-pink-600' },
            { id: '4-4', label: 'Your Future Self', path: '/future-self', type: 'Learning', icon: 'PenLine', iconColor: 'text-pink-600' },
            { id: '4-5', label: 'Final Reflection', path: '/your-statement', type: 'Writing', icon: 'PenLine', iconColor: 'text-pink-600' },
          ]
        },
        {
          id: '6',
          title: 'WEEK 5: NEXT STEPS',
          path: '/next-steps',
          totalSteps: 4,
          completedSteps: 0,
          icon: 'Download',
          iconColor: 'text-green-700',
          steps: [
            { id: '5-1', label: 'Download your Star Card', path: '/download-starcard', type: 'Download', icon: 'PenLine', iconColor: 'text-pink-600' },
            { id: '5-2', label: 'Your Holistic Report', path: '/holistic-report', type: 'Download', icon: 'PenLine', iconColor: 'text-pink-600' },
            { id: '5-3', label: 'Growth Plan', path: '/growth-plan', type: 'Download', icon: 'PenLine', iconColor: 'text-pink-600' },
            { id: '5-4', label: 'Team Workshop Prep', path: '/team-workshop-prep', type: 'Activity', icon: 'PenLine', iconColor: 'text-pink-600' },
          ]
        }
      ];
    } else {
      // Original structure for all other user types
      return [
        { 
          id: '1', 
          title: 'All star teams Introduction', 
          path: '/intro',
          totalSteps: 1,
          completedSteps: 0,
          icon: 'Video',
          iconColor: 'text-blue-600',
          steps: [
            { id: '1-1', label: 'Introduction', path: '/intro/video', type: 'Learning', icon: 'Video', iconColor: 'text-blue-600' },
          ]
        },
        { 
          id: '2', 
          title: 'Discover your Strengths', 
          path: '/discover-strengths',
          totalSteps: 4,
          completedSteps: 0,
          icon: 'BookOpen',
          iconColor: 'text-purple-600',
          steps: [
            { id: '2-1', label: 'Intro to Star Strengths', path: '/discover-strengths/intro', type: 'Learning', icon: 'BookOpen', iconColor: 'text-blue-600' },
            { id: '2-2', label: 'Star Strengths Self-Assessment', path: '/assessment', type: 'Activity', icon: 'Activity', iconColor: 'text-yellow-600' },
            { id: '2-3', label: 'Review Your Star Card', path: '/starcard-preview', type: 'Learning', icon: 'BookOpen', iconColor: 'text-pink-600' },
            { id: '2-4', label: 'Strength Reflection', path: '/discover-strengths/reflect', type: 'Writing', icon: 'PenLine', iconColor: 'text-pink-600' },
          ]
        },
        { 
          id: '3', 
          title: 'Find your Flow', 
          path: '/find-your-flow',
          totalSteps: 4,
          completedSteps: 0,
          icon: 'BookOpen',
          iconColor: 'text-green-600',
          steps: [
            { id: '3-1', label: 'Intro to Flow', path: '/find-your-flow/intro', type: 'Learning', icon: 'BookOpen', iconColor: 'text-blue-600' },
            { id: '3-2', label: 'Flow Assessment', path: '/flow-assessment', type: 'Activity', icon: 'Activity', iconColor: 'text-yellow-600' },
            { id: '3-3', label: 'Rounding Out', path: '/rounding-out', type: 'Writing', icon: 'PenLine', iconColor: 'text-pink-600' },
            { id: '3-4', label: 'Add Flow to Star Card', path: '/add-flow-starcard', type: 'Activity', icon: 'Zap', iconColor: 'text-yellow-600' },
          ]
        },
        { 
          id: '4', 
          title: 'Visualize your Potential', 
          path: '/visualize-potential',
          totalSteps: 5,
          completedSteps: 0,
          icon: 'Zap',
          iconColor: 'text-indigo-600',
          steps: [
            { id: '4-1', label: 'Ladder of Well-being', path: '/well-being', type: 'Learning', icon: 'PenLine', iconColor: 'text-pink-600' },
            { id: '4-2', label: 'Well-being Reflections', path: '/cantril-ladder', type: 'Activity and Writing', icon: 'PenLine', iconColor: 'text-pink-600' },
            { id: '4-3', label: 'Visualizing You', path: '/visualizing-you', type: 'Activity', icon: 'PenLine', iconColor: 'text-pink-600' },
            { id: '4-4', label: 'Your Future Self', path: '/future-self', type: 'Learning', icon: 'PenLine', iconColor: 'text-pink-600' },
            { id: '4-5', label: 'Final Reflection', path: '/your-statement', type: 'Writing', icon: 'PenLine', iconColor: 'text-pink-600' },
          ]
        },
        {
          id: '5',
          title: 'Next Steps',
          path: '/next-steps',
          totalSteps: 4,
          completedSteps: 0,
          icon: 'Download',
          iconColor: 'text-green-700',
          steps: [
            { id: '5-1', label: 'Download your Star Card', path: '/download-starcard', type: 'Download', icon: 'PenLine', iconColor: 'text-pink-600' },
            { id: '5-2', label: 'Your Holistic Report', path: '/holistic-report', type: 'Download', icon: 'PenLine', iconColor: 'text-pink-600' },
            { id: '5-3', label: 'Growth Plan', path: '/growth-plan', type: 'Download', icon: 'PenLine', iconColor: 'text-pink-600' },
            { id: '5-4', label: 'Team Workshop Prep', path: '/team-workshop-prep', type: 'Activity', icon: 'PenLine', iconColor: 'text-pink-600' },
          ]
        },
        {
          id: '6',
          title: 'More Information',
          path: '/more-info',
          totalSteps: 1,
          completedSteps: 0,
          icon: 'BookOpen',
          iconColor: 'text-slate-600',
          steps: [
            { id: '6-1', label: 'Workshop Resources', path: '/workshop-resources', type: 'Learning', icon: 'PenLine', iconColor: 'text-pink-600' },
          ]
        }
      ];
    }
  };

  // Get the appropriate navigation structure
  const journeySections = getJourneySections();

  // Use a ref to track if we've initialized the navigation structure
  const hasInitialized = useRef(false);

  // Initialize the navigation structure only once 
  useEffect(() => {
    // Skip if we've already initialized
    if (hasInitialized.current) return;

    // Mark as initialized
    hasInitialized.current = true;

    // Use the journeySections we defined above 
    updateNavigationSections();
  }, []); // Removed the dependency since it causes infinite updates

  // Set current step based on props and scroll to top (only when it changes)
  useEffect(() => {
    if (currentStepId) {
      setCurrentStep(currentStepId);
      // Scroll main content area to top
      window.scrollTo(0, 0);
    }
  }, [currentStepId, location]); // Added location to dependencies to catch all navigation changes

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
            customSections={journeySections}
          />
        </div>
      )}

      {/* Main content area */}
      <main className="flex-1 container mx-auto px-4 py-6 md:py-8">
        <div className="md:grid md:grid-cols-4 gap-6">
          {/* Navigation sidebar on desktop */}
          <div className="hidden md:block md:col-span-1">
            <div className="sticky top-20">
              <NavigationSidebar 
                appType={appType} 
                customSections={isStudentOrFacilitator ? journeySections : undefined}
              />
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