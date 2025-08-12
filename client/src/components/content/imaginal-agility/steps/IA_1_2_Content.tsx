import React from 'react';
import { Button } from '@/components/ui/button';
import { VideoPlayer } from '@/components/content/VideoPlayer';

interface IA12ContentProps {
  onNext?: (stepId: string) => void;
}

const IA_1_2_Content: React.FC<IA12ContentProps> = ({ onNext }) => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-purple-700 mb-8">
        AI's 4X Mental Challenge
      </h1>
      
      {/* Video Section using VideoPlayer component */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-200">
        <VideoPlayer
          workshopType="ia"
          stepId="ia-1-2"
          title="AI's 4X Mental Challenge"
          forceUrl="https://youtu.be/ceER5Wq_zfU"
          aspectRatio="16:9"
          autoplay={true}
          className="w-full max-w-2xl mx-auto"
        />
      </div>
      
      {/* Content Card */}
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
        <div className="prose prose-lg max-w-none text-gray-800 space-y-6">
          <p className="text-xl font-medium text-purple-700 mb-6">A hidden test for every mind in the AI era.</p>
          
          <p className="text-lg leading-relaxed">
            AI doesn't just boost productivity—it quietly exploits four human fault lines:
          </p>
          
          {/* 4X Challenge Cards */}
          <div className="grid md:grid-cols-2 gap-6 mt-8">
            <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-lg border border-red-200">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white font-bold">1</span>
                </div>
                <h3 className="text-lg font-semibold text-red-800">Metacognitive Default</h3>
              </div>
              <p className="text-sm text-red-700">
                We offload thinking, losing awareness and agency.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-lg border border-orange-200">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white font-bold">2</span>
                </div>
                <h3 className="text-lg font-semibold text-orange-800">Imagination Deficit</h3>
              </div>
              <p className="text-sm text-orange-700">
                Our minds fill in gaps; AI makes illusion look real.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-lg border border-yellow-200">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-yellow-600 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white font-bold">3</span>
                </div>
                <h3 className="text-lg font-semibold text-yellow-800">Projection as Protection</h3>
              </div>
              <p className="text-sm text-yellow-700">
                In uncertainty, we default to fear-based stories.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white font-bold">4</span>
                </div>
                <h3 className="text-lg font-semibold text-purple-800">Perceptual Distortion</h3>
              </div>
              <p className="text-sm text-purple-700">
                AI manipulates what we see and believe.
              </p>
            </div>
          </div>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mt-8">
            <p className="text-lg text-red-800 font-medium text-center">
              Each challenge erodes core human strengths—discernment, creativity, motivation, and innovation.
            </p>
          </div>
          
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mt-8">
            <p className="text-lg text-purple-800 font-medium text-center">
              To reclaim your edge, you must first see what's been hijacked.
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end mt-8">
        <Button 
          onClick={() => onNext && onNext('ia-2-1')}
          className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg"
        >
          Next: The I4C Model
        </Button>
      </div>
    </div>
  );
};

export default IA_1_2_Content;