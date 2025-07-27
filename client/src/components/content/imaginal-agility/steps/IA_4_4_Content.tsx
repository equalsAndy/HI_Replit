import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { FileText } from 'lucide-react';
import { useTestUser } from '@/hooks/useTestUser';
import { useWorkshopStepData } from '@/hooks/useWorkshopStepData';

interface IA_4_4_ContentProps {
  onNext?: (nextStepId: string) => void;
}

// Data structure for this step
interface IA44StepData {
  higherPurpose: string;
  selectedChallenge: string;
  aiPerspectives: string;
  contribution: string;
  bridgeName: string;
  scaledContribution: string;
}

const IA_4_4_Content: React.FC<IA_4_4_ContentProps> = ({ onNext }) => {
  const { shouldShowDemoButtons } = useTestUser();
  
  // Initialize with empty data structure
  const initialData: IA44StepData = {
    higherPurpose: '',
    selectedChallenge: '',
    aiPerspectives: '',
    contribution: '',
    bridgeName: '',
    scaledContribution: ''
  };
  
  // Use workshop step data persistence hook
  const { data, updateData, saving, loaded, error, saveNow } = useWorkshopStepData('ia', 'ia-4-4', initialData);
  
  // Destructure data for easier access
  const { higherPurpose, selectedChallenge, aiPerspectives, contribution, bridgeName, scaledContribution } = data;

  const globalChallenges = [
    "Climate Change and Environmental Degradation",
    "Inequality and Global Poverty", 
    "Artificial Intelligence and Technological Ethics",
    "Disinformation and Erosion of Truth",
    "Human Rights in Conflict and Crisis"
  ];

  // Demo data function for test users
  const fillWithDemoData = () => {
    if (!shouldShowDemoButtons) {
      console.warn('Demo functionality only available to test users');
      return;
    }
    
    updateData({
      higherPurpose: "To harness the power of human creativity and technology to solve complex challenges that improve lives and create a more equitable, sustainable world for future generations.",
      selectedChallenge: "Climate Change and Environmental Degradation",
      aiPerspectives: "AI could help by analyzing massive climate datasets to identify patterns and solutions, optimizing renewable energy systems, predicting environmental changes, and automating sustainable practices. However, human imagination is needed to envision innovative approaches, build social movements, create compelling narratives that motivate action, and design solutions that consider complex human and cultural factors that AI might miss.",
      contribution: "I can contribute by developing creative communication strategies that make climate science accessible and actionable, building bridges between technical solutions and community needs, and using my unique perspective to identify overlooked opportunities for sustainable innovation in my field.",
      bridgeName: "The Climate Imagination Bridge",
      scaledContribution: "I envision creating a global network of 'Climate Imagination Hubs' where communities combine local knowledge with AI-powered insights to develop culturally-appropriate sustainability solutions, scaling from neighborhood projects to regional transformation initiatives."
    });
    
    console.log('IA 4-4 Content filled with demo data');
  };

  const handleSaveInsight = async () => {
    try {
      await saveNow();
      console.log('Insight saved successfully');
    } catch (error) {
      console.error('Failed to save insight:', error);
    }
  };

  const handleTryAnotherChallenge = () => {
    updateData({
      selectedChallenge: '',
      aiPerspectives: '',
      contribution: '',
      bridgeName: '',
      scaledContribution: ''
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-purple-700 mb-8">
        Higher Purpose Uplift
      </h1>
      
      {/* Content Card */}
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
        <div className="prose prose-lg max-w-none text-gray-800 space-y-6">
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-200">
            <h3 className="text-xl font-semibold text-purple-800 mb-4">From Personal Purpose to Shared Responsibility</h3>
            <p className="text-lg text-purple-700">
              Stretch your imagination from inner clarity to outer consequence.
            </p>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-yellow-800 mb-3">🎯 PURPOSE</h4>
            <p className="text-yellow-700">
              This exercise challenges you to imagine how your deeper purpose might serve a world in crisis. It builds directly on your 
              higher purpose clarification. Now you'll explore how that purpose—even in small, surprising ways—might intersect with one 
              of the Five Greatest Moral Challenges of Our Time.
            </p>
            <p className="text-yellow-700 mt-2">
              Inspired by the spirit of Buckminster Fuller's World Game, this exercise invites you to think beyond borders, roles, or 
              career paths—to imagine yourself as part of a cooperative design team for the future of life on Earth.
            </p>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-blue-800 mb-4">📋 ACTIVITY</h4>
            
            <div className="space-y-6">
              {/* Step 1 */}
              <div className="border-l-4 border-purple-500 pl-4">
                <h5 className="font-semibold text-gray-800 mb-2">Step 1: Recall Your Higher Purpose</h5>
                <p className="text-gray-700 mb-3">
                  What core intention did you uncover earlier? Write it in your own words.
                </p>
                <Textarea
                  placeholder="Describe your higher purpose or core intention..."
                  value={higherPurpose}
                  onChange={(e) => updateData({ higherPurpose: e.target.value })}
                  className="w-full h-20"
                />
              </div>
              
              {/* Step 2 */}
              <div className="border-l-4 border-purple-500 pl-4">
                <h5 className="font-semibold text-gray-800 mb-2">Step 2: Choose a Global Challenge</h5>
                <p className="text-gray-700 mb-3">
                  Pick one of the major issues below—or write your own. These are some of the most urgent and interconnected 
                  challenges facing our planet:
                </p>
                <Select value={selectedChallenge} onValueChange={(value) => updateData({ selectedChallenge: value })}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a global challenge" />
                  </SelectTrigger>
                  <SelectContent>
                    {globalChallenges.map((challenge, index) => (
                      <SelectItem key={index} value={challenge}>{challenge}</SelectItem>
                    ))}
                    <SelectItem value="other">Other (specify below)</SelectItem>
                  </SelectContent>
                </Select>
                {selectedChallenge === 'other' && (
                  <Input
                    placeholder="Specify your own global challenge..."
                    className="w-full mt-2"
                  />
                )}
              </div>
              
              {/* Step 3 */}
              <div className="border-l-4 border-purple-500 pl-4">
                <h5 className="font-semibold text-gray-800 mb-2">Step 3: Ask AI to Reframe It</h5>
                <p className="text-gray-700 mb-3">
                  Use this built-in prompt: "Offer three unconventional or overlooked perspectives on this challenge—and what it 
                  might need most from someone like me."
                </p>
                <Textarea
                  placeholder="Paste the AI's three perspectives here..."
                  value={aiPerspectives}
                  onChange={(e) => updateData({ aiPerspectives: e.target.value })}
                  className="w-full h-24"
                />
              </div>
              
              {/* Step 4 */}
              <div className="border-l-4 border-purple-500 pl-4">
                <h5 className="font-semibold text-gray-800 mb-2">Step 4: Visualize a Modest Contribution</h5>
                <p className="text-gray-700 mb-3">
                  Now imagine: what small move, experiment, or system shift might reflect both your higher purpose and a response 
                  to this global need?
                </p>
                <Textarea
                  placeholder="Describe a small but meaningful contribution you could make..."
                  value={contribution}
                  onChange={(e) => updateData({ contribution: e.target.value })}
                  className="w-full h-24"
                />
              </div>
              
              {/* Step 5 */}
              <div className="border-l-4 border-purple-500 pl-4">
                <h5 className="font-semibold text-gray-800 mb-2">Step 5: Name the Bridge</h5>
                <p className="text-gray-700 mb-3">
                  Give your imagined contribution a name—one that evokes the spirit of connection and creativity.
                </p>
                <Input
                  placeholder="Name your bridge contribution..."
                  value={bridgeName}
                  onChange={(e) => updateData({ bridgeName: e.target.value })}
                  className="w-full"
                />
              </div>
              
              {/* Step 6 */}
              <div className="border-l-4 border-purple-500 pl-4">
                <h5 className="font-semibold text-gray-800 mb-2">Step 6: Optional Stretch (Inspired by the World Game)</h5>
                <p className="text-gray-700 mb-3">
                  Zoom out. Imagine you're part of a team designing solutions not for one company, but for the whole planet. 
                  How would you redesign this contribution to work at scale—with care, clarity, and cooperation?
                </p>
                <Textarea
                  placeholder="Describe how your contribution could scale globally..."
                  value={scaledContribution}
                  onChange={(e) => updateData({ scaledContribution: e.target.value })}
                  className="w-full h-24"
                />
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-4 justify-center">
            <Button 
              onClick={handleSaveInsight}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2"
              disabled={!higherPurpose || !selectedChallenge}
            >
              Save Insight
            </Button>
            <Button 
              onClick={handleTryAnotherChallenge}
              variant="outline"
              className="border-purple-300 text-purple-700 hover:bg-purple-50 px-6 py-2"
            >
              Try Another Challenge
            </Button>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end items-center gap-3 mt-8">
        {shouldShowDemoButtons && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={fillWithDemoData}
            className="text-purple-600 hover:text-purple-800 hover:bg-purple-50"
          >
            <FileText className="w-4 h-4 mr-2" />
            Add Demo Data
          </Button>
        )}
        <Button 
          onClick={() => onNext && onNext('ia-4-5')}
          className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg"
        >
          Continue to Inspiration Support
        </Button>
      </div>
    </div>
  );
};

export default IA_4_4_Content;