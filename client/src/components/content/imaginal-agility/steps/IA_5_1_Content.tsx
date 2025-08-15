import React from 'react';
import { Button } from '@/components/ui/button';
import { VideoPlayer } from '@/components/content/VideoPlayer';

interface IA51ContentProps {
  onNext?: (stepId: string) => void;
}

const IA_5_1_Content: React.FC<IA51ContentProps> = ({ onNext }) => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-purple-700 mb-8">
        Outcomes and Benefits
      </h1>
      
      {/* Video Section using VideoPlayer component */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-200">
        <VideoPlayer
          workshopType="ia"
          stepId="ia-5-1"
          title="Outcomes and Benefits Overview"
          aspectRatio="16:9"
          autoplay={false}
          className="w-full max-w-2xl mx-auto"
        />
      </div>
    </div>
  );
};

export default IA_5_1_Content;