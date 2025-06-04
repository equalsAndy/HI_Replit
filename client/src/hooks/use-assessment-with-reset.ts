import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useRef } from 'react';

export const useAssessmentWithReset = (assessmentType: string, endpoint: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const lastKnownDataRef = useRef<any>(null);
  
  // Query for navigation progress to detect resets
  const { data: navigationProgress } = useQuery({
    queryKey: ['navigation-progress'],
    queryFn: async () => {
      const response = await fetch('/api/user/navigation-progress', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch progress');
      const result = await response.json();
      return result.success ? (result.navigationProgress ? JSON.parse(result.navigationProgress) : null) : null;
    },
    refetchInterval: 30000,
    refetchIntervalInBackground: true
  });

  // Query for assessment data
  const { data: assessmentData, isLoading, error } = useQuery({
    queryKey: [assessmentType],
    queryFn: async () => {
      const response = await fetch(endpoint, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error(`Failed to fetch ${assessmentType}`);
      const result = await response.json();
      return result.success ? result.data : null;
    },
    enabled: navigationProgress !== null,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Reset detection for assessment data
  useEffect(() => {
    const currentData = assessmentData;
    const lastKnownData = lastKnownDataRef.current;
    
    // If we had assessment data before but now it's null, user was reset
    if (lastKnownData !== null && currentData === null && navigationProgress === null) {
      console.log(`🚨 ASSESSMENT RESET DETECTED for ${assessmentType}`);
      
      // Clear assessment-specific caches
      queryClient.invalidateQueries({ queryKey: [assessmentType] });
      queryClient.invalidateQueries({ queryKey: [`/api/workshop-data/${assessmentType}`] });
      
      toast({
        title: "Data Reset",
        description: "Your assessment data has been reset. Starting fresh.",
        variant: "default"
      });
    }
    
    lastKnownDataRef.current = currentData;
  }, [assessmentData, navigationProgress, assessmentType, queryClient, toast]);

  // Clear assessment data if navigation progress is null
  const effectiveAssessmentData = navigationProgress === null ? null : assessmentData;

  return { 
    assessmentData: effectiveAssessmentData, 
    isLoading, 
    error,
    isReset: navigationProgress === null
  };
};