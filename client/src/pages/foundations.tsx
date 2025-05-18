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
                  <h4 className="font-medium text-indigo-800 mb-2">How do your strengths benefit your team?</h4>
                  <p className="text-gray-700 text-sm">
                    Reflect on how your unique strength combination creates value for your colleagues and organization.
                  </p>
                  <Textarea 
                    placeholder="Describe the specific ways your strengths help your team succeed..."
                    className="w-full mt-3 min-h-[120px] border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                    value={reflections.teamContribution}
                    onChange={(e) => handleReflectionChange('teamContribution', e.target.value)}
                  />
                </div>
                
                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                  <h4 className="font-medium text-indigo-800 mb-2">What do you value most in team environments?</h4>
                  <p className="text-gray-700 text-sm">
                    Based on your strengths profile, what team qualities or behaviors help you perform at your best?
                  </p>
                  <Textarea 
                    placeholder="Describe the team environment where you thrive..."
                    className="w-full mt-3 min-h-[120px] border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                    value={reflections.teamValue}
                    onChange={(e) => handleReflectionChange('teamValue', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg border border-green-100 mb-6">
                <h4 className="font-medium text-green-800 mb-2">Congratulations!</h4>
                <p className="text-gray-700">
                  You've completed your strengths reflection journey. These insights will be valuable for your 
                  professional development and for understanding your unique contribution to your team.
                </p>
                <Button 
                  className="bg-green-600 hover:bg-green-700 mt-4"
                  onClick={() => handleTabChange('intro')}
                >
                  Return to Strengths Overview
                </Button>
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
            className="px-6"
          >
            Previous
          </Button>
          
          <Button
            onClick={handleNextStep}
            disabled={activeStep === 6}
            className="px-6 bg-indigo-600 hover:bg-indigo-700"
          >
            {activeStep < 6 ? "Next" : "Complete"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Main component 
function getAttributeColor(attrName: string): string {
  switch(attrName) {
    case 'thinking': return 'text-green-600 bg-green-50 border-green-100';
    case 'acting': return 'text-red-600 bg-red-50 border-red-100';
    case 'feeling': return 'text-blue-600 bg-blue-50 border-blue-100';
    case 'planning': return 'text-yellow-600 bg-yellow-50 border-yellow-100';
    default: return 'text-gray-600 bg-gray-50 border-gray-100';
  }
}

// User type definition
interface UserType {
  id: number;
  name: string;
  title: string;
  organization: string;
  progress: number;
  avatarUrl?: string;
}

// Star Card type definition
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
  const [activeTab, setActiveTab] = useState<string>("intro");
  
  const { data: profile } = useQuery<UserType>({
    queryKey: ['/api/user/profile'],
  });

  const { data: starCard } = useQuery<StarCardType>({
    queryKey: ['/api/starcard'],
  });
  
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <div className="min-h-screen bg-gray-50">
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
              <TabsTrigger value="reflect" data-value="reflect">Reflect</TabsTrigger>
              <TabsTrigger value="flow" data-value="flow">Flow</TabsTrigger>
              <TabsTrigger value="rounding" data-value="rounding">Rounding</TabsTrigger>
            </TabsList>

            <TabsContent value="intro" className="space-y-6">
              <div className="prose max-w-none">
                <h2>Your Four Fundamental Forces</h2>
                <p>
                  Your Star Card represents the unique pattern of your natural strengths, showing 
                  how four fundamental forces blend together in your personality.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  {starCard && <StarCard 
                    thinking={starCard.thinking} 
                    acting={starCard.acting} 
                    feeling={starCard.feeling} 
                    planning={starCard.planning}
                    imageUrl={starCard.imageUrl || undefined}
                  />}
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Your Strengths Distribution</h3>
                  <p className="text-gray-600 text-sm">
                    Everyone has all four strengths, but in different proportions. Your Star Card 
                    shows your unique strengths pattern across four quadrants.
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="rounded-lg border p-3 border-green-100 bg-green-50">
                      <h4 className="font-medium text-green-800">Thinking</h4>
                      <p className="text-xs text-gray-600 mt-1">
                        Analytical, logical, conceptual, and data-driven in your approach
                      </p>
                    </div>
                    <div className="rounded-lg border p-3 border-red-100 bg-red-50">
                      <h4 className="font-medium text-red-800">Acting</h4>
                      <p className="text-xs text-gray-600 mt-1">
                        Decisive, action-oriented, results-focused, and pragmatic
                      </p>
                    </div>
                    <div className="rounded-lg border p-3 border-blue-100 bg-blue-50">
                      <h4 className="font-medium text-blue-800">Feeling</h4>
                      <p className="text-xs text-gray-600 mt-1">
                        Empathetic, relationship-oriented, emotionally aware, and supportive
                      </p>
                    </div>
                    <div className="rounded-lg border p-3 border-yellow-100 bg-yellow-50">
                      <h4 className="font-medium text-yellow-800">Planning</h4>
                      <p className="text-xs text-gray-600 mt-1">
                        Organized, detail-focused, methodical, and process-oriented
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="reflect" className="space-y-6">
              <StepByStepReflection starCard={starCard} handleTabChange={handleTabChange} />
            </TabsContent>
            
            <TabsContent value="flow" className="space-y-6">
              <div className="prose max-w-none mb-6">
                <h2>Find Your Flow State</h2>
                <p>
                  Identify the specific attributes that help you achieve your optimal "flow state" - 
                  when you're fully immersed and energized by your work.
                </p>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Select Your Flow Attributes</h3>
                  <p className="text-gray-600 text-sm">Choose 5-7 attributes that best describe you when you're in your flow state.</p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="rounding" className="space-y-6">
              <div className="prose max-w-none mb-6">
                <h2>Rounding Out Your Profile</h2>
                <p>
                  This section helps you identify areas for personal growth by examining
                  the flip side of your strengths.
                </p>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Areas for Development</h3>
                  <p className="text-gray-600 text-sm">
                    Sometimes our greatest strengths can also present challenges. Explore how to balance your natural tendencies.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}