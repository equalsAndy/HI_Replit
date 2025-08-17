import { useQuery } from '@tanstack/react-query';

interface PreviousExerciseData {
  [key: string]: any;
}

interface UsePreviousExerciseDataOptions {
  stepId: string;
  workshopType: 'ia' | 'ast';
}

/**
 * Hook to fetch data from previous exercise steps
 * This allows exercises to reference answers from earlier activities
 */
export const usePreviousExerciseData = ({ stepId, workshopType }: UsePreviousExerciseDataOptions) => {
  return useQuery<PreviousExerciseData | null>({
    queryKey: [`/api/workshop-data/${workshopType}-previous-data`, stepId],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/workshop-data/${workshopType}-previous-data?stepId=${stepId}`);
        if (!response.ok) {
          if (response.status === 404) {
            return null; // No previous data found
          }
          throw new Error(`Failed to fetch previous exercise data: ${response.statusText}`);
        }
        const data = await response.json();
        return data;
      } catch (error) {
        console.warn('Could not fetch previous exercise data:', error);
        return null; // Gracefully handle errors
      }
    },
    retry: false, // Don't retry since missing data is expected sometimes
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

/**
 * Hook specifically for fetching IA-3-3 visualization data for use in IA-4-3
 */
export const useVisualizationData = () => {
  return useQuery<{ reflection: string; imageTitle: string; selectedImage: string; uploadedImage: string } | null>({
    queryKey: ['/api/workshop-data/step/ia/ia-3-3'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/workshop-data/step/ia/ia-3-3');
        if (!response.ok) {
          if (response.status === 404) {
            return null;
          }
          throw new Error(`Failed to fetch IA-3-3 data: ${response.statusText}`);
        }
        const result = await response.json();
        // Extract the visualization data from the stored data
        if (result.success && result.data) {
          return {
            reflection: result.data.reflection || '',
            imageTitle: result.data.imageTitle || '',
            selectedImage: result.data.selectedImage || '',
            uploadedImage: result.data.uploadedImage || ''
          };
        }
        return null;
      } catch (error) {
        console.warn('Could not fetch IA-3-3 visualization data:', error);
        return null;
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook to fetch higher purpose data from previous exercises (for IA-4-4)
 * Could pull from multiple steps that explored purpose/meaning
 */
export const useHigherPurposeData = () => {
  return useQuery<{ purpose: string; source: string } | null>({
    queryKey: ['/api/workshop-data/ia-higher-purpose'],
    queryFn: async () => {
      try {
        // Check multiple potential sources for higher purpose data
        const potentialSources = ['ia-2-2', 'ia-3-4', 'ia-3-5', 'ia-3-6'];
        
        for (const stepId of potentialSources) {
          // IA-3-5 uses different endpoint format
          const endpoint = stepId === 'ia-3-5' 
            ? `/api/ia/steps/${stepId}` 
            : `/api/workshop-data/step/ia/${stepId}`;
          
          const response = await fetch(endpoint);
          if (response.ok) {
            const result = await response.json();
            
            // Handle different response formats
            const data = stepId === 'ia-3-5' ? result.data : (result.success ? result.data : null);
            
            if (data) {
              // Look for purpose-related fields in different exercises
              if (stepId === 'ia-2-2' && data?.higherPurpose) {
                return { purpose: data.higherPurpose, source: stepId };
              }
              if (stepId === 'ia-3-4' && (data?.whyReflection || data?.purposeReflection)) {
                return { purpose: data.whyReflection || data.purposeReflection, source: stepId };
              }
              if (stepId === 'ia-3-5' && data?.mission) {
                return { purpose: data.mission, source: stepId };
              }
              if (stepId === 'ia-3-6' && (data?.visionText || data?.coreIntention)) {
                return { purpose: data.visionText || data.coreIntention, source: stepId };
              }
            }
          }
        }
        
        return null;
      } catch (error) {
        console.warn('Could not fetch higher purpose data:', error);
        return null;
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook to fetch interlude/inspiration data from previous exercises (for IA-4-5)
 */
export const useInterludeData = () => {
  return useQuery<{ patterns: string[]; sources: string[] } | null>({
    queryKey: ['/api/workshop-data/ia-interludes'],
    queryFn: async () => {
      try {
        // Check steps that might contain interlude or inspiration data
        const potentialSources = ['ia-3-2', 'ia-3-3', 'ia-3-5'];
        const patterns: string[] = [];
        const sources: string[] = [];
        
        for (const stepId of potentialSources) {
          // IA-3-5 uses different endpoint format
          const endpoint = stepId === 'ia-3-5' 
            ? `/api/ia/steps/${stepId}` 
            : `/api/workshop-data/step/ia/${stepId}`;
          
          const response = await fetch(endpoint);
          if (response.ok) {
            const result = await response.json();
            
            // Handle different response formats
            const data = stepId === 'ia-3-5' ? result.data : result.data;
            
            if (data) {
              // Look for interlude-related fields
              if (stepId === 'ia-3-2' && data?.savedMoments) {
                const moments = Array.isArray(data.savedMoments) ? data.savedMoments : [];
                moments.forEach((moment: any) => {
                  if (moment.text) {
                    patterns.push(`${moment.tag || 'Inspiration'}: ${moment.text}`);
                    sources.push(stepId);
                  }
                });
              }
              if (stepId === 'ia-3-3' && data?.reflection) {
                patterns.push(`From visualization: "${data.reflection}"`);
                sources.push(stepId);
              }
              if (stepId === 'ia-3-5') {
                // IA-3-5 has multiple inspiration interludes
                if (data?.responses) {
                  Object.entries(data.responses).forEach(([key, value]: [string, any]) => {
                    if (value && typeof value === 'string') {
                      patterns.push(`${key}: ${value}`);
                      sources.push(stepId);
                    }
                  });
                }
              }
            }
          }
        }
        
        return patterns.length > 0 ? { patterns, sources } : null;
      } catch (error) {
        console.warn('Could not fetch interlude data:', error);
        return null;
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
};