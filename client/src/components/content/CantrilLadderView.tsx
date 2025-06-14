import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight } from 'lucide-react';
import WellBeingLadderSvg from '../visualization/WellBeingLadderSvg';
import { debounce } from '@/lib/utils';

// Props interface
interface ContentViewProps {
  navigate: (path: string) => void;
  markStepCompleted: (stepId: string) => void;
  setCurrentContent: (content: string) => void;
}

const CantrilLadderView: React.FC<ContentViewProps> = ({
  navigate,
  markStepCompleted,
  setCurrentContent
}) => {
  // READ-ONLY values loaded from visualization data (set in step 4-1)
  const [wellBeingLevel, setWellBeingLevel] = useState<number>(5);
  const [futureWellBeingLevel, setFutureWellBeingLevel] = useState<number>(5);
  const [formData, setFormData] = useState({
    currentFactors: '',
    futureImprovements: '',
    specificChanges: '',
    quarterlyProgress: '',
    quarterlyActions: ''
  });

  // Fetch user's actual wellbeing data from the visualization API
  const { data: visualizationData } = useQuery({
    queryKey: ['/api/visualization'],
    staleTime: 0
  });

  // Fetch assessment data to load saved ladder values
  const { data: userAssessments } = useQuery({
    queryKey: ['/api/user/assessments'],
    staleTime: 0
  });

  // Load persisted values from assessment data first, then visualization API as fallback
  useEffect(() => {
    let ladderLoaded = false;
    
    // Try to load from assessment data first (highest priority)
    if (userAssessments && typeof userAssessments === 'object') {
      const assessmentData = userAssessments as Record<string, any>;
      const cantrilData = assessmentData.cantrilLadder || assessmentData.assessments?.cantrilLadder;
      
      if (cantrilData && cantrilData.wellBeingLevel !== undefined && cantrilData.futureWellBeingLevel !== undefined) {
        console.log('CantrilLadder: Loading from assessment data:', cantrilData);
        setWellBeingLevel(cantrilData.wellBeingLevel);
        setFutureWellBeingLevel(cantrilData.futureWellBeingLevel);
        ladderLoaded = true;
      }
    }
    
    // Fallback to visualization API if no assessment data found
    if (!ladderLoaded && visualizationData) {
      const data = visualizationData as any;
      
      if (data && data.wellBeingLevel !== undefined) {
        setWellBeingLevel(data.wellBeingLevel);
      } else {
        setWellBeingLevel(5); // Default value
      }
      
      if (data && data.futureWellBeingLevel !== undefined) {
        setFutureWellBeingLevel(data.futureWellBeingLevel);
      } else {
        setFutureWellBeingLevel(5); // Default value
      }
      
      console.log('CantrilLadder: Loading from visualization data:', data?.wellBeingLevel || 5, data?.futureWellBeingLevel || 5);
    }
    
    // If no data found anywhere, use defaults
    if (!ladderLoaded && !visualizationData) {
      setWellBeingLevel(5);
      setFutureWellBeingLevel(5);
      console.log('CantrilLadder: Using default values (5, 5)');
    }
  }, [visualizationData, userAssessments]);

  // Load existing text data when component mounts
  useEffect(() => {
    const loadExistingData = async () => {
      try {
        console.log('CantrilLadderView: Loading existing data...');
        const response = await fetch('/api/workshop-data/cantril-ladder', {
          credentials: 'include'
        });
        const result = await response.json();
        console.log('CantrilLadderView: API response:', result);
        
        if (result.success && result.data) {
          console.log('CantrilLadderView: Setting form data:', result.data);
          setFormData(result.data);
        } else {
          console.log('CantrilLadderView: No existing data found or API failed');
        }
      } catch (error) {
        console.log('CantrilLadderView: Error loading data:', error);
      }
    };
    
    loadExistingData();
  }, []);

  // Debounced save function for text inputs only (ladder values are READ-ONLY from step 4-1)
  const debouncedSave = useCallback(
    debounce(async (dataToSave) => {
      try {
        const response = await fetch('/api/workshop-data/cantril-ladder', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            ...dataToSave
            // DO NOT include ladder values - they are read-only from step 4-1
          })
        });
        
        const result = await response.json();
        if (result.success) {
          console.log('Cantril Ladder reflections auto-saved successfully');
        }
      } catch (error) {
        console.error('Cantril Ladder auto-save failed:', error);
      }
    }, 1000),
    [] // No dependencies on ladder values since they're read-only
  );

  // Trigger save only when form data changes (NOT ladder values)
  useEffect(() => {
    if (Object.values(formData).some(value => value && typeof value === 'string' && value.trim().length > 0)) {
      console.log('Cantril Ladder reflections changed, triggering save:', formData);
      debouncedSave(formData);
    }
  }, [formData, debouncedSave]);

  // Handle text input changes
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  return (
    <>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Cantril Ladder Well-being Reflections</h1>

      {/* Content below title - same layout as WellBeingView */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        {/* SVG Ladder - same sizing as WellBeingView */}
        <div className="lg:col-span-5 xl:col-span-6 2xl:col-span-7 flex justify-center">
          <div className="w-full xl:w-11/12 2xl:w-full">
            <WellBeingLadderSvg 
              currentValue={wellBeingLevel}
              futureValue={futureWellBeingLevel}
            />
          </div>
        </div>

        {/* Reflections section - positioned like sliders section in WellBeingView */}
        <div className="lg:col-span-7 xl:col-span-6 2xl:col-span-5 space-y-6">
          {/* READ-ONLY display of wellbeing levels set in step 4-1 */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="text-md font-medium text-blue-800 mb-4">Your Well-being Levels (Set in Step 4-1)</h3>
            
            <div className="space-y-4">
              <div className="bg-white p-3 rounded border">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Well-being Level:
                </label>
                <div className="text-2xl font-bold text-blue-600">Level {wellBeingLevel}</div>
              </div>
              
              <div className="bg-white p-3 rounded border">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Future Well-being Level (1 year):
                </label>
                <div className="text-2xl font-bold text-green-600">Level {futureWellBeingLevel}</div>
              </div>
              
              <p className="text-sm text-blue-600 italic">
                These values were set in step 4-1 and cannot be changed here.
              </p>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <h3 className="text-md font-medium text-blue-800 mb-2">What factors shape your current rating?</h3>
            <p className="text-gray-700 text-sm mb-2">
              What are the main elements contributing to your current well-being?
            </p>
            <textarea 
              value={formData.currentFactors}
              onChange={(e) => handleInputChange('currentFactors', e.target.value)}
              className="min-h-[120px] w-full p-2 border border-gray-300 rounded-md"
              placeholder="Consider your work, relationships, health, finances, and personal growth..."
            />
          </div>

          <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
            <h3 className="text-md font-medium text-indigo-800 mb-2">What improvements do you envision?</h3>
            <p className="text-indigo-600 text-sm mb-2">
              What achievements or changes would make your life better in one year?
            </p>
            <textarea 
              value={formData.futureImprovements}
              onChange={(e) => handleInputChange('futureImprovements', e.target.value)}
              className="min-h-[120px] w-full p-2 border border-gray-300 rounded-md"
              placeholder="Describe specific improvements you hope to see in your life..."
            />

            {/* Specific Changes section moved under improvements */}
            <div className="mt-6">
              <h4 className="font-medium text-indigo-700 mb-2">What will be different?</h4>
              <p className="text-indigo-600 text-sm mb-2">
                How will your experience be noticeably different in tangible ways?
              </p>
              <textarea 
                value={formData.specificChanges}
                onChange={(e) => handleInputChange('specificChanges', e.target.value)}
                className="min-h-[120px] w-full p-2 border border-gray-300 rounded-md"
                placeholder="Describe concrete changes you'll experience..."
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-purple-50 p-6 rounded-lg border border-purple-100 mb-8">
        <h3 className="text-lg font-semibold text-purple-800 mb-4">QUARTERLY MILESTONES</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-purple-900 mb-2">What progress would you expect in 3 months?</h4>
            <p className="text-sm text-purple-600 mb-2">
              Name one specific indicator that you're moving up the ladder.
            </p>
            <textarea 
              value={formData.quarterlyProgress}
              onChange={(e) => handleInputChange('quarterlyProgress', e.target.value)}
              className="min-h-[120px] w-full p-2 border border-gray-300 rounded-md"
              placeholder="Describe a measurable sign of progress..."
            />
          </div>
          <div>
            <h4 className="font-medium text-purple-900 mb-2">What actions will you commit to this quarter?</h4>
            <p className="text-sm text-purple-600 mb-2">
              Name 1-2 concrete steps you'll take before your first quarterly check-in.
            </p>
            <textarea 
              value={formData.quarterlyActions}
              onChange={(e) => handleInputChange('quarterlyActions', e.target.value)}
              className="min-h-[120px] w-full p-2 border border-gray-300 rounded-md"
              placeholder="Describe specific actions you'll take..."
            />
          </div>
        </div>
      </div>

      <div className="bg-amber-50 p-6 rounded-lg border border-amber-100 mb-8">
        <h3 className="text-amber-800 font-medium mb-3">Interpreting Your Position on the Ladder</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="bg-white bg-opacity-60 p-4 rounded-md border border-amber-100">
            <h4 className="font-medium text-amber-800 mb-2">Steps 0-4: Struggling</h4>
            <p className="text-sm text-amber-700">
              People in this range typically report high levels of worry, sadness, stress, and pain.
              Daily challenges may feel overwhelming, and hope for the future may be limited.
            </p>
          </div>
          <div className="bg-white bg-opacity-60 p-4 rounded-md border border-amber-100">
            <h4 className="font-medium text-amber-800 mb-2">Steps 5-6: Getting By</h4>
            <p className="text-sm text-amber-700">
              This middle range represents moderate satisfaction with life. You likely have some 
              important needs met but still face significant challenges or unfulfilled aspirations.
            </p>
          </div>
          <div className="bg-white bg-opacity-60 p-4 rounded-md border border-amber-100">
            <h4 className="font-medium text-amber-800 mb-2">Steps 7-10: Thriving</h4>
            <p className="text-sm text-amber-700">
              People in this range report high life satisfaction, with most basic needs met. 
              They typically experience a sense of purpose, strong social connections, and optimism.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button 
          onClick={() => {
            markStepCompleted('4-2');
            setCurrentContent("visualizing-you");
          }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          Next: Visualizing You <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </>
  );
};

export default CantrilLadderView;