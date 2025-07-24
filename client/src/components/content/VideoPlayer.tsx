import React, { useEffect, useRef, useState } from 'react';
import { useVideoBySection, useVideoByStepId } from '../../hooks/use-videos';
import { processVideoUrl, type VideoUrlParams } from '../../lib/videoUtils';

interface VideoPlayerProps {
  workshopType: string;
  section?: string;
  stepId?: string;
  title?: string;
  className?: string;
  fallbackUrl?: string;
  forceUrl?: string; // Force a specific video URL, bypassing database lookup
  aspectRatio?: '16:9' | '4:3' | '21:9';
  autoplay?: boolean;
  customParams?: VideoUrlParams;
  onProgress?: (percentage: number) => void;
  onUnlockNext?: (stepId: string) => void; // New callback for unlocking next step
  startTime?: number; // Start time in seconds for resume functionality
  /**
   * If true (default), hides the VideoPlayer entirely when no video is available for the given step/section.
   * If false, shows the fallback UI ("Video not available" message).
   */
  hideWhenUnavailable?: boolean;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  workshopType,
  section,
  stepId,
  title,
  className = "",
  fallbackUrl,
  forceUrl,
  aspectRatio = '16:9',
  autoplay = true,
  customParams = {},
  onProgress,
  onUnlockNext,
  startTime = 0,
  hideWhenUnavailable = true
}) => {
  // All hooks must be called unconditionally and in the same order
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [processedUrl, setProcessedUrl] = useState<string>('');
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [progressSimulated, setProgressSimulated] = useState(false);
  const [currentProgress, setCurrentProgress] = useState(0);

  // Always call hooks before any conditional return
  const { data: videoByStepId, isLoading: isLoadingStepId } = useVideoByStepId(
    workshopType, 
    stepId || ''
  );
  const { data: videoBySection, isLoading: isLoadingSection } = useVideoBySection(
    workshopType, 
    section || ''
  );
  const isLoading = isLoadingStepId || isLoadingSection;
  const video = videoByStepId || videoBySection;
  const noVideoAvailable = !forceUrl && !video?.url && !fallbackUrl;

  // Now safe to return conditionally
  if (!isLoading && hideWhenUnavailable && noVideoAvailable) {
    return null;
  }

  // Debug logging for video selection
  console.log(`🎬 VideoPlayer Debug - Step: ${stepId}, Workshop: ${workshopType}`);
  console.log(`🎬 VideoByStepId:`, videoByStepId ? { id: videoByStepId.id, title: videoByStepId.title, editableId: videoByStepId.editableId } : 'null');
  console.log(`🎬 VideoBySection:`, videoBySection ? { id: videoBySection.id, title: videoBySection.title, editableId: videoBySection.editableId } : 'null');
  console.log(`🎬 Selected video:`, video ? { id: video.id, title: video.title, editableId: video.editableId, url: video.url } : 'null');

  // Process the video URL when it changes
  useEffect(() => {
    // Use forceUrl if provided, otherwise use database video or fallback
    const rawUrl = forceUrl || video?.url || fallbackUrl;
    if (rawUrl) {
      const params: VideoUrlParams = {
        autoplay: autoplay ? 1 : 0,
        rel: 0,
        modestbranding: 1,
        showinfo: 0,
        controls: 1,
        mute: autoplay ? 1 : 0, // Mute for autoplay to avoid browser restrictions
        enablejsapi: 0, // Disable JS API to avoid loading issues
        ...customParams
      };
      
      const processed = processVideoUrl(rawUrl, params);
      setProcessedUrl(processed.embedUrl);
      
      // Debug logging for video selection
      if (forceUrl) {
        console.log(`🎬 VideoPlayer: Using forceUrl: ${forceUrl}`);
      } else {
        console.log(`🎬 VideoPlayer: Using ${video?.url ? 'database' : 'fallback'} URL: ${rawUrl}`);
      }
    }
  }, [forceUrl, video?.url, fallbackUrl, autoplay, customParams]);

  // Enhanced progress tracking with unlocking logic
  useEffect(() => {
    if (videoLoaded && onProgress && !progressSimulated) {
      setProgressSimulated(true);
      
      // Simulate progressive tracking with multiple checkpoints
      const progressCheckpoints = [10, 25, 50, 75, 90, 100];
      let checkpointIndex = 0;
      
      const progressTimer = setInterval(() => {
        if (checkpointIndex < progressCheckpoints.length) {
          const progress = progressCheckpoints[checkpointIndex];
          setCurrentProgress(progress);
          onProgress(progress);
          
          console.log(`🎬 Video progress: ${progress}% for step ${stepId}`);
          
          // Check if this progress meets the required threshold for unlocking
          const requiredThreshold = video?.requiredWatchPercentage || 75;
          if (progress >= requiredThreshold && onUnlockNext && stepId) {
            console.log(`🔓 Unlocking next step - watched ${progress}% (required: ${requiredThreshold}%)`);
            onUnlockNext(stepId);
          }
          
          checkpointIndex++;
        } else {
          clearInterval(progressTimer);
        }
      }, 2000); // Progress every 2 seconds for demo
      
      return () => clearInterval(progressTimer);
    }
  }, [videoLoaded, onProgress, onUnlockNext, stepId, video?.requiredWatchPercentage, progressSimulated]);

  // Handle iframe load event
  const handleIframeLoad = () => {
    console.log('🎬 Video iframe loaded successfully');
    setVideoLoaded(true);
  };

  // Get aspect ratio class
  const aspectClass = {
    '16:9': 'video-aspect-16-9',
    '4:3': 'video-aspect-4-3', 
    '21:9': 'video-aspect-21-9'
  }[aspectRatio];

  if (isLoading) {
    return (
      <div className={`video-responsive-container ${className}`}>
        <div className={`video-aspect-wrapper ${aspectClass}`}>
          <div className="video-responsive-element video-loading">
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading video...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const videoTitle = video?.title || title || 'Workshop Video';

  if (!processedUrl) {
    if (hideWhenUnavailable) {
      return null;
    }
    return (
      <div className={`video-responsive-container ${className}`}>
        <div className={`video-aspect-wrapper ${aspectClass}`}>
          <div className="video-responsive-element bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
            <div className="text-center">
              <div className="text-gray-400 text-4xl mb-2">📹</div>
              <span className="text-gray-500">Video not available</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`video-responsive-container ${className}`}>
      <div className={`video-aspect-wrapper ${aspectClass}`}>
        <iframe 
          ref={iframeRef}
          src={processedUrl}
          title={videoTitle}
          className="video-responsive-element"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          frameBorder="0"
          onLoad={handleIframeLoad}
        />
      </div>
    </div>
  );
};

export default VideoPlayer;