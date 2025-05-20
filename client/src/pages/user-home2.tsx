import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, StarIcon, BarChartIcon, Activity, Sparkles, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Navigation sections based on the spreadsheet
const navigationSections = [
  { 
    id: '1', 
    title: 'All star teams Introduction', 
    path: '/intro/video',
    icon: StarIcon,
    totalSteps: 1,
    completedSteps: 0,
    steps: [
      { id: '1-1', label: 'Introduction Video', path: '/intro/video', type: 'Learning', required: true }
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
      { id: '2-1', label: 'Intro to Strengths', path: '/discover-strengths/intro', type: 'Learning', required: true },
      { id: '2-2', label: 'Strengths Assessment', path: '/assessment', type: 'Activity', required: true },
      { id: '2-3', label: 'Star Card Preview', path: '/starcard-preview', type: 'Learning', required: true },
      { id: '2-4', label: 'Reflect', path: '/discover-strengths/reflect', type: 'Writing', required: true }
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
      { id: '3-1', label: 'Intro to Flow', path: '/find-your-flow/intro', type: 'Learning', required: true },
      { id: '3-2', label: 'Flow Assessment', path: '/flow-assessment', type: 'Activity', required: true },
      { id: '3-3', label: 'Rounding Out', path: '/rounding-out', type: 'Writing', required: true },
      { id: '3-4', label: 'Add Flow to Star Card', path: '/add-flow-starcard', type: 'Activity', required: true }
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
      { id: '4-1', label: 'Ladder of Well-being', path: '/well-being', type: 'Learning', required: true },
      { id: '4-2', label: 'Cantril Ladder', path: '/cantril-ladder', type: 'Activity and Writing', required: true },
      { id: '4-3', label: 'Visualizing You', path: '/visualizing-you', type: 'Activity', required: true },
      { id: '4-4', label: 'Your Future Self', path: '/future-self', type: 'Learning', required: true },
      { id: '4-5', label: 'Your Statement', path: '/your-statement', type: 'Writing', required: true }
    ]
  }
];

// Local storage key for navigation progress
const PROGRESS_STORAGE_KEY = 'allstar_navigation_progress';

export default function UserHome2() {
  const [location, navigate] = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  
  // Fetch user profile data
  const { data: user } = useQuery<{
    id: number;
    name: string;
    username: string;
    title?: string;
    organization?: string;
  }>({ queryKey: ['/api/user/profile'] });
  
  // Load progress from localStorage
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
  
  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };
  
  // Mark a step as completed
  const markStepCompleted = (stepId: string) => {
    if (!completedSteps.includes(stepId)) {
      const newCompletedSteps = [...completedSteps, stepId];
      setCompletedSteps(newCompletedSteps);
      localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify({ completed: newCompletedSteps }));
    }
  };
  
  // Function to determine if a step is accessible
  const isStepAccessible = (sectionId: string, stepId: string) => {
    const sectionIndex = parseInt(sectionId) - 1;
    const stepIndex = parseInt(stepId.split('-')[1]) - 1;
    
    // If it's the first step of the first section, it's always accessible
    if (sectionIndex === 0 && stepIndex === 0) return true;
    
    // For the first step of other sections, check if all steps in previous section are completed
    if (stepIndex === 0 && sectionIndex > 0) {
      const prevSection = navigationSections[sectionIndex - 1];
      return prevSection.steps.every(step => completedSteps.includes(step.id));
    }
    
    // For other steps, check if the previous step in the same section is completed
    const prevStepId = `${sectionId}-${stepIndex}`;
    return completedSteps.includes(prevStepId);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Retractable Navigation Drawer */}
      <div 
        className={cn(
          "h-full transition-all duration-300 ease-in-out bg-white border-r border-gray-200 shadow-sm",
          drawerOpen ? "w-80" : "w-16"
        )}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          {drawerOpen && <h2 className="font-semibold text-gray-800">Your Learning Journey</h2>}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={toggleDrawer}
            className="rounded-full ml-auto"
          >
            {drawerOpen ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
          </Button>
        </div>
        
        {/* Navigation Sections */}
        <div className="overflow-y-auto h-[calc(100%-64px)]">
          {navigationSections.map((section) => (
            <div key={section.id} className="border-b border-gray-100">
              {/* Section Header */}
              <div 
                className={cn(
                  "flex items-center px-4 py-3 hover:bg-gray-50 cursor-pointer",
                  drawerOpen ? "" : "justify-center"
                )}
              >
                <div className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium bg-indigo-100 text-indigo-700",
                )}>
                  {section.id}
                </div>
                
                {drawerOpen && (
                  <>
                    <div className="ml-3 flex-1">
                      <div className="text-sm font-medium text-gray-800">{section.title}</div>
                      <div className="text-xs text-gray-500">
                        {section.completedSteps} of {section.totalSteps} complete
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </>
                )}
              </div>
              
              {/* Section Steps (only visible when drawer is open) */}
              {drawerOpen && (
                <div className="pl-6 pr-2 pb-2">
                  {section.steps.map((step) => {
                    const accessible = isStepAccessible(section.id, step.id);
                    const completed = completedSteps.includes(step.id);
                    
                    return (
                      <TooltipProvider key={step.id}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div 
                              onClick={() => accessible && navigate(step.path)}
                              className={cn(
                                "flex items-center px-4 py-2 my-1 rounded-md text-sm",
                                accessible 
                                  ? "cursor-pointer hover:bg-gray-100" 
                                  : "opacity-60 cursor-not-allowed",
                                completed && "bg-green-50 text-green-800"
                              )}
                            >
                              <div className="text-xs w-6 text-gray-400">{step.id}</div>
                              <div className="ml-2">{step.label}</div>
                              {!accessible && (
                                <Lock className="ml-2 h-3 w-3 text-gray-400" />
                              )}
                              {step.required && (
                                <div className="ml-auto text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700">
                                  Required
                                </div>
                              )}
                            </div>
                          </TooltipTrigger>
                          {!accessible && (
                            <TooltipContent>
                              <p>Complete previous steps first</p>
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </TooltipProvider>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Welcome to All-Star Teams Workshop</h1>
          
          <div className="prose max-w-none">
            <p className="text-lg text-gray-700 mb-6">
              Welcome to the All-Star Teams workshop! Through this journey, you'll 
              discover your unique strengths profile and learn how to leverage it in your 
              professional life.
            </p>
            
            <Card className="mb-8">
              <CardContent className="p-0 overflow-hidden">
                <div className="aspect-w-16 aspect-h-9">
                  <iframe 
                    src="https://www.youtube.com/embed/lcjao1ob55A?enablejsapi=1"
                    title="AllStarTeams Workshop Introduction"
                    className="w-full h-[400px]" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                  ></iframe>
                </div>
              </CardContent>
            </Card>
            
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">The workshop has these main components:</h2>
            
            <ul className="space-y-3 mb-8">
              <li className="flex items-start">
                <div className="h-6 w-6 rounded-full bg-purple-100 text-purple-800 flex items-center justify-center mr-3 mt-0.5">•</div>
                <span>Complete your profile information</span>
              </li>
              <li className="flex items-start">
                <div className="h-6 w-6 rounded-full bg-purple-100 text-purple-800 flex items-center justify-center mr-3 mt-0.5">•</div>
                <span>Take the Star Strengths Assessment (10-15 minutes)</span>
              </li>
              <li className="flex items-start">
                <div className="h-6 w-6 rounded-full bg-purple-100 text-purple-800 flex items-center justify-center mr-3 mt-0.5">•</div>
                <span>Review your Star Profile and strengths</span>
              </li>
              <li className="flex items-start">
                <div className="h-6 w-6 rounded-full bg-purple-100 text-purple-800 flex items-center justify-center mr-3 mt-0.5">•</div>
                <span>Explore your flow attributes</span>
              </li>
              <li className="flex items-start">
                <div className="h-6 w-6 rounded-full bg-purple-100 text-purple-800 flex items-center justify-center mr-3 mt-0.5">•</div>
                <span>Visualize your future potential</span>
              </li>
              <li className="flex items-start">
                <div className="h-6 w-6 rounded-full bg-purple-100 text-purple-800 flex items-center justify-center mr-3 mt-0.5">•</div>
                <span>Integrate insights into your professional life</span>
              </li>
            </ul>
            
            <div className="flex justify-start">
              <Button 
                onClick={() => {
                  markStepCompleted('1-1');
                  navigate('/intro/video');
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white"
                size="lg"
              >
                Begin Your Learning Journey
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}