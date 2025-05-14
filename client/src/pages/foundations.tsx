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

// Define quadrant colors
const QUADRANT_COLORS = {
  thinking: 'rgb(1, 162, 82)',    // Green
  acting: 'rgb(241, 64, 64)',     // Red
  feeling: 'rgb(22, 126, 253)',   // Blue
  planning: 'rgb(255, 203, 47)'   // Yellow
} as const;

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
  pending?: boolean;
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
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/" className="logo flex items-center cursor-pointer">
            <img 
              src="/src/assets/all-star-teams-logo-250px.png" 
              alt="AllStarTeams" 
              className="h-10 w-auto"
            />
          </Link>

          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" className="rounded-md" asChild>
              <Link href="/user-home">Dashboard</Link>
            </Button>
            <Button variant="destructive" size="sm" className="rounded-md">Logout</Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
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
                <div className="flex justify-end mt-6">
                  <Button onClick={() => navigate('/assessment')} className="bg-indigo-700 hover:bg-indigo-800">
                    Take Assessment
                  </Button>
                </div>
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
                  {(!starCard || (starCard && !starCard.thinking && !starCard.acting && !starCard.feeling && !starCard.planning)) ? (
                    <div className="text-center p-8 bg-gray-50 rounded-lg border border-gray-200">
                      <h4 className="font-medium text-red-600 mb-2">Assessment Required</h4>
                      <p className="text-sm text-gray-500 mb-4">
                        To view your StarCard, you need to complete the AllStarTeams assessment first.
                      </p>
                      <Link href="/assessment">
                        <Button className="bg-indigo-600 hover:bg-indigo-700">
                          Take the Assessment
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <>
                      {/* No duplicate profile section needed here */}

                      {/* Star Card Visual */}
                      <div className="mb-6">
                        <StarCard 
                          profile={{
                            name: user?.name || "",
                            title: user?.title || "",
                            organization: user?.organization || "",
                            avatarUrl: user?.avatarUrl
                          }}
                          quadrantData={{
                            thinking: starCard.thinking || 0,
                            acting: starCard.acting || 0,
                            feeling: starCard.feeling || 0,
                            planning: starCard.planning || 0
                          }}
                          downloadable={true}
                          preview={false}
                          // Pass the state field from the server so the component knows whether it's empty, partial, or complete
                          pending={starCard.state === 'empty'}
                          imageUrl={starCard.imageUrl}
                          flowAttributes={flowAttributes?.attributes ? flowAttributes.attributes : []}
                        />
                      </div>

                      <div className="flex justify-between mt-6">
                        <Button 
                          onClick={() => !isTabDisabled("intro") && handleTabChange("intro")}
                          variant="outline"
                        >
                          Previous: Strengths
                        </Button>
                        <Button 
                          onClick={() => !isTabDisabled("reflect") && handleTabChange("reflect")}
                          className="bg-indigo-700 hover:bg-indigo-800"
                          disabled={isTabDisabled("reflect")}
                        >
                          Next: Reflect
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="reflect" className="space-y-6">
              <div className="prose max-w-none">
                <h2>Your Core Strengths</h2>
                <p>
                  This exercise helps you reflect on how your core strengths show up in real situations. It builds clarity and confidence by grounding your strengths in lived experience — so you can recognize, trust, and apply them more intentionally.
                </p>

                <div className="aspect-w-16 aspect-h-9 mb-6 mt-6">
                  <iframe 
                    src="https://www.youtube.com/embed/Le_HtpWziQE" 
                    title="Your Core Strengths" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                    className="w-full h-80 rounded border border-gray-200"
                  ></iframe>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 mb-8">
                <div className="flex items-center space-x-2 mb-6">
                  <div className="flex items-center justify-center bg-blue-600 text-white h-8 w-8 rounded-full font-bold">A</div>
                  <h3 className="text-xl font-bold text-gray-800">Reflect On Your Strengths</h3>
                </div>

                <div className="mb-6">
                  <p className="text-gray-700 mb-2">
                    <span className="font-medium">Purpose:</span> Express in your own words how you see yourself, your strengths, values, what you uniquely bring to the team, what you value in others, and what you are enthused about professionally.
                  </p>
                  <p className="text-gray-700">
                    <span className="font-medium">Directions:</span> Respond to the prompts.
                  </p>
                </div>

                {(!starCard || (starCard && !starCard.thinking && !starCard.acting && !starCard.feeling && !starCard.planning)) ? (
                  <div className="text-center p-8 bg-gray-50 rounded-lg border border-gray-200">
                    <h4 className="font-medium text-red-600 mb-2">Assessment Required</h4>
                    <p className="text-sm text-gray-500 mb-4">
                      To access this reflection, you need to complete the AllStarTeams assessment first.
                    </p>
                    <Link href="/assessment">
                      <Button className="bg-indigo-600 hover:bg-indigo-700">
                        Take the Assessment
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block font-medium text-gray-700 mb-2">
                          How and when I use my 1st strength
                        </label>
                        <Textarea 
                          placeholder="Describe how this strength shows up in your life..."
                          className="w-full min-h-[100px] border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                        />
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
                          Reflect on your Stress Coping Strengths
                        </label>
                        <Textarea 
                          placeholder="Describe how you use your strengths under stress..."
                          className="w-full min-h-[100px] border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block font-medium text-gray-700 mb-2">
                          How and when I use my 3rd strength
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
                          Three complementary strengths I value in others
                        </label>
                        <Textarea 
                          placeholder="Describe strengths you appreciate in colleagues and teammates..."
                          className="w-full min-h-[100px] border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block font-medium text-gray-700 mb-2">
                          Current or future projects I'm really enthused about
                        </label>
                        <Textarea 
                          placeholder="Describe projects that excite or inspire you..."
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
                          How and when I use my 4th strength
                        </label>
                        <Textarea 
                          placeholder="Describe how this strength shows up in your life..."
                          className="w-full min-h-[100px] border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                        />
                      </div>
                    </div>

                    <div className="flex space-x-2 mt-6">
                      <Button className="bg-indigo-600 hover:bg-indigo-700">
                        Save
                      </Button>
                      <Button variant="outline">
                        Return
                      </Button>
                    </div>
                  </div>
                )}
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
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}