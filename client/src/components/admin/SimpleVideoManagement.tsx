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
  Filter,
  RefreshCw,
  Plus,
  X
} from 'lucide-react';

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
  contentMode?: 'student' | 'professional' | 'both';
  requiredWatchPercentage?: number;
  transcriptMd?: string;
  glossary?: Array<{ term: string; definition: string; }>;
}

interface GlossaryTerm {
  term: string;
  definition: string;
}

// Form schema for video editing
const videoEditFormSchema = z.object({
  editableId: z.string().min(1, 'Video ID is required'),
  transcriptMd: z.string().optional(),
  glossary: z.array(z.object({
    term: z.string().min(1, 'Term is required'),
    definition: z.string().min(1, 'Definition is required'),
  })).optional(),
});

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

export function SimpleVideoManagement() {
  const { toast } = useToast();
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [editableId, setEditableId] = useState('');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Filtering and sorting state
  const [sortField, setSortField] = useState<keyof Video>('title');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filterWorkshop, setFilterWorkshop] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [watchRequirementsEnabled, setWatchRequirementsEnabled] = useState(false);

  // Form for video editing
  const form = useForm<VideoEditFormData>({
    resolver: zodResolver(videoEditFormSchema),
    defaultValues: {
      editableId: '',
      transcriptMd: '',
      glossary: [],
    },
  });

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

  // Generate preview URL (never autoplays)
  const generatePreviewUrl = (videoId: string): string => {
    return `https://www.youtube.com/embed/${videoId}?enablejsapi=1&rel=0`;
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

  // Sorting and filtering logic
  const filteredAndSortedVideos = useMemo(() => {
    let filtered = videos;

    // Apply workshop filter
    if (filterWorkshop !== 'all') {
      filtered = filtered.filter(video => video.workshop_type === filterWorkshop);
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(video => 
        video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        video.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        video.step_id?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      // Handle null/undefined values
      if (aValue === null || aValue === undefined) aValue = '';
      if (bValue === null || bValue === undefined) bValue = '';

      // Convert to strings for comparison
      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();

      if (sortDirection === 'asc') {
        return aStr.localeCompare(bStr);
      } else {
        return bStr.localeCompare(aStr);
      }
    });

    return filtered;
  }, [videos, filterWorkshop, searchTerm, sortField, sortDirection]);

  // Handle sorting
  const handleSort = (field: keyof Video) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Toggle watch requirements for all videos
  const toggleWatchRequirements = async () => {
    const newPercentage = watchRequirementsEnabled ? 1 : 75;
    setWatchRequirementsEnabled(!watchRequirementsEnabled);

    try {
      // Update all videos to 1% or 75%
      const updatePromises = videos.map(video => 
        fetch(`/api/admin/videos/${video.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            requiredWatchPercentage: newPercentage
          }),
        })
      );

      await Promise.all(updatePromises);

      // Update local state
      setVideos(prev => prev.map(video => ({
        ...video,
        requiredWatchPercentage: newPercentage
      })));

      toast({
        title: 'Success',
        description: `Watch requirements ${watchRequirementsEnabled ? 'disabled' : 'enabled'} for all videos`,
      });
    } catch (error) {
      console.error('Error updating watch requirements:', error);
      toast({
        title: 'Error',
        description: 'Failed to update watch requirements',
        variant: 'destructive',
      });
      // Revert toggle on error
      setWatchRequirementsEnabled(watchRequirementsEnabled);
    }
  };

  // Handle form submission
  const onSubmit = async (data: VideoEditFormData) => {
    if (!selectedVideo) {
      toast({
        title: 'Error',
        description: 'No video selected',
        variant: 'destructive',
      });
      return;
    }

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
      form.reset();
      
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
    const videoId = video.editableId || extractYouTubeId(video.url);
    setEditableId(videoId);
    setPreviewUrl(generatePreviewUrl(videoId)); // Use preview URL (no autoplay)
    
    // Populate form with video data
    form.reset({
      editableId: videoId,
      transcriptMd: video.transcriptMd || '',
      glossary: video.glossary || [],
    });
    
    setIsEditDialogOpen(true);
  };

  // Handle preview URL update when editing
  const handlePreviewIdChange = (newId: string) => {
    setEditableId(newId);
    if (newId.trim()) {
      setPreviewUrl(generatePreviewUrl(newId)); // Use preview URL (no autoplay)
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
    <div className="space-y-6">
      {/* Controls Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Video Management</span>
            <div className="flex items-center space-x-4">
              {/* Watch Requirements Toggle */}
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">Watch Requirements:</span>
                <Switch
                  checked={watchRequirementsEnabled}
                  onCheckedChange={toggleWatchRequirements}
                />
                <span className="text-sm text-muted-foreground">
                  {watchRequirementsEnabled ? '75%' : '1%'}
                </span>
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

            {/* Workshop Filter */}
            <div className="w-full sm:w-[200px]">
              <Select value={filterWorkshop} onValueChange={setFilterWorkshop}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by workshop" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Workshops</SelectItem>
                  <SelectItem value="allstarteams">AllStarTeams</SelectItem>
                  <SelectItem value="ia">Imaginal Agility</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Results Summary */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <span>
                Showing {filteredAndSortedVideos.length} of {videos.length} videos
              </span>
              {filterWorkshop !== 'all' && (
                <Badge variant="secondary">
                  <Filter className="h-3 w-3 mr-1" />
                  {filterWorkshop === 'allstarteams' ? 'AllStarTeams' : 
                   filterWorkshop === 'ia' ? 'Imaginal Agility' : 
                   filterWorkshop}
                </Badge>
              )}
              {searchTerm && (
                <Badge variant="secondary">
                  Search: "{searchTerm}"
                </Badge>
              )}
            </div>
            
            <div className="text-sm text-muted-foreground">
              Sorted by {sortField} ({sortDirection})
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Enhanced Edit Dialog with 3-Tab Interface */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[900px] h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Edit Video: {selectedVideo?.title}</DialogTitle>
            <DialogDescription>
              Update video settings, transcript, and glossary using the tabs below.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 flex flex-col">
              <div className="flex-1 overflow-hidden">
                <Tabs defaultValue="video" className="h-full flex flex-col">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="video">Video</TabsTrigger>
                    <TabsTrigger value="transcript">Transcript</TabsTrigger>
                    <TabsTrigger value="glossary">Glossary</TabsTrigger>
                  </TabsList>
                  
                  <div className="flex-1 overflow-y-auto">
                    <TabsContent value="video" className="space-y-6 p-1">
                      {/* Video ID Input */}
                      <FormField
                        control={form.control}
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
                                placeholder="e.g., nFQPqSwzOLw"
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

                      {/* Live Video Preview and Embed Code Side-by-Side */}
                      {previewUrl && (
                        <div className="grid grid-cols-2 gap-6">
                          {/* Video Preview - Left Half */}
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
                          
                          {/* Embed Code - Right Half */}
                          {selectedVideo && (
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Embed Code (Read-only)</label>
                              <Textarea
                                value={generateEmbedCode(previewUrl, selectedVideo.title)}
                                readOnly
                                className="font-mono text-sm bg-gray-50 aspect-video"
                                rows={10}
                              />
                              <p className="text-xs text-muted-foreground">
                                This is the exact embed code that will be used in content views
                                {selectedVideo.autoplay && " (includes autoplay parameter)"}
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Current URL Info */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Current URL</label>
                        <p className="text-sm text-muted-foreground bg-gray-50 p-2 rounded border font-mono break-all">
                          {selectedVideo?.url}
                        </p>
                      </div>
                    </TabsContent>

                    <TabsContent value="transcript" className="space-y-4 p-1">
                      <FormField
                        control={form.control}
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
                              Write the video transcript using markdown formatting. Include timestamps if available.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TabsContent>

                    <TabsContent value="glossary" className="space-y-4 p-1">
                      <FormField
                        control={form.control}
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
                'Click column headers to sort'}
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('id')}
                >
                  <div className="flex items-center">
                    ID
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
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('workshop_type')}
                >
                  <div className="flex items-center">
                    Workshop
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('step_id')}
                >
                  <div className="flex items-center">
                    Step ID
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead>Video ID</TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('requiredWatchPercentage')}
                >
                  <div className="flex items-center">
                    Watch %
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('autoplay')}
                >
                  <div className="flex items-center">
                    Autoplay
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedVideos && filteredAndSortedVideos.length > 0 ? (
                filteredAndSortedVideos.map((video) => (
                  <TableRow key={video.id}>
                    <TableCell className="font-mono text-sm text-muted-foreground">{video.id}</TableCell>
                    <TableCell className="font-medium">{video.title}</TableCell>
                    <TableCell>
                      <Badge variant={
                        video.workshop_type === 'allstarteams' ? 'default' :
                        video.workshop_type === 'ia' ? 'secondary' :
                        'outline'
                      }>
                        {video.workshop_type === 'allstarteams' ? 'AST' : 
                         video.workshop_type === 'ia' ? 'IA' : 
                         'Landing'}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {video.step_id || '-'}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {video.editableId || extractYouTubeId(video.url)}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      <span className={`${
                        (video.requiredWatchPercentage || 75) <= 1 ? 'text-green-600 font-bold' : ''
                      }`}>
                        {video.requiredWatchPercentage || 75}%
                      </span>
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
              ) : videos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    No videos found. Add your first video to get started.
                  </TableCell>
                </TableRow>
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="space-y-2">
                      <p>No videos match your current filters.</p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setFilterWorkshop('all');
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