import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface IA_4_2_ContentProps {
  onNext?: (nextStepId: string) => void;
}

const IA_4_2_Content: React.FC<IA_4_2_ContentProps> = ({ onNext }) => {
  const [challenge, setChallenge] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [shift, setShift] = useState('');
  const [tag, setTag] = useState('');
  const [newPerspective, setNewPerspective] = useState('');

  const handleSaveReframe = () => {
    // Save the reframe data
    console.log('Saving reframe:', { challenge, aiResponse, shift, tag, newPerspective });
    // Here you would typically save to your backend
  };

  const handleTryAnother = () => {
    // Clear the form for another try
    setChallenge('');
    setAiResponse('');
    setShift('');
    setTag('');
    setNewPerspective('');
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-purple-700 mb-8">
        Autoflow Mindful Prompts
      </h1>
      
      {/* Content Card */}
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
        <div className="prose prose-lg max-w-none text-gray-800 space-y-6">
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-200">
            <h3 className="text-xl font-semibold text-purple-800 mb-4">From Autoflow to Meta-Awareness</h3>
            <p className="text-lg text-purple-700">
              Reveal and reframe your thinking.
            </p>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-yellow-800 mb-3">🎯 PURPOSE</h4>
            <p className="text-yellow-700">
              This exercise strengthens your capacity for meta-awareness. It builds directly on Autoflow by asking you to notice and 
              disrupt habitual thought loops—especially in work-related situations—using a simple, interactive prompt.
            </p>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-blue-800 mb-4">📋 ACTIVITY</h4>
            
            <div className="space-y-6">
              {/* Step 1 */}
              <div className="border-l-4 border-purple-500 pl-4">
                <h5 className="font-semibold text-gray-800 mb-2">Step 1: Notice the Loop</h5>
                <p className="text-gray-700 mb-3">
                  Bring to mind a current work challenge. Now, notice a reactive thought or recurring narrative you associate with it.
                </p>
                <Textarea
                  placeholder="Describe your work challenge and the reactive thought pattern..."
                  value={challenge}
                  onChange={(e) => setChallenge(e.target.value)}
                  className="w-full h-24"
                />
              </div>
              
              {/* Step 2 */}
              <div className="border-l-4 border-purple-500 pl-4">
                <h5 className="font-semibold text-gray-800 mb-2">Step 2: Prompt the Pattern</h5>
                <p className="text-gray-700 mb-3">
                  Ask AI: "What's one way to reframe this thought or response?"<br/>
                  <span className="text-sm text-gray-600">(Use our built-in prompt tool or your preferred AI agent.)</span>
                </p>
                <Textarea
                  placeholder="Paste the AI's response here..."
                  value={aiResponse}
                  onChange={(e) => setAiResponse(e.target.value)}
                  className="w-full h-20"
                />
              </div>
              
              {/* Step 3 */}
              <div className="border-l-4 border-purple-500 pl-4">
                <h5 className="font-semibold text-gray-800 mb-2">Step 3: Pause + Reflect</h5>
                <p className="text-gray-700 mb-3">
                  Did the AI's response shift your thinking, feeling, or next step? Note one word or image that now feels more true or helpful.
                </p>
                <Textarea
                  placeholder="Describe the shift you noticed..."
                  value={shift}
                  onChange={(e) => setShift(e.target.value)}
                  className="w-full h-20"
                />
              </div>
              
              {/* Step 4 */}
              <div className="border-l-4 border-purple-500 pl-4">
                <h5 className="font-semibold text-gray-800 mb-2">Step 4: Tag It</h5>
                <p className="text-gray-700 mb-3">
                  Select a tag that best captures the shift:<br/>
                  <span className="text-sm text-gray-600">💡 Tagging builds your Meta-Awareness Timeline.</span>
                </p>
                <Select value={tag} onValueChange={setTag}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a tag that captures the shift" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="reframe">Reframe</SelectItem>
                    <SelectItem value="surprise">Surprise</SelectItem>
                    <SelectItem value="clarity">Clarity</SelectItem>
                    <SelectItem value="curiosity">Curiosity</SelectItem>
                    <SelectItem value="humor">Humor</SelectItem>
                    <SelectItem value="calm">Calm</SelectItem>
                    <SelectItem value="insight">Insight</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Step 5 - New Perspective */}
              <div className="border-l-4 border-purple-500 pl-4">
                <h5 className="font-semibold text-gray-800 mb-2">Step 5: New Perspective</h5>
                <p className="text-gray-700 mb-3">
                  What new approach or next step emerged from this reframing process?
                </p>
                <Textarea
                  placeholder="Describe your new perspective or next step..."
                  value={newPerspective}
                  onChange={(e) => setNewPerspective(e.target.value)}
                  className="w-full h-20"
                />
              </div>
            </div>
          </div>
          
          {/* Example */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-green-800 mb-3">💡 EXAMPLE</h4>
            <div className="space-y-2 text-green-700">
              <p><strong>Challenge:</strong> "My team never listens to me."</p>
              <p><strong>AI Response:</strong> "What if their silence means reflection, not dismissal?"</p>
              <p><strong>Shift:</strong> "Curiosity"</p>
              <p><strong>New Perspective:</strong> "I'll ask one question in tomorrow's meeting, then pause."</p>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-4 justify-center">
            <Button 
              onClick={handleSaveReframe}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2"
              disabled={!challenge || !tag}
            >
              Save Reframe
            </Button>
            <Button 
              onClick={handleTryAnother}
              variant="outline"
              className="border-purple-300 text-purple-700 hover:bg-purple-50 px-6 py-2"
            >
              Try Another Challenge
            </Button>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end mt-8">
        <Button 
          onClick={() => onNext && onNext('ia-4-3')}
          className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg"
        >
          Continue to Visualization Stretch
        </Button>
      </div>
    </div>
  );
};

export default IA_4_2_Content;