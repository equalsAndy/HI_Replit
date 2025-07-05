import { useState, useEffect } from 'react';

// Global completion state that all components share
let globalCompletionState = false;
const completionListeners: (() => void)[] = [];

export function useWorkshopStatus() {
  const [completed, setCompleted] = useState(globalCompletionState);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Register this component as a listener for global completion changes
    const updateCompletion = () => setCompleted(globalCompletionState);
    completionListeners.push(updateCompletion);
    
    // Cleanup listener on unmount
    return () => {
      const index = completionListeners.indexOf(updateCompletion);
      if (index > -1) {
        completionListeners.splice(index, 1);
      }
    };
  }, []);

  const triggerGlobalCompletion = () => {
    console.log('🎯 Triggering global workshop completion...');
    globalCompletionState = true;
    
    // Notify all listening components to update their state
    completionListeners.forEach(listener => listener());
    
    console.log('✅ All workshop steps have been locked');
  };

  return {
    completed,
    loading,
    isWorkshopLocked: () => completed,
    triggerGlobalCompletion,
    // Keep test function but make it hidden by default
    testCompleteWorkshop: process.env.NODE_ENV === 'development' ? triggerGlobalCompletion : undefined
  };
}