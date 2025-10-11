// Save all strength reflections in a single database transaction
export async function saveStrengthReflections(reflections: Record<string, string>) {
  try {
    console.log('🗄️ Saving strength reflections to database:', reflections);

    // Transform reflections object to match database schema
    const reflectionData = {
      strength1: reflections['strength-1'] || '',
      strength2: reflections['strength-2'] || '',
      strength3: reflections['strength-3'] || '',
      strength4: reflections['strength-4'] || '',
      imaginationReflection: reflections['imagination'] || '',
      teamValues: reflections['team-values'] || '',
      uniqueContribution: reflections['unique-contribution'] || ''
    };

    const response = await fetch('/api/workshop-data/step-by-step-reflection', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(reflectionData)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ Successfully saved strength reflections to database');
    
    return { success: true, data: result };
  } catch (error) {
    console.error('❌ Failed to save strength reflections:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Load existing reflections from database
export async function loadStrengthReflections(): Promise<Record<string, string>> {
  try {
    console.log('📖 Loading existing strength reflections from database');

    const response = await fetch('/api/workshop-data/step-by-step-reflection', {
      credentials: 'include'
    });

    if (!response.ok) {
      // If no data exists yet, return empty object
      if (response.status === 404) {
        console.log('📖 No existing data found (404)');
        return {};
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseData = await response.json();
    console.log('📖 Found existing reflections in database');

    // Extract the actual data from the response wrapper
    const data = responseData.data || responseData;

    // Transform database schema back to component format
    const reflections: Record<string, string> = {};

    if (data.strength1) reflections['strength-1'] = data.strength1;
    if (data.strength2) reflections['strength-2'] = data.strength2;
    if (data.strength3) reflections['strength-3'] = data.strength3;
    if (data.strength4) reflections['strength-4'] = data.strength4;
    if (data.imaginationReflection) reflections['imagination'] = data.imaginationReflection;
    if (data.teamValues) reflections['team-values'] = data.teamValues;
    if (data.uniqueContribution) reflections['unique-contribution'] = data.uniqueContribution;

    console.log('✅ Loaded', Object.keys(reflections).length, 'reflections from database');
    return reflections;

  } catch (error) {
    console.error('❌ Failed to load strength reflections:', error);
    return {}; // Return empty object if loading fails
  }
}
