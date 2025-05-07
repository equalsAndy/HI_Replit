import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import MainContainer from '@/components/layout/MainContainer';
import FlowAssessment from '@/components/flow/FlowAssessment';
import StarCard from '@/components/starcard/StarCard';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Define the user type based on the app's data structure
interface UserType {
  id: number;
  name: string;
  title: string;
  organization: string;
  progress: number;
  avatarUrl?: string;
}

// Flow attribute categories
const thinkingAttributes = [
  "Abstract", "Analytic", "Astute", "Big Picture", "Curious", 
  "Focused", "Insightful", "Logical", "Investigative", "Rational", 
  "Reflective", "Sensible", "Strategic", "Thoughtful"
];

const feelingAttributes = [
  "Collaborative", "Compassionate", "Creative", "Encouraging", "Expressive",
  "Empathic", "Intuitive", "Inspiring", "Objective", "Passionate",
  "Positive", "Receptive", "Supportive"
];

const planningAttributes = [
  "Detail-Oriented", "Diligent", "Immersed", "Industrious", "Methodical",
  "Organized", "Precise", "Punctual", "Reliable", "Responsible",
  "Straightforward", "Tidy", "Systematic", "Thorough"
];

const actingAttributes = [
  "Adventuresome", "Competitive", "Dynamic", "Effortless", "Energetic",
  "Engaged", "Funny", "Persuasive", "Open-Minded", "Optimistic",
  "Practical", "Resilient", "Spontaneous", "Vigorous"
];

interface RankedAttribute {
  text: string;
  category: 'thinking' | 'feeling' | 'planning' | 'acting';
  rank: number | null;
}

export default function FindYourFlow() {
  const [location, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("intro");
  const [completedTabs, setCompletedTabs] = useState<string[]>([]);
  const { toast } = useToast();
  const [selectedAttributes, setSelectedAttributes] = useState<RankedAttribute[]>([]);
  const [currentCategory, setCurrentCategory] = useState<'thinking' | 'feeling' | 'planning' | 'acting'>('thinking');
  
  // Helper functions for attribute selection
  const handleAttributeSelect = (text: string, category: 'thinking' | 'feeling' | 'planning' | 'acting') => {
    // Check if we already have 4 ranked attributes
    const rankedCount = selectedAttributes.filter(attr => attr.rank !== null).length;
    if (rankedCount >= 4 && !selectedAttributes.some(attr => attr.text === text && attr.rank !== null)) {
      toast({
        title: "Maximum attributes selected",
        description: "Please deselect an attribute before selecting another one.",
        variant: "destructive"
      });
      return;
    }
    
    // If attribute is already in the list, remove it
    if (selectedAttributes.some(attr => attr.text === text)) {
      setSelectedAttributes(selectedAttributes.filter(attr => attr.text !== text));
      return;
    }
    
    // Add the attribute to the list with the next available rank
    const nextRank = rankedCount + 1;
    setSelectedAttributes([
      ...selectedAttributes,
      { text, category, rank: nextRank }
    ]);
  };
  
  const handleRemoveAttribute = (text: string) => {
    const removedAttr = selectedAttributes.find(attr => attr.text === text);
    if (!removedAttr || removedAttr.rank === null) return;
    
    const removedRank = removedAttr.rank;
    
    // Remove the attribute and recalculate ranks
    const filteredAttrs = selectedAttributes.filter(attr => attr.text !== text);
    const updatedAttrs = filteredAttrs.map(attr => {
      if (attr.rank !== null && attr.rank > removedRank) {
        return { ...attr, rank: attr.rank - 1 };
      }
      return attr;
    });
    
    setSelectedAttributes(updatedAttrs);
  };
  
  // Function to get the attributes for the current category
  const getCurrentCategoryAttributes = (): string[] => {
    switch (currentCategory) {
      case 'thinking': return thinkingAttributes;
      case 'feeling': return feelingAttributes;
      case 'planning': return planningAttributes;
      case 'acting': return actingAttributes;
      default: return [];
    }
  };
  
  // Get color class for category
  const getCategoryColorClass = (category: 'thinking' | 'feeling' | 'planning' | 'acting'): string => {
    switch (category) {
      case 'thinking': return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'feeling': return 'bg-purple-100 text-purple-800 hover:bg-purple-200';
      case 'planning': return 'bg-amber-100 text-amber-800 hover:bg-amber-200';
      case 'acting': return 'bg-green-100 text-green-800 hover:bg-green-200';
      default: return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };
  
  // Get rank badge color
  const getRankBadgeColor = (rank: number): string => {
    switch (rank) {
      case 1: return 'bg-blue-500 text-white';
      case 2: return 'bg-purple-500 text-white';
      case 3: return 'bg-amber-500 text-white';
      case 4: return 'bg-green-500 text-white';
      default: return 'bg-gray-200 text-gray-800';
    }
  };
  
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
    const tabSequence = ["intro", "assessment", "roundingout", "starcard"];
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
          <TabsList className="grid grid-cols-4 mb-6">
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
            <TabsTrigger value="roundingout" data-value="roundingout" disabled={isTabDisabled("roundingout")}>
              {isTabDisabled("roundingout") ? (
                <span className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H8m10-4a6 6 0 11-12 0 6 6 0 0112 0z" />
                  </svg>
                  Rounding Out
                </span>
              ) : "Rounding Out"}
            </TabsTrigger>
            <TabsTrigger value="starcard" data-value="starcard" disabled={isTabDisabled("starcard")}>
              {isTabDisabled("starcard") ? (
                <span className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H8m10-4a6 6 0 11-12 0 6 6 0 0112 0z" />
                  </svg>
                  Add Flow to StarCard
                </span>
              ) : "Add Flow to StarCard"}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="intro" className="space-y-6">
            <div className="aspect-w-16 aspect-h-9 mb-4">
              <iframe 
                src="https://www.youtube.com/embed/JxdhWd8agmE" 
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
                onClick={() => handleTabChange("roundingout")}
                className="bg-indigo-700 hover:bg-indigo-800"
              >
                Next: Rounding Out
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="roundingout" className="space-y-6">
            <div className="aspect-w-16 aspect-h-9 mb-4">
              <iframe 
                src="https://www.youtube.com/embed/srLM8lHPj40" 
                title="Understanding Flow States" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
                className="w-full h-80 rounded border border-gray-200"
              ></iframe>
            </div>

            <div className="prose max-w-none">
              <h2>Rounding Out Your Flow Understanding</h2>
              <p>
                Now that you've completed the flow assessment, take some time to round out your understanding of flow
                and how you can create more opportunities for flow in your work and life.
              </p>
              
              <h3 className="mt-6">Flow Reflection Questions</h3>
              <p>Reflect on your personal experiences with flow to better understand how to create optimal conditions in your work and life.</p>
            </div>
            
            <div className="space-y-4 mt-4">
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
            </div>
            
            <div className="grid grid-cols-1 gap-4 mt-6">
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
            
            <div className="flex justify-between mt-8">
              <Button 
                onClick={() => handleTabChange("assessment")}
                variant="outline"
              >
                Go Back
              </Button>
              <Button 
                onClick={() => handleTabChange("starcard")}
                className="bg-indigo-700 hover:bg-indigo-800"
              >
                Next: Add Flow to StarCard
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="starcard" className="space-y-6">
            <div className="prose max-w-none mb-6">
              <h2>Add Flow to Your StarCard</h2>
              <p>
                Now that you've completed the flow assessment and reflection, select four flow attributes 
                that best describe your optimal flow state. These will be added to your StarCard to create 
                a comprehensive visualization of your strengths and flow profile.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">Your StarCard</h3>
                {user && (
                  <div className="bg-white p-4 rounded shadow-sm border border-gray-200">
                    <StarCard 
                      profile={{
                        name: user.name || '',
                        title: user.title || '',
                        organization: user.organization || ''
                      }}
                      quadrantData={{
                        thinking: 25,
                        acting: 25,
                        feeling: 25,
                        planning: 25,
                        apexStrength: 'Imagination'
                      }}
                      downloadable={false}
                      preview={true}
                    />
                  </div>
                )}
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Select Your Flow Attributes</h3>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">
                      Choose 4 words that best describe your flow state when you're at your best.
                      Select attributes in order of importance (1 = most important, 4 = least important).
                    </p>
                    
                    {/* Category selector */}
                    <div className="flex space-x-2 mb-4">
                      <Button 
                        onClick={() => setCurrentCategory('thinking')} 
                        variant={currentCategory === 'thinking' ? 'default' : 'outline'}
                        className={currentCategory === 'thinking' ? 'bg-blue-600' : ''}
                        size="sm"
                      >
                        Thinking
                      </Button>
                      <Button 
                        onClick={() => setCurrentCategory('feeling')} 
                        variant={currentCategory === 'feeling' ? 'default' : 'outline'}
                        className={currentCategory === 'feeling' ? 'bg-purple-600' : ''}
                        size="sm"
                      >
                        Feeling
                      </Button>
                      <Button 
                        onClick={() => setCurrentCategory('planning')} 
                        variant={currentCategory === 'planning' ? 'default' : 'outline'}
                        className={currentCategory === 'planning' ? 'bg-amber-600' : ''}
                        size="sm"
                      >
                        Planning
                      </Button>
                      <Button 
                        onClick={() => setCurrentCategory('acting')} 
                        variant={currentCategory === 'acting' ? 'default' : 'outline'}
                        className={currentCategory === 'acting' ? 'bg-green-600' : ''}
                        size="sm"
                      >
                        Acting
                      </Button>
                    </div>
                    
                    {/* Selected attributes */}
                    {selectedAttributes.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium mb-2">Your Selected Attributes:</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedAttributes
                            .sort((a, b) => (a.rank || Infinity) - (b.rank || Infinity))
                            .map(attr => (
                              <Badge 
                                key={attr.text}
                                className={`${getCategoryColorClass(attr.category)} cursor-pointer`}
                                onClick={() => handleRemoveAttribute(attr.text)}
                              >
                                {attr.text}
                                {attr.rank !== null && (
                                  <span className={`ml-1 inline-flex items-center justify-center rounded-full h-5 w-5 text-xs ${getRankBadgeColor(attr.rank)}`}>
                                    {attr.rank}
                                  </span>
                                )}
                              </Badge>
                            ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Available attributes */}
                    <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                      <h4 className="text-sm font-medium mb-2 capitalize">{currentCategory} Attributes:</h4>
                      <div className="flex flex-wrap gap-2">
                        {getCurrentCategoryAttributes().map(attr => {
                          const isSelected = selectedAttributes.some(selected => selected.text === attr);
                          const rank = selectedAttributes.find(selected => selected.text === attr)?.rank;
                          
                          return (
                            <Badge 
                              key={attr}
                              variant="outline"
                              className={`${isSelected ? getCategoryColorClass(currentCategory) : 'hover:bg-gray-100'} cursor-pointer transition-colors`}
                              onClick={() => handleAttributeSelect(attr, currentCategory)}
                            >
                              {attr}
                              {rank !== null && rank !== undefined && (
                                <span className={`ml-1 inline-flex items-center justify-center rounded-full h-5 w-5 text-xs ${getRankBadgeColor(rank)}`}>
                                  {rank}
                                </span>
                              )}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <Button
                    className="w-full bg-indigo-700 hover:bg-indigo-800"
                    disabled={selectedAttributes.filter(attr => attr.rank !== null).length < 4}
                  >
                    Add Flow Attributes to StarCard
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between mt-8">
              <Button 
                onClick={() => handleTabChange("roundingout")}
                variant="outline"
              >
                Go Back
              </Button>
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