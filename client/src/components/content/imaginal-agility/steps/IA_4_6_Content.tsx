import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { FileText } from 'lucide-react';
import { useTestUser } from '@/hooks/useTestUser';
import { useWorkshopStepData } from '@/hooks/useWorkshopStepData';

interface IA_4_6_ContentProps {
  onNext?: (nextStepId: string) => void;
}

// Data structure for this step
interface IA46StepData {
  vision: string;
  wordCount: number;
}

const IA_4_6_Content: React.FC<IA_4_6_ContentProps> = ({ onNext }) => {
  const { shouldShowDemoButtons } = useTestUser();
  
  // Initialize with empty data structure
  const initialData: IA46StepData = {
    vision: '',
    wordCount: 0
  };
  
  // Use workshop step data persistence hook
  const { data, updateData, saving, loaded, error, saveNow } = useWorkshopStepData('ia', 'ia-4-6', initialData);
  
  // Destructure data for easier access
  const { vision, wordCount } = data;

  const handleVisionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    updateData({
      vision: text,
      wordCount: words.length
    });
  };

  const handleSaveVision = async () => {
    try {
      await saveNow();
      console.log('Vision saved successfully');
    } catch (error) {
      console.error('Failed to save vision:', error);
    }
  };

  const handleDownloadJourney = () => {
    // This would trigger a download of the user's complete ladder journey
    console.log('Downloading ladder journey...');
  };

  // Demo data function for test users
  const fillWithDemoData = () => {
    if (!shouldShowDemoButtons) {
      console.warn('Demo functionality only available to test users');
      return;
    }
    
    const demoVision = "A world where imagination is recognized as humanity's greatest strategic asset, where every organization has dedicated spaces for creative thinking, and where the marriage of human imagination and artificial intelligence creates solutions to our most complex global challenges.";
    const words = demoVision.trim().split(/\s+/).filter(word => word.length > 0);
    
    updateData({
      vision: demoVision,
      wordCount: words.length
    });
    
    console.log('IA 4-6 Content filled with demo final vision data');
  };

  const isOverLimit = wordCount > 50;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-purple-700 mb-8">
        Nothing is Unimaginable
      </h1>
      
      {/* Content Card */}
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
        <div className="prose prose-lg max-w-none text-gray-800 space-y-6">
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-200">
            <h3 className="text-xl font-semibold text-purple-800 mb-4">From Mastery to Vision</h3>
            <p className="text-lg text-purple-700">
              Cross the threshold. Say what only you can say.
            </p>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-yellow-800 mb-3">🎯 PURPOSE</h4>
            <div className="text-yellow-700 space-y-2">
              <p>You've climbed the Ladder of Imagination.</p>
              <p>You've seen patterns, tensions, possibilities, mysteries.</p>
              <p>You've invited the muse and stretched into moral imagination.</p>
              <p className="font-medium">
                Now we ask you to pause—at the edge of structure—and imagine not just for yourself, but for the world.
              </p>
              <p className="font-semibold">
                No tools. No AI.<br/>
                Just your voice and vision, awakened.
              </p>
            </div>
          </div>
          
          {/* The Challenge */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-red-800 mb-3">🌍 The Challenge</h4>
            <p className="text-red-700 mb-4">
              The world is politically divided, economically fragile, ecologically destabilized, and spiritually confused.
            </p>
            <p className="text-red-700 mb-4">
              But you have something no machine can offer: an awakened imagination.
            </p>
            <p className="text-red-700 font-medium">
              If you had the power to imagine <strong>into reality</strong> a future for humanity and the planet...
            </p>
          </div>
          
          {/* Vision Input */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-blue-800 mb-4">
              🌍 In 50 words or less, describe your imagined "save the world" solution.
            </h4>
            <div className="space-y-3">
              <p className="text-blue-700 text-sm">
                Be brave. Be clear. Be poetic.<br/>
                This is not a plan. It's a message from the person you've become.
              </p>
              
              <div className="relative">
                <Textarea
                  placeholder="My 'What If' Vision..."
                  value={vision}
                  onChange={handleVisionChange}
                  className={`w-full h-32 resize-none ${isOverLimit ? 'border-red-500 focus:border-red-500' : ''}`}
                  maxLength={500} // Generous character limit to allow for the word limit
                />
                <div className={`absolute bottom-2 right-2 text-xs ${isOverLimit ? 'text-red-600 font-semibold' : 'text-gray-500'}`}>
                  {wordCount}/50 words
                </div>
              </div>
              
              {isOverLimit && (
                <p className="text-red-600 text-sm font-medium">
                  Please reduce your vision to 50 words or less.
                </p>
              )}
            </div>
          </div>
          
          {/* Important Note */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <p className="text-orange-700 text-sm font-medium">
              <strong>Important:</strong> Do not use AI to support or generate your ideas.<br/>
              This is about your <strong>own</strong> inner vision.
            </p>
          </div>
          
          {/* Closing */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 text-center">
            <h4 className="text-lg font-semibold text-purple-800 mb-3">CLOSING</h4>
            <div className="text-purple-700 space-y-2">
              <p>You've crossed the threshold.</p>
              <p>You've glimpsed who you are when imagination becomes courage.</p>
              <p className="font-medium">There is no final answer—only a deeper beginning.</p>
              <p className="text-xl font-semibold">Thank you.</p>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-4 justify-center">
            <Button 
              onClick={handleSaveVision}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2"
              disabled={!vision.trim() || isOverLimit}
            >
              Save Vision
            </Button>
            <Button 
              onClick={handleDownloadJourney}
              variant="outline"
              className="border-purple-300 text-purple-700 hover:bg-purple-50 px-6 py-2"
            >
              Download My Ladder Journey
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
          onClick={() => onNext && onNext('ia-5-1')}
          className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg"
        >
          Complete the Ladder →
        </Button>
      </div>
    </div>
  );
};

export default IA_4_6_Content;