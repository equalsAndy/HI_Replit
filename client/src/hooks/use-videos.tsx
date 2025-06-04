import { useQuery } from '@tanstack/react-query';

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
  const { data: videos, ...query } = useVideosByWorkshop(workshopType);
  
  const video = videos?.find(v => v.section === section);
  
  return {
    ...query,
    data: video,
  };
}

export function useVideoByStepId(workshopType: string, stepId: string) {
  const { data: videos, ...query } = useVideosByWorkshop(workshopType);
  
  console.log(`🎥 useVideoByStepId: Looking for stepId "${stepId}" in workshop "${workshopType}"`);
  console.log(`🎥 Available videos:`, videos?.map(v => ({ stepId: v.stepId, title: v.title, editableId: v.editableId })));
  
  const video = videos?.find(v => v.stepId === stepId);
  
  console.log(`🎥 Found video for step ${stepId}:`, video ? { title: video.title, editableId: video.editableId, url: video.url } : 'No video found');
  
  return {
    ...query,
    data: video,
  };
}

// Alias for compatibility with existing components
export function useVideoByStep(stepId: string) {
  // Determine workshop type based on step ID pattern
  const workshopType = stepId.includes('-') ? 'allstarteams' : 'imaginal-agility';
  console.log(`🎥 useVideoByStep: stepId "${stepId}" -> workshopType "${workshopType}"`);
  return useVideoByStepId(workshopType, stepId);
}