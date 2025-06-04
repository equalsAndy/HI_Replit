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
  const query = useQuery<Video[]>({
    queryKey: ['/api/workshop-data/videos/workshop', workshopType],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Debug logging
  console.log(`useVideosByWorkshop Debug - workshopType: ${workshopType}`);
  console.log(`useVideosByWorkshop Debug - data:`, query.data);
  console.log(`useVideosByWorkshop Debug - isLoading:`, query.isLoading);
  console.log(`useVideosByWorkshop Debug - error:`, query.error);
  
  return query;
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
  
  const video = videos?.find(v => v.stepId === stepId);
  
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