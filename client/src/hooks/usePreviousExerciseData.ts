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
  return useQuery<{ reflection: string; imageTitle: string } | null>({
    queryKey: ['/api/workshop-data/ia-3-3'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/workshop-data/ia-3-3');
        if (!response.ok) {
          if (response.status === 404) {
            return null;
          }
          throw new Error(`Failed to fetch IA-3-3 data: ${response.statusText}`);
        }
        const result = await response.json();
        // Extract the reflection and imageTitle from the stored data
        return {
          reflection: result.data?.reflection || '',
          imageTitle: result.data?.imageTitle || ''
        };
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
          const response = await fetch(`/api/workshop-data/${stepId}`);
          if (response.ok) {
            const result = await response.json();
            const data = result.data;
            
            // Look for purpose-related fields in different exercises
            if (stepId === 'ia-2-2' && data?.higherPurpose) {
              return { purpose: data.higherPurpose, source: stepId };
            }
            if (stepId === 'ia-3-4' && data?.purposeReflection) {
              return { purpose: data.purposeReflection, source: stepId };
            }
            if (stepId === 'ia-3-5' && data?.mission) {
              return { purpose: data.mission, source: stepId };
            }
            if (stepId === 'ia-3-6' && data?.coreIntention) {
              return { purpose: data.coreIntention, source: stepId };
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
        const potentialSources = ['ia-3-1', 'ia-3-2', 'ia-3-3'];
        const patterns: string[] = [];
        const sources: string[] = [];
        
        for (const stepId of potentialSources) {
          const response = await fetch(`/api/workshop-data/${stepId}`);
          if (response.ok) {
            const result = await response.json();
            const data = result.data;
            
            // Look for interlude-related fields
            if (stepId === 'ia-3-1' && data?.interludeReflection) {
              patterns.push(data.interludeReflection);
              sources.push(stepId);
            }
            if (stepId === 'ia-3-2' && data?.inspiration) {
              patterns.push(data.inspiration);
              sources.push(stepId);
            }
            if (stepId === 'ia-3-3' && data?.reflection) {
              patterns.push(`From visualization: "${data.reflection}"`);
              sources.push(stepId);
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