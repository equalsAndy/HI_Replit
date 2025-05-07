import React from 'react';
import { useLocation, Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Foundations() {
  const [location, navigate] = useLocation();
  
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
          <Tabs defaultValue="intro" className="w-full">
            <TabsList className="grid grid-cols-4 mb-6">
              <TabsTrigger value="intro">Strengths</TabsTrigger>
              <TabsTrigger value="flow">Scenarios</TabsTrigger>
              <TabsTrigger value="reflect">Reflect</TabsTrigger>
              <TabsTrigger value="rounding">Rounding Out</TabsTrigger>
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
                <Button 
                  onClick={() => document.querySelector('[data-value="flow"]')?.click()}
                  className="bg-indigo-700 hover:bg-indigo-800"
                >
                  Next: Assessment Scenarios
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="flow" className="space-y-6">
              <div className="prose max-w-none">
                <h2>Assessment Scenarios</h2>
                <p>
                  You're about to begin the AllStarTeams assessment, which consists of 22 different scenarios. For each scenario, you'll rank four options from "most like me" to "least like me".
                </p>
                
                <div className="my-8 bg-indigo-50 p-6 rounded-lg border border-indigo-100">
                  <h3 className="text-indigo-700">Instructions</h3>
                  <ul>
                    <li>Read each scenario carefully</li>
                    <li>Rank the four options in order of how well they describe your natural tendencies</li>
                    <li>Be honest - there are no right or wrong answers</li>
                    <li>Go with your first instinct rather than overthinking</li>
                    <li>The assessment takes approximately 10-15 minutes to complete</li>
                  </ul>
                </div>
                
                <p className="font-medium text-indigo-700">
                  Click the button below to begin your assessment journey!
                </p>
              </div>
              
              <div className="flex flex-col items-center mt-8">
                <Link href="/assessment">
                  <Button className="bg-green-600 hover:bg-green-700 text-lg py-6 px-8">
                    Begin Assessment →
                  </Button>
                </Link>
                <div className="mt-4">
                  <Button 
                    onClick={() => document.querySelector('[data-value="intro"]')?.click()}
                    variant="outline"
                    size="sm"
                  >
                    ← Back to Strengths
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="reflect" className="space-y-6">
              <div className="prose max-w-none">
                <h2>Reflecting on Your Strengths</h2>
                <p>
                  Self-reflection is a crucial part of the strengths discovery process. As you go through the assessment, take time to consider how the scenarios relate to your real-life experiences.
                </p>
                
                <div className="my-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
                  <h3>Reflection Questions</h3>
                  <p>Consider these questions as you complete the assessment:</p>
                  <ul>
                    <li>When have you lost track of time because you were so engaged in an activity?</li>
                    <li>What types of problems do others typically come to you for help with?</li>
                    <li>What activities give you energy rather than drain you?</li>
                    <li>When do you feel most confident and capable?</li>
                    <li>What aspects of your work do you look forward to the most?</li>
                  </ul>
                </div>
                
                <h3>The Power of Awareness</h3>
                <p>
                  Simply being aware of your strengths can dramatically improve your performance and satisfaction. Research shows that people who use their strengths daily are:
                </p>
                
                <div className="grid grid-cols-2 gap-4 my-6">
                  <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
                    <span className="text-2xl font-bold text-indigo-600">6x</span>
                    <p className="text-sm mt-2">More likely to be engaged at work</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
                    <span className="text-2xl font-bold text-indigo-600">3x</span>
                    <p className="text-sm mt-2">More likely to report excellent quality of life</p>
                  </div>
                </div>
                
                <p>
                  Your Star Card will serve as a visual reminder of your unique strengths profile, helping you make better decisions about how to invest your time and energy.
                </p>
              </div>
              
              <div className="flex justify-between mt-6">
                <Button 
                  onClick={() => document.querySelector('[data-value="flow"]')?.click()}
                  variant="outline"
                >
                  Previous: Scenarios
                </Button>
                <Button 
                  onClick={() => document.querySelector('[data-value="rounding"]')?.click()}
                  className="bg-indigo-700 hover:bg-indigo-800"
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
                  onClick={() => document.querySelector('[data-value="reflect"]')?.click()}
                  variant="outline"
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