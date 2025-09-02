import { useQuery } from '@tanstack/react-query';
import { useCurrentUser } from './use-current-user';

interface Video {
  id: number;
  title: string;
  description?: string;
  url: string;
  editableId: string;
  workshopType: string;
  section?: string;
  stepId?: string;
  autoplay?: boolean;
  sortOrder?: number;
  contentMode?: 'student' | 'professional' | 'both';
  requiredWatchPercentage?: number;
}

// Hook to get current user's content access mode
function useCurrentUserAccess() {
  const { data: user } = useCurrentUser();
  // Return the user's content access mode or default to 'professional'
  return user?.contentAccess || 'professional';
}

export function useVideos() {
  return useQuery<Video[]>({
    queryKey: ['/api/admin/videos'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useVideosByWorkshop(workshopType: string) {
  return useQuery<Video[]>({
    queryKey: [`/api/workshop-data/videos/workshop/${workshopType}`],
    staleTime: 0, // Always fetch fresh data for video debugging
  });
}

export function useVideoBySection(workshopType: string, section: string) {
  const videosQuery = useVideosByWorkshop(workshopType);
  const userAccess = useCurrentUserAccess();
  // Include landing-page videos for AST if mis-tagged
  const landingQuery = useVideosByWorkshop('landing-page');
  const allVideos = workshopType === 'allstarteams'
    ? [...(videosQuery.data || []), ...(landingQuery.data || [])]
    : videosQuery.data;

  // Filter videos by section and user's content access mode
  const applicableVideos = allVideos?.filter(v => 
    v.section === section && 
    (v.contentMode === 'both' || v.contentMode === userAccess)
  );
  
  // Prefer mode-specific video over 'both' mode
  const video = applicableVideos?.find(v => v.contentMode === userAccess) 
               || applicableVideos?.find(v => v.contentMode === 'both');
  
  return {
    ...videosQuery,
    data: video,
  };
}

export function useVideoByStepId(workshopType: string, stepId: string) {
  const videosQuery = useVideosByWorkshop(workshopType);
  const userAccess = useCurrentUserAccess();
  
  // Reduced debug logging - only in dev mode
  if (import.meta.env.DEV && import.meta.env.VITE_DEBUG_VIDEOS === 'true') {
    console.log(`🎥 useVideoByStepId: Looking for stepId "${stepId}" in workshop "${workshopType}" for access mode "${userAccess}"`);
    console.log(`🎥 Available videos:`, videos?.map(v => ({ stepId: v.stepId, title: v.title, editableId: v.editableId, contentMode: v.contentMode })));
  }
  
  // Filter videos by stepId and user's content access mode
  // Include landing-page videos for AST if mis-tagged
  const landingQuery = useVideosByWorkshop('landing-page');
  const allVideos = workshopType === 'allstarteams'
    ? [...(videosQuery.data || []), ...(landingQuery.data || [])]
    : videosQuery.data;
  const applicableVideos = allVideos?.filter(v => 
    v.stepId === stepId && 
    (v.contentMode === 'both' || v.contentMode === userAccess)
  );
  
  // Prefer mode-specific video over 'both' mode
  const video = applicableVideos?.find(v => v.contentMode === userAccess) 
               || applicableVideos?.find(v => v.contentMode === 'both');
  
  if (import.meta.env.DEV && import.meta.env.VITE_DEBUG_VIDEOS === 'true') {
    console.log(`🎥 Found video for step ${stepId}:`, video ? { title: video.title, editableId: video.editableId, url: video.url, contentMode: video.contentMode } : 'No video found');
  }
  
  return {
    ...videosQuery,
    data: video,
  };
}

// Alias for compatibility with existing components
export function useVideoByStep(stepId: string) {
  // Determine workshop type based on step ID pattern
  const workshopType = stepId.includes('-') ? 'allstarteams' : 'imaginal-agility';
  // Debug logging disabled by default - set VITE_DEBUG_VIDEOS=true to enable
  if (import.meta.env.DEV && import.meta.env.VITE_DEBUG_VIDEOS === 'true') {
    console.log(`🎥 useVideoByStep: stepId "${stepId}" -> workshopType "${workshopType}"`);  
  }
  return useVideoByStepId(workshopType, stepId);
}
