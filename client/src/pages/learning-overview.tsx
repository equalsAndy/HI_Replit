import { useState } from 'react';
import MainContainer from '@/components/layout/MainContainer';
import { ContentSection, KnowledgeCheck } from '@/components/navigation';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

export default function LearningOverview() {
  const { toast } = useToast();
  const [location, navigate] = useLocation();
  const [showKnowledgeCheck, setShowKnowledgeCheck] = useState(false);
  
  // Handle knowledge check completion
  const handleKnowledgeCheckComplete = (correct: boolean) => {
    if (correct) {
      toast({
        title: "Correct!",
        description: "Great job understanding the learning journey.",
        variant: "default",
      });
    } else {
      toast({
        title: "Not quite right",
        description: "Take another look at the material and try again.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <MainContainer stepId="A2">
      <div className="max-w-3xl mx-auto">
        <ContentSection
          title="Your Learning Journey"
          description="Understanding how to navigate this program for maximum benefit"
          stepId="A2"
          estimatedTime={5}
          required={true}
          onNextClick={() => setShowKnowledgeCheck(true)}
          onPrevClick={() => navigate('/foundations')}
        >
          <h2>Welcome to Your Learning Experience</h2>
          
          <p>
            This program is designed to guide you through a structured learning journey that will help you 
            identify and leverage your unique strengths. Throughout this experience, you'll encounter:
          </p>
          
          <ul>
            <li>
              <strong>Interactive Content</strong> - Engaging materials that adapt to your progress and provide 
              personalized insights.
            </li>
            <li>
              <strong>Knowledge Checks</strong> - Brief questions that help reinforce key concepts and ensure 
              understanding before moving forward.
            </li>
            <li>
              <strong>Guided Reflection</strong> - Opportunities to apply what you've learned to your own experiences 
              and professional context.
            </li>
            <li>
              <strong>Progress Tracking</strong> - Clear visualization of your journey through the program, with the 
              ability to pick up where you left off.
            </li>
          </ul>
          
          <h3>Navigation Features</h3>
          
          <p>
            Our modern navigation system includes several features to enhance your learning experience:
          </p>
          
          <ul>
            <li>
              <strong>Progress Bar</strong> - A visual indicator at the top of the page shows your overall progress 
              through the program.
            </li>
            <li>
              <strong>Section Overview</strong> - The sidebar displays all available sections and tracks which 
              ones you've completed.
            </li>
            <li>
              <strong>Next/Previous Navigation</strong> - Intuitive buttons at the bottom of each page allow you 
              to move forward or backward through the content.
            </li>
            <li>
              <strong>Quick Resume</strong> - The system remembers where you left off, allowing you to continue 
              your journey without losing progress.
            </li>
            <li>
              <strong>Star Card Access</strong> - A floating button provides quick access to your Star Card from 
              any page in the program.
            </li>
          </ul>
          
          <div className="bg-indigo-50 p-4 rounded-md border border-indigo-100 my-6">
            <h4 className="text-indigo-800 font-medium mb-2">Pro Tip</h4>
            <p className="text-indigo-700 text-sm">
              For the best learning experience, complete each section before moving to the next. The system will 
              save your progress automatically, so you can return to where you left off at any time.
            </p>
          </div>
        </ContentSection>
        
        {/* Knowledge Check */}
        {showKnowledgeCheck && (
          <KnowledgeCheck
            id="learning-overview-check"
            question="Which of the following is NOT a feature of the navigation system?"
            options={[
              {
                id: "1",
                text: "Progress tracking that shows your completion status",
                correct: false,
                feedback: "Progress tracking is a key feature of the navigation system, showing your completion status through the learning journey."
              },
              {
                id: "2",
                text: "Automatic grading that affects your final score",
                correct: true,
                feedback: "Correct! The navigation system doesn't include grading that affects a final score - this is a learning journey, not a test."
              },
              {
                id: "3",
                text: "Quick resume functionality that returns you to where you left off",
                correct: false,
                feedback: "Quick resume is an included feature that helps you continue where you left off in previous sessions."
              },
              {
                id: "4",
                text: "Access to your Star Card from any page",
                correct: false,
                feedback: "Quick access to your Star Card is available through the floating button or header link."
              }
            ]}
            onComplete={handleKnowledgeCheckComplete}
          />
        )}
      </div>
    </MainContainer>
  );
}