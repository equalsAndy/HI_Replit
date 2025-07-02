import { useState, useEffect } from 'react';

export function useWorkshopStatus() {
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Test the backend API connection
    const testAPI = async () => {
      try {
        console.log('🧪 Testing workshop completion API...');
        
        const response = await fetch('/api/workshop-data/completion-status');
        
        if (response.ok) {
          const data = await response.json();
          console.log('✅ API Response:', data);
          setCompleted(data.completed || false);
        } else {
          console.log('❌ API Error:', response.status, response.statusText);
        }
      } catch (error) {
        console.log('❌ Network Error:', error);
      } finally {
        setLoading(false);
      }
    };

    testAPI();
  }, []);

  // Simple test function to manually toggle completion
  const testCompleteWorkshop = () => {
    console.log('🧪 Test: Toggling workshop lock state...');
    setCompleted(!completed); // Toggle the state
    console.log('🧪 New state:', !completed ? 'LOCKED' : 'UNLOCKED');
  };

  return {
    completed,
    loading,
    isWorkshopLocked: () => completed,
    testCompleteWorkshop // For testing only
  };
}