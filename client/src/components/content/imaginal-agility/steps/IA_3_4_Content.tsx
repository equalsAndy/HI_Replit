import React from 'react';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import { useTestUser } from '@/hooks/useTestUser';
import { useWorkshopStepData } from '@/hooks/useWorkshopStepData';

interface IA34ContentProps {
  onNext?: (stepId: string) => void;
}

// Data structure for this step
interface IA34StepData {
  whyReflection: string;
  howReflection: string;
  whatReflection: string;
  nextStep: string;
}

const IA_3_4_Content: React.FC<IA34ContentProps> = ({ onNext }) => {
  const { shouldShowDemoButtons } = useTestUser();
  
  // Initialize with empty data structure
  const initialData: IA34StepData = {
    whyReflection: '',
    howReflection: '',
    whatReflection: '',
    nextStep: ''
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
      whyReflection: "I want to develop my imagination because I believe it's the key to solving complex problems in my work and creating meaningful innovations. In a world increasingly dominated by AI, my unique human capacity for imaginative thinking gives me purpose and keeps me engaged with challenges that matter.",
      howReflection: "I'll practice daily visualization exercises, engage in creative brainstorming sessions with my team, and regularly challenge myself to think beyond conventional solutions. I'll also seek out diverse perspectives and experiences that stretch my thinking patterns and expand my creative capacity.",
      whatReflection: "I envision myself as someone who consistently generates breakthrough ideas, helps others see new possibilities, and creates value through imaginative solutions. I want to be known as a creative problem-solver who brings fresh perspectives to every challenge and inspires others to think differently.",
      nextStep: "I'll start by dedicating 15 minutes each morning to imagination exercises, join a creative thinking group in my organization, and commit to proposing at least one innovative solution each month for the challenges I encounter in my work."
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
      <h1 className="text-3xl font-bold text-purple-700 mb-8">
        From Insight to Intention
      </h1>
      
      {/* Introduction Card */}
      <div className="bg-white rounded-xl shadow-lg p-8 border border-purple-200 mb-8">
        <div className="prose prose-lg max-w-none text-gray-800 space-y-6">
          <p className="text-lg leading-relaxed font-medium text-purple-700">
            PURPOSE:
          </p>
          <p className="text-lg leading-relaxed">
            This exercise transforms your potential vision of yourself worth growing into. Now, let's explore where that vision might be pointing. Reflect on your I4C Radar Map and the capacities you're developing.
          </p>
          <p className="text-lg leading-relaxed">
            This is the moment to give your vision direction — by identifying a purpose that matters to you. It might be something new, or something you're already part of.
          </p>
          <p className="text-lg leading-relaxed font-medium text-purple-700">
            Either way, this rung on the Ladder is a chance to reflect, renew, or begin.
          </p>
        </div>
      </div>

      {/* Purpose Discovery Framework */}
      <div className="bg-white rounded-xl shadow-lg p-8 border border-purple-200 mb-8">
        <h2 className="text-xl font-semibold text-purple-700 mb-6">Purpose Discovery Framework</h2>
        
        {/* WHY Section */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">WHY</h3>
          <p className="text-gray-700 mb-3 italic">
            What do you care about deeply? What future would you like to help shape?
          </p>
          <label className="block mb-2 text-gray-700 font-medium text-sm">
            Who are your heroes? What are your ideals?
          </label>
          <textarea
            className="w-full border border-gray-300 rounded-lg p-4 text-gray-800 focus:ring-2 focus:ring-purple-400 focus:border-transparent"
            rows={3}
            value={data.whyReflection}
            onChange={e => updateData({ whyReflection: e.target.value })}
            placeholder="Reflect on what you care about deeply..."
          />
        </div>

        {/* HOW Section */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">HOW</h3>
          <p className="text-gray-700 mb-3 italic">
            How will you move toward that future?
          </p>
          <label className="block mb-2 text-gray-700 font-medium text-sm">
            What do you do to bring that to life — habits, skills, or ways of showing up?
          </label>
          <textarea
            className="w-full border border-gray-300 rounded-lg p-4 text-gray-800 focus:ring-2 focus:ring-purple-400 focus:border-transparent"
            rows={3}
            value={data.howReflection}
            onChange={e => updateData({ howReflection: e.target.value })}
            placeholder="Describe your approach and methods..."
          />
        </div>

        {/* WHAT Section */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">WHAT</h3>
          <p className="text-gray-700 mb-3 italic">
            What might a first step look like?
          </p>
          <label className="block mb-2 text-gray-700 font-medium text-sm">
            How does this align with the person you're becoming?
          </label>
          <textarea
            className="w-full border border-gray-300 rounded-lg p-4 text-gray-800 focus:ring-2 focus:ring-purple-400 focus:border-transparent"
            rows={3}
            value={data.whatReflection}
            onChange={e => updateData({ whatReflection: e.target.value })}
            placeholder="Outline your first step and alignment..."
          />
        </div>
      </div>

      {/* Immediate Next Step */}
      <div className="bg-white rounded-xl shadow-lg p-8 border border-purple-200 mb-8">
        <h2 className="text-xl font-semibold text-purple-700 mb-4">Immediate Next Step</h2>
        <p className="text-gray-700 mb-4 italic">
          Identify one immediate practical next step this week, small or big.
        </p>
        <textarea
          className="w-full border border-gray-300 rounded-lg p-4 text-gray-800 focus:ring-2 focus:ring-purple-400 focus:border-transparent"
          rows={2}
          value={data.nextStep}
          onChange={e => updateData({ nextStep: e.target.value })}
          placeholder="What's one concrete step you can take this week?"
        />
      </div>

      {/* I4C In Action Recognition */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-8 border border-purple-200 mb-8">
        <h2 className="text-xl font-semibold text-purple-700 mb-4">Your I4C In Action</h2>
        <p className="text-gray-700 leading-relaxed">
          <strong>Kudos!</strong> You may not have noticed, but you've applied your unique I4C skillset. By clarifying your Higher Purpose and choosing a next step, you've already applied <strong>imagination, curiosity, caring, creativity and courage</strong>. That's Imaginal Agility in action!
        </p>
      </div>

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
          disabled={saving || !isFormComplete}
        >
          {saving ? 'Saving...' : 'Continue to Inspiration'}
        </Button>
      </div>
    </div>
  );
};

export default IA_3_4_Content;