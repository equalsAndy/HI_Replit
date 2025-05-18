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

// Step by Step Reflection Component
function StepByStepReflection({ starCard, handleTabChange }: { 
  starCard: { thinking: number; acting: number; feeling: number; planning: number } | undefined;
  handleTabChange: (tab: string) => void; 
}) {
  const [activeStep, setActiveStep] = useState<number>(1);
  const [reflections, setReflections] = useState<{[key: string]: string}>({
    strength1: '',
    strength2: '',
    strength3: '',
    strength4: '',
    teamContribution: '',
    teamValue: ''
  });
  
  // Helper functions for strength names and descriptions
  const getQuadrantName = (key: string) => {
    const names: {[key: string]: string} = {
      'thinking': 'Thinking',
      'acting': 'Acting',
      'feeling': 'Feeling',
      'planning': 'Planning'
    };
    return names[key] || 'Unknown';
  };
  
  const getQuadrantDescription = (key: string) => {
    const descriptions: {[key: string]: string} = {
      'thinking': 'analytical & logical approach',
      'acting': 'decisive & action-oriented',
      'feeling': 'empathetic & relationship-focused',
      'planning': 'organized & methodical'
    };
    return descriptions[key] || '';
  };
  
  // Get sorted strengths
  const sortedStrengths = starCard ? 
    Object.entries({
      'thinking': starCard.thinking,
      'acting': starCard.acting,
      'feeling': starCard.feeling,
      'planning': starCard.planning
    })
    .sort(([,a], [,b]) => b - a)
    .map(([key]) => key)
    : [];
  
  const handleReflectionChange = (field: string, value: string) => {
    setReflections(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleNextStep = () => {
    if (activeStep < 6) {
      setActiveStep(activeStep + 1);
    }
  };
  
  const handlePreviousStep = () => {
    if (activeStep > 1) {
      setActiveStep(activeStep - 1);
    }
  };
  
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200">
      {/* Header with step indicator */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
        <h2 className="text-xl font-bold mb-2">Your Strengths Reflection</h2>
        <p className="opacity-90">Step {activeStep} of 6: {
          activeStep === 1 ? "Your Strengths Overview" :
          activeStep === 2 ? `Your Primary Strength` :
          activeStep === 3 ? `Your Secondary Strength` :
          activeStep === 4 ? `Your Third Strength` :
          activeStep === 5 ? `Your Fourth Strength` :
          "Your Team Contributions"
        }</p>
        
        {/* Progress bar */}
        <div className="mt-4 bg-white/20 rounded-full h-2 overflow-hidden">
          <div 
            className="bg-white h-2 rounded-full transition-all duration-300 ease-in-out" 
            style={{ width: `${(activeStep / 6) * 100}%` }}
          ></div>
        </div>
      </div>
      
      <div className="p-6">
        {/* Step 1: Overview with pie chart */}
        {activeStep === 1 && (
          <div className="space-y-6">
            <div className="max-w-3xl mx-auto text-center">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Your Strengths Profile</h3>
              <p className="text-gray-600 mb-6">
                This visualization shows your unique distribution of strengths. In the next steps,
                you'll reflect on how you use each of these strengths in your professional life.
              </p>
            </div>
            
            <div className="mx-auto max-w-md">
              {starCard && (
                <AssessmentPieChart
                  thinking={starCard.thinking || 0}
                  acting={starCard.acting || 0}
                  feeling={starCard.feeling || 0}
                  planning={starCard.planning || 0}
                />
              )}
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto mt-6">
              <div className="bg-green-50 p-3 rounded-lg border border-green-100 text-center">
                <div className="text-green-700 font-bold">{starCard?.thinking || 0}%</div>
                <div className="text-sm text-gray-600">Thinking</div>
              </div>
              <div className="bg-red-50 p-3 rounded-lg border border-red-100 text-center">
                <div className="text-red-700 font-bold">{starCard?.acting || 0}%</div>
                <div className="text-sm text-gray-600">Acting</div>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 text-center">
                <div className="text-blue-700 font-bold">{starCard?.feeling || 0}%</div>
                <div className="text-sm text-gray-600">Feeling</div>
              </div>
              <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100 text-center">
                <div className="text-yellow-700 font-bold">{starCard?.planning || 0}%</div>
                <div className="text-sm text-gray-600">Planning</div>
              </div>
            </div>
          </div>
        )}
        
        {/* Step 2: Reflect on 1st strength */}
        {activeStep === 2 && sortedStrengths.length > 0 && (
          <div className="space-y-6">
            <div className="max-w-3xl mx-auto">
              <h3 className="text-xl font-bold text-gray-800 mb-3">
                Your Primary Strength: {getQuadrantName(sortedStrengths[0])}
              </h3>
              <div className="flex items-center text-gray-600 mb-4">
                <div className={`w-4 h-4 rounded-full mr-2 ${
                  sortedStrengths[0] === 'thinking' ? 'bg-green-600' :
                  sortedStrengths[0] === 'acting' ? 'bg-red-600' :
                  sortedStrengths[0] === 'feeling' ? 'bg-blue-600' :
                  'bg-yellow-600'
                }`}></div>
                <span>{getQuadrantDescription(sortedStrengths[0])}</span>
              </div>
              
              <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 mb-6">
                <h4 className="font-medium text-indigo-800 mb-2">How and when do you use this strength?</h4>
                <p className="text-gray-700 text-sm mb-3">
                  Think about specific situations at work where your {getQuadrantName(sortedStrengths[0]).toLowerCase()} 
                  skills really shine. What does it look like in action?
                </p>
                <div className="text-xs text-gray-600 italic mb-1">Examples:</div>
                <div className="text-xs text-gray-600 grid gap-2 mb-2">
                  {sortedStrengths[0] === 'thinking' && (
                    <>
                      <div className="bg-white p-2 rounded">"I use my analytical strength when solving complex problems. I'm often asked to review data and find patterns that others might miss."</div>
                      <div className="bg-white p-2 rounded">"My thinking skills help me create logical approaches to challenges. I break down big problems into smaller, manageable parts."</div>
                    </>
                  )}
                  {sortedStrengths[0] === 'acting' && (
                    <>
                      <div className="bg-white p-2 rounded">"I use my decisive strength to drive projects forward when things get stuck. I'm comfortable making quick decisions when needed."</div>
                      <div className="bg-white p-2 rounded">"My action-oriented nature helps me turn ideas into reality. I create momentum that inspires others to move forward."</div>
                    </>
                  )}
                  {sortedStrengths[0] === 'feeling' && (
                    <>
                      <div className="bg-white p-2 rounded">"I use my empathetic strength during team conflicts. I can sense underlying tensions and help people understand each other's perspectives."</div>
                      <div className="bg-white p-2 rounded">"My relationship skills help me build strong connections with clients. I listen carefully to their needs and make them feel valued."</div>
                    </>
                  )}
                  {sortedStrengths[0] === 'planning' && (
                    <>
                      <div className="bg-white p-2 rounded">"I use my organizational strength to keep projects on track. I create systems that help everyone know exactly what needs to be done and when."</div>
                      <div className="bg-white p-2 rounded">"My methodical approach helps prevent mistakes. I think through processes step by step and anticipate potential issues before they happen."</div>
                    </>
                  )}
                </div>
              </div>
              
              <Textarea 
                placeholder={`Describe how you use your ${getQuadrantName(sortedStrengths[0])} strength in your work life...`}
                className="w-full min-h-[150px] border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                value={reflections.strength1}
                onChange={(e) => handleReflectionChange('strength1', e.target.value)}
              />
            </div>
          </div>
        )}
        
        {/* Step 3: Reflect on 2nd strength */}
        {activeStep === 3 && sortedStrengths.length > 1 && (
          <div className="space-y-6">
            <div className="max-w-3xl mx-auto">
              <h3 className="text-xl font-bold text-gray-800 mb-3">
                Your Secondary Strength: {getQuadrantName(sortedStrengths[1])}
              </h3>
              <div className="flex items-center text-gray-600 mb-4">
                <div className={`w-4 h-4 rounded-full mr-2 ${
                  sortedStrengths[1] === 'thinking' ? 'bg-green-600' :
                  sortedStrengths[1] === 'acting' ? 'bg-red-600' :
                  sortedStrengths[1] === 'feeling' ? 'bg-blue-600' :
                  'bg-yellow-600'
                }`}></div>
                <span>{getQuadrantDescription(sortedStrengths[1])}</span>
              </div>
              
              <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 mb-6">
                <h4 className="font-medium text-indigo-800 mb-2">How does this strength complement your primary strength?</h4>
                <p className="text-gray-700 text-sm">
                  Describe situations where your {getQuadrantName(sortedStrengths[1]).toLowerCase()} abilities 
                  add value to your work. How does it pair with your primary strength?
                </p>
              </div>
              
              <Textarea 
                placeholder={`Describe how you use your ${getQuadrantName(sortedStrengths[1])} strength in your work life...`}
                className="w-full min-h-[150px] border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                value={reflections.strength2}
                onChange={(e) => handleReflectionChange('strength2', e.target.value)}
              />
            </div>
          </div>
        )}
        
        {/* Step 4: Reflect on 3rd strength */}
        {activeStep === 4 && sortedStrengths.length > 2 && (
          <div className="space-y-6">
            <div className="max-w-3xl mx-auto">
              <h3 className="text-xl font-bold text-gray-800 mb-3">
                Your Third Strength: {getQuadrantName(sortedStrengths[2])}
              </h3>
              <div className="flex items-center text-gray-600 mb-4">
                <div className={`w-4 h-4 rounded-full mr-2 ${
                  sortedStrengths[2] === 'thinking' ? 'bg-green-600' :
                  sortedStrengths[2] === 'acting' ? 'bg-red-600' :
                  sortedStrengths[2] === 'feeling' ? 'bg-blue-600' :
                  'bg-yellow-600'
                }`}></div>
                <span>{getQuadrantDescription(sortedStrengths[2])}</span>
              </div>
              
              <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 mb-6">
                <h4 className="font-medium text-indigo-800 mb-2">When does this strength become most valuable?</h4>
                <p className="text-gray-700 text-sm">
                  Think about specific scenarios where your {getQuadrantName(sortedStrengths[2]).toLowerCase()} abilities 
                  have helped you or your team overcome challenges.
                </p>
              </div>
              
              <Textarea 
                placeholder={`Describe how you use your ${getQuadrantName(sortedStrengths[2])} strength in your work life...`}
                className="w-full min-h-[150px] border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                value={reflections.strength3}
                onChange={(e) => handleReflectionChange('strength3', e.target.value)}
              />
            </div>
          </div>
        )}
        
        {/* Step 5: Reflect on 4th strength */}
        {activeStep === 5 && sortedStrengths.length > 3 && (
          <div className="space-y-6">
            <div className="max-w-3xl mx-auto">
              <h3 className="text-xl font-bold text-gray-800 mb-3">
                Your Fourth Strength: {getQuadrantName(sortedStrengths[3])}
              </h3>
              <div className="flex items-center text-gray-600 mb-4">
                <div className={`w-4 h-4 rounded-full mr-2 ${
                  sortedStrengths[3] === 'thinking' ? 'bg-green-600' :
                  sortedStrengths[3] === 'acting' ? 'bg-red-600' :
                  sortedStrengths[3] === 'feeling' ? 'bg-blue-600' :
                  'bg-yellow-600'
                }`}></div>
                <span>{getQuadrantDescription(sortedStrengths[3])}</span>
              </div>
              
              <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 mb-6">
                <h4 className="font-medium text-indigo-800 mb-2">How might you develop this strength further?</h4>
                <p className="text-gray-700 text-sm">
                  While this is currently your least dominant strength, it still has value. How could you 
                  grow this area to complement your other strengths?
                </p>
              </div>
              
              <Textarea 
                placeholder={`Describe how you use your ${getQuadrantName(sortedStrengths[3])} strength in your work life...`}
                className="w-full min-h-[150px] border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                value={reflections.strength4}
                onChange={(e) => handleReflectionChange('strength4', e.target.value)}
              />
            </div>
          </div>
        )}
        
        {/* Step 6: Team contributions */}
        {activeStep === 6 && (
          <div className="space-y-6">
            <div className="max-w-3xl mx-auto">
              <h3 className="text-xl font-bold text-gray-800 mb-3">Your Unique Contribution to the Team</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                  <h4 className="font-medium text-indigo-800 mb-2">What I uniquely bring to the team</h4>
                  <p className="text-gray-700 text-sm mb-3">
                    Based on your strength profile, what unique qualities do you contribute to your team?
                    Think about how your combination of strengths creates value.
                  </p>
                  <Textarea 
                    placeholder="Describe your unique contribution to your team or organization..."
                    className="w-full min-h-[120px] border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                    value={reflections.teamContribution}
                    onChange={(e) => handleReflectionChange('teamContribution', e.target.value)}
                  />
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                  <h4 className="font-medium text-purple-800 mb-2">What I value in fellow team members</h4>
                  <p className="text-gray-700 text-sm mb-3">
                    What strengths do you appreciate seeing in your colleagues? 
                    How do they complement your own strengths?
                  </p>
                  <Textarea 
                    placeholder="Describe what you appreciate most in your colleagues..."
                    className="w-full min-h-[120px] border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                    value={reflections.teamValue}
                    onChange={(e) => handleReflectionChange('teamValue', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                <h4 className="font-medium text-green-800 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Reflection Complete!
                </h4>
                <p className="text-gray-700 text-sm mt-2">
                  You've completed your Star Profile reflection. These insights will help you leverage your 
                  strengths more intentionally in your daily work.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Navigation buttons */}
        <div className="flex justify-between mt-8">
          <Button 
            variant="outline"
            onClick={handlePreviousStep}
            disabled={activeStep === 1}
          >
            Previous
          </Button>
          
          {activeStep < 6 ? (
            <Button 
              className="bg-indigo-600 hover:bg-indigo-700"
              onClick={handleNextStep}
            >
              Continue
            </Button>
          ) : (
            <Button 
              onClick={() => handleTabChange("starcard")}
              className="bg-indigo-700 hover:bg-indigo-800"
            >
              Back to Star Card
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

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
              <div className="prose max-w-none mb-6">
                <h2>Reflect on Your Star Profile</h2>
                <p>
                  Now that you've seen your Star Card, take some time to reflect on what your strengths profile reveals about you.
                  This is a space to articulate how you use these strengths in your professional life.
                </p>
              </div>
              
              <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
                  <h2 className="text-xl font-bold mb-2">Your Strengths Reflection</h2>
                </div>
                
                <div className="p-6">
                  <div className="space-y-6">
                    {/* Primary Strength */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">
                          Your Primary Strength: {starCard && 
                            (() => {
                              const values = [
                                { key: 'Thinking', value: starCard.thinking },
                                { key: 'Acting', value: starCard.acting },
                                { key: 'Feeling', value: starCard.feeling },
                                { key: 'Planning', value: starCard.planning }
                              ].sort((a, b) => b.value - a.value);
                              return values[0]?.key || '';
                            })()
                          }
                        </h3>
                        
                        <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 mb-4">
                          <h4 className="font-medium text-indigo-800 mb-2">How do you use this strength?</h4>
                          <p className="text-gray-700 text-sm mb-3">
                            Think about specific situations at work where this strength really shines. 
                            What does it look like in action?
                          </p>
                          
                          <div className="text-xs text-gray-600 italic mb-1">Example:</div>
                          <div className="text-xs text-gray-600">
                            <div className="bg-white p-2 rounded mb-2">
                              "I use this strength when solving complex problems. I'm able to approach challenges 
                              in a way that leverages my natural abilities."
                            </div>
                          </div>
                        </div>
                        
                        <Textarea 
                          placeholder="Describe how you use your primary strength in your work life..."
                          className="w-full min-h-[150px] border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                        />
                      </div>
                      
                      {/* Secondary Strength */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">
                          Your Secondary Strength: {starCard && 
                            (() => {
                              const values = [
                                { key: 'Thinking', value: starCard.thinking },
                                { key: 'Acting', value: starCard.acting },
                                { key: 'Feeling', value: starCard.feeling },
                                { key: 'Planning', value: starCard.planning }
                              ].sort((a, b) => b.value - a.value);
                              return values[1]?.key || '';
                            })()
                          }
                        </h3>
                        
                        <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 mb-4">
                          <h4 className="font-medium text-indigo-800 mb-2">How does this complement your primary strength?</h4>
                          <p className="text-gray-700 text-sm">
                            Describe situations where your secondary strength adds value to your work.
                            How does it pair with your primary strength?
                          </p>
                        </div>
                        
                        <Textarea 
                          placeholder="Describe how you use your secondary strength in your work life..."
                          className="w-full min-h-[150px] border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                    
                    {/* Team contributions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">What I uniquely bring to the team</h3>
                        <div className="bg-purple-50 p-4 rounded-lg border border-purple-100 mb-4">
                          <p className="text-gray-700 text-sm">
                            Based on your strength profile, what unique qualities do you contribute to your team?
                            Think about how your combination of strengths creates value.
                          </p>
                        </div>
                        
                        <Textarea 
                          placeholder="Describe your unique contribution to your team or organization..."
                          className="w-full min-h-[120px] border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                        />
                      </div>
                      
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">What I value in fellow team members</h3>
                        <div className="bg-green-50 p-4 rounded-lg border border-green-100 mb-4">
                          <p className="text-gray-700 text-sm">
                            What strengths do you appreciate seeing in your colleagues? 
                            How do they complement your own strengths?
                          </p>
                        </div>
                        
                        <Textarea 
                          placeholder="Describe what you appreciate most in your colleagues..."
                          className="w-full min-h-[120px] border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
                  strength2: '',
                  strength3: '',
                  strength4: '',
                  teamContribution: '',
                  teamValue: ''
                });
                
                // Helper function to get quadrant name
                const getQuadrantName = (key: string) => {
                  const names: Record<string, string> = {
                    'thinking': 'Thinking',
                    'acting': 'Acting',
                    'feeling': 'Feeling',
                    'planning': 'Planning'
                  };
                  return names[key] || 'Unknown';
                };
                
                // Helper function to get quadrant description
                const getQuadrantDescription = (key: string) => {
                  const descriptions: Record<string, string> = {
                    'thinking': 'analytical & logical approach',
                    'acting': 'decisive & action-oriented',
                    'feeling': 'empathetic & relationship-focused',
                    'planning': 'organized & methodical'
                  };
                  return descriptions[key] || '';
                };
                
                // Get sorted strengths
                const sortedStrengths = starCard ? 
                  Object.entries({
                    'thinking': starCard.thinking,
                    'acting': starCard.acting,
                    'feeling': starCard.feeling,
                    'planning': starCard.planning
                  })
                  .sort(([,a], [,b]) => b - a)
                  .map(([key]) => key)
                  : [];
                
                // Handler for reflection text changes
                const handleReflectionChange = (field: string, value: string) => {
                  setReflections(prev => ({
                    ...prev,
                    [field]: value
                  }));
                };
                
                // Navigation handlers
                const handleNextStep = () => {
                  if (activeStep < 6) {
                    setActiveStep(activeStep + 1);
                  }
                };
                
                const handlePreviousStep = () => {
                  if (activeStep > 1) {
                    setActiveStep(activeStep - 1);
                  }
                };
                
                return (
                  <>
                    <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200">
                      {/* Header with step indicator */}
                      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
                        <h2 className="text-xl font-bold mb-2">Your Strengths Reflection</h2>
                        <p className="opacity-90">Step {activeStep} of 6: {
                          activeStep === 1 ? "Your Strengths Overview" :
                          activeStep === 2 ? `Your Primary Strength` :
                          activeStep === 3 ? `Your Secondary Strength` :
                          activeStep === 4 ? `Your Third Strength` :
                          activeStep === 5 ? `Your Fourth Strength` :
                          "Your Team Contributions"
                        }</p>
                        
                        {/* Progress bar */}
                        <div className="mt-4 bg-white/20 rounded-full h-2 overflow-hidden">
                          <div 
                            className="bg-white h-2 rounded-full transition-all duration-300 ease-in-out" 
                            style={{ width: `${(activeStep / 6) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="p-6">
                        {/* Step 1: Overview with pie chart */}
                        {activeStep === 1 && (
                          <div className="space-y-6">
                            <div className="max-w-3xl mx-auto text-center">
                              <h3 className="text-xl font-bold text-gray-800 mb-4">Your Strengths Profile</h3>
                              <p className="text-gray-600 mb-6">
                                This visualization shows your unique distribution of strengths. In the next steps,
                                you'll reflect on how you use each of these strengths in your professional life.
                              </p>
                            </div>
                            
                            <div className="mx-auto max-w-md">
                              {starCard && (
                                <AssessmentPieChart
                                  thinking={starCard.thinking || 0}
                                  acting={starCard.acting || 0}
                                  feeling={starCard.feeling || 0}
                                  planning={starCard.planning || 0}
                                />
                              )}
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto mt-6">
                              <div className="bg-green-50 p-3 rounded-lg border border-green-100 text-center">
                                <div className="text-green-700 font-bold">{starCard?.thinking || 0}%</div>
                                <div className="text-sm text-gray-600">Thinking</div>
                              </div>
                              <div className="bg-red-50 p-3 rounded-lg border border-red-100 text-center">
                                <div className="text-red-700 font-bold">{starCard?.acting || 0}%</div>
                                <div className="text-sm text-gray-600">Acting</div>
                              </div>
                              <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 text-center">
                                <div className="text-blue-700 font-bold">{starCard?.feeling || 0}%</div>
                                <div className="text-sm text-gray-600">Feeling</div>
                              </div>
                              <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100 text-center">
                                <div className="text-yellow-700 font-bold">{starCard?.planning || 0}%</div>
                                <div className="text-sm text-gray-600">Planning</div>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {/* Step 2: Reflect on 1st strength */}
                        {activeStep === 2 && sortedStrengths.length > 0 && (
                          <div className="space-y-6">
                            <div className="max-w-3xl mx-auto">
                              <h3 className="text-xl font-bold text-gray-800 mb-3">
                                Your Primary Strength: {getQuadrantName(sortedStrengths[0])}
                              </h3>
                              <div className="flex items-center text-gray-600 mb-4">
                                <div className={`w-4 h-4 rounded-full mr-2 ${
                                  sortedStrengths[0] === 'thinking' ? 'bg-green-600' :
                                  sortedStrengths[0] === 'acting' ? 'bg-red-600' :
                                  sortedStrengths[0] === 'feeling' ? 'bg-blue-600' :
                                  'bg-yellow-600'
                                }`}></div>
                                <span>{getQuadrantDescription(sortedStrengths[0])}</span>
                              </div>
                              
                              <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 mb-6">
                                <h4 className="font-medium text-indigo-800 mb-2">How and when do you use this strength?</h4>
                                <p className="text-gray-700 text-sm mb-3">
                                  Think about specific situations at work where your {getQuadrantName(sortedStrengths[0]).toLowerCase()} 
                                  skills really shine. What does it look like in action?
                                </p>
                                <div className="text-xs text-gray-600 italic mb-1">Examples:</div>
                                <div className="text-xs text-gray-600 grid gap-2 mb-2">
                                  {sortedStrengths[0] === 'thinking' && (
                                    <>
                                      <div className="bg-white p-2 rounded">"I use my analytical strength when solving complex problems. I'm often asked to review data and find patterns that others might miss."</div>
                                      <div className="bg-white p-2 rounded">"My thinking skills help me create logical approaches to challenges. I break down big problems into smaller, manageable parts."</div>
                                    </>
                                  )}
                                  {sortedStrengths[0] === 'acting' && (
                                    <>
                                      <div className="bg-white p-2 rounded">"I use my decisive strength to drive projects forward when things get stuck. I'm comfortable making quick decisions when needed."</div>
                                      <div className="bg-white p-2 rounded">"My action-oriented nature helps me turn ideas into reality. I create momentum that inspires others to move forward."</div>
                                    </>
                                  )}
                                  {sortedStrengths[0] === 'feeling' && (
                                    <>
                                      <div className="bg-white p-2 rounded">"I use my empathetic strength during team conflicts. I can sense underlying tensions and help people understand each other's perspectives."</div>
                                      <div className="bg-white p-2 rounded">"My relationship skills help me build strong connections with clients. I listen carefully to their needs and make them feel valued."</div>
                                    </>
                                  )}
                                  {sortedStrengths[0] === 'planning' && (
                                    <>
                                      <div className="bg-white p-2 rounded">"I use my organizational strength to keep projects on track. I create systems that help everyone know exactly what needs to be done and when."</div>
                                      <div className="bg-white p-2 rounded">"My methodical approach helps prevent mistakes. I think through processes step by step and anticipate potential issues before they happen."</div>
                                    </>
                                  )}
                                </div>
                              </div>
                              
                              <Textarea 
                                placeholder={`Describe how you use your ${getQuadrantName(sortedStrengths[0])} strength in your work life...`}
                                className="w-full min-h-[150px] border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                                value={reflections.strength1}
                                onChange={(e) => handleReflectionChange('strength1', e.target.value)}
                              />
                            </div>
                          </div>
                        )}
                        
                        {/* Step 3: Reflect on 2nd strength */}
                        {activeStep === 3 && sortedStrengths.length > 1 && (
                          <div className="space-y-6">
                            <div className="max-w-3xl mx-auto">
                              <h3 className="text-xl font-bold text-gray-800 mb-3">
                                Your Secondary Strength: {getQuadrantName(sortedStrengths[1])}
                              </h3>
                              <div className="flex items-center text-gray-600 mb-4">
                                <div className={`w-4 h-4 rounded-full mr-2 ${
                                  sortedStrengths[1] === 'thinking' ? 'bg-green-600' :
                                  sortedStrengths[1] === 'acting' ? 'bg-red-600' :
                                  sortedStrengths[1] === 'feeling' ? 'bg-blue-600' :
                                  'bg-yellow-600'
                                }`}></div>
                                <span>{getQuadrantDescription(sortedStrengths[1])}</span>
                              </div>
                              
                              <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 mb-6">
                                <h4 className="font-medium text-indigo-800 mb-2">How does this strength complement your primary strength?</h4>
                                <p className="text-gray-700 text-sm">
                                  Describe situations where your {getQuadrantName(sortedStrengths[1]).toLowerCase()} abilities 
                                  add value to your work. How does it pair with your primary strength?
                                </p>
                              </div>
                              
                              <Textarea 
                                placeholder={`Describe how you use your ${getQuadrantName(sortedStrengths[1])} strength in your work life...`}
                                className="w-full min-h-[150px] border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                                value={reflections.strength2}
                                onChange={(e) => handleReflectionChange('strength2', e.target.value)}
                              />
                            </div>
                          </div>
                        )}
                        
                        {/* Step 4: Reflect on 3rd strength */}
                        {activeStep === 4 && sortedStrengths.length > 2 && (
                          <div className="space-y-6">
                            <div className="max-w-3xl mx-auto">
                              <h3 className="text-xl font-bold text-gray-800 mb-3">
                                Your Third Strength: {getQuadrantName(sortedStrengths[2])}
                              </h3>
                              <div className="flex items-center text-gray-600 mb-4">
                                <div className={`w-4 h-4 rounded-full mr-2 ${
                                  sortedStrengths[2] === 'thinking' ? 'bg-green-600' :
                                  sortedStrengths[2] === 'acting' ? 'bg-red-600' :
                                  sortedStrengths[2] === 'feeling' ? 'bg-blue-600' :
                                  'bg-yellow-600'
                                }`}></div>
                                <span>{getQuadrantDescription(sortedStrengths[2])}</span>
                              </div>
                              
                              <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 mb-6">
                                <h4 className="font-medium text-indigo-800 mb-2">When does this strength become most valuable?</h4>
                                <p className="text-gray-700 text-sm">
                                  Think about specific scenarios where your {getQuadrantName(sortedStrengths[2]).toLowerCase()} abilities 
                                  have helped you or your team overcome challenges.
                                </p>
                              </div>
                              
                              <Textarea 
                                placeholder={`Describe how you use your ${getQuadrantName(sortedStrengths[2])} strength in your work life...`}
                                className="w-full min-h-[150px] border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                                value={reflections.strength3}
                                onChange={(e) => handleReflectionChange('strength3', e.target.value)}
                              />
                            </div>
                          </div>
                        )}
                        
                        {/* Step 5: Reflect on 4th strength */}
                        {activeStep === 5 && sortedStrengths.length > 3 && (
                          <div className="space-y-6">
                            <div className="max-w-3xl mx-auto">
                              <h3 className="text-xl font-bold text-gray-800 mb-3">
                                Your Fourth Strength: {getQuadrantName(sortedStrengths[3])}
                              </h3>
                              <div className="flex items-center text-gray-600 mb-4">
                                <div className={`w-4 h-4 rounded-full mr-2 ${
                                  sortedStrengths[3] === 'thinking' ? 'bg-green-600' :
                                  sortedStrengths[3] === 'acting' ? 'bg-red-600' :
                                  sortedStrengths[3] === 'feeling' ? 'bg-blue-600' :
                                  'bg-yellow-600'
                                }`}></div>
                                <span>{getQuadrantDescription(sortedStrengths[3])}</span>
                              </div>
                              
                              <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 mb-6">
                                <h4 className="font-medium text-indigo-800 mb-2">How might you develop this strength further?</h4>
                                <p className="text-gray-700 text-sm">
                                  While this is currently your least dominant strength, it still has value. How could you 
                                  grow this area to complement your other strengths?
                                </p>
                              </div>
                              
                              <Textarea 
                                placeholder={`Describe how you use your ${getQuadrantName(sortedStrengths[3])} strength in your work life...`}
                                className="w-full min-h-[150px] border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                                value={reflections.strength4}
                                onChange={(e) => handleReflectionChange('strength4', e.target.value)}
                              />
                            </div>
                          </div>
                        )}
                        
                        {/* Step 6: Team contributions */}
                        {activeStep === 6 && (
                          <div className="space-y-6">
                            <div className="max-w-3xl mx-auto">
                              <h3 className="text-xl font-bold text-gray-800 mb-3">Your Unique Contribution to the Team</h3>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                                  <h4 className="font-medium text-indigo-800 mb-2">What I uniquely bring to the team</h4>
                                  <p className="text-gray-700 text-sm mb-3">
                                    Based on your strength profile, what unique qualities do you contribute to your team?
                                    Think about how your combination of strengths creates value.
                                  </p>
                                  <Textarea 
                                    placeholder="Describe your unique contribution to your team or organization..."
                                    className="w-full min-h-[120px] border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                                    value={reflections.teamContribution}
                                    onChange={(e) => handleReflectionChange('teamContribution', e.target.value)}
                                  />
                                </div>
                                
                                <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                                  <h4 className="font-medium text-purple-800 mb-2">What I value in fellow team members</h4>
                                  <p className="text-gray-700 text-sm mb-3">
                                    What strengths do you appreciate seeing in your colleagues? 
                                    How do they complement your own strengths?
                                  </p>
                                  <Textarea 
                                    placeholder="Describe what you appreciate most in your colleagues..."
                                    className="w-full min-h-[120px] border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                                    value={reflections.teamValue}
                                    onChange={(e) => handleReflectionChange('teamValue', e.target.value)}
                                  />
                                </div>
                              </div>
                              
                              <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                                <h4 className="font-medium text-green-800 flex items-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                  </svg>
                                  Reflection Complete!
                                </h4>
                                <p className="text-gray-700 text-sm mt-2">
                                  You've completed your Star Profile reflection. These insights will help you leverage your 
                                  strengths more intentionally in your daily work.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {/* Navigation buttons */}
                        <div className="flex justify-between mt-8">
                          <Button 
                            variant="outline"
                            onClick={handlePreviousStep}
                            disabled={activeStep === 1}
                          >
                            Previous
                          </Button>
                          
                          {activeStep < 6 ? (
                            <Button 
                              className="bg-indigo-600 hover:bg-indigo-700"
                              onClick={handleNextStep}
                            >
                              Continue
                            </Button>
                          ) : (
                            <Button 
                              onClick={() => handleTabChange("starcard")}
                              className="bg-indigo-700 hover:bg-indigo-800"
                            >
                              Back to Star Card
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                );
              })()}
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