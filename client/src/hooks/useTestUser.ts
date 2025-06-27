import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

export const useTestUser = () => {
  const { toast } = useToast();
  
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
  const isTestUser = user?.isTestUser === true;

  const executeTestAction = async (
    action: () => Promise<void>, 
    actionName: string,
    showError: boolean = true
  ): Promise<boolean> => {
    if (!isTestUser) {
      if (showError) {
        toast({
          title: 'Test features unavailable',
          description: 'Test features only available to test users',
          variant: 'destructive'
        });
      }
      console.warn(`Test action '${actionName}' attempted by non-test user`);
      return false;
    }
    
    try {
      await action();
      return true;
    } catch (error) {
      console.error(`Test action '${actionName}' failed:`, error);
      if (showError) {
        toast({
          title: 'Test action failed',
          description: `Test action failed: ${actionName}`,
          variant: 'destructive'
        });
      }
      return false;
    }
  };
  
  return {
    isTestUser,
    user,
    executeTestAction
  };
};