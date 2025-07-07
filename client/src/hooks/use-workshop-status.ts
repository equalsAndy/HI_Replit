import { useState, useEffect } from 'react';

interface WorkshopStatus {
  astWorkshopCompleted: boolean;
  iaWorkshopCompleted: boolean;
  astCompletedAt?: string;
  iaCompletedAt?: string;
}

let globalCompletionState: WorkshopStatus = {
  astWorkshopCompleted: false,
  iaWorkshopCompleted: false
};

const completionListeners: (() => void)[] = [];

export function useWorkshopStatus() {
  const [status, setStatus] = useState<WorkshopStatus>(globalCompletionState);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const updateCompletion = () => setStatus({ ...globalCompletionState });
    completionListeners.push(updateCompletion);
    
    const fetchCompletionStatus = async () => {
      try {
        console.log('🔄 Fetching workshop completion status...');
        const response = await fetch('/api/workshop-data/completion-status', {
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('✅ Fetched completion status:', data);
          globalCompletionState = {
            astWorkshopCompleted: data.astWorkshopCompleted || false,
            iaWorkshopCompleted: data.iaWorkshopCompleted || false,
            astCompletedAt: data.astCompletedAt,
            iaCompletedAt: data.iaCompletedAt
          };
          setStatus({ ...globalCompletionState });
          completionListeners.forEach(listener => listener());
        }
      } catch (err) {
        console.error('❌ Error fetching completion status:', err);
        setError('Network error fetching completion status');
      } finally {
        setLoading(false);
      }
    };

    fetchCompletionStatus();
    
    return () => {
      const index = completionListeners.indexOf(updateCompletion);
      if (index > -1) completionListeners.splice(index, 1);
    };
  }, []);

  const completeWorkshop = async (appType: 'ast' | 'ia') => {
    try {
      console.log(`🎯 Completing ${appType.toUpperCase()} workshop...`);
      setLoading(true);
      
      const response = await fetch('/api/workshop-data/complete-workshop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ appType })
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Workshop completed successfully:', data);
        
        const completionField = appType === 'ast' ? 'astWorkshopCompleted' : 'iaWorkshopCompleted';
        const timestampField = appType === 'ast' ? 'astCompletedAt' : 'iaCompletedAt';
        
        globalCompletionState = {
          ...globalCompletionState,
          [completionField]: true,
          [timestampField]: data.completedAt
        };
        
        setStatus({ ...globalCompletionState });
        completionListeners.forEach(listener => listener());
        
        console.log('🔒 All workshop inputs are now locked');
        return { success: true, message: data.message };
      } else {
        const errorData = await response.json();
        return { success: false, error: errorData.error };
      }
    } catch (err) {
      console.error('❌ Error completing workshop:', err);
      return { success: false, error: 'Network error' };
    } finally {
      setLoading(false);
    }
  };

  const isWorkshopLocked = (appType: 'ast' | 'ia') => {
    return appType === 'ast' ? status.astWorkshopCompleted : status.iaWorkshopCompleted;
  };

  return {
    astCompleted: status.astWorkshopCompleted,
    iaCompleted: status.iaWorkshopCompleted,
    astCompletedAt: status.astCompletedAt,
    iaCompletedAt: status.iaCompletedAt,
    loading,
    error,
    completeWorkshop,
    isWorkshopLocked,
    completed: status.astWorkshopCompleted
  };
}
