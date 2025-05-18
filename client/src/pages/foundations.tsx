import React, { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import StarCard from "@/components/starcard/StarCard";
import { QuadrantData, ProfileData } from "@shared/schema";
import Header from "@/components/layout/Header";
import { AssessmentPieChart } from "@/components/assessment/AssessmentPieChart";

// Define quadrant colors
const QUADRANT_COLORS = {
  thinking: 'rgb(1, 162, 82)',    // Green
  acting: 'rgb(241, 64, 64)',     // Red
  feeling: 'rgb(22, 126, 253)',   // Blue
  planning: 'rgb(255, 203, 47)'   // Yellow
} as const;

// Helper function to map attribute names to their color
function getAttributeColor(attrName: string): string {
  // Default to primary colors by category
  const attrColorMap: { [key: string]: string } = {
    // Thinking quadrant attributes (green)
    'Analytical': 'rgb(1, 162, 82)',
    'Strategic': 'rgb(1, 162, 82)',
    'Thoughtful': 'rgb(1, 162, 82)',
    'Clever': 'rgb(1, 162, 82)',
    'Innovative': 'rgb(1, 162, 82)',
    
    // Acting quadrant attributes (red)
    'Energetic': 'rgb(241, 64, 64)',
    'Bold': 'rgb(241, 64, 64)',
    'Decisive': 'rgb(241, 64, 64)',
    'Proactive': 'rgb(241, 64, 64)',
    'Persistent': 'rgb(241, 64, 64)',
    
    // Feeling quadrant attributes (blue)
    'Empathetic': 'rgb(22, 126, 253)',
    'Friendly': 'rgb(22, 126, 253)',
    'Supportive': 'rgb(22, 126, 253)',
    'Compassionate': 'rgb(22, 126, 253)',
    'Intuitive': 'rgb(22, 126, 253)',
    
    // Planning quadrant attributes (yellow)
    'Organized': 'rgb(255, 203, 47)',
    'Meticulous': 'rgb(255, 203, 47)',
    'Reliable': 'rgb(255, 203, 47)',
    'Consistent': 'rgb(255, 203, 47)',
    'Practical': 'rgb(255, 203, 47)',
  };
  
  return attrColorMap[attrName] || 'rgb(100, 100, 100)'; // Default gray if not found
}

// Define the user type based on the app's data structure
interface UserType {
  id: number;
  name: string;
  title: string;
  organization: string;
  progress: number;
  avatarUrl?: string;
}

// StarCard type definition
interface StarCardType {
  id?: number;
  userId: number;
  thinking: number;
  acting: number;
  feeling: number;
  planning: number;
  state?: string; // 'empty', 'partial', or 'complete'
  createdAt?: string;
  imageUrl?: string | null;
}

export default function Foundations() {
  // Location hook for navigation
  const [location, navigate] = useLocation();
  // Get URL parameters to determine the default tab
  const searchParams = new URLSearchParams(window.location.search);
  // Use URL parameter tab as the default tab
  const defaultTab = searchParams.get('tab') || 'intro';
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [completedTabs, setCompletedTabs] = useState<string[]>([]);

  // Get user profile and star card data to determine progress
  const { data: user } = useQuery<UserType>({
    queryKey: ['/api/user/profile'],
    staleTime: Infinity,
  });

  const { data: starCard } = useQuery<StarCardType>({
    queryKey: ['/api/starcard'],
    enabled: !!user,
    staleTime: Infinity,
  });
  
  // Get flow attributes data
  const { data: flowAttributes } = useQuery<{ attributes: any[] }>({
    queryKey: ['/api/flow-attributes'],
    enabled: !!user,
    staleTime: Infinity,
  });

  // Check if a tab should be disabled
  const isTabDisabled = (tabId: string): boolean => {
    // The first tab is always accessible
    if (tabId === "intro") return false;

    // Check assessment completion status for StarCard tab
    if (tabId === "starcard") {
      // If no starCard exists, disable the tab
      if (!starCard) return true;
      
      // Enable tab if any quadrant has a score greater than 0 (regardless of pending status)
      if (starCard.thinking > 0 || starCard.acting > 0 || starCard.feeling > 0 || starCard.planning > 0) {
        return false;
      }
      
      // Otherwise disable the tab
      return true;
    }

    // For sequential progression
    const tabSequence = ["intro", "starcard", "reflect"];
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Use the Header component that now has the logout feature */}
      <Header showDashboardLink={true} />

      <main id="foundations-page" className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-indigo-700">Understanding Your Star Card</h1>
          <p className="text-gray-600">Learn about the four quadrants of your strengths profile</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid grid-cols-4 mb-6">
              <TabsTrigger value="intro" data-value="intro">Strengths</TabsTrigger>
              <TabsTrigger value="assessment" data-value="assessment">Strengths Assessment</TabsTrigger>
              <TabsTrigger value="starcard" data-value="starcard" disabled={isTabDisabled("starcard")}>
                {isTabDisabled("starcard") ? (
                  <span className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H8m10-4a6 6 0 11-12 0 6 6 0 0112 0z" />
                    </svg>
                    Your StarCard
                  </span>
                ) : "Your StarCard"}
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

            <TabsContent value="assessment" className="space-y-6">
              <div className="prose max-w-none">
                <h2>Strengths Assessment</h2>
                <p>Take the assessment to discover your unique strengths profile across the four quadrants: Thinking, Acting, Feeling, and Planning.</p>
                
                {/* If they have completed the assessment, show results instead of the button */}
                {(starCard && (starCard.thinking > 0 || starCard.acting > 0 || starCard.feeling > 0 || starCard.planning > 0)) ? (
                  <div className="mt-6">
                    {/* Assessment completed message removed */}
                    
                    <div className="mt-4">
                      <h3 className="font-medium text-lg text-gray-800 mb-4">Your Assessment Results</h3>
                      
                      <div className="mb-6">
                        {/* Import and use the pie chart component */}
                        <AssessmentPieChart
                          thinking={starCard.thinking || 0}
                          acting={starCard.acting || 0}
                          feeling={starCard.feeling || 0}
                          planning={starCard.planning || 0}
                        />
                        
                        {/* Text summary below chart */}
                        <div className="mt-4 grid grid-cols-2 gap-2">
                          <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full bg-[rgb(1,162,82)] mr-2"></div>
                            <span className="text-sm">Thinking: {starCard.thinking}%</span>
                          </div>
                          <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full bg-[rgb(241,64,64)] mr-2"></div>
                            <span className="text-sm">Acting: {starCard.acting}%</span>
                          </div>
                          <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full bg-[rgb(22,126,253)] mr-2"></div>
                            <span className="text-sm">Feeling: {starCard.feeling}%</span>
                          </div>
                          <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full bg-[rgb(255,203,47)] mr-2"></div>
                            <span className="text-sm">Planning: {starCard.planning}%</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-end mt-4">
                        <Button 
                          onClick={() => handleTabChange("starcard")}
                          className="bg-indigo-700 hover:bg-indigo-800"
                        >
                          Continue to StarCard
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-end mt-6">
                    <Button onClick={() => navigate('/assessment')} className="bg-indigo-700 hover:bg-indigo-800">
                      Take Assessment
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="intro" className="space-y-6">
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

              <div className="prose max-w-none">
                <h2>The Four Quadrants of Strengths</h2>
                <p>
                  The AllStarTeams framework identifies four key quadrants of strengths that every person possesses in different proportions:
                </p>

                <div className="grid grid-cols-2 gap-6 my-8">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <h3 className="text-blue-700 font-medium mb-2">Thinking</h3>
                    <p className="text-sm">The ability to analyze, strategize, and process information logically. People strong in this quadrant excel at problem-solving and critical thinking.</p>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                    <h3 className="text-green-700 font-medium mb-2">Acting</h3>
                    <p className="text-sm">The ability to take decisive action, implement plans, and get things done. People strong in this quadrant are proactive and results-oriented.</p>
                  </div>

                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                    <h3 className="text-yellow-700 font-medium mb-2">Feeling</h3>
                    <p className="text-sm">The ability to connect with others, empathize, and build relationships. People strong in this quadrant excel in team environments and social settings.</p>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                    <h3 className="text-purple-700 font-medium mb-2">Planning</h3>
                    <p className="text-sm">The ability to organize, structure, and create systems. People strong in this quadrant excel at creating order and maintaining processes.</p>
                  </div>
                </div>

                <h3>Your Assessment Journey</h3>
                <p>
                  In the upcoming assessment, you'll answer a series of questions designed to identify your natural strengths across these four quadrants. For each scenario, you'll rank options from "most like me" to "least like me."
                </p>
                <p>
                  Remember: There are no right or wrong answers. The goal is to identify your authentic strengths so you can leverage them more effectively.
                </p>
              </div>

              <div className="flex justify-end mt-6">
                <Link href="/assessment">
                  <Button 
                    className="bg-indigo-700 hover:bg-indigo-800"
                  >
                    Next: AllStarTeams Assessment
                  </Button>
                </Link>
              </div>
            </TabsContent>

            <TabsContent value="starcard" className="space-y-6">
              <div className="prose max-w-none">
                <h2>Your Star Profile + Star Card</h2>
                <p>
                  Your Star Profile captures your current strengths and growth edge. It's not a fixed label — it's a reflection of where you are now in your development journey.
                </p>

                <div className="aspect-w-16 aspect-h-9 mb-6 mt-6">
                  <iframe 
                    src="https://www.youtube.com/embed/x6h7LDtdnJw" 
                    title="Star Profile Review" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                    className="w-full h-80 rounded border border-gray-200"
                  ></iframe>
                </div>

                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 my-6">
                  <h3 className="text-indigo-700 font-medium">This exercise invites you to:</h3>
                  <ul>
                    <li>Reflect on your apex strength and how it shows up</li>
                    <li>Consider how your profile shifts over time and in different roles</li>
                    <li>Use your Star Card as a personal development compass</li>
                  </ul>
                </div>

                <p>
                  Watch the short video, then explore your profile with fresh eyes.
                </p>
              </div>

              <div className="my-8 border border-gray-200 rounded-md overflow-hidden bg-white">
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <h3 className="text-xl font-bold text-center text-gray-800">STAR CARD</h3>
                </div>

                <div className="p-6">
                  {/* Star Card Visual - Always display the card in its current state */}
                  <div className="mb-6">
                    <StarCard 
                      profile={{
                        name: user?.name || "",
                        title: user?.title || "",
                        organization: user?.organization || "",
                        avatarUrl: user?.avatarUrl
                      }}
                      quadrantData={{
                        thinking: starCard?.thinking || 0,
                        acting: starCard?.acting || 0,
                        feeling: starCard?.feeling || 0,
                        planning: starCard?.planning || 0
                      }}
                      downloadable={true}
                      preview={false}
                      imageUrl={starCard?.imageUrl}
                      flowAttributes={
                        flowAttributes?.attributes && Array.isArray(flowAttributes.attributes) ? 
                          flowAttributes.attributes.map((attr: any) => ({
                            text: attr.name,
                            color: getAttributeColor(attr.name)
                          })) : []
                      }
                    />
                  </div>
                  
                  <div className="flex justify-between mt-4">
                    <Button 
                      onClick={() => !isTabDisabled("intro") && handleTabChange("intro")}
                      variant="outline"
                      disabled={isTabDisabled("intro")}
                    >
                      Previous: Strengths
                    </Button>
                    <Button 
                      onClick={() => !isTabDisabled("reflect") && handleTabChange("reflect")}
                      className="bg-indigo-600 hover:bg-indigo-700"
                      disabled={isTabDisabled("reflect")}
                    >
                      Next: Reflect
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="reflect" className="space-y-6">
              {/* Reflection Component with Step Navigation */}
              <div className="flex justify-end mb-4">
                <div className="bg-white rounded-md shadow-sm border border-gray-200 px-2 py-1 flex items-center space-x-2">
                  <span className="text-xs font-medium text-gray-500">Your progress:</span>
                  <div className="w-32 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-600 rounded-full" style={{ width: '20%' }}></div>
                  </div>
                  <span className="text-xs font-medium text-gray-700">1 of 5</span>
                </div>
              </div>
              
              <div className="bg-white rounded-lg overflow-hidden shadow-md border border-indigo-100">
                {/* Reflection Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
                  <h2 className="text-xl font-bold mb-2">Your Strengths Reflection Journey</h2>
                  <p className="text-white/80">
                    Understanding how your unique strengths work together helps you maximize your potential.
                    Let's explore one strength at a time.
                  </p>
                  
                  {/* Strengths Distribution Visualization */}
                  <div className="mt-6 bg-white/10 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center justify-center">
                        {starCard && (
                          <div className="w-40 h-40">
                            <AssessmentPieChart
                              thinking={starCard.thinking || 0}
                              acting={starCard.acting || 0}
                              feeling={starCard.feeling || 0}
                              planning={starCard.planning || 0}
                            />
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col justify-center">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            <div className="text-sm text-white">{starCard?.thinking || 0}% Thinking</div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                            <div className="text-sm text-white">{starCard?.acting || 0}% Acting</div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                            <div className="text-sm text-white">{starCard?.feeling || 0}% Feeling</div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                            <div className="text-sm text-white">{starCard?.planning || 0}% Planning</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Reflection Content */}
                <div className="p-6">
                  {/* Step 1: First Strength - Acting */}
                  <div className="mb-8">
                    <div className="flex items-center mb-4">
                      <div className="bg-red-100 p-2 rounded-full mr-3">
                        <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white font-bold">
                          1
                        </div>
                      </div>
                      <h3 className="text-xl font-bold text-gray-800">Your 1st Strength: Acting ({starCard?.acting || 0}%)</h3>
                    </div>
                    
                    <div className="ml-16 mb-6">
                      <p className="text-gray-700 mb-3">
                        Your Acting strength shows your decisive, results-focused, and action-oriented nature. 
                        This represents your ability to make decisions, take initiative, and drive projects 
                        to completion.
                      </p>
                      
                      <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 mb-4">
                        <h4 className="font-medium text-indigo-800 mb-3">How and when do you use your Acting strength?</h4>
                        <p className="text-gray-700 text-sm mb-3">
                          Consider moments when your decisive nature made a difference. Reflect on:
                        </p>
                        <ul className="list-disc ml-5 text-sm text-gray-700 mb-3 space-y-1">
                          <li>Situations where you took initiative when others hesitated</li>
                          <li>How you've turned ideas into tangible results</li>
                          <li>Times when your decisiveness moved a project forward</li>
                          <li>How your pragmatic approach solved practical problems</li>
                        </ul>
                        
                        <div className="bg-white p-3 rounded-lg border border-gray-200 mb-2">
                          <p className="text-xs text-gray-500 mb-2 font-medium">EXAMPLE RESPONSES:</p>
                          <div className="text-sm text-gray-700">
                            <p className="mb-2 italic">"I use my action-oriented approach when projects stall. Recently, our team was stuck in analysis paralysis, and I stepped in to create momentum by identifying the three most important next steps and delegating tasks."</p>
                            <p className="italic">"My decisive nature helps in crisis situations. During a recent system outage, I quickly prioritized recovery actions while others were still discussing options, which minimized downtime for our customers."</p>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="acting-reflection" className="block text-sm font-medium text-gray-700 mb-1">
                          Your Reflection (2-3 sentences)
                        </label>
                        <Textarea 
                          id="acting-reflection"
                          placeholder="Describe specific moments when you've used your Acting strength effectively..."
                          className="min-h-[120px] w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block font-medium text-gray-700 mb-2">
                      How and when I use my 2nd strength
                    </label>
                    <Textarea 
                      placeholder="Describe how this strength shows up in your life..."
                      className="w-full min-h-[100px] border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block font-medium text-gray-700 mb-2">
                      How and when I use my 3rd strength
                    </label>
                    <Textarea 
                      placeholder="Describe how this strength shows up in your life..."
                      className="w-full min-h-[100px] border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-gray-700 mb-2">
                      How and when I use my 4th strength
                    </label>
                    <Textarea 
                      placeholder="Describe how this strength shows up in your life..."
                      className="w-full min-h-[100px] border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block font-medium text-gray-700 mb-2">
                      What I uniquely bring to the team
                    </label>
                    <Textarea 
                      placeholder="Describe your unique contribution to your team or organization..."
                      className="w-full min-h-[100px] border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-gray-700 mb-2">
                      What I value in fellow team members
                    </label>
                    <Textarea 
                      placeholder="Describe what you appreciate most in your colleagues..."
                      className="w-full min-h-[100px] border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex justify-between mt-6">
                  <Button 
                    onClick={() => !isTabDisabled("starcard") && handleTabChange("starcard")}
                    variant="outline"
                    disabled={isTabDisabled("starcard")}
                  >
                    Previous: Your StarCard
                  </Button>
                  <Link href="/find-your-flow">
                    <Button className="bg-indigo-600 hover:bg-indigo-700">
                      Next: Find Your Flow
                    </Button>
                  </Link>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}