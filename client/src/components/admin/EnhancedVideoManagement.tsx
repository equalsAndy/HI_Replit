import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

// Define video interface with extended properties
interface Video {
  id: number;
  title: string;
  description: string | null;
  url: string;
  editableId: string | null;
  workshopType: string;
  section: string;
  stepId: string | null;
  sortOrder: number;
  autoplay: boolean;
  contentMode: string;
  requiredWatchPercentage: number;
  transcriptMd: string | null;
  glossary: any[];
  createdAt: string;
  updatedAt: string;
}

// API request function
const apiRequest = async (url: string, options: any = {}) => {
  const response = await fetch(url, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(errorData.message || `HTTP ${response.status}`);
  }
  
  return response.json();
};

export function EnhancedVideoManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State management
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [filterWorkshop, setFilterWorkshop] = useState<string>('all');
  const [filterSection, setFilterSection] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortField, setSortField] = useState<string>('title');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Form state for creating/editing videos
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    url: '',
    editableId: '',
    workshopType: 'allstarteams',
    section: 'workshop',
    stepId: '',
    sortOrder: 0,
    autoplay: false,
    contentMode: 'both',
    requiredWatchPercentage: 75,
    transcriptMd: '',
  });

  // Sorting functionality
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: string) => {
    if (sortField !== field) {
      return '↕️';
    }
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  // Get component name based on video title and step
  const getComponentName = (title: string, stepId: string | null): string => {
    if (!stepId) return 'General Content';
    
    // Map common patterns to readable component names
    const titleLower = title.toLowerCase();
    if (titleLower.includes('intro')) return 'Introduction';
    if (titleLower.includes('welcome')) return 'Welcome';
    if (titleLower.includes('assessment') || titleLower.includes('survey')) return 'Assessment';
    if (titleLower.includes('ladder')) return 'Ladder Exercise';
    if (titleLower.includes('flow')) return 'Flow Patterns';
    if (titleLower.includes('star')) return 'Star Card';
    if (titleLower.includes('future')) return 'Future Self';
    if (titleLower.includes('report')) return 'Report Generation';
    if (titleLower.includes('vision')) return 'Vision Setting';
    if (titleLower.includes('inspiration')) return 'Inspiration';
    if (titleLower.includes('visualization')) return 'Visualization';
    if (titleLower.includes('neuroscience')) return 'Neuroscience';
    if (titleLower.includes('autoflow')) return 'Autoflow';
    if (titleLower.includes('challenge')) return 'Challenge';
    if (titleLower.includes('imagine')) return 'Imagination Exercise';
    
    // Default: Use step-based naming
    if (stepId.startsWith('ia-')) {
      return `IA Step ${stepId.replace('ia-', '')}`;
    } else {
      return `AST Step ${stepId}`;
    }
  };

  // Get workshop badge display info based on actual database values
  const getWorkshopBadge = (workshopType: string) => {
    switch (workshopType) {
      case 'allstarteams':
        return { label: 'AST', bgColor: '#dbeafe', textColor: '#1e40af' };
      case 'ia':
        return { label: 'IA', bgColor: '#f3e8ff', textColor: '#7c3aed' };
      case 'general':
        return { label: 'General', bgColor: '#f3f4f6', textColor: '#6b7280' };
      default:
        // Show the actual database value for any other types
        return { label: workshopType || 'Unknown', bgColor: '#f3f4f6', textColor: '#6b7280' };
    }
  };

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

  // Fetch videos and convert snake_case to camelCase
  const { data: videos = [], isLoading, error } = useQuery<Video[]>({
    queryKey: ['/api/admin/videos'],
    queryFn: async () => {
      const result = await apiRequest('/api/admin/videos');
      // Convert snake_case API response to camelCase for frontend
      const convertedVideos = result.map((video: any) => ({
        ...video,
        workshopType: video.workshop_type || video.workshopType,
        stepId: video.step_id || video.stepId,
        editableId: video.editable_id || video.editableId,
        sortOrder: video.sort_order || video.sortOrder,
        contentMode: video.content_mode || video.contentMode,
        requiredWatchPercentage: video.required_watch_percentage || video.requiredWatchPercentage,
        transcriptMd: video.transcript_md || video.transcriptMd,
        createdAt: video.created_at || video.createdAt,
        updatedAt: video.updated_at || video.updatedAt
      }));
      // console.log('✅ Converted first video:', convertedVideos[0]);
      return convertedVideos;
    },
    staleTime: 30000, // Cache for 30 seconds
  });

  // Create video mutation
  const createVideoMutation = useMutation({
    mutationFn: async (newVideo: any) => {
      return apiRequest('/api/admin/videos', {
        method: 'POST',
        body: JSON.stringify(newVideo),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/videos'] });
      toast({
        title: 'Success',
        description: 'Video created successfully',
      });
      setIsCreateDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: `Failed to create video: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Update video mutation
  const updateVideoMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return apiRequest(`/api/admin/videos/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/videos'] });
      toast({
        title: 'Success',
        description: 'Video updated successfully',
      });
      setIsEditDialogOpen(false);
      setSelectedVideo(null);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: `Failed to update video: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Delete video mutation
  const deleteVideoMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/admin/videos/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/videos'] });
      toast({
        title: 'Success',
        description: 'Video deleted successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: `Failed to delete video: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Reset form to initial state
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      url: '',
      editableId: '',
      workshopType: 'allstarteams',
      section: 'workshop',
      stepId: '',
      sortOrder: 0,
      autoplay: false,
      contentMode: 'both',
      requiredWatchPercentage: 75,
      transcriptMd: '',
    });
  };

  // Handle form input changes
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Auto-extract video ID when URL changes
      if (field === 'url' && value) {
        const extractedId = extractYouTubeId(value);
        if (extractedId && extractedId !== value) {
          updated.editableId = extractedId;
        }
      }
      
      return updated;
    });
  };

  // Handle create submit
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.url || !formData.workshopType || !formData.section) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    const videoId = formData.editableId || extractYouTubeId(formData.url);
    let updatedUrl = formData.url;
    
    // Ensure proper YouTube embed URL format
    if (videoId && videoId !== extractYouTubeId(formData.url)) {
      updatedUrl = `https://www.youtube.com/embed/${videoId}`;
    }

    const dataToSubmit = {
      ...formData,
      url: updatedUrl,
      editableId: videoId,
      stepId: formData.stepId || null,
    };

    createVideoMutation.mutate(dataToSubmit);
  };

  // Handle edit submit
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedVideo) return;

    const videoId = formData.editableId || extractYouTubeId(formData.url);
    let updatedUrl = formData.url;
    
    // Ensure proper YouTube embed URL format
    if (videoId && videoId !== extractYouTubeId(formData.url)) {
      updatedUrl = `https://www.youtube.com/embed/${videoId}`;
    }

    const dataToSubmit = {
      ...formData,
      url: updatedUrl,
      editableId: videoId,
      stepId: formData.stepId || null,
    };

    updateVideoMutation.mutate({ id: selectedVideo.id, data: dataToSubmit });
  };

  // Handle edit button click
  const handleEditClick = (video: Video) => {
    setSelectedVideo(video);
    setFormData({
      title: video.title,
      description: video.description || '',
      url: video.url,
      editableId: video.editableId || extractYouTubeId(video.url),
      workshopType: video.workshopType,
      section: video.section,
      stepId: video.stepId || '',
      sortOrder: video.sortOrder,
      autoplay: video.autoplay || false,
      contentMode: video.contentMode || 'both',
      requiredWatchPercentage: video.requiredWatchPercentage || 75,
      transcriptMd: video.transcriptMd || '',
    });
    setIsEditDialogOpen(true);
  };

  // Handle delete button click
  const handleDeleteClick = (id: number, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      deleteVideoMutation.mutate(id);
    }
  };

  // Filter and sort videos
  const filteredAndSortedVideos = videos
    .filter(video => {
      const matchesWorkshop = filterWorkshop === 'all' || video.workshopType === filterWorkshop;
      const matchesSection = filterSection === 'all' || video.section === filterSection;
      const matchesSearch = !searchTerm || 
        video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        video.stepId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        video.editableId?.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesWorkshop && matchesSection && matchesSearch;
    })
    .sort((a, b) => {
      let aValue: any;
      let bValue: any;
      
      switch (sortField) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'workshopType':
          aValue = a.workshopType;
          bValue = b.workshopType;
          break;
        case 'componentName':
          aValue = getComponentName(a.title, a.stepId).toLowerCase();
          bValue = getComponentName(b.title, b.stepId).toLowerCase();
          break;
        case 'stepId':
          aValue = a.stepId || '';
          bValue = b.stepId || '';
          break;
        case 'editableId':
          aValue = a.editableId || '';
          bValue = b.editableId || '';
          break;
        case 'sortOrder':
          aValue = a.sortOrder;
          bValue = b.sortOrder;
          break;
        default:
          aValue = a.sortOrder;
          bValue = b.sortOrder;
      }
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const comparison = aValue.localeCompare(bValue);
        return sortDirection === 'asc' ? comparison : -comparison;
      } else {
        const comparison = aValue - bValue;
        return sortDirection === 'asc' ? comparison : -comparison;
      }
    });

  // Get unique sections for filter dropdown
  const uniqueSections = [...new Set(videos.map(v => v.section))];

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

  const styles = {
    container: { padding: '24px', maxWidth: '1400px', margin: '0 auto' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
    title: { fontSize: '24px', fontWeight: 'bold', margin: 0 },
    button: {
      padding: '8px 16px',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      backgroundColor: '#3b82f6',
      color: 'white',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500'
    },
    filterSection: {
      display: 'flex',
      gap: '16px',
      alignItems: 'center',
      padding: '16px',
      backgroundColor: '#f9fafb',
      borderRadius: '8px',
      marginBottom: '24px',
      flexWrap: 'wrap' as const
    },
    filterGroup: { display: 'flex', flexDirection: 'column' as const, gap: '4px' },
    label: { fontSize: '14px', fontWeight: '500', color: '#374151' },
    select: {
      padding: '6px 12px',
      border: '1px solid #d1d5db',
      borderRadius: '4px',
      fontSize: '14px',
      backgroundColor: 'white'
    },
    input: {
      padding: '6px 12px',
      border: '1px solid #d1d5db',
      borderRadius: '4px',
      fontSize: '14px'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse' as const,
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      overflow: 'hidden',
      backgroundColor: 'white'
    },
    th: {
      padding: '12px',
      backgroundColor: '#f9fafb',
      borderBottom: '1px solid #e5e7eb',
      fontWeight: '600',
      textAlign: 'left' as const,
      fontSize: '14px'
    },
    td: { 
      padding: '12px', 
      borderBottom: '1px solid #f3f4f6', 
      fontSize: '14px',
      verticalAlign: 'top' as const
    },
    actionButton: {
      padding: '4px 8px',
      margin: '0 2px',
      border: '1px solid #d1d5db',
      borderRadius: '4px',
      backgroundColor: 'white',
      cursor: 'pointer',
      fontSize: '12px'
    },
    deleteButton: {
      padding: '4px 8px',
      margin: '0 2px',
      border: '1px solid #f87171',
      borderRadius: '4px',
      backgroundColor: '#fee2e2',
      color: '#dc2626',
      cursor: 'pointer',
      fontSize: '12px'
    },
    modal: {
      position: 'fixed' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    },
    modalContent: {
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '24px',
      width: '90%',
      maxWidth: '600px',
      maxHeight: '90vh',
      overflow: 'auto'
    },
    modalHeader: {
      fontSize: '20px',
      fontWeight: 'bold',
      marginBottom: '16px',
      borderBottom: '1px solid #e5e7eb',
      paddingBottom: '12px'
    },
    formGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '16px',
      marginBottom: '16px'
    },
    formGroup: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '4px'
    },
    formGroupFull: {
      gridColumn: '1 / -1',
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '4px'
    },
    textarea: {
      padding: '8px 12px',
      border: '1px solid #d1d5db',
      borderRadius: '4px',
      fontSize: '14px',
      minHeight: '80px',
      resize: 'vertical' as const
    },
    checkbox: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '14px'
    },
    modalActions: {
      display: 'flex',
      gap: '12px',
      justifyContent: 'flex-end',
      marginTop: '24px',
      paddingTop: '16px',
      borderTop: '1px solid #e5e7eb'
    },
    cancelButton: {
      padding: '8px 16px',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      backgroundColor: 'white',
      color: '#374151',
      cursor: 'pointer',
      fontSize: '14px'
    }
  };

  if (isLoading) {
    return (
      <div style={styles.container}>
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <div style={{ fontSize: '18px', marginBottom: '8px' }}>Loading videos...</div>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>Fetching video management data</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <div style={{ fontSize: '18px', color: '#dc2626', marginBottom: '8px' }}>Error Loading Videos</div>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>
            {error instanceof Error ? error.message : 'Failed to load videos'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>Video Management</h2>
        <button
          style={styles.button}
          onClick={() => {
            resetForm();
            setIsCreateDialogOpen(true);
          }}
        >
          + Add Video
        </button>
      </div>

      {/* Filters */}
      <div style={styles.filterSection}>
        <div style={styles.filterGroup}>
          <label style={styles.label}>Workshop</label>
          <select
            style={styles.select}
            value={filterWorkshop}
            onChange={(e) => setFilterWorkshop(e.target.value)}
          >
            <option value="all">All Workshops</option>
            <option value="allstarteams">AllStarTeams (AST)</option>
            <option value="imaginal-agility">Imaginal Agility (IA)</option>
          </select>
        </div>
        
        <div style={styles.filterGroup}>
          <label style={styles.label}>Section</label>
          <select
            style={styles.select}
            value={filterSection}
            onChange={(e) => setFilterSection(e.target.value)}
          >
            <option value="all">All Sections</option>
            {uniqueSections.map(section => (
              <option key={section} value={section}>{section}</option>
            ))}
          </select>
        </div>

        <div style={styles.filterGroup}>
          <label style={styles.label}>Search</label>
          <input
            style={styles.input}
            type="text"
            placeholder="Search title, step ID, video ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={styles.filterGroup}>
          <label style={styles.label}>Results</label>
          <div style={{ fontSize: '14px', fontWeight: '500', color: '#374151', padding: '6px 0' }}>
            {filteredAndSortedVideos.length} of {videos.length} videos
          </div>
        </div>
      </div>

      {/* Videos Table */}
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={{...styles.th, cursor: 'pointer', userSelect: 'none'}} onClick={() => handleSort('title')}>
              Title {getSortIcon('title')}
            </th>
            <th style={{...styles.th, cursor: 'pointer', userSelect: 'none'}} onClick={() => handleSort('workshopType')}>
              Workshop {getSortIcon('workshopType')}
            </th>
            <th style={{...styles.th, cursor: 'pointer', userSelect: 'none'}} onClick={() => handleSort('componentName')}>
              Component Name {getSortIcon('componentName')}
            </th>
            <th style={{...styles.th, cursor: 'pointer', userSelect: 'none'}} onClick={() => handleSort('stepId')}>
              Step ID {getSortIcon('stepId')}
            </th>
            <th style={{...styles.th, cursor: 'pointer', userSelect: 'none'}} onClick={() => handleSort('editableId')}>
              Video ID {getSortIcon('editableId')}
            </th>
            <th style={{...styles.th, cursor: 'pointer', userSelect: 'none'}} onClick={() => handleSort('sortOrder')}>
              Order {getSortIcon('sortOrder')}
            </th>
            <th style={styles.th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredAndSortedVideos.length > 0 ? (
            filteredAndSortedVideos.map((video) => (
                <tr key={video.id}>
                  <td style={styles.td}>
                    <div style={{ fontWeight: '500' }}>{video.title}</div>
                    {video.description && (
                      <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                        {video.description.length > 100 
                          ? `${video.description.substring(0, 100)}...`
                          : video.description
                        }
                      </div>
                    )}
                  </td>
                  <td style={styles.td}>
                    <span style={{
                      padding: '2px 6px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '500',
                      backgroundColor: getWorkshopBadge(video.workshopType).bgColor,
                      color: getWorkshopBadge(video.workshopType).textColor
                    }}>
                      {getWorkshopBadge(video.workshopType).label}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <span style={{
                      fontSize: '13px',
                      fontWeight: '500',
                      color: '#374151'
                    }}>
                      {getComponentName(video.title, video.stepId)}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <code style={{ 
                      backgroundColor: '#f3f4f6', 
                      padding: '2px 4px', 
                      borderRadius: '3px',
                      fontSize: '12px',
                      color: video.stepId ? '#374151' : '#9ca3af'
                    }}>
                      {video.stepId || 'None'}
                    </code>
                  </td>
                  <td style={styles.td}>
                    <code style={{ 
                      backgroundColor: '#f3f4f6', 
                      padding: '2px 4px', 
                      borderRadius: '3px',
                      fontSize: '12px'
                    }}>
                      {video.editableId || extractYouTubeId(video.url)}
                    </code>
                  </td>
                  <td style={styles.td}>{video.sortOrder}</td>
                  <td style={styles.td}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      <button
                        style={styles.actionButton}
                        onClick={() => setPreviewUrl(video.url)}
                        title="Preview video"
                      >
                        ▶️ Preview
                      </button>
                      <button
                        style={styles.actionButton}
                        onClick={() => copyIframeCode(video.url, video.title)}
                        title="Copy iframe code"
                      >
                        📋 Copy
                      </button>
                      <button
                        style={styles.actionButton}
                        onClick={() => handleEditClick(video)}
                        title="Edit video"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        style={styles.deleteButton}
                        onClick={() => handleDeleteClick(video.id, video.title)}
                        title="Delete video"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
          ) : (
            <tr>
              <td colSpan={7} style={{ ...styles.td, textAlign: 'center', padding: '40px' }}>
                {videos.length === 0 
                  ? 'No videos found. Add your first video to get started.'
                  : 'No videos match the current filters.'
                }
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Create/Edit Modal */}
      {(isCreateDialogOpen || isEditDialogOpen) && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              {isCreateDialogOpen ? 'Add New Video' : 'Edit Video'}
            </div>
            
            <form onSubmit={isCreateDialogOpen ? handleCreateSubmit : handleEditSubmit}>
              {/* Basic Info */}
              <div style={styles.formGrid}>
                <div style={styles.formGroupFull}>
                  <label style={styles.label}>Title *</label>
                  <input
                    style={styles.input}
                    type="text"
                    placeholder="Video title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    required
                  />
                </div>
                
                <div style={styles.formGroupFull}>
                  <label style={styles.label}>Description</label>
                  <textarea
                    style={styles.textarea}
                    placeholder="Video description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                  />
                </div>

                <div style={styles.formGroupFull}>
                  <label style={styles.label}>Video URL *</label>
                  <input
                    style={styles.input}
                    type="url"
                    placeholder="https://www.youtube.com/embed/VIDEO_ID"
                    value={formData.url}
                    onChange={(e) => handleInputChange('url', e.target.value)}
                    required
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Video ID</label>
                  <input
                    style={styles.input}
                    type="text"
                    placeholder="YouTube video ID"
                    value={formData.editableId}
                    onChange={(e) => handleInputChange('editableId', e.target.value)}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Step ID</label>
                  <input
                    style={styles.input}
                    type="text"
                    placeholder="e.g., 1-1, 2-3, ia-1-2"
                    value={formData.stepId}
                    onChange={(e) => handleInputChange('stepId', e.target.value)}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Workshop Type *</label>
                  <select
                    style={styles.select}
                    value={formData.workshopType}
                    onChange={(e) => handleInputChange('workshopType', e.target.value)}
                    required
                  >
                    <option value="allstarteams">AllStarTeams</option>
                    <option value="imaginal-agility">Imaginal Agility</option>
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Section *</label>
                  <select
                    style={styles.select}
                    value={formData.section}
                    onChange={(e) => handleInputChange('section', e.target.value)}
                    required
                  >
                    <option value="introduction">Introduction</option>
                    <option value="home">Home Page</option>
                    <option value="assessment">Assessment</option>
                    <option value="workshop">Workshop</option>
                    <option value="team-workshop">Team Workshop</option>
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Sort Order</label>
                  <input
                    style={styles.input}
                    type="number"
                    min="0"
                    value={formData.sortOrder}
                    onChange={(e) => handleInputChange('sortOrder', parseInt(e.target.value) || 0)}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Required Watch %</label>
                  <input
                    style={styles.input}
                    type="number"
                    min="0"
                    max="100"
                    value={formData.requiredWatchPercentage}
                    onChange={(e) => handleInputChange('requiredWatchPercentage', parseInt(e.target.value) || 75)}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.checkbox}>
                    <input
                      type="checkbox"
                      checked={formData.autoplay}
                      onChange={(e) => handleInputChange('autoplay', e.target.checked)}
                    />
                    Autoplay
                  </label>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Content Mode</label>
                  <select
                    style={styles.select}
                    value={formData.contentMode}
                    onChange={(e) => handleInputChange('contentMode', e.target.value)}
                  >
                    <option value="both">Both</option>
                    <option value="student">Student Only</option>
                    <option value="professional">Professional Only</option>
                  </select>
                </div>
              </div>

              <div style={styles.modalActions}>
                <button
                  type="button"
                  style={styles.cancelButton}
                  onClick={() => {
                    setIsCreateDialogOpen(false);
                    setIsEditDialogOpen(false);
                    setSelectedVideo(null);
                    resetForm();
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={styles.button}
                  disabled={createVideoMutation.isPending || updateVideoMutation.isPending}
                >
                  {createVideoMutation.isPending || updateVideoMutation.isPending 
                    ? 'Saving...' 
                    : isCreateDialogOpen ? 'Create Video' : 'Update Video'
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewUrl && (
        <div style={styles.modal}>
          <div style={{ ...styles.modalContent, maxWidth: '900px', width: '95%' }}>
            <div style={styles.modalHeader}>Video Preview</div>
            <div style={{ width: '100%', aspectRatio: '16/9', marginBottom: '16px' }}>
              <iframe 
                style={{ width: '100%', height: '100%', border: 'none', borderRadius: '8px' }}
                src={previewUrl} 
                title="Video Preview" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              />
            </div>
            <div style={styles.modalActions}>
              <button
                type="button"
                style={styles.cancelButton}
                onClick={() => setPreviewUrl(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}