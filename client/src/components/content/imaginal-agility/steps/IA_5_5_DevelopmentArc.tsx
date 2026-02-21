import React from 'react';
import { Button } from '@/components/ui/button';
import ScrollIndicator from '@/components/ui/ScrollIndicator';

interface IA55ContentProps {
  onNext?: (stepId: string) => void;
}

const IA_5_5_DevelopmentArc: React.FC<IA55ContentProps> = ({ onNext }) => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <ScrollIndicator
        idleTime={3000}
        position="nav-adjacent"
        colorScheme="purple"
      />

      <h1 className="text-3xl font-bold text-purple-700 mb-8">
        Your Developmental Arc
      </h1>

      {/* Cycle Summary */}
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
        <div className="prose prose-lg max-w-none text-gray-800 space-y-6">
          <p className="text-lg leading-relaxed">
            You have completed one full cycle:
          </p>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 space-y-2">
            <p className="text-lg italic text-purple-800">You mapped your pattern.</p>
            <p className="text-lg italic text-purple-800">You chose a commitment.</p>
            <p className="text-lg italic text-purple-800">You activated your monthly signal.</p>
          </div>

          <p className="text-lg leading-relaxed">
            This is now a repeatable structure.
          </p>
        </div>
      </div>

      {/* What This Builds Over Time */}
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200 mt-6">
        <div className="prose prose-lg max-w-none text-gray-800 space-y-6">
          <h2 className="text-2xl font-semibold text-purple-700 mb-4">What This Builds Over Time</h2>

          <p className="text-lg leading-relaxed">
            With repetition, you strengthen:
          </p>

          <ul className="list-disc pl-5 space-y-2 text-lg leading-relaxed">
            <li>Clearer self-awareness</li>
            <li>Stronger follow-through</li>
            <li>Better alignment between intention and action</li>
            <li>More thoughtful use of AI</li>
            <li>Greater imaginative range</li>
          </ul>
        </div>
      </div>

      {/* Keep It Moving */}
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200 mt-6">
        <div className="prose prose-lg max-w-none text-gray-800 space-y-6">
          <h2 className="text-2xl font-semibold text-purple-700 mb-4">Keep It Moving</h2>

          <div className="space-y-4">
            <p className="text-lg leading-relaxed">Return monthly to reflect.</p>
            <p className="text-lg leading-relaxed">Recommit when needed.</p>
            <p className="text-lg leading-relaxed">Re-map when your pattern shifts.</p>
            <p className="text-lg leading-relaxed">
              Development becomes visible when you stay with it.
            </p>
          </div>
        </div>
      </div>

      {/* Final Ladder Image */}
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200 mt-6">
        <img
          src="/assets/FINAL_LADDER_module_5d.png"
          alt="Final Ladder - Development Arc"
          className="max-w-2xl w-full h-auto mx-auto object-contain"
          onLoad={() => console.log('✅ FINAL_LADDER_module_5d.png loaded')}
          onError={(e) => console.error('❌ Failed to load FINAL_LADDER_module_5d.png', e)}
        />
      </div>

      <div className="flex justify-end mt-8">
        <Button
          onClick={() => onNext && onNext('ia-6-1')}
          className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg"
        >
          Continue to Team Ladder
        </Button>
      </div>
    </div>
  );
};

export default IA_5_5_DevelopmentArc;
