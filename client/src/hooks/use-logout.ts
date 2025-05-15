import { useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export function useLogout() {
  const { toast } = useToast();

  const logout = useMutation({
    mutationFn: async () => {
      // Create a fixed-size overlay immediately when logout starts
      const overlay = document.createElement('div');
      overlay.id = 'logout-overlay';
      overlay.style.position = 'fixed';
      overlay.style.top = '0';
      overlay.style.left = '0';
      overlay.style.width = '100%';
      overlay.style.height = '100%';
      overlay.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
      overlay.style.zIndex = '9999';
      overlay.style.display = 'flex';
      overlay.style.justifyContent = 'center';
      overlay.style.alignItems = 'center';
      overlay.style.transition = 'opacity 0.3s';
      
      const loadingText = document.createElement('div');
      loadingText.textContent = 'Logging out...';
      loadingText.style.fontSize = '1.2rem';
      loadingText.style.fontWeight = 'bold';
      loadingText.style.color = '#333';
      
      overlay.appendChild(loadingText);
      document.body.appendChild(overlay);
      
      const res = await apiRequest('POST', '/api/auth/logout', {});
      return res;
    },
    onSuccess: () => {
      // Clear any cached data
      queryClient.clear();
      
      // Immediately redirect to auth page without delay or toast
      window.location.href = '/auth';
    },
    onError: (error) => {
      // Remove overlay in case of error
      const overlay = document.getElementById('logout-overlay');
      if (overlay) document.body.removeChild(overlay);
      
      toast({
        title: "Logout failed",
        description: "There was a problem logging out. Please try again.",
        variant: "destructive",
      });
    }
  });

  return logout;
}