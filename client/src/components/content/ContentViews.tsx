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
        <div className="prose max-w-none">
          <h1 className="text-3xl font-bold text-purple-700 mb-6">The Triple Challenge</h1>
          
          <div className="mb-8 bg-purple-50 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold text-purple-700 mb-4">Today's Leaders Face Three Interconnected Challenges</h2>
            
            <div className="grid md:grid-cols-3 gap-6 mt-6">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h3 className="text-xl text-purple-800 font-semibold mb-2">Complexity</h3>
                <p className="text-gray-700">
                  We operate in environments with countless interdependent variables, where cause and effect are often distant in time and space.
                </p>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h3 className="text-xl text-purple-800 font-semibold mb-2">Velocity</h3>
                <p className="text-gray-700">
                  The pace of change continues to accelerate, requiring faster adaptation and more agile thinking than ever before.
                </p>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h3 className="text-xl text-purple-800 font-semibold mb-2">Uncertainty</h3>
                <p className="text-gray-700">
                  We must make decisions with incomplete information in contexts of increasing unpredictability and risk.
                </p>
              </div>
            </div>
          </div>
          
          <h2 className="text-2xl font-semibold text-purple-700 mb-4">Why Traditional Approaches Fall Short</h2>
          <p className="text-lg text-gray-700 mb-6">
            Linear thinking, rigid planning, and top-down management are increasingly inadequate for today's environment. 
            As technology advances, we need to develop uniquely human capabilities that complement rather than compete 
            with artificial intelligence.
          </p>
          
          <div className="bg-purple-100 p-6 rounded-lg mb-8">
            <h3 className="text-xl font-semibold text-purple-800 mb-4">The Collaboration Gap</h3>
            <p className="text-gray-700">
              Many organizations struggle to bridge disciplinary silos and connect diverse perspectives. 
              True innovation emerges from the intersections between different domains of knowledge, requiring 
              new forms of collaboration and knowledge integration.
            </p>
          </div>
          
          <div className="flex justify-end mt-8">
            <Button 
              onClick={() => {
                markStepCompleted('1-2');
                setCurrentContent("imaginal-solution");
              }}
              className="bg-purple-600 hover:bg-purple-700 text-white"
              size="lg"
            >
              Next: The Imaginal Agility Solution
            </Button>
          </div>
        </div>
      );
      
    case 'imaginal-solution':
      return (
        <div className="prose max-w-none">
          <h1 className="text-3xl font-bold text-purple-700 mb-6">The Imaginal Agility Solution</h1>
          
          <div className="mb-8">
            <img 
              src="https://images.unsplash.com/photo-1500576992153-0271099def59?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2969&q=80" 
              alt="Person looking at a vast horizon, representing imagination and possibility"
              className="w-full rounded-lg object-cover h-64"
            />
          </div>
          
          <h2 className="text-2xl font-semibold text-purple-700 mb-4">Strategic Imagination: The Human Advantage</h2>
          <p className="text-lg text-gray-700 mb-6">
            Imaginal Agility is the human capacity to navigate complex, fast-changing environments by 
            integrating imagination with strategic thinking. It's not just creative thinking, but the ability 
            to envision possibilities and create practical pathways toward preferred futures.
          </p>
          
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="bg-purple-50 p-6 rounded-lg">
              <h3 className="text-xl text-purple-800 font-semibold mb-3">What It Is</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="text-purple-600 font-bold mr-2">•</span>
                  <span>A systematic approach to developing imagination as a strategic capability</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-600 font-bold mr-2">•</span>
                  <span>A portfolio of practices that strengthen adaptability in changing contexts</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-600 font-bold mr-2">•</span>
                  <span>A framework for integrating human creativity with technological capabilities</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-purple-50 p-6 rounded-lg">
              <h3 className="text-xl text-purple-800 font-semibold mb-3">What It Is Not</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="text-purple-600 font-bold mr-2">•</span>
                  <span>Generic creativity training or artistic expression</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-600 font-bold mr-2">•</span>
                  <span>Unrealistic or impractical "blue sky" thinking</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-600 font-bold mr-2">•</span>
                  <span>A technical skill that can be replaced by AI</span>
                </li>
              </ul>
            </div>
          </div>
          
          <h2 className="text-2xl font-semibold text-purple-700 mb-4">The 5 Core Capabilities (5Cs)</h2>
          <p className="text-lg text-gray-700 mb-6">
            Our research has identified five core capabilities that form the foundation of Imaginal Agility. 
            Each capability can be strengthened through deliberate practice and integrated into your professional workflow:
          </p>
          
          <div className="bg-purple-100 p-6 rounded-lg mb-8">
            <ul className="space-y-4">
              <li className="flex items-start">
                <div className="h-8 w-8 rounded-full bg-purple-600 text-white flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">C</div>
                <div>
                  <span className="font-semibold text-purple-800">Curiosity:</span>
                  <span className="text-gray-700"> The ability to ask powerful questions, challenge assumptions, and maintain openness to new information</span>
                </div>
              </li>
              <li className="flex items-start">
                <div className="h-8 w-8 rounded-full bg-purple-600 text-white flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">C</div>
                <div>
                  <span className="font-semibold text-purple-800">Courage:</span>
                  <span className="text-gray-700"> The willingness to take intelligent risks, embrace uncertainty, and adapt in the face of challenges</span>
                </div>
              </li>
              <li className="flex items-start">
                <div className="h-8 w-8 rounded-full bg-purple-600 text-white flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">C</div>
                <div>
                  <span className="font-semibold text-purple-800">Connection:</span>
                  <span className="text-gray-700"> The capacity to build relationships, bridge disciplines, and integrate diverse perspectives</span>
                </div>
              </li>
              <li className="flex items-start">
                <div className="h-8 w-8 rounded-full bg-purple-600 text-white flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">C</div>
                <div>
                  <span className="font-semibold text-purple-800">Creativity:</span>
                  <span className="text-gray-700"> The ability to generate novel ideas, make unexpected connections, and envision new possibilities</span>
                </div>
              </li>
              <li className="flex items-start">
                <div className="h-8 w-8 rounded-full bg-purple-600 text-white flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">C</div>
                <div>
                  <span className="font-semibold text-purple-800">Clarity:</span>
                  <span className="text-gray-700"> The skill to discern patterns, find signal in noise, and maintain focus on what matters most</span>
                </div>
              </li>
            </ul>
          </div>
          
          <div className="flex justify-end mt-8">
            <Button 
              onClick={() => {
                markStepCompleted('1-3');
                setCurrentContent("five-capabilities");
              }}
              className="bg-purple-600 hover:bg-purple-700 text-white"
              size="lg"
            >
              Next: Your 5 Capabilities (5Cs)
            </Button>
          </div>
        </div>
      );
      
    case 'five-capabilities':
      return (
        <div className="prose max-w-none">
          <h1 className="text-3xl font-bold text-purple-700 mb-6">Your 5 Capabilities (5Cs)</h1>
          
          <p className="text-lg text-gray-700 mb-6">
            Understanding your 5Cs profile is the first step toward developing your Imaginal Agility. 
            Each capability represents a distinct dimension of strategic imagination that can be 
            strengthened through deliberate practice.
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-purple-50 p-6 rounded-lg shadow-sm">
              <div className="h-12 w-12 rounded-full bg-purple-600 text-white flex items-center justify-center mb-4 text-xl font-bold">C</div>
              <h3 className="text-xl text-purple-800 font-semibold mb-3">Curiosity</h3>
              <p className="text-gray-700 mb-4">
                The ability to ask powerful questions, challenge assumptions, and maintain openness to new information.
              </p>
              <div className="bg-white p-3 rounded-lg text-sm">
                <span className="font-semibold text-purple-800">Key practices:</span>
                <ul className="mt-2 space-y-1">
                  <li>Asking "what if" and "how might we" questions</li>
                  <li>Seeking diverse perspectives</li>
                  <li>Suspending judgment</li>
                </ul>
              </div>
            </div>
            
            <div className="bg-purple-50 p-6 rounded-lg shadow-sm">
              <div className="h-12 w-12 rounded-full bg-purple-600 text-white flex items-center justify-center mb-4 text-xl font-bold">C</div>
              <h3 className="text-xl text-purple-800 font-semibold mb-3">Courage</h3>
              <p className="text-gray-700 mb-4">
                The willingness to take intelligent risks, embrace uncertainty, and adapt in the face of challenges.
              </p>
              <div className="bg-white p-3 rounded-lg text-sm">
                <span className="font-semibold text-purple-800">Key practices:</span>
                <ul className="mt-2 space-y-1">
                  <li>Experimenting with new approaches</li>
                  <li>Learning from failures</li>
                  <li>Persisting through ambiguity</li>
                </ul>
              </div>
            </div>
            
            <div className="bg-purple-50 p-6 rounded-lg shadow-sm">
              <div className="h-12 w-12 rounded-full bg-purple-600 text-white flex items-center justify-center mb-4 text-xl font-bold">C</div>
              <h3 className="text-xl text-purple-800 font-semibold mb-3">Connection</h3>
              <p className="text-gray-700 mb-4">
                The capacity to build relationships, bridge disciplines, and integrate diverse perspectives.
              </p>
              <div className="bg-white p-3 rounded-lg text-sm">
                <span className="font-semibold text-purple-800">Key practices:</span>
                <ul className="mt-2 space-y-1">
                  <li>Building collaborative networks</li>
                  <li>Crossing disciplinary boundaries</li>
                  <li>Creating psychological safety</li>
                </ul>
              </div>
            </div>
            
            <div className="bg-purple-50 p-6 rounded-lg shadow-sm">
              <div className="h-12 w-12 rounded-full bg-purple-600 text-white flex items-center justify-center mb-4 text-xl font-bold">C</div>
              <h3 className="text-xl text-purple-800 font-semibold mb-3">Creativity</h3>
              <p className="text-gray-700 mb-4">
                The ability to generate novel ideas, make unexpected connections, and envision new possibilities.
              </p>
              <div className="bg-white p-3 rounded-lg text-sm">
                <span className="font-semibold text-purple-800">Key practices:</span>
                <ul className="mt-2 space-y-1">
                  <li>Ideation and divergent thinking</li>
                  <li>Making surprising connections</li>
                  <li>Generating multiple scenarios</li>
                </ul>
              </div>
            </div>
            
            <div className="bg-purple-50 p-6 rounded-lg shadow-sm">
              <div className="h-12 w-12 rounded-full bg-purple-600 text-white flex items-center justify-center mb-4 text-xl font-bold">C</div>
              <h3 className="text-xl text-purple-800 font-semibold mb-3">Clarity</h3>
              <p className="text-gray-700 mb-4">
                The skill to discern patterns, find signal in noise, and maintain focus on what matters most.
              </p>
              <div className="bg-white p-3 rounded-lg text-sm">
                <span className="font-semibold text-purple-800">Key practices:</span>
                <ul className="mt-2 space-y-1">
                  <li>Strategic prioritization</li>
                  <li>Pattern recognition</li>
                  <li>Focused attention</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="bg-purple-100 p-6 rounded-lg mb-8">
            <h2 className="text-2xl font-semibold text-purple-700 mb-4">Everyone Has a Unique Profile</h2>
            <p className="text-gray-700 mb-4">
              While all five capabilities are important, most people naturally have stronger and weaker areas. 
              Understanding your profile helps you build on your strengths while developing your areas for growth.
            </p>
            <p className="text-gray-700">
              The assessments in this program will help you identify your current profile and track your development 
              over time as you practice the techniques and apply the principles of Imaginal Agility.
            </p>
          </div>
          
          <div className="flex justify-end mt-8">
            <Button 
              onClick={() => {
                markStepCompleted('1-4');
                setCurrentContent("imagination-assessment");
              }}
              className="bg-purple-600 hover:bg-purple-700 text-white"
              size="lg"
            >
              Next: Take the Imagination Assessment
            </Button>
          </div>
        </div>
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