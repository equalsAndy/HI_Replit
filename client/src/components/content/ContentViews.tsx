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
import VideoPlayer from './VideoPlayer';
import { Button } from '@/components/ui/button';
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
import PlaceholderView from './PlaceholderView';
import WorkshopResourcesView from './allstarteams/WorkshopResourcesView';
import ImaginationAssessmentContent from './ImaginationAssessmentContent';
import FiveCSAssessmentContent from './FiveCSAssessmentContent';
import { ImaginalAgilityResults } from '../assessment/ImaginalAgilityResults';

import { useApplication } from '@/hooks/use-application';

// Utility function to scroll to content title using anchor
const scrollToContentTop = () => {
  setTimeout(() => {
    const anchor = document.getElementById('content-title');
    if (anchor) {
      anchor.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, 100);
};

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
  // Handle Imaginal Agility specific content mapping
  if (isImaginalAgility) {
    switch (currentContent) {
      case 'ia-1-1':
        return (
          <WelcomeView 
            currentContent={currentContent}
            navigate={navigate}
            markStepCompleted={markStepCompleted}
            setCurrentContent={setCurrentContent}
            isImaginalAgility={true}
          />
        );
      case 'ia-2-1':
        return (
          <div className="prose max-w-none">
            <h1 id="content-title" className="text-3xl font-bold text-purple-700 mb-6">The Triple Challenge</h1>
            
            {/* YouTube Video Player */}
            <div className="mb-8 max-w-4xl mx-auto">
              <VideoPlayer
                workshopType="imaginal-agility"
                stepId="ia-2-1"
                fallbackUrl="https://youtu.be/EsExXeKFiKg"
                title="The Triple Challenge"
                aspectRatio="16:9"
                autoplay={true}
              />
            </div>

            <div className="text-lg text-gray-700 mb-6">
              <p>As artificial intelligence accelerates, it's causing a serious decline in human cognition seen in three cascading challenges. The first step in addressing a challenge is acknowledging it exists. It's now on the radar screen and may no longer be ignored.</p>
            </div>

            <h2 className="text-2xl font-semibold text-purple-700 mb-4">AI Triple Cognitive Challenge</h2>
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
              Understanding these challenges positions you to lead positive change in your organization. The next step is learning how Imaginal Agility provides a systematic approach to thriving alongside AI.
            </p>

            <div className="flex justify-end">
              <Button 
                onClick={() => {
                  markStepCompleted('ia-2-1');
                  setCurrentContent('ia-3-1');
                  scrollToContentTop();
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white"
                size="lg"
              >
                Next: The Imaginal Agility Solution
              </Button>
            </div>
          </div>
        );
      case 'ia-3-1':
        return (
          <div className="prose max-w-none">
            <h1 id="content-title" className="text-3xl font-bold text-purple-700 mb-6">The Imaginal Agility Solution</h1>
            
            {/* YouTube Video Player */}
            <div className="mb-8 max-w-4xl mx-auto">
              <VideoPlayer
                workshopType="imaginal-agility"
                stepId="ia-3-1"
                fallbackUrl="https://youtu.be/l3XVwPGE6UY"
                title="Imaginal Agility Solution"
                aspectRatio="16:9"
                autoplay={true}
              />
            </div>

            <div className="mb-8">
              <p className="text-lg text-gray-700 mb-6">
                Imaginal Agility offers a systematic approach to developing the human capabilities that complement and enhance AI collaboration. Rather than competing with artificial intelligence, this framework helps individuals and teams thrive alongside it.
              </p>
            </div>

            <h2 className="text-2xl font-semibold text-purple-700 mb-4">The Core Philosophy</h2>
            <p className="text-lg text-gray-700 mb-6">
              Imaginal Agility recognizes that our greatest competitive advantage lies not in what we can automate, but in what we can imagine. It's a framework designed to cultivate the uniquely human capacity for creative thinking, emotional intelligence, and innovative problem-solving.
            </p>

            <div className="bg-purple-50 p-6 rounded-lg mb-8">
              <h3 className="text-xl font-semibold text-purple-800 mb-4">Five Core Capabilities</h3>
              <div className="grid gap-4">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-purple-600 rounded-full mr-3"></div>
                  <span className="text-lg font-medium text-purple-700">Imagination</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-purple-600 rounded-full mr-3"></div>
                  <span className="text-lg font-medium text-purple-700">Curiosity</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-purple-600 rounded-full mr-3"></div>
                  <span className="text-lg font-medium text-purple-700">Creativity</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-purple-600 rounded-full mr-3"></div>
                  <span className="text-lg font-medium text-purple-700">Courage</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-purple-600 rounded-full mr-3"></div>
                  <span className="text-lg font-medium text-purple-700">Empathy</span>
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-semibold text-purple-700 mb-4">Beyond Traditional Training</h2>
            <p className="text-lg text-gray-700 mb-6">
              Unlike conventional skill development programs, Imaginal Agility focuses on developing meta-capabilities—the thinking patterns and mindsets that enable continuous adaptation and innovation in an AI-enhanced world.
            </p>

            <h2 className="text-2xl font-semibold text-purple-700 mb-4">Practical Application</h2>
            <p className="text-lg text-gray-700 mb-6">
              This framework provides concrete tools and practices for individuals, teams, and organizations to develop their imaginative capacity while maintaining psychological well-being and professional effectiveness.
            </p>

            <div className="bg-gradient-to-r from-purple-100 to-blue-100 p-6 rounded-lg mb-8">
              <p className="text-center text-lg font-medium text-purple-800">
                "The future belongs to those who can imagine what AI cannot—and then bring those visions to life."
              </p>
            </div>

            <div className="flex justify-end">
              <Button 
                onClick={() => {
                  markStepCompleted('ia-3-1');
                  setCurrentContent('ia-4-1');
                  scrollToContentTop();
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white"
                size="lg"
              >
                Next: Self-Assessment
              </Button>
            </div>
          </div>
        );
      case 'ia-4-1':
        return (
          <div className="prose max-w-none">
            <h1 id="content-title" className="text-3xl font-bold text-purple-700 mb-6">Self-Assessment</h1>

            {/* YouTube Video Player */}
            <div className="mb-8 max-w-4xl mx-auto">
              <VideoPlayer
                workshopType="imaginal-agility"
                stepId="ia-4-1"
                fallbackUrl="https://youtu.be/Xdn8lkSzTZU"
                title="Self-Assessment"
                aspectRatio="16:9"
                autoplay={true}
              />
            </div>

            <div className="mb-8">
              <p className="text-lg text-gray-700 mb-6">
                Take a moment to assess your current capabilities in the five key areas of Imaginal Agility. This self-reflection will help you understand your strengths and identify areas for growth.
              </p>
            </div>

            <div className="bg-purple-50 p-6 rounded-lg mb-8">
              <h2 className="text-xl font-semibold text-purple-800 mb-4">The Five Capabilities Assessment</h2>
              <p className="text-gray-700 mb-4">
                You'll evaluate yourself across five key capabilities that define Imaginal Agility:
              </p>
              <div className="grid gap-3">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-purple-600 rounded-full mr-3"></div>
                  <span className="text-purple-700 font-medium">Imagination</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-purple-600 rounded-full mr-3"></div>
                  <span className="text-purple-700 font-medium">Curiosity</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-purple-600 rounded-full mr-3"></div>
                  <span className="text-purple-700 font-medium">Creativity</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-purple-600 rounded-full mr-3"></div>
                  <span className="text-purple-700 font-medium">Courage</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-purple-600 rounded-full mr-3"></div>
                  <span className="text-purple-700 font-medium">Empathy</span>
                </div>
              </div>
            </div>

            <div className="text-center mb-8">
              <Button 
                onClick={() => {
                  setIsAssessmentModalOpen(true);
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white"
                size="lg"
              >
                Start Assessment
              </Button>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">What to Expect</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• The assessment takes approximately 10-15 minutes to complete</li>
                <li>• You'll respond to scenarios and rank your preferences</li>
                <li>• Your results will show your capability profile</li>
                <li>• Use these insights to guide your development journey</li>
              </ul>
            </div>
          </div>
        );
      case 'ia-5-1':
        // Mock assessment results for demonstration - in real app this would come from API
        const mockResults = {
          imagination: 4.2,
          curiosity: 3.8,
          empathy: 4.5,
          creativity: 3.9,
          courage: 3.6,
          responses: {},
          radarChart: {
            imagination: 4.2,
            curiosity: 3.8,
            empathy: 4.5,
            creativity: 3.9,
            courage: 3.6
          },
          completedAt: new Date().toISOString()
        };

        return (
          <div className="prose max-w-none">
            <div className="mb-8">
              <h1 id="content-title" className="text-3xl font-bold text-purple-700 mb-4">Assessment Results</h1>
              <p className="text-lg text-gray-700 mb-6">
                Congratulations on completing your Imaginal Agility self-assessment! Your results provide insights into your current capabilities across the five core areas that define imaginative thinking in the AI era.
              </p>
            </div>

            <ImaginalAgilityResults results={mockResults} />

            <div className="flex justify-end mt-8">
              <Button 
                onClick={() => {
                  markStepCompleted('ia-5-1');
                  setCurrentContent('ia-6-1');
                  scrollToContentTop();
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white"
                size="lg"
              >
                Next: Teamwork Preparation
              </Button>
            </div>
          </div>
        );
      case 'ia-6-1':
        return (
          <div className="prose max-w-none">
            <h1 id="content-title" className="text-3xl font-bold text-purple-700 mb-6">Teamwork Preparation</h1>
            
            {/* YouTube Video Player */}
            <div className="mb-8 max-w-4xl mx-auto">
              <VideoPlayer
                workshopType="imaginal-agility"
                stepId="ia-6-1"
                fallbackUrl="https://youtu.be/hOV2zaWVxeU"
                title="Teamwork Preparation"
                aspectRatio="16:9"
                autoplay={true}
              />
            </div>

            <div className="text-lg text-gray-700 mb-6">
              <p>Now that you've assessed your imaginal capabilities, it's time to prepare for collaborative work with your team. This session will help you understand how to leverage your individual strengths in a team setting.</p>
            </div>

            <h2 className="text-2xl font-semibold text-purple-700 mb-4">Preparing for Team Collaboration</h2>
            <p className="text-lg text-gray-700 mb-6">
              Effective teamwork using Imaginal Agility requires understanding how individual imaginative capabilities combine to create collective intelligence that surpasses what AI alone can achieve.
            </p>

            <div className="bg-purple-50 p-6 rounded-lg mb-8">
              <h3 className="text-xl font-semibold text-purple-800 mb-4">Key Preparation Areas</h3>
              <div className="space-y-4">
                <div className="flex">
                  <div className="w-3 h-3 bg-purple-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-semibold text-purple-700">Individual Strengths Awareness</h4>
                    <p className="text-gray-700">Understanding your unique imaginative profile and contribution</p>
                  </div>
                </div>
                <div className="flex">
                  <div className="w-3 h-3 bg-purple-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-semibold text-purple-700">Complementary Capabilities</h4>
                    <p className="text-gray-700">Recognizing how different imaginative styles work together</p>
                  </div>
                </div>
                <div className="flex">
                  <div className="w-3 h-3 bg-purple-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-semibold text-purple-700">Collective Intelligence</h4>
                    <p className="text-gray-700">Building team synergy that exceeds individual capabilities</p>
                  </div>
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-semibold text-purple-700 mb-4">Workshop Readiness</h2>
            <p className="text-lg text-gray-700 mb-6">
              Your team workshop will focus on applying these individual insights to real challenges. Come prepared to share your assessment results and collaborate on meaningful projects using your collective imaginative power.
            </p>

            <div className="bg-gradient-to-r from-purple-100 to-indigo-100 p-6 rounded-lg mb-8">
              <p className="text-center text-lg font-medium text-purple-800">
                "Individual imagination becomes exponentially powerful when combined with others."
              </p>
            </div>

            <div className="flex justify-end">
              <Button 
                onClick={() => {
                  markStepCompleted('ia-6-1');
                  setCurrentContent('ia-7-1');
                  scrollToContentTop();
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white"
                size="lg"
              >
                Next: Reality Discernment
              </Button>
            </div>
          </div>
        );
      case 'ia-7-1':
        return (
          <div className="prose max-w-none">
            <h1 id="content-title" className="text-3xl font-bold text-purple-700 mb-6">Reality Discernment</h1>
            
            {/* YouTube Video Player */}
            <div className="mb-8 max-w-4xl mx-auto">
              <VideoPlayer
                workshopType="imaginal-agility"
                stepId="ia-7-1"
                fallbackUrl="https://youtu.be/U7pQjMYKk_s"
                title="Reality Discernment"
                aspectRatio="16:9"
                autoplay={true}
              />
            </div>

            <div className="text-lg text-gray-700 mb-6">
              <p>Discernment is the ability to judge well between different options, ideas, and approaches. In an AI-enhanced workplace, discernment becomes crucial for determining when to rely on AI assistance and when to trust human intuition and creativity.</p>
            </div>

            <h2 className="text-2xl font-semibold text-purple-700 mb-4">The Art of Wise Decision-Making</h2>
            <p className="text-lg text-gray-700 mb-6">
              As AI becomes more sophisticated, the ability to discern between AI-generated solutions and human-driven insights becomes increasingly valuable. This isn't about choosing one over the other, but knowing when each approach serves you best.
            </p>

            <div className="bg-purple-50 p-6 rounded-lg mb-8">
              <h3 className="text-xl font-semibold text-purple-800 mb-4">Key Discernment Areas</h3>
              <div className="space-y-4">
                <div className="flex">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mt-3 mr-3 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-semibold text-purple-700">Quality vs. Speed</h4>
                    <p className="text-gray-700">When to prioritize AI efficiency versus human depth</p>
                  </div>
                </div>
                <div className="flex">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mt-3 mr-3 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-semibold text-purple-700">Logic vs. Intuition</h4>
                    <p className="text-gray-700">Balancing data-driven insights with human gut feelings</p>
                  </div>
                </div>
                <div className="flex">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mt-3 mr-3 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-semibold text-purple-700">Automation vs. Human Touch</h4>
                    <p className="text-gray-700">Knowing when personal connection matters most</p>
                  </div>
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-semibold text-purple-700 mb-4">Developing Your Discernment</h2>
            <p className="text-lg text-gray-700 mb-6">
              Strong discernment emerges from experience, reflection, and the willingness to question both AI outputs and your own assumptions. It requires cultivating both analytical thinking and emotional intelligence.
            </p>

            <div className="bg-gradient-to-r from-purple-100 to-indigo-100 p-6 rounded-lg mb-8">
              <p className="text-center text-lg font-medium text-purple-800">
                "Wisdom is not about having all the answers, but knowing which questions to ask."
              </p>
            </div>

            <div className="flex justify-end">
              <Button 
                onClick={() => {
                  markStepCompleted('ia-7-1');
                  setCurrentContent('ia-8-1');
                  scrollToContentTop();
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white"
                size="lg"
              >
                Next: Neuroscience
              </Button>
            </div>
          </div>
        );
      case 'ia-8-1':
        return (
          <div className="prose max-w-none">
            <h1 id="content-title" className="text-3xl font-bold text-purple-700 mb-6">Neuroscience</h1>
            
            {/* YouTube Video Player */}
            <div className="mb-8 max-w-4xl mx-auto">
              <VideoPlayer
                workshopType="imaginal-agility"
                stepId="ia-8-1"
                fallbackUrl="https://youtu.be/43Qs7OvToeI"
                title="Neuroscience"
                aspectRatio="16:9"
                autoplay={true}
              />
            </div>

            <div className="text-lg text-gray-700 mb-6">
              <p>Understanding the neuroscience behind imagination and creativity provides crucial insights into how we can strengthen these capabilities in an AI-enhanced world. Recent research reveals specific brain mechanisms that support imaginative thinking.</p>
            </div>

            <h2 className="text-2xl font-semibold text-purple-700 mb-4">The Default Mode Network</h2>
            <p className="text-lg text-gray-700 mb-6">
              The brain's Default Mode Network (DMN) is most active during rest and introspection. This network is crucial for imagination, self-referential thinking, and connecting disparate ideas—exactly the capabilities that complement AI systems.
            </p>

            <div className="bg-purple-50 p-6 rounded-lg mb-8">
              <h3 className="text-xl font-semibold text-purple-800 mb-4">Key Brain Networks for Imagination</h3>
              <div className="space-y-4">
                <div className="flex">
                  <div className="w-3 h-3 bg-purple-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-semibold text-purple-700">Default Mode Network</h4>
                    <p className="text-gray-700">Enables mental simulation and creative connections</p>
                  </div>
                </div>
                <div className="flex">
                  <div className="w-3 h-3 bg-purple-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-semibold text-purple-700">Executive Control Network</h4>
                    <p className="text-gray-700">Manages attention and working memory during creative tasks</p>
                  </div>
                </div>
                <div className="flex">
                  <div className="w-3 h-3 bg-purple-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-semibold text-purple-700">Salience Network</h4>
                    <p className="text-gray-700">Switches between internal imagination and external focus</p>
                  </div>
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-semibold text-purple-700 mb-4">Neuroplasticity and Imagination</h2>
            <p className="text-lg text-gray-700 mb-6">
              The brain's ability to reorganize and form new neural connections means that imaginative capabilities can be strengthened throughout life. Regular practice of imaginative thinking literally rewires the brain for enhanced creativity.
            </p>

            <h2 className="text-2xl font-semibold text-purple-700 mb-4">The AI Impact on Cognition</h2>
            <p className="text-lg text-gray-700 mb-6">
              When we outsource thinking to AI systems, we risk weakening the neural pathways associated with deep reflection and creative problem-solving. Understanding this helps us make conscious choices about when to engage our own cognitive resources.
            </p>

            <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-6 rounded-lg mb-8">
              <p className="text-center text-lg font-medium text-purple-800">
                "The brain that imagines together, stays creative together."
              </p>
            </div>

            <div className="flex justify-center">
              <Button 
                onClick={() => {
                  markStepCompleted('ia-8-1');
                  // Workshop complete - could navigate to results or stay here
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white"
                size="lg"
              >
                Workshop Complete
              </Button>
            </div>
          </div>
        );
      default:
        return (
          <PlaceholderView 
            title="Step Not Found"
            currentContent={currentContent}
            navigate={navigate}
            markStepCompleted={markStepCompleted}
            setCurrentContent={setCurrentContent}
          />
        );
    }
  }

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
    case 'final-reflection-4-5':
    case '4-5':
      return (
        <FinalReflectionView 
          currentContent={currentContent}
          navigate={navigate}
          markStepCompleted={markStepCompleted}
          setCurrentContent={setCurrentContent}
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
    case 'imaginal-intro':
      return (
        <div className="prose max-w-none">
          <div className="mb-8">
            <iframe 
              width="400" 
              height="300" 
              src="https://www.youtube.com/embed/k3mDEAbUwZ4" 
              title="Introduction to Imaginal Agility" 
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
              className="rounded-lg shadow-lg"
            ></iframe>
          </div>

          <div className="text-lg text-gray-700 space-y-4">
            <p>Welcome.</p>

            <p>Einstein said imagination is more important than knowledge. This workshop shows you why — and how to use yours more intentionally.</p>

            <p>As AI reshapes the workplace, the ability to imagine clearly and purposefully is your edge. It's the one human capability AI can't replace or optimize.</p>

            <p>This Micro Course is your starting point.</p>

            <p>You'll move at your own pace: watch short videos, follow simple prompts, and complete structured exercises.</p>

            <p>It's the first step in building Imaginal Agility — a skillset for navigating change, solving problems, and creating value.</p>

            <p>Next, you'll meet with your team to turn fresh insight into shared breakthroughs.</p>

            <p>You're not just learning about imagination. You're harnessing it — together.</p>
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
          <div className="mb-8">
            <iframe 
              width="400" 
              height="300" 
              src="https://www.youtube.com/embed/EsExXeKFiKg" 
              title="The Triple Challenge" 
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
              className="rounded-lg shadow-lg"
            ></iframe>
          </div>

          <div className="text-lg text-gray-700">
            <p>As artificial intelligence accelerates, it's causing a serious decline in human cognition seen in three cascading challenges. The first step in addressing a challenge is acknowledging it exists. It's now on the radar screen and may no longer be ignored.</p>
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
          <div className="mb-8">
            <iframe 
              width="400" 
              height="300" 
              src="https://www.youtube.com/embed/l3XVwPGE6UY" 
              title="Imaginal Agility Solution" 
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
              className="rounded-lg shadow-lg"
            ></iframe>
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
            for humans—it's good 
            for business.
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
                markStepCompleted('ia-3-1');
                setCurrentContent("ia-self-assessment");
              }}
              className="bg-purple-600 hover:bg-purple-700 text-white"
              size="lg"
            >
              Next: Self-Assessment
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





    case 'ia-self-assessment':
      return (
        <div className="prose max-w-none">
          <div className="mb-8">
            <iframe 
              width="400" 
              height="300" 
              src="https://www.youtube.com/embed/Xdn8lkSzTZU" 
              title="Self-Assessment Introduction" 
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
              className="rounded-lg shadow-lg"
            ></iframe>
          </div>

          <h1 className="text-3xl font-bold text-purple-700 mb-6">Self-Assessment</h1>

          <div className="text-lg text-gray-700 space-y-4 mb-8">
            <p>As organizations face what Deloitte identifies as an "imagination deficit" in the AI era, robust imagination self-assessment becomes essential for maintaining human creative agency and fostering transformative innovation capacity.</p>

            <p>This Self-Assessment helps participants to reflect on their five core capabilities essential for personal growth, team synergy, and collaborative intelligence:</p>

            <div className="bg-purple-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-purple-800 mb-3">The 5 Core Capabilities</h3>
              <ul className="space-y-2 text-purple-700">
                <li>• <strong>Imagination</strong></li>
                <li>• <strong>Curiosity</strong></li>
                <li>• <strong>Empathy</strong></li>
                <li>• <strong>Creativity</strong></li>
                <li>• <strong>Courage</strong></li>
              </ul>
            </div>

            <p>Click the button below to begin your self-assessment. The assessment will open in a new window and takes approximately 10-15 minutes to complete.</p>
          </div>

          <div className="flex justify-center">
            <Button 
              onClick={() => {
                if (setIsAssessmentModalOpen) {
                  setIsAssessmentModalOpen(true);
                }
              }}
              className="bg-purple-600 hover:bg-purple-700 text-white"
              size="lg"
            >
              Start Assessment
            </Button>
          </div>
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

    case 'imagination-results':
      return (
        <div className="prose max-w-none">
          <h1 className="text-3xl font-bold text-purple-700 mb-6">Assessment Results</h1>

          <div className="text-lg text-gray-700 space-y-4 mb-8">
            <p>Thank you for completing the 5Cs Assessment. Your results provide valuable insights into your current imaginal capabilities.</p>

            <div className="bg-purple-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-purple-800 mb-3">Your Imaginal Profile</h3>
              <p className="text-purple-700 mb-4">
                Based on your responses, we've identified your strengths and areas for development across the five core capabilities.
              </p>
              <p className="text-purple-700">
                These insights will guide your continued development in the remaining workshop modules.
              </p>
            </div>

            <p>Continue to the next module to learn about preparing for effective teamwork using your imaginal capabilities.</p>
          </div>

          <div className="flex justify-end">
            <Button 
              onClick={() => {
                markStepCompleted('ia-4-2');
                setCurrentContent('teamwork-prep');
              }}
              className="bg-purple-600 hover:bg-purple-700 text-white"
              size="lg"
            >
              Next: Teamwork Preparation
            </Button>
          </div>
        </div>
      );

    case 'teamwork-prep':
      return (
        <div className="prose max-w-none">
          <div className="mb-8">
            <iframe 
              width="400" 
              height="300" 
              src="https://www.youtube.com/embed/hOV2zaWVxeU" 
              title="Teamwork Preparation" 
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
              className="rounded-lg shadow-lg"
                          />
          </div>

          <div className="text-lg text-gray-700 space-y-4">
            <p>Now that you've assessed your imaginal capabilities, it's time to prepare for collaborative work with your team.</p>

            <p>This session will help you understand how to leverage your individual strengths within a group setting and maximize collective imaginal agility.</p>
          </div>
        </div>
      );

    case 'reality-discernment':
      return (
        <div className="prose max-w-none">
          <div className="mb-8">
            <iframe 
              width="400" 
              height="300" 
              src="https://www.youtube.com/embed/U7pQjMYKk_s" 
              title="Reality Discernment" 
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
              className="rounded-lg shadow-lg"
            ></iframe>
          </div>

          <div className="text-lg text-gray-700 space-y-4">
            <p>A crucial skill in imaginal agility is the ability to distinguish between different types of thinking and imagination.</p>

            <p>This guide will help you develop discernment in recognizing when imagination is helpful versus when analytical thinking is more appropriate.</p>
          </div>
        </div>
      );

    case 'neuroscience':
      return (
        <div className="prose max-w-none">
          <div className="mb-8">
            <iframe 
              width="400" 
              height="300" 
              src="https://www.youtube.com/embed/43Qs7OvToeI" 
              title="The Neuroscience" 
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
              className="rounded-lg shadow-lg"
            ></iframe>
          </div>

          <div className="text-lg text-gray-700 space-y-4">
            <p>Understanding the science behind imagination and creativity provides a foundation for developing imaginal agility.</p>

            <p>This session explores the neurological basis of imaginative thinking and how we can optimize our brain's creative capabilities.</p>
          </div>
        </div>
      );

    case 'next-steps':
      return (
        <div className="prose max-w-none">
          <div className="mb-8">
            <iframe 
              width="400" 
              height="300" 
              src="https://www.youtube.com/embed/8Q5G3CF3yxI" 
              title="Next Steps" 
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
              className="rounded-lg shadow-lg"
            ></iframe>
          </div>

          <div className="text-lg text-gray-700 space-y-4">
            <p>Congratulations on completing the Imaginal Agility Workshop!</p>

            <p>This final session outlines the next steps in your journey and how to continue developing your imaginal agility skills.</p>

            <p>You're now ready to apply these concepts in your work and collaborate effectively with your team.</p>
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