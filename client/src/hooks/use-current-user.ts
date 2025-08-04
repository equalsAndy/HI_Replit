import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

export interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  organization?: string;
  jobTitle?: string;
  profilePicture?: string;
  role: 'admin' | 'facilitator' | 'participant' | 'student';
  isTestUser: boolean;
  isBetaTester?: boolean;
  hasSeenBetaWelcome?: boolean;
  contentAccess: 'student' | 'professional' | 'both';
  astAccess: boolean;
  iaAccess: boolean;
  navigationProgress?: string; // JSON string with workshop progress
  astWorkshopCompleted?: boolean;
  iaWorkshopCompleted?: boolean;
  canTrainTalia?: boolean; // Talia training access control
}

export function useCurrentUser() {
  const { data, ...rest } = useQuery<{ user: User }>({
    queryKey: ['/api/auth/me'],
    queryFn: () => apiRequest('/api/auth/me'),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Extract and normalize user data from the API response
  // The API sometimes returns nested user objects, handle both formats
  const user = data?.user || (data as any);
  
  return {
    ...rest,
    data: user,
    isLoggedIn: !!user?.id,
  };
}
