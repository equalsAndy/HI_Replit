import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ContentViewProps } from '../../shared/types';
import { Slider } from '@/components/ui/slider';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { ChevronRight } from 'lucide-react';

const WellbeingView: React.FC<ContentViewProps> = ({
  navigate,
  markStepCompleted,
  setCurrentContent
}) => {
  const [wellbeingLevel, setWellbeingLevel] = useState<number>(5);
  const [futureWellbeingLevel, setFutureWellbeingLevel] = useState<number>(7);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    
    try {
      await apiRequest('/api/visualization', 'POST', {
        wellbeingLevel,
        futureWellbeingLevel,
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/visualization'] });
      markStepCompleted('4-1');
      setCurrentContent('cantril-ladder');
    } catch (error) {
      console.error('Error saving wellbeing data:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">The Cantril Ladder of Wellbeing</h1>
      
      <div className="prose max-w-none mb-6">
        <p className="text-lg text-gray-700">
          Using the Cantril Ladder (0 = worst possible life, 10 = best possible life), you'll identify where you stand now, where you aim 
          to be in one year, and the steps you'll take each quarter to climb toward that vision.
        </p>
      </div>
      
      <div className="mb-8">
        
        <div className="flex justify-center">
          <div className="flex max-w-3xl">
            {/* Visual ladder */}
            <div className="mr-10 relative">
              <div className="h-[400px] w-16 bg-gray-100 border border-gray-300 rounded-md relative">
                {/* Current position marker */}
                <div 
                  className="absolute left-0 w-full h-6 bg-blue-500 flex items-center justify-center text-white text-xs font-bold"
                  style={{ bottom: `${wellbeingLevel * 10}%` }}
                >
                  NOW
                </div>
                
                {/* Future position marker */}
                <div 
                  className="absolute left-0 w-full h-6 bg-green-500 flex items-center justify-center text-white text-xs font-bold"
                  style={{ bottom: `${futureWellbeingLevel * 10}%` }}
                >
                  GOAL
                </div>
                
                {/* Level numbers */}
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
                  <div 
                    key={level} 
                    className="absolute w-3 h-[1px] bg-gray-400 right-0"
                    style={{ bottom: `${level * 10}%` }}
                  >
                    <span className="absolute text-[10px] text-gray-600 right-4 transform -translate-y-1/2">
                      {level}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex-1 space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <h3 className="text-md font-medium text-blue-800 mb-2">Where are you now?</h3>
                <div className="space-y-3">
                  <p className="text-gray-700 text-sm">
                    On which step of the ladder would you say you stand today?
                  </p>
                  <div className="py-2">
                    <div className="flex justify-between mb-2 text-xs text-gray-600">
                      <span>Worst (0)</span>
                      <span>Best (10)</span>
                    </div>
                    <Slider
                      value={[wellbeingLevel]} 
                      min={0}
                      max={10}
                      step={1}
                      onValueChange={(values) => setWellbeingLevel(values[0])}
                      className="py-2"
                    />
                    <div className="text-center mt-1">
                      <span className="font-medium text-lg text-blue-700">{wellbeingLevel}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                <h3 className="text-md font-medium text-green-800 mb-2">Where do you want to be?</h3>
                <div className="space-y-3">
                  <p className="text-gray-700 text-sm">
                    Where would you realistically like to be in one year?
                  </p>
                  <div className="py-2">
                    <div className="flex justify-between mb-2 text-xs text-gray-600">
                      <span>Worst (0)</span>
                      <span>Best (10)</span>
                    </div>
                    <Slider
                      value={[futureWellbeingLevel]} 
                      min={0}
                      max={10}
                      step={1}
                      onValueChange={(values) => setFutureWellbeingLevel(values[0])}
                      className="py-2"
                    />
                    <div className="text-center mt-1">
                      <span className="font-medium text-lg text-green-700">{futureWellbeingLevel}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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