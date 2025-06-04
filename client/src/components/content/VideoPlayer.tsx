import React, { useEffect, useRef, useState } from 'react';
import { useVideoBySection, useVideoByStepId } from '@/hooks/use-videos';
import { processVideoUrl, handleAutoplayFallback, type VideoUrlParams } from '@/lib/videoUtils';

interface VideoPlayerProps {
  workshopType: string;
  section?: string;
  stepId?: string;
  title?: string;
  className?: string;
  fallbackUrl?: string;
  aspectRatio?: '16:9' | '4:3' | '21:9';
  autoplay?: boolean;
  customParams?: VideoUrlParams;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  workshopType,
  section,
  stepId,
  title,
  className = "",
  fallbackUrl,
  aspectRatio = '16:9',
  autoplay = true,
  customParams = {}
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [processedUrl, setProcessedUrl] = useState<string>('');
  
  // Try to get video by stepId first, then by section
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

  // Process the video URL when it changes
  useEffect(() => {
    const rawUrl = video?.url || fallbackUrl;
    if (rawUrl) {
      const params: VideoUrlParams = {
        autoplay: autoplay ? 1 : 0,
        rel: 0,
        modestbranding: 1,
        showinfo: 0,
        controls: 1,
        mute: 0,
        enablejsapi: 1,
        ...customParams
      };
      
      const processed = processVideoUrl(rawUrl, params);
      setProcessedUrl(processed.embedUrl);
    }
  }, [video?.url, fallbackUrl, autoplay, customParams]);

  // Handle autoplay fallback after iframe loads
  useEffect(() => {
    if (iframeRef.current && processedUrl) {
      handleAutoplayFallback(iframeRef.current);
    }
  }, [processedUrl]);

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
            <span className="text-gray-500">Loading video...</span>
          </div>
        </div>
      </div>
    );
  }

  const videoTitle = video?.title || title || 'Workshop Video';

  if (!processedUrl) {
    return (
      <div className={`video-responsive-container ${className}`}>
        <div className={`video-aspect-wrapper ${aspectClass}`}>
          <div className="video-responsive-element bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
            <span className="text-gray-500">Video not configured</span>
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
        />
      </div>
    </div>
  );
};

export default VideoPlayer;