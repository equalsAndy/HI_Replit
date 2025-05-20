import React from 'react';
import { useLocation } from 'wouter';
import MainContainer from '@/components/layout/MainContainer';
import { ContentSection, KnowledgeCheck } from '@/components/navigation';
import { Button } from '@/components/ui/button';

export default function NavigationDemo() {
  const [location, navigate] = useLocation();
  
  return (
    <MainContainer stepId="A1" useModernNavigation={true}>
      <div className="max-w-3xl mx-auto">
        <ContentSection
          title="Modern Navigation System Demo"
          description="Explore the features of our new navigation system"
          stepId="A1"
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
            <li>Mobile optimizations</li>
          </ul>
          
          <div className="my-8 p-4 bg-indigo-50 rounded-md border border-indigo-100">
            <h3 className="text-indigo-800 font-medium mb-2">Navigation Features</h3>
            <p className="text-indigo-700">
              Notice the header above showing your progress and current position in the learning journey.
              Try using the next/previous buttons to navigate between sections.
            </p>
          </div>
          
          <p>
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