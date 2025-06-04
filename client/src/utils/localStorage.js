const LOCAL_STORAGE_PREFIX = 'ast_backup_';

export const saveToLocalStorage = (assessmentType, data, userId) => {
  try {
    const key = `${LOCAL_STORAGE_PREFIX}${userId}_${assessmentType}`;
    const backupData = {
      data,
      timestamp: new Date().toISOString(),
      assessmentType,
      status: 'pending_sync'
    };
    localStorage.setItem(key, JSON.stringify(backupData));
    console.log(`Data backed up locally for ${assessmentType}`);
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
};

export const getFromLocalStorage = (assessmentType, userId) => {
  try {
    const key = `${LOCAL_STORAGE_PREFIX}${userId}_${assessmentType}`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Failed to read from localStorage:', error);
    return null;
  }
};

export const clearLocalStorage = (assessmentType, userId) => {
  try {
    const key = `${LOCAL_STORAGE_PREFIX}${userId}_${assessmentType}`;
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Failed to clear localStorage:', error);
  }
};

export const getAllPendingBackups = (userId) => {
  const backups = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(`${LOCAL_STORAGE_PREFIX}${userId}_`)) {
        const data = JSON.parse(localStorage.getItem(key));
        if (data.status === 'pending_sync') {
          backups.push({ key, ...data });
        }
      }
    }
  } catch (error) {
    console.error('Failed to get pending backups:', error);
  }
  return backups;
};

// Enhanced save function with backup
export const saveWithBackup = async (data, endpoint, assessmentType, userId) => {
  const maxRetries = 3;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data)
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // Success - clear any local backup
          clearLocalStorage(assessmentType, userId);
          return { success: true };
        }
      }
      throw new Error('Save failed');
    } catch (error) {
      if (attempt === maxRetries) {
        // Final attempt failed - save to localStorage
        saveToLocalStorage(assessmentType, data, userId);
        console.log(`Saved ${assessmentType} to local storage after ${maxRetries} failed attempts`);
        return { success: false, backed_up: true };
      } else {
        // Wait before retry with exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }
};

// Helper function to map assessment types to endpoints
export const getEndpointForAssessmentType = (assessmentType) => {
  const endpoints = {
    'starCard': '/api/workshop-data/starcard',
    'flowAttributes': '/api/workshop-data/flow-attributes',
    'roundingOutReflection': '/api/workshop-data/rounding-out',
    'futureSelfReflection': '/api/workshop-data/future-self',
    'cantrilLadder': '/api/workshop-data/cantril-ladder',
    'finalReflection': '/api/workshop-data/final-insights'
  };
  return endpoints[assessmentType] || '/api/workshop-data/assessments';
};