import React, { useState, useEffect, useCallback } from 'react';
import { trpc } from '@/utils/trpc';
import debounce from 'lodash/debounce';
import { CheckCircle, Lock } from 'lucide-react';

interface ReflectionConfig {
  id: string;
  instruction?: string;
  question: string;
  example: string;
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
}

export default function ReusableReflection({
  reflectionSetId,
  reflections,
  progressiveReveal = false,
  onComplete,
  workshopLocked = false,
  className = '',
}: ReusableReflectionProps) {
  const [currentReflectionIndex, setCurrentReflectionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, string>>({});

  const { data: existingReflections, isLoading } = trpc.reflections.getReflectionSet.useQuery({ reflectionSetId });
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

          <textarea
            className="w-full border p-2 rounded resize-vertical" 
            rows={4}
            value={responses[ref.id] || ''}
            onChange={e => handleChange(ref.id, e.target.value)}
            disabled={workshopLocked}
          />

          <div className="mt-2 flex justify-end items-center gap-3">
            {progressiveReveal && visible.length === idx + 1 && (
              <button
                onClick={() => completeReflection(ref.id)}
                disabled={!isValid(ref)}
                className={`px-4 py-2 rounded font-medium ${isValid(ref) ? 'bg-indigo-600 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
              >Next</button>
            )}
            {!progressiveReveal && idx === visible.length - 1 && (
              <button
                onClick={() => completeReflection(ref.id)}
                disabled={!isValid(ref)}
                className={`px-4 py-2 rounded font-medium ${isValid(ref) ? 'bg-indigo-600 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
              >Continue</button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
