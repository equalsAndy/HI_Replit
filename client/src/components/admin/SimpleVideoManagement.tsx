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
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Pencil, Trash2, Play, Copy } from 'lucide-react';

export function SimpleVideoManagement() {
  const { toast } = useToast();
  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [editableId, setEditableId] = useState('');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  // Extract YouTube video ID from URL
  const extractYouTubeId = (url) => {
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
    if (!selectedVideo || !editableId) return;
    
    try {
      // Create a proper YouTube embed URL with the new ID
      const updatedUrl = `https://www.youtube.com/embed/${editableId}`;
      
      const response = await fetch(`/api/admin/videos/${selectedVideo.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          editableId: editableId,
          url: updatedUrl
        }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update video: ${response.statusText}`);
      }
      
      // Update videos in state
      setVideos(prev => 
        prev.map(video => 
          video.id === selectedVideo.id 
            ? { ...video, editableId: editableId, url: updatedUrl } 
            : video
        )
      );
      
      toast({
        title: 'Success',
        description: 'Video ID updated successfully',
      });
      
      setIsEditDialogOpen(false);
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to update video ID',
        variant: 'destructive',
      });
      console.error('Error updating video ID:', err);
    }
  };

  // Handle edit button click
  const handleEditClick = (video) => {
    setSelectedVideo(video);
    setEditableId(video.editableId || extractYouTubeId(video.url));
    setIsEditDialogOpen(true);
  };

  // Preview video
  const handlePreviewClick = (url) => {
    setPreviewUrl(url);
  };

  // Copy iframe code to clipboard
  const copyIframeCode = (url, title) => {
    const iframeCode = `<iframe 
  src="${url}"
  title="${title}"
  className="w-full h-full"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
  allowFullScreen>
</iframe>`;
    
    navigator.clipboard.writeText(iframeCode).then(
      () => {
        toast({
          title: 'Copied!',
          description: 'iframe code copied to clipboard',
        });
      },
      (err) => {
        console.error('Could not copy text: ', err);
        toast({
          title: 'Error',
          description: 'Failed to copy to clipboard',
          variant: 'destructive',
        });
      }
    );
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
      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Video ID</DialogTitle>
            <DialogDescription>
              Update the video ID for {selectedVideo?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Current URL</label>
                <p className="text-sm text-muted-foreground mt-1 overflow-hidden text-ellipsis">
                  {selectedVideo?.url}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium">Video ID</label>
                <Input 
                  value={editableId}
                  onChange={(e) => setEditableId(e.target.value)}
                  placeholder="e.g., lcjao1ob55A"
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  This will update both the ID and the embed URL
                </p>
              </div>
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

      {/* Video Preview Dialog */}
      {previewUrl && (
        <Dialog open={!!previewUrl} onOpenChange={() => setPreviewUrl(null)}>
          <DialogContent className="sm:max-w-[800px] sm:max-h-[600px]">
            <DialogHeader>
              <DialogTitle>Video Preview</DialogTitle>
              <DialogDescription>Preview of the selected video</DialogDescription>
            </DialogHeader>
            <div className="w-full aspect-video">
              <iframe 
                className="w-full h-full"
                src={previewUrl} 
                title="Video Preview" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen>
              </iframe>
            </div>
            <DialogFooter>
              <Button onClick={() => setPreviewUrl(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

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
                      {video.step_id || video.stepId || '-'}
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
                        <Button size="icon" variant="outline" onClick={() => handlePreviewClick(video.url)}>
                          <Play className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="outline" onClick={() => copyIframeCode(video.url, video.title)}>
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="outline" onClick={() => handleEditClick(video)}>
                          <Pencil className="h-4 w-4" />
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