// Lightweight validation to detect false positive completion data
export const detectSuspiciousProgress = (completedSteps: string[]): boolean => {
  // Flag 1: Too many steps completed without proper sequence
  if (completedSteps.length >= 10) {
    console.log('🚨 SUSPICIOUS: High completion count detected:', completedSteps.length);
    return true;
  }

  // Flag 2: All early steps completed in perfect sequence (likely false positive)
  const suspiciousSequence = ["1-1", "2-1", "2-2", "2-3", "2-4", "3-1", "3-2", "3-3", "3-4"];
  const hasAllSequential = suspiciousSequence.every(step => completedSteps.includes(step));
  
  if (hasAllSequential && completedSteps.length >= suspiciousSequence.length) {
    console.log('🚨 SUSPICIOUS: Perfect sequential completion detected');
    return true;
  }

  return false;
};

export const clearSuspiciousLocalStorage = (): void => {
  console.log('🧹 Clearing potentially corrupted localStorage data');
  
  const keysToRemove = [
    'navigationProgress',
    'allstarteams-navigation-progress',
    'imaginal-agility-navigation-progress'
  ];
  
  keysToRemove.forEach(key => {
    if (localStorage.getItem(key)) {
      console.log(`🗑️ Removing localStorage key: ${key}`);
      localStorage.removeItem(key);
    }
  });
};