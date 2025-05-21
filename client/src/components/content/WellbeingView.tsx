import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ContentViewProps } from '../../shared/types';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { ChevronRight } from 'lucide-react';

const WellbeingView: React.FC<ContentViewProps> = ({
  navigate,
  markStepCompleted,
  setCurrentContent
}) => {
  const [wellbeingLevel, setWellbeingLevel] = useState<number>(5);
  const [wellbeingFactors, setWellbeingFactors] = useState<string>('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    
    try {
      await apiRequest('/api/visualization', 'POST', {
        wellbeingLevel,
        wellbeingFactors
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/visualization'] });
      markStepCompleted('4-1');
      setCurrentContent('future-self');
    } catch (error) {
      console.error('Error saving wellbeing data:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">The Ladder of Wellbeing</h1>
      
      <div className="prose max-w-none mb-8">
        <p className="text-lg text-gray-700">
          Imagine a ladder with steps numbered from 0 at the bottom to 10 at the top, where the top 
          represents the best possible life for you, and the bottom represents the worst possible life.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 mb-8">
        <div className="md:w-1/2">
          <div className="aspect-w-16 aspect-h-9">
            <iframe 
              src="https://www.youtube.com/embed/IZtV2uLi72w" 
              title="Understanding Wellbeing" 
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
              className="w-full h-64 rounded border border-gray-200"
            ></iframe>
          </div>
          
          <div className="mt-6 space-y-6">
            <div className="bg-purple-50 p-6 rounded-lg border border-purple-100">
              <h3 className="text-lg font-medium text-purple-800 mb-2">Where do you stand today?</h3>
              <div className="space-y-4">
                <p className="text-gray-700 text-sm">
                  On which step of the ladder would you say you stand at this moment?
                </p>
                <div className="py-4">
                  <div className="flex justify-between mb-2 text-sm text-gray-600">
                    <span>Worst possible life (0)</span>
                    <span>Best possible life (10)</span>
                  </div>
                  <Slider
                    value={[wellbeingLevel]} 
                    min={0}
                    max={10}
                    step={1}
                    onValueChange={(values) => setWellbeingLevel(values[0])}
                    className="py-4"
                  />
                  <div className="text-center mt-2">
                    <span className="font-medium text-lg text-indigo-700">{wellbeingLevel}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="md:w-1/2 space-y-6">
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
            <h3 className="text-lg font-medium text-blue-800 mb-4">What influences your wellbeing?</h3>
            <p className="text-sm text-gray-700 mb-4">
              What factors most affect where you stand on the ladder? Consider both positive and negative influences.
            </p>
            <Textarea 
              placeholder="Examples: work satisfaction, relationships, health, personal growth..."
              value={wellbeingFactors}
              onChange={(e) => setWellbeingFactors(e.target.value)}
              className="min-h-[200px]"
            />
          </div>
          
          <div className="bg-amber-50 p-5 rounded-lg border border-amber-100">
            <h3 className="text-amber-800 font-medium mb-2">Why This Matters</h3>
            <p className="text-amber-700 text-sm">
              Understanding your current wellbeing helps establish a baseline for envisioning your future self. 
              In the next step, you'll explore what moving further up the ladder could look like for you.
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button 
          onClick={handleSave}
          disabled={saving}
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          {saving ? 'Saving...' : 'Continue'} <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </>
  );
};

export default WellbeingView;