import { useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export function useLogout() {
  const { toast } = useToast();

  const logout = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/auth/logout', {});
      return res;
    },
    onSuccess: () => {
      // Clear any cached data
      queryClient.clear();
      
      // Show success message
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of the application.",
      });
      
      // Immediately redirect to auth page without delay
      window.location.href = '/auth';
    },
    onError: (error) => {
      toast({
        title: "Logout failed",
        description: "There was a problem logging out. Please try again.",
        variant: "destructive",
      });
    }
  });

  return logout;
}