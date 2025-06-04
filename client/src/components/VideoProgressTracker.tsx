/**
 * Video Progress Tracker Component
 * Tracks video watch progress and enforces minimum watch requirements
 */

import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useProgressionTracker } from '@/hooks/use-progression-tracker';
import { getMenuItemName } from '@/lib/progressionLogic';

interface VideoProgressTrackerProps {
  stepId: string;
  videoUrl: string;
  minWatchPercent?: number;
  autoPlay?: boolean;
  nextStepId?: string;
  onComplete?: () => void;
  children?: React.ReactNode;
}

export function VideoProgressTracker({
  stepId,
  videoUrl,
  minWatchPercent = 1,
  autoPlay = true,
  nextStepId,
  onComplete,
  children
}: VideoProgressTrackerProps) {
  const videoRef = useRef<HTMLIFrameElement>(null);
  const [watchProgress, setWatchProgress] = useState(0);
  const [canProceed, setCanProceed] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  
  const {
    progressionState,
    updateVideoProgress,
    markStepCompleted,
    getNextButtonText
  } = useProgressionTracker();

  // Check if step is already completed
  useEffect(() => {
    const isStepCompleted = progressionState.completedSteps.includes(stepId);
    const existingProgress = progressionState.videoProgress[stepId] || 0;
    
    setIsCompleted(isStepCompleted);
    setWatchProgress(existingProgress);
    setCanProceed(isStepCompleted || existingProgress >= minWatchPercent);
  }, [stepId, progressionState, minWatchPercent]);

  const handleNextClick = async () => {
    if (!canProceed) return;
    
    try {
      await markStepCompleted(stepId, {
        type: 'video',
        watchProgress,
        completedAt: new Date().toISOString()
      });
      
      setIsCompleted(true);
      
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error('Error completing video step:', error);
    }
  };

  const nextButtonText = nextStepId ? `Next: ${getMenuItemName(nextStepId)}` : getNextButtonText(stepId);

  // Simulate video progress for now (will be enhanced with actual video API)
  useEffect(() => {
    if (!isCompleted && watchProgress < minWatchPercent) {
      const timer = setTimeout(() => {
        const progress = Math.max(minWatchPercent, 5);
        setWatchProgress(progress);
        updateVideoProgress(stepId, progress);
        setCanProceed(true);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [stepId, minWatchPercent, watchProgress, isCompleted, updateVideoProgress]);

  return (
    <div className="space-y-6">
      {/* Video Player */}
      <div className="aspect-video w-full">
        <iframe
          ref={videoRef}
          className="w-full h-full rounded-lg"
          src={videoUrl}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>

      {/* Progress Indicator */}
      {!isCompleted && (
        <div className="bg-gray-100 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Watch Progress</span>
            <span className="text-sm text-gray-500">{watchProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.max(watchProgress, 0)}%` }}
            />
          </div>
          {watchProgress < minWatchPercent && (
            <p className="text-xs text-gray-500 mt-2">
              Watch at least {minWatchPercent}% to continue
            </p>
          )}
        </div>
      )}

      {/* Additional Content */}
      {children}

      {/* Next Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleNextClick}
          disabled={!canProceed}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2"
        >
          {nextButtonText}
        </Button>
      </div>

      {/* Completion Status */}
      {isCompleted && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">
                Step completed successfully!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}