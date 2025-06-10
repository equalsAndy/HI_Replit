import React from 'react';
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
import WellBeingView from './WellBeingView';
import CantrilLadderView from './CantrilLadderView';
import VisualizingYouView from './VisualizingYouView';
import FutureSelfView from './FutureSelfView';
import FinalReflectionView from './FinalReflectionView';
import YourStarCardView from './YourStarCardView';
import StarCardResourceView from './StarCardResourceView';
import DownloadStarCardView from './allstarteams/DownloadStarCardView';
import HolisticReportView from './allstarteams/HolisticReportView';
import WorkshopResourcesView from './allstarteams/WorkshopResourcesView';
import PlaceholderView from './PlaceholderView';
import ImaginationAssessmentContent from './ImaginationAssessmentContent';
import FiveCSAssessmentContent from './FiveCSAssessmentContent';
import VideoPlayer from './VideoPlayer';
import { useApplication } from '@/hooks/use-application';
import { Button } from '@/components/ui/button';

interface ContentViewProps {
  currentContent: string;
  navigate?: any;
  markStepCompleted?: (stepId: string) => void;
  setCurrentContent?: (content: string) => void;
  user?: any;
  flowAttributesData?: any;
  setIsAssessmentModalOpen?: (open: boolean) => void;
  isImaginalAgility?: boolean;
}

interface PlaceholderViewProps {
  title: string;
  currentContent: string;
  navigate?: any;
  markStepCompleted?: (stepId: string) => void;
  setCurrentContent?: (content: string) => void;
}

interface ContentViewsProps extends ContentViewProps {
  starCard?: any;
}

const ContentViews: React.FC<ContentViewsProps> = ({
  currentContent,
  navigate,
  markStepCompleted,
  setCurrentContent,
  starCard,
  user,
  flowAttributesData,
  setIsAssessmentModalOpen,
  isImaginalAgility = false
}) => {
  // Return the appropriate content based on currentContent and current application
  switch (currentContent) {
    // Introduction View
    case 'welcome':
      return (
        <WelcomeView 
          currentContent={currentContent}
          navigate={navigate}
          markStepCompleted={markStepCompleted}
          setCurrentContent={setCurrentContent}
          isImaginalAgility={isImaginalAgility}
        />
      );

    // Discover your Strengths
    case 'intro-strengths':
      return (
        <IntroStrengthsView 
          currentContent={currentContent}
          navigate={navigate}
          markStepCompleted={markStepCompleted}
          setCurrentContent={setCurrentContent}
        />
      );

    case 'strengths-assessment':
      return (
        <AssessmentView 
          currentContent={currentContent}
          navigate={navigate}
          markStepCompleted={markStepCompleted}
          setCurrentContent={setCurrentContent}
          setIsAssessmentModalOpen={setIsAssessmentModalOpen}
        />
      );

    case 'star-card-preview':
      return (
        <StarCardPreviewView 
          currentContent={currentContent}
          navigate={navigate}
          markStepCompleted={markStepCompleted}
          setCurrentContent={setCurrentContent}
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
        <IntroToFlowView 
          navigate={navigate}
          markStepCompleted={markStepCompleted}
          setCurrentContent={setCurrentContent}
          starCard={starCard}
        />
      );

    case 'intro-to-flow':
      return (
        <IntroToFlowView 
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
        />
      );

    // Visualize your Potential
    case 'wellbeing':
    case 'ladder-wellbeing':
      return (
        <WellBeingView 
          navigate={navigate}
          markStepCompleted={markStepCompleted}
          setCurrentContent={setCurrentContent}
          starCard={starCard}
        />
      );

    case 'cantril-ladder':
    case 'wellbeing-reflections':
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

    case 'final-reflection':
      return (
        <FinalReflectionView 
          navigate={navigate}
          markStepCompleted={markStepCompleted}
          setCurrentContent={setCurrentContent}
          starCard={starCard}
        />
      );

    case 'your-star-card':
      return (
        <YourStarCardView 
          navigate={navigate}
          markStepCompleted={markStepCompleted}
          setCurrentContent={setCurrentContent}
        />
      );

    case 'star-card-resource':
      return (
        <StarCardResourceView 
          navigate={navigate}
          markStepCompleted={markStepCompleted}
          setCurrentContent={setCurrentContent}
          starCard={starCard}
        />
      );

    // Imaginal Agility content views
    case 'ia-1-1':
      console.log('🔍 ContentViews: Rendering ia-1-1 case');
      return (
        <div className="prose max-w-none">
          <h1 className="text-3xl font-bold text-purple-700 mb-6">Introduction to Imaginal Agility</h1>
          
          <div className="mb-8 rounded-lg overflow-hidden">
            <VideoPlayer
              workshopType="imaginal-agility"
              stepId="ia-1-1"
              title="Introduction to Imaginal Agility"
              fallbackUrl="https://www.youtube.com/embed/k3mDEAbUwZ4"
            />
          </div>
          
          <div className="space-y-4 text-lg text-gray-700">
            <p>Welcome.</p>
            <p>Einstein said imagination is more important than knowledge. This workshop shows you why — and how to use yours more intentionally.</p>
            <p>As AI reshapes the workplace, the ability to imagine clearly and purposefully is your edge. It's the one human capability AI can't replace or optimize.</p>
            <p>This Micro Course is your starting point.</p>
            <p>You'll move at your own pace: watch short videos, follow simple prompts, and complete structured exercises.</p>
            <p>It's the first step in building Imaginal Agility — a skillset for navigating change, solving problems, and creating value.</p>
            <p>Next, you'll meet with your team to turn fresh insight into shared breakthroughs.</p>
            <p className="font-semibold">You're not just learning about imagination. You're harnessing it — together.</p>
          </div>

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

          <div className="mb-8 rounded-lg overflow-hidden">
            <VideoPlayer
              workshopType="imaginal-agility"
              section="triple-challenge"
              title="AI Triple Cognitive Challenge"
              fallbackUrl="https://www.youtube.com/embed/zIFGKPMN9t8"
            />
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

          <div className="mb-8 bg-purple-100 p-6 rounded-lg">
            <p className="text-center text-lg font-medium text-purple-800">
              Recognizing and addressing these challenges is essential for thriving in the AI era
            </p>
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

          <div className="mb-8 rounded-lg overflow-hidden">
            <VideoPlayer
              workshopType="imaginal-agility"
              section="imaginal-solution"
              title="Imaginal Agility Solution"
              fallbackUrl="https://www.youtube.com/embed/BLh502BlZLE"
            />
          </div>

          <div className="flex justify-end mb-8">
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

          <h2 className="text-2xl font-semibold text-purple-700 mb-4">The Core Approach</h2>
          <p className="text-lg text-gray-700 mb-6">
            Imaginal Agility is the ability to perceive complex situations clearly and respond effectively 
            through intentional awareness. Unlike temporary skills that quickly become obsolete, 
            this capacity becomes more valuable as change accelerates.
          </p>

          <h2 className="text-2xl font-semibold text-purple-700 mb-4">Beyond Technical Training</h2>
          <p className="text-lg text-gray-700 mb-6">
            While most AI training focuses on technical adoption, Imaginal Agility addresses the 
            deeper adaptive challenge: developing the human capabilities that complement—rather than 
            compete with—artificial intelligence.
          </p>

          <h2 className="text-2xl font-semibold text-purple-700 mb-4">Research Foundation</h2>
          <p className="text-lg text-gray-700 mb-6">
            Research confirms that organizations that cultivate imagination and intentional thinking 
            experience greater innovation, resilience, and employee engagement. This isn't just good 
            for humans—it's good for business.
          </p>

          <h2 className="text-2xl font-semibold text-purple-700 mb-4">From Challenge to Capability</h2>
          <p className="text-lg text-gray-700 mb-6">
            By transforming potential AI-related disruptions into developmental opportunities, 
            you'll build enduring human capacities that fuel innovation, resilience, and meaningful 
            work—regardless of technological changes.
          </p>

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

          <div className="mb-8 rounded-lg overflow-hidden">
            <VideoPlayer
              workshopType="imaginal-agility"
              section="five-capabilities"
              title="5 Capabilities (5Cs)"
              fallbackUrl="https://www.youtube.com/embed/8wXSL3om6Ig"
            />
          </div>

          <div className="flex justify-end mb-8">
            <Button 
              onClick={() => {
                markStepCompleted('1-4');
                setIsAssessmentModalOpen(true);
              }}
              className="bg-purple-600 hover:bg-purple-700 text-white"
              size="lg"
            >
              Next: Take the Imagination Assessment
            </Button>
          </div>

          <h2 className="text-2xl font-semibold text-purple-700 mb-4">The 5Cs Framework</h2>
          <p className="text-lg text-gray-700 mb-6">
            These five capabilities form the foundation of Imaginal Agility. While each is 
            powerful independently, they create exponential impact when developed together. 
            Think of them as different facets of the same diamond—each reflecting and 
            amplifying the others.
          </p>

          <ul className="space-y-4 mb-8">
            <li className="flex items-start">
              <div className="h-6 w-6 rounded-full bg-purple-200 text-purple-800 flex items-center justify-center mr-3 mt-1 flex-shrink-0">•</div>
              <div>
                <span className="font-semibold text-purple-800">Imagination:</span>
                <span className="text-gray-700"> The ability to envision new possibilities</span>
              </div>
            </li>
            <li className="flex items-start">
              <div className="h-6 w-6 rounded-full bg-purple-200 text-purple-800 flex items-center justify-center mr-3 mt-1 flex-shrink-0">•</div>
              <div>
                <span className="font-semibold text-purple-800">Curiosity:</span>
                <span className="text-gray-700"> An openness to exploring and questioning</span>
              </div>
            </li>
            <li className="flex items-start">
              <div className="h-6 w-6 rounded-full bg-purple-200 text-purple-800 flex items-center justify-center mr-3 mt-1 flex-shrink-0">•</div>
              <div>
                <span className="font-semibold text-purple-800">Empathy:</span>
                <span className="text-gray-700"> Understanding perspectives beyond your own</span>
              </div>
            </li>
            <li className="flex items-start">
              <div className="h-6 w-6 rounded-full bg-purple-200 text-purple-800 flex items-center justify-center mr-3 mt-1 flex-shrink-0">•</div>
              <div>
                <span className="font-semibold text-purple-800">Creativity:</span>
                <span className="text-gray-700"> Finding novel solutions to complex problems</span>
              </div>
            </li>
            <li className="flex items-start">
              <div className="h-6 w-6 rounded-full bg-purple-200 text-purple-800 flex items-center justify-center mr-3 mt-1 flex-shrink-0">•</div>
              <div>
                <span className="font-semibold text-purple-800">Courage:</span>
                <span className="text-gray-700"> Taking bold action in the face of uncertainty</span>
              </div>
            </li>
          </ul>

          <h2 className="text-2xl font-semibold text-purple-700 mb-4">Capabilities in Context</h2>
          <p className="text-lg text-gray-700 mb-6">
            Unlike technical skills that may become obsolete, these capabilities grow more 
            valuable over time. They enhance your ability to learn, adapt, and create meaning 
            in any context—especially in collaboration with AI and other technologies.
          </p>

          <h2 className="text-2xl font-semibold text-purple-700 mb-4">The Imagination Advantage</h2>
          <p className="text-lg text-gray-700 mb-6">
            Organizations with high Imaginal Agility don't just adapt to change—they envision 
            and create preferred futures. By developing these capabilities, you become an 
            architect of possibility rather than simply responding to circumstances.
          </p>

          <h2 className="text-2xl font-semibold text-purple-700 mb-4">From Individual to Collective</h2>
          <p className="text-lg text-gray-700 mb-6">
            As you strengthen these capabilities, you'll notice their impact extends beyond 
            your individual work. Teams with high collective Imaginal Agility solve problems 
            more creatively, navigate complexity more effectively, and find greater meaning 
            in their shared purpose.
          </p>

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



    case 'five-c-assessment':
      return (
        <div className="prose max-w-none">
          <h1 className="text-3xl font-bold text-purple-700 mb-6">5Cs Assessment</h1>

          {/* 5Cs Assessment component with questions and results functionality */}
          <FiveCSAssessmentContent 
            navigate={navigate}
            markStepCompleted={markStepCompleted}
            setCurrentContent={setCurrentContent}
          />
        </div>
      );

    case 'insights-review':
      return (
        <div className="prose max-w-none">
          <h1 className="text-3xl font-bold text-purple-700 mb-6">Insights Review</h1>

          <div className="mb-8">
            <img 
              src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2970&q=80" 
              alt="Person analyzing data on laptop"
              className="w-full rounded-lg object-cover h-64"
            />
          </div>

          <h2 className="text-2xl font-semibold text-purple-700 mb-4">Your Assessment Results</h2>
          <p className="text-lg text-gray-700 mb-6">
            Based on your responses to the Imagination Assessment and 5Cs Assessment, we've generated 
            personalized insights to help you understand your unique imaginative profile and identify 
            growth opportunities.
          </p>

          <div className="bg-purple-50 p-6 rounded-lg mb-8">
            <h3 className="text-xl font-semibold text-purple-800 mb-3">Key Findings</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <div className="h-6 w-6 rounded-full bg-purple-200 text-purple-800 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">1</div>
                <span className="text-gray-700">
                  You demonstrate particular strength in perspective-taking and creating detailed scenarios
                </span>
              </li>
              <li className="flex items-start">
                <div className="h-6 w-6 rounded-full bg-purple-200 text-purple-800 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">2</div>
                <span className="text-gray-700">
                  Your imagination shows versatility across different types of challenges
                </span>
              </li>
              <li className="flex items-start">
                <div className="h-6 w-6 rounded-full bg-purple-200 text-purple-800 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">3</div>
                <span className="text-gray-700">
                  There's opportunity to strengthen your boundary-breaking thinking
                </span>
              </li>
              <li className="flex items-start">
                <div className="h-6 w-6 rounded-full bg-purple-200 text-purple-800 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">4</div>
                <span className="text-gray-700">
                  Your capability profile shows balanced development with slightly higher scores in empathy and curiosity
                </span>
              </li>
            </ul>
          </div>

          <h2 className="text-2xl font-semibold text-purple-700 mb-4">Next Steps</h2>
          <p className="text-lg text-gray-700 mb-6">
            Based on your assessment results, we recommend focusing on the following areas for development:
          </p>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-xl font-semibold text-purple-800 mb-3">Immediate Opportunities</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="text-green-500 font-bold mr-2">•</span>
                  <span className="text-gray-700">Practice combining seemingly unrelated ideas or concepts</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 font-bold mr-2">•</span>
                  <span className="text-gray-700">Experiment with challenging conventional assumptions in your field</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 font-bold mr-2">•</span>
                  <span className="text-gray-700">Dedicate specific time for imagination exercises in your workflow</span>
                </li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-xl font-semibold text-purple-800 mb-3">Leveraging Your Strengths</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="text-purple-500 font-bold mr-2">•</span>
                  <span className="text-gray-700">Share your ability to see multiple perspectives in team discussions</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-500 font-bold mr-2">•</span>
                  <span className="text-gray-700">Use your detail-oriented imagination to help others visualize possibilities</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-500 font-bold mr-2">•</span>
                  <span className="text-gray-700">Apply your versatile thinking to complex, multifaceted challenges</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="flex justify-end mt-8">
            <Button 
              onClick={() => {
                markStepCompleted('1-7');
                setCurrentContent("insights-dashboard");
              }}
              className="bg-purple-600 hover:bg-purple-700 text-white"
              size="lg"
            >
              Next: Your Insights Dashboard
            </Button>
          </div>
        </div>
      );

    case 'insights-dashboard':
      return (
        <div className="prose max-w-none">
          <h1 className="text-3xl font-bold text-purple-700 mb-6">Your Insights Dashboard</h1>

          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-2xl font-semibold text-purple-700 mb-4">5Cs Profile Summary</h2>

            {/* Radar Chart Placeholder - would be replaced with actual chart component */}
            <div className="bg-gray-100 rounded-lg p-8 flex items-center justify-center mb-6">
              <div className="text-center">
                <div className="text-4xl text-purple-500 mb-2">📊</div>
                <p className="text-gray-700">Your 5Cs Profile Visualization</p>
              </div>
            </div>

            <div className="grid md:grid-cols-5 gap-4">
              <div className="p-4 bg-purple-50 rounded-lg text-center">
                <h3 className="font-semibold text-purple-800 mb-1">Curiosity</h3>
                <div className="text-2xl font-bold text-purple-600">78%</div>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg text-center">
                <h3 className="font-semibold text-purple-800 mb-1">Creativity</h3>
                <div className="text-2xl font-bold text-purple-600">65%</div>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg text-center">
                <h3 className="font-semibold text-purple-800 mb-1">Courage</h3>
                <div className="text-2xl font-bold text-purple-600">71%</div>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg text-center">
                <h3 className="font-semibold text-purple-800 mb-1">Empathy</h3>
                <div className="text-2xl font-bold text-purple-600">82%</div>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg text-center">
                <h3 className="font-semibold text-purple-800 mb-1">Imagination</h3>
                <div className="text-2xl font-bold text-purple-600">76%</div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-2xl font-semibold text-purple-700 mb-4">Development Recommendations</h2>

            <div className="space-y-4">
              <div className="p-4 bg-purple-50 rounded-lg">
                <h3 className="font-semibold text-purple-800 mb-2">Imagination Exercises</h3>
                <p className="text-gray-700 mb-2">
                  Based on your profile, we recommend the following exercises to strengthen your imaginative capabilities:
                </p>
                <ul className="space-y-1 text-gray-700">
                  <li>• Daily "What If" scenarios - 5 minutes each morning</li>
                  <li>• Boundary-breaking thought experiments - twice weekly</li>
                  <li>• Cross-domain inspiration journal - capture ideas from unrelated fields</li>
                </ul>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg">
                <h3 className="font-semibold text-purple-800 mb-2">Integration Opportunities</h3>
                <p className="text-gray-700 mb-2">
                  Consider these ways to integrate Imaginal Agility into your daily work:
                </p>
                <ul className="space-y-1 text-gray-700">
                  <li>• Begin meetings with a 2-minute imagination warmup</li>
                  <li>• Schedule "possibility thinking" sessions before problem-solving</li>
                  <li>• Create a team practice of exploring multiple futures</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-8">
            <Button 
              onClick={() => {
                markStepCompleted('1-8');
                navigate('/user-home');
              }}
              className="bg-purple-600 hover:bg-purple-700 text-white"
              size="lg"
            >
              Complete Imaginal Agility Module
            </Button>
          </div>
        </div>
      );

    case 'download-star-card':
      return (
        <DownloadStarCardView 
          navigate={navigate}
          markStepCompleted={markStepCompleted}
          setCurrentContent={setCurrentContent}
        />
      );

    case 'holistic-report':
      return (
        <HolisticReportView 
          navigate={navigate}
          markStepCompleted={markStepCompleted}
          setCurrentContent={setCurrentContent}
        />
      );

    case 'workshop-resources':
      return (
        <WorkshopResourcesView 
          navigate={navigate}
          markStepCompleted={markStepCompleted}
          setCurrentContent={setCurrentContent}
        />
      );

    // Imaginal Agility Workshop Steps
    case 'ia-1-1':
      return (
        <div className="prose max-w-none">
          <h1 className="text-3xl font-bold text-purple-700 mb-6">Introduction to Imaginal Agility</h1>
          
          <div className="mb-8 rounded-lg overflow-hidden">
            <VideoPlayer
              workshopType="imaginal-agility"
              section="ia-1-1"
              title="Introduction to Imaginal Agility"
              fallbackUrl="https://www.youtube.com/embed/k3mDEAbUwZ4"
            />
          </div>
          
          <div className="space-y-4 text-lg text-gray-700">
            <p>Welcome.</p>
            <p>Einstein said imagination is more important than knowledge. This workshop shows you why — and how to use yours more intentionally.</p>
            <p>As AI reshapes the workplace, the ability to imagine clearly and purposefully is your edge. It's the one human capability AI can't replace or optimize.</p>
            <p>This Micro Course is your starting point.</p>
            <p>You'll move at your own pace: watch short videos, follow simple prompts, and complete structured exercises.</p>
            <p>It's the first step in building Imaginal Agility — a skillset for navigating change, solving problems, and creating value.</p>
            <p>Next, you'll meet with your team to turn fresh insight into shared breakthroughs.</p>
            <p className="font-semibold">You're not just learning about imagination. You're harnessing it — together.</p>
          </div>
          
          <div className="flex justify-end mt-8">
            <Button 
              onClick={() => {
                markStepCompleted('ia-1-1');
                setCurrentContent("ia-2-1");
              }}
              className="bg-purple-600 hover:bg-purple-700 text-white"
              size="lg"
            >
              Next: The Triple Challenge
            </Button>
          </div>
        </div>
      );

    case 'ia-2-1':
      return (
        <div className="prose max-w-none">
          <h1 className="text-3xl font-bold text-purple-700 mb-6">The Triple Challenge</h1>
          
          <div className="mb-8 rounded-lg overflow-hidden">
            <VideoPlayer
              workshopType="imaginal-agility"
              section="ia-2-1"
              title="The Triple Challenge"
              fallbackUrl="https://www.youtube.com/embed/EsExXeKFiKg"
            />
          </div>
          
          <p className="text-lg text-gray-700 mb-8">
            As artificial intelligence accelerates, it's causing a serious decline in human cognition seen in three cascading challenges. The first step in addressing a challenge is acknowledging it exists. It's now on the radar screen and may no longer be ignored.
          </p>
          
          <div className="flex justify-end mt-8">
            <Button 
              onClick={() => {
                markStepCompleted('ia-2-1');
                setCurrentContent("ia-3-1");
              }}
              className="bg-purple-600 hover:bg-purple-700 text-white"
              size="lg"
            >
              Next: Imaginal Agility Solution
            </Button>
          </div>
        </div>
      );

    case 'ia-3-1':
      return (
        <div className="prose max-w-none">
          <h1 className="text-3xl font-bold text-purple-700 mb-6">Imaginal Agility Solution</h1>
          
          <div className="mb-8 rounded-lg overflow-hidden">
            <VideoPlayer
              workshopType="imaginal-agility"
              section="ia-3-1"
              title="Imaginal Agility Solution"
              fallbackUrl="https://www.youtube.com/embed/l3XVwPGE6UY"
            />
          </div>
          
          <div className="space-y-4 text-lg text-gray-700">
            <p>Imagination is a primal human power — not content with what we know, but impelled to ask: 'What if?' Let's explore what this means, and how to harness it — individually and as a team.</p>
            <p className="font-semibold">Upon viewing the video, please click on the button below to complete your Core Capabilities Self-Assessment.</p>
          </div>
          
          <div className="flex justify-end mt-8">
            <Button 
              onClick={() => {
                markStepCompleted('ia-3-1');
                setCurrentContent("ia-4-1");
              }}
              className="bg-purple-600 hover:bg-purple-700 text-white"
              size="lg"
            >
              Next: Self-Assessment
            </Button>
          </div>
        </div>
      );

    case 'ia-5-1':
      return (
        <div className="prose max-w-none">
          <h1 className="text-3xl font-bold text-purple-700 mb-6">Teamwork Preparation</h1>
          
          <div className="mb-8 rounded-lg overflow-hidden">
            <VideoPlayer
              workshopType="imaginal-agility"
              section="ia-5-1"
              title="Teamwork Preparation"
              fallbackUrl="https://www.youtube.com/embed/hOV2zaWVxeU"
            />
          </div>
          
          <div className="space-y-4 text-lg text-gray-700">
            <p>Welcome to the next stage of the Imaginal Agility Workshop.</p>
            <p>Now that you've completed your self-assessment and explored your radar profile, it's time to bring your imagination into action — with your team.</p>
            <p>Together, you'll enter a shared digital whiteboard space designed for real-time collaboration. This is where individual insights become team breakthroughs.</p>
            
            <h3 className="text-xl font-semibold text-purple-700 mt-6">What to Expect</h3>
            <h4 className="text-lg font-medium text-purple-600">A Structured Whiteboard Practice</h4>
            <p>• Guided exercises will help your team apply imaginal agility in a creative, visual, and action-oriented way.</p>
            
            <h4 className="text-lg font-medium text-purple-600">Real-Time Co-Creation</h4>
            <p>• You'll brainstorm, align, and design solutions together — rapidly and with purpose.</p>
            
            <h4 className="text-lg font-medium text-purple-600">Human + AI Synergy</h4>
            <p>• You'll raise your HaiQ — the ability to stay imaginative, collaborative, and human while working with AI.</p>
            
            <h3 className="text-xl font-semibold text-purple-700 mt-6">What You Leave With</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>A shared model for alignment and trust</li>
              <li>Tools and language to apply imagination at scale</li>
              <li>Personal and team AI insights and prompt packs</li>
              <li>Clearer team identity and action direction</li>
            </ul>
          </div>
          
          <div className="flex justify-end mt-8">
            <Button 
              onClick={() => {
                markStepCompleted('ia-5-1');
                setCurrentContent("ia-6-1");
              }}
              className="bg-purple-600 hover:bg-purple-700 text-white"
              size="lg"
            >
              Next: Discernment Guide
            </Button>
          </div>
        </div>
      );

    case 'ia-6-1':
      return (
        <div className="prose max-w-none">
          <h1 className="text-3xl font-bold text-purple-700 mb-6">Discernment Guide</h1>
          
          <div className="mb-8 rounded-lg overflow-hidden">
            <VideoPlayer
              workshopType="imaginal-agility"
              section="ia-6-1"
              title="Discernment Guide"
              fallbackUrl="https://www.youtube.com/embed/U7pQjMYKk_s"
            />
          </div>
          
          <div className="space-y-4 text-lg text-gray-700">
            <h2 className="text-2xl font-bold text-purple-700">REALITY DISCERNMENT</h2>
            <p className="text-xl font-semibold">Train Your Mind to Know What's Real.</p>
            <p>In an age of AI-generated content, deepfakes, and digital manipulation, discernment is no longer optional — it's essential.</p>
            <p>This short learning experience introduces you to the neuroscience behind reality monitoring — the brain's ability to tell what's real from what's imagined — and offers practical tools.</p>
            
            <h3 className="text-xl font-semibold text-purple-700 mt-6">What You'll Learn:</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Why imagination is your first line of cognitive defense</li>
              <li>How AI content bypasses our natural filters</li>
              <li>What neuroscience reveals about perception and deception</li>
              <li>How to track your own AI interaction patterns in real time</li>
            </ul>
            
            <h3 className="text-xl font-semibold text-purple-700 mt-6">What You'll Practice:</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>The AI Mirror Test — a powerful self-reflection tool to observe your own thinking habits in AI interaction</li>
              <li>Real vs. Fake visual discernment challenge</li>
              <li>Discernment Toolkit — 5 simple questions to strengthen daily clarity</li>
            </ul>
            
            <h3 className="text-xl font-semibold text-purple-700 mt-6">Why It Matters:</h3>
            <p className="italic">"You can't depend on your eyes when your imagination is out of focus." — Mark Twain</p>
          </div>
          
          <div className="flex justify-end mt-8">
            <Button 
              onClick={() => {
                markStepCompleted('ia-6-1');
                setCurrentContent("ia-7-1");
              }}
              className="bg-purple-600 hover:bg-purple-700 text-white"
              size="lg"
            >
              Next: The Neuroscience
            </Button>
          </div>
        </div>
      );

    case 'ia-7-1':
      return (
        <div className="prose max-w-none">
          <h1 className="text-3xl font-bold text-purple-700 mb-6">The Neuroscience</h1>
          
          <div className="mb-8 rounded-lg overflow-hidden">
            <VideoPlayer
              workshopType="imaginal-agility"
              section="ia-7-1"
              title="The Neuroscience"
              fallbackUrl="https://www.youtube.com/embed/43Qs7OvToeI"
            />
          </div>
          
          <div className="space-y-4 text-lg text-gray-700">
            <h2 className="text-2xl font-bold text-purple-700">The Neuroscience Behind Imaginal Agility</h2>
            
            <h3 className="text-xl font-semibold text-purple-700 mt-6">Built for Every Mind</h3>
            <p>Imagination isn't one-size-fits-all. The method supports diverse cognitive styles — including visual, verbal, emotional, and neurodivergent profiles.</p>
            
            <h3 className="text-xl font-semibold text-purple-700 mt-6">Why It Works</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Our method activates real brain systems — not just ideas.</li>
              <li>Each practice is designed to strengthen imagination as a core cognitive capability.</li>
            </ul>
            
            <h3 className="text-xl font-semibold text-purple-700 mt-6">What the Science Shows</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Mental synthesis fuses stored images into new ideas</li>
              <li>Five brain systems power imagination: memory, planning, empathy, fluency, vision</li>
              <li>Repetition builds clarity, agility, and insight</li>
              <li>Trained imagination improves reality discernment</li>
            </ul>
            
            <h3 className="text-xl font-semibold text-purple-700 mt-6">From Neurons to Organizational Brilliance</h3>
            <p>The same neural process that sparks individual insight scales to team alignment and cultural change.</p>
          </div>
          
          <div className="flex justify-end mt-8">
            <Button 
              onClick={() => {
                markStepCompleted('ia-7-1');
                setCurrentContent("ia-8-1");
              }}
              className="bg-purple-600 hover:bg-purple-700 text-white"
              size="lg"
            >
              Next: More About Workshop
            </Button>
          </div>
        </div>
      );

    case 'ia-8-1':
      return (
        <div className="prose max-w-none">
          <h1 className="text-3xl font-bold text-purple-700 mb-6">More About Workshop</h1>
          
          <div className="mb-8 rounded-lg overflow-hidden">
            <VideoPlayer
              workshopType="imaginal-agility"
              section="ia-8-1"
              title="More About Workshop"
              fallbackUrl="https://www.youtube.com/embed/8Q5G3CF3yxI"
            />
          </div>
          
          <div className="space-y-4 text-lg text-gray-700">
            <p>Your journey in developing Imaginal Agility continues beyond this workshop.</p>
            
            <div className="bg-purple-50 p-6 rounded-lg border border-purple-100 mb-8">
              <h3 className="text-xl font-semibold text-purple-800 mb-4">Congratulations!</h3>
              <p className="text-gray-700">
                You've completed the Imaginal Agility Workshop. Continue practicing and applying 
                these capabilities in your daily work and life.
              </p>
            </div>
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
        />
      );
  }
};

export default ContentViews;