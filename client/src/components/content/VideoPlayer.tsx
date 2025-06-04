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
  onProgress?: (percentage: number) => void;
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
  customParams = {},
  onProgress
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [processedUrl, setProcessedUrl] = useState<string>('');
  const [player, setPlayer] = useState<any>(null);
  const [progressCheckInterval, setProgressCheckInterval] = useState<NodeJS.Timeout | null>(null);
  
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

  // Debug logging for video selection
  console.log(`🎬 VideoPlayer Debug - Step: ${stepId}, Workshop: ${workshopType}`);
  console.log(`🎬 VideoByStepId:`, videoByStepId ? { id: videoByStepId.id, title: videoByStepId.title, editableId: videoByStepId.editableId } : 'null');
  console.log(`🎬 VideoBySection:`, videoBySection ? { id: videoBySection.id, title: videoBySection.title, editableId: videoBySection.editableId } : 'null');
  console.log(`🎬 Selected video:`, video ? { id: video.id, title: video.title, editableId: video.editableId, url: video.url } : 'null');

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

  // Initialize YouTube API and progress tracking
  useEffect(() => {
    if (iframeRef.current && processedUrl && onProgress) {
      // Initialize player function
      const initializePlayer = () => {
        const videoId = processedUrl.match(/embed\/([^?]+)/)?.[1];
        if (videoId) {
          const ytPlayer = new window.YT.Player(iframeRef.current, {
            events: {
              onReady: () => {
                console.log('🎬 YouTube player ready');
                setPlayer(ytPlayer);
                startProgressTracking(ytPlayer);
              },
              onStateChange: (event: any) => {
                if (event.data === window.YT.PlayerState.PLAYING) {
                  startProgressTracking(ytPlayer);
                } else if (event.data === window.YT.PlayerState.PAUSED || 
                          event.data === window.YT.PlayerState.ENDED) {
                  stopProgressTracking();
                }
              }
            }
          });
        }
      };

      // Load YouTube API if not already loaded
      if (!window.YT) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
        
        window.onYouTubeIframeAPIReady = () => {
          initializePlayer();
        };
      } else {
        initializePlayer();
      }
      
      handleAutoplayFallback(iframeRef.current);
    }
    
    return () => {
      stopProgressTracking();
    };
  }, [processedUrl, onProgress]);

  // Progress tracking functions
  const startProgressTracking = (ytPlayer: any) => {
    if (progressCheckInterval) {
      clearInterval(progressCheckInterval);
    }
    
    const interval = setInterval(() => {
      if (ytPlayer && ytPlayer.getCurrentTime && ytPlayer.getDuration) {
        const currentTime = ytPlayer.getCurrentTime();
        const duration = ytPlayer.getDuration();
        
        if (duration > 0) {
          const percentage = (currentTime / duration) * 100;
          console.log(`🎬 Video progress: ${percentage.toFixed(2)}%`);
          
          if (onProgress) {
            onProgress(percentage);
          }
        }
      }
    }, 1000); // Check every second
    
    setProgressCheckInterval(interval);
  };

  const stopProgressTracking = () => {
    if (progressCheckInterval) {
      clearInterval(progressCheckInterval);
      setProgressCheckInterval(null);
    }
  };

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