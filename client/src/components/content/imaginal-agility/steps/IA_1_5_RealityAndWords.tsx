import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, Clock } from 'lucide-react';

interface IA15RealityAndWordsProps {
  onNext?: (stepId: string) => void;
}

const IA_1_5_RealityAndWords: React.FC<IA15RealityAndWordsProps> = ({ onNext }) => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-4xl font-bold text-purple-700 mb-8">
        Extra: Reality and Words
      </h1>

      {/* Content Card */}
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
        <div className="prose prose-lg max-w-none text-gray-800 space-y-6">

          {/* Reality Discernment Gauge - Featured Section */}
          <div className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-300 rounded-lg p-8 my-8">
            <div className="flex items-start mb-6">
              <AlertCircle className="w-10 h-10 text-orange-600 mr-4 flex-shrink-0" />
              <div>
                <h2 className="text-3xl font-bold text-orange-800 mb-2">Reality Discernment Gauge</h2>
                <div className="flex items-center text-orange-700 mb-4">
                  <Clock className="w-5 h-5 mr-2" />
                  <span className="text-lg font-semibold">30-Second Action</span>
                </div>
              </div>
            </div>

            <p className="text-gray-800 text-lg mb-6">
              This is a habit you can build — a fast, focused check-in to recover clarity and filter AI distortion before it spreads.
            </p>

            <div className="bg-white rounded-lg p-6 space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-10 h-10 bg-orange-600 text-white rounded-full flex items-center justify-center mr-4 font-bold text-lg">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg mb-1">Pause before sharing or reacting</h3>
                  <p className="text-gray-700">Take a moment to interrupt automatic responses</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 w-10 h-10 bg-orange-600 text-white rounded-full flex items-center justify-center mr-4 font-bold text-lg">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg mb-1">Ask what it's trying to make you believe or feel</h3>
                  <p className="text-gray-700">Question the emotional or cognitive manipulation</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 w-10 h-10 bg-orange-600 text-white rounded-full flex items-center justify-center mr-4 font-bold text-lg">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg mb-1">Check if it's coming from a source you trust</h3>
                  <p className="text-gray-700">Verify credibility before accepting as truth</p>
                </div>
              </div>
            </div>
          </div>

          {/* 5 Tests Section */}
          <div className="bg-purple-50 border-l-4 border-purple-500 p-6 my-8">
            <h2 className="text-2xl font-semibold text-purple-800 mb-3">5 Tests for Daily Mental Health</h2>
            <p className="text-gray-800 text-lg">
              Simple habits help guard against both AI error types.
            </p>
            <p className="text-gray-600 text-sm mt-4 italic">
              (More detailed guidance coming soon)
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 my-8 text-center">
            <p className="text-blue-900 text-lg font-medium">
              These practical tools will help you navigate the AI era with greater clarity, discernment, and confidence.
            </p>
          </div>

        </div>
      </div>

      <div className="flex justify-end mt-8">
        <Button
          onClick={() => onNext && onNext('ia-2-1')}
          className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg"
        >
          Continue to Module 2
        </Button>
      </div>
    </div>
  );
};

export default IA_1_5_RealityAndWords;
