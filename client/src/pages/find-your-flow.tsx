import React, { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import MainContainer from '@/components/layout/MainContainer';
import FlowAssessment from '@/components/flow/FlowAssessment';

// Define the user type based on the app's data structure
interface UserType {
  id: number;
  name: string;
  title: string;
  organization: string;
  progress: number;
  avatarUrl?: string;
}

export default function FindYourFlow() {
  const [location, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("intro");
  const [completedTabs, setCompletedTabs] = useState<string[]>([]);
  const { toast } = useToast();
  
  // Get user profile to determine progress
  const { data: user, isLoading: userLoading } = useQuery<UserType>({
    queryKey: ['/api/user/profile'],
    staleTime: Infinity,
  });
  
  // Check if a tab should be disabled
  const isTabDisabled = (tabId: string): boolean => {
    // The first tab is always accessible
    if (tabId === "intro") return false;
    
    // For sequential progression
    const tabSequence = ["intro", "assessment", "reflect"];
    const currentIndex = tabSequence.indexOf(activeTab);
    const targetIndex = tabSequence.indexOf(tabId);
    
    // Can only access tabs that are:
    // 1. The current tab
    // 2. Already completed tabs
    // 3. The next tab in sequence
    return !completedTabs.includes(tabId) && tabId !== activeTab && targetIndex > currentIndex + 1;
  };
  
  // Handle tab change
  const handleTabChange = (tabId: string) => {
    if (!isTabDisabled(tabId)) {
      setActiveTab(tabId);
      if (!completedTabs.includes(activeTab)) {
        setCompletedTabs(prev => [...prev, activeTab]);
      }
    }
  };

  // Show loading state
  if (userLoading) {
    return (
      <MainContainer showStepNavigation={false} className="bg-white">
        <div className="text-center">
          <p className="text-lg">Loading your profile information...</p>
        </div>
      </MainContainer>
    );
  }
  
  return (
    <MainContainer showStepNavigation={false} className="bg-white">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-indigo-700">Finding Your Flow State</h1>
        <p className="text-gray-600">Learn about the flow and discover how to optimize your work experience</p>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="intro" data-value="intro">Flow Intro</TabsTrigger>
            <TabsTrigger value="assessment" data-value="assessment" disabled={isTabDisabled("assessment")}>
              {isTabDisabled("assessment") ? (
                <span className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H8m10-4a6 6 0 11-12 0 6 6 0 0112 0z" />
                  </svg>
                  Flow Assessment
                </span>
              ) : "Flow Assessment"}
            </TabsTrigger>
            <TabsTrigger value="reflect" data-value="reflect" disabled={isTabDisabled("reflect")}>
              {isTabDisabled("reflect") ? (
                <span className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H8m10-4a6 6 0 11-12 0 6 6 0 0112 0z" />
                  </svg>
                  Reflect
                </span>
              ) : "Reflect"}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="intro" className="space-y-6">
            <div className="aspect-w-16 aspect-h-9 mb-4">
              <iframe 
                src="https://www.youtube.com/embed/Le_HtpWziQE" 
                title="Introduction to Flow State" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
                className="w-full h-80 rounded border border-gray-200"
              ></iframe>
            </div>
            
            <div className="prose max-w-none">
              <h2>Understanding Flow State</h2>
              <p>
                Flow is a state of complete immersion in an activity, characterized by energized focus, full involvement, 
                and enjoyment in the process. It's often described as being "in the zone" - when time seems to disappear 
                and you're completely absorbed in what you're doing.
              </p>
              
              <div className="grid grid-cols-2 gap-6 my-8">
                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                  <h3 className="text-indigo-700 font-medium mb-2">Clear Goals</h3>
                  <p className="text-sm">You know exactly what you need to accomplish and can measure your progress.</p>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                  <h3 className="text-purple-700 font-medium mb-2">Balance of Challenge & Skill</h3>
                  <p className="text-sm">The task is challenging enough to engage you but not so difficult that it causes anxiety.</p>
                </div>
                
                <div className="bg-teal-50 p-4 rounded-lg border border-teal-100">
                  <h3 className="text-teal-700 font-medium mb-2">Immediate Feedback</h3>
                  <p className="text-sm">You can quickly tell how well you're doing, allowing for adjustment in real-time.</p>
                </div>
                
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
                  <h3 className="text-amber-700 font-medium mb-2">Deep Concentration</h3>
                  <p className="text-sm">Your attention is completely focused on the task at hand, with no distractions.</p>
                </div>
              </div>
              
              <h3>Benefits of Flow State</h3>
              <p>
                Regularly experiencing flow is associated with:
              </p>
              <ul>
                <li>Higher productivity and performance</li>
                <li>Increased creativity and innovation</li>
                <li>Greater work satisfaction and well-being</li>
                <li>Reduced stress and burnout</li>
                <li>More meaningful and engaging experiences</li>
              </ul>
              
              <p>
                In the upcoming assessment, you'll answer questions to determine your flow profile - how often you experience flow, 
                what triggers it for you, and how to create more flow experiences in your work.
              </p>
            </div>
            
            <div className="flex justify-end mt-6">
              <Button 
                onClick={() => handleTabChange("assessment")}
                className="bg-indigo-700 hover:bg-indigo-800"
              >
                Next: Flow Assessment
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="assessment" className="space-y-6">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-gray-800 mb-2">Your Flow State Self-Assessment</h2>
              <p className="text-gray-700">
                <span className="font-medium">Purpose:</span> This exercise is designed to help you easily understand what "flow" is and recognize when you are in it, personally and professionally.
              </p>
              <p className="text-gray-700 mt-2">
                <span className="font-medium">Instructions:</span> Rate your agreement with each of the following statements on a scale from 1 (Never) to 5 (Always). Answer with a specific activity or task in mind where you most often seek or experience flow.
              </p>
            </div>
            
            <FlowAssessment />
            
            <div className="flex justify-end mt-6">
              <Button 
                onClick={() => handleTabChange("reflect")}
                className="bg-indigo-700 hover:bg-indigo-800"
              >
                Next: Reflect on Your Flow
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="reflect" className="space-y-6">
            <div className="prose max-w-none mb-6">
              <h2>Reflect on Your Flow State</h2>
              <p>
                Now that you've completed the flow assessment, take some time to reflect on your personal flow experiences 
                and how you can create more opportunities for flow in your work and life.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                {/* Form for flow reflection */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">What activities or tasks consistently put you in a flow state?</label>
                    <Textarea 
                      placeholder="Your answer" 
                      className="min-h-[80px] border border-gray-300 w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">What are the biggest barriers to experiencing flow in your work?</label>
                    <Textarea 
                      placeholder="Your answer" 
                      className="min-h-[80px] border border-gray-300 w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">What conditions help you get into flow more easily?</label>
                    <Textarea 
                      placeholder="Your answer" 
                      className="min-h-[80px] border border-gray-300 w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">What one change could you make to experience more flow in your work?</label>
                    <Textarea 
                      placeholder="Your answer" 
                      className="min-h-[80px] border border-gray-300 w-full"
                    />
                  </div>
                  
                  <div className="flex space-x-3 mt-8">
                    <Button type="button" variant="outline" className="px-8">
                      Return
                    </Button>
                    <Button type="button" className="bg-indigo-600 hover:bg-indigo-700 text-white px-8">
                      Save
                    </Button>
                  </div>
                </div>
              </div>
              
              <div>
                <div className="aspect-video mb-6 relative">
                  <iframe 
                    className="w-full h-full"
                    src="https://www.youtube.com/embed/Le_HtpWziQE" 
                    title="Flow State Reflection" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen>
                  </iframe>
                </div>
                
                <div className="text-center bg-blue-50 rounded-lg p-4 border border-blue-100">
                  <h3 className="uppercase font-bold text-lg mb-2 text-blue-700">Flow State Resources</h3>
                  <p className="text-sm text-gray-700 mb-2">
                    Download our guide to creating more flow experiences in your daily work:
                  </p>
                  <a href="#" className="text-blue-600 hover:text-blue-800 text-sm">
                    Flow State Guide PDF
                  </a>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end mt-6">
              <Link href="/user-home">
                <Button className="bg-indigo-700 hover:bg-indigo-800">
                  Return to Dashboard
                </Button>
              </Link>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainContainer>
  );
}