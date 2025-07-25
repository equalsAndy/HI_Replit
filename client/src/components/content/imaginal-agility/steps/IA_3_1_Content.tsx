import React from 'react';
import { Button } from '@/components/ui/button';
import { VideoPlayer } from '@/components/content/VideoPlayer';

interface IA31ContentProps {
  onNext?: (stepId: string) => void;
}

const IA_3_1_Content: React.FC<IA31ContentProps> = ({ onNext }) => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-purple-700 mb-8">
        The Ladder of Imagination
      </h1>
      
      {/* Video Section using VideoPlayer component */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-200">
        <VideoPlayer
          workshopType="imaginal-agility"
          stepId="ia-3-1"
          title="The Ladder of Imagination"
          forceUrl="https://youtu.be/k4073NSNJYE"
          aspectRatio="16:9"
          autoplay={false}
          className="w-full max-w-2xl mx-auto"
        />
      </div>
      
      {/* Content Card */}
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
        <div className="prose prose-lg max-w-none text-gray-800 space-y-6">
          <p className="text-xl font-medium text-purple-700 mb-6">Imagination is a skill — and it can be developed.</p>
          
          <p className="text-lg leading-relaxed mb-8">
            The Ladder maps five distinct modes of imagination:
          </p>
          
          {/* Ladder Rungs */}
          <div className="space-y-4 mt-8">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-lg border border-gray-200 flex items-center">
              <div className="w-10 h-10 bg-gray-500 rounded-full flex items-center justify-center mr-4">
                <span className="text-white font-bold">1</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Auto-Flow</h3>
                <p className="text-sm text-gray-600">habitual, often unconscious thought</p>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200 flex items-center">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mr-4">
                <span className="text-white font-bold">2</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-blue-800">Visualization</h3>
                <p className="text-sm text-blue-600">holding positive mental images</p>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200 flex items-center">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mr-4">
                <span className="text-white font-bold">3</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-green-800">Higher Purpose</h3>
                <p className="text-sm text-green-600">envisioning meaning beyond self</p>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-4 rounded-lg border border-yellow-200 flex items-center">
              <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center mr-4">
                <span className="text-white font-bold">4</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-yellow-800">Inspiration</h3>
                <p className="text-sm text-yellow-600">moments of creative breakthrough</p>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200 flex items-center">
              <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center mr-4">
                <span className="text-white font-bold">5</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-purple-800">The Unimaginable</h3>
                <p className="text-sm text-purple-600">transcending current limits</p>
              </div>
            </div>
          </div>
          
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mt-8">
            <p className="text-lg text-purple-800 font-medium text-center mb-4">
              Each rung activates new neural pathways.
            </p>
            <p className="text-lg text-purple-800 text-center">
              As you climb, you expand your perspective and strengthen your I4C capabilities.
            </p>
          </div>
          
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 mt-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 text-center">
              Where do you begin?
            </h3>
            <p className="text-base text-gray-700 text-center">
              Your Radar Map shows the way. Each rung builds on the previous, creating a systematic path for developing your imaginative capacity.
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end mt-8">
        <Button 
          onClick={() => onNext && onNext('ia-3-2')}
          className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg"
        >
          Next: Autoflow Practice
        </Button>
      </div>
    </div>
  );
};

export default IA_3_1_Content;