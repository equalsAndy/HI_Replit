/**
 * Utility to manually clear all reflection cache data
 * Use this for debugging when reflection data is stuck in cache
 */

export const clearReflectionCache = () => {
  console.log('🧹 MANUAL CACHE CLEAR: Starting comprehensive reflection cache clearing...');
  
  // 1. Dispatch all clearing events
  window.dispatchEvent(new CustomEvent('userDataCleared'));
  window.dispatchEvent(new CustomEvent('assessmentDataCleared'));
  window.dispatchEvent(new CustomEvent('workshopDataReset'));
  window.dispatchEvent(new CustomEvent('reflectionDataCleared'));
  
  // 2. Clear localStorage reflection data
  const keysToRemove = [
    'reflection-responses',
    'strength-reflections',
    'reflection_data',
    'workshop-reflections'
  ];
  
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });
  
  // 3. Clear any dynamic reflection keys
  const allLocalKeys = Object.keys(localStorage);
  const allSessionKeys = Object.keys(sessionStorage);
  
  [...allLocalKeys, ...allSessionKeys].forEach(key => {
    if (key.includes('reflection') || 
        key.includes('strength-') ||
        key.startsWith('trpc-') && key.includes('reflection')) {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
      console.log('🧹 Cleared storage key:', key);
    }
  });
  
  console.log('✅ Manual reflection cache clear completed');
};

// Make it globally accessible for debugging
if (typeof window !== 'undefined') {
  (window as any).clearReflectionCache = clearReflectionCache;
  console.log('🔧 Debug utility loaded: Use window.clearReflectionCache() in console');
}
