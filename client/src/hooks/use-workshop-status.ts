import { useState, useEffect } from 'react';

interface WorkshopStatus {
  astWorkshopCompleted: boolean;
  iaWorkshopCompleted: boolean;
  astCompletedAt?: string;
  iaCompletedAt?: string;
}

// Global completion state that all components share
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
    // Register this component as a listener for global completion changes
    const updateCompletion = () => setStatus({ ...globalCompletionState });
    completionListeners.push(updateCompletion);
    
    // Fetch initial completion status from backend
    const fetchCompletionStatus = async () => {
      try {
        console.log('🔄 Fetching workshop completion status...');
        
        const response = await fetch('/api/workshop-data/completion-status', {
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('✅ Fetched completion status:', data);
          
          // Update global state
          globalCompletionState = {
            astWorkshopCompleted: data.astWorkshopCompleted || false,
            iaWorkshopCompleted: data.iaWorkshopCompleted || false,
            astCompletedAt: data.astCompletedAt,
            iaCompletedAt: data.iaCompletedAt
          };
          
          // Update local state
          setStatus({ ...globalCompletionState });
          
          // Notify all other components
          completionListeners.forEach(listener => listener());
          
        } else {
          console.error('❌ Failed to fetch completion status:', response.status);
          setError('Failed to fetch completion status');
        }
      } catch (err) {
        console.error('❌ Error fetching completion status:', err);
        setError('Network error fetching completion status');
      } finally {
        setLoading(false);
      }
    };

    fetchCompletionStatus();
    
    // Cleanup listener on unmount
    return () => {
      const index = completionListeners.indexOf(updateCompletion);
      if (index > -1) {
        completionListeners.splice(index, 1);
      }
    };
  }, []);

  const completeWorkshop = async (appType: 'ast' | 'ia') => {
    try {
      console.log(`🎯 Completing ${appType.toUpperCase()} workshop...`);
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/workshop-data/complete-workshop', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ appType })
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Workshop completed successfully:', data);
        
        // Update global state
        const completionField = appType === 'ast' ? 'astWorkshopCompleted' : 'iaWorkshopCompleted';
        const timestampField = appType === 'ast' ? 'astCompletedAt' : 'iaCompletedAt';
        
        globalCompletionState = {
          ...globalCompletionState,
          [completionField]: true,
          [timestampField]: data.completedAt
        };
        
        // Update local state
        setStatus({ ...globalCompletionState });
        
        // Notify all other components
        completionListeners.forEach(listener => listener());
        
        console.log('🔒 All workshop inputs are now locked');
        return { success: true, message: data.message };
        
      } else {
        const errorData = await response.json();
        console.error('❌ Failed to complete workshop:', errorData);
        setError(errorData.error || 'Failed to complete workshop');
        return { success: false, error: errorData.error };
      }
    } catch (err) {
      console.error('❌ Error completing workshop:', err);
      setError('Network error completing workshop');
      return { success: false, error: 'Network error' };
    } finally {
      setLoading(false);
    }
  };

  const isWorkshopLocked = (appType: 'ast' | 'ia') => {
    return appType === 'ast' ? status.astWorkshopCompleted : status.iaWorkshopCompleted;
  };

  const triggerGlobalCompletion = () => {
    console.log('🧪 TEST: Triggering manual completion...');
    globalCompletionState = {
      ...globalCompletionState,
      astWorkshopCompleted: true,
      astCompletedAt: new Date().toISOString()
    };
    
    setStatus({ ...globalCompletionState });
    completionListeners.forEach(listener => listener());
    console.log('✅ TEST: All workshop steps have been locked');
  };

  return {
    // Status information
    astCompleted: status.astWorkshopCompleted,
    iaCompleted: status.iaWorkshopCompleted,
    astCompletedAt: status.astCompletedAt,
    iaCompletedAt: status.iaCompletedAt,
    loading,
    error,
    
    // Functions
    completeWorkshop,
    isWorkshopLocked,
    
    // Legacy/test functions
    completed: status.astWorkshopCompleted, // For backward compatibility
    triggerGlobalCompletion, // For testing
    testCompleteWorkshop: process.env.NODE_ENV === 'development' ? triggerGlobalCompletion : undefined
  };
}