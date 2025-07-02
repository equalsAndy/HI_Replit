import { useState, useEffect } from 'react';
import { useProfile } from './use-profile';

interface WorkshopStatus {
  completed: boolean;
  completedAt: string | null;
}

export function useWorkshopStatus() {
  const [status, setStatus] = useState<WorkshopStatus>({
    completed: false,
    completedAt: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { profile } = useProfile();

  useEffect(() => {
    if (!profile) return;

    const fetchStatus = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/workshop-data/completion-status');
        
        if (!response.ok) {
          throw new Error('Failed to fetch completion status');
        }
        
        const data = await response.json();
        setStatus(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, [profile]);

  const completeWorkshop = async () => {
    try {
      const response = await fetch('/api/workshop-data/complete-workshop', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to complete workshop');
      }

      const result = await response.json();
      
      // Update local state optimistically
      setStatus({
        completed: true,
        completedAt: result.completedAt
      });

      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  };

  const isWorkshopLocked = () => {
    return status.completed;
  };

  return {
    completed: status.completed,
    completedAt: status.completedAt,
    loading,
    error,
    completeWorkshop,
    isWorkshopLocked
  };
}