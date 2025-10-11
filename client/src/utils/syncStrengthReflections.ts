/**
 * Clean, simple sync function for strength reflections
 * Purpose: Reliably sync tRPC reflection data to step-by-step-reflection for AI reports
 */

export const syncStrengthReflections = async () => {
  try {
    // Get current tRPC reflection data
    const response = await fetch('/api/trpc/reflections.getReflectionSet?batch=1&input={"0":{"json":{"reflectionSetId":"strength-reflections"}}}', {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    });
    
    const data = await response.json();
    const reflections = data[0]?.result?.data || [];
    
    // Transform to step-by-step format
    const syncData = {
      strength1: reflections.find(r => r.reflectionId === 'strength-1')?.response || '',
      strength2: reflections.find(r => r.reflectionId === 'strength-2')?.response || '',
      strength3: reflections.find(r => r.reflectionId === 'strength-3')?.response || '',
      strength4: reflections.find(r => r.reflectionId === 'strength-4')?.response || '',
      teamValues: reflections.find(r => r.reflectionId === 'team-values')?.response || '',
      uniqueContribution: reflections.find(r => r.reflectionId === 'unique-contribution')?.response || ''
    };
    
    // Save to step-by-step-reflection endpoint
    const saveResponse = await fetch('/api/workshop-data/step-by-step-reflection', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(syncData)
    });
    
    if (saveResponse.ok) {
      console.log('Reflection data synced successfully');
      return { success: true };
    } else {
      throw new Error(`Sync failed: ${saveResponse.status}`);
    }
    
  } catch (error) {
    console.error('Reflection sync failed:', error);
    return { success: false, error };
  }
};
