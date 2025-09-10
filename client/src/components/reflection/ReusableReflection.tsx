import React, { useState, useEffect, useCallback } from 'react';
import { trpc } from '@/utils/trpc';
import { useQueryClient } from '@tanstack/react-query';
import debounce from 'lodash/debounce';
import { CheckCircle, Lock } from 'lucide-react';

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
  const queryClient = useQueryClient();
  const trpcUtils = trpc.useUtils();

  const { data: existingReflections, isLoading, refetch } = trpc.reflections.getReflectionSet.useQuery(
    { reflectionSetId },
    {
      staleTime: 0, // Always consider data stale to refresh more frequently
      cacheTime: 0, // Don't cache this query
      refetchOnWindowFocus: true, // Refetch when user returns to the tab
      // Force refetch when forceRefreshKey changes
      queryKey: ['reflections', 'getReflectionSet', { reflectionSetId }, forceRefreshKey],
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
      console.log('🔄 Data cleared event received, invalidating reflection cache...');
      console.log('🔄 Current reflectionSetId:', reflectionSetId);
      
      // Use proper tRPC utils to invalidate the specific query
      trpcUtils.reflections.getReflectionSet.invalidate({ reflectionSetId })
        .then(() => {
          console.log('✅ tRPC query invalidated successfully');
        })
        .catch((err) => {
          console.error('❌ tRPC query invalidation failed:', err);
        });
      
      // Force a complete refresh by updating the key
      setForceRefreshKey(prev => prev + 1);
      
      // Also force refetch this specific query
      refetch();
      
      // Reset local state
      setResponses({});
      setCurrentReflectionIndex(0);
      
      console.log('🔄 Local state reset complete');
    };

    const handleAssessmentCompleted = () => {
      console.log('🔄 Assessment completed event received, refreshing reflection data...');
      refetch();
    };

    // Listen for various data clearing events
    window.addEventListener('userDataCleared', handleDataCleared);
    window.addEventListener('assessmentDataCleared', handleDataCleared);
    window.addEventListener('workshopDataReset', handleDataCleared);
    window.addEventListener('assessmentCompleted', handleAssessmentCompleted);

    return () => {
      window.removeEventListener('userDataCleared', handleDataCleared);
      window.removeEventListener('assessmentDataCleared', handleDataCleared);
      window.removeEventListener('workshopDataReset', handleDataCleared);
      window.removeEventListener('assessmentCompleted', handleAssessmentCompleted);
    };
  }, [refetch, trpcUtils, reflectionSetId]);

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
  };

  const completeReflection = async (id: string) => {
    if (!workshopLocked) {
      await completeMutation.mutateAsync({ reflectionSetId, reflectionId: id });
      // Refetch data to ensure progressive reveal logic has latest completion state
      await refetch();
    }
    if (progressiveReveal) {
      const next = currentReflectionIndex + 1;
      if (next < reflections.length) setCurrentReflectionIndex(next);
      else onComplete?.();
    } else {
      onComplete?.();
    }
  };

  const isValid = (ref: ReflectionConfig) => {
    if (workshopLocked) return true;
    const resp = responses[ref.id] || '';
    const min = ref.minLength || 20;
    return resp.trim().length >= min;
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const visible = progressiveReveal ? reflections.slice(0, currentReflectionIndex + 1) : reflections;

  return (
    <div className={className}>
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
