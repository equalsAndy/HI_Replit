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

/**
 * Helper function to determine which module a step belongs to
 */
const getStepModule = (stepId: string): 1 | 2 | 3 | 4 | 5 | null => {
  if (!stepId) return null;

  // AST Workshop step mapping
  if (stepId.match(/^[1-5]-[1-9]$/)) {
    return parseInt(stepId.split('-')[0]) as 1 | 2 | 3 | 4 | 5;
  }

  // IA Workshop step mapping (ia-X-Y format)
  if (stepId.match(/^ia-[1-5]-[1-9]$/)) {
    return parseInt(stepId.split('-')[1]) as 1 | 2 | 3 | 4 | 5;
  }

  return null;
};

/**
 * Helper function to check if a module should be locked
 * @param module Module number (1-5)
 * @param isWorkshopCompleted Whether the workshop is completed
 * @returns true if the module should be locked for editing
 */
const isModuleLocked = (module: number, isWorkshopCompleted: boolean): boolean => {
  if (module >= 1 && module <= 3) {
    // Modules 1-3: Lock AFTER workshop completion
    return isWorkshopCompleted;
  } else if (module >= 4 && module <= 5) {
    // Modules 4-5: Lock BEFORE workshop completion (unlock AFTER completion)
    return !isWorkshopCompleted;
  }
  return false;
};

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
        console.error('❌ Workshop completion failed:', errorData);
        if (errorData.missingSteps) {
          console.error('📋 Missing steps:', errorData.missingSteps);
        }
        return { success: false, error: errorData.error };
      }
    } catch (err) {
      console.error('❌ Error completing workshop:', err);
      return { success: false, error: 'Network error' };
    } finally {
      setLoading(false);
    }
  };

  const isWorkshopLocked = (appType: 'ast' | 'ia', stepId?: string) => {
    const isWorkshopCompleted = appType === 'ast' ? status.astWorkshopCompleted : status.iaWorkshopCompleted;

    // If no stepId provided, use legacy behavior (entire workshop locked after completion)
    if (!stepId) {
      return isWorkshopCompleted;
    }

    // Use module-specific locking logic
    const module = getStepModule(stepId);
    if (!module) {
      // If we can't determine the module, fall back to legacy behavior
      return isWorkshopCompleted;
    }

    return isModuleLocked(module, isWorkshopCompleted);
  };

  const isModuleAccessible = (appType: 'ast' | 'ia', module: number) => {
    const isWorkshopCompleted = appType === 'ast' ? status.astWorkshopCompleted : status.iaWorkshopCompleted;
    return !isModuleLocked(module, isWorkshopCompleted);
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
    isModuleAccessible,
    getStepModule,
    triggerGlobalCompletion: () => completionListeners.forEach(listener => listener()),
    completed: status.astWorkshopCompleted
  };
}
