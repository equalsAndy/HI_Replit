import React from 'react';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import { useTestUser } from '@/hooks/useTestUser';
import { useWorkshopStepData } from '@/hooks/useWorkshopStepData';
import { CapabilitySelector } from '@/components/ia/CapabilitySelector';
import { CapabilityType } from '@/lib/types';
import ScrollIndicator from '@/components/ui/ScrollIndicator';

interface IA34ContentProps {
  onNext?: (stepId: string) => void;
}

// Data structure for this step
interface IA34StepData {
  whyReflection: string;
  howReflection: string;
  whatReflection: string;
  nextStep: string;
  capability_activations?: CapabilityType[];
}

const IA_3_4_Content: React.FC<IA34ContentProps> = ({ onNext }) => {
  const { shouldShowDemoButtons } = useTestUser();
  
  // Initialize with empty data structure
  const initialData: IA34StepData = {
    whyReflection: '',
    howReflection: '',
    whatReflection: '',
    nextStep: '',
    capability_activations: []
  };
  
  // Use workshop step data persistence hook
  const {
    data,
    updateData,
    saving,
    loaded,
    error
  } = useWorkshopStepData('ia', 'ia-3-4', initialData);

  // Demo data function for test users
  const fillWithDemoData = () => {
    if (!shouldShowDemoButtons) {
      console.warn('Demo functionality only available to test users');
      return;
    }
    
    updateData({
      whyReflection: "I keep coming back to the gap between how organizations talk about innovation and how they actually make decisions. Too many teams default to incremental thinking when the problems they face require genuine imagination.",
      howReflection: "I'm in a position to influence how my team approaches complex problems — I lead our planning process and I have credibility with leadership. I also mentor two junior colleagues who are eager to think differently.",
      whatReflection: "I'd want them to say I helped the team get comfortable with uncertainty and that I brought creative approaches to problems everyone else was stuck on.",
      nextStep: "Block 30 minutes this week to map one current project challenge using a different thinking framework than we usually default to."
    });
    
    console.log('IA 3-4 Content filled with demo data');
  };

  // Handle save and navigation
  const handleSave = async () => {
    if (onNext) onNext('ia-3-5');
  };

  // Check if form is complete
  const isFormComplete = data.whyReflection.trim() && data.howReflection.trim() && data.whatReflection.trim() && data.nextStep.trim();

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Scroll Indicator - appears when user is idle */}
      <ScrollIndicator
        idleTime={3000}
        position="nav-adjacent"
        colorScheme="purple"
      />
      <h1 className="text-3xl font-bold text-purple-700 mb-8">
        From Insight to Intention
      </h1>
      
      {/* Rung 3 Graphic and Purpose Side by Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Rung 3 Graphic */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex justify-center">
            <img 
              src="/assets/Rung3.png" 
              alt="Rung 3: From Insight to Intention"
              className="w-full h-auto max-w-md mx-auto"
              style={{ maxHeight: '400px', objectFit: 'contain' }}
              onLoad={() => console.log('✅ Rung 3 graphic loaded successfully')}
              onError={(e) => {
                console.error('❌ Failed to load Rung 3 graphic');
                console.log('Image src:', e.currentTarget.src);
              }}
            />
          </div>
        </div>

        {/* Purpose Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 border border-purple-200">
          <div className="prose prose-lg max-w-none text-gray-800 space-y-6">
            <p className="text-lg leading-relaxed font-medium text-purple-700">
              PURPOSE:
            </p>
            <p className="text-lg leading-relaxed">
              You've been exploring your capabilities and visualizing who you are. Now let's give that direction. This is about naming what matters to you — in your work, your field, or the wider world — and where you're positioned to act on it.
            </p>
            <p className="text-lg leading-relaxed">
              In a later exercise, an AI will use what you write here to show you how your intention connects to something bigger than you expected. Be honest rather than aspirational — real answers produce better results than polished ones.
            </p>
          </div>
        </div>
      </div>

      {/* Purpose Discovery Framework */}
      <div className="bg-white rounded-xl shadow-lg p-8 border border-purple-200 mb-8">
        <h2 className="text-xl font-semibold text-purple-700 mb-6">Purpose Discovery Framework</h2>
        
        {/* WHY Section */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">WHY</h3>
          <p className="text-gray-700 mb-3 italic">
            What problem, question, or cause keeps pulling your attention — at work, in your field, or in the wider world?
          </p>
          <p className="text-xs text-gray-400 mb-2">
            e.g., &ldquo;Too many decisions in my field get made without the people affected&rdquo; or &ldquo;My students graduate technically skilled but not prepared for ambiguity&rdquo;
          </p>
          <textarea
            className="w-full border border-gray-300 rounded-lg p-4 text-gray-800 focus:ring-2 focus:ring-purple-400 focus:border-transparent"
            rows={3}
            value={data.whyReflection}
            onChange={e => updateData({ whyReflection: e.target.value })}
            placeholder="What keeps pulling your attention..."
          />
        </div>

        {/* HOW Section */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">HOW</h3>
          <p className="text-gray-700 mb-3 italic">
            Where are you positioned to make a difference — through your role, your skills, or the people you work with?
          </p>
          <p className="text-xs text-gray-400 mb-2">
            e.g., &ldquo;I run our team's planning process and have credibility with leadership&rdquo; or &ldquo;I teach three sections and advise the department chair&rdquo;
          </p>
          <textarea
            className="w-full border border-gray-300 rounded-lg p-4 text-gray-800 focus:ring-2 focus:ring-purple-400 focus:border-transparent"
            rows={3}
            value={data.howReflection}
            onChange={e => updateData({ howReflection: e.target.value })}
            placeholder="Where are you positioned to act on this..."
          />
        </div>

        {/* WHAT Section */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">WHAT</h3>
          <p className="text-gray-700 mb-3 italic">
            If colleagues described your impact a year from now, what would you want them to say?
          </p>
          <p className="text-xs text-gray-400 mb-2">
            e.g., &ldquo;She helped us get comfortable with not knowing the answer yet&rdquo; or &ldquo;He changed how we think about who we're building for&rdquo;
          </p>
          <textarea
            className="w-full border border-gray-300 rounded-lg p-4 text-gray-800 focus:ring-2 focus:ring-purple-400 focus:border-transparent"
            rows={3}
            value={data.whatReflection}
            onChange={e => updateData({ whatReflection: e.target.value })}
            placeholder="What would you want them to say about your impact..."
          />
        </div>
      </div>

      {/* Immediate Next Step */}
      <div className="bg-white rounded-xl shadow-lg p-8 border border-purple-200 mb-8">
        <h2 className="text-xl font-semibold text-purple-700 mb-4">Immediate Next Step</h2>
        <p className="text-gray-700 mb-4 italic">
          What's one small action you could take this week to move in that direction?
        </p>
        <textarea
          className="w-full border border-gray-300 rounded-lg p-4 text-gray-800 focus:ring-2 focus:ring-purple-400 focus:border-transparent"
          rows={2}
          value={data.nextStep}
          onChange={e => updateData({ nextStep: e.target.value })}
          placeholder="e.g., Block 30 minutes to map one challenge using a different approach than usual"
        />
      </div>

      {/* Capability Selector */}
      {isFormComplete && (
        <CapabilitySelector
          mode="dual"
          selected={data.capability_activations || []}
          onSelect={(val) => updateData({ capability_activations: val as CapabilityType[] })}
          prompt="You just applied your I4C capabilities. Which two felt strongest as you worked through this?"
          className="mb-8"
        />
      )}

      {/* Save & Next */}
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
          onClick={handleSave}
          className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg"
          disabled={saving || !isFormComplete || !data.capability_activations || data.capability_activations.length !== 2}
        >
          {saving ? 'Saving...' : 'Continue to Inspiration'}
        </Button>
      </div>
    </div>
  );
};

export default IA_3_4_Content;