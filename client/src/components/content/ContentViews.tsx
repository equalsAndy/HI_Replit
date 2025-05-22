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
          
          <div className="mb-8 bg-black p-6 rounded-lg">
            {/* This is a placeholder for the black box that could be an image or video */}
          </div>
          
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">AI Triple Cognitive Challenge</h2>
          <p className="text-lg text-gray-700 mb-6">
            AI enhances efficiency — but at a rising psychological cost to individuals, teams, and organizations.
          </p>
          
          <div className="grid gap-4 mb-8">
            <div className="flex">
              <div className="bg-red-600 text-white p-4 rounded-l-lg w-60">
                <h3 className="text-xl font-semibold">Metacognitive Laziness</h3>
              </div>
              <div className="bg-white p-4 border border-gray-200 rounded-r-lg flex-1">
                <p className="text-gray-700">• Outsourcing thinking and sense-making</p>
              </div>
            </div>
            
            <div className="flex">
              <div className="bg-red-600 text-white p-4 rounded-l-lg w-60">
                <h3 className="text-xl font-semibold">Imagination Deficit</h3>
              </div>
              <div className="bg-white p-4 border border-gray-200 rounded-r-lg flex-1">
                <p className="text-gray-700">• Diminishing the generative core of human potential</p>
              </div>
            </div>
            
            <div className="flex">
              <div className="bg-red-600 text-white p-4 rounded-l-lg w-60">
                <h3 className="text-xl font-semibold">Psychological Debt</h3>
              </div>
              <div className="bg-white p-4 border border-gray-200 rounded-r-lg flex-1">
                <p className="text-gray-700">• Fatigue, disconnection, and loss of purpose</p>
              </div>
            </div>
          </div>
          
          <div className="mb-8 bg-black p-6 rounded-lg">
            {/* This is a placeholder for the second black box that could be an image or video */}
          </div>
          
          <div className="flex justify-end mb-8">
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
          
          <h2 className="text-2xl font-semibold text-purple-700 mb-4">Understanding the Challenge</h2>
          <p className="text-lg text-gray-700 mb-6">
            The Triple Challenge represents interconnected threats to human potential in the AI era. Recognizing these patterns is the first step toward counteracting them in your personal and professional life.
          </p>
          
          <h2 className="text-2xl font-semibold text-purple-700 mb-4">Beyond Efficiency</h2>
          <p className="text-lg text-gray-700 mb-6">
            While AI excels at optimization and efficiency, these alone don't create breakthrough innovations or meaningful human experiences. The real opportunity lies in developing the capabilities that AI cannot replicate—beginning with imagination.
          </p>
          
          <h2 className="text-2xl font-semibold text-purple-700 mb-4">The Hidden Costs</h2>
          <p className="text-lg text-gray-700 mb-6">
            Organizations focused exclusively on AI implementation often experience unexpected downsides: diminished creative thinking, reduced psychological safety, and growing disengagement. These are symptoms of Psychological Debt—a deficit that grows when efficiency is prioritized over imagination.
          </p>
          
          <h2 className="text-2xl font-semibold text-purple-700 mb-4">Challenge as Opportunity</h2>
          <p className="text-lg text-gray-700 mb-6">
            These challenges aren't reasons to reject technology, but invitations to develop the distinctly human capabilities that give technology meaning and direction. The most successful individuals and organizations will be those who balance both.
          </p>
          
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
        <div className="prose max-w-none">
          <h1 className="text-3xl font-bold text-purple-700 mb-6">Imagination Assessment</h1>
          
          <div className="mb-8">
            <img 
              src="https://images.unsplash.com/photo-1555212697-194d092e3b8f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2187&q=80" 
              alt="Creative workspace representing imagination"
              className="w-full rounded-lg object-cover h-64"
            />
          </div>
          
          <h2 className="text-2xl font-semibold text-purple-700 mb-4">Why Assess Your Imagination?</h2>
          <p className="text-lg text-gray-700 mb-6">
            The Imagination Assessment provides you with insights into your natural imaginative tendencies
            and helps identify areas where targeted practice can enhance your strategic imagination capabilities.
            This self-assessment is the first step in developing your personalized Imaginal Agility profile.
          </p>
          
          <div className="bg-purple-50 p-6 rounded-lg mb-8">
            <h3 className="text-xl font-semibold text-purple-800 mb-3">Assessment Overview</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <div className="h-6 w-6 rounded-full bg-purple-200 text-purple-800 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">1</div>
                <span className="text-gray-700">30 scenario-based questions that explore how you think and respond in various situations</span>
              </li>
              <li className="flex items-start">
                <div className="h-6 w-6 rounded-full bg-purple-200 text-purple-800 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">2</div>
                <span className="text-gray-700">10-15 minutes to complete</span>
              </li>
              <li className="flex items-start">
                <div className="h-6 w-6 rounded-full bg-purple-200 text-purple-800 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">3</div>
                <span className="text-gray-700">No right or wrong answers - focus on what feels most natural to you</span>
              </li>
              <li className="flex items-start">
                <div className="h-6 w-6 rounded-full bg-purple-200 text-purple-800 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">4</div>
                <span className="text-gray-700">Personalized results showing your unique imagination profile</span>
              </li>
            </ul>
          </div>
          
          <h2 className="text-2xl font-semibold text-purple-700 mb-4">Preparing for the Assessment</h2>
          <p className="text-lg text-gray-700 mb-6">
            For the most accurate results, find a quiet space where you can reflect honestly without 
            distractions. Answer based on how you naturally think and act, not how you think you should respond.
          </p>
          
          <div className="flex justify-end mt-8">
            <Button 
              onClick={() => {
                markStepCompleted('1-5');
                setCurrentContent("five-c-assessment");
              }}
              className="bg-purple-600 hover:bg-purple-700 text-white"
              size="lg"
            >
              Next: Complete the 5Cs Assessment
            </Button>
          </div>
        </div>
      );
      
    case 'five-c-assessment':
      return (
        <div className="prose max-w-none">
          <h1 className="text-3xl font-bold text-purple-700 mb-6">5Cs Assessment</h1>
          
          <div className="bg-purple-50 p-6 rounded-lg mb-8">
            <h2 className="text-2xl font-semibold text-purple-700 mb-4">Assess Your 5 Capabilities</h2>
            <p className="text-lg text-gray-700 mb-4">
              This assessment takes a deeper dive into each of the five core capabilities that form the foundation of Imaginal Agility.
              Your responses will help create your personalized capability profile and identify areas for targeted development.
            </p>
            
            <div className="grid md:grid-cols-5 gap-4 mt-6">
              {['Curiosity', 'Courage', 'Connection', 'Creativity', 'Clarity'].map((capability, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div className="h-16 w-16 rounded-full bg-purple-600 text-white flex items-center justify-center mb-3 text-xl font-bold">C</div>
                  <span className="font-semibold text-purple-800">{capability}</span>
                </div>
              ))}
            </div>
          </div>
          
          <h2 className="text-2xl font-semibold text-purple-700 mb-4">What to Expect</h2>
          <ul className="space-y-3 mb-6">
            <li className="flex items-start">
              <div className="h-6 w-6 rounded-full bg-purple-200 text-purple-800 flex items-center justify-center mr-3 mt-0.5">•</div>
              <span className="text-gray-700">25 carefully designed questions across the five capability areas</span>
            </li>
            <li className="flex items-start">
              <div className="h-6 w-6 rounded-full bg-purple-200 text-purple-800 flex items-center justify-center mr-3 mt-0.5">•</div>
              <span className="text-gray-700">Approximately 10 minutes to complete</span>
            </li>
            <li className="flex items-start">
              <div className="h-6 w-6 rounded-full bg-purple-200 text-purple-800 flex items-center justify-center mr-3 mt-0.5">•</div>
              <span className="text-gray-700">Personalized results showing your unique capability profile</span>
            </li>
            <li className="flex items-start">
              <div className="h-6 w-6 rounded-full bg-purple-200 text-purple-800 flex items-center justify-center mr-3 mt-0.5">•</div>
              <span className="text-gray-700">Specific recommendations for developing each capability</span>
            </li>
          </ul>
          
          <div className="bg-purple-100 p-6 rounded-lg mb-8">
            <h3 className="text-xl font-semibold text-purple-800 mb-3">Why Your Profile Matters</h3>
            <p className="text-gray-700">
              Your unique capability profile will help you understand your natural strengths and identify areas 
              where targeted practice can enhance your overall Imaginal Agility. The most effective leaders develop
              all five capabilities while leveraging their distinctive strengths.
            </p>
          </div>
          
          <div className="flex justify-end mt-8">
            <Button 
              onClick={() => {
                markStepCompleted('1-6');
                setCurrentContent("insights-review");
              }}
              className="bg-purple-600 hover:bg-purple-700 text-white"
              size="lg"
            >
              Next: Review Your Insights
            </Button>
          </div>
        </div>
      );
      
    case 'insights-review':
      return (
        <div className="prose max-w-none">
          <h1 className="text-3xl font-bold text-purple-700 mb-6">Insights Review</h1>
          
          <div className="bg-purple-50 p-6 rounded-lg mb-8">
            <h2 className="text-2xl font-semibold text-purple-700 mb-4">Your Imaginal Agility Profile</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xl text-purple-800 font-semibold mb-3">Imagination Assessment</h3>
                <p className="text-gray-700 mb-4">
                  Your assessment reveals a strong tendency toward divergent thinking, with particular strengths
                  in possibility generation and comfort with ambiguity. Your imaginative profile shows a blend
                  of practical and exploratory thinking patterns.
                </p>
                <div className="bg-white p-4 rounded-lg">
                  <div className="mb-2">
                    <span className="text-sm text-purple-800 font-semibold">Possibility Thinking</span>
                    <div className="h-2 bg-gray-200 rounded-full mt-1">
                      <div className="h-2 bg-purple-600 rounded-full" style={{width: '78%'}}></div>
                    </div>
                  </div>
                  <div className="mb-2">
                    <span className="text-sm text-purple-800 font-semibold">Comfort with Ambiguity</span>
                    <div className="h-2 bg-gray-200 rounded-full mt-1">
                      <div className="h-2 bg-purple-600 rounded-full" style={{width: '65%'}}></div>
                    </div>
                  </div>
                  <div className="mb-2">
                    <span className="text-sm text-purple-800 font-semibold">Idea Fluency</span>
                    <div className="h-2 bg-gray-200 rounded-full mt-1">
                      <div className="h-2 bg-purple-600 rounded-full" style={{width: '72%'}}></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl text-purple-800 font-semibold mb-3">5Cs Assessment</h3>
                <p className="text-gray-700 mb-4">
                  Your 5Cs profile highlights significant strengths in Curiosity and Creativity, with
                  opportunities for development in Connection and Clarity. Your profile suggests a
                  natural affinity for exploring possibilities.
                </p>
                <div className="bg-white p-4 rounded-lg">
                  <div className="grid grid-cols-5 gap-2">
                    {[
                      {name: 'Curiosity', score: 85},
                      {name: 'Courage', score: 68},
                      {name: 'Connection', score: 60},
                      {name: 'Creativity', score: 82},
                      {name: 'Clarity', score: 65}
                    ].map((capability, index) => (
                      <div key={index} className="flex flex-col items-center">
                        <div className="h-10 w-10 rounded-full bg-purple-600 text-white flex items-center justify-center mb-1 text-sm font-bold">C</div>
                        <span className="text-xs text-purple-800 font-semibold text-center">{capability.name}</span>
                        <span className="text-xs text-gray-600">{capability.score}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <h2 className="text-2xl font-semibold text-purple-700 mb-4">Key Insights & Development Opportunities</h2>
          
          <div className="mb-6">
            <h3 className="text-xl text-purple-800 font-semibold mb-3">Your Strategic Strengths</h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <div className="text-green-600 font-bold mr-2">✓</div>
                <span className="text-gray-700">
                  <span className="font-semibold">Possibility Generation:</span> You excel at generating multiple solutions and scenarios
                </span>
              </li>
              <li className="flex items-start">
                <div className="text-green-600 font-bold mr-2">✓</div>
                <span className="text-gray-700">
                  <span className="font-semibold">Curiosity:</span> Your natural questioning approach helps you discover insights others might miss
                </span>
              </li>
              <li className="flex items-start">
                <div className="text-green-600 font-bold mr-2">✓</div>
                <span className="text-gray-700">
                  <span className="font-semibold">Creative Thinking:</span> You make unexpected connections that lead to innovative ideas
                </span>
              </li>
            </ul>
          </div>
          
          <div className="mb-8">
            <h3 className="text-xl text-purple-800 font-semibold mb-3">Development Opportunities</h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <div className="text-purple-600 font-bold mr-2">→</div>
                <span className="text-gray-700">
                  <span className="font-semibold">Connection:</span> Practice intentional collaboration and perspective-seeking
                </span>
              </li>
              <li className="flex items-start">
                <div className="text-purple-600 font-bold mr-2">→</div>
                <span className="text-gray-700">
                  <span className="font-semibold">Clarity:</span> Develop your ability to synthesize information and identify priorities
                </span>
              </li>
              <li className="flex items-start">
                <div className="text-purple-600 font-bold mr-2">→</div>
                <span className="text-gray-700">
                  <span className="font-semibold">Implementation Focus:</span> Bridge the gap between idea generation and practical application
                </span>
              </li>
            </ul>
          </div>
          
          <div className="flex justify-end mt-8">
            <Button 
              onClick={() => {
                markStepCompleted('1-7');
                setCurrentContent("team-workshop");
              }}
              className="bg-purple-600 hover:bg-purple-700 text-white"
              size="lg"
            >
              Next: Team Workshop
            </Button>
          </div>
        </div>
      );
      
    case 'team-workshop':
      return (
        <div className="prose max-w-none">
          <h1 className="text-3xl font-bold text-purple-700 mb-6">Team Workshop</h1>
          
          <div className="mb-8">
            <img 
              src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
              alt="Team workshop session with people collaborating at a table"
              className="w-full rounded-lg object-cover h-64"
            />
          </div>
          
          <h2 className="text-2xl font-semibold text-purple-700 mb-4">From Individual to Collective Capability</h2>
          <p className="text-lg text-gray-700 mb-6">
            While individual Imaginal Agility is powerful, collective imagination is transformative. 
            The Team Workshop extends your personal development into a collaborative experience that 
            builds shared capabilities across your team or organization.
          </p>
          
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="bg-purple-50 p-6 rounded-lg">
              <h3 className="text-xl text-purple-800 font-semibold mb-3">Workshop Benefits</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <div className="text-green-600 font-bold mr-2">✓</div>
                  <span className="text-gray-700">Build shared understanding of imagination's strategic value</span>
                </li>
                <li className="flex items-start">
                  <div className="text-green-600 font-bold mr-2">✓</div>
                  <span className="text-gray-700">Learn how individual profiles combine for team effectiveness</span>
                </li>
                <li className="flex items-start">
                  <div className="text-green-600 font-bold mr-2">✓</div>
                  <span className="text-gray-700">Practice collaborative imagination techniques</span>
                </li>
                <li className="flex items-start">
                  <div className="text-green-600 font-bold mr-2">✓</div>
                  <span className="text-gray-700">Apply the 5Cs to real organizational challenges</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-purple-50 p-6 rounded-lg">
              <h3 className="text-xl text-purple-800 font-semibold mb-3">Workshop Format</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <div className="h-6 w-6 rounded-full bg-purple-200 text-purple-800 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">1</div>
                  <span className="text-gray-700">Half-day or full-day facilitated session</span>
                </li>
                <li className="flex items-start">
                  <div className="h-6 w-6 rounded-full bg-purple-200 text-purple-800 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">2</div>
                  <span className="text-gray-700">Interactive exercises and group discussions</span>
                </li>
                <li className="flex items-start">
                  <div className="h-6 w-6 rounded-full bg-purple-200 text-purple-800 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">3</div>
                  <span className="text-gray-700">Team capability mapping and strengths analysis</span>
                </li>
                <li className="flex items-start">
                  <div className="h-6 w-6 rounded-full bg-purple-200 text-purple-800 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">4</div>
                  <span className="text-gray-700">Action planning for ongoing development</span>
                </li>
              </ul>
            </div>
          </div>
          
          <h2 className="text-2xl font-semibold text-purple-700 mb-4">Workshop Preparation</h2>
          <p className="text-lg text-gray-700 mb-4">
            To maximize the impact of your team workshop, we recommend:
          </p>
          
          <div className="bg-purple-100 p-6 rounded-lg mb-8">
            <ul className="space-y-3">
              <li className="flex items-start">
                <div className="text-purple-600 font-bold mr-2">→</div>
                <span className="text-gray-700">
                  <span className="font-semibold">Assessment Completion:</span> Have all participants complete both assessments before the workshop
                </span>
              </li>
              <li className="flex items-start">
                <div className="text-purple-600 font-bold mr-2">→</div>
                <span className="text-gray-700">
                  <span className="font-semibold">Challenge Identification:</span> Select 1-2 real organizational challenges to work on during the session
                </span>
              </li>
              <li className="flex items-start">
                <div className="text-purple-600 font-bold mr-2">→</div>
                <span className="text-gray-700">
                  <span className="font-semibold">Psychological Safety:</span> Create an environment where all participants feel comfortable sharing ideas
                </span>
              </li>
            </ul>
          </div>
          
          <div className="flex justify-between mt-8">
            <Button 
              onClick={() => {
                setCurrentContent("insights-review");
              }}
              variant="outline"
              className="border-purple-300 text-purple-700 hover:bg-purple-50"
              size="lg"
            >
              ← Back to Insights
            </Button>
            
            <Button 
              onClick={() => {
                markStepCompleted('1-8');
                navigate('/user-home2-refactored');
              }}
              className="bg-green-600 hover:bg-green-700 text-white"
              size="lg"
            >
              Complete Imaginal Agility Module
            </Button>
          </div>
        </div>
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