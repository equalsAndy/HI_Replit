import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

export const useTestUser = () => {
  const { data: userData } = useQuery<{
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
    queryKey: ['/api/user/profile'],
    refetchOnWindowFocus: false,
    staleTime: 60 * 1000, // 1 minute
  });
  
  const user = userData?.user;
  // SECURE: Only database field, no username patterns
  return user?.isTestUser === true;
};