import { useQuery, useQueryClient } from '@tanstack/react-query';

export const useTestUser = () => {
  const queryClient = useQueryClient();
  
  // Force invalidation every time this hook is called
  queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
  
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
  
  // Debug logging - this should appear in browser console
  console.log('🔍 useTestUser Debug:', {
    userData: userData,
    user: user,
    isTestUser: isTestUser,
    rawIsTestUser: user?.isTestUser,
    isLoading: isLoading,
    error: error,
    timestamp: new Date().toISOString()
  });
  
  // SECURE: Only database field, no username patterns
  return isTestUser;
};