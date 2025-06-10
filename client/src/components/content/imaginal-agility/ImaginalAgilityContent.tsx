import React, { useState } from 'react';
import { ContentViewProps } from '../../../shared/types';
import PlaceholderView from '../PlaceholderView';
import { Button } from '@/components/ui/button';
import ImaginalAgilityAssessmentModal from '@/components/assessment/ImaginalAgilityAssessmentModal';

interface ImaginalAgilityContentProps extends ContentViewProps {
  currentContent: string;
  starCard?: any;
  user?: any;
  flowAttributesData?: any;
}

const ImaginalAgilityContent: React.FC<ImaginalAgilityContentProps> = ({
  currentContent,
  navigate,
  markStepCompleted,
  setCurrentContent
}) => {
  const [isImaginalAssessmentOpen, setIsImaginalAssessmentOpen] = useState(false);
  
  const renderContent = () => {
    switch (currentContent) {
      case 'ia-1-1':
        return (
          <div className="prose max-w-none">
            <h1 className="text-3xl font-bold text-purple-700 mb-6">Introduction to Imaginal Agility</h1>
            
            <div className="mb-8">
              <iframe 
                width="832" 
                height="468" 
                src="https://www.youtube.com/embed/k3mDEAbUwZ4" 
                title="Introduction to Imaginal Agility" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                referrerPolicy="strict-origin-when-cross-origin" 
                allowFullScreen
                className="w-full rounded-lg"
              ></iframe>
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
            
            <div className="mb-8">
              <iframe 
                width="832" 
                height="468" 
                src="https://www.youtube.com/embed/EsExXeKFiKg" 
                title="The Triple Challenge" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                referrerPolicy="strict-origin-when-cross-origin" 
                allowFullScreen
                className="w-full rounded-lg"
              ></iframe>
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
            
            <div className="mb-8">
              <iframe 
                width="832" 
                height="468" 
                src="https://www.youtube.com/embed/l3XVwPGE6UY" 
                title="Imaginal Agility Solution" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                referrerPolicy="strict-origin-when-cross-origin" 
                allowFullScreen
                className="w-full rounded-lg"
              ></iframe>
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

      case 'ia-4-1':
        return (
          <div className="prose max-w-none">
            <h1 className="text-3xl font-bold text-purple-700 mb-6">Imagination Assessment</h1>
            <p className="text-lg text-gray-700 mb-8">
              Discover your unique profile across five foundational human capacities.
            </p>
            
            <div className="flex justify-center mt-8">
              <Button 
                onClick={() => setIsImaginalAssessmentOpen(true)}
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
            
            <div className="flex justify-end mt-8">
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
              Review your assessment results and understand your unique profile.
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
              Explore how to apply your capabilities in real-world scenarios.
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