import React from 'react';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';
import ScrollIndicator from '@/components/ui/ScrollIndicator';

interface IA53ContentProps {
  onNext?: (stepId: string) => void;
  onOpenContactModal?: () => void;
}

const IA_5_3_TeamBoard: React.FC<IA53ContentProps> = ({ onNext, onOpenContactModal }) => {
  const muralUrl = "https://app.mural.co/t/teamprelude0846/m/teamprelude0846/1765730392096/7b38226f1a0551f5c8c433e0140a2111000b7d52";

  const handleOpenBoard = () => {
    window.open(muralUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Scroll Indicator - appears when user is idle */}
      <ScrollIndicator
        idleTime={3000}
        position="nav-adjacent"
        colorScheme="purple"
      />
      <h1 className="text-3xl font-bold text-purple-700 mb-8">
        I4C Team Board
      </h1>

      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
        <div className="prose prose-lg max-w-none text-gray-800 space-y-6">
          <p className="text-lg leading-relaxed">
            The I4C Team Board is an <strong>example</strong> of how Imaginal Agility can be brought to life as a collaborative team practice. This demonstration workspace showcases the I4C (Imagination for Collaborative Change) framework applied to team development.
          </p>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 my-6">
            <h3 className="text-xl font-semibold text-purple-800 mb-3">What This Board Demonstrates</h3>
            <p className="text-purple-900 mb-3">
              This example board shows how teams can use visual collaboration tools to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-purple-900">
              <li>Map collective capabilities across the five core dimensions</li>
              <li>Visualize team strengths and growth opportunities</li>
              <li>Align on shared imagination and purpose</li>
              <li>Practice coordinated creative thinking</li>
              <li>Build team operating system coherence</li>
            </ul>
          </div>

          <div className="bg-purple-600 text-white rounded-lg p-6 my-6">
            <h3 className="text-xl font-semibold mb-3">Interested in Team Implementation?</h3>
            <p className="mb-4">
              If you're interested in bringing this collaborative approach to your team, we'd love to help you design a customized implementation that fits your team's needs and context.
            </p>
            <div className="flex gap-4">
              <Button
                onClick={() => onOpenContactModal?.()}
                className="bg-white text-purple-600 hover:bg-gray-100 px-6 py-3 text-base font-semibold"
                size="lg"
              >
                Contact Us About Team Implementation
              </Button>
            </div>
          </div>

          <p className="text-lg leading-relaxed">
            Click below to view the example board. <strong>Note:</strong> The board will open in a new browser tab, allowing you to explore it while keeping your workshop progress here.
          </p>

          <div className="flex justify-center my-8">
            <Button
              onClick={handleOpenBoard}
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 text-lg flex items-center gap-2"
              size="lg"
            >
              <ExternalLink className="w-5 h-5" />
              View Example Team Board (Opens in New Tab)
            </Button>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h4 className="font-semibold text-gray-900 mb-3">About the Example Board</h4>
            <p className="text-gray-700 text-base">
              This is a demonstration board showing one possible approach to team collaboration using the I4C framework. When you implement this with your team, we'll customize the structure, exercises, and facilitation approach to match your team's unique goals and working style.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IA_5_3_TeamBoard;
