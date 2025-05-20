import React, { ReactNode, useEffect, useState, useRef } from 'react';
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
  
  // Define navigation structure based on the provided table
  const journeySections = [
    { 
      id: 'M1', 
      title: 'All Star Teams Introduction', 
      path: '/intro',
      steps: [
        { id: 'M1-1', label: 'Introduction Video', path: '/intro/video', type: 'Learning' },
      ]
    },
    { 
      id: 'M2', 
      title: 'Discover your Strengths', 
      path: '/discover-strengths',
      steps: [
        { id: 'M2-1', label: 'Intro to Strengths', path: '/discover-strengths/intro', type: 'Learning' },
        { id: 'M2-2', label: 'Strengths Assessment', path: '/assessment', type: 'Activity' },
        { id: 'M2-3', label: 'Star Card Preview', path: '/starcard-preview', type: 'Learning' },
        { id: 'M2-4', label: 'Reflect', path: '/discover-strengths/reflect', type: 'Writing' },
      ]
    },
    { 
      id: 'M3', 
      title: 'Find your Flow', 
      path: '/find-your-flow',
      steps: [
        { id: 'M3-1', label: 'Intro to Flow', path: '/find-your-flow/intro', type: 'Learning' },
        { id: 'M3-2', label: 'Flow Assessment', path: '/flow-assessment', type: 'Activity' },
        { id: 'M3-3', label: 'Rounding Out', path: '/rounding-out', type: 'Writing' },
        { id: 'M3-4', label: 'Add Flow to your Star Card', path: '/add-flow-starcard', type: 'Activity' },
      ]
    },
    { 
      id: 'M4', 
      title: 'Visualize your Potential', 
      path: '/visualize-potential',
      steps: [
        { id: 'M4-1', label: 'Ladder of Well-being', path: '/well-being', type: 'Learning' },
        { id: 'M4-2', label: 'Cantril Ladder', path: '/cantril-ladder', type: 'Activity and Writing' },
        { id: 'M4-3', label: 'Visualizing You', path: '/visualizing-you', type: 'Activity' },
        { id: 'M4-4', label: 'Your Future Self', path: '/future-self', type: 'Learning' },
        { id: 'M4-5', label: 'Your Statement', path: '/your-statement', type: 'Writing' },
      ]
    }
  ];
  
  // Use a ref to track if we've initialized the navigation structure
  const hasInitialized = useRef(false);
  
  // Initialize the navigation structure only once
  useEffect(() => {
    // Skip if we've already initialized
    if (hasInitialized.current) return;
    
    // Mark as initialized
    hasInitialized.current = true;
    
    // Use the journeySections we defined above 
    updateNavigationSections(journeySections);
  }, [updateNavigationSections]);
  
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