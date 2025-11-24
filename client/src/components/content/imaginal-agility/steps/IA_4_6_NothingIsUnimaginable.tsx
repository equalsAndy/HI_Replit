import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { FileText } from 'lucide-react';
import { useTestUser } from '@/hooks/useTestUser';
import { useWorkshopStepData } from '@/hooks/useWorkshopStepData';
import ScrollIndicator from '@/components/ui/ScrollIndicator';

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
      {/* Scroll Indicator - appears when user is idle */}
      <ScrollIndicator
        idleTime={3000}
        position="nav-adjacent"
        colorScheme="purple"
      />
      <h1 className="text-3xl font-bold text-purple-700 mb-8">
        Nothing is Unimaginable
      </h1>
      
      {/* ADV Rung 5 Graphic and Purpose Side by Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* ADV Rung 5 Graphic */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex justify-center">
            <img 
              src="/assets/ADV_Rung5.png" 
              alt="Advanced Rung 5: Unlimited Vision"
              className="w-full h-auto max-w-md mx-auto"
              style={{ maxHeight: '400px', objectFit: 'contain' }}
              onLoad={() => console.log('✅ ADV Rung 5 graphic loaded successfully')}
              onError={(e) => {
                console.error('❌ Failed to load ADV Rung 5 graphic');
                console.log('Image src:', e.currentTarget.src);
              }}
            />
          </div>
        </div>

        {/* Purpose Section */}
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200">
          <h2 className="text-lg font-semibold text-purple-800 mb-3">PURPOSE</h2>
          <div className="text-gray-700 space-y-2 mb-4">
            <p>You've climbed the Ladder of Imagination.</p>
            <p>You've seen patterns, tensions, possibilities, mysteries.</p>
            <p>You've invited the muse and stretched into moral imagination.</p>
            <p className="font-medium">
              Now we ask you to pause—at the edge of structure—and imagine not just for yourself, but for the world.
            </p>
          </div>
          <div className="bg-purple-100 border border-purple-300 rounded-lg p-4">
            <p className="text-lg font-medium text-purple-800 text-center">
              From Mastery to Vision: Cross the threshold. Say what only you can say.
            </p>
            <p className="text-purple-700 text-center mt-2 font-semibold">
              No tools. No AI. Just your voice and vision, awakened.
            </p>
          </div>
        </div>
      </div>
      
      {/* Content Card */}
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
        <div className="prose prose-lg max-w-none text-gray-800 space-y-6">
          
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