import { useState, useEffect } from 'react';
import { useProfile } from './use-profile';

interface WorkshopStatus {
  astCompleted: boolean;
  iaCompleted: boolean;
  astCompletedAt?: string;
  iaCompletedAt?: string;
  isLoading: boolean;
}

export function useWorkshopStatus() {
  const [status, setStatus] = useState<WorkshopStatus>({
    astCompleted: false,
    iaCompleted: false,
    isLoading: true
  });
  const { profile } = useProfile();

  // Fetch completion status
  useEffect(() => {
    const fetchStatus = async () => {
      if (!profile) {
        setStatus(prev => ({ ...prev, isLoading: false }));
        return;
      }

      try {
        const response = await fetch('/api/workshop-data/completion-status', {
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          setStatus({
            astCompleted: data.astWorkshopCompleted || false,
            iaCompleted: data.iaWorkshopCompleted || false,
            astCompletedAt: data.astCompletedAt,
            iaCompletedAt: data.iaCompletedAt,
            isLoading: false
          });
        } else {
          console.error('Failed to fetch workshop status');
          setStatus(prev => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error('Error fetching workshop status:', error);
        setStatus(prev => ({ ...prev, isLoading: false }));
      }
    };

    fetchStatus();
  }, [profile]);

  // Complete workshop function
  const completeWorkshop = async (appType: 'ast' | 'ia') => {
    try {
      const response = await fetch('/api/workshop-data/complete-workshop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ appType })
      });

      if (response.ok) {
        // Update local status
        setStatus(prev => ({
          ...prev,
          [appType === 'ast' ? 'astCompleted' : 'iaCompleted']: true,
          [appType === 'ast' ? 'astCompletedAt' : 'iaCompletedAt']: new Date().toISOString()
        }));
        return { success: true };
      } else {
        const error = await response.json();
        return { success: false, error: error.message || 'Failed to complete workshop' };
      }
    } catch (error) {
      console.error('Error completing workshop:', error);
      return { success: false, error: 'Network error' };
    }
  };

  // Helper function to check if specific workshop is locked
  const isWorkshopLocked = (appType: 'ast' | 'ia') => {
    return appType === 'ast' ? status.astCompleted : status.iaCompleted;
  };

  return {
    ...status,
    completeWorkshop,
    isWorkshopLocked
  };
}