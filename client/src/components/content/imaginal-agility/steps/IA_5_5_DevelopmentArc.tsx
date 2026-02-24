import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useWorkshopStepData } from '@/hooks/useWorkshopStepData';
import ScrollIndicator from '@/components/ui/ScrollIndicator';

interface IA55ContentProps {
  onNext?: (stepId: string) => void;
}

interface IA55StepData {
  closing_reflection: string;
  workshop_completed_at: string;
}

const INITIAL_DATA: IA55StepData = {
  closing_reflection: '',
  workshop_completed_at: '',
};

const IA_5_5_DevelopmentArc: React.FC<IA55ContentProps> = ({ onNext }) => {
  const { data, updateData, saving } = useWorkshopStepData<IA55StepData>(
    'ia',
    'ia-5-5',
    INITIAL_DATA,
    { debounceMs: 1500, enableAutoSave: true }
  );

  const handleComplete = () => {
    updateData({ workshop_completed_at: new Date().toISOString() });
    // Mark ia-5-5 as completed so modules 6 & 7 unlock
    if (onNext) onNext('ia-6-1');
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <ScrollIndicator idleTime={3000} position="nav-adjacent" colorScheme="purple" />

      <h1 className="text-3xl font-bold text-purple-700 mb-2">Your Development Path</h1>
      <p className="text-lg text-muted-foreground mb-6">Sustained agency with AI emerges from structured practice, intentional commitment, and monthly signal refinement.</p>

      {/* Hero Image */}
      <div className="mb-8 flex justify-center">
        <img
          src="/assets/Dev_path1.jpg"
          alt="Development Path"
          className="w-1/2 rounded-xl shadow-md"
        />
      </div>

      {/* The Repeatable Structure — component-built cycle diagram */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-8 border border-purple-200 mb-6">
        <h3 className="text-lg font-semibold text-purple-800 mb-6 text-center">The Repeatable Structure</h3>
        <div className="flex flex-col md:flex-row items-center justify-center gap-4">
          <div className="bg-white border-2 border-purple-300 rounded-xl px-6 py-4 text-center min-w-[120px]">
            <div className="text-lg font-bold text-purple-700">MAP</div>
            <div className="text-sm text-gray-600">your pattern</div>
          </div>
          <span className="text-2xl text-purple-400 hidden md:block">→</span>
          <span className="text-2xl text-purple-400 md:hidden">↓</span>
          <div className="bg-white border-2 border-purple-300 rounded-xl px-6 py-4 text-center min-w-[120px]">
            <div className="text-lg font-bold text-purple-700">COMMIT</div>
            <div className="text-sm text-gray-600">to practice</div>
          </div>
          <span className="text-2xl text-purple-400 hidden md:block">→</span>
          <span className="text-2xl text-purple-400 md:hidden">↓</span>
          <div className="bg-white border-2 border-purple-300 rounded-xl px-6 py-4 text-center min-w-[120px]">
            <div className="text-lg font-bold text-purple-700">SIGNAL</div>
            <div className="text-sm text-gray-600">monthly</div>
          </div>
        </div>
        <div className="text-center mt-4">
          <span className="text-sm text-purple-500">↻ repeat</span>
        </div>
        <p className="text-center text-gray-700 mt-4 text-sm">
          This cycle strengthens clearer self-awareness, stronger follow-through, better alignment between
          intention and action, more thoughtful use of AI, and greater imaginative range.
        </p>
      </div>

      {/* Closing Reflection */}
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200 mb-8">
        <p className="text-sm font-semibold text-gray-700 mb-2">
          What's one thing you'll take from this experience?
        </p>
        <Textarea
          rows={2}
          placeholder="I'm taking with me..."
          value={data.closing_reflection}
          onChange={(e) => updateData({ closing_reflection: e.target.value })}
          className="border-gray-200 focus:border-purple-400"
        />
      </div>

      {/* Workshop Completion */}
      {!data.workshop_completed_at ? (
        <div className="text-center mt-8">
          <Button
            onClick={handleComplete}
            disabled={saving}
            className="bg-purple-600 hover:bg-purple-700 text-white px-10 py-4 text-xl font-semibold rounded-xl shadow-lg"
          >
            🎉 Complete Imaginal Agility Workshop
          </Button>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-purple-100 to-indigo-100 rounded-xl p-8 border border-purple-300 text-center mt-8">
          <div className="text-4xl mb-4">✨</div>
          <h3 className="text-2xl font-bold text-purple-800 mb-3">Congratulations</h3>
          <p className="text-lg text-purple-700">
            You've completed the Imaginal Agility microcourse.
          </p>
          <p className="text-purple-600 mt-2">
            Your development arc is now active. Stay with it.
          </p>
        </div>
      )}
    </div>
  );
};

export default IA_5_5_DevelopmentArc;
