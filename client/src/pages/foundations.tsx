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

  // Get flow attributes data for the star card
  const { data: flowAttributes } = useQuery<{ attributes: any[] }>({
    queryKey: ['/api/flow-attributes'],
    enabled: !!user,
    staleTime: Infinity,
  });

  // Tab management
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // Update URL with tab parameter
    window.history.replaceState(null, '', `?tab=${value}`);
    // Mark tab as completed when navigating to it
    if (!completedTabs.includes(value)) {
      setCompletedTabs([...completedTabs, value]);
    }
  };

  // Determine if a tab should be disabled
  const isTabDisabled = (tabValue: string) => {
    // Logic for tab progression
    if (tabValue === 'intro') return false; // Intro always enabled
    if (tabValue === 'starcard') return !completedTabs.includes('intro');
    if (tabValue === 'reflect') return !completedTabs.includes('starcard');
    if (tabValue === 'rounding') return !completedTabs.includes('reflect');
    return false;
  };

  // Handle form submissions
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Logic for saving form data would go here
    // For now, just advance to the next tab
    if (activeTab === 'intro') handleTabChange('starcard');
    else if (activeTab === 'starcard') handleTabChange('reflect');
    else if (activeTab === 'reflect') handleTabChange('rounding');
  };

  // Check if there's data for the star card
  const hasStarCardData = starCard && (starCard.thinking > 0 || starCard.acting > 0 || starCard.feeling > 0 || starCard.planning > 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container max-w-5xl mx-auto py-6 px-4">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Individual Foundations</h1>
          <p className="text-gray-600">
            Explore and reflect on your unique strengths and flow attributes to maximize your potential.
          </p>
        </div>

        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="bg-gray-100 p-0 grid grid-cols-4">
              <TabsTrigger 
                value="intro" 
                className="data-[state=active]:bg-white py-3"
                disabled={isTabDisabled('intro')}
              >
                Introduction
              </TabsTrigger>
              <TabsTrigger 
                value="starcard" 
                className="data-[state=active]:bg-white py-3"
                disabled={isTabDisabled('starcard')}
              >
                Your Star Card
              </TabsTrigger>
              <TabsTrigger 
                value="reflect" 
                className="data-[state=active]:bg-white py-3"
                disabled={isTabDisabled('reflect')}
              >
                Reflect on Strengths
              </TabsTrigger>
              <TabsTrigger 
                value="rounding" 
                className="data-[state=active]:bg-white py-3"
                disabled={isTabDisabled('rounding')}
              >
                Rounding Out
              </TabsTrigger>
            </TabsList>

            {/* Introduction tab */}
            <TabsContent value="intro">
              <div className="p-6">
                <div className="flex items-center space-x-2 mb-6">
                  <div className="flex items-center justify-center bg-indigo-600 text-white h-8 w-8 rounded-full font-bold">1</div>
                  <h3 className="text-xl font-bold text-gray-800">Introduction</h3>
                </div>

                <p className="text-gray-700 mb-4">
                  Welcome to the Individual Foundations module! This is your personal space to explore your unique strengths, identify your flow state attributes, and develop strategies to maximize your potential.
                </p>

                <p className="text-gray-700 mb-4">
                  Through a series of reflective exercises, you'll gain deeper insights into:
                </p>

                <ul className="list-disc pl-5 mb-4 text-gray-700 space-y-2">
                  <li>Your unique pattern of strengths across four dimensions</li>
                  <li>How to leverage these strengths in different contexts</li>
                  <li>The conditions that help you achieve flow state</li>
                  <li>Strategies for rounding out your capabilities</li>
                </ul>

                <p className="text-gray-700 mb-6">
                  This module builds upon your Star Strengths Assessment results and is designed to be completed at your own pace. Your responses are saved automatically.
                </p>

                <div className="flex space-x-2 mt-6">
                  <Button 
                    onClick={() => handleTabChange('starcard')}
                    className="bg-indigo-600 hover:bg-indigo-700"
                    disabled={isTabDisabled('starcard')}
                  >
                    Next: Your Star Card
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Star Card tab */}
            <TabsContent value="starcard">
              <div className="p-6">
                <div className="flex items-center space-x-2 mb-6">
                  <div className="flex items-center justify-center bg-indigo-600 text-white h-8 w-8 rounded-full font-bold">2</div>
                  <h3 className="text-xl font-bold text-center text-gray-800">STAR CARD</h3>
                </div>

                <div className="p-6">
                  <div className="flex flex-col items-center mb-6">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">Your Star Profile</h4>
                    
                    {/* Always show the Star Card */}
                    <StarCard 
                      profile={{
                        name: user?.name || "Your Name",
                        title: user?.title || "Your Title",
                        organization: user?.organization || "Your Organization"
                      }}
                      quadrantData={starCard ? {
                        thinking: starCard.thinking || 0,
                        acting: starCard.acting || 0,
                        feeling: starCard.feeling || 0,
                        planning: starCard.planning || 0
                      } : {
                        thinking: 0,
                        acting: 0,
                        feeling: 0,
                        planning: 0
                      }}
                      imageUrl={starCard?.imageUrl || undefined}
                      flowAttributes={
                        flowAttributes?.attributes && Array.isArray(flowAttributes.attributes) 
                          ? flowAttributes.attributes.map((attr: any) => ({
                              text: attr.name,
                              color: getAttributeColor(attr.name)
                            })) 
                          : []
                      }
                    />
                  </div>

                  <div className="mt-6">
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">Understanding Your Star Card</h4>
                    <p className="text-gray-700 mb-4">
                      Your Star Card represents your unique combination of strengths across four dimensions: Thinking, Feeling, Acting, and Planning. Each person has a distinctive pattern - there's no right or wrong profile!
                    </p>

                    <div className="bg-gray-50 p-4 rounded-md mb-6">
                      <h5 className="font-medium text-gray-800 mb-2">Four Core Dimensions</h5>
                      <ul className="space-y-2">
                        <li className="flex items-start">
                          <div className="h-5 w-5 mr-2 mt-0.5" style={{ backgroundColor: QUADRANT_COLORS.thinking }}></div>
                          <div>
                            <span className="font-medium">Thinking:</span> Analytical, strategic, conceptual, innovative
                          </div>
                        </li>
                        <li className="flex items-start">
                          <div className="h-5 w-5 mr-2 mt-0.5" style={{ backgroundColor: QUADRANT_COLORS.feeling }}></div>
                          <div>
                            <span className="font-medium">Feeling:</span> Empathetic, intuitive, collaborative, supportive
                          </div>
                        </li>
                        <li className="flex items-start">
                          <div className="h-5 w-5 mr-2 mt-0.5" style={{ backgroundColor: QUADRANT_COLORS.acting }}></div>
                          <div>
                            <span className="font-medium">Acting:</span> Decisive, energetic, driven, bold
                          </div>
                        </li>
                        <li className="flex items-start">
                          <div className="h-5 w-5 mr-2 mt-0.5" style={{ backgroundColor: QUADRANT_COLORS.planning }}></div>
                          <div>
                            <span className="font-medium">Planning:</span> Organized, detail-oriented, consistent, reliable
                          </div>
                        </li>
                      </ul>
                    </div>
                    
                    <Link href="/assessment">
                      <Button variant="outline" className="mb-4">
                        Retake Assessment
                      </Button>
                    </Link>
                  </div>
                </div>

                <div className="flex justify-between mt-6">
                  <Button 
                    onClick={() => !isTabDisabled("intro") && handleTabChange("intro")}
                    variant="outline"
                    disabled={isTabDisabled("intro")}
                  >
                    Previous: Introduction
                  </Button>
                  <Button 
                    onClick={() => !isTabDisabled("reflect") && handleTabChange("reflect")}
                    className="bg-indigo-600 hover:bg-indigo-700"
                    disabled={isTabDisabled("reflect")}
                  >
                    Next: Reflect on Strengths
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Reflect on Strengths tab */}
            <TabsContent value="reflect">
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
                        How and when I use my 3rd strength
                      </label>
                      <Textarea 
                        placeholder="Describe how this strength shows up in your life..."
                        className="w-full min-h-[100px] border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block font-medium text-gray-700 mb-2">
                        What I uniquely bring to the team
                      </label>
                      <Textarea 
                        placeholder="Describe your unique contribution to your team or organization..."
                        className="w-full min-h-[100px] border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block font-medium text-gray-700 mb-2">
                        What I value in others
                      </label>
                      <Textarea 
                        placeholder="Describe what you appreciate most in your colleagues..."
                        className="w-full min-h-[100px] border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block font-medium text-gray-700 mb-2">
                        What I'm professionally enthusiastic about
                      </label>
                      <Textarea 
                        placeholder="Describe what excites you most about your professional work..."
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
              </div>

              <div className="flex justify-between mt-6">
                <Button 
                  onClick={() => !isTabDisabled("starcard") && handleTabChange("starcard")}
                  variant="outline"
                  disabled={isTabDisabled("starcard")}
                >
                  Previous: Your Star Card
                </Button>
                <Button 
                  onClick={() => !isTabDisabled("rounding") && handleTabChange("rounding")}
                  className="bg-indigo-600 hover:bg-indigo-700"
                  disabled={isTabDisabled("rounding")}
                >
                  Next: Rounding Out
                </Button>
              </div>
            </TabsContent>

            {/* Rounding Out tab */}
            <TabsContent value="rounding">
              <div className="bg-white rounded-lg p-6 mb-8">
                <div className="flex items-center space-x-2 mb-6">
                  <div className="flex items-center justify-center bg-green-600 text-white h-8 w-8 rounded-full font-bold">B</div>
                  <h3 className="text-xl font-bold text-gray-800">Rounding Out Your Profile</h3>
                </div>

                <div className="mb-6">
                  <p className="text-gray-700 mb-2">
                    <span className="font-medium">Purpose:</span> Identify areas for your continued development and growth.
                  </p>
                  <p className="text-gray-700">
                    <span className="font-medium">Directions:</span> Respond to the prompts below.
                  </p>
                </div>

                <div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block font-medium text-gray-700 mb-2">
                        Areas where I'd like to grow
                      </label>
                      <Textarea 
                        placeholder="Describe areas where you'd like to develop new capabilities..."
                        className="w-full min-h-[100px] border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block font-medium text-gray-700 mb-2">
                        How I can leverage my strengths to support growth
                      </label>
                      <Textarea 
                        placeholder="Describe how your current strengths can help you develop in new areas..."
                        className="w-full min-h-[100px] border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block font-medium text-gray-700 mb-2">
                        Specific actions I can take
                      </label>
                      <Textarea 
                        placeholder="List concrete steps you can take to develop in your target areas..."
                        className="w-full min-h-[100px] border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block font-medium text-gray-700 mb-2">
                        Resources or support I need
                      </label>
                      <Textarea 
                        placeholder="Describe what resources, mentoring, or support would help you..."
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
              </div>

              <div className="flex justify-between mt-6">
                <Button 
                  onClick={() => !isTabDisabled("reflect") && handleTabChange("reflect")}
                  variant="outline"
                  disabled={isTabDisabled("reflect")}
                >
                  Previous: Reflect on Strengths
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