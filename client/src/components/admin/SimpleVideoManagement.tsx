import React, { useState, useEffect, useMemo } from 'react';
import { useToast } from '../../hooks/use-toast';

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
  Loader2, 
  Pencil, 
  Play, 
  Trash2, 
  ArrowUpDown,
  Filter,
  RefreshCw
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
                  <SelectItem value="imaginal-agility">Imaginal Agility</SelectItem>
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
                   filterWorkshop === 'imaginal-agility' ? 'Imaginal Agility' : 
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
            <TableCaption>
              {filteredAndSortedVideos.length === 0 && videos.length > 0 ? 
                'No videos match your current filters' : 
                'Click column headers to sort'}
            </TableCaption>
            <TableHeader>
              <TableRow>
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
                  onClick={() => handleSort('contentMode')}
                >
                  <div className="flex items-center">
                    Mode
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
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
                    <TableCell className="font-medium">{video.title}</TableCell>
                    <TableCell>
                      <Badge variant={
                        video.workshop_type === 'allstarteams' ? 'default' :
                        video.workshop_type === 'imaginal-agility' ? 'secondary' :
                        'outline'
                      }>
                        {video.workshop_type === 'allstarteams' ? 'AST' : 
                         video.workshop_type === 'imaginal-agility' ? 'IA' : 
                         'GEN'}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {video.step_id || '-'}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {video.editableId || extractYouTubeId(video.url)}
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        video.contentMode === 'student' ? 'bg-blue-100 text-blue-800' :
                        video.contentMode === 'professional' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {video.contentMode === 'student' ? 'Student' :
                         video.contentMode === 'professional' ? 'Professional' :
                         'Both'}
                      </span>
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