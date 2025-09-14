import React, { useState, useEffect, useCallback } from 'react';
import { trpc } from '@/utils/trpc';
import { useQueryClient } from '@tanstack/react-query';
import debounce from 'lodash/debounce';
import { CheckCircle, Lock } from 'lucide-react';
import { syncStrengthReflections } from '@/utils/syncStrengthReflections';

interface ReflectionConfig {
  id: string;
  instruction?: string;
  question: string;
  example?: string;
  bullets?: string[];
  examples?: string[];
  strengthColor?: { bg: string; border: string; text: string; name: string };
  minLength?: number;
}

interface ReusableReflectionProps {
  reflectionSetId: string;
  reflections: ReflectionConfig[];
  progressiveReveal?: boolean;
  onComplete?: () => void;
  workshopLocked?: boolean;
  className?: string;
  completionButtonText?: string;
}

export default function ReusableReflection({
  reflectionSetId,
  reflections,
  progressiveReveal = false,
  onComplete,
  workshopLocked = false,
  className = '',
  completionButtonText = 'Continue',
}: ReusableReflectionProps) {
  const [currentReflectionIndex, setCurrentReflectionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [forceRefreshKey, setForceRefreshKey] = useState(0);
  
  // Save progressive revelation state to localStorage
  const storageKey = `reflection-progress-${reflectionSetId}`;
  
  const updateProgressStorage = useCallback((index: number) => {
    localStorage.setItem(storageKey, index.toString());
  }, [storageKey]);
  
  // Restore progress from localStorage
  useEffect(() => {
    const savedProgress = localStorage.getItem(storageKey);
    if (savedProgress && progressiveReveal) {
      const savedIndex = parseInt(savedProgress, 10);
      if (savedIndex >= 0 && savedIndex < reflections.length) {
        setCurrentReflectionIndex(savedIndex);
      }
    }
  }, [storageKey, progressiveReveal, reflections.length]);
  
  const queryClient = useQueryClient();
  const trpcUtils = trpc.useUtils();

  const { data: existingReflections, isLoading, refetch } = trpc.reflections.getReflectionSet.useQuery(
    { reflectionSetId },
    {
      staleTime: 5000,
      refetchOnWindowFocus: false,
    }
  );
  const saveMutation = trpc.reflections.saveReflection.useMutation();
  const completeMutation = trpc.reflections.completeReflection.useMutation();

  useEffect(() => {
    if (existingReflections) {
      const map: Record<string, string> = {};
      let lastDone = -1;
      existingReflections.forEach(r => {
        map[r.reflectionId] = r.response;
        if (r.completed) {
          const idx = reflections.findIndex(x => x.id === r.reflectionId);
          if (idx > lastDone) lastDone = idx;
        }
      });
      setResponses(map);
      if (progressiveReveal) {
        setCurrentReflectionIndex(Math.min(lastDone + 1, reflections.length - 1));
      }
    }
  }, [existingReflections, reflections, progressiveReveal]);

  // Listen for data clearing events to refresh reflection data
  useEffect(() => {
    const handleDataCleared = () => {
      console.log('🔄 Data cleared event received for reflectionSetId=', reflectionSetId);
      console.log('🔄 Current reflectionSetId:', reflectionSetId);
      
      // AGGRESSIVE CACHE CLEARING
      // 1. Invalidate all reflection queries
      console.log('🔍 Invalidating ALL tRPC reflection queries');
      trpcUtils.reflections.invalidate()
        .then(() => console.log('✅ ALL tRPC reflection queries invalidated'))
        .catch((err) => console.error('❌ tRPC reflection invalidation failed:', err));
      
      // 2. Remove specific query from cache
      queryClient.removeQueries({
        queryKey: ['trpc', 'reflections', 'getReflectionSet'],
        exact: false
      });
      
      // 3. Clear all cached data for this specific reflection set
      queryClient.removeQueries({
        queryKey: ['reflections', 'getReflectionSet', { reflectionSetId }],
        exact: false
      });
      
      // 4. Force a complete refresh by updating the key
      setForceRefreshKey(prev => prev + 1);
      
      // 5. Reset local UI state completely
      setResponses({});
      setCurrentReflectionIndex(0);
      
      console.log('🔄 Complete reflection cache clearing completed');
    };

    const handleAssessmentCompleted = () => {
      console.log('🔄 Assessment completed event received, refreshing reflection data...');
      refetch();
    };

    // Listen for various data clearing events
    window.addEventListener('userDataCleared', handleDataCleared);
    window.addEventListener('assessmentDataCleared', handleDataCleared);
    window.addEventListener('workshopDataReset', handleDataCleared);
    window.addEventListener('reflectionDataCleared', handleDataCleared); // New event specifically for reflections
    window.addEventListener('assessmentCompleted', handleAssessmentCompleted);

    return () => {
      window.removeEventListener('userDataCleared', handleDataCleared);
      window.removeEventListener('assessmentDataCleared', handleDataCleared);
      window.removeEventListener('workshopDataReset', handleDataCleared);
      window.removeEventListener('reflectionDataCleared', handleDataCleared);
      window.removeEventListener('assessmentCompleted', handleAssessmentCompleted);
    };
  }, [refetch, trpcUtils, reflectionSetId, queryClient]);

  const debouncedSave = useCallback(
    debounce(async (id, resp) => {
      if (!workshopLocked && resp.trim()) {
        await saveMutation.mutateAsync({ reflectionSetId, reflectionId: id, response: resp.trim() });
      }
    }, 1000),
    [reflectionSetId, saveMutation, workshopLocked]
  );

  const handleChange = (id: string, value: string) => {
    setResponses(prev => ({ ...prev, [id]: value }));
    debouncedSave(id, value);

    // Force re-render to update button state
    setForceRefreshKey(prev => prev + 1);
  };

  const completeReflection = async (id: string) => {
    if (!workshopLocked) {
      await completeMutation.mutateAsync({ reflectionSetId, reflectionId: id });
    }
    
    // SYNC DATA AFTER EACH REFLECTION COMPLETION - SYNC ALL CURRENT RESPONSES
    if (reflectionSetId === 'strength-reflections') {
      try {
        console.log('🔄 Auto-syncing ALL reflection data after completing:', id);
        
        // Get current responses from local state and fetch latest from server
        const currentReflectionData = await trpcUtils.reflections.getReflectionSet.fetch({
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
        
        // Use the most recent data from tRPC
        currentReflectionData.forEach((reflection) => {
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
        
        console.log('📊 Auto-sync data being sent:', transformedData);
        
        // Save to correct endpoint
        const response = await fetch('/api/workshop-data/step-by-step-reflection', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(transformedData)
        });
        
        if (response.ok) {
          console.log('✅ Auto-sync completed successfully for:', id);
        } else {
          console.error('❌ Auto-sync failed with status:', response.status);
        }
      } catch (error) {
        console.error('⚠️ Auto-sync failed for reflection:', id, error);
      }
    }
    
    if (progressiveReveal) {
      const currentIdx = reflections.findIndex(r => r.id === id);
      if (currentIdx === reflections.length - 1) {
        // This is the last reflection - call onComplete and clear storage
        console.log('🎯 Last reflection completed, calling onComplete');
        localStorage.removeItem(storageKey); // Clear progress when workshop is complete
        onComplete?.();
      } else {
        // Move to next reflection and save progress
        const nextIndex = currentIdx + 1;
        setCurrentReflectionIndex(nextIndex);
        updateProgressStorage(nextIndex);
        console.log(`📈 Progress saved: moved to reflection ${nextIndex + 1} of ${reflections.length}`);
      }
    } else {
      onComplete?.();
    }
  };

  const isValid = (ref: ReflectionConfig) => {
    if (workshopLocked) return true;

    // Check local state first
    const localResp = responses[ref.id] || '';
    const min = ref.minLength || 20;

    // Also check current textarea value directly (in case responses state is stale)
    const textareaElement = document.querySelector(`textarea[data-reflection-id="${ref.id}"]`) as HTMLTextAreaElement;
    const currentTextareaValue = textareaElement?.value || '';

    // Also check if reflection is marked as completed in database
    const dbReflection = existingReflections?.find(r => r.reflectionId === ref.id);
    const isCompletedInDb = dbReflection?.completed;
    const dbResp = dbReflection?.response || '';

    // Valid if any of these conditions are met:
    // 1. Local response meets min length
    // 2. Current textarea value meets min length
    // 3. Completed in database with valid response
    return localResp.trim().length >= min ||
           currentTextareaValue.trim().length >= min ||
           (isCompletedInDb && dbResp.trim().length >= min);
  };


  const visible = progressiveReveal ? reflections.slice(0, currentReflectionIndex + 1) : reflections;

  return (
    <div className={className}>
      {/* TEMPORARY DEBUG PANEL - Remove after testing */}
      <div className="mb-6 bg-yellow-100 border-4 border-yellow-500 p-4 rounded-lg">
        <h3 className="text-lg font-bold text-yellow-800 mb-2">
          🔧 DEBUG TOOLS (ReusableReflection)
        </h3>
        <div className="flex gap-2 flex-wrap mb-2">
          <button 
            onClick={async () => {
              console.log('🧹 NUCLEAR cache clear - deleting database records...');
              try {
                // First clear query cache
                queryClient.removeQueries({ queryKey: ['trpc'], exact: false });
                queryClient.removeQueries({ queryKey: ['reflections'], exact: false });
                await trpcUtils.reflections.invalidate();
                
                // CLEAR the actual database records by setting empty responses
                const reflectionData = await trpcUtils.reflections.getReflectionSet.fetch({
                  reflectionSetId: 'strength-reflections'
                });
                
                console.log(`Found ${reflectionData.length} reflections to clear`);
                
                // Clear each reflection by deleting from database
                const clearPromises = reflectionData.map(async (reflection) => {
                  try {
                    // DELETE request to clear the reflection completely
                    const response = await fetch(`/api/reflections/${reflectionSetId}/${reflection.reflectionId}`, {
                      method: 'DELETE',
                      credentials: 'include'
                    });
                    
                    if (response.ok) {
                      console.log(`Deleted: ${reflection.reflectionId}`);
                      return true;
                    } else {
                      // Fallback: clear response content
                      await saveMutation.mutateAsync({
                        reflectionSetId: 'strength-reflections',
                        reflectionId: reflection.reflectionId,
                        response: '' // Clear the response content
                      });
                      console.log(`Cleared content: ${reflection.reflectionId}`);
                      return true;
                    }
                  } catch (err) {
                    console.warn(`Could not clear ${reflection.reflectionId}:`, err);
                    try {
                      // Fallback: clear response content
                      await saveMutation.mutateAsync({
                        reflectionSetId: 'strength-reflections',
                        reflectionId: reflection.reflectionId,
                        response: '' // Clear the response content
                      });
                      console.log(`Fallback cleared: ${reflection.reflectionId}`);
                      return true;
                    } catch (fallbackErr) {
                      console.error(`Fallback also failed for ${reflection.reflectionId}:`, fallbackErr);
                      return false;
                    }
                  }
                });
                
                // Wait for all clearing operations to complete
                await Promise.all(clearPromises);
                console.log('All reflection clearing mutations completed');
                
                // Clear local state completely
                setResponses({});
                setCurrentReflectionIndex(0);
                setForceRefreshKey(prev => prev + 1);
                
                // Clear localStorage state
                localStorage.removeItem(storageKey);
                localStorage.removeItem('ast-star-card-visible');
                
                // Reset progressive revelation state
                setCurrentReflectionIndex(0); // This should show only the first reflection
                
                // Final cache invalidation
                await trpcUtils.reflections.invalidate();
                
                console.log('✅ Database records cleared and cache refreshed');
                alert('CACHE CLEARED: All reflection data has been cleared');
              } catch (error) {
                console.error('❌ Nuclear clear error:', error);
                alert('Nuclear clear failed - check console');
              }
            }}
            className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
          >
            🧹 Clear Cache
          </button>
          
          <button 
            onClick={async () => {
              console.log('🗺 Manual sync starting...');
              try {
                // Get reflection data
                const reflectionData = await trpcUtils.reflections.getReflectionSet.fetch({
                  reflectionSetId: 'strength-reflections'
                });
                
                // Transform data
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
                
                console.log('📊 Transformed data:', transformedData);
                
                // Save to correct endpoint
                const response = await fetch('/api/workshop-data/step-by-step-reflection', {
                  method: 'POST',
                  credentials: 'include',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(transformedData)
                });
                
                if (response.ok) {
                  console.log('✅ Sync successful');
                  alert('Sync successful! Data saved to step-by-step-reflection endpoint');
                } else {
                  throw new Error(`HTTP ${response.status}`);
                }
              } catch (error) {
                console.error('❌ Sync error:', error);
                alert('Sync failed - check console');
              }
            }}
            className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
          >
            🗺 Sync Data
          </button>
          
          <button 
            onClick={async () => {
              console.log('🔍 Debug current state...');
              try {
                const reflectionData = await trpcUtils.reflections.getReflectionSet.fetch({
                  reflectionSetId: 'strength-reflections'
                });
                console.log('📊 Current tRPC data:', reflectionData);
                
                const stepData = await fetch('/api/workshop-data/step-by-step-reflection', {
                  credentials: 'include'
                }).then(r => r.json());
                console.log('📊 Current step-by-step data:', stepData);
                
                alert('Debug complete - check console for data');
              } catch (error) {
                console.error('❌ Debug error:', error);
              }
            }}
            className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
          >
            🔍 Debug
          </button>
        </div>
        <p className="text-xs text-yellow-700">
          Reflection set: {reflectionSetId} | Responses: {Object.keys(responses).length} | Current index: {currentReflectionIndex}
        </p>
      </div>
      
      {visible.map((ref, idx) => (
        <div key={ref.id} className="mb-6">
          {ref.strengthColor && (
            <div className="flex items-start mb-2">
              <div
                className={`w-[100px] h-[100px] rounded-lg flex items-center justify-center text-white font-bold text-sm leading-tight ${ref.strengthColor.bg}`}
              >
                {ref.strengthColor.name}
              </div>
              <div className="flex-1 ml-4">
                <p className="text-lg font-semibold text-gray-800">{ref.question}</p>
                {ref.instruction && <p className="text-gray-600 mb-2">{ref.instruction}</p>}
              </div>
            </div>
          )}
          {!ref.strengthColor && <p className="text-lg font-semibold mb-2">{ref.question}</p>}

          {/* Bullets for guidance */}
          {ref.bullets && ref.bullets.length > 0 && (
            <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-700 mb-2">Consider reflecting on:</p>
              <ul className="list-disc ml-5 text-sm text-gray-700 space-y-1">
                {ref.bullets.map((bullet, index) => (
                  <li key={index}>{bullet}</li>
                ))}
              </ul>
            </div>
          )}

          <textarea
            className="w-full border p-2 rounded resize-vertical"
            rows={4}
            value={responses[ref.id] || ''}
            onChange={e => handleChange(ref.id, e.target.value)}
            disabled={workshopLocked}
            data-reflection-id={ref.id}
          />

          {/* Examples */}
          {ref.examples && ref.examples.length > 0 && (
            <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs font-medium text-blue-800 mb-2">Examples:</p>
              {ref.examples.map((example, index) => (
                <p key={index} className="text-xs text-blue-700 mb-2 last:mb-0 italic">
                  "{example}"
                </p>
              ))}
            </div>
          )}

          {/* Legacy example field for backward compatibility */}
          {!ref.examples && ref.example && (
            <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs font-medium text-blue-800 mb-2">Example:</p>
              <p className="text-xs text-blue-700 italic">"{ref.example}"</p>
            </div>
          )}

          <div className="mt-2 flex justify-end items-center gap-3">
            {progressiveReveal && visible.length === idx + 1 && (
              <button
                onClick={() => completeReflection(ref.id)}
                disabled={!isValid(ref)}
                className={`px-4 py-2 rounded font-medium ${isValid(ref) ? 'bg-indigo-600 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
              >
                {idx === reflections.length - 1 ? completionButtonText : 'Next'}
              </button>
            )}
            {!progressiveReveal && idx === visible.length - 1 && (
              <button
                onClick={() => completeReflection(ref.id)}
                disabled={!isValid(ref)}
                className={`px-4 py-2 rounded font-medium ${isValid(ref) ? 'bg-indigo-600 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
              >{completionButtonText}</button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
