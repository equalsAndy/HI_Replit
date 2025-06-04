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
    if (iframeRef.current && processedUrl) {
      // Initialize player function
      const initializePlayer = () => {
        const videoId = processedUrl.match(/embed\/([^?]+)/)?.[1];
        console.log('🎬 Attempting to initialize player with videoId:', videoId);
        
        if (videoId && iframeRef.current) {
          try {
            // Create a unique ID for the iframe if it doesn't have one
            const iframe = iframeRef.current;
            if (!iframe.id) {
              iframe.id = `youtube-player-${stepId}-${Date.now()}`;
            }
            
            console.log('🎬 Creating YouTube player for iframe:', iframe.id);
            
            const ytPlayer = new window.YT.Player(iframe.id, {
              videoId: videoId,
              events: {
                onReady: (event: any) => {
                  console.log('🎬 YouTube player ready for step:', stepId);
                  setPlayer(event.target);
                  if (onProgress) {
                    startProgressTracking(event.target);
                  }
                },
                onStateChange: (event: any) => {
                  console.log('🎬 Player state changed:', event.data);
                  if (event.data === window.YT.PlayerState.PLAYING) {
                    console.log('🎬 Video started playing, starting progress tracking');
                    if (onProgress) {
                      startProgressTracking(event.target);
                    }
                  } else if (event.data === window.YT.PlayerState.ENDED) {
                    console.log('🎬 Video ended - marking as 100% complete');
                    stopProgressTracking();
                    // When video ends, ensure it's marked as 100% complete
                    if (onProgress) {
                      onProgress(100);
                    }
                  } else if (event.data === window.YT.PlayerState.PAUSED) {
                    console.log('🎬 Video paused, stopping progress tracking');
                    stopProgressTracking();
                  }
                }
              }
            });
          } catch (error) {
            console.error('🎬 YouTube API initialization failed:', error);
          }
        } else {
          console.error('🎬 Cannot initialize player - missing videoId or iframe ref');
        }
      };

      // Load YouTube API if not already loaded
      if (!window.YT || !window.YT.Player) {
        console.log('🎬 Loading YouTube API...');
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
        
        window.onYouTubeIframeAPIReady = () => {
          console.log('🎬 YouTube API loaded successfully');
          setTimeout(initializePlayer, 500); // Small delay to ensure API is ready
        };
        
        // Check API load after timeout
        setTimeout(() => {
          if (!window.YT || !window.YT.Player) {
            console.error('🎬 YouTube API failed to load after 5 seconds');
          }
        }, 5000);
      } else {
        console.log('🎬 YouTube API already loaded');
        setTimeout(initializePlayer, 100);
      }
      
      handleAutoplayFallback(iframeRef.current);
    }
    
    return () => {
      stopProgressTracking();
    };
  }, [processedUrl, onProgress]);

  // Progress tracking functions
  const lastLoggedProgressRef = useRef(0);
  
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
          
          // Treat videos as 100% complete if they're within 2% of the end
          // This handles cases where YouTube doesn't report exact 100%
          const adjustedPercentage = percentage >= 98 ? 100 : percentage;
          
          // Only log significant progress changes (every 10% or when reaching key thresholds)
          if (Math.abs(adjustedPercentage - lastLoggedProgressRef.current) >= 10 || 
              (adjustedPercentage >= 1 && lastLoggedProgressRef.current < 1) ||
              (adjustedPercentage >= 0.5 && lastLoggedProgressRef.current < 0.5) ||
              (adjustedPercentage === 100 && lastLoggedProgressRef.current < 100)) {
            console.log(`🎬 Video progress: ${adjustedPercentage.toFixed(2)}%`);
            lastLoggedProgressRef.current = adjustedPercentage;
          }
          
          if (onProgress) {
            onProgress(adjustedPercentage);
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