import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, Clock, CheckCircle, XCircle } from 'lucide-react';
import ScrollIndicator from '@/components/ui/ScrollIndicator';

interface IA15RealityAndWordsProps {
  onNext?: (stepId: string) => void;
}

const IA_1_5_RealityAndWords: React.FC<IA15RealityAndWordsProps> = ({ onNext }) => {
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});

  const quizItems = [
    {
      id: 'q1',
      prompt: 'Phrase Pair 1',
      options: [
        { key: 'A', text: `"Be realistic."` },
        { key: 'B', text: `"Let's see what might be possible."` }
      ],
      correct: 'B',
      success: "That's right—inviting possibilities lights up your Default Mode Network.",
      incorrect: '“Be realistic” narrows options and keeps thinking inside current constraints, dampening the Default Mode Network.'
    },
    {
      id: 'q2',
      prompt: 'Phrase Pair 2',
      options: [
        { key: 'A', text: `"Help me imagine how this could work."` },
        { key: 'B', text: `"I can't imagine that."` }
      ],
      // Swapped: make A the correct answer for this second item
      correct: 'A',
      success: 'Correct—asking for imaginative help invites new possibilities and engages the Default Mode Network.',
      incorrect: '"I can\'t imagine that" is a conversation stopper that shuts down exploration and the Default Mode Network.'
    }
  ];

  const handleSelect = (questionId: string, optionKey: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionKey }));
  };

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

            {/* Two-column layout: Left content and right checklist */}
            <div className="grid md:grid-cols-2 gap-6 items-start">
              {/* Left column - Text and brain timer */}
              <div className="space-y-4">
                <p className="text-gray-800 text-lg">
                  Simple habits help guard against both AI error types.
                </p>
                <div className="flex justify-center">
                  <img
                    src="/assets/ia-1-5-braintimer.png"
                    alt="Brain Timer - Mental Health Check"
                    className="w-full max-w-xs rounded-lg shadow-md"
                  />
                </div>
              </div>

              {/* Right column - Checklist graphic */}
              <div className="flex justify-center items-start">
                <img
                  src="/assets/ia1-5-checklist.png"
                  alt="5 Tests of Mental Health Checklist"
                  className="w-full rounded-lg shadow-md"
                />
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
            <h3 className="text-xl font-semibold text-purple-700 mb-2 text-center">
              Which phrase activates your Default Mode Network?
            </h3>
            <p className="text-center text-gray-700 mb-6">
              Choose the phrase that keeps imagination open. Notice how wording affects your Default Mode Network.
            </p>

            <div className="space-y-4">
              {quizItems.map(item => {
                const selected = answers[item.id];
                const isCorrect = selected === item.correct;
                return (
                  <div key={item.id} className="bg-white rounded-lg p-4 shadow-sm border border-purple-100">
                    <div className="flex items-center justify-between mb-3">
                      <p className="font-semibold text-gray-900">{item.prompt}</p>
                      {selected && (
                        <span className={`inline-flex items-center gap-1 text-sm font-semibold px-2 py-1 rounded
                          ${isCorrect ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'}`}>
                          {isCorrect ? 'Correct' : 'Keep going'}
                        </span>
                      )}
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {item.options.map(opt => {
                        const chosen = selected === opt.key;
                        const correctChoice = opt.key === item.correct;
                        return (
                          <button
                            key={opt.key}
                            onClick={() => handleSelect(item.id, opt.key)}
                            className={`text-left w-full border rounded-lg px-3 py-3 transition flex items-center gap-3
                              ${chosen ? (isCorrect ? 'border-green-500 ring-2 ring-green-200 bg-green-50' : 'border-red-400 ring-2 ring-red-200 bg-red-50') : 'border-gray-200 hover:border-purple-300 bg-white'}
                            `}
                          >
                            {chosen && isCorrect && (
                              <CheckCircle className="w-5 h-5 text-green-700 flex-shrink-0" />
                            )}
                            {chosen && !isCorrect && (
                              <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                            )}
                            <div>
                              <span className="font-bold text-purple-700 mr-2">{opt.key}:</span>
                              <span className="text-gray-800">{opt.text}</span>
                            </div>
                            {correctChoice && !chosen && (
                              <span className="ml-auto text-xs text-gray-400">hint</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                    {selected && (
                      <div className={`mt-4 text-sm font-semibold leading-6 px-4 py-3 rounded-lg border
                        ${isCorrect ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                        {isCorrect
                          ? item.success
                          : (item.incorrect || 'Consider how possibility language engages the Default Mode Network.')}
                      </div>
                    )}
                  </div>
                );
              })}
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
