import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
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
import { Loader2, Plus, Pencil, Trash2, Play, Copy } from 'lucide-react';
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
  stepId: string | null;
  autoplay: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

// Navigation menu items for auto-populating titles
const navigationMenuItems = {
  'allstarteams': {
    'introduction': {
      '1-1': 'Welcome to AllStarTeams Workshop',
      '1-2': 'Your Star Profile Assessment'
    },
    'assessment': {
      '2-1': 'Your Star Profile',
      '2-2': 'Your Core Strengths'
    },
    'flow': {
      '3-1': 'Flow Self Assessment',
      '3-2': 'Rounding Out'
    },
    'development': {
      '4-1': 'Complete Your Star Card'
    },
    'wellbeing': {
      '5-1': 'Ladder of Well-being'
    },
    'future': {
      '6-1': 'Visualizing Potential',
      '6-2': 'Your Future Self'
    },
    'insights': {
      '7-1': 'Recap Your Insights'
    }
  },
  'imaginal-agility': {
    'introduction': {
      '1-1': 'Welcome to Imaginal Agility Workshop'
    },
    'workshop': {
      '2-1': 'Module 1: The Challenge',
      '2-2': 'Module 2: Solution',
      '3-1': 'Module 3: Your 5Cs'
    },
    'assessment': {
      '4-1': '5Cs Self Assessment'
    },
    'insights': {
      '5-1': 'Insights Distilled'
    }
  }
};

// Function to get suggested title based on workshop type, section, and step ID
const getSuggestedTitle = (workshopType: string, section: string, stepId: string): string | null => {
  const workshop = navigationMenuItems[workshopType as keyof typeof navigationMenuItems];
  if (!workshop) return null;
  
  const sectionItems = workshop[section as keyof typeof workshop];
  if (!sectionItems) return null;
  
  return sectionItems[stepId as keyof typeof sectionItems] || null;
};

// Form schema for video creation/updating
const videoFormSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  description: z.string().optional(),
  url: z.string().url('Must be a valid URL'),
  editableId: z.string().optional(),
  workshopType: z.string().min(1, 'Workshop type is required'),
  section: z.string().min(1, 'Section is required'),
  stepId: z.string().optional(),
  autoplay: z.boolean().default(false),
  sortOrder: z.number().int().nonnegative().default(0),
});

type VideoFormValues = z.infer<typeof videoFormSchema>;

export function VideoManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

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
  const { data: videos, isLoading } = useQuery<Video[]>({
    queryKey: ['/api/admin/videos'],
  });

  // Create video mutation
  const createVideoMutation = useMutation({
    mutationFn: async (newVideo: VideoFormValues) => {
      const response = await apiRequest('POST', '/api/admin/videos', newVideo);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/videos'] });
      toast({
        title: 'Success',
        description: 'Video created successfully',
      });
      setIsCreateDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to create video',
        variant: 'destructive',
      });
      console.error('Error creating video:', error);
    },
  });

  // Update video mutation
  const updateVideoMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<VideoFormValues> }) => {
      const response = await apiRequest('PUT', `/api/admin/videos/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/videos'] });
      toast({
        title: 'Success',
        description: 'Video updated successfully',
      });
      setIsEditDialogOpen(false);
      setSelectedVideo(null);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update video',
        variant: 'destructive',
      });
      console.error('Error updating video:', error);
    },
  });

  // Delete video mutation
  const deleteVideoMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('DELETE', `/api/admin/videos/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/videos'] });
      toast({
        title: 'Success',
        description: 'Video deleted successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to delete video',
        variant: 'destructive',
      });
      console.error('Error deleting video:', error);
    },
  });

  // Function to get suggested title based on stepId
  const getSuggestedTitle = (workshopType: string, section: string, stepId: string): string => {
    const workshop = navigationMenuItems[workshopType as keyof typeof navigationMenuItems];
    if (workshop && workshop[section as keyof typeof workshop]) {
      const sectionItems = workshop[section as keyof typeof workshop] as Record<string, string>;
      return sectionItems[stepId] || '';
    }
    return '';
  };

  // Create form
  const createForm = useForm<VideoFormValues>({
    resolver: zodResolver(videoFormSchema),
    defaultValues: {
      title: '',
      description: '',
      url: '',
      editableId: '',
      workshopType: 'allstarteams',
      section: 'introduction',
      stepId: '',
      autoplay: false,
      sortOrder: 0,
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
      workshopType: '',
      section: '',
      stepId: '',
      autoplay: false,
      sortOrder: 0,
    },
  });

  // Handle create submit
  const onCreateSubmit = (values: VideoFormValues) => {
    // Extract video ID from URL if not provided
    const videoId = values.editableId || extractYouTubeId(values.url);
    
    // If the user has edited the ID, update the URL to match this ID
    let updatedUrl = values.url;
    if (videoId && videoId !== extractYouTubeId(values.url)) {
      // Create a proper YouTube embed URL with the new ID
      updatedUrl = `https://www.youtube.com/embed/${videoId}`;
    }
    
    const dataToSubmit = {
      ...values,
      url: updatedUrl,
      editableId: videoId
    };
    
    createVideoMutation.mutate(dataToSubmit);
  };

  // Handle edit submit
  const onEditSubmit = (values: VideoFormValues) => {
    if (selectedVideo) {
      // Use the manually edited ID or extract from URL if not provided
      const videoId = values.editableId || extractYouTubeId(values.url);
      
      // If the user has edited the ID, update the URL to match this ID
      let updatedUrl = values.url;
      if (videoId && videoId !== extractYouTubeId(values.url)) {
        // Create a proper YouTube embed URL with the new ID
        updatedUrl = `https://www.youtube.com/embed/${videoId}`;
      }
      
      const dataToSubmit = {
        ...values,
        url: updatedUrl,
        editableId: videoId
      };
      
      updateVideoMutation.mutate({ id: selectedVideo.id, data: dataToSubmit });
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
      workshopType: video.workshopType,
      section: video.section,
      stepId: video.stepId || '',
      autoplay: video.autoplay || false,
      sortOrder: video.sortOrder,
    });
    setIsEditDialogOpen(true);
  };

  // Handle delete button click
  const handleDeleteClick = (id: number) => {
    if (window.confirm('Are you sure you want to delete this video?')) {
      deleteVideoMutation.mutate(id);
    }
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
                    name="stepId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Step ID</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., 1-1, 2-3" 
                            {...field} 
                            onChange={(e) => {
                              field.onChange(e);
                              // Auto-populate title when stepId changes
                              const suggestedTitle = getSuggestedTitle(
                                createForm.getValues('workshopType'),
                                createForm.getValues('section'),
                                e.target.value
                              );
                              if (suggestedTitle) {
                                createForm.setValue('title', suggestedTitle);
                              }
                            }}
                          />
                        </FormControl>
                        <FormDescription>
                          Navigation step identifier (auto-populates title)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createForm.control}
                    name="autoplay"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Autoplay</FormLabel>
                          <FormDescription>
                            Auto-start video when loaded
                          </FormDescription>
                        </div>
                        <FormControl>
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={field.onChange}
                            className="h-4 w-4"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={createForm.control}
                    name="workshopType"
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
                  name="sortOrder"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sort Order</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} onChange={(e) => field.onChange(parseInt(e.target.value))} />
                      </FormControl>
                      <FormDescription>
                        Lower numbers appear first
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit" disabled={createVideoMutation.isPending}>
                    {createVideoMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
              
              {/* Video Preview */}
              {editForm.watch('url') && (
                <div className="space-y-2">
                  <FormLabel>Video Preview</FormLabel>
                  <div className="w-full aspect-video border rounded-lg overflow-hidden">
                    <iframe 
                      className="w-full h-full"
                      src={editForm.watch('url')} 
                      title="Video Preview" 
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                      allowFullScreen>
                    </iframe>
                  </div>
                  <div className="bg-gray-50 p-3 rounded border">
                    <FormLabel className="text-sm font-medium">Embed Code (for content views):</FormLabel>
                    <pre className="text-xs bg-white p-2 rounded border mt-1 overflow-x-auto">
{`<iframe 
  src="${editForm.watch('url')}${editForm.watch('autoplay') ? '?autoplay=1' : ''}"
  title="${editForm.watch('title')}"
  className="w-full h-full"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
  allowFullScreen>
</iframe>`}
                    </pre>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="stepId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Step ID</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., 1-1, 2-3" 
                          {...field} 
                          onChange={(e) => {
                            field.onChange(e);
                            // Auto-populate title when stepId changes
                            const suggestedTitle = getSuggestedTitle(
                              editForm.getValues('workshopType'),
                              editForm.getValues('section'),
                              e.target.value
                            );
                            if (suggestedTitle && !editForm.getValues('title')) {
                              editForm.setValue('title', suggestedTitle);
                            }
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        Navigation step identifier
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="autoplay"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Autoplay</FormLabel>
                        <FormDescription>
                          Auto-start video when loaded
                        </FormDescription>
                      </div>
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="h-4 w-4"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="workshopType"
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
                name="sortOrder"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sort Order</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} onChange={(e) => field.onChange(parseInt(e.target.value))} />
                    </FormControl>
                    <FormDescription>
                      Lower numbers appear first
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" disabled={updateVideoMutation.isPending}>
                  {updateVideoMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
                    <TableCell>{video.workshopType}</TableCell>
                    <TableCell>{video.section}</TableCell>
                    <TableCell className="font-mono text-sm">
                      {video.stepId || '-'}
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
                        <Button size="icon" variant="outline" className="text-destructive" onClick={() => handleDeleteClick(video.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
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