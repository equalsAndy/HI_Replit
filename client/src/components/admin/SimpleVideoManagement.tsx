import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

// UI Components
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Pencil, Play, Trash2 } from 'lucide-react';

// Types
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

export function SimpleVideoManagement() {
  const { toast } = useToast();
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [editableId, setEditableId] = useState('');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Extract YouTube video ID from URL
  const extractYouTubeId = (url: string): string => {
    // Handle youtube.com/embed/VIDEO_ID format
    const embedRegex = /youtube\.com\/embed\/([^?&/]+)/;
    const embedMatch = url.match(embedRegex);
    if (embedMatch && embedMatch[1]) {
      return embedMatch[1];
    }
    
    // Handle youtube.com/watch?v=VIDEO_ID format
    const watchRegex = /youtube\.com\/watch\?v=([^&]+)/;
    const watchMatch = url.match(watchRegex);
    if (watchMatch && watchMatch[1]) {
      return watchMatch[1];
    }
    
    // Handle youtu.be/VIDEO_ID format
    const shortRegex = /youtu\.be\/([^?&/]+)/;
    const shortMatch = url.match(shortRegex);
    if (shortMatch && shortMatch[1]) {
      return shortMatch[1];
    }
    
    // If no matches found, return the original string as it might be just the ID
    return url;
  };

  // Generate embed URL from video ID
  const generateEmbedUrl = (videoId: string, autoplay: boolean = false): string => {
    const autoplayParam = autoplay ? '&autoplay=1' : '';
    return `https://www.youtube.com/embed/${videoId}?enablejsapi=1&rel=0${autoplayParam}`;
  };

  // Fetch videos
  useEffect(() => {
    const fetchVideos = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/admin/videos', {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch videos: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log("Fetched videos:", data);
        setVideos(data);
      } catch (err) {
        console.error("Error fetching videos:", err);
        setError(err instanceof Error ? err.message : 'Failed to fetch videos');
        toast({
          title: 'Error',
          description: 'Failed to load videos. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideos();
  }, [toast]);

  // Update video ID
  const updateVideoId = async () => {
    if (!selectedVideo || !editableId.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a valid video ID',
        variant: 'destructive',
      });
      return;
    }

    try {
      const newUrl = generateEmbedUrl(editableId, selectedVideo.autoplay);
      
      const response = await fetch(`/api/admin/videos/${selectedVideo.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          editableId: editableId,
          url: newUrl
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update video');
      }

      // Update local state
      setVideos(prev => prev.map(video => 
        video.id === selectedVideo.id 
          ? { ...video, editableId: editableId, url: newUrl }
          : video
      ));

      setIsEditDialogOpen(false);
      setEditableId('');
      setSelectedVideo(null);
      
      toast({
        title: 'Success',
        description: 'Video updated successfully',
      });
    } catch (error) {
      console.error('Error updating video:', error);
      toast({
        title: 'Error',
        description: 'Failed to update video. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Handle edit click
  const handleEditClick = (video: Video) => {
    setSelectedVideo(video);
    setEditableId(video.editableId || extractYouTubeId(video.url));
    setPreviewUrl(video.url);
    setIsEditDialogOpen(true);
  };

  // Handle preview URL update when editing
  const handlePreviewIdChange = (newId: string) => {
    setEditableId(newId);
    if (newId.trim() && selectedVideo) {
      const newPreviewUrl = generateEmbedUrl(newId, selectedVideo.autoplay);
      setPreviewUrl(newPreviewUrl);
    }
  };

  // Delete video
  const deleteVideo = async (videoId: number) => {
    const video = videos.find(v => v.id === videoId);
    const confirmMessage = video 
      ? `Are you sure you want to delete "${video.title}"? This action cannot be undone.`
      : 'Are you sure you want to delete this video? This action cannot be undone.';
    
    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/videos/${videoId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to delete video');
      }

      // Update local state
      setVideos(prev => prev.filter(video => video.id !== videoId));
      
      toast({
        title: 'Success',
        description: 'Video deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting video:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete video. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Generate embed code for display
  const generateEmbedCode = (url: string, title: string): string => {
    return `<iframe 
  src="${url}"
  title="${title}"
  className="w-full h-full"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
  allowFullScreen>
</iframe>`;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <h3 className="text-lg font-semibold text-red-500">Error loading videos</h3>
        <p className="mt-2">{error}</p>
        <Button 
          className="mt-4" 
          onClick={() => window.location.reload()}
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Enhanced Edit Dialog with Live Preview */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Video</DialogTitle>
            <DialogDescription>
              Update the video ID for {selectedVideo?.title}. The preview will update in real-time.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-6">
            {/* Video ID Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Video ID</label>
              <Input 
                value={editableId}
                onChange={(e) => handlePreviewIdChange(e.target.value)}
                placeholder="e.g., nFQPqSwzOLw"
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">
                Enter the YouTube video ID (the part after v= or /embed/)
              </p>
            </div>

            {/* Live Video Preview */}
            {previewUrl && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Live Preview</label>
                <div className="w-full aspect-video bg-gray-100 rounded-lg overflow-hidden">
                  <iframe
                    src={previewUrl}
                    title="Video Preview"
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            )}

            {/* Embed Code Display */}
            {previewUrl && selectedVideo && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Embed Code (Read-only)</label>
                <Textarea
                  value={generateEmbedCode(previewUrl, selectedVideo.title)}
                  readOnly
                  className="font-mono text-sm bg-gray-50"
                  rows={6}
                />
                <p className="text-xs text-muted-foreground">
                  This is the exact embed code that will be used in content views
                  {selectedVideo.autoplay && " (includes autoplay parameter)"}
                </p>
              </div>
            )}

            {/* Current URL Info */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Current URL</label>
              <p className="text-sm text-muted-foreground bg-gray-50 p-2 rounded border font-mono break-all">
                {selectedVideo?.url}
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button onClick={() => setIsEditDialogOpen(false)} variant="outline">
              Cancel
            </Button>
            <Button onClick={updateVideoId}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Videos Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableCaption>List of all workshop videos</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Workshop</TableHead>
                <TableHead>Step ID</TableHead>
                <TableHead>Video ID</TableHead>
                <TableHead>Autoplay</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {videos && videos.length > 0 ? (
                videos.map((video) => (
                  <TableRow key={video.id}>
                    <TableCell className="font-medium">{video.title}</TableCell>
                    <TableCell>
                      {video.workshop_type === 'allstarteams' ? 'AllStarTeams' : 
                       video.workshop_type === 'imaginal-agility' ? 'Imaginal Agility' : 
                       video.workshop_type}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {video.step_id || '-'}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {video.editableId || extractYouTubeId(video.url)}
                    </TableCell>
                    <TableCell>
                      {video.autoplay ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Yes
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          No
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button 
                          size="icon" 
                          variant="outline" 
                          onClick={() => window.open(video.url, '_blank')}
                          title="Preview video"
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="outline" 
                          onClick={() => handleEditClick(video)}
                          title="Edit video"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="outline" 
                          className="text-destructive hover:bg-red-50" 
                          onClick={() => deleteVideo(video.id)}
                          title="Delete video"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    No videos found. Add your first video to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}