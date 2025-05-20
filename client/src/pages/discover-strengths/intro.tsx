import React from 'react';
import MainContainer from '@/components/layout/MainContainer';
import { ContentSection } from '@/components/navigation';
import { useNavigationProgress } from '@/hooks/use-navigation-progress';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { ArrowRightIcon } from 'lucide-react';

export default function StrengthsIntro() {
  const { markStepCompleted } = useNavigationProgress();
  
  const handleCompleteStep = () => {
    markStepCompleted('strengths-intro');
  };
  
  return (
    <MainContainer 
      stepId="strengths-intro" 
      useModernNavigation={true}
      showStepNavigation={true}
    >
      <div className="max-w-3xl mx-auto">
        <ContentSection
          title="Discover Your Strengths"
          description="Understanding the four key quadrants that make up your Star Profile"
          stepId="strengths-intro"
          estimatedTime={10}
          onNextClick={handleCompleteStep}
        >
          <div className="space-y-6">
            <p>
              Everyone has a unique pattern of natural strengths. In this module, 
              you'll discover your distinctive "Star Profile" - the combination of strengths 
              that make you who you are.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
              <div className="bg-red-50 p-5 rounded-lg border border-red-100">
                <h3 className="font-semibold text-red-800 mb-2">ACTING</h3>
                <p className="text-red-700 text-sm">
                  The Acting quadrant represents your capacity for taking initiative, 
                  driving results, and making things happen. People with high Acting scores 
                  are decisive, energetic, and focus on getting things done.
                </p>
              </div>
              
              <div className="bg-yellow-50 p-5 rounded-lg border border-yellow-100">
                <h3 className="font-semibold text-yellow-800 mb-2">PLANNING</h3>
                <p className="text-yellow-700 text-sm">
                  The Planning quadrant represents your capacity for structure, 
                  organization, and careful execution. People with high Planning scores 
                  are methodical, detail-oriented, and excel at creating systems.
                </p>
              </div>
              
              <div className="bg-blue-50 p-5 rounded-lg border border-blue-100">
                <h3 className="font-semibold text-blue-800 mb-2">FEELING</h3>
                <p className="text-blue-700 text-sm">
                  The Feeling quadrant represents your capacity for empathy, 
                  collaboration, and building relationships. People with high Feeling scores 
                  are intuitive about others, emotionally intelligent, and people-focused.
                </p>
              </div>
              
              <div className="bg-green-50 p-5 rounded-lg border border-green-100">
                <h3 className="font-semibold text-green-800 mb-2">THINKING</h3>
                <p className="text-green-700 text-sm">
                  The Thinking quadrant represents your capacity for analysis, 
                  vision, and innovative ideas. People with high Thinking scores 
                  are insightful, strategic, and excel at conceptual challenges.
                </p>
              </div>
            </div>
            
            <h3 className="text-xl font-semibold mt-8">Your Unique Pattern</h3>
            <p>
              While everyone has some capability in all four quadrants, most people naturally 
              excel in one or two areas. These dominant quadrants form your "strength pattern" - 
              the types of activities that energize rather than drain you.
            </p>
            
            <p>
              Understanding your unique strength pattern helps you:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Make career and role choices that leverage your natural talents</li>
              <li>Understand why certain tasks feel effortless while others are draining</li>
              <li>Identify the best ways to collaborate with others who have different patterns</li>
              <li>Build teams that have complementary strengths across all quadrants</li>
            </ul>
            
            <div className="bg-purple-50 p-5 rounded-lg border border-purple-100 mt-8">
              <h4 className="font-medium text-purple-800 mb-2">Ready to discover your Star Profile?</h4>
              <p className="text-purple-700 mb-4">
                In the next step, you'll complete a short assessment that will reveal your 
                unique strength pattern across the four quadrants.
              </p>
              <Button 
                onClick={handleCompleteStep}
                asChild
              >
                <Link to="/discover-strengths/assessment">
                  Continue to Strengths Assessment <ArrowRightIcon className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </ContentSection>
      </div>
    </MainContainer>
  );
}