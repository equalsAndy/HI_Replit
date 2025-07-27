import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { FileText } from 'lucide-react';
import { useTestUser } from '@/hooks/useTestUser';
import { useWorkshopStepData } from '@/hooks/useWorkshopStepData';

interface IA_4_5_ContentProps {
  onNext?: (nextStepId: string) => void;
}

// Data structure for this step
interface IA45StepData {
  interludePatterns: string;
  musePrompt: string;
  museConversation: string;
  museName: string;
}

const IA_4_5_Content: React.FC<IA_4_5_ContentProps> = ({ onNext }) => {
  const { shouldShowDemoButtons } = useTestUser();
  
  // Initialize with empty data structure
  const initialData: IA45StepData = {
    interludePatterns: '',
    musePrompt: '',
    museConversation: '',
    museName: ''
  };
  
  // Use the new persistence hook
  const { data, updateData, saving, loaded, error } = useWorkshopStepData(
    'ia',
    'ia-4-5',
    initialData
  );

  const handleSaveInsight = () => {
    // Data is already being auto-saved via the hook
    console.log('Insight data saved:', data);
  };

  const handleTryAnotherVisit = () => {
    updateData({
      musePrompt: '',
      museConversation: '',
      museName: ''
    });
  };

  // Demo data function for test users
  const fillWithDemoData = () => {
    if (!shouldShowDemoButtons) {
      console.warn('Demo functionality only available to test users');
      return;
    }
    
    updateData({
      interludePatterns: "I notice that my most creative insights come during transitions - walking between meetings, the quiet moments before sleep, or when I'm doing routine tasks like washing dishes. There's a pattern of creative sparks emerging when my analytical mind is occupied but not overwhelmed, creating space for intuitive connections to surface.",
      musePrompt: "What would it look like if I approached my work as a collaboration with creativity itself, rather than trying to force innovative solutions through pure effort?",
      museConversation: "Creativity whispers: 'Stop trying to control me and start dancing with me. Your best ideas come when you create spaciousness, not pressure. Trust the process of not-knowing, let questions breathe, and remain curious about what wants to emerge. I work through you when you stop trying to work so hard. Play more, trust more, and I'll show you possibilities you never could have planned.'",
      museName: "The Creative Flow"
    });
    
    console.log('IA 4-5 Content filled with demo inspiration support data');
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-purple-700 mb-8">
        Inspiration Support
      </h1>
      
      {/* Content Card */}
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
        <div className="prose prose-lg max-w-none text-gray-800 space-y-6">
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-200">
            <h3 className="text-xl font-semibold text-purple-800 mb-4">From Inspiration to Co-Creation</h3>
            <p className="text-lg text-purple-700">
              Deepen your relationship with the imaginative source behind your purpose.
            </p>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-yellow-800 mb-3">🎯 PURPOSE</h4>
            <p className="text-yellow-700">
              You rediscovered what sparks your imagination through moments of awe, art, movement, and stillness. Now, you go deeper: 
              to invite the Muse itself.
            </p>
            <p className="text-yellow-700 mt-2">
              This rung is not about output. It's about receptivity. The Muse may come as an image, phrase, figure, sound, or whisper. 
              It may come disguised as memory or metaphor. What matters is making space for it—and listening with courage.
            </p>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-blue-800 mb-4">📋 ACTIVITY</h4>
            
            <div className="space-y-6">
              {/* Step 1 */}
              <div className="border-l-4 border-purple-500 pl-4">
                <h5 className="font-semibold text-gray-800 mb-2">Step 1: Revisit Your Interlude Cluster</h5>
                <p className="text-gray-700 mb-3">
                  Look back at your three Interludes from earlier. What patterns did you notice? What do they reveal about how 
                  inspiration lives in you?
                </p>
                <Textarea
                  placeholder="Describe the patterns you noticed in your inspiration moments..."
                  value={data.interludePatterns}
                  onChange={(e) => updateData({ interludePatterns: e.target.value })}
                  className="w-full h-24"
                />
              </div>
              
              {/* Step 2 */}
              <div className="border-l-4 border-purple-500 pl-4">
                <h5 className="font-semibold text-gray-800 mb-2">Step 2: Open the Door to the Muse</h5>
                <p className="text-gray-700 mb-3">
                  Set a few minutes aside. Choose silence or soft instrumental sound. Then ask:<br/>
                  <em>"If I invited the Muse to appear now—not as fantasy, but as ally—what might show up?"</em>
                </p>
                <p className="text-gray-700 mb-3">
                  Now enter the prompt below and let AI help shape what arises.
                </p>
                <div className="bg-gray-50 border border-gray-300 rounded p-3 mb-3">
                  <p className="text-sm font-medium text-gray-800">Prompt AI:</p>
                  <p className="text-sm text-gray-600">
                    "If a Muse visited me now—based on my interludes, purpose, and path—what form might it take? What might it want to say?"
                  </p>
                </div>
                <Textarea
                  placeholder="Paste the AI's description of your Muse here..."
                  value={data.musePrompt}
                  onChange={(e) => updateData({ musePrompt: e.target.value })}
                  className="w-full h-24"
                />
              </div>
              
              {/* Step 3 */}
              <div className="border-l-4 border-purple-500 pl-4">
                <h5 className="font-semibold text-gray-800 mb-2">Step 3: Converse with the Muse</h5>
                <p className="text-gray-700 mb-3">
                  Take what came from the prompt, and respond.
                </p>
                <ul className="list-disc pl-6 mb-3 text-gray-700">
                  <li>What do you want to ask the Muse?</li>
                  <li>What emotions or images rise?</li>
                  <li>What might this Muse be guarding—or inviting?</li>
                </ul>
                <Textarea
                  placeholder="Record your conversation with the Muse - questions, responses, images, emotions..."
                  value={data.museConversation}
                  onChange={(e) => updateData({ museConversation: e.target.value })}
                  className="w-full h-32"
                />
              </div>
              
              {/* Step 4 */}
              <div className="border-l-4 border-purple-500 pl-4">
                <h5 className="font-semibold text-gray-800 mb-2">Step 4: Name the Muse (or Its Gift)</h5>
                <p className="text-gray-700 mb-3">
                  Give the Muse a name—or describe its essence. This helps crystallize the inner companion or current that may return later.
                </p>
                <Textarea
                  placeholder="Name your Muse or describe its essence..."
                  value={data.museName}
                  onChange={(e) => updateData({ museName: e.target.value })}
                  className="w-full h-20"
                />
              </div>
            </div>
          </div>
          
          {/* Reflection Box */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-purple-800 mb-3">✨ Reflection</h4>
            <p className="text-purple-700">
              The Muse is not separate from you—it is the creative force that flows through you when conditions are right. 
              By naming and acknowledging this presence, you strengthen your ability to access inspiration when you need it most.
            </p>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-4 justify-center">
            <Button 
              onClick={handleSaveInsight}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2"
              disabled={saving || !data.interludePatterns || !data.museName}
            >
              {saving ? 'Saving...' : 'Save Insight'}
            </Button>
            <Button 
              onClick={handleTryAnotherVisit}
              variant="outline"
              className="border-purple-300 text-purple-700 hover:bg-purple-50 px-6 py-2"
            >
              Try Another Visit
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
          onClick={() => onNext && onNext('ia-4-6')}
          className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg"
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Continue to Nothing is Unimaginable'}
        </Button>
      </div>
    </div>
  );
};

export default IA_4_5_Content;