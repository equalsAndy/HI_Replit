import { useState, useEffect, useRef } from 'react';

interface VideoProgressHook {
  videoRef: React.RefObject<HTMLVideoElement>;
  progress: number;
  hasReachedMinimum: boolean;
  isPlaying: boolean;
  startVideo: () => void;
  pauseVideo: () => void;
}

/**
 * Hook for tracking video progress and auto-play functionality
 * Implements minimum watch percentage requirements from specifications
 */
export function useVideoProgress(
  stepId: string,
  minWatchPercent: number = 1,
  autoPlay: boolean = true,
  onProgressUpdate?: (stepId: string, percentage: number) => void
): VideoProgressHook {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [progress, setProgress] = useState(0);
  const [hasReachedMinimum, setHasReachedMinimum] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      if (autoPlay) {
        video.play().catch(console.error);
      }
    };

    const handleTimeUpdate = () => {
      if (video.duration) {
        const currentProgress = (video.currentTime / video.duration) * 100;
        setProgress(currentProgress);
        
        // Update parent component with progress
        onProgressUpdate?.(stepId, currentProgress);
        
        // Check if minimum watch requirement is met
        if (currentProgress >= minWatchPercent && !hasReachedMinimum) {
          setHasReachedMinimum(true);
        }
      }
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => {
      setIsPlaying(false);
      setHasReachedMinimum(true); // Video completion always meets minimum
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
    };
  }, [stepId, minWatchPercent, autoPlay, hasReachedMinimum, onProgressUpdate]);

  const startVideo = () => {
    videoRef.current?.play().catch(console.error);
  };

  const pauseVideo = () => {
    videoRef.current?.pause();
  };

  return {
    videoRef,
    progress,
    hasReachedMinimum,
    isPlaying,
    startVideo,
    pauseVideo
  };
}