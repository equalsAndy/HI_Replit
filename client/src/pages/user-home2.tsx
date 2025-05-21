import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  ChevronLeft, ChevronRight, StarIcon, BarChartIcon, 
  Activity, Sparkles, Lock, BookOpen, ClipboardCheck, Edit, Star,
  CheckCircle, FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AssessmentModal } from '@/components/assessment/AssessmentModal';
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

// Local storage key for navigation progress
const PROGRESS_STORAGE_KEY = 'allstar_navigation_progress';

export default function UserHome2() {
  const [location, navigate] = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [currentContent, setCurrentContent] = useState<string>("welcome");
  const [isAssessmentModalOpen, setIsAssessmentModalOpen] = useState(false);
  
  // Fetch user profile data
  const { data: user } = useQuery<{
    id: number;
    name: string;
    username: string;
    title?: string;
    organization?: string;
  }>({ queryKey: ['/api/user/profile'] });
  
  // Fetch star card data
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

  // Handle assessment completion
  const handleAssessmentComplete = (result: any) => {
    // Mark the assessment step as completed
    markStepCompleted('2-2');
    // You may want to update other state or navigate after assessment completes
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Assessment Modal */}
      <AssessmentModal 
        isOpen={isAssessmentModalOpen} 
        onClose={() => setIsAssessmentModalOpen(false)}
        onComplete={handleAssessmentComplete}
      />
      
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
                              onClick={() => {
                                if (accessible) {
                                  // Handle navigation based on the specific step
                                  if (step.id === '2-1') { 
                                    // If it's "Intro to Strengths", show the content in-place
                                    setCurrentContent("intro-strengths");
                                    markStepCompleted(step.id);
                                  } else if (step.id === '2-2') {
                                    // If it's "Strengths Assessment", show the content in the right panel
                                    setCurrentContent("strengths-assessment");
                                    // Don't mark as completed yet - will do that after assessment
                                  } else if (step.id === '2-3') {
                                    // If it's "Star Card Preview", show the star card preview content
                                    setCurrentContent("star-card-preview");
                                    markStepCompleted(step.id);
                                  } else if (step.id === '2-4') {
                                    // If it's "Reflect", show the reflection content
                                    setCurrentContent("reflection");
                                    markStepCompleted(step.id);
                                  } else if (step.id === '3-1') {
                                    // If it's "Intro to Flow", show the flow intro content
                                    setCurrentContent("intro-flow");
                                    markStepCompleted(step.id);
                                  } else {
                                    // For other pages, navigate to their routes
                                    navigate(step.path);
                                  }
                                }
                              }}
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
          {currentContent === "welcome" && (
            <>
              <h1 className="text-3xl font-bold text-gray-900 mb-6">Welcome to AllStarTeams Workshop</h1>
              
              <div className="prose max-w-none">
                <p className="text-lg text-gray-700 mb-6">
                  Welcome to the AllStarTeams workshop! Through this journey, you'll 
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
            </>
          )}

          {currentContent === "strengths-assessment" && (
            <>
              <h1 className="text-3xl font-bold text-gray-900 mb-6">Strengths Assessment</h1>
              
              <div className="prose max-w-none">
                <p className="text-lg mb-6">
                  The AllStarTeams Strengths Assessment helps you discover your unique strengths profile across four key dimensions: Thinking, Acting, Feeling, and Planning.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-blue-50 rounded-lg p-5 shadow-sm">
                    <h3 className="font-medium text-blue-800 mb-3 text-lg">About this assessment</h3>
                    <ul className="text-blue-700 space-y-3">
                      <li className="flex items-start">
                        <ClipboardCheck className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                        <span>22 questions about how you approach work and collaboration</span>
                      </li>
                      <li className="flex items-start">
                        <ClipboardCheck className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Takes approximately 10-15 minutes to complete</span>
                      </li>
                      <li className="flex items-start">
                        <ClipboardCheck className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Rank options based on how well they describe you</span>
                      </li>
                      <li className="flex items-start">
                        <ClipboardCheck className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Creates your personal Star Card showing your strengths distribution</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="bg-amber-50 rounded-lg p-5 shadow-sm">
                    <h3 className="font-medium text-amber-800 mb-3 text-lg">Instructions</h3>
                    <p className="text-amber-700">
                      For each scenario, drag and drop the options to rank them from most like you (1) to least 
                      like you (4). There are no right or wrong answers - just be honest about your preferences.
                    </p>
                  </div>
                </div>
                
                <div className="bg-green-50 rounded-lg p-5 shadow-sm mb-8">
                  <h3 className="font-medium text-green-800 mb-3 text-lg flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2" /> What you'll get
                  </h3>
                  <p className="text-green-700">
                    Your personal Star Card showing your unique distribution of strengths across the four 
                    dimensions: Thinking, Acting, Feeling, and Planning. This will guide your learning journey
                    through the rest of the AllStarTeams program.
                  </p>
                </div>
                
                <div className="flex justify-center">
                  <Button 
                    onClick={() => setIsAssessmentModalOpen(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-6 text-lg"
                    size="lg"
                  >
                    Start Assessment <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </div>
            </>
          )}
          
          {currentContent === "star-card-preview" && (
            <>
              <h1 className="text-3xl font-bold text-gray-900 mb-6">Your Star Profile + Star Card</h1>
              
              <div className="prose max-w-none">
                <p className="text-lg mb-6">
                  Your Star Profile captures your current strengths and growth edge. It's not a fixed label — it's a reflection of where you are now in
                  your development journey.
                </p>
              </div>
              
              <div className="flex flex-col md:flex-row gap-6 mt-6">
                <div className="md:w-1/2">
                  <div className="aspect-w-16 aspect-h-9">
                    <iframe 
                      src="https://www.youtube.com/embed/x6h7LDtdnJw" 
                      title="Star Profile Review" 
                      frameBorder="0" 
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                      allowFullScreen
                      className="w-full h-full rounded border border-gray-200"
                    ></iframe>
                  </div>
                </div>
                
                <div className="md:w-1/2">
                  <div className="border border-gray-200 rounded-md overflow-hidden bg-white h-full">
                    <div className="p-4 border-b border-gray-200 bg-gray-50">
                      <h3 className="text-xl font-bold text-center">Your Star Card</h3>
                    </div>
                    <div className="p-4 flex justify-center">
                      <div className="w-full">
                        <StarCard 
                          thinking={starCard?.thinking || 0}
                          acting={starCard?.acting || 0}
                          feeling={starCard?.feeling || 0}
                          planning={starCard?.planning || 0}
                          imageUrl={starCard?.imageUrl || null}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 my-6">
                <h3 className="text-indigo-700 font-medium mb-2">This exercise invites you to:</h3>
                <ul className="space-y-2 text-indigo-700">
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0 text-indigo-700" />
                    <span>Reflect on your apex strength and how it shows up</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0 text-indigo-700" />
                    <span>Consider how your profile shifts over time and in different roles</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0 text-indigo-700" />
                    <span>Use your Star Card as a personal development compass</span>
                  </li>
                </ul>
              </div>

              <p className="prose max-w-none">
                Watch the short video, then explore your profile with fresh eyes.
              </p>

              <div className="flex justify-end mt-6">
                <Button 
                  onClick={() => {
                    markStepCompleted('2-3');
                    setCurrentContent("reflection");
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-8"
                  size="lg"
                >
                  Continue to Reflection
                </Button>
              </div>
            </>
          )}
          
          {currentContent === "reflection" && (
            <>
              <h1 className="text-3xl font-bold text-gray-900 mb-6">Reflect on Your Strengths</h1>
              
              <div className="flex justify-end mb-4">
                <Button
                  onClick={() => {
                    const fillWithDemoData = document.getElementById('fillDemoDataButton');
                    if (fillWithDemoData) {
                      fillWithDemoData.click();
                    }
                  }}
                  variant="outline"
                  className="bg-white text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Demo Data
                </Button>
              </div>
              
              <StepByStepReflection starCard={starCard} />
            </>
          )}
          
          {currentContent === "intro-flow" && (
            <>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Understanding Flow State</h1>
              
              <div className="flex flex-col md:flex-row gap-6 mb-4">
                <div className="md:w-1/2">
                  <div className="aspect-w-16 aspect-h-9">
                    <iframe 
                      src="https://www.youtube.com/embed/JxdhWd8agmE" 
                      title="Introduction to Flow State" 
                      frameBorder="0" 
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                      allowFullScreen
                      className="w-full h-52 rounded border border-gray-200"
                    ></iframe>
                  </div>
                </div>
                
                <div className="md:w-1/2">
                  <div className="prose">
                    <p className="mb-3">
                      Flow is a state of complete immersion in an activity, characterized by energized focus, full involvement, 
                      and enjoyment in the process. It's often described as being "in the zone" - when time seems to disappear 
                      and you're completely absorbed in what you're doing.
                    </p>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Benefits of Flow State</h3>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                      <li>Higher productivity and performance</li>
                      <li>Increased creativity and innovation</li>
                      <li>Greater work satisfaction and well-being</li>
                      <li>Reduced stress and burnout</li>
                      <li>More meaningful and engaging experiences</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100">
                  <h3 className="text-indigo-700 font-medium mb-1 text-sm">Clear Goals</h3>
                  <p className="text-xs">You know exactly what you need to accomplish and can measure your progress.</p>
                </div>
                
                <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
                  <h3 className="text-purple-700 font-medium mb-1 text-sm">Challenge & Skill Balance</h3>
                  <p className="text-xs">The task is challenging enough to engage you but not so difficult that it causes anxiety.</p>
                </div>
                
                <div className="bg-teal-50 p-3 rounded-lg border border-teal-100">
                  <h3 className="text-teal-700 font-medium mb-1 text-sm">Immediate Feedback</h3>
                  <p className="text-xs">You can quickly tell how well you're doing, allowing for adjustment in real-time.</p>
                </div>
                
                <div className="bg-amber-50 p-3 rounded-lg border border-amber-100">
                  <h3 className="text-amber-700 font-medium mb-1 text-sm">Deep Concentration</h3>
                  <p className="text-xs">Your attention is completely focused on the task at hand, with no distractions.</p>
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-4">
                <p className="text-blue-800 text-sm">
                  In the upcoming assessment, you'll answer questions to determine your flow profile - how often you experience flow, 
                  what triggers it for you, and how to create more flow experiences in your work.
                </p>
              </div>
              
              <div className="flex justify-end">
                <Button 
                  onClick={() => {
                    navigate('/find-your-flow/assessment');
                  }}
                  className="bg-indigo-700 hover:bg-indigo-800"
                >
                  Next: Flow Assessment
                </Button>
              </div>
            </>
          )}
          
          {currentContent === "intro-strengths" && (
            <>
              <h1 className="text-3xl font-bold text-gray-900 mb-6">Intro to Strengths</h1>
              
              <div className="prose max-w-none">
                <div className="aspect-w-16 aspect-h-9 mb-4">
                  <iframe 
                    src="https://www.youtube.com/embed/ao04eaeDIFQ" 
                    title="Introduction to AllStarTeams" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                    className="w-full h-80 rounded border border-gray-200"
                  ></iframe>
                </div>

                <h2 className="text-2xl font-bold mt-8 mb-4">The Four Quadrants of Strengths</h2>
                <p>
                  The AllStarTeams framework identifies four key quadrants of strengths that every person possesses in different proportions:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
                  <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                    <h3 className="text-green-700 font-medium mb-2">Thinking</h3>
                    <p className="text-sm">The ability to analyze, strategize, and process information logically. People strong in this quadrant excel at problem-solving and critical thinking.</p>
                  </div>

                  <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                    <h3 className="text-red-700 font-medium mb-2">Acting</h3>
                    <p className="text-sm">The ability to take decisive action, implement plans, and get things done. People strong in this quadrant are proactive and results-oriented.</p>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <h3 className="text-blue-700 font-medium mb-2">Feeling</h3>
                    <p className="text-sm">The ability to connect with others, empathize, and build relationships. People strong in this quadrant excel in team environments and social settings.</p>
                  </div>

                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                    <h3 className="text-yellow-700 font-medium mb-2">Planning</h3>
                    <p className="text-sm">The ability to organize, structure, and create systems. People strong in this quadrant excel at creating order and maintaining processes.</p>
                  </div>
                </div>

                <h3 className="text-xl font-bold mb-4">Your Assessment Journey</h3>
                <p>
                  In the upcoming assessment, you'll answer a series of questions designed to identify your natural strengths across these four quadrants. For each scenario, you'll rank options from "most like me" to "least like me."
                </p>
                <p>
                  Remember: There are no right or wrong answers. The goal is to identify your authentic strengths so you can leverage them more effectively.
                </p>
                
                <div className="flex justify-end mt-6">
                  <Button 
                    onClick={() => navigate('/assessment')}
                    className="bg-indigo-700 hover:bg-indigo-800"
                  >
                    Take Assessment
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}