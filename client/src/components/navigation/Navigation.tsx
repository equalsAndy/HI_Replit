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
  
  // Define navigation structure based on the provided image and table content
  const journeySections = [
    { 
      id: '1', 
      title: 'Foundations', 
      path: '/foundations',
      totalSteps: 3,
      completedSteps: 0,
      icon: 'BookOpen',
      steps: [
        { id: '1-1', label: 'Welcome', path: '/foundations', type: 'Learning' },
        { id: '1-2', label: 'Your Learning Journey', path: '/learning-overview', type: 'Learning' },
        { id: '1-3', label: 'Understanding Strengths', path: '/strength-model', type: 'Learning' },
      ]
    },
    { 
      id: '2', 
      title: 'Reflect On Your Strengths', 
      path: '/core-strengths',
      totalSteps: 3,
      completedSteps: 0,
      icon: 'Star',
      steps: [
        { id: '2-1', label: 'Core Strengths Overview', path: '/core-strengths', type: 'Learning' },
        { id: '2-2', label: 'Strength Reflection', path: '/strength-reflection', type: 'Writing' },
        { id: '2-3', label: 'Knowledge Check', path: '/strength-check', type: 'Activity' },
      ]
    },
    { 
      id: '3', 
      title: 'Identify Your Flow', 
      path: '/flow-assessment',
      totalSteps: 3,
      completedSteps: 0,
      icon: 'Clock',
      steps: [
        { id: '3-1', label: 'Flow Assessment', path: '/flow-assessment', type: 'Activity' },
        { id: '3-2', label: 'Find Your Flow', path: '/find-your-flow', type: 'Learning' },
        { id: '3-3', label: 'Flow Attributes', path: '/flow-attributes', type: 'Activity' },
      ]
    },
    { 
      id: '4', 
      title: 'Rounding Out', 
      path: '/rounding-out',
      totalSteps: 3,
      completedSteps: 0,
      icon: 'Target',
      steps: [
        { id: '4-1', label: 'Balance Your Strengths', path: '/rounding-out', type: 'Learning' },
        { id: '4-2', label: 'Team Integration', path: '/team-integration', type: 'Learning' },
        { id: '4-3', label: 'Practice Scenarios', path: '/practice-scenarios', type: 'Activity' },
      ]
    },
    { 
      id: '5', 
      title: 'Complete Your Star Card', 
      path: '/star-card-overview',
      totalSteps: 2,
      completedSteps: 0,
      icon: 'CheckCircle',
      steps: [
        { id: '5-1', label: 'Star Card Overview', path: '/star-card-overview', type: 'Learning' },
        { id: '5-2', label: 'Your Star Card', path: '/report', type: 'Summary' },
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