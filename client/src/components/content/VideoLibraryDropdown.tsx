import React, { useState } from 'react';
import { Play } from 'lucide-react';
import { useVideosByWorkshop } from '@/hooks/use-videos';
import { VideoPlayer } from '@/components/content/VideoPlayer';

interface VideoLibraryDropdownProps {
  workshopType: 'allstarteams' | 'imaginal-agility';
  className?: string;
  /**
   * Optional: Filter videos by specific step IDs
   * If provided, only these videos will be shown in the dropdown
   * Example: ['1-1', '1-2', '2-1', '5-1']
   */
  filterByStepIds?: string[];
  /**
   * Optional: Custom title for the library section
   */
  title?: string;
  /**
   * Optional: Custom description for the library section
   */
  description?: string;
}

/**
 * VideoLibraryDropdown Component
 * 
 * A reusable video selector dropdown that displays workshop videos
 * 
 * USAGE EXAMPLES:
 * 
 * 1. Show ALL videos from AllStarTeams workshop:
 *    <VideoLibraryDropdown workshopType="allstarteams" />
 * 
 * 2. Show ALL videos from Imaginal Agility workshop:
 *    <VideoLibraryDropdown workshopType="imaginal-agility" />
 * 
 * 3. Show ONLY specific videos (e.g., Module 1 videos):
 *    <VideoLibraryDropdown 
 *      workshopType="allstarteams" 
 *      filterByStepIds={['1-1', '1-2', '1-3']}
 *      title="Module 1 Videos"
 *      description="Review the foundational videos from Module 1"
 *    />
 * 
 * 4. Show specific videos with custom messaging:
 *    <VideoLibraryDropdown 
 *      workshopType="allstarteams" 
 *      filterByStepIds={['2-1', '2-2', '2-3', '2-4']}
 *      title="Strength & Flow Module"
 *      description="Deep dive into understanding your strengths and flow patterns"
 *    />
 * 
 * 5. Show selected videos for team prep:
 *    <VideoLibraryDropdown 
 *      workshopType="allstarteams" 
 *      filterByStepIds={['2-3', '3-1', '3-2']}
 *      title="Team Workshop Preparation Videos"
 *      description="Review these key videos before your team session"
 *    />
 */
export const VideoLibraryDropdown: React.FC<VideoLibraryDropdownProps> = ({
  workshopType,
  className = '',
  filterByStepIds,
  title = 'Workshop Video Library',
  description = 'Select any video from the workshop to review key concepts and insights.'
}) => {
  const { data: videos, isLoading } = useVideosByWorkshop(workshopType);
  const [selectedVideoId, setSelectedVideoId] = useState<number | null>(null);

  /**
   * Convert step ID (e.g., "2-3") to friendly label (e.g., "Module 2: Step 3")
   */
  const getStepLabel = (stepId: string): string => {
    if (!stepId) return '';
    
    // Handle AST format: "1-1", "2-3", "5-1"
    const match = stepId.match(/^(\d+)-(\d+)$/);
    if (match) {
      const moduleNum = match[1];
      const stepNum = match[2];
      return `Module ${moduleNum}: Step ${stepNum}`;
    }
    
    // Handle IA format: "ia-1-1", "ia-3-2"
    const iaMatch = stepId.match(/^ia-(\d+)-(\d+)$/);
    if (iaMatch) {
      const moduleNum = iaMatch[1];
      const stepNum = iaMatch[2];
      return `Module ${moduleNum}: Step ${stepNum}`;
    }
    
    // Fallback: return as-is if format doesn't match
    return stepId;
  };

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading video library...</span>
        </div>
      </div>
    );
  }

  if (!videos || videos.length === 0) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="text-center p-8 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No videos available</p>
        </div>
      </div>
    );
  }

  // Filter videos if filterByStepIds is provided
  let availableVideos = videos;
  if (filterByStepIds && filterByStepIds.length > 0) {
    availableVideos = videos.filter(v => 
      v.stepId && filterByStepIds.includes(v.stepId)
    );
  }

  // Sort videos by sortOrder and stepId
  const sortedVideos = [...availableVideos].sort((a, b) => {
    if (a.sortOrder && b.sortOrder) {
      return a.sortOrder - b.sortOrder;
    }
    if (a.stepId && b.stepId) {
      return a.stepId.localeCompare(b.stepId);
    }
    return 0;
  });

  // Get the selected video object
  const selectedVideo = sortedVideos.find(v => v.id === selectedVideoId);

  if (sortedVideos.length === 0) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="text-center p-8 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No videos available for the selected filter</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Dropdown Selector */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-4">
          <Play className="h-5 w-5 text-blue-600 flex-shrink-0" />
          <h3 className="text-lg sm:text-xl font-medium text-gray-900">
            {title}
          </h3>
        </div>
        
        <p className="text-sm sm:text-base text-gray-600 mb-4">
          {description}
        </p>

        <div className="space-y-4">
          {/* Video Selector Dropdown */}
          <div>
            <label htmlFor="video-select" className="block text-sm font-medium text-gray-700 mb-2">
              Choose a video:
            </label>
            <select
              id="video-select"
              value={selectedVideoId || ''}
              onChange={(e) => setSelectedVideoId(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
            >
              <option value="">Select a video...</option>
              {sortedVideos.map((video) => (
                <option key={video.id} value={video.id}>
                  {video.stepId ? `${getStepLabel(video.stepId)}: ` : ''}{video.title}
                </option>
              ))}
            </select>
          </div>

          {/* Video Player */}
          {selectedVideo && (
            <div className="mt-6">
              <VideoPlayer
                workshopType={workshopType}
                forceUrl={selectedVideo.url}
                title={selectedVideo.title}
                aspectRatio="16:9"
                autoplay={false}
                hideWhenUnavailable={false}
                className="shadow-lg"
              />
              
              {/* Video Description */}
              {selectedVideo.description && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">{selectedVideo.description}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoLibraryDropdown;
