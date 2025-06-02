import React from 'react';
import { useVideoBySection, useVideoByStepId } from '@/hooks/use-videos';

interface VideoPlayerProps {
  workshopType: string;
  section?: string;
  stepId?: string;
  title?: string;
  className?: string;
  fallbackUrl?: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  workshopType,
  section,
  stepId,
  title,
  className = "w-full h-[400px] rounded-lg",
  fallbackUrl
}) => {
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

  if (isLoading) {
    return (
      <div className={`${className} bg-gray-200 animate-pulse flex items-center justify-center`}>
        <span className="text-gray-500">Loading video...</span>
      </div>
    );
  }

  // Use the video URL from database or fallback
  const videoUrl = video?.url || fallbackUrl;
  const videoTitle = video?.title || title || 'Workshop Video';

  if (!videoUrl) {
    return (
      <div className={`${className} bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center`}>
        <span className="text-gray-500">Video not configured</span>
      </div>
    );
  }

  return (
    <iframe 
      src={videoUrl}
      title={videoTitle}
      className={className}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
      allowFullScreen
    />
  );
};

export default VideoPlayer;