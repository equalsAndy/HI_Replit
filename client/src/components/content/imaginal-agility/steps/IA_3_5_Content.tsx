import React from 'react';
import { Button } from '@/components/ui/button';
import { VideoPlayer } from '@/components/content/VideoPlayer';

interface IA35ContentProps {
  onNext?: (stepId: string) => void;
}

const IA_3_5_Content: React.FC<IA35ContentProps> = ({ onNext }) => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-purple-700 mb-8">
        Inspiration
      </h1>
      
      {/* Video Only - No Additional Content */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-200">
        <VideoPlayer
          workshopType="imaginal-agility"
          stepId="ia-3-5"
          title="IA Solo Inspiration"
          forceUrl="https://youtu.be/vGIYaL7jTJo"
          aspectRatio="16:9"
          autoplay={false}
          className="w-full max-w-2xl mx-auto"
        />
      </div>

      {/* Continue Button */}
      <div className="flex justify-end mt-8">
        <Button 
          onClick={() => onNext && onNext('ia-3-6')}
          className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg"
        >
          Continue to The Unimaginable
        </Button>
      </div>
    </div>
  );
};

export default IA_3_5_Content;