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
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Plus, Pencil, Trash, Play, Copy } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// Define video type
interface Video {
  id: number;
  title: string;
  description: string | null;
  url: string;
  editableId: string | null;
  workshopType: string;
  section: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

// Form schema for video creation/updating
const videoFormSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  description: z.string().optional(),
  url: z.string().url('Must be a valid URL'),
  editableId: z.string().optional(),
  workshop_type: z.string().min(1, 'Workshop type is required'),
  section: z.string().min(1, 'Section is required'),
  sort_order: z.number().int().nonnegative().default(0),
});

type VideoFormValues = z.infer<typeof videoFormSchema>;

export function VideoDirectManagement() {
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to extract YouTube video ID from URL
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
        setVideos(data);
      } catch (err) {
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

  // Create video
  const createVideo = async (videoData: VideoFormValues) => {
    try {
      // Extract video ID from URL if not provided
      const videoId = videoData.editableId || extractYouTubeId(videoData.url);
      
      // If the user has edited the ID, update the URL to match this ID
      let updatedUrl = videoData.url;
      if (videoId && videoId !== extractYouTubeId(videoData.url)) {
        // Create a proper YouTube embed URL with the new ID
        updatedUrl = `https://www.youtube.com/embed/${videoId}`;
      }
      
      const dataToSubmit = {
        ...videoData,
        url: updatedUrl,
        editableId: videoId
      };
      
      const response = await fetch('/api/admin/videos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSubmit),
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create video: ${response.statusText}`);
      }
      
      const newVideo = await response.json();
      setVideos(prev => [...prev, newVideo]);
      
      toast({
        title: 'Success',
        description: 'Video created successfully',
      });
      
      setIsCreateDialogOpen(false);
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to create video',
        variant: 'destructive',
      });
      console.error('Error creating video:', err);
    }
  };

  // Update video
  const updateVideo = async (id: number, videoData: Partial<VideoFormValues>) => {
    try {
      // Use the manually edited ID or extract from URL if not provided
      const videoId = videoData.editableId || 
        (videoData.url ? extractYouTubeId(videoData.url) : '');
      
      // If the user has edited the ID, update the URL to match this ID
      let updatedUrl = videoData.url;
      if (videoId && videoData.url && videoId !== extractYouTubeId(videoData.url)) {
        // Create a proper YouTube embed URL with the new ID
        updatedUrl = `https://www.youtube.com/embed/${videoId}`;
      }
      
      const dataToSubmit = {
        ...videoData,
        url: updatedUrl,
        editableId: videoId
      };
      
      const response = await fetch(`/api/admin/videos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSubmit),
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update video: ${response.statusText}`);
      }
      
      const updatedVideo = await response.json();
      
      // Update videos state
      setVideos(prev => 
        prev.map(video => video.id === id ? { ...video, ...updatedVideo } : video)
      );
      
      toast({
        title: 'Success',
        description: 'Video updated successfully',
      });
      
      setIsEditDialogOpen(false);
      setSelectedVideo(null);
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to update video',
        variant: 'destructive',
      });
      console.error('Error updating video:', err);
    }
  };

  // Delete video
  const deleteVideo = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this video?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/admin/videos/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete video: ${response.statusText}`);
      }
      
      // Remove from videos state
      setVideos(prev => prev.filter(video => video.id !== id));
      
      toast({
        title: 'Success',
        description: 'Video deleted successfully',
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to delete video',
        variant: 'destructive',
      });
      console.error('Error deleting video:', err);
    }
  };

  // Create form
  const createForm = useForm<VideoFormValues>({
    resolver: zodResolver(videoFormSchema),
    defaultValues: {
      title: '',
      description: '',
      url: '',
      editableId: '',
      workshop_type: 'allstarteams',
      section: 'introduction',
      sort_order: 0,
    },
  });

  // Edit form
  const editForm = useForm<VideoFormValues>({
    resolver: zodResolver(videoFormSchema),
    defaultValues: {
      title: '',
      description: '',
      url: '',
      editableId: '',
      workshop_type: '',
      section: '',
      sort_order: 0,
    },
  });

  // Handle create submit
  const onCreateSubmit = (values: VideoFormValues) => {
    createVideo(values);
  };

  // Handle edit submit
  const onEditSubmit = (values: VideoFormValues) => {
    if (selectedVideo) {
      updateVideo(selectedVideo.id, values);
    }
  };

  // Handle edit button click
  const handleEditClick = (video: Video) => {
    setSelectedVideo(video);
    
    // Use the stored editableId or extract it from the URL
    const videoId = video.editableId || extractYouTubeId(video.url);
    
    editForm.reset({
      title: video.title,
      description: video.description || '',
      url: video.url,
      editableId: videoId,
      workshop_type: video.workshop_type,
      section: video.section,
      sort_order: video.sort_order,
    });
    setIsEditDialogOpen(true);
  };

  // Handle preview button click
  const handlePreviewClick = (url: string) => {
    setPreviewUrl(url);
  };

  // Copy iframe code to clipboard
  const copyIframeCode = (url: string, title: string) => {
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
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Videos</h2>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Video
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add New Video</DialogTitle>
              <DialogDescription>
                Add a new video to the workshop. Fill in all the details and submit.
              </DialogDescription>
            </DialogHeader>
            <Form {...createForm}>
              <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
                <FormField
                  control={createForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Video title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Video description" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Video URL (YouTube embed or similar)" 
                          {...field} 
                          onChange={(e) => {
                            field.onChange(e);
                            // Auto-extract video ID when URL changes
                            const extractedId = extractYouTubeId(e.target.value);
                            if (extractedId) {
                              createForm.setValue('editableId', extractedId);
                            }
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        Use an embed URL (e.g., https://www.youtube.com/embed/VIDEO_ID)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
                  name="editableId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Video ID</FormLabel>
                      <FormControl>
                        <Input placeholder="Video ID (e.g., lcjao1ob55A)" {...field} />
                      </FormControl>
                      <FormDescription>
                        This ID is automatically extracted from the URL and can be edited manually
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={createForm.control}
                    name="workshop_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Workshop Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select workshop type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="allstarteams">AllStarTeams</SelectItem>
                            <SelectItem value="imaginal-agility">Imaginal Agility</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createForm.control}
                    name="section"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Section</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select section" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="introduction">Introduction</SelectItem>
                            <SelectItem value="home">Home Page</SelectItem>
                            <SelectItem value="assessment">Assessment</SelectItem>
                            <SelectItem value="workshop">Workshop</SelectItem>
                            <SelectItem value="team-workshop">Team Workshop</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={createForm.control}
                  name="sort_order"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sort Order</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field} 
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} 
                        />
                      </FormControl>
                      <FormDescription>
                        Lower numbers appear first
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit">
                    Create Video
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Video</DialogTitle>
            <DialogDescription>
              Update the video details and submit to save changes.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Video title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Video description" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Video URL (YouTube embed or similar)" 
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          // Auto-extract video ID when URL changes
                          const extractedId = extractYouTubeId(e.target.value);
                          if (extractedId) {
                            editForm.setValue('editableId', extractedId);
                          }
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      Use an embed URL (e.g., https://www.youtube.com/embed/VIDEO_ID)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="editableId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Video ID</FormLabel>
                    <FormControl>
                      <Input placeholder="Unique video ID (e.g. lcjao1ob55A)" {...field} />
                    </FormControl>
                    <FormDescription>
                      This ID will be used to identify the video in the workshop
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="workshop_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Workshop Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select workshop type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="allstarteams">AllStarTeams</SelectItem>
                          <SelectItem value="imaginal-agility">Imaginal Agility</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="section"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Section</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select section" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="introduction">Introduction</SelectItem>
                          <SelectItem value="home">Home Page</SelectItem>
                          <SelectItem value="assessment">Assessment</SelectItem>
                          <SelectItem value="workshop">Workshop</SelectItem>
                          <SelectItem value="team-workshop">Team Workshop</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={editForm.control}
                name="sort_order"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sort Order</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} 
                      />
                    </FormControl>
                    <FormDescription>
                      Lower numbers appear first
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit">
                  Update Video
                </Button>
              </DialogFooter>
            </form>
          </Form>
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
                <TableHead>Section</TableHead>
                <TableHead>Video ID</TableHead>
                <TableHead>URL</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {videos && videos.length > 0 ? (
                videos.map((video) => (
                  <TableRow key={video.id}>
                    <TableCell className="font-medium">{video.title}</TableCell>
                    <TableCell>
                      {video.workshopType === 'allstarteams' ? 'AllStarTeams' : 
                       video.workshopType === 'imaginal-agility' ? 'Imaginal Agility' : 
                       video.workshopType}
                    </TableCell>
                    <TableCell>{video.section}</TableCell>
                    <TableCell className="font-mono">
                      {video.editableId || extractYouTubeId(video.url)}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      <a href={video.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {video.url}
                      </a>
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
                        <Button size="icon" variant="outline" className="text-destructive" onClick={() => deleteVideo(video.id)}>
                          <Trash className="h-4 w-4" />
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