import { useQuery } from '@tanstack/react-query';

// Singleton hook for StarCard data to prevent multiple simultaneous fetches
export function useStarCardData() {
  return useQuery({
    queryKey: ['starcard-data'], // Simplified, unique key
    queryFn: async () => {
      console.log('🔄 useStarCardData: Making API request to /api/workshop-data/starcard');
      const response = await fetch('/api/workshop-data/starcard', {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('🔄 useStarCardData: Received data:', data);
      return data;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes - longer to prevent loops
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: false, // Don't retry to prevent loops
    refetchInterval: false,
    refetchOnReconnect: false,
    refetchIntervalInBackground: false,
  });
}
