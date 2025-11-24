import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, Clock } from 'lucide-react';
import ScrollIndicator from '@/components/ui/ScrollIndicator';

interface IA15RealityAndWordsProps {
  onNext?: (stepId: string) => void;
}

const IA_1_5_RealityAndWords: React.FC<IA15RealityAndWordsProps> = ({ onNext }) => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Scroll Indicator - appears when user is idle */}
      <ScrollIndicator
        idleTime={3000}
        position="nav-adjacent"
        colorScheme="purple"
      />

      <h1 className="text-4xl font-bold text-purple-700 mb-8">
        Extra: Reality and Words
      </h1>

      {/* Content Card */}
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
        <div className="prose prose-lg max-w-none text-gray-800 space-y-6">

          {/* Reality Discernment Gauge - Featured Section */}
          <div className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-300 rounded-lg p-8 my-8">
            <div className="flex items-center gap-3 mb-6">
              <AlertCircle className="w-8 h-8 text-orange-600 flex-shrink-0" />
              <h2 className="text-3xl font-bold text-orange-800">Reality Discernment Gauge</h2>
            </div>

            {/* 30-Second Action Graphic */}
            <div className="flex justify-center my-6">
              <img
                src="/assets/ia-1-5-30sec.png"
                alt="30-Second Reality Check"
                className="w-1/4 max-w-md rounded-lg shadow-md"
              />
            </div>

            <p className="text-gray-800 text-lg mb-6">
              This is a habit you can build — a fast, focused check-in to recover clarity and filter AI distortion before it spreads.
            </p>

            <div className="bg-white rounded-lg p-6 space-y-3">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold mt-0.5">
                  1
                </div>
                <div className="flex-1">
                  <p className="text-gray-900 font-bold mb-1 leading-tight">Pause before sharing or reacting</p>
                  <p className="text-gray-700 text-sm">Take a moment to interrupt automatic responses</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold mt-0.5">
                  2
                </div>
                <div className="flex-1">
                  <p className="text-gray-900 font-bold mb-1 leading-tight">Ask what it's trying to make you believe or feel</p>
                  <p className="text-gray-700 text-sm">Question the emotional or cognitive manipulation</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold mt-0.5">
                  3
                </div>
                <div className="flex-1">
                  <p className="text-gray-900 font-bold mb-1 leading-tight">Check if it's coming from a source you trust</p>
                  <p className="text-gray-700 text-sm">Verify credibility before accepting as truth</p>
                </div>
              </div>
            </div>
          </div>

          {/* Impossible Things - Looking Glass Section */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 my-8">
            <h2 className="text-2xl font-semibold text-purple-800 mb-4">Impossible Things</h2>

            <div className="flex justify-center my-6">
              <img
                src="/assets/lookingglass.png"
                alt="Looking Glass - Impossible Things"
                className="w-full max-w-xs rounded-lg shadow-md"
              />
            </div>

            <div className="space-y-4 text-gray-800">
              <p className="text-lg leading-relaxed">
                Lewis Carroll captured a truth we now understand through neuroscience: imagination grows with deliberate practice.
              </p>
              <p className="text-lg leading-relaxed font-medium text-purple-700">
                What we name shapes what we can perceive—and what we believe is possible.
              </p>
            </div>
          </div>

          {/* Words We Use Section */}
          <div className="my-8">
            <h2 className="text-2xl font-semibold text-purple-800 mb-6">Words We Use</h2>

            {/* Spectrum Graphic */}
            <div className="flex justify-center my-6">
              <img
                src="/assets/ia-1-5-spectrum.png"
                alt="Imagination Language Spectrum"
                className="w-full max-w-3xl rounded-lg shadow-md"
              />
            </div>

            {/* Domain Examples Table */}
            <div className="overflow-x-auto mt-6">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-purple-100">
                    <th className="border border-purple-300 px-4 py-3 text-left font-semibold text-purple-900">Domain</th>
                    <th className="border border-purple-300 px-4 py-3 text-left font-semibold text-purple-900">Examples</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ backgroundColor: '#61d39c' }}>
                    <td className="border border-purple-300 px-4 py-3 font-bold text-gray-900">INVITING & ENCOURAGING</td>
                    <td className="border border-purple-300 px-4 py-3 text-gray-800">"Just imagine", "Let imagination run wild", "Fire the imagination"</td>
                  </tr>
                  <tr style={{ backgroundColor: '#769bfd' }}>
                    <td className="border border-purple-300 px-4 py-3 font-bold text-gray-900">NEUTRAL PROCESSING</td>
                    <td className="border border-purple-300 px-4 py-3 text-gray-800">"Picture this", "In your mind's eye", "Food for thought"</td>
                  </tr>
                  <tr style={{ backgroundColor: '#b485f3' }}>
                    <td className="border border-purple-300 px-4 py-3 font-bold text-white">COGNITIVE DIFFICULTY</td>
                    <td className="border border-purple-300 px-4 py-3 text-gray-800">"Hard to fathom", "Mind-boggling", "Failure of imagination"</td>
                  </tr>
                  <tr style={{ backgroundColor: '#eb73c2' }}>
                    <td className="border border-purple-300 px-4 py-3 font-bold text-white">DISBELIEF</td>
                    <td className="border border-purple-300 px-4 py-3 text-gray-800">"Can you imagine", "Beyond belief", "Inconceivable"</td>
                  </tr>
                  <tr style={{ backgroundColor: '#ee4c5c' }}>
                    <td className="border border-purple-300 px-4 py-3 font-bold text-white">IMPOSSIBILITY</td>
                    <td className="border border-purple-300 px-4 py-3 text-gray-800">"Unimaginable", "Utterly unimaginable", "Outside realm of possibility"</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 5 Tests Section */}
          <div className="bg-purple-50 border-l-4 border-purple-500 p-6 my-8">
            <h2 className="text-2xl font-semibold text-purple-800 mb-6">5 Tests for Daily Mental Health</h2>

            {/* Two-column layout: Text on left, graphics on right */}
            <div className="grid md:grid-cols-2 gap-6 items-start">
              {/* Left column - Text */}
              <div>
                <p className="text-gray-800 text-lg mb-4">
                  Simple habits help guard against both AI error types.
                </p>
                <p className="text-gray-600 text-sm italic">
                  (More detailed guidance coming soon)
                </p>
              </div>

              {/* Right column - Graphics stacked */}
              <div className="space-y-4">
                <div className="flex justify-center">
                  <img
                    src="/assets/ia-1-5-braintimer.png"
                    alt="Brain Timer - Mental Health Check"
                    className="w-full max-w-xs rounded-lg shadow-md"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 my-8 text-center">
            <p className="text-blue-900 text-lg font-medium">
              These practical tools will help you navigate the AI era with greater clarity, discernment, and confidence.
            </p>
          </div>

          {/* Quiz Section */}
          <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-8 my-8">
            <h2 className="text-2xl font-bold text-purple-800 mb-4 text-center">Quiz</h2>
            <h3 className="text-xl font-semibold text-purple-700 mb-6 text-center">Which Phrase Triggers Your DMN?</h3>

            <div className="space-y-4">
              {/* Option 1 */}
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h4 className="font-semibold text-gray-900 mb-2">Option 1</h4>
                <div className="space-y-1">
                  <p className="text-gray-800">
                    <span className="font-bold text-purple-700">A:</span> "Be realistic."
                  </p>
                  <p className="text-gray-800">
                    <span className="font-bold text-purple-700">B:</span> "Let's see what might be possible."
                  </p>
                </div>
              </div>

              {/* Option 2 */}
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h4 className="font-semibold text-gray-900 mb-2">Option 2</h4>
                <div className="space-y-1">
                  <p className="text-gray-800">
                    <span className="font-bold text-purple-700">A:</span> "I can't imagine that."
                  </p>
                  <p className="text-gray-800">
                    <span className="font-bold text-purple-700">B:</span> "Help me imagine how this could work."
                  </p>
                </div>
              </div>
            </div>

            <p className="text-center text-lg font-semibold text-purple-800 mt-6">
              Two small phrases. Two different futures.
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
