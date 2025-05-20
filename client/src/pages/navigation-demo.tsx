import React from 'react';
import MainContainer from '@/components/layout/MainContainer';
import { useNavigationProgress } from '@/hooks/use-navigation-progress';
import { ContentSection, KnowledgeCheck } from '@/components/navigation';
import { Button } from '@/components/ui/button';

export default function NavigationDemo() {
  const { markStepCompleted } = useNavigationProgress();

  // Example handler for completing a step
  const handleCompleteStep = (stepId: string) => {
    markStepCompleted(stepId);
  };
  
  return (
    <MainContainer 
      stepId="strengths-intro" 
      useModernNavigation={true}
      showStepNavigation={true}
    >
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Navigation Demo</h1>
        
        <ContentSection
          title="Discover Your Strengths"
          description="Learn about the core strengths that make up your unique Star Profile"
          stepId="strengths-intro"
          estimatedTime={10}
          onNextClick={() => handleCompleteStep('strengths-intro')}
        >
          <div className="space-y-4">
            <p>
              In this module, you'll discover the unique strengths that make you who you are. 
              Everyone has their own pattern of natural strengths that they can leverage to 
              achieve greater wellbeing, effectiveness, and fulfillment.
            </p>
            
            <h3 className="text-xl font-semibold mt-6">Key concepts</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Everyone has natural strengths they can leverage for success</li>
              <li>Your Star Profile is a unique pattern of your core strengths</li>
              <li>Understanding your strengths helps you align your efforts with your natural talents</li>
              <li>Working against your strengths pattern requires more energy and often leads to stress</li>
            </ul>
            
            <div className="bg-blue-50 p-4 rounded-md border border-blue-100 mt-4">
              <p className="text-blue-800">
                <strong>Pro tip:</strong> After completing this section, you'll have a clearer understanding
                of which types of activities naturally energize you versus those that might drain your energy.
              </p>
            </div>
          </div>
        </ContentSection>
        
        <ContentSection
          title="Knowledge Check"
          stepId="strengths-knowledge-check"
          onNextClick={() => handleCompleteStep('strengths-knowledge-check')}
        >
          <KnowledgeCheck
            id="strength-quiz-1"
            question="Which of the following statements about personal strengths is true?"
            options={[
              {
                id: "a",
                text: "Everyone should try to develop the same set of strengths to be successful",
                correct: false,
                feedback: "Different people have different natural strength patterns. Success comes from leveraging your unique set of strengths."
              },
              {
                id: "b",
                text: "Your strengths are fixed at birth and cannot be developed over time",
                correct: false,
                feedback: "While you have natural tendencies, strengths can be developed and enhanced through practice and mindful effort."
              },
              {
                id: "c",
                text: "Understanding your unique strength pattern helps you align your efforts with your natural talents",
                correct: true,
                feedback: "Correct! Knowing your strengths helps you make choices that leverage your natural abilities."
              },
              {
                id: "d",
                text: "The best approach is to focus exclusively on improving your weaknesses",
                correct: false,
                feedback: "While addressing weaknesses can be important, research shows that people achieve more by leveraging and developing their natural strengths."
              }
            ]}
            onComplete={(correct) => {
              if (correct) {
                handleCompleteStep('strengths-knowledge-check');
              }
            }}
          />
        </ContentSection>
        
        <ContentSection
          title="Core Strengths Assessment"
          description="Complete this assessment to identify your core strengths"
          stepId="strengths-assessment"
          estimatedTime={15}
          onNextClick={() => handleCompleteStep('strengths-assessment')}
        >
          <div className="space-y-4">
            <p>
              The assessment below will help you identify your unique pattern of strengths.
              Answer each question honestly based on what feels natural to you, not what
              you think is the "right" answer.
            </p>
            
            <div className="bg-gray-100 p-6 rounded-lg mt-4">
              <h3 className="text-lg font-medium mb-4">Sample Assessment Questions</h3>
              <div className="space-y-6">
                <div>
                  <p className="font-medium mb-2">1. When faced with a new challenge, I typically:</p>
                  <div className="space-y-1">
                    <div className="flex items-center">
                      <input type="radio" id="q1-a" name="q1" className="mr-2" />
                      <label htmlFor="q1-a">Dive in and figure it out as I go</label>
                    </div>
                    <div className="flex items-center">
                      <input type="radio" id="q1-b" name="q1" className="mr-2" />
                      <label htmlFor="q1-b">Create a detailed plan before starting</label>
                    </div>
                    <div className="flex items-center">
                      <input type="radio" id="q1-c" name="q1" className="mr-2" />
                      <label htmlFor="q1-c">Seek others' perspectives and experiences</label>
                    </div>
                    <div className="flex items-center">
                      <input type="radio" id="q1-d" name="q1" className="mr-2" />
                      <label htmlFor="q1-d">Research the topic thoroughly</label>
                    </div>
                  </div>
                </div>
                
                <div>
                  <p className="font-medium mb-2">2. I'm most energized when:</p>
                  <div className="space-y-1">
                    <div className="flex items-center">
                      <input type="radio" id="q2-a" name="q2" className="mr-2" />
                      <label htmlFor="q2-a">Working with a team to solve problems</label>
                    </div>
                    <div className="flex items-center">
                      <input type="radio" id="q2-b" name="q2" className="mr-2" />
                      <label htmlFor="q2-b">Having time to think deeply and reflect</label>
                    </div>
                    <div className="flex items-center">
                      <input type="radio" id="q2-c" name="q2" className="mr-2" />
                      <label htmlFor="q2-c">Being able to express my creativity</label>
                    </div>
                    <div className="flex items-center">
                      <input type="radio" id="q2-d" name="q2" className="mr-2" />
                      <label htmlFor="q2-d">Taking action and seeing immediate results</label>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 text-center">
                <p className="text-gray-500 italic mb-4">This is a demo with sample questions. The full assessment contains 30 questions.</p>
                <Button 
                  onClick={() => handleCompleteStep('strengths-assessment')}
                  className="px-6"
                >
                  Complete Assessment
                </Button>
              </div>
            </div>
          </div>
        </ContentSection>
      </div>
    </MainContainer>
  );
}