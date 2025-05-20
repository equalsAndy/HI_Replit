import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Star, Timer, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Link } from 'wouter';
import { useNavigationProgress } from '@/hooks/use-navigation-progress';
import { useApplication } from '@/hooks/use-application';
import { cn } from '@/lib/utils';

interface NavigationHeaderProps {
  showLogo?: boolean;
  showProgress?: boolean;
  showStarCardButton?: boolean;
}

export function NavigationHeader({
  showLogo = true,
  showProgress = true,
  showStarCardButton = true
}: NavigationHeaderProps) {
  const [location, navigate] = useLocation();
  const { appLogo, appName } = useApplication();
  const { progress, calculateOverallProgress, currentStepId } = useNavigationProgress();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  
  // Calculate total estimated time for remaining steps
  const getRemainingTime = (): number => {
    if (!progress?.sections) return 0;
    
    const allSteps = progress.sections.flatMap(section => section.steps);
    const remainingSteps = allSteps.filter(step => 
      !progress.completedSteps.includes(step.id) && 
      step.estimatedTime !== undefined
    );
    
    return remainingSteps.reduce((total, step) => total + (step.estimatedTime || 0), 0);
  };
  
  // Get current section and step
  const getCurrentSectionAndStep = () => {
    if (!progress?.sections || !currentStepId) return { section: null, step: null };
    
    for (const section of progress.sections) {
      const step = section.steps.find(step => step.id === currentStepId);
      if (step) {
        return { section, step };
      }
    }
    
    return { section: null, step: null };
  };
  
  // Handle scroll event to create sticky header effect
  useEffect(() => {
    const handleScroll = () => {
      const position = window.scrollY;
      setScrollPosition(position);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  const progressPercentage = calculateOverallProgress();
  const remainingTime = getRemainingTime();
  const { section: currentSection, step: currentStep } = getCurrentSectionAndStep();
  const isHeaderSticky = scrollPosition > 50;
  
  return (
    <>
      <header className={cn(
        "bg-white border-b border-gray-200 transition-all duration-300",
        isHeaderSticky ? "fixed top-0 left-0 right-0 shadow-md z-50" : ""
      )}>
        <div className="container mx-auto px-3">
          {/* Main header row with logo and actions */}
          <div className="h-16 flex justify-between items-center">
            {showLogo && (
              <Link href="/" className="logo flex items-center cursor-pointer">
                <img 
                  src={appLogo} 
                  alt={appName} 
                  className="h-8 w-auto"
                />
              </Link>
            )}
            
            <div className="flex items-center space-x-4">
              {/* Mobile menu toggle */}
              <Button 
                variant="ghost" 
                size="icon" 
                className="md:hidden" 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
              
              {/* Estimated time remaining */}
              {remainingTime > 0 && (
                <div className="hidden md:flex items-center text-sm text-gray-600">
                  <Timer className="h-4 w-4 mr-1.5" />
                  <span>{remainingTime} min remaining</span>
                </div>
              )}
              
              {/* Star Card button */}
              {showStarCardButton && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="hidden md:flex items-center text-xs h-8"
                  onClick={() => navigate('/report')}
                >
                  <Star className="h-3.5 w-3.5 mr-1" />
                  Star Card
                </Button>
              )}
              
              {/* Dashboard link */}
              <Button variant="outline" size="sm" className="hidden md:block rounded-md text-xs h-8" asChild>
                <Link href="/user-home">Dashboard</Link>
              </Button>
            </div>
          </div>
          
          {/* Progress section */}
          {showProgress && (
            <div className="py-2 border-t border-gray-100">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                {/* Current section/step info */}
                <div className="mb-2 md:mb-0">
                  {currentSection && (
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-500">{currentSection.title}</span>
                      {currentStep && (
                        <span className="text-base font-medium">{currentStep.label}</span>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Progress bar */}
                <div className="flex-1 max-w-xs md:max-w-md">
                  <div className="flex items-center space-x-2">
                    <Progress value={progressPercentage} className="h-2" />
                    <span className="text-xs font-medium text-gray-600">{progressPercentage}%</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-white md:hidden pt-16">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex flex-col space-y-2">
              <Link href="/user-home" className="px-4 py-3 border-b border-gray-100">
                Dashboard
              </Link>
              <Link href="/report" className="px-4 py-3 border-b border-gray-100">
                Star Card
              </Link>
              {/* Add more mobile navigation items as needed */}
            </nav>
          </div>
        </div>
      )}
      
      {/* Spacer for fixed header */}
      {isHeaderSticky && <div className="h-16" />}
      
      {/* Floating Star Card Button (visible only on mobile) */}
      {showStarCardButton && (
        <div className="fixed bottom-6 right-6 md:hidden z-40">
          <Button 
            size="icon" 
            className="h-14 w-14 rounded-full shadow-lg bg-indigo-600 hover:bg-indigo-700 text-white"
            onClick={() => navigate('/report')}
          >
            <Star className="h-6 w-6" />
          </Button>
        </div>
      )}
    </>
  );
}