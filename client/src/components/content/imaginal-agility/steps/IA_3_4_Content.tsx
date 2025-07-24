import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

interface IA34ContentProps {
  onNext?: (stepId: string) => void;
}

const IA_3_4_Content: React.FC<IA34ContentProps> = ({ onNext }) => {
  const [whyReflection, setWhyReflection] = useState('');
  const [howReflection, setHowReflection] = useState('');
  const [whatReflection, setWhatReflection] = useState('');
  const [nextStep, setNextStep] = useState('');
  const [saving, setSaving] = useState(false);

  // Handle save (simulate async save)
  const handleSave = async () => {
    setSaving(true);
    // Simulate save delay
    await new Promise((res) => setTimeout(res, 800));
    setSaving(false);
    if (onNext) onNext('ia-3-5');
  };

  // Check if form is complete
  const isFormComplete = whyReflection.trim() && howReflection.trim() && whatReflection.trim();

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
            value={whyReflection}
            onChange={e => setWhyReflection(e.target.value)}
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
            value={howReflection}
            onChange={e => setHowReflection(e.target.value)}
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
            value={whatReflection}
            onChange={e => setWhatReflection(e.target.value)}
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
          value={nextStep}
          onChange={e => setNextStep(e.target.value)}
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
      <div className="flex justify-end mt-8">
        <Button
          onClick={handleSave}
          className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg"
          disabled={saving || !isFormComplete}
        >
          {saving ? 'Saving...' : 'Save & Continue'}
        </Button>
      </div>
    </div>
  );
};

export default IA_3_4_Content;