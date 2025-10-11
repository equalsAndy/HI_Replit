import { useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useSessionManager } from '@/hooks/use-session-manager';

export function useLogout() {
  const { toast } = useToast();
  const { storeSessionMessage } = useSessionManager();

  const logout = useMutation({
    mutationFn: async () => {
      // First, set up auth page to load in background iframe
      // to preload the page before redirecting
      const preloadFrame = document.createElement('iframe');
      preloadFrame.style.display = 'none';
      preloadFrame.src = '/auth';
      document.body.appendChild(preloadFrame);
      
      // Create a fixed-size overlay immediately when logout starts
      const overlay = document.createElement('div');
      overlay.id = 'logout-overlay';
      overlay.style.position = 'fixed';
      overlay.style.top = '0';
      overlay.style.left = '0';
      overlay.style.width = '100%';
      overlay.style.height = '100%';
      overlay.style.backgroundColor = 'white';
      overlay.style.zIndex = '9999';
      overlay.style.display = 'flex';
      overlay.style.justifyContent = 'center';
      overlay.style.alignItems = 'center';
      
      document.body.appendChild(overlay);
      
      try {
        // Store logout message for auth page
        storeSessionMessage('logged-out');
        
        // Clear beta welcome session storage on logout
        // This ensures beta testers can see the welcome modal on next login
        Object.keys(sessionStorage).forEach(key => {
          if (key.startsWith('beta_welcome_shown_')) {
            sessionStorage.removeItem(key);
            console.log('🧹 Cleared beta welcome session storage on logout:', key);
          }
        });
        
        // Use fetch directly for better control (avoid redirects during the request)
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ reason: 'manual' }),
          credentials: 'include'
        });
        
        // Clear cache before redirecting
        queryClient.clear();
        
        // Replace current page with auth page (no history entry)
        window.location.replace('/auth');
        
        return { success: true };
      } catch (error) {
        // In case of error, remove overlay and iframe
        if (overlay && overlay.parentNode) {
          overlay.parentNode.removeChild(overlay);
        }
        if (preloadFrame && preloadFrame.parentNode) {
          preloadFrame.parentNode.removeChild(preloadFrame);
        }
        throw error;
      }
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