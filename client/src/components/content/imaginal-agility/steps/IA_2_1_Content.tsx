import React from 'react';
import { Button } from '@/components/ui/button';
import { VideoPlayer } from '@/components/content/VideoPlayer';

interface IA21ContentProps {
  onNext?: (stepId: string) => void;
}

const IA_2_1_Content: React.FC<IA21ContentProps> = ({ onNext }) => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-purple-700 mb-8">
        The I4C Prism Model
      </h1>
      
      {/* Video Section using VideoPlayer component */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-200">
        <VideoPlayer
          workshopType="imaginal-agility"
          stepId="ia-2-1"
          title="The I4C Prism Model"
          aspectRatio="16:9"
          autoplay={false}
          className="w-full max-w-2xl mx-auto"
          fallbackUrl="https://www.youtube.com/embed/dQw4w9WgXcQ" // fallback to avoid hook mismatch
        />
      </div>
      
      {/* Content Card */}
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
        <div className="prose prose-lg max-w-none text-gray-800 space-y-6">
          <p className="text-xl font-medium text-purple-700 mb-6">Imagination is not abstract — it's your amplifier.</p>
          
          <p className="text-lg leading-relaxed mb-8">
            Like white light through a prism, imagination refracts into four core human capabilities:
          </p>
          
          {/* I4C Capabilities Grid */}
          <div className="grid md:grid-cols-2 gap-6 mt-8">
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mr-4">
                  <span className="text-white font-bold">C</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-green-800">Curiosity</h3>
                  <p className="text-sm text-green-700">the drive to explore</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mr-4">
                  <span className="text-white font-bold">E</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-blue-800">Empathy</h3>
                  <p className="text-sm text-blue-700">the capacity to relate</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-lg border border-orange-200">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mr-4">
                  <span className="text-white font-bold">C</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-orange-800">Creativity</h3>
                  <p className="text-sm text-orange-700">the power to generate</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-lg border border-red-200">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mr-4">
                  <span className="text-white font-bold">C</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-red-800">Courage</h3>
                  <p className="text-sm text-red-700">the strength to act</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mt-8">
            <p className="text-lg text-purple-800 font-medium text-center mb-4">
              These capabilities shape how you think, connect, and grow.
            </p>
            <p className="text-lg text-purple-800 text-center">
              Together, they define your <strong>I4C</strong> — "I Foresee" — a practical way to reflect, engage, and lead in the AI era.
            </p>
          </div>
          
          <div className="bg-gradient-to-r from-gray-50 to-purple-50 rounded-lg p-6 mt-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 text-center">
              The Prism Effect
            </h3>
            <p className="text-base text-gray-700 text-center">
              Just as light reveals its hidden spectrum through a prism, your imagination reveals its power through these four capabilities. Each one amplifies the others, creating your unique creative signature.
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end mt-8">
        <Button 
          onClick={() => onNext && onNext('ia-2-2')}
          className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg"
        >
          Next: Self-Assessment
        </Button>
      </div>
    </div>
  );
};

export default IA_2_1_Content;