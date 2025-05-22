import React from 'react';
import { ContentViewProps } from '../../../shared/types';
import PlaceholderView from '../PlaceholderView';
import ImaginationAssessmentContent from '../ImaginationAssessmentContent';
import FiveCSAssessmentContent from '../FiveCSAssessmentContent';
import { Button } from '@/components/ui/button';

interface ImaginalAgilityContentProps extends ContentViewProps {
  currentContent: string;
  setIsAssessmentModalOpen: (isOpen: boolean) => void;
}

const ImaginalAgilityContent: React.FC<ImaginalAgilityContentProps> = ({
  currentContent,
  navigate,
  markStepCompleted,
  setCurrentContent,
  starCard,
  user,
  flowAttributesData,
  setIsAssessmentModalOpen
}) => {
  switch (currentContent) {
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
          
          <div className="mb-8 rounded-lg overflow-hidden">
            <iframe 
              src="https://www.youtube.com/embed/zIFGKPMN9t8"
              className="w-full h-[400px]" 
              title="AI Triple Cognitive Challenge"
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
            ></iframe>
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
            <iframe 
              src="https://www.youtube.com/embed/BLh502BlZLE"
              className="w-full h-[400px]" 
              title="Imaginal Agility Solution"
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
            ></iframe>
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
            <iframe 
              src="https://www.youtube.com/embed/8wXSL3om6Ig"
              className="w-full h-[400px]" 
              title="5 Capabilities (5Cs)"
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
            ></iframe>
          </div>
          
          <div className="flex justify-end mb-8">
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
      
    case 'imagination-assessment':
      return (
        <div className="prose max-w-none">
          <h1 className="text-3xl font-bold text-purple-700 mb-6">Imagination Assessment</h1>
          
          {/* Assessment component with scenarios and response functionality */}
          <ImaginationAssessmentContent 
            navigate={navigate}
            markStepCompleted={markStepCompleted}
            setCurrentContent={setCurrentContent}
          />
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
    
    // Handle placeholder content for Imaginal Agility
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

export default ImaginalAgilityContent;