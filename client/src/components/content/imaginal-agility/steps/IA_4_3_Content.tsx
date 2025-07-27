import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { FileText } from 'lucide-react';
import { useTestUser } from '@/hooks/useTestUser';
import { useWorkshopStepData } from '@/hooks/useWorkshopStepData';

interface IA_4_3_ContentProps {
  onNext?: (nextStepId: string) => void;
}

// Data structure for this step
interface IA43StepData {
  currentFrame: string;
  aiStretch: string;
  stretchVision: string;
  resistance: string;
  stretchName: string;
}

const IA_4_3_Content: React.FC<IA_4_3_ContentProps> = ({ onNext }) => {
  const { shouldShowDemoButtons } = useTestUser();
  
  // Initialize with empty data structure
  const initialData: IA43StepData = {
    currentFrame: '',
    aiStretch: '',
    stretchVision: '',
    resistance: '',
    stretchName: ''
  };
  
  // Use the new persistence hook
  const { data, updateData, saving, loaded, error } = useWorkshopStepData(
    'ia',
    'ia-4-3',
    initialData
  );

  const handleSaveInsight = () => {
    // Data is already being auto-saved via the hook
    console.log('Insight data saved:', data);
  };

  const handleTryAnotherStretch = () => {
    // Clear the form for another try
    updateData({
      currentFrame: '',
      aiStretch: '',
      stretchVision: '',
      resistance: '',
      stretchName: ''
    });
  };

  // Demo data function for test users
  const fillWithDemoData = () => {
    if (!shouldShowDemoButtons) {
      console.warn('Demo functionality only available to test users');
      return;
    }
    
    updateData({
      currentFrame: "I see myself as a skilled professional in my current role, contributing to my team and getting work done efficiently. I'm competent but staying within familiar boundaries.",
      aiStretch: "What if you imagined yourself not just as a professional, but as a catalyst for transformation in your entire industry? Picture yourself three roles beyond your current one - perhaps leading a team that solvers problems no one has even identified yet. What if your unique perspective could reshape how your field approaches its biggest challenges? Consider yourself as someone who bridges gaps between disciplines, creating entirely new ways of working that others will study and adopt.",
      stretchVision: "I envision myself as an innovation architect who doesn't just work within my industry but actively reshapes it. I see myself leading cross-functional teams that tackle complex global challenges, using my unique combination of skills to create solutions that span multiple domains. I'm facilitating conversations between unlikely collaborators and designing systems that others will build upon for decades.",
      resistance: "identity-attachment",
      stretchName: "Boundary Transcender"
    });
    
    console.log('IA 4-3 Content filled with demo visualization stretch data');
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
                  value={data.currentFrame}
                  onChange={(e) => updateData({ currentFrame: e.target.value })}
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
                  value={data.aiStretch}
                  onChange={(e) => updateData({ aiStretch: e.target.value })}
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
                  value={data.stretchVision}
                  onChange={(e) => updateData({ stretchVision: e.target.value })}
                  className="w-full h-24"
                />
              </div>
              
              {/* Step 4 */}
              <div className="border-l-4 border-purple-500 pl-4">
                <h5 className="font-semibold text-gray-800 mb-2">Step 4: Identify the Resistance</h5>
                <p className="text-gray-700 mb-3">
                  What's holding you back from stretching into this expanded role? Choose one:
                </p>
                <Select value={data.resistance} onValueChange={(value) => updateData({ resistance: value })}>
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
                  value={data.stretchName}
                  onChange={(e) => updateData({ stretchName: e.target.value })}
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
              disabled={saving || !data.currentFrame || !data.stretchName}
            >
              {saving ? 'Saving...' : 'Save Insight'}
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
          onClick={() => onNext && onNext('ia-4-4')}
          className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg"
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Continue to Higher Purpose Uplift'}
        </Button>
      </div>
    </div>
  );
};

export default IA_4_3_Content;