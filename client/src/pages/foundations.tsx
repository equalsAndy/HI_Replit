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

// Define the starCard type based on the app's data structure
interface StarCardType {
  userId: number;
  thinking: number;
  acting: number;
  feeling: number;
  planning: number;
  apexStrength: string;
  id: number;
}

// Define the user type based on the app's data structure
interface UserType {
  id: number;
  name: string;
  title: string;
  organization: string;
  progress: number;
}

export default function Foundations() {
  const [location, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("intro");
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
  
  // Check if a tab should be disabled
  const isTabDisabled = (tabId: string): boolean => {
    // The first tab is always accessible
    if (tabId === "intro") return false;
    
    // Check assessment completion status for StarCard tab
    if (tabId === "starcard") {
      // Disable if no starCard data exists yet (assessment not completed)
      if (!starCard || !starCard.apexStrength) return true;
    }
    
    // For sequential progression
    const tabSequence = ["intro", "starcard", "reflect", "rounding"];
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
          <div className="logo flex items-center">
            <img 
              src="/src/assets/all-star-teams-logo-250px.png" 
              alt="AllStarTeams" 
              className="h-10 w-auto"
            />
          </div>
          
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
              <TabsTrigger value="rounding" data-value="rounding" disabled={isTabDisabled("rounding")}>
                {isTabDisabled("rounding") ? (
                  <span className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H8m10-4a6 6 0 11-12 0 6 6 0 0112 0z" />
                    </svg>
                    Rounding Out
                  </span>
                ) : "Rounding Out"}
              </TabsTrigger>
            </TabsList>
            
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
              
              <div className="mt-8 flex flex-col items-center">
                <div className="w-full max-w-md">
                  {/* Connect to real data using the StarCard component */}
                  <div className="mb-8">
                    <StarCard 
                      profile={{
                        name: "Test User",
                        title: "Software Engineer",
                        organization: "AllStarTeams",
                        avatarUrl: undefined
                      }}
                      quadrantData={{
                        thinking: 25,
                        acting: 35,
                        feeling: 20,
                        planning: 20,
                        apexStrength: "Acting"
                      }}
                      downloadable={false}
                      preview={false}
                    />
                  </div>
                  
                  <div className="flex justify-center mt-6">
                    <Link href="/assessment">
                      <Button className="bg-green-600 hover:bg-green-700">
                        Begin Assessment
                      </Button>
                    </Link>
                  </div>
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
              
              <div className="bg-purple-50 rounded-lg border border-purple-100 p-6 mb-8">
                <h3 className="text-lg font-semibold text-purple-800 mb-4">Your Core Strengths Reflection</h3>
                <p className="mb-6 text-sm text-gray-700">
                  Express in your own words on how you see yourself, your strengths, values, what you uniquely bring to the team, what you value in others, and what you're passionate about professionally. Click into each box below and type your response. Just a few short sentences for each.
                </p>
                
                {!starCard ? (
                  <div className="text-center p-8 bg-white rounded-lg border border-gray-200">
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
                  <div className="space-y-6">
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                      <label className="block font-medium text-purple-700 mb-2">
                        How and when I see my 1st strength ({starCard.apexStrength})
                      </label>
                      <Textarea 
                        placeholder="Describe how this strength shows up in your life..."
                        className="w-full min-h-[100px]"
                      />
                    </div>
                    
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                      <label className="block font-medium text-purple-700 mb-2">
                        How and when I see my 2nd strength (
                          {starCard && starCard.thinking && starCard.acting && starCard.feeling && starCard.planning ? 
                            Object.entries({
                              thinking: starCard.thinking,
                              acting: starCard.acting,
                              feeling: starCard.feeling,
                              planning: starCard.planning
                            })
                            .sort((a, b) => b[1] - a[1])
                            [1][0].charAt(0).toUpperCase() + 
                            Object.entries({
                              thinking: starCard.thinking,
                              acting: starCard.acting,
                              feeling: starCard.feeling,
                              planning: starCard.planning
                            })
                            .sort((a, b) => b[1] - a[1])
                            [1][0].slice(1)
                            : "Second Strength"
                          }
                        )
                      </label>
                      <Textarea 
                        placeholder="Describe how this strength shows up in your life..."
                        className="w-full min-h-[100px]"
                      />
                    </div>
                    
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                      <label className="block font-medium text-purple-700 mb-2">
                        How and when I see my 3rd strength (
                          {starCard && starCard.thinking && starCard.acting && starCard.feeling && starCard.planning ? 
                            Object.entries({
                              thinking: starCard.thinking,
                              acting: starCard.acting,
                              feeling: starCard.feeling,
                              planning: starCard.planning
                            })
                            .sort((a, b) => b[1] - a[1])
                            [2][0].charAt(0).toUpperCase() + 
                            Object.entries({
                              thinking: starCard.thinking,
                              acting: starCard.acting,
                              feeling: starCard.feeling,
                              planning: starCard.planning
                            })
                            .sort((a, b) => b[1] - a[1])
                            [2][0].slice(1)
                            : "Third Strength"
                          }
                        )
                      </label>
                      <Textarea 
                        placeholder="Describe how this strength shows up in your life..."
                        className="w-full min-h-[100px]"
                      />
                    </div>
                    
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                      <label className="block font-medium text-purple-700 mb-2">
                        How and when I see my 4th strength (
                          {starCard && starCard.thinking && starCard.acting && starCard.feeling && starCard.planning ? 
                            Object.entries({
                              thinking: starCard.thinking,
                              acting: starCard.acting,
                              feeling: starCard.feeling,
                              planning: starCard.planning
                            })
                            .sort((a, b) => b[1] - a[1])
                            [3][0].charAt(0).toUpperCase() + 
                            Object.entries({
                              thinking: starCard.thinking,
                              acting: starCard.acting,
                              feeling: starCard.feeling,
                              planning: starCard.planning
                            })
                            .sort((a, b) => b[1] - a[1])
                            [3][0].slice(1)
                            : "Fourth Strength"
                          }
                        )
                      </label>
                      <Textarea 
                        placeholder="Describe how this strength shows up in your life..."
                        className="w-full min-h-[100px]"
                      />
                    </div>
                    
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                      <label className="block font-medium text-purple-700 mb-2">
                        Three complementary strengths I value in others
                      </label>
                      <Textarea 
                        placeholder="Describe strengths you appreciate in colleagues and teammates..."
                        className="w-full min-h-[100px]"
                      />
                    </div>
                    
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                      <label className="block font-medium text-purple-700 mb-2">
                        What I uniquely bring to the team
                      </label>
                      <Textarea 
                        placeholder="Describe your unique contribution to your team or organization..."
                        className="w-full min-h-[100px]"
                      />
                    </div>
                    
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                      <label className="block font-medium text-purple-700 mb-2">
                        Current or future projects I'm really enthused about
                      </label>
                      <Textarea 
                        placeholder="Describe projects that excite or inspire you..."
                        className="w-full min-h-[100px]"
                      />
                    </div>
                    
                    <div className="flex justify-center mt-6">
                      <Button className="bg-purple-600 hover:bg-purple-700">
                        Save My Reflections
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
                <Button 
                  onClick={() => !isTabDisabled("rounding") && handleTabChange("rounding")}
                  className="bg-indigo-700 hover:bg-indigo-800"
                  disabled={isTabDisabled("rounding")}
                >
                  Next: Rounding Out
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="rounding" className="space-y-6">
              <div className="prose max-w-none">
                <h2>Rounding Out Your Profile</h2>
                <p>
                  While focusing on your strengths is powerful, it's also important to understand how to balance your profile and work effectively with others who have different strength patterns.
                </p>
                
                <div className="my-8 bg-indigo-50 p-6 rounded-lg border border-indigo-100">
                  <h3 className="text-indigo-700">Strategies for Balance</h3>
                  <ol>
                    <li><strong>Partner with complements:</strong> Collaborate with people whose strengths fill your gaps</li>
                    <li><strong>Develop compensating systems:</strong> Create processes that help manage areas where you're not naturally strong</li>
                    <li><strong>Targeted development:</strong> Strategically improve specific skills in less dominant quadrants</li>
                    <li><strong>Leverage technology:</strong> Use tools and apps to support areas outside your strengths</li>
                  </ol>
                </div>
                
                <h3>The Team Perspective</h3>
                <p>
                  In a team setting, understanding everyone's strengths creates powerful opportunities:
                </p>
                <ul>
                  <li>Better role alignment</li>
                  <li>More effective delegation</li>
                  <li>Improved conflict resolution</li>
                  <li>Enhanced innovation through diverse thinking styles</li>
                  <li>Greater appreciation for different approaches</li>
                </ul>
                
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-100 my-6">
                  <h4 className="text-amber-700 font-medium">Remember</h4>
                  <p className="text-sm">
                    The goal isn't to be equally strong in all quadrants (which is nearly impossible), but to understand your natural patterns and make intentional choices about how to apply them.
                  </p>
                </div>
                
                <p className="font-medium text-indigo-700">
                  You're now ready to take the assessment and discover your unique strengths profile!
                </p>
              </div>
              
              <div className="flex justify-between mt-6">
                <Button 
                  onClick={() => !isTabDisabled("reflect") && handleTabChange("reflect")}
                  variant="outline"
                  disabled={isTabDisabled("reflect")}
                >
                  Previous: Reflect
                </Button>
                <Link href="/assessment">
                  <Button className="bg-green-600 hover:bg-green-700">
                    Begin Assessment
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