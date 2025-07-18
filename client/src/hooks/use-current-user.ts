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
  contentAccess: 'student' | 'professional' | 'both';
  astAccess: boolean;
  iaAccess: boolean;
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
