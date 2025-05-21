import React from 'react';
import { ContentViewProps } from '../../shared/types';
import WelcomeView from './WelcomeView';
import IntroStrengthsView from './IntroStrengthsView';
import AssessmentView from './AssessmentView';
import StarCardPreviewView from './StarCardPreviewView';
import ReflectionView from './ReflectionView';
import FlowIntroView from './FlowIntroView';
import IntroToFlowView from './IntroToFlowView';
import FlowAssessmentView from './FlowAssessmentView';
import FlowRoundingOutView from './FlowRoundingOutView';
import FlowStarCardView from './FlowStarCardView';
import WellbeingView from './WellbeingView';
import CantrilLadderView from './CantrilLadderView';
import VisualizingYouView from './VisualizingYouView';
import FutureSelfView from './FutureSelfView';
import FinalReflectionView from './FinalReflectionView';
import StarCardResourceView from './StarCardResourceView';
import PlaceholderView from './PlaceholderView';
import { useApplication } from '@/hooks/use-application';
import { Button } from '@/components/ui/button';

interface ContentViewsProps extends ContentViewProps {
  currentContent: string;
  setIsAssessmentModalOpen: (isOpen: boolean) => void;
}

const ContentViews: React.FC<ContentViewsProps> = ({
  currentContent,
  navigate,
  markStepCompleted,
  setCurrentContent,
  starCard,
  user,
  flowAttributesData,
  setIsAssessmentModalOpen
}) => {
  // Get the current application context
  const { currentApp } = useApplication();
  const isImaginalAgility = currentApp === 'imaginal-agility';
  
  // Return the appropriate content based on currentContent and current application
  switch (currentContent) {
    // Introduction View
    case 'welcome':
      return (
        <WelcomeView 
          navigate={navigate}
          markStepCompleted={markStepCompleted}
          setCurrentContent={setCurrentContent}
          starCard={starCard}
          isImaginalAgility={isImaginalAgility}
        />
      );

    // Discover your Strengths
    case 'intro-strengths':
      return (
        <IntroStrengthsView 
          navigate={navigate}
          markStepCompleted={markStepCompleted}
          setCurrentContent={setCurrentContent}
          starCard={starCard}
        />
      );

    case 'strengths-assessment':
      return (
        <AssessmentView 
          navigate={navigate}
          markStepCompleted={markStepCompleted}
          setCurrentContent={setCurrentContent}
          starCard={starCard}
          setIsAssessmentModalOpen={setIsAssessmentModalOpen}
        />
      );

    case 'star-card-preview':
      return (
        <StarCardPreviewView 
          navigate={navigate}
          markStepCompleted={markStepCompleted}
          setCurrentContent={setCurrentContent}
          starCard={starCard}
        />
      );

    case 'reflection':
      return (
        <ReflectionView 
          navigate={navigate}
          markStepCompleted={markStepCompleted}
          setCurrentContent={setCurrentContent}
          starCard={starCard}
        />
      );

    // Find your Flow
    case 'intro-flow':
      return (
        <FlowIntroView 
          navigate={navigate}
          markStepCompleted={markStepCompleted}
          setCurrentContent={setCurrentContent}
          starCard={starCard}
        />
      );
      
    case 'intro-to-flow':
      return (
        <FlowIntroView 
          navigate={navigate}
          markStepCompleted={markStepCompleted}
          setCurrentContent={setCurrentContent}
          starCard={starCard}
        />
      );

    case 'flow-assessment':
      return (
        <FlowAssessmentView 
          navigate={navigate}
          markStepCompleted={markStepCompleted}
          setCurrentContent={setCurrentContent}
          starCard={starCard}
        />
      );

    case 'flow-rounding-out':
      return (
        <FlowRoundingOutView 
          navigate={navigate}
          markStepCompleted={markStepCompleted}
          setCurrentContent={setCurrentContent}
          starCard={starCard}
        />
      );

    case 'flow-star-card':
      return (
        <FlowStarCardView 
          navigate={navigate}
          markStepCompleted={markStepCompleted}
          setCurrentContent={setCurrentContent}
          starCard={starCard}
          user={user}
          flowAttributesData={flowAttributesData}
        />
      );

    // Visualize your Potential
    case 'wellbeing':
      return (
        <WellbeingView 
          navigate={navigate}
          markStepCompleted={markStepCompleted}
          setCurrentContent={setCurrentContent}
          starCard={starCard}
        />
      );

    case 'cantril-ladder':
      return (
        <CantrilLadderView 
          navigate={navigate}
          markStepCompleted={markStepCompleted}
          setCurrentContent={setCurrentContent}
          starCard={starCard}
        />
      );

    case 'visualizing-you':
      return (
        <VisualizingYouView 
          navigate={navigate}
          markStepCompleted={markStepCompleted}
          setCurrentContent={setCurrentContent}
          starCard={starCard}
        />
      );

    case 'future-self':
      return (
        <FutureSelfView 
          navigate={navigate}
          markStepCompleted={markStepCompleted}
          setCurrentContent={setCurrentContent}
          starCard={starCard}
        />
      );

    case 'your-statement':
      return (
        <FinalReflectionView 
          navigate={navigate}
          markStepCompleted={markStepCompleted}
          setCurrentContent={setCurrentContent}
          starCard={starCard}
        />
      );

    // Imaginal Agility content views
    case 'imaginal-intro':
      return (
        <div className="prose max-w-none">
          <h1 className="text-3xl font-bold text-purple-700 mb-6">Introduction to Imaginal Agility</h1>
          
          <div className="mb-8">
            <iframe 
              src="https://www.youtube.com/embed/1Belekdly70?enablejsapi=1"
              title="IAWS ORIENTATION VIDEO"
              className="w-full h-[400px] rounded-lg" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
            ></iframe>
          </div>
          
          <h2 className="text-2xl font-semibold text-purple-700 mb-4">Workshop Philosophy</h2>
          <p className="text-lg text-gray-700 mb-6">
            Imaginal Agility is founded on the principle that human imagination becomes
            more critical—not less—in the age of artificial intelligence. This workshop will
            help you develop the capacity to envision possibilities beyond what
            technology alone can generate.
          </p>
          
          <h2 className="text-2xl font-semibold text-purple-700 mb-4">Learning Journey Overview</h2>
          <p className="text-lg text-gray-700 mb-6">
            Your journey begins with understanding imagination as an innate human
            capability that can be systematically strengthened. Throughout this program,
            you'll progress through awareness, practice, and application of the five core
            capabilities that fuel Imaginal Agility.
          </p>
          
          <h2 className="text-2xl font-semibold text-purple-700 mb-4">Workshop Principles</h2>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li className="text-lg text-gray-700">Everyone possesses natural imaginative capacities</li>
            <li className="text-lg text-gray-700">These capabilities grow stronger with deliberate practice</li>
            <li className="text-lg text-gray-700">The integration of all capabilities creates maximum impact</li>
            <li className="text-lg text-gray-700">The goal is flourishing alongside technology, not competing with it</li>
          </ul>
          
          <h2 className="text-2xl font-semibold text-purple-700 mb-4">Imagination in Practice</h2>
          <p className="text-lg text-gray-700 mb-6">
            The most innovative organizations today don't just implement AI—they
            reimagine what's possible when human creativity works in concert with
            technology.
          </p>
          
          <div className="flex justify-end mt-8">
            <Button 
              onClick={() => {
                markStepCompleted('1-1');
                setCurrentContent("triple-challenge");
              }}
              className="bg-purple-600 hover:bg-purple-700 text-white"
              size="lg"
            >
              Next: The Triple Challenge
            </Button>
          </div>
        </div>
      );
      
    case 'triple-challenge':
      return (
        <PlaceholderView 
          title="The Triple Challenge"
          description="Explore the three interconnected challenges of complexity, change, and connection that professionals face in today's rapidly evolving landscape."
          navigate={navigate}
          markStepCompleted={markStepCompleted}
          setCurrentContent={setCurrentContent}
          starCard={starCard}
          nextContentKey="imaginal-solution"
          nextLabel="Next: The Imaginal Agility Solution"
        />
      );
      
    case 'imaginal-solution':
      return (
        <PlaceholderView 
          title="The Imaginal Agility Solution"
          description="Discover how Imaginal Agility provides a framework for navigating complexity with creativity, adaptability, and purpose."
          navigate={navigate}
          markStepCompleted={markStepCompleted}
          setCurrentContent={setCurrentContent}
          starCard={starCard}
          nextContentKey="five-capabilities"
          nextLabel="Next: Your 5 Capabilities (5Cs)"
        />
      );
      
    case 'five-capabilities':
      return (
        <PlaceholderView 
          title="Your 5 Capabilities (5Cs)"
          description="Learn about the five core capabilities that form the foundation of Imaginal Agility: Clarity, Curiosity, Creativity, Courage, and Connection."
          navigate={navigate}
          markStepCompleted={markStepCompleted}
          setCurrentContent={setCurrentContent}
          starCard={starCard}
          nextContentKey="imagination-assessment"
          nextLabel="Next: Take the Imagination Assessment"
        />
      );
      
    case 'imagination-assessment':
      return (
        <PlaceholderView 
          title="Take the Imagination Assessment"
          description="Assess your imaginative capacities and discover your unique imagination profile."
          navigate={navigate}
          markStepCompleted={markStepCompleted}
          setCurrentContent={setCurrentContent}
          starCard={starCard}
          nextContentKey="five-c-assessment" 
          nextLabel="Next: Complete the 5Cs Assessment"
        />
      );
      
    case 'five-c-assessment':
      return (
        <PlaceholderView 
          title="Complete the 5Cs Assessment"
          description="Evaluate your proficiency in each of the five capabilities and identify areas for development."
          navigate={navigate}
          markStepCompleted={markStepCompleted}
          setCurrentContent={setCurrentContent}
          starCard={starCard}
          nextContentKey="insights-review"
          nextLabel="Next: Review Your Insights"
        />
      );
      
    case 'insights-review':
      return (
        <PlaceholderView 
          title="Review Your Insights"
          description="Explore the results of your assessments and gain valuable insights into your strengths and development opportunities."
          navigate={navigate}
          markStepCompleted={markStepCompleted}
          setCurrentContent={setCurrentContent}
          starCard={starCard}
          nextContentKey="team-workshop"
          nextLabel="Next: Team Workshop"
        />
      );
      
    case 'team-workshop':
      return (
        <PlaceholderView 
          title="Team Workshop"
          description="Access resources and guidance for conducting an Imaginal Agility workshop with your team to foster collective capabilities."
          navigate={navigate}
          markStepCompleted={markStepCompleted}
          setCurrentContent={setCurrentContent}
          starCard={starCard}
        />
      );
      
    // Handle placeholder content
    default:
      return (
        <PlaceholderView 
          title={`${currentContent}`}
          navigate={navigate}
          markStepCompleted={markStepCompleted}
          setCurrentContent={setCurrentContent}
          starCard={starCard}
        />
      );
  }
};

export default ContentViews;