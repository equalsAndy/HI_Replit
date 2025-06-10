import React, { useState } from 'react';
import { ContentViewProps } from '../../../shared/types';
import PlaceholderView from '../PlaceholderView';
import ImaginationAssessmentContent from '../ImaginationAssessmentContent';
import FiveCSAssessmentContent from '../FiveCSAssessmentContent';
import { Button } from '@/components/ui/button';
import ImaginalAgilityAssessmentModal from '@/components/assessment/ImaginalAgilityAssessmentModal';

interface ImaginalAgilityContentProps extends ContentViewProps {
  currentContent: string;
  setIsAssessmentModalOpen: (isOpen: boolean) => void;
  
  // Use any type to avoid compatibility issues temporarily
  starCard?: any;
  user?: any;
  flowAttributesData?: any;
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
  const [isImaginalAssessmentOpen, setIsImaginalAssessmentOpen] = useState(false);
  
  const renderContent = () => {
    switch (currentContent) {
      // Imaginal Agility content views
      case 'ia-1-1':
      case 'imaginal-intro':
        return (
          <div className="prose max-w-none">
            <h1 className="text-3xl font-bold text-purple-700 mb-6">Introduction to Imaginal Agility</h1>
            
            <div className="mb-8">
              <iframe 
                width="832" 
                height="468" 
                src="https://www.youtube.com/embed/1Belekdly70" 
                title="Imaginal Agility Workshop Introduction" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                referrerPolicy="strict-origin-when-cross-origin" 
                allowFullScreen
                className="w-full rounded-lg"
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
            
            <div className="flex justify-end mt-8">
              <Button 
                onClick={() => {
                  markStepCompleted('ia-2-1');
                  setCurrentContent("ia-3-1");
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
            
            <h2 className="text-2xl font-semibold text-purple-700 mb-4">The Core Approach</h2>
            <p className="text-lg text-gray-700 mb-6">
              Imaginal Agility is the ability to perceive complex situations clearly and respond effectively 
              through intentional awareness. Unlike temporary skills that quickly become obsolete, 
              this capacity becomes more valuable as change accelerates.
            </p>
            
            <div className="flex justify-end mt-8">
              <Button 
                onClick={() => {
                  markStepCompleted('ia-3-1');
                  setCurrentContent("ia-4-1");
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white"
                size="lg"
              >
                Next: Imagination Assessment
              </Button>
            </div>
          </div>
        );

      case 'ia-4-1':
        return (
          <div className="prose max-w-none">
            <h1 className="text-3xl font-bold text-purple-700 mb-6">Imagination Assessment</h1>
            <p className="text-lg text-gray-700 mb-8">
              Discover your unique profile across five foundational human capacities essential for adaptive intelligence in the AI era.
            </p>
            
            <div className="bg-purple-50 p-6 rounded-lg border border-purple-100 mb-8">
              <h3 className="text-xl font-semibold text-purple-800 mb-4">Assessment Overview</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Imagination</li>
                <li>• Curiosity</li>
                <li>• Empathy</li>
                <li>• Creativity</li>
                <li>• Courage</li>
              </ul>
            </div>
            
            <div className="flex justify-center mt-8">
              <Button 
                onClick={() => setIsAssessmentModalOpen(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white"
                size="lg"
              >
                Start Assessment
              </Button>
            </div>
          </div>
        );

      case 'ia-4-2':
        return (
          <div className="prose max-w-none">
            <h1 className="text-3xl font-bold text-purple-700 mb-6">5Cs Assessment</h1>
            <p className="text-lg text-gray-700 mb-8">
              A deeper dive into the five core capabilities that comprise Imaginal Agility.
            </p>
            
            <div className="flex justify-center mt-8">
              <Button 
                onClick={() => {
                  markStepCompleted('ia-4-2');
                  setCurrentContent("ia-5-1");
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white"
                size="lg"
              >
                Next: Insights Review
              </Button>
            </div>
          </div>
        );

      case 'ia-5-1':
        return (
          <div className="prose max-w-none">
            <h1 className="text-3xl font-bold text-purple-700 mb-6">Insights Review</h1>
            <p className="text-lg text-gray-700 mb-8">
              Review your assessment results and understand your unique Imaginal Agility profile.
            </p>
            
            <div className="flex justify-end mt-8">
              <Button 
                onClick={() => {
                  markStepCompleted('ia-5-1');
                  setCurrentContent("ia-6-1");
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white"
                size="lg"
              >
                Next: Development Strategies
              </Button>
            </div>
          </div>
        );

      case 'ia-6-1':
        return (
          <div className="prose max-w-none">
            <h1 className="text-3xl font-bold text-purple-700 mb-6">Development Strategies</h1>
            <p className="text-lg text-gray-700 mb-8">
              Personalized strategies for developing your Imaginal Agility capabilities.
            </p>
            
            <div className="flex justify-end mt-8">
              <Button 
                onClick={() => {
                  markStepCompleted('ia-6-1');
                  setCurrentContent("ia-7-1");
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white"
                size="lg"
              >
                Next: Future Applications
              </Button>
            </div>
          </div>
        );

      case 'ia-7-1':
        return (
          <div className="prose max-w-none">
            <h1 className="text-3xl font-bold text-purple-700 mb-6">Future Applications</h1>
            <p className="text-lg text-gray-700 mb-8">
              Explore how to apply your Imaginal Agility capabilities in real-world scenarios.
            </p>
            
            <div className="flex justify-end mt-8">
              <Button 
                onClick={() => {
                  markStepCompleted('ia-7-1');
                  setCurrentContent("ia-8-1");
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white"
                size="lg"
              >
                Next: Next Steps
              </Button>
            </div>
          </div>
        );

      case 'ia-8-1':
        return (
          <div className="prose max-w-none">
            <h1 className="text-3xl font-bold text-purple-700 mb-6">Next Steps</h1>
            <p className="text-lg text-gray-700 mb-8">
              Your journey in developing Imaginal Agility continues beyond this workshop.
            </p>
            
            <div className="bg-purple-50 p-6 rounded-lg border border-purple-100 mb-8">
              <h3 className="text-xl font-semibold text-purple-800 mb-4">Congratulations!</h3>
              <p className="text-gray-700">
                You've completed the Imaginal Agility Workshop. Continue practicing and applying 
                these capabilities in your daily work and life.
              </p>
            </div>
          </div>
        );

      default:
        return (
          <PlaceholderView 
            title={`${currentContent}`}
            navigate={navigate}
            markStepCompleted={markStepCompleted}
            setCurrentContent={setCurrentContent}
            currentContent={currentContent}
          />
        );
    }
  };
  
  return (
    <div>
      {renderContent()}
      
      {/* Assessment Modal */}
      <ImaginalAgilityAssessmentModal
        isOpen={isImaginalAssessmentOpen}
        onClose={() => setIsImaginalAssessmentOpen(false)}
        onComplete={(results) => {
          setIsImaginalAssessmentOpen(false);
          markStepCompleted('ia-4-1');
          setCurrentContent('ia-4-2');
        }}
      />
    </div>
  );
};

export default ImaginalAgilityContent;
        return (
          <PlaceholderView 
            title={`${currentContent}`}
            navigate={navigate}
            markStepCompleted={markStepCompleted}
            setCurrentContent={setCurrentContent}
            currentContent={currentContent}
          />
        );
    }
  };
  
  return (
    <div>
      {renderContent()}
      
      {/* Assessment Modal */}
      <ImaginalAgilityAssessmentModal
        isOpen={isImaginalAssessmentOpen}
        onClose={() => setIsImaginalAssessmentOpen(false)}
        onComplete={(results) => {
          setIsImaginalAssessmentOpen(false);
          markStepCompleted('ia-4-1');
          setCurrentContent('ia-4-2');
        }}
      />
    </div>
  );
};

export default ImaginalAgilityContent;