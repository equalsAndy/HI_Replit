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
          workshopType="ia"
          stepId="ia-2-1"
          title="The I4C Prism Model"
          aspectRatio="16:9"
          autoplay={false}
          className="w-full max-w-2xl mx-auto"
        />
      </div>
      
      {/* Content Card */}
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
        <div className="prose prose-lg max-w-none text-gray-800 space-y-6">
          <p className="text-xl font-medium text-purple-700 mb-6">Imagination is not abstract — it's your amplifier.</p>
          
          <p className="text-lg leading-relaxed mb-8">
            Like white light through a prism, imagination refracts into four core human capabilities:
          </p>
          
          {/* I4C Capabilities Graphics */}
          <div className="flex justify-center items-center gap-12 mt-8 flex-wrap">
            <img 
              src="/assets/Curiosity_new.png" 
              alt="Curiosity - the drive to explore"
              className="w-32 h-auto object-contain"
              onLoad={() => console.log('✅ Curiosity graphic loaded successfully')}
              onError={(e) => console.error('❌ Failed to load Curiosity graphic:', e.currentTarget.src)}
            />
            
            <img 
              src="/assets/Caring_new.png" 
              alt="Caring - the capacity to nurture and connect"
              className="w-32 h-auto object-contain"
              onLoad={() => console.log('✅ Caring graphic loaded successfully')}
              onError={(e) => console.error('❌ Failed to load Caring graphic:', e.currentTarget.src)}
            />
            
            <img 
              src="/assets/Creativity_new.png" 
              alt="Creativity - the power to generate"
              className="w-32 h-auto object-contain"
              onLoad={() => console.log('✅ Creativity graphic loaded successfully')}
              onError={(e) => console.error('❌ Failed to load Creativity graphic:', e.currentTarget.src)}
            />
            
            <img 
              src="/assets/Courage_new.png" 
              alt="Courage - the strength to act"
              className="w-32 h-auto object-contain"
              onLoad={() => console.log('✅ Courage graphic loaded successfully')}
              onError={(e) => console.error('❌ Failed to load Courage graphic:', e.currentTarget.src)}
            />
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