import { useQuery } from '@tanstack/react-query';

interface Video {
  id: number;
  title: string;
  description?: string;
  url: string;
  editableId: string;
  workshop_type: string;
  step_id?: string;
  autoplay?: boolean;
  sortOrder?: number;
}

export function useVideoByStep(stepId: string) {
  return useQuery<Video | undefined>({
    queryKey: ['/api/admin/videos', stepId],
    queryFn: async () => {
      const response = await fetch('/api/admin/videos', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch videos');
      }
      
      const videos: Video[] = await response.json();
      return videos.find(video => video.step_id === stepId);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}