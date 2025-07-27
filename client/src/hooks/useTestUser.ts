import { useQuery, useQueryClient } from '@tanstack/react-query';

export const useTestUser = () => {
  const queryClient = useQueryClient();
  
  // EMERGENCY FIX: Removed forced invalidation that was causing infinite loops
  // This was causing invalidateQueries -> refetch -> re-render -> invalidateQueries cycle
  
  const { data: userData, isLoading, error } = useQuery<{
    success: boolean;
    user: {
      id: number;
      name: string;
      username: string;
      email: string | null;
      title: string | null;
      organization: string | null;
      role?: string;
      isTestUser?: boolean;
      // TEMPORARILY COMMENTED OUT FOR TESTING
      // isBetaTester?: boolean;
      // showDemoDataButtons?: boolean;
    }
  }>({
    queryKey: ['/api/auth/me'],
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    staleTime: 0,
    gcTime: 0,
    retry: 1,
  });
  
  const user = userData?.user;
  const isTestUser = user?.isTestUser === true;
  // TEMPORARILY COMMENTED OUT FOR TESTING
  // const isBetaTester = user?.isBetaTester === true;
  // const showDemoDataButtons = user?.showDemoDataButtons !== false; // Default to true if not set
  
  // Debug logging removed to prevent console loops
  
  // SECURE: Only database field, no username patterns
  return {
    isTestUser,
    // TEMPORARILY COMMENTED OUT FOR TESTING
    // isBetaTester,
    // showDemoDataButtons,
    // Simplified logic for testing - Test users always see demo buttons
    shouldShowDemoButtons: isTestUser,
    user
  };
};