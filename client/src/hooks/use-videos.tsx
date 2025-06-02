import { useQuery } from '@tanstack/react-query';

interface Video {
  id: number;
  title: string;
  description?: string;
  url: string;
  editableId: string;
  workshop_type: string;
  section?: string;
  step_id?: string;
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
    queryKey: ['/api/admin/videos/workshop', workshopType],
    staleTime: 5 * 60 * 1000, // 5 minutes
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
  
  const video = videos?.find(v => v.step_id === stepId);
  
  return {
    ...query,
    data: video,
  };
}

// Alias for compatibility with existing components
export function useVideoByStep(stepId: string) {
  // Determine workshop type based on step ID pattern
  const workshopType = stepId.includes('-') ? 'allstarteams' : 'imaginal-agility';
  return useVideoByStepId(workshopType, stepId);
}