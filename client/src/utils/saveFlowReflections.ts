// Save and load flow rounding out reflections

interface FlowReflectionSaveResult {
  success: boolean;
  data?: any;
  error?: string;
}

export async function saveFlowReflections(reflections: Record<string, string>): Promise<FlowReflectionSaveResult> {
  try {
    console.log('🗄️ Saving flow reflections to database:', reflections);

    // Transform reflections object to match database schema
    const reflectionData = {
      strengths: reflections['flow-1'] || '', // "When does flow happen most naturally for you?"
      values: reflections['flow-2'] || '',    // "What typically blocks or interrupts your flow state?"  
      passions: reflections['flow-3'] || '',  // "What conditions help you get into flow more easily?"
      growthAreas: reflections['flow-4'] || '' // "How could you create more opportunities for flow in your work and life?"
    };

    const response = await fetch('/api/workshop-data/rounding-out', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(reflectionData)
    });

    if (!response.ok) {
      // Surface the server's actual error (e.g. validation/lock message) instead of a bare status
      let serverMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorBody = await response.json();
        serverMessage = errorBody.error || errorBody.message || serverMessage;
      } catch {
        // response had no JSON body; keep the status-based message
      }
      throw new Error(serverMessage);
    }

    const result = await response.json();
    console.log('✅ Successfully saved flow reflections to database');
    
    return { success: true, data: result };
  } catch (error) {
    console.error('❌ Failed to save flow reflections:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Load existing reflections from database
export async function loadFlowReflections(): Promise<Record<string, string>> {
  try {
    console.log('📖 Loading existing flow reflections from database');

    const response = await fetch('/api/workshop-data/rounding-out', {
      credentials: 'include'
    });

    if (!response.ok) {
      // If no data exists yet, return empty object
      if (response.status === 404) {
        console.log('📖 No existing flow data found (404)');
        return {};
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseData = await response.json();
    console.log('📖 Found existing flow reflections in database');

    // Extract the actual data from the response wrapper
    const data = responseData.data || responseData;

    // Transform database schema back to component format
    const reflections: Record<string, string> = {};
    
    if (data.strengths) reflections['flow-1'] = data.strengths;
    if (data.values) reflections['flow-2'] = data.values;
    if (data.passions) reflections['flow-3'] = data.passions;
    if (data.growthAreas) reflections['flow-4'] = data.growthAreas;

    console.log('✅ Loaded', Object.keys(reflections).length, 'flow reflections from database');
    return reflections;

  } catch (error) {
    console.error('❌ Failed to load flow reflections:', error);
    return {}; // Return empty object if loading fails
  }
}
