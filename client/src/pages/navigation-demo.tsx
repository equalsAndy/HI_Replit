import React from 'react';
import { useLocation } from 'wouter';
import MainContainer from '@/components/layout/MainContainer';
import { ContentSection, KnowledgeCheck } from '@/components/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { StarIcon, BarChartIcon, Activity, LucideRepeat2, Sparkles, LightbulbIcon, Timer } from 'lucide-react';

// Learning journey sections based on the image provided
const journeySections = [
  { id: 'F1', title: 'Star Self-Assessment', path: '/assessment', icon: StarIcon },
  { id: 'F2', title: 'Core Strengths', path: '/core-strengths', icon: BarChartIcon },
  { id: 'F3', title: 'Flow State', path: '/find-your-flow', icon: Activity },
  { id: 'F4', title: 'Rounding Out', path: '/rounding-out', icon: LucideRepeat2 },
  { id: 'F5', title: 'Visualizing Potential', path: '/visualize-yourself', icon: Sparkles },
  { id: 'F6', title: 'Ladder of Well-Being', path: '/well-being', icon: LightbulbIcon },
  { id: 'F7', title: 'Future Self', path: '/future-self', icon: Timer },
];

export default function NavigationDemo() {
  const [location, navigate] = useLocation();
  
  return (
    <MainContainer stepId="F1" useModernNavigation={true}>
      <div className="max-w-3xl mx-auto">
        <ContentSection
          title="Modern Navigation System Demo"
          description="Explore the features of our new navigation system"
          stepId="F1"
          estimatedTime={5}
          required={true}
          onNextClick={() => navigate('/learning-overview')}
        >
          <h2>Welcome to the Modern Navigation Demo</h2>
          
          <p>
            This demo showcases the new navigation system features:
          </p>
          
          <ul>
            <li>Fixed header with progress visualization</li>
            <li>Collapsible sections that expand to show detailed content</li>
            <li>Progress persistence using localStorage</li>
            <li>Micro-animations for transitions and completion celebrations</li>
            <li>Knowledge check prompts between major sections</li>
            <li>Quick resume feature</li>
            <li><strong>Mobile-friendly vertical navigation</strong> - On mobile devices, click the "Show Learning Journey" button at the top</li>
          </ul>
          
          <div className="my-8 p-4 bg-indigo-50 rounded-md border border-indigo-100">
            <h3 className="text-indigo-800 font-medium mb-2">Navigation Features</h3>
            <p className="text-indigo-700">
              Notice the header above showing your progress and current position in the learning journey.
              Try using the next/previous buttons to navigate between sections.
            </p>
          </div>
          
          {/* Mobile-friendly vertical navigation preview */}
          <div className="mt-8 mb-4">
            <h3 className="text-lg font-medium mb-3">Mobile-Friendly Learning Journey</h3>
            <p className="mb-4">
              Our new vertical navigation works well on all devices, especially mobile. The sections are arranged in a clear, sequential order:
            </p>
            
            <div className="space-y-2 border p-4 rounded-md bg-gray-50">
              {journeySections.map((section, index) => (
                <Card 
                  key={section.id}
                  className={`p-3 flex items-center ${index === 0 ? 'bg-yellow-50 border-yellow-300' : 'bg-white'}`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 text-xs font-medium ${
                    index === 0 ? 'bg-yellow-400 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {section.id.replace('F', '')}
                  </div>
                  <span className={`font-medium ${index === 0 ? 'text-yellow-800' : 'text-gray-700'}`}>{section.title}</span>
                </Card>
              ))}
            </div>
          </div>
          
          <p className="mt-6">
            Click the buttons below to explore other pages that use the new navigation system:
          </p>
          
          <div className="flex flex-wrap gap-4 mt-6">
            <Button onClick={() => navigate('/foundations')}>
              Foundations
            </Button>
            <Button onClick={() => navigate('/learning-overview')}>
              Learning Overview
            </Button>
            <Button onClick={() => navigate('/user-home')}>
              Return to Dashboard
            </Button>
          </div>
        </ContentSection>
        
        <KnowledgeCheck
          id="navigation-demo-check"
          question="Which of the following is a feature of the new navigation system?"
          options={[
            {
              id: "1",
              text: "Automatic content generation with AI",
              correct: false,
              feedback: "The navigation system doesn't generate content automatically."
            },
            {
              id: "2",
              text: "Progress persistence using localStorage",
              correct: true,
              feedback: "Correct! The navigation system stores your progress in localStorage so you can resume where you left off."
            },
            {
              id: "3",
              text: "Payment processing capabilities",
              correct: false,
              feedback: "The navigation system doesn't handle payments."
            },
            {
              id: "4",
              text: "Automatic translation to multiple languages",
              correct: false,
              feedback: "The navigation system doesn't include automatic translation capabilities."
            }
          ]}
          onComplete={(correct) => {
            if (correct) {
              setTimeout(() => navigate('/learning-overview'), 2000);
            }
          }}
        />
      </div>
    </MainContainer>
  );
}