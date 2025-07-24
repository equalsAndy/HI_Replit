import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useRef } from 'react';

export const useAssessmentWithReset = (assessmentType: string, endpoint: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const lastKnownDataRef = useRef<any>(null);
  const lastKnownNavigationRef = useRef<any>(undefined);
  const hasInitializedRef = useRef(false);
  
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
    refetchInterval: false, // Disable automatic refetching to prevent auth loop
    refetchIntervalInBackground: false
  });

  // Query for assessment data
  const { data: assessmentData, isLoading, error } = useQuery({
    queryKey: [assessmentType],
    queryFn: async () => {
      try {
        const response = await fetch(endpoint, {
          credentials: 'include'
        });
        if (!response.ok) {
          if (response.status === 404) {
            return null; // No data exists yet
          }
          throw new Error(`Failed to fetch ${assessmentType}`);
        }
        const result = await response.json();
        return result.success ? (result.data || null) : null;
      } catch (error) {
        console.log(`No ${assessmentType} data found, returning null`);
        return null;
      }
    },
    enabled: navigationProgress !== null,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Reset detection for assessment data
  useEffect(() => {
    const currentData = assessmentData;
    const lastKnownData = lastKnownDataRef.current;
    const currentNavigation = navigationProgress;
    const lastKnownNavigation = lastKnownNavigationRef.current;
    
    // Initialize references on first load
    if (!hasInitializedRef.current) {
      lastKnownDataRef.current = currentData;
      lastKnownNavigationRef.current = currentNavigation;
      hasInitializedRef.current = true;
      return;
    }
    
    // Only trigger reset detection if:
    // 1. We had valid data before (not null/undefined)
    // 2. Now both are null (indicating a reset)
    // 3. This is a change from a non-null state to null state
    if (lastKnownData !== null && 
        lastKnownData !== undefined && 
        currentData === null && 
        lastKnownNavigation !== null &&
        currentNavigation === null) {
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
    
    // Update references
    lastKnownDataRef.current = currentData;
    lastKnownNavigationRef.current = currentNavigation;
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