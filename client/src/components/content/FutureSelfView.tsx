import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ContentViewProps } from '../../shared/types';
import { Textarea } from '@/components/ui/textarea';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { ChevronRight } from 'lucide-react';
import { debounce } from '@/lib/utils';

// Placeholder for Hokusai images - will use CSS gradients instead
import VideoPlayer from './VideoPlayer';

const FutureSelfView: React.FC<ContentViewProps> = ({
  navigate,
  markStepCompleted,
  setCurrentContent,
  starCard
}) => {
  const [formData, setFormData] = useState({
    futureSelfDescription: '',
    visualizationNotes: '',
    additionalNotes: ''
  });

  // Load existing data when component mounts
  useEffect(() => {
    const loadExistingData = async () => {
      try {
        console.log('FutureSelfView: Loading existing data...');
        const response = await fetch('/api/workshop-data/future-self', {
          credentials: 'include'
        });
        const result = await response.json();
        
        console.log('FutureSelfView: API response:', result);
        
        if (result.success && result.data) {
          // Ensure all fields exist, even if not in saved data
          const loadedData = {
            futureSelfDescription: result.data.futureSelfDescription || '',
            visualizationNotes: result.data.visualizationNotes || '',
            additionalNotes: result.data.additionalNotes || ''
          };
          console.log('FutureSelfView: Setting form data:', loadedData);
          setFormData(loadedData);
        }
      } catch (error) {
        console.log('FutureSelfView: No existing data found:', error);
      }
    };
    
    loadExistingData();
  }, []);

  // Debounced save function
  const debouncedSave = useCallback(
    debounce(async (dataToSave) => {
      try {
        const response = await fetch('/api/workshop-data/future-self', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(dataToSave)
        });
        
        const result = await response.json();
        if (result.success) {
          console.log('Auto-saved successfully');
        }
      } catch (error) {
        console.error('Auto-save failed:', error);
      }
    }, 1000),
    []
  );

  // Trigger save whenever form data changes
  useEffect(() => {
    if (formData.futureSelfDescription || formData.visualizationNotes) {
      debouncedSave(formData);
    }
  }, [formData, debouncedSave]);

  // Handle input changes
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      markStepCompleted('4-4');
      setCurrentContent('your-statement');
    } catch (error) {
      console.error('Error completing future self reflection:', error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">Your Future Self</h1>

      <div className="mb-6 sm:mb-8">
        <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
          Take a few minutes to reflect on the future you're working toward. These questions will help you imagine your life over time — and the kind of person, teammate, and leader you want to become. There are no right answers. Just be honest and thoughtful.
        </p>
      </div>

      <div className="flex flex-col xl:grid xl:grid-cols-3 gap-6 lg:gap-8 mb-8">
        {/* Video Section */}
        <div className="xl:col-span-2">
          <VideoPlayer
            workshopType="allstarteams"
            stepId="4-4"
            autoplay={true}
          />

          <div>
            <p className="text-sm text-gray-700 mb-3">
              <span className="font-medium text-gray-900">Katsushika Hokusai</span> is a renowned Japanese ukiyo-e artist who lived during the 18th Century.
            </p>
            <blockquote className="text-xs sm:text-sm text-gray-800 italic border-l-4 border-indigo-200 pl-3 sm:pl-4 leading-relaxed">
              "From the age of 6 I had a mania for drawing the shapes of things. When I was 50 I had published a universe of designs. But all I have done before the the age of 70 is not worth bothering with. At 75 I'll have learned something of the pattern of nature, of animals, of plants, of trees, birds, fish and insects. When I am 80 you will see real progress. At 90 I shall have cut my way deeply into the mystery of life itself. At 100, I shall be a marvelous artist. At 110, everything I create; a dot, a line, will jump to life as never before.
              <br /><br />
              To all of you who are going to live as long as I do, I promise to keep my word. I am writing this in my old age. I used to call myself Hokusai, but today I sign my self 'The Old Man Mad About Drawing.'"
              <cite className="block mt-3 font-medium text-right not-italic text-xs sm:text-sm">— Hokusai Katsushika</cite>
            </blockquote>
          </div>
        </div>

        {/* Images Section */}
        <div className="xl:col-span-1">
          <div className="grid grid-cols-2 xl:grid-cols-1 gap-4">
            <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-blue-300 rounded-lg border border-gray-200 shadow-sm flex items-center justify-center">
              <div className="text-center text-blue-700">
                <div className="text-sm font-semibold">The Great Wave</div>
                <div className="text-xs">off Kanagawa by Hokusai</div>
              </div>
            </div>
            <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-300 rounded-lg border border-gray-200 shadow-sm flex items-center justify-center">
              <div className="text-center text-gray-700">
                <div className="text-sm font-semibold">Portrait of Hokusai</div>
                <div className="text-xs">Master Artist</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Purpose Section */}
      <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 mb-6">
        <h3 className="text-lg font-medium text-indigo-900 mb-2">Purpose</h3>
        <p className="text-sm text-indigo-800">
          This exercise honors every participant's infinite capacity for growth. Whether someone is 22 or 82, the focus remains on continuing evolution, deepening wisdom, and creating one's masterpiece. The most meaningful futures are not constrained by time but expanded by purpose.
        </p>
        <p className="text-sm text-indigo-800 mt-2">
          Remember Hokusai's wisdom - every decade brings new insight, sharper vision, and deeper connection to your life's work. The canvas of your future self has no boundaries.
        </p>
      </div>

      {/* Reflection Questions */}
      <div className="space-y-6 sm:space-y-8 mb-6 sm:mb-8">
        <div className="bg-white p-4 sm:p-6 rounded-lg border shadow-sm">
          <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-3 sm:mb-4 leading-tight">
            Where do you see yourself in 5, 10, and 20 years?
          </h3>
          <Textarea
            value={formData.futureSelfDescription}
            onChange={(e) => handleInputChange('futureSelfDescription', e.target.value)}
            placeholder="Describe your vision for your future self across these timeframes..."
            className="min-h-[100px] sm:min-h-[120px] text-sm sm:text-base"
          />
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-lg border shadow-sm">
          <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-3 sm:mb-4 leading-tight">
            What does your life look like when optimized for flow?
          </h3>
          <Textarea
            value={formData.visualizationNotes}
            onChange={(e) => handleInputChange('visualizationNotes', e.target.value)}
            placeholder="Imagine your ideal state of engagement and fulfillment..."
            className="min-h-[100px] sm:min-h-[120px] text-sm sm:text-base"
          />
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-lg border shadow-sm">
          <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-3 sm:mb-4 leading-tight">
            Additional Notes and Reflections
          </h3>
          <Textarea
            value={formData.additionalNotes}
            onChange={(e) => handleInputChange('additionalNotes', e.target.value)}
            placeholder="Add any additional thoughts about your future self visualization..."
            className="min-h-[100px] sm:min-h-[120px] text-sm sm:text-base"
          />
        </div>
      </div>

      {/* Next Button */}
      <div className="flex justify-center sm:justify-end pb-4 sm:pb-0">
        <Button 
          onClick={handleSubmit}
          className="bg-indigo-600 hover:bg-indigo-700 text-white w-full sm:w-auto"
          size="lg"
        >
          <span className="text-sm sm:text-base">Next: Final Reflection</span>
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default FutureSelfView;