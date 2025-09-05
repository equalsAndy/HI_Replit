import React, { useState, useEffect, useMemo } from 'react';
import { useToast } from '../../hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// UI Components
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Switch } from '../ui/switch';
import { Badge } from '../ui/badge';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '../ui/tabs';
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { 
  Loader2, 
  Pencil, 
  Play, 
  Trash2, 
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Filter,
  RefreshCw,
  Plus,
  X,
  Circle
} from 'lucide-react';

// Types
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
  transcriptMd?: string;
  glossary?: Array<{ term: string; definition: string; }>;
}

interface GlossaryTerm {
  term: string;
  definition: string;
}

// AST Step definitions with proper names
const AST_STEPS = [
  { id: '1-1', name: 'On Self-Awareness', section: 'foundation' },
  { id: '1-2', name: 'The Self-Awareness Opportunity', section: 'foundation' },
  { id: '1-3', name: 'About this Course', section: 'foundation' },
  { id: '2-1', name: 'Star Strengths Assessment', section: 'discovery' },
  { id: '2-2', name: 'Flow Patterns', section: 'discovery' },
  { id: '2-3', name: 'Review Your Star Card', section: 'discovery' },
  { id: '3-1', name: 'Well-Being Ladder', section: 'application' },
  { id: '3-2', name: 'Rounding Out', section: 'application' },
  { id: '5-1', name: 'Your Future Self', section: 'future' },
];

// Form schemas
const videoCreateFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  editableId: z.string().min(1, 'Video ID is required'),
  stepId: z.string().min(1, 'Step selection is required'),
  autoplay: z.boolean().default(false),
  sortOrder: z.number().min(0).default(0),
  transcriptMd: z.string().optional(),
  glossary: z.array(z.object({
    term: z.string().min(1, 'Term is required'),
    definition: z.string().min(1, 'Definition is required'),
  })).optional(),
});

const videoEditFormSchema = z.object({
  editableId: z.string().min(1, 'Video ID is required'),
  transcriptMd: z.string().optional(),
  glossary: z.array(z.object({
    term: z.string().min(1, 'Term is required'),
    definition: z.string().min(1, 'Definition is required'),
  })).optional(),
});

type VideoCreateFormData = z.infer<typeof videoCreateFormSchema>;
type VideoEditFormData = z.infer<typeof videoEditFormSchema>;

// GlossaryEditor component
function GlossaryEditor({ 
  glossary, 
  onChange 
}: { 
  glossary: GlossaryTerm[]; 
  onChange: (glossary: GlossaryTerm[]) => void; 
}) {
  const addTerm = () => {
    onChange([...glossary, { term: '', definition: '' }]);
  };

  const removeTerm = (index: number) => {
    const newGlossary = glossary.filter((_, i) => i !== index);
    onChange(newGlossary);
  };

  const updateTerm = (index: number, field: keyof GlossaryTerm, value: string) => {
    const newGlossary = glossary.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    );
    onChange(newGlossary);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">Glossary Terms</h4>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addTerm}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Term
        </Button>
      </div>
      
      {glossary.length === 0 ? (
        <p className="text-sm text-muted-foreground">No glossary terms. Click "Add Term" to get started.</p>
      ) : (
        <div className="space-y-3">
          {glossary.map((item, index) => (
            <div key={index} className="flex gap-2 p-3 border rounded-lg">
              <div className="flex-1 space-y-2">
                <Input
                  placeholder="Term (e.g., Flow)"
                  value={item.term}
                  onChange={(e) => updateTerm(index, 'term', e.target.value)}
                />
                <Textarea
                  placeholder="Definition (supports markdown)"
                  value={item.definition}
                  onChange={(e) => updateTerm(index, 'definition', e.target.value)}
                  rows={2}
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeTerm(index)}
                className="text-destructive hover:bg-red-50"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function EnhancedVideoManagement() {
  const { toast } = useToast();
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [editableId, setEditableId] = useState('');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Filtering and sorting state
  const [sortField, setSortField] = useState<keyof Video>('stepId');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filterStep, setFilterStep] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Forms
  const createForm = useForm<VideoCreateFormData>({
    resolver: zodResolver(videoCreateFormSchema),
    defaultValues: {
      title: '',
      description: '',
      editableId: '',
      stepId: '',
      autoplay: false,
      sortOrder: 0,
      transcriptMd: '',
      glossary: [],
    },
  });

  const editForm = useForm<VideoEditFormData>({
    resolver: zodResolver(videoEditFormSchema),
    defaultValues: {
      editableId: '',
      transcriptMd: '',
      glossary: [],
    },
  });

  // Extract YouTube video ID from URL
  const extractYouTubeId = (url: string): string => {
    const embedRegex = /youtube\.com\/embed\/([^?&/]+)/;
    const embedMatch = url.match(embedRegex);
    if (embedMatch && embedMatch[1]) return embedMatch[1];
    
    const watchRegex = /youtube\.com\/watch\?v=([^&]+)/;
    const watchMatch = url.match(watchRegex);
    if (watchMatch && watchMatch[1]) return watchMatch[1];
    
    const shortRegex = /youtu\.be\/([^?&/]+)/;
    const shortMatch = url.match(shortRegex);
    if (shortMatch && shortMatch[1]) return shortMatch[1];
    
    return url;
  };

  // Generate embed URL from video ID
  const generateEmbedUrl = (videoId: string, autoplay: boolean = false): string => {
    const autoplayParam = autoplay ? '&autoplay=1' : '';
    return `https://www.youtube.com/embed/${videoId}?enablejsapi=1&rel=0${autoplayParam}`;
  };

  // Generate preview URL (never autoplays)
  const generatePreviewUrl = (videoId: string): string => {
    return `https://www.youtube.com/embed/${videoId}?enablejsapi=1&rel=0`;
  };

  // Get step status indicators (content availability)
  const getStepStatus = (stepId: string) => {
    const stepVideos = videos.filter(v => v.stepId === stepId);
    const hasVideo = stepVideos.length > 0;
    const hasTranscript = stepVideos.some(v => v.transcriptMd && v.transcriptMd.trim().length > 0);
    const hasGlossary = stepVideos.some(v => v.glossary && v.glossary.length > 0);
    
    return {
      video: hasVideo,
      transcript: hasTranscript,
      glossary: hasGlossary,
      count: stepVideos.length
    };
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
        // Filter to only AST videos
        const astVideos = data.filter((video: Video) => 
          video.workshopType === 'allstarteams' || video.workshopType === 'ast'
        );
        setVideos(astVideos);
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

  // Sorting and filtering logic
  const filteredAndSortedVideos = useMemo(() => {
    let filtered = videos;

    // Apply step filter
    if (filterStep !== 'all') {
      filtered = filtered.filter(video => video.stepId === filterStep);
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(video => 
        video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        video.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        video.stepId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      // Handle null/undefined values
      if (aValue === null || aValue === undefined) aValue = '';
      if (bValue === null || bValue === undefined) bValue = '';

      // Special handling for stepId to sort in logical order
      if (sortField === 'stepId') {
        const stepOrder = ['1-1', '1-2', '1-3', '2-1', '2-2', '2-3', '3-1', '3-2', '5-1'];
        const aIndex = stepOrder.indexOf(aValue as string);
        const bIndex = stepOrder.indexOf(bValue as string);
        
        if (aIndex === -1 && bIndex === -1) {
          return String(aValue).localeCompare(String(bValue));
        } else if (aIndex === -1) {
          return 1;
        } else if (bIndex === -1) {
          return -1;
        } else {
          return sortDirection === 'asc' ? aIndex - bIndex : bIndex - aIndex;
        }
      }

      // Convert to strings for comparison
      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();

      if (sortDirection === 'asc') {
        return aStr.localeCompare(bStr);
      } else {
        return bStr.localeCompare(aStr);
      }
    });

    // Secondary sort by sortOrder within same step
    filtered.sort((a, b) => {
      if (a.stepId === b.stepId) {
        return (a.sortOrder || 0) - (b.sortOrder || 0);
      }
      return 0;
    });

    return filtered;
  }, [videos, filterStep, searchTerm, sortField, sortDirection]);

  // Handle sorting
  const handleSort = (field: keyof Video) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Handle create form submission
  const onCreateSubmit = async (data: VideoCreateFormData) => {
    try {
      const stepInfo = AST_STEPS.find(s => s.id === data.stepId);
      const embedUrl = generateEmbedUrl(data.editableId, data.autoplay);
      
      const response = await fetch('/api/admin/videos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          title: data.title,
          description: data.description || '',
          url: embedUrl,
          editableId: data.editableId,
          workshopType: 'allstarteams',
          section: stepInfo?.section || 'unknown',
          stepId: data.stepId,
          autoplay: data.autoplay,
          sortOrder: data.sortOrder,
          transcriptMd: data.transcriptMd || '',
          glossary: data.glossary || [],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create video');
      }

      const result = await response.json();
      
      // Add to local state
      setVideos(prev => [...prev, result.video]);

      setIsAddDialogOpen(false);
      createForm.reset();
      
      toast({
        title: 'Success',
        description: 'Video created successfully',
      });
    } catch (error) {
      console.error('Error creating video:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create video',
        variant: 'destructive',
      });
    }
  };

  // Handle edit form submission
  const onEditSubmit = async (data: VideoEditFormData) => {
    if (!selectedVideo) return;

    try {
      const newUrl = generateEmbedUrl(data.editableId, selectedVideo.autoplay);
      
      const response = await fetch(`/api/admin/videos/${selectedVideo.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          editableId: data.editableId,
          url: newUrl,
          transcriptMd: data.transcriptMd || '',
          glossary: data.glossary || [],
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update video');
      }

      // Update local state
      setVideos(prev => prev.map(video => 
        video.id === selectedVideo.id 
          ? { 
              ...video, 
              editableId: data.editableId, 
              url: newUrl,
              transcriptMd: data.transcriptMd,
              glossary: data.glossary
            }
          : video
      ));

      setIsEditDialogOpen(false);
      setEditableId('');
      setSelectedVideo(null);
      editForm.reset();
      
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

  // Handle add video click
  const handleAddClick = () => {
    createForm.reset();
    setIsAddDialogOpen(true);
  };

  // Handle edit click
  const handleEditClick = (video: Video) => {
    setSelectedVideo(video);
    const videoId = video.editableId || extractYouTubeId(video.url);
    setEditableId(videoId);
    setPreviewUrl(generatePreviewUrl(videoId));
    
    editForm.reset({
      editableId: videoId,
      transcriptMd: video.transcriptMd || '',
      glossary: video.glossary || [],
    });
    
    setIsEditDialogOpen(true);
  };

  // Handle preview URL update
  const handlePreviewIdChange = (newId: string) => {
    setEditableId(newId);
    if (newId.trim()) {
      setPreviewUrl(generatePreviewUrl(newId));
    }
  };

  // Delete video
  const deleteVideo = async (videoId: number) => {
    const video = videos.find(v => v.id === videoId);
    const stepName = video?.stepId ? AST_STEPS.find(s => s.id === video.stepId)?.name : 'Unknown Step';
    const confirmMessage = video 
      ? `Delete "${video.title}" from ${video.stepId}: ${stepName}?\n\nThis action cannot be undone.`
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

  // Move video up/down in sort order
  const moveVideo = async (videoId: number, direction: 'up' | 'down') => {
    const video = videos.find(v => v.id === videoId);
    if (!video || !video.stepId) return;

    const stepVideos = videos.filter(v => v.stepId === video.stepId).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    const currentIndex = stepVideos.findIndex(v => v.id === videoId);
    
    if (direction === 'up' && currentIndex === 0) return;
    if (direction === 'down' && currentIndex === stepVideos.length - 1) return;

    const swapIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const otherVideo = stepVideos[swapIndex];

    try {
      // Swap sort orders
      await Promise.all([
        fetch(`/api/admin/videos/${video.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ sortOrder: otherVideo.sortOrder }),
        }),
        fetch(`/api/admin/videos/${otherVideo.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ sortOrder: video.sortOrder }),
        }),
      ]);

      // Update local state
      setVideos(prev => prev.map(v => {
        if (v.id === video.id) return { ...v, sortOrder: otherVideo.sortOrder };
        if (v.id === otherVideo.id) return { ...v, sortOrder: video.sortOrder };
        return v;
      }));

      toast({
        title: 'Success',
        description: 'Video order updated',
      });
    } catch (error) {
      console.error('Error moving video:', error);
      toast({
        title: 'Error',
        description: 'Failed to update video order',
        variant: 'destructive',
      });
    }
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
    <div className="space-y-6">
      {/* Header with Add Button */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>AST Video Management</span>
            <Button onClick={handleAddClick} className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Video
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <Input
                placeholder="Search videos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>

            {/* Step Filter */}
            <div className="w-full sm:w-[300px]">
              <Select value={filterStep} onValueChange={setFilterStep}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by step" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Steps</SelectItem>
                  {AST_STEPS.map(step => {
                    const status = getStepStatus(step.id);
                    return (
                      <SelectItem key={step.id} value={step.id}>
                        <div className="flex items-center gap-2">
                          <span>{step.id}: {step.name}</span>
                          <div className="flex gap-1 ml-2">
                            <Circle className={`h-2 w-2 ${status.video ? 'text-blue-500 fill-current' : 'text-gray-300'}`} />
                            <Circle className={`h-2 w-2 ${status.transcript ? 'text-green-500 fill-current' : 'text-gray-300'}`} />
                            <Circle className={`h-2 w-2 ${status.glossary ? 'text-purple-500 fill-current' : 'text-gray-300'}`} />
                            {status.count > 1 && (
                              <Badge variant="secondary" className="text-xs px-1 py-0 h-4">
                                {status.count}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Refresh Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

          {/* Results Summary */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <span>
                Showing {filteredAndSortedVideos.length} of {videos.length} AST videos
              </span>
              {filterStep !== 'all' && (
                <Badge variant="secondary">
                  <Filter className="h-3 w-3 mr-1" />
                  {AST_STEPS.find(s => s.id === filterStep)?.name || filterStep}
                </Badge>
              )}
            </div>
            
            <div className="text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1 mr-4">
                <Circle className="h-2 w-2 text-blue-500 fill-current" />
                Video
              </span>
              <span className="inline-flex items-center gap-1 mr-4">
                <Circle className="h-2 w-2 text-green-500 fill-current" />
                Transcript
              </span>
              <span className="inline-flex items-center gap-1">
                <Circle className="h-2 w-2 text-purple-500 fill-current" />
                Glossary
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Video Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[900px] h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Add New AST Video</DialogTitle>
            <DialogDescription>
              Add a new video to any AST workshop step with full content management.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="flex-1 flex flex-col">
              <div className="flex-1 overflow-hidden">
                <Tabs defaultValue="basic" className="h-full flex flex-col">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="basic">Basic Info</TabsTrigger>
                    <TabsTrigger value="transcript">Transcript</TabsTrigger>
                    <TabsTrigger value="glossary">Glossary</TabsTrigger>
                  </TabsList>
                  
                  <div className="flex-1 overflow-y-auto">
                    <TabsContent value="basic" className="space-y-4 p-1">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={createForm.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Video Title</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="e.g., On Self-Awareness" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={createForm.control}
                          name="stepId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>AST Step</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select AST step" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {AST_STEPS.map(step => {
                                    const status = getStepStatus(step.id);
                                    return (
                                      <SelectItem key={step.id} value={step.id}>
                                        <div className="flex items-center gap-2">
                                          <span>{step.id}: {step.name}</span>
                                          <div className="flex gap-1">
                                            <Circle className={`h-2 w-2 ${status.video ? 'text-blue-500 fill-current' : 'text-gray-300'}`} />
                                            <Circle className={`h-2 w-2 ${status.transcript ? 'text-green-500 fill-current' : 'text-gray-300'}`} />
                                            <Circle className={`h-2 w-2 ${status.glossary ? 'text-purple-500 fill-current' : 'text-gray-300'}`} />
                                            {status.count > 0 && (
                                              <Badge variant="secondary" className="text-xs px-1 py-0 h-4">
                                                {status.count}
                                              </Badge>
                                            )}
                                          </div>
                                        </div>
                                      </SelectItem>
                                    );
                                  })}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={createForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description (Optional)</FormLabel>
                            <FormControl>
                              <Textarea 
                                {...field} 
                                placeholder="Brief description of the video content"
                                rows={2}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-3 gap-4">
                        <FormField
                          control={createForm.control}
                          name="editableId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>YouTube Video ID</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field}
                                  placeholder="e.g., pp2wrqE8r2o"
                                  className="font-mono"
                                />
                              </FormControl>
                              <FormDescription>
                                The YouTube video ID (part after v= or /embed/)
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={createForm.control}
                          name="sortOrder"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Sort Order</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field}
                                  type="number"
                                  min="0"
                                  onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                                />
                              </FormControl>
                              <FormDescription>
                                Order within the step (0 = first)
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={createForm.control}
                          name="autoplay"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>Autoplay</FormLabel>
                              <div className="flex items-center space-x-2">
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <span className="text-sm text-muted-foreground">
                                  {field.value ? 'Enabled' : 'Disabled'}
                                </span>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </TabsContent>

                    <TabsContent value="transcript" className="space-y-4 p-1">
                      <FormField
                        control={createForm.control}
                        name="transcriptMd"
                        render={({ field }) => (
                          <FormItem className="h-full flex flex-col">
                            <FormLabel>Video Transcript (Markdown)</FormLabel>
                            <FormControl>
                              <Textarea 
                                {...field}
                                placeholder="Enter the video transcript in markdown format..."
                                className="flex-1 min-h-[400px] font-mono text-sm"
                                rows={20}
                              />
                            </FormControl>
                            <FormDescription>
                              Use blockquotes (>) for key quotes, and markdown formatting for structure.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TabsContent>

                    <TabsContent value="glossary" className="space-y-4 p-1">
                      <FormField
                        control={createForm.control}
                        name="glossary"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Video Glossary</FormLabel>
                            <FormControl>
                              <GlossaryEditor
                                glossary={field.value || []}
                                onChange={field.onChange}
                              />
                            </FormControl>
                            <FormDescription>
                              Define key terms and concepts mentioned in this video.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TabsContent>
                  </div>
                </Tabs>
              </div>
              
              <DialogFooter className="pt-6">
                <Button 
                  type="button" 
                  onClick={() => setIsAddDialogOpen(false)} 
                  variant="outline"
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
                  Create Video
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Video Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[900px] h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Edit Video: {selectedVideo?.title}</DialogTitle>
            <DialogDescription>
              Update video settings, transcript, and glossary using the tabs below.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="flex-1 flex flex-col">
              <div className="flex-1 overflow-hidden">
                <Tabs defaultValue="video" className="h-full flex flex-col">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="video">Video</TabsTrigger>
                    <TabsTrigger value="transcript" className={
                      selectedVideo?.transcriptMd && selectedVideo.transcriptMd.trim() 
                        ? 'text-green-600' 
                        : ''
                    }>
                      Transcript
                      {selectedVideo?.transcriptMd && selectedVideo.transcriptMd.trim() && (
                        <Circle className="h-2 w-2 ml-2 text-green-500 fill-current" />
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="glossary" className={
                      selectedVideo?.glossary && selectedVideo.glossary.length > 0
                        ? 'text-purple-600' 
                        : ''
                    }>
                      Glossary
                      {selectedVideo?.glossary && selectedVideo.glossary.length > 0 && (
                        <Circle className="h-2 w-2 ml-2 text-purple-500 fill-current" />
                      )}
                    </TabsTrigger>
                  </TabsList>
                  
                  <div className="flex-1 overflow-y-auto">
                    <TabsContent value="video" className="space-y-6 p-1">
                      <FormField
                        control={editForm.control}
                        name="editableId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Video ID</FormLabel>
                            <FormControl>
                              <Input 
                                {...field}
                                onChange={(e) => {
                                  field.onChange(e.target.value);
                                  handlePreviewIdChange(e.target.value);
                                }}
                                placeholder="e.g., pp2wrqE8r2o"
                                className="font-mono"
                              />
                            </FormControl>
                            <FormDescription>
                              Enter the YouTube video ID (the part after v= or /embed/)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

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
                    </TabsContent>

                    <TabsContent value="transcript" className="space-y-4 p-1">
                      <FormField
                        control={editForm.control}
                        name="transcriptMd"
                        render={({ field }) => (
                          <FormItem className="h-full flex flex-col">
                            <FormLabel>Transcript (Markdown)</FormLabel>
                            <FormControl>
                              <Textarea 
                                {...field}
                                placeholder="Enter the video transcript in markdown format..."
                                className="flex-1 min-h-[400px] font-mono text-sm"
                                rows={20}
                              />
                            </FormControl>
                            <FormDescription>
                              Write the video transcript using markdown formatting. Use > for blockquotes.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TabsContent>

                    <TabsContent value="glossary" className="space-y-4 p-1">
                      <FormField
                        control={editForm.control}
                        name="glossary"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Video Glossary</FormLabel>
                            <FormControl>
                              <GlossaryEditor
                                glossary={field.value || []}
                                onChange={field.onChange}
                              />
                            </FormControl>
                            <FormDescription>
                              Define key terms and concepts mentioned in this video.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TabsContent>
                  </div>
                </Tabs>
              </div>
              
              <DialogFooter className="pt-6">
                <Button 
                  type="button" 
                  onClick={() => setIsEditDialogOpen(false)} 
                  variant="outline"
                >
                  Cancel
                </Button>
                <Button type="submit">
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Videos Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableCaption>
              {filteredAndSortedVideos.length === 0 && videos.length > 0 ? 
                'No videos match your current filters' : 
                'Click column headers to sort. Multiple videos per step are supported.'}
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50 w-20"
                  onClick={() => handleSort('stepId')}
                >
                  <div className="flex items-center">
                    Step
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('title')}
                >
                  <div className="flex items-center">
                    Title
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead className="w-24">Content</TableHead>
                <TableHead className="w-20">Order</TableHead>
                <TableHead className="w-28">Video ID</TableHead>
                <TableHead className="w-20">Auto</TableHead>
                <TableHead className="text-right w-32">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedVideos && filteredAndSortedVideos.length > 0 ? (
                filteredAndSortedVideos.map((video) => {
                  const stepName = AST_STEPS.find(s => s.id === video.stepId)?.name || 'Unknown';
                  const stepVideos = videos.filter(v => v.stepId === video.stepId);
                  const videoIndex = stepVideos.findIndex(v => v.id === video.id);
                  
                  return (
                    <TableRow key={video.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-mono text-sm font-medium">{video.stepId}</div>
                          <div className="text-xs text-muted-foreground truncate max-w-[100px]">
                            {stepName}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium max-w-[200px]">
                        <div className="truncate" title={video.title}>
                          {video.title}
                        </div>
                        {video.description && (
                          <div className="text-xs text-muted-foreground truncate" title={video.description}>
                            {video.description}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Circle className="h-3 w-3 text-blue-500 fill-current" />
                          <Circle className={`h-3 w-3 ${video.transcriptMd?.trim() ? 'text-green-500 fill-current' : 'text-gray-300'}`} />
                          <Circle className={`h-3 w-3 ${video.glossary?.length ? 'text-purple-500 fill-current' : 'text-gray-300'}`} />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-mono">{video.sortOrder || 0}</span>
                          {stepVideos.length > 1 && (
                            <div className="flex flex-col">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-4 w-4 p-0"
                                onClick={() => moveVideo(video.id, 'up')}
                                disabled={videoIndex === 0}
                              >
                                <ArrowUp className="h-3 w-3" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-4 w-4 p-0"
                                onClick={() => moveVideo(video.id, 'down')}
                                disabled={videoIndex === stepVideos.length - 1}
                              >
                                <ArrowDown className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </div>
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
                        <div className="flex justify-end space-x-1">
                          <Button 
                            size="icon" 
                            variant="outline" 
                            onClick={() => window.open(video.url, '_blank')}
                            title="Preview video"
                            className="h-8 w-8"
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="icon" 
                            variant="outline" 
                            onClick={() => handleEditClick(video)}
                            title="Edit video"
                            className="h-8 w-8"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="icon" 
                            variant="outline" 
                            className="text-destructive hover:bg-red-50 h-8 w-8" 
                            onClick={() => deleteVideo(video.id)}
                            title="Delete video"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : videos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    No AST videos found. Click "Add Video" to create your first video.
                  </TableCell>
                </TableRow>
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="space-y-2">
                      <p>No videos match your current filters.</p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setFilterStep('all');
                          setSearchTerm('');
                        }}
                      >
                        Clear Filters
                      </Button>
                    </div>
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