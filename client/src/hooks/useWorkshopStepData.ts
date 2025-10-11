import { useState, useEffect, useMemo, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';

// Simple debounce utility
const debounce = (func: Function, wait: number) => {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

interface UseWorkshopStepDataOptions {
  debounceMs?: number;
  enableAutoSave?: boolean;
  onSaveSuccess?: () => void;
  onSaveError?: (error: Error) => void;
}

interface UseWorkshopStepDataReturn<T> {
  data: T;
  updateData: (updates: Partial<T>) => void;
  setData: (newData: T) => void;
  saving: boolean;
  loaded: boolean;
  error: string | null;
  saveNow: () => Promise<void>;
  reload: () => Promise<void>;
  reset: () => void;
  clearCache: () => void;
}

/**
 * Hook for managing workshop step data with auto-save functionality
 * 
 * @param workshopType - 'ast' or 'ia'
 * @param stepId - Step identifier (e.g., 'ia-3-4', '2-1')
 * @param initialData - Default data structure for the step
 * @param options - Configuration options
 */
export function useWorkshopStepData<T extends Record<string, any>>(
  workshopType: 'ast' | 'ia',
  stepId: string,
  initialData: T,
  options: UseWorkshopStepDataOptions = {}
): UseWorkshopStepDataReturn<T> {
  const {
    debounceMs = 1000,
    enableAutoSave = true,
    onSaveSuccess,
    onSaveError
  } = options;

  const [data, setDataState] = useState<T>(initialData);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  
  const queryClient = useQueryClient();

  // Load data from server on mount
  const loadData = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch(`/api/workshop-data/step/${workshopType}/${stepId}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        // Don't throw for 500 errors to prevent infinite loops
        console.warn(`Failed to load workshop step data for ${stepId}: ${response.status}`);
        setDataState(initialData);
        setLoaded(true);
        return;
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        // Merge server data with initial structure to handle new fields
        setDataState({ ...initialData, ...result.data });
      } else {
        // No saved data, use initial data
        setDataState(initialData);
      }
      
      setLoaded(true);
    } catch (err) {
      console.warn('Error loading workshop step data (using initial data):', err);
      setDataState(initialData);
      setLoaded(true);
    }
  }, [workshopType, stepId, initialData]);

  // Save data to server
  const saveData = useCallback(async (dataToSave: T) => {
    try {
      setSaving(true);
      setError(null);

      const response = await fetch('/api/workshop-data/step', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          workshopType,
          stepId,
          data: dataToSave
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Save failed:', errorData);
        throw new Error(errorData.error || `Save failed: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Save failed');
      }
      onSaveSuccess?.();
      
    } catch (err) {
      console.error('Error saving workshop step data:', err);
      const error = err instanceof Error ? err : new Error('Save failed');
      setError(error.message);
      onSaveError?.(error);
    } finally {
      setSaving(false);
    }
  }, [workshopType, stepId, onSaveSuccess, onSaveError]);

  // Debounced save function
  const debouncedSave = useMemo(
    () => debounce(saveData, debounceMs),
    [saveData, debounceMs]
  );

  // Load data on mount - only once to prevent loops
  useEffect(() => {
    if (!hasLoadedOnce) {
      setHasLoadedOnce(true);
      loadData();
    }
  }, [hasLoadedOnce, loadData]);

  // Auto-save when data changes (if enabled)
  useEffect(() => {
    if (!enableAutoSave || !loaded) {
      return;
    }

    // Check if data has meaningful content (not just empty strings)
    const hasContent = Object.values(data).some(value => {
      if (typeof value === 'string') return value.trim().length > 0;
      if (typeof value === 'number') return value !== 0;
      if (typeof value === 'boolean') return value;
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === 'object' && value !== null) return Object.keys(value).length > 0;
      return false;
    });

    if (hasContent) {
      debouncedSave(data);
    }
  }, [data, enableAutoSave, loaded, debouncedSave]);

  // Update data function (merges with existing data)
  const updateData = useCallback((updates: Partial<T>) => {
    setDataState(prev => ({ ...prev, ...updates }));
  }, []);

  // Set complete data function
  const setData = useCallback((newData: T) => {
    setDataState(newData);
  }, []);

  // Force save function
  const saveNow = useCallback(async () => {
    await saveData(data);
  }, [saveData, data]);

  // Reload function
  const reload = useCallback(async () => {
    setLoaded(false);
    await loadData();
  }, [loadData]);

  // Reset function - clear data back to initial state
  const reset = useCallback(() => {
    setDataState(initialData);
    setLoaded(false);
    setError(null);
    setSaving(false);
    setHasLoadedOnce(false);
  }, [initialData]);

  // Clear cache function - remove this specific step's cache
  const clearCache = useCallback(() => {
    const cacheKey = `/api/workshop-data/step/${workshopType}/${stepId}`;
    console.log(`🗑️ Clearing cache for workshop step: ${cacheKey}`);
    
    // Remove the specific query from cache
    queryClient.removeQueries({ queryKey: [cacheKey] });
    
    // Also clear any related cache entries
    queryClient.removeQueries({ 
      predicate: (query: any) => {
        if (!query.queryKey || !Array.isArray(query.queryKey)) return false;
        return query.queryKey.some((key: string) => 
          typeof key === 'string' && key.includes(`/step/${workshopType}/${stepId}`)
        );
      }
    });
    
    console.log(`✅ Cache cleared for ${workshopType} step ${stepId}`);
  }, [queryClient, workshopType, stepId]);

  return {
    data,
    updateData,
    setData,
    saving,
    loaded,
    error,
    saveNow,
    reload,
    reset,
    clearCache
  };
}

export default useWorkshopStepData;