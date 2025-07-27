import React from 'react';
import { Button } from '@/components/ui/button';
import { VideoPlayer } from '@/components/content/VideoPlayer';

interface IA_4_1_ContentProps {
  onNext?: (nextStepId: string) => void;
}

const IA_4_1_Content: React.FC<IA_4_1_ContentProps> = ({ onNext }) => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-purple-700 mb-8">
        Advanced Ladder Overview
      </h1>
      

      {/* Content Card */}
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
        <div className="prose prose-lg max-w-none text-gray-800 space-y-6">
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-200">
            <h3 className="text-xl font-semibold text-purple-800 mb-4">🔝 Advanced Ladder of Imagination</h3>
            <p className="text-lg leading-relaxed text-purple-700">
              Advanced concepts and practices for experienced practitioners seeking deeper imaginative capabilities.
            </p>
          </div>
          
          <p className="text-lg leading-relaxed">
            Welcome to the Advanced Ladder of Imagination. Having completed the foundational ladder, you're now ready to explore 
            more sophisticated practices that will deepen your imaginative capacity and expand your creative potential.
          </p>
          
          <p className="text-lg leading-relaxed">
            This advanced section builds upon your existing skills with:
          </p>
          
          <ul className="list-disc pl-6 space-y-2 text-lg">
            <li><strong>Meta-Awareness Practices</strong> - Moving beyond basic autoflow to conscious pattern disruption</li>
            <li><strong>Perceptual Expansion</strong> - Stretching visualization beyond current assumptions and roles</li>
            <li><strong>Global Moral Imagination</strong> - Connecting personal purpose to worldwide challenges</li>
            <li><strong>Muse Collaboration</strong> - Deepening relationship with inspirational sources</li>
            <li><strong>Unlimited Vision</strong> - Transcending all constraints to imagine radical possibilities</li>
          </ul>
          
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-purple-800 mb-3">What to Expect</h4>
            <p className="text-purple-700">
              Each rung of the Advanced Ladder challenges you to go deeper than before. These practices are designed for 
              those who have mastered the basics and are ready to push the boundaries of what's imaginatively possible.
            </p>
          </div>
          
          <p className="text-lg leading-relaxed font-medium text-purple-700">
            Are you ready to climb higher?
          </p>
        </div>
      </div>
      
      <div className="flex justify-end mt-8">
        <Button 
          onClick={() => onNext && onNext('ia-4-2')}
          className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg"
        >
          Begin Advanced Practice
        </Button>
      </div>
    </div>
  );
};

export default IA_4_1_Content;