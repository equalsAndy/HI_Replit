import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { ProfileData } from '@shared/schema';

export function useProfile() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Get user profile - TEMPORARILY DISABLED TO STOP AUTH LOOP
  const { data: profile, isLoading } = useQuery({
    queryKey: ['/api/auth/me'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/auth/me');
      return res.json();
    },
    staleTime: Infinity,
    retry: false,
    enabled: false // DISABLED to stop infinite auth loop
  });

  // Update profile
  const updateProfile = useMutation({
    mutationFn: async (data: ProfileData) => {
      const res = await apiRequest('PUT', '/api/auth/me', data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to update profile",
        description: String(error),
        variant: "destructive",
      });
    }
  });

  // Update user progress
  const updateProgress = useMutation({
    mutationFn: async (progress: number) => {
      const res = await apiRequest('PUT', '/api/user/progress', { progress });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
    },
    onError: (error) => {
      toast({
        title: "Failed to update progress",
        description: String(error),
        variant: "destructive",
      });
    }
  });

  return {
    profile,
    isLoading,
    isUpdating: updateProfile.isPending,
    updateProfile: updateProfile.mutate,
    updateProgress: updateProgress.mutate
  };
}
