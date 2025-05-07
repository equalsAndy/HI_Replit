import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { ProfileData } from '@shared/schema';

export function useProfile() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Get user profile
  const { data: profile, isLoading } = useQuery({
    queryKey: ['/api/user/profile'],
    staleTime: Infinity
  });

  // Update profile
  const updateProfile = useMutation({
    mutationFn: async (data: ProfileData) => {
      const res = await apiRequest('PUT', '/api/user/profile', data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/profile'] });
      
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
      queryClient.invalidateQueries({ queryKey: ['/api/user/profile'] });
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
