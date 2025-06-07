import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ContentViewProps } from '../../shared/types';
import { Slider } from '@/components/ui/slider';
import { queryClient } from '@/lib/queryClient';
import { ChevronRight } from 'lucide-react';
import WellBeingLadderSvg from '../visualization/WellBeingLadderSvg';
import VideoPlayer from './VideoPlayer';
import { useQuery } from '@tanstack/react-query';

const WellBeingView: React.FC<ContentViewProps> = ({
  navigate,
  markStepCompleted,
  setCurrentContent
}) => {
  const [wellBeingLevel, setWellBeingLevel] = useState<number>(5);
  const [futureWellBeingLevel, setFutureWellBeingLevel] = useState<number>(5);
  const [saving, setSaving] = useState(false);

  // Load existing visualization data
  const { data: visualizationData } = useQuery({
    queryKey: ['/api/visualization']
  });

  // Load saved values on component mount
  useEffect(() => {
    if (visualizationData && typeof visualizationData === 'object') {
      const data = visualizationData as any;
      if (data.wellBeingLevel !== undefined) {
        setWellBeingLevel(data.wellBeingLevel);
        console.log('WellbeingView: Loaded current wellbeing level:', data.wellBeingLevel);
      }
      if (data.futureWellBeingLevel !== undefined) {
        setFutureWellBeingLevel(data.futureWellBeingLevel);
        console.log('WellbeingView: Loaded future wellbeing level:', data.futureWellBeingLevel);
      }
    }
  }, [visualizationData]);

  // Auto-save function with timeout
  const autoSave = useCallback(async (currentLevel: number, futureLevel: number) => {
    try {
      console.log('WellbeingView: Auto-saving ladder values:', { currentLevel, futureLevel });
      
      // Save to visualization API
      await fetch('/api/visualization', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          wellBeingLevel: currentLevel,
          futureWellBeingLevel: futureLevel,
        })
      });

      // Also save to assessments for data export
      await fetch('/api/workshop-data/cantril-ladder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          wellBeingLevel: currentLevel,
          futureWellBeingLevel: futureLevel
        })
      });

      queryClient.invalidateQueries({ queryKey: ['/api/visualization'] });
      console.log('WellbeingView: Auto-save successful');
    } catch (error) {
      console.error('WellbeingView: Auto-save failed:', error);
    }
  }, []);

  // Auto-save when values change with debounce
  useEffect(() => {
    if (wellBeingLevel !== 5 || futureWellBeingLevel !== 5) {
      const timeoutId = setTimeout(() => {
        autoSave(wellBeingLevel, futureWellBeingLevel);
      }, 1000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [wellBeingLevel, futureWellBeingLevel, autoSave]);

  const handleSave = async () => {
    setSaving(true);

    try {
      await fetch('/api/visualization', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          wellBeingLevel,
          futureWellBeingLevel,
        })
      });

      queryClient.invalidateQueries({ queryKey: ['/api/visualization'] });
      markStepCompleted('4-1');
      setCurrentContent('cantril-ladder');
    } catch (error) {
      console.error('Error saving well-being data:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">The Cantril Ladder of Well-Being</h1>

      <div className="mb-8">
        <div className="mb-8">
          <VideoPlayer
            workshopType="allstarteams"
            stepId="4-1"
            autoplay={true}
          />
        </div>

        <div className="prose max-w-none mb-6">
          <p className="text-lg text-gray-700">
            Using the Cantril Ladder (0 = worst possible life, 10 = best possible life), you'll identify where you stand now, where you aim 
            to be in one year, and the steps you'll take each quarter to climb toward that vision.
          </p>
        </div>

        <div className="flex justify-center">
          <div className="flex flex-col md:flex-row max-w-4xl w-full">
            {/* SVG Ladder */}
            <div className="md:w-1/2">
              <WellBeingLadderSvg 
                currentValue={wellBeingLevel}
                futureValue={futureWellBeingLevel}
              />
            </div>

            <div className="flex-1 space-y-6 md:ml-6">
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
                      value={[wellBeingLevel]} 
                      min={0}
                      max={10}
                      step={1}
                      onValueChange={(values) => setWellBeingLevel(values[0])}
                      className="py-2"
                    />
                    <div className="text-center mt-1">
                      <span className="font-medium text-lg text-blue-700">{wellBeingLevel}</span>
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
                      value={[futureWellBeingLevel]} 
                      min={0}
                      max={10}
                      step={1}
                      onValueChange={(values) => setFutureWellBeingLevel(values[0])}
                      className="py-2"
                    />
                    <div className="text-center mt-1">
                      <span className="font-medium text-lg text-green-700">{futureWellBeingLevel}</span>
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
          {saving ? 'Saving...' : 'Next: Well-being Reflections'} <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </>
  );
};

export default WellBeingView;