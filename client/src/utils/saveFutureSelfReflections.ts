// Utility functions for saving and loading Future Self reflections

export interface FutureSelfReflectionData {
  'future-self-1': string; // Future self reflection - "Write a thoughtful response that addresses your growth, flow-aligned life, and contribution to others."
}

export interface FutureSelfImageData {
  selectedImages: Array<{
    id: string;
    url: string;
    source: string;
    searchTerm: string;
    credit?: {
      photographer: string;
      photographerUrl: string;
      sourceUrl: string;
    } | null;
    photoId?: number;
  }>;
  imageMeaning: string;
}

// FIXED: Save reflections while preserving imageData
export async function saveFutureSelfReflections(reflections: Record<string, string>): Promise<{ success: boolean; error?: string }> {
  try {
    // Load existing data to preserve imageData
    const existing = await loadFutureSelfComplete();

    // Transform reflections to match API expected format
    const transformedData = {
      flowOptimizedLife: reflections['future-self-1'] || '', // FIXED: Use flowOptimizedLife to match server
      // Preserve existing imageData - this prevents wiping
      imageData: existing.imageData
    };

    console.log('💾 Saving reflection data:', transformedData);

    const response = await fetch('/api/workshop-data/future-self', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(transformedData)
    });

    if (response.ok) {
      const result = await response.json();
      if (result.success) {
        console.log('✅ Reflection saved successfully');
        return { success: true };
      } else {
        console.error('❌ Save failed:', result.error);
        return { success: false, error: result.error || 'Unknown error' };
      }
    } else {
      console.error('❌ HTTP error:', response.status, response.statusText);
      return { success: false, error: `HTTP ${response.status}: ${response.statusText}` };
    }
  } catch (error) {
    console.error('❌ Network error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Network error' };
  }
}

// FIXED: Load reflections using new schema
export async function loadFutureSelfReflections(): Promise<Record<string, string>> {
  try {
    const response = await fetch('/api/workshop-data/future-self', {
      credentials: 'include'
    });

    if (response.ok) {
      const result = await response.json();
      if (result.success && result.data) {
        // Transform from API format to internal format
        const transformedData = {
          'future-self-1': result.data.flowOptimizedLife || '' // FIXED: Use flowOptimizedLife to match server
        };

        console.log('📖 Loaded reflection data:', transformedData);
        return transformedData;
      }
    }
    console.log('📖 No existing reflection data found');
    return {};
  } catch (error) {
    console.error('❌ Error loading reflections:', error);
    return {};
  }
}

// New comprehensive functions that include image data
export async function saveFutureSelfComplete(
  reflections: Record<string, string>,
  imageData: FutureSelfImageData
): Promise<{ success: boolean; error?: string }> {
  try {
    // Transform reflections to match API expected format
    const transformedData = {
      flowOptimizedLife: reflections['future-self-1'] || '', // FIXED: Use flowOptimizedLife to match server
      // Add image data as additional field
      imageData: {
        selectedImages: imageData.selectedImages,
        imageMeaning: imageData.imageMeaning
      }
    };

    const response = await fetch('/api/workshop-data/future-self', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(transformedData)
    });

    const result = await response.json();

    if (response.ok && result.success) {
      return { success: true };
    } else {
      return { success: false, error: result.error || 'Unknown error' };
    }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Network error' };
  }
}

export async function loadFutureSelfComplete(): Promise<{
  reflections: Record<string, string>;
  imageData: FutureSelfImageData;
}> {
  try {
    const response = await fetch('/api/workshop-data/future-self', {
      credentials: 'include'
    });

    if (response.ok) {
      const result = await response.json();
      if (result.success && result.data) {
        // Transform from API format to internal format
        const reflections = {
          'future-self-1': result.data.flowOptimizedLife || '' // FIXED: Use flowOptimizedLife to match server
        };

        const imageData: FutureSelfImageData = {
          selectedImages: result.data.imageData?.selectedImages || [],
          imageMeaning: result.data.imageData?.imageMeaning || ''
        };

        return { reflections, imageData };
      } else {
        return {
          reflections: {},
          imageData: { selectedImages: [], imageMeaning: '' }
        };
      }
    } else {
      return {
        reflections: {},
        imageData: { selectedImages: [], imageMeaning: '' }
      };
    }
  } catch (error) {
    return {
      reflections: {},
      imageData: { selectedImages: [], imageMeaning: '' }
    };
  }
}