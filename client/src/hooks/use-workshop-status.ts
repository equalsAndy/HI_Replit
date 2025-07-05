import { useState, useEffect } from 'react';

export function useWorkshopStatus() {
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkCompletionStatus();
  }, []);

  const checkCompletionStatus = async () => {
    try {
      console.log('🔍 Checking workshop completion status...');
      
      const response = await fetch('/api/workshop-data/completion-status', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Workshop completion status:', data);
        setCompleted(data.astWorkshopCompleted || false);
      } else {
        console.log('❌ API Error:', response.status, response.statusText);
        setCompleted(false);
      }
    } catch (error) {
      console.log('❌ Network Error:', error);
      setCompleted(false);
    } finally {
      setLoading(false);
    }
  };

  const completeWorkshop = async () => {
    try {
      console.log('🎯 Completing workshop...');
      
      const response = await fetch('/api/workshop-data/complete-workshop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ appType: 'ast' })
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Workshop completed successfully:', data);
        setCompleted(true);
        return { success: true };
      } else {
        console.log('❌ Workshop completion failed:', response.status);
        return { success: false, error: 'Failed to complete workshop' };
      }
    } catch (error) {
      console.error('❌ Workshop completion error:', error);
      return { success: false, error: 'Network error' };
    }
  };

  return {
    completed,
    loading,
    isWorkshopLocked: () => completed,
    completeWorkshop,
    refreshStatus: checkCompletionStatus
  };
}