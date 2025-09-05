import { useQuery } from '@tanstack/react-query';

interface Video {
  id: number;
  title: string;
  description?: string;
  url: string;
  editableId: string;
  workshopType: string;
  workshop_type?: string; // Legacy field
  stepId?: string;
  step_id?: string; // Legacy field
  autoplay?: boolean;
  sortOrder?: number;
}

export function useVideoByStep(stepId: string, workshop: 'ast' | 'ia' = 'ast') {
  const workshopType = workshop === 'ast' ? 'allstarteams' : 'imaginalagility';
  
  return useQuery<Video | undefined>({
    queryKey: ['/api/workshop-data/videos', workshopType, stepId],
    queryFn: async () => {
      const response = await fetch(`/api/workshop-data/videos/workshop/${workshopType}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch videos');
      }
      
      const videos: Video[] = await response.json();
      return videos.find(video => video.stepId === stepId || video.step_id === stepId);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}