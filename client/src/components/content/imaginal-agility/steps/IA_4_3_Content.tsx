import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

interface IA_4_3_ContentProps {
  onNext?: (nextStepId: string) => void;
}

const IA_4_3_Content: React.FC<IA_4_3_ContentProps> = ({ onNext }) => {
  const [currentFrame, setCurrentFrame] = useState('');
  const [aiStretch, setAiStretch] = useState('');
  const [stretchVision, setStretchVision] = useState('');
  const [resistance, setResistance] = useState('');
  const [stretchName, setStretchName] = useState('');

  const handleSaveInsight = () => {
    console.log('Saving insight:', { currentFrame, aiStretch, stretchVision, resistance, stretchName });
  };

  const handleTryAnotherStretch = () => {
    setCurrentFrame('');
    setAiStretch('');
    setStretchVision('');
    setResistance('');
    setStretchName('');
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-purple-700 mb-8">
        Visualization Stretch
      </h1>
      
      {/* Content Card */}
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
        <div className="prose prose-lg max-w-none text-gray-800 space-y-6">
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-200">
            <h3 className="text-xl font-semibold text-purple-800 mb-4">From Visualization to Perceptual Expansion</h3>
            <p className="text-lg text-purple-700">
              See not just what is—but what could be next.
            </p>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-yellow-800 mb-3">🎯 PURPOSE</h4>
            <p className="text-yellow-700">
              This exercise strengthens your capacity to stretch beyond your current assumptions or roles. It builds directly on your 
              prior visualization by expanding your sense of agency. What if your potential wasn't just realized—but reimagined? 
              With AI as your partner, you'll glimpse possibilities just beyond your current pattern.
            </p>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-blue-800 mb-4">📋 ACTIVITY</h4>
            
            <div className="space-y-6">
              {/* Step 1 */}
              <div className="border-l-4 border-purple-500 pl-4">
                <h5 className="font-semibold text-gray-800 mb-2">Step 1: Name the Frame</h5>
                <p className="text-gray-700 mb-3">
                  Recall the visualization you formed earlier. Summarize it in a single sentence.
                </p>
                <Textarea
                  placeholder="Summarize your earlier visualization in one sentence..."
                  value={currentFrame}
                  onChange={(e) => setCurrentFrame(e.target.value)}
                  className="w-full h-20"
                />
              </div>
              
              {/* Step 2 */}
              <div className="border-l-4 border-purple-500 pl-4">
                <h5 className="font-semibold text-gray-800 mb-2">Step 2: Ask AI to Stretch It</h5>
                <p className="text-gray-700 mb-3">
                  Ask: "What's one possibility I haven't considered that would expand this pattern or move it to the next level?"
                </p>
                <Textarea
                  placeholder="Paste the AI's stretching suggestion here..."
                  value={aiStretch}
                  onChange={(e) => setAiStretch(e.target.value)}
                  className="w-full h-24"
                />
              </div>
              
              {/* Step 3 */}
              <div className="border-l-4 border-purple-500 pl-4">
                <h5 className="font-semibold text-gray-800 mb-2">Step 3: Visualize the Stretch</h5>
                <p className="text-gray-700 mb-3">
                  Take a moment to picture yourself stepping into that new version. What changes in your energy, approach, or impact?
                </p>
                <Textarea
                  placeholder="Describe yourself in this expanded role - how do you feel, act, and impact others?"
                  value={stretchVision}
                  onChange={(e) => setStretchVision(e.target.value)}
                  className="w-full h-24"
                />
              </div>
              
              {/* Step 4 */}
              <div className="border-l-4 border-purple-500 pl-4">
                <h5 className="font-semibold text-gray-800 mb-2">Step 4: Identify the Resistance</h5>
                <p className="text-gray-700 mb-3">
                  What's holding you back from stretching into this expanded role? Choose one:
                </p>
                <Select value={resistance} onValueChange={setResistance}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select what's holding you back" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fear-judgment">Fear of judgment</SelectItem>
                    <SelectItem value="habit">Habit</SelectItem>
                    <SelectItem value="lack-time">Lack of time</SelectItem>
                    <SelectItem value="identity-attachment">Identity attachment</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Step 5 */}
              <div className="border-l-4 border-purple-500 pl-4">
                <h5 className="font-semibold text-gray-800 mb-2">Step 5: Name the Stretch</h5>
                <p className="text-gray-700 mb-3">
                  Give your new posture or mindset a name you'll remember.
                </p>
                <Input
                  placeholder="Name your stretch (e.g., 'Shape the Stage', 'Bridge Builder')"
                  value={stretchName}
                  onChange={(e) => setStretchName(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
          </div>
          
          {/* Example */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-green-800 mb-3">💡 EXAMPLE</h4>
            <div className="space-y-2 text-green-700">
              <p><strong>Frame:</strong> "I see myself confidently leading strategy sessions where my ideas are valued."</p>
              <p><strong>AI Stretch:</strong> "What if you shaped how the entire team generates and refines strategy—not just contributed your own ideas?"</p>
              <p><strong>Stretch Vision:</strong> "I'd become a convener of voices and designer of systems, not just a participant."</p>
              <p><strong>Resistance:</strong> Identity attachment</p>
              <p><strong>Name:</strong> "Shape the Stage"</p>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-4 justify-center">
            <Button 
              onClick={handleSaveInsight}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2"
              disabled={!currentFrame || !stretchName}
            >
              Save Insight
            </Button>
            <Button 
              onClick={handleTryAnotherStretch}
              variant="outline"
              className="border-purple-300 text-purple-700 hover:bg-purple-50 px-6 py-2"
            >
              Try Another Stretch
            </Button>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end mt-8">
        <Button 
          onClick={() => onNext && onNext('ia-4-4')}
          className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg"
        >
          Continue to Higher Purpose Uplift
        </Button>
      </div>
    </div>
  );
};

export default IA_4_3_Content;