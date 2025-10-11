/**
 * Data synchronization utility for reflection data
 * Syncs tRPC reflection data to the correct step-by-step-reflection endpoint
 */

import { trpc } from '@/utils/trpc';

export const syncReflectionData = async () => {
  console.log('🔄 Starting reflection data synchronization...');
  
  try {
    // Step 1: Get reflection data using tRPC client
    const trpcClient = trpc.useUtils();
    const reflectionData = await trpcClient.reflections.getReflectionSet.fetch({
      reflectionSetId: 'strength-reflections'
    });
    
    console.log('📥 Retrieved reflection data:', reflectionData);
    
    // Step 2: Transform data to correct format
    const transformedData = {
      strength1: '',
      strength2: '',
      strength3: '',
      strength4: '',
      teamValues: '',
      uniqueContribution: ''
    };
    
    // Map reflection IDs to database columns
    reflectionData.forEach((reflection) => {
      switch (reflection.reflectionId) {
        case 'strength-1':
          transformedData.strength1 = reflection.response || '';
          break;
        case 'strength-2':
          transformedData.strength2 = reflection.response || '';
          break;
        case 'strength-3':
          transformedData.strength3 = reflection.response || '';
          break;
        case 'strength-4':
          transformedData.strength4 = reflection.response || '';
          break;
        case 'team-values':
          transformedData.teamValues = reflection.response || '';
          break;
        case 'unique-contribution':
          transformedData.uniqueContribution = reflection.response || '';
          break;
        default:
          console.warn('Unknown reflection ID:', reflection.reflectionId);
      }
    });
    
    console.log('🔄 Transformed data:', transformedData);
    
    // Step 3: Save to correct endpoint
    const response = await fetch('/api/workshop-data/step-by-step-reflection', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(transformedData)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to save to step-by-step-reflection: ${response.status} ${errorText}`);
    }
    
    const result = await response.json();
    console.log('✅ Successfully synced reflection data:', result);
    
    return { success: true, data: transformedData };
    
  } catch (error) {
    console.error('❌ Error syncing reflection data:', error);
    return { success: false, error: error.message };
  }
};

// Hook version for React components
export const useSyncReflectionData = () => {
  const trpcUtils = trpc.useUtils();
  
  const syncData = async () => {
    try {
      const reflectionData = await trpcUtils.reflections.getReflectionSet.fetch({
        reflectionSetId: 'strength-reflections'
      });
      
      const transformedData = {
        strength1: '',
        strength2: '',
        strength3: '',
        strength4: '',
        teamValues: '',
        uniqueContribution: ''
      };
      
      reflectionData.forEach((reflection) => {
        switch (reflection.reflectionId) {
          case 'strength-1':
            transformedData.strength1 = reflection.response || '';
            break;
          case 'strength-2':
            transformedData.strength2 = reflection.response || '';
            break;
          case 'strength-3':
            transformedData.strength3 = reflection.response || '';
            break;
          case 'strength-4':
            transformedData.strength4 = reflection.response || '';
            break;
          case 'team-values':
            transformedData.teamValues = reflection.response || '';
            break;
          case 'unique-contribution':
            transformedData.uniqueContribution = reflection.response || '';
            break;
        }
      });
      
      const response = await fetch('/api/workshop-data/step-by-step-reflection', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(transformedData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }
      
      const result = await response.json();
      return { success: true, data: result };
      
    } catch (error) {
      console.error('Sync error:', error);
      return { success: false, error: error.message };
    }
  };
  
  return { syncData };
};
