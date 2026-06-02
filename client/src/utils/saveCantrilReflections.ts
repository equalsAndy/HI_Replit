// Utility functions for saving and loading Cantril Ladder reflections

export interface CantrilReflectionData {
  'wellbeing-1': string; // Current factors
  'wellbeing-2': string; // Future improvements  
  'wellbeing-3': string; // Specific changes
  'wellbeing-4': string; // Quarterly progress
  'wellbeing-5': string; // Quarterly actions
}

export async function saveCantrilReflections(reflections: Record<string, string>): Promise<{ success: boolean; error?: string }> {
  try {
    // Transform reflections to match API expected format
    const transformedData = {
      currentFactors: reflections['wellbeing-1'] || '',
      futureImprovements: reflections['wellbeing-2'] || '',
      specificChanges: reflections['wellbeing-3'] || '',
      quarterlyProgress: reflections['wellbeing-4'] || '',
      quarterlyActions: reflections['wellbeing-5'] || ''
    };

    console.log('💾 Saving Cantril reflections:', transformedData);

    const response = await fetch('/api/workshop-data/cantril-ladder', {
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
        console.log('✅ Cantril reflections saved successfully');
        return { success: true };
      } else {
        console.error('❌ API returned error:', result.error);
        return { success: false, error: result.error || 'Unknown error' };
      }
    } else {
      // Surface the server's actual error (validation / lock / auth) instead of a bare status
      console.error('❌ HTTP error:', response.status, response.statusText);
      let serverMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorBody = await response.json();
        serverMessage = errorBody.error || errorBody.message || serverMessage;
      } catch {
        // response had no JSON body; keep the status-based message
      }
      return { success: false, error: serverMessage };
    }
  } catch (error) {
    console.error('❌ Network error saving Cantril reflections:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Network error' };
  }
}

export async function loadCantrilReflections(): Promise<Record<string, string>> {
  try {
    console.log('📖 Loading Cantril reflections...');

    const response = await fetch('/api/workshop-data/cantril-ladder', {
      credentials: 'include'
    });

    if (response.ok) {
      const result = await response.json();
      if (result.success && result.data) {
        console.log('✅ Loaded Cantril reflections:', result.data);
        
        // Transform from API format to internal format
        const transformedData = {
          'wellbeing-1': result.data.currentFactors || '',
          'wellbeing-2': result.data.futureImprovements || '',
          'wellbeing-3': result.data.specificChanges || '',
          'wellbeing-4': result.data.quarterlyProgress || '',
          'wellbeing-5': result.data.quarterlyActions || ''
        };

        return transformedData;
      } else {
        console.log('📖 No existing Cantril reflection data found');
        return {};
      }
    } else {
      console.error('❌ HTTP error loading Cantril reflections:', response.status);
      return {};
    }
  } catch (error) {
    console.error('❌ Network error loading Cantril reflections:', error);
    return {};
  }
}
