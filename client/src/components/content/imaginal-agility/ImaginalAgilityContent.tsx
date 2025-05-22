import React from 'react';
import { ContentViewProps } from '../../../shared/types';
import { Button } from '@/components/ui/button';
import ImaginationAssessmentContent from '../ImaginationAssessmentContent';
import FiveCSAssessmentContent from '../FiveCSAssessmentContent';
import PlaceholderView from '../PlaceholderView';

interface ImaginalAgilityContentProps extends ContentViewProps {
  setIsAssessmentModalOpen: (isOpen: boolean) => void;
}

interface TripleChallengeContentProps extends ContentViewProps {}

const TripleChallengeContent: React.FC<TripleChallengeContentProps> = ({ navigate, markStepCompleted, setCurrentContent }) => {
  return (
    <div className="prose max-w-none">
      <h1 className="text-3xl font-bold text-purple-700 mb-6">The Triple Challenge</h1>

      <div className="mb-8">
        <iframe
          src="https://www.youtube.com/embed/your_triple_challenge_video_id?enablejsapi=1"
          title="Triple Challenge Video"
          className="w-full h-[400px] rounded-lg"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>

      <p className="mb-4">
        Here's the challenge: Embrace uncertainty, experiment boldly, and reflect deeply on your experiences.
      </p>

      <div className="flex justify-between mt-8">
        <Button
          onClick={() => {
            setCurrentContent("imaginal-intro");
          }}
          className="bg-gray-600 hover:bg-gray-700 text-white"
          size="lg"
        >
          Previous: Introduction
        </Button>
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
};


const ImaginalAgilityContent: React.FC<ImaginalAgilityContentProps> = ({
  currentContent,
  navigate,
  markStepCompleted,
  setCurrentContent,
  setIsAssessmentModalOpen
}) => {
  switch (currentContent) {
    case 'triple-challenge':
      return <TripleChallengeContent navigate={navigate} markStepCompleted={markStepCompleted} setCurrentContent={setCurrentContent} />;

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

    
    case 'imaginal-solution':
      return (
        <div className="prose max-w-none">
          <h1 className="text-3xl font-bold text-purple-700 mb-6">The Imaginal Agility Solution</h1>
          {/* Imaginal solution content */}
        </div>
      );

    case 'five-capabilities':
      return (
        <div className="prose max-w-none">
          <h1 className="text-3xl font-bold text-purple-700 mb-6">Your 5 Capabilities (5Cs)</h1>
          {/* 5 capabilities content */}
        </div>
      );

    case 'imagination-assessment':
      return (
        <div className="prose max-w-none">
          <h1 className="text-3xl font-bold text-purple-700 mb-6">Imagination Assessment</h1>
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
          {/* Insights review content */}
        </div>
      );

    case 'team-workshop':
      return (
        <div className="prose max-w-none">
          <h1 className="text-3xl font-bold text-purple-700 mb-6">Team Workshop</h1>
          {/* Team workshop content */}
        </div>
      );

    default:
      return (
        <PlaceholderView 
          title={currentContent}
          navigate={navigate}
          markStepCompleted={markStepCompleted}
          setCurrentContent={setCurrentContent}
        />
      );
  }
};

export default ImaginalAgilityContent;