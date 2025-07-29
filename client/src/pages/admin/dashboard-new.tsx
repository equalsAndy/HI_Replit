import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserManagement as FullUserManagement } from '../../components/admin/UserManagement';
import FeedbackManagement from '../../components/admin/FeedbackManagement';
import AIManagement from '../../components/admin/AIManagement';
import TrainingDocumentsManagement from '../../components/admin/TrainingDocumentsManagement';
import { useToast } from '../../hooks/use-toast';
import { Play, Edit3, Trash2, Eye, ChevronUp, ChevronDown, Bot, BookOpen } from 'lucide-react';
import VersionInfo from '../../components/ui/VersionInfo';
import { FeedbackTrigger } from '../../components/feedback/FeedbackTrigger';
import { detectCurrentPage } from '../../utils/pageContext';

// Simple navigation hook
const useLocation = () => {
  const navigate = (path: string) => {
    window.location.href = path;
  };
  return [null, navigate] as const;
};

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
  return response.json();
};

// Enhanced Video Management Component
const SimpleVideoManagement: React.FC = () => {
  const { toast } = useToast();
  const [videos, setVideos] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedVideo, setSelectedVideo] = React.useState<any>(null);
  const [editableId, setEditableId] = React.useState('');
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [autoplayEnabled, setAutoplayEnabled] = React.useState(false);
  const [watchPercentage, setWatchPercentage] = React.useState(75);

  // Sorting and filtering state
  const [sortField, setSortField] = React.useState<string>('title');
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('asc');
  const [workshopFilter, setWorkshopFilter] = React.useState<string>('all');
  const [searchTerm, setSearchTerm] = React.useState('');

  // Handle sorting
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Filter and sort videos
  const filteredAndSortedVideos = React.useMemo(() => {
    let filtered = videos.filter(video => {
      const matchesWorkshop = workshopFilter === 'all' || video.workshop_type === workshopFilter;
      const matchesSearch = !searchTerm || 
        video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (video.step_id && video.step_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (video.editableId && video.editableId.toLowerCase().includes(searchTerm.toLowerCase()));
      
      return matchesWorkshop && matchesSearch;
    });

    // Sort the filtered results
    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      // Handle special cases
      if (sortField === 'title') {
        aValue = aValue?.toLowerCase() || '';
        bValue = bValue?.toLowerCase() || '';
      } else if (sortField === 'step_id') {
        aValue = aValue || 'zzz'; // Put empty step_ids at the end
        bValue = bValue || 'zzz';
      } else if (sortField === 'workshop_type') {
        aValue = aValue || '';
        bValue = bValue || '';
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [videos, sortField, sortDirection, workshopFilter, searchTerm]);

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

  // Fetch videos
  React.useEffect(() => {
    const fetchVideos = async () => {
      setIsLoading(true);
      try {
        console.log('🔄 Fetching videos from /api/admin/videos...');
        const response = await apiRequest('/api/admin/videos');
        console.log('📦 Video API Response:', response);
        
        // Handle different response formats
        let videoData: any[] = [];
        if (Array.isArray(response)) {
          videoData = response;
        } else if (response && response.videos && Array.isArray(response.videos)) {
          videoData = response.videos;
        } else if (response && response.success && response.data && Array.isArray(response.data)) {
          videoData = response.data;
        } else {
          console.warn('⚠️ Unexpected response format:', response);
          videoData = [];
        }
        
        console.log('✅ Processed video data:', videoData);
        setVideos(videoData);
      } catch (error) {
        console.error('❌ Error fetching videos:', error);
        toast({ 
          title: 'Error', 
          description: 'Failed to load videos', 
          variant: 'destructive' 
        });
        setVideos([]); // Set empty array on error
      } finally {
        setIsLoading(false);
      }
    };
    fetchVideos();
  }, []); // Remove toast dependency to prevent infinite loop

  // Update video
  const updateVideo = async () => {
    if (!selectedVideo || !editableId.trim()) {
      toast({ 
        title: 'Error', 
        description: 'Please enter a valid video ID', 
        variant: 'destructive' 
      });
      return;
    }

    try {
      const newUrl = generateEmbedUrl(editableId, autoplayEnabled);
      
      const response = await apiRequest(`/api/admin/videos/${selectedVideo.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          editableId: editableId,
          url: newUrl,
          autoplay: autoplayEnabled,
          requiredWatchPercentage: watchPercentage
        }),
      });

      // Handle different response formats
      let success = false;
      let videoData = null;
      
      if (response && response.success !== false) {
        // Check if it's wrapped in a success object or direct video data
        if (response.success === true) {
          success = true;
          videoData = response.video || response.data;
        } else if (response.id) {
          // Direct video object response
          success = true;
          videoData = response;
        }
      }

      if (!success) {
        throw new Error(response?.error || response?.message || 'Update failed');
      }

      // Update local state
      setVideos(prev => prev.map(video => 
        video.id === selectedVideo.id 
          ? { 
              ...video, 
              editableId: editableId, 
              url: newUrl, 
              autoplay: autoplayEnabled, 
              requiredWatchPercentage: watchPercentage 
            }
          : video
      ));

      setIsEditDialogOpen(false);
      toast({ 
        title: 'Success', 
        description: 'Video updated successfully' 
      });
    } catch (error) {
      console.error('Error updating video:', error);
      toast({ 
        title: 'Error', 
        description: 'Failed to update video', 
        variant: 'destructive' 
      });
    }
  };

  // Handle edit click
  const handleEditClick = (video: any) => {
    setSelectedVideo(video);
    setEditableId(video.editableId || extractYouTubeId(video.url));
    setAutoplayEnabled(video.autoplay || false);
    setWatchPercentage(video.requiredWatchPercentage || 75);
    setPreviewUrl(video.url);
    setIsEditDialogOpen(true);
  };

  // Handle preview URL update when editing
  const handlePreviewIdChange = (newId: string) => {
    setEditableId(newId);
    if (newId.trim()) {
      const newPreviewUrl = generateEmbedUrl(newId, autoplayEnabled);
      setPreviewUrl(newPreviewUrl);
    }
  };

  // Delete video
  const deleteVideo = async (videoId: number) => {
    const video = videos.find(v => v.id === videoId);
    if (!window.confirm(`Are you sure you want to delete "${video?.title}"?`)) return;

    try {
      const response = await apiRequest(`/api/admin/videos/${videoId}`, { method: 'DELETE' });
      
      // Handle different response formats
      let success = false;
      if (response && response.success !== false) {
        // Check if it's a success response or simple message response
        if (response.success === true || response.message) {
          success = true;
        }
      }

      if (!success) {
        throw new Error(response?.error || response?.message || 'Delete failed');
      }

      setVideos(prev => prev.filter(video => video.id !== videoId));
      toast({ 
        title: 'Success', 
        description: 'Video deleted successfully' 
      });
    } catch (error) {
      console.error('Error deleting video:', error);
      toast({ 
        title: 'Error', 
        description: 'Failed to delete video', 
        variant: 'destructive' 
      });
    }
  };

  // Generate embed code for display
  const generateEmbedCode = (url: string): string => {
    return `<iframe 
  src="${url}?enablejsapi=1&autoplay=${autoplayEnabled ? '1' : '0'}&rel=0"
  title="${selectedVideo?.title || 'Video'}"
  className="w-full h-full"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
  allowFullScreen>
</iframe>`;
  };

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <div style={{ fontSize: '16px', marginBottom: '10px' }}>Loading videos...</div>
        <div style={{ fontSize: '14px', color: '#6b7280' }}>Fetching video data from server</div>
      </div>
    );
  }

  const styles = {
    container: { padding: '20px' },
    header: { marginBottom: '20px' },
    title: { fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' },
    subtitle: { color: '#6b7280', fontSize: '14px' },
    table: { width: '100%', borderCollapse: 'collapse' as const, border: '1px solid #e5e7eb' },
    th: { 
      padding: '12px', 
      backgroundColor: '#f9fafb', 
      borderBottom: '1px solid #e5e7eb',
      textAlign: 'left' as const,
      fontWeight: '600'
    },
    td: { padding: '12px', borderBottom: '1px solid #f3f4f6' },
    button: {
      padding: '8px',
      border: '1px solid #d1d5db',
      borderRadius: '4px',
      backgroundColor: 'white',
      cursor: 'pointer',
      fontSize: '12px',
      marginRight: '4px',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: '32px',
      height: '32px'
    },
    editButton: {
      padding: '8px',
      border: '1px solid #3b82f6',
      borderRadius: '4px',
      backgroundColor: '#3b82f6',
      color: 'white',
      cursor: 'pointer',
      fontSize: '12px',
      marginRight: '4px',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: '32px',
      height: '32px'
    },
    deleteButton: {
      padding: '8px',
      border: '1px solid #dc2626',
      borderRadius: '4px',
      backgroundColor: '#dc2626',
      color: 'white',
      cursor: 'pointer',
      fontSize: '12px',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: '32px',
      height: '32px'
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
      zIndex: 1000
    },
    modalContent: {
      backgroundColor: 'white',
      borderRadius: '8px',
      padding: '24px',
      maxWidth: '800px',
      width: '90%',
      maxHeight: '90vh',
      overflow: 'auto'
    },
    modalHeader: { marginBottom: '20px' },
    modalTitle: { fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' },
    modalSubtitle: { color: '#6b7280', fontSize: '14px' },
    formGroup: { marginBottom: '16px' },
    label: { display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' },
    input: {
      width: '100%',
      padding: '8px 12px',
      border: '1px solid #d1d5db',
      borderRadius: '4px',
      fontSize: '14px'
    },
    textarea: {
      width: '100%',
      padding: '8px 12px',
      border: '1px solid #d1d5db',
      borderRadius: '4px',
      fontSize: '12px',
      fontFamily: 'monospace',
      backgroundColor: '#f9fafb',
      resize: 'vertical' as const,
      minHeight: '120px'
    },
    preview: {
      width: '100%',
      aspectRatio: '16/9',
      backgroundColor: '#f3f4f6',
      borderRadius: '8px',
      overflow: 'hidden'
    },
    checkbox: { marginRight: '8px' },
    range: { width: '100%', marginTop: '8px' },
    modalFooter: { 
      marginTop: '24px', 
      display: 'flex', 
      justifyContent: 'flex-end', 
      gap: '12px' 
    },
    badge: {
      padding: '2px 8px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: '500'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Video Management</h2>
        <p style={styles.subtitle}>Manage videos for all workshops. Add, edit, and view videos used throughout the platform.</p>
      </div>

      {/* Filter Controls */}
      <div style={{ 
        marginBottom: '20px', 
        display: 'flex', 
        gap: '12px', 
        alignItems: 'center',
        flexWrap: 'wrap' as const
      }}>
        <input
          type="text"
          placeholder="Search by title, step ID, or video ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px',
            minWidth: '200px',
            flex: '1'
          }}
        />
        <select
          value={workshopFilter}
          onChange={(e) => setWorkshopFilter(e.target.value)}
          style={{
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px',
            backgroundColor: 'white'
          }}
        >
          <option value="all">All Workshops</option>
          <option value="allstarteams">AllStarTeams</option>
          <option value="imaginal-agility">Imaginal Agility</option>
          <option value="general">General</option>
        </select>
        <span style={{ fontSize: '14px', color: '#6b7280' }}>
          {filteredAndSortedVideos.length} of {videos.length} videos
        </span>
      </div>

      <table style={styles.table}>
        <thead>
          <tr>
            <th 
              style={{ ...styles.th, cursor: 'pointer', userSelect: 'none' as const }}
              onClick={() => handleSort('title')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                Title 
                {sortField === 'title' && (
                  sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                )}
              </div>
            </th>
            <th 
              style={{ ...styles.th, cursor: 'pointer', userSelect: 'none' as const }}
              onClick={() => handleSort('workshop_type')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                Workshop 
                {sortField === 'workshop_type' && (
                  sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                )}
              </div>
            </th>
            <th 
              style={{ ...styles.th, cursor: 'pointer', userSelect: 'none' as const }}
              onClick={() => handleSort('step_id')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                Step ID 
                {sortField === 'step_id' && (
                  sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                )}
              </div>
            </th>
            <th style={styles.th}>Video ID</th>
            <th style={styles.th}>Autoplay</th>
            <th style={styles.th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredAndSortedVideos.map((video) => (
            <tr key={video.id}>
              <td style={styles.td}>{video.title}</td>
              <td style={styles.td}>
                <span style={{
                  ...styles.badge,
                  backgroundColor: video.workshop_type === 'allstarteams' ? '#dbeafe' : 
                                  video.workshop_type === 'imaginal-agility' ? '#f3e8ff' : '#f3f4f6',
                  color: video.workshop_type === 'allstarteams' ? '#1d4ed8' : 
                         video.workshop_type === 'imaginal-agility' ? '#7c3aed' : '#374151'
                }}>
                  {video.workshop_type}
                </span>
              </td>
              <td style={styles.td}>{video.step_id || '–'}</td>
              <td style={styles.td}>
                <code style={{ fontSize: '12px', backgroundColor: '#f3f4f6', padding: '2px 4px', borderRadius: '3px' }}>
                  {video.editableId || extractYouTubeId(video.url)}
                </code>
              </td>
              <td style={styles.td}>
                <span style={{
                  ...styles.badge,
                  backgroundColor: video.autoplay ? '#dcfce7' : '#f3f4f6',
                  color: video.autoplay ? '#166534' : '#374151'
                }}>
                  {video.autoplay ? 'Yes' : 'No'}
                </span>
              </td>
              <td style={styles.td}>
                <button 
                  style={styles.button}
                  onClick={() => window.open(video.url, '_blank')}
                  title="Preview video"
                >
                  <Eye size={14} />
                </button>
                <button 
                  style={styles.editButton}
                  onClick={() => handleEditClick(video)}
                  title="Edit video"
                >
                  <Edit3 size={14} />
                </button>
                <button 
                  style={styles.deleteButton}
                  onClick={() => deleteVideo(video.id)}
                  title="Delete video"
                >
                  <Trash2 size={14} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* No videos message */}
      {filteredAndSortedVideos.length === 0 && !isLoading && (
        <div style={{
          textAlign: 'center',
          padding: '40px',
          color: '#6b7280',
          backgroundColor: '#f9fafb',
          borderRadius: '8px',
          marginTop: '20px',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ fontSize: '18px', marginBottom: '8px' }}>
            {videos.length === 0 ? 'No videos found' : 'No videos match your filters'}
          </div>
          <div style={{ fontSize: '14px' }}>
            {videos.length === 0 
              ? 'No videos are currently configured in the system.'
              : 'Try adjusting your search term or workshop filter.'
            }
          </div>
        </div>
      )}

      {/* Edit Video Modal */}
      {isEditDialogOpen && selectedVideo && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Edit Video</h3>
              <p style={styles.modalSubtitle}>
                Update the video ID for <strong>{selectedVideo.title}</strong> 
                {selectedVideo.step_id && ` (Step: ${selectedVideo.step_id})`}. The preview will update in real-time.
              </p>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Video ID</label>
              <input 
                style={styles.input}
                value={editableId}
                onChange={(e) => handlePreviewIdChange(e.target.value)}
                placeholder="Enter YouTube video ID (the part after v= or /embed/)"
              />
              <small style={{ color: '#6b7280', fontSize: '12px' }}>
                Enter the YouTube video ID (the part after v= or /embed/)
              </small>
            </div>

            {/* Live Video Preview */}
            {previewUrl && (
              <div style={styles.formGroup}>
                <label style={styles.label}>Live Preview</label>
                <div style={styles.preview}>
                  <iframe
                    src={previewUrl}
                    title="Video Preview"
                    style={{ width: '100%', height: '100%', border: 'none' }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            )}

            {/* Autoplay Control */}
            <div style={styles.formGroup}>
              <label style={styles.label}>
                <input 
                  type="checkbox"
                  style={styles.checkbox}
                  checked={autoplayEnabled}
                  onChange={(e) => {
                    setAutoplayEnabled(e.target.checked);
                    if (editableId.trim()) {
                      const newPreviewUrl = generateEmbedUrl(editableId, e.target.checked);
                      setPreviewUrl(newPreviewUrl);
                    }
                  }}
                />
                Enable Autoplay
              </label>
            </div>

            {/* Watch Percentage Control */}
            <div style={styles.formGroup}>
              <label style={styles.label}>
                Required Watch Percentage: {watchPercentage}%
              </label>
              <input 
                type="number"
                style={{
                  ...styles.range,
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  padding: '8px 12px',
                  fontSize: '14px',
                  width: '80px'
                }}
                min="1"
                max="100"
                value={watchPercentage}
                onChange={(e) => {
                  const value = Math.max(1, Math.min(100, Number(e.target.value) || 1));
                  setWatchPercentage(value);
                }}
                onBlur={(e) => {
                  // Ensure value is within bounds when user finishes editing
                  const value = Math.max(1, Math.min(100, Number(e.target.value) || 1));
                  setWatchPercentage(value);
                }}
              />
              <small style={{ color: '#6b7280', fontSize: '12px' }}>
                How much of the video must be watched to trigger the next button active (1-100%)
              </small>
            </div>

            {/* Embed Code Display */}
            {previewUrl && (
              <div style={styles.formGroup}>
                <label style={styles.label}>Embed Code (Read-only)</label>
                <textarea
                  style={styles.textarea}
                  value={generateEmbedCode(previewUrl)}
                  readOnly
                />
                <small style={{ color: '#6b7280', fontSize: '12px' }}>
                  This is the exact embed code that will be used in content views
                  {autoplayEnabled && " (includes autoplay parameter)"}
                </small>
              </div>
            )}

            {/* Current URL Info */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Current URL</label>
              <div style={{ 
                fontSize: '12px', 
                color: '#6b7280', 
                backgroundColor: '#f9fafb', 
                padding: '8px', 
                borderRadius: '4px',
                fontFamily: 'monospace',
                wordBreak: 'break-all'
              }}>
                {selectedVideo.url}
              </div>
            </div>

            <div style={styles.modalFooter}>
              <button 
                style={styles.button}
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </button>
              <button 
                style={styles.editButton}
                onClick={updateVideo}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Import the full UserManagement component
const UserManagement: React.FC = () => {
  return <FullUserManagement />;
};

// Cohort Management Component (Disabled)
const CohortManagement: React.FC = () => {
  const styles = {
    container: { padding: '20px' },
    disabledNotice: {
      textAlign: 'center' as const,
      padding: '60px 20px',
      backgroundColor: '#fef9e7',
      borderRadius: '8px',
      border: '1px solid #f59e0b'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.disabledNotice}>
        <h3 style={{ marginBottom: '10px', color: '#92400e' }}>Cohort Management (Temporarily Disabled)</h3>
        <p style={{ color: '#92400e', marginBottom: '15px' }}>
          This feature is temporarily disabled while we improve the cohort system.
        </p>
        <p style={{ color: '#6b7280', fontSize: '14px' }}>
          You'll be able to create and manage user cohorts and groups once this feature is re-enabled.
        </p>
      </div>
    </div>
  );
};

// Invite Management Component
const InviteManagement: React.FC = () => {
  const [invites, setInvites] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState('create');
  const [newInvite, setNewInvite] = React.useState({
    email: '',
    role: 'participant',
    name: '',
    isTestUser: false,
  });
  const [isSendingInvite, setIsSendingInvite] = React.useState(false);
  const { toast } = useToast();

  const fetchInvites = async () => {
    setIsLoading(true);
    try {
      const response = await apiRequest('/api/admin/invites');
      if (response.success || Array.isArray(response)) {
        const inviteData = response.success ? response.invites : response;
        setInvites(inviteData || []);
      }
    } catch (error) {
      console.error('Error fetching invites:', error);
      toast({ 
        title: 'Error', 
        description: 'Failed to load invites',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchInvites();
  }, []);

  const handleCreateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInvite.email) {
      toast({ 
        title: 'Error', 
        description: 'Please enter an email address',
        variant: 'destructive'
      });
      return;
    }

    setIsSendingInvite(true);
    try {
      const response = await apiRequest('/api/invites', {
        method: 'POST',
        body: JSON.stringify(newInvite),
      });

      if (response.success) {
        toast({ 
          title: 'Success', 
          description: `Invite created for ${newInvite.email}` 
        });
        setNewInvite({ email: '', role: 'participant', name: '', isTestUser: false });
        fetchInvites();
      } else {
        toast({ 
          title: 'Error', 
          description: response.error || 'Failed to create invite',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error creating invite:', error);
      toast({ 
        title: 'Error', 
        description: 'Failed to create invite',
        variant: 'destructive'
      });
    } finally {
      setIsSendingInvite(false);
    }
  };

  const handleDeleteInvite = async (inviteId: number) => {
    if (!confirm('Are you sure you want to delete this invite?')) return;

    try {
      const response = await apiRequest(`/api/invites/${inviteId}`, {
        method: 'DELETE',
      });

      if (response.success) {
        toast({ 
          title: 'Success', 
          description: 'Invite deleted successfully' 
        });
        fetchInvites();
      } else {
        toast({ 
          title: 'Error', 
          description: response.error || 'Failed to delete invite',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error deleting invite:', error);
      toast({ 
        title: 'Error', 
        description: 'Failed to delete invite',
        variant: 'destructive'
      });
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({ 
        title: 'Copied!', 
        description: 'Invite code copied to clipboard' 
      });
    } catch (error) {
      toast({ 
        title: 'Copy failed', 
        description: 'Failed to copy invite code',
        variant: 'destructive'
      });
    }
  };

  const formatInviteCode = (code: string) => {
    if (!code) return '';
    return code.replace(/(.{4})/g, '$1-').replace(/-$/, '');
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Unknown';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return 'Invalid date';
    }
  };

  const getRoleBadgeStyle = (role: string) => {
    const styles = {
      admin: { backgroundColor: '#fee2e2', color: '#dc2626' },
      facilitator: { backgroundColor: '#dbeafe', color: '#2563eb' },
      participant: { backgroundColor: '#d1fae5', color: '#059669' },
      student: { backgroundColor: '#f3e8ff', color: '#7c3aed' },
    };
    return styles[role as keyof typeof styles] || styles.participant;
  };

  const styles = {
    container: { padding: '20px' },
    tabContainer: {
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      overflow: 'hidden',
      backgroundColor: 'white'
    },
    tabsList: {
      display: 'flex',
      backgroundColor: '#f9fafb',
      borderBottom: '1px solid #e5e7eb'
    },
    tab: {
      flex: 1,
      padding: '15px 20px',
      border: 'none',
      backgroundColor: 'transparent',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      borderBottom: '3px solid transparent'
    },
    activeTab: {
      backgroundColor: 'white',
      borderBottom: '3px solid #3b82f6',
      color: '#3b82f6'
    },
    tabContent: { padding: '30px' },
    form: { display: 'flex', flexDirection: 'column' as const, gap: '20px' },
    formRow: { display: 'flex', gap: '15px' },
    formGroup: { flex: 1, display: 'flex', flexDirection: 'column' as const, gap: '5px' },
    label: { fontSize: '14px', fontWeight: '500', color: '#374151' },
    input: {
      padding: '8px 12px',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      fontSize: '14px'
    },
    select: {
      padding: '8px 12px',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      fontSize: '14px',
      backgroundColor: 'white'
    },
    button: {
      padding: '10px 20px',
      backgroundColor: '#3b82f6',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      alignSelf: 'flex-start'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse' as const,
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      overflow: 'hidden'
    },
    th: {
      padding: '12px',
      backgroundColor: '#f9fafb',
      borderBottom: '1px solid #e5e7eb',
      fontWeight: '600',
      textAlign: 'left' as const,
      fontSize: '14px'
    },
    td: { padding: '12px', borderBottom: '1px solid #f3f4f6', fontSize: '14px' },
    badge: {
      padding: '2px 8px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: '600'
    },
    codeButton: {
      padding: '4px 8px',
      backgroundColor: '#f3f4f6',
      border: '1px solid #d1d5db',
      borderRadius: '4px',
      fontSize: '12px',
      fontFamily: 'monospace',
      cursor: 'pointer'
    },
    deleteButton: {
      padding: '4px 8px',
      backgroundColor: '#fee2e2',
      color: '#dc2626',
      border: '1px solid #f87171',
      borderRadius: '4px',
      fontSize: '12px',
      cursor: 'pointer'
    }
  };

  if (isLoading) {
    return (
      <div style={styles.container}>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          Loading invite management...
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.tabContainer}>
        <div style={styles.tabsList}>
          <button
            style={{
              ...styles.tab,
              ...(activeTab === 'create' ? styles.activeTab : {})
            }}
            onClick={() => setActiveTab('create')}
          >
            Create Invite
          </button>
          <button
            style={{
              ...styles.tab,
              ...(activeTab === 'manage' ? styles.activeTab : {})
            }}
            onClick={() => setActiveTab('manage')}
          >
            Manage Invites ({invites.length})
          </button>
        </div>

        <div style={styles.tabContent}>
          {activeTab === 'create' && (
            <div>
              <h3 style={{ margin: '0 0 20px 0', fontSize: '20px' }}>Create New Invite</h3>
              <p style={{ color: '#6b7280', marginBottom: '30px' }}>
                Generate an invitation code for a new user to join the workshop.
              </p>
              
              <form onSubmit={handleCreateInvite} style={styles.form}>
                <div style={styles.formRow}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Email Address *</label>
                    <input
                      style={styles.input}
                      type="email"
                      placeholder="user@example.com"
                      value={newInvite.email}
                      onChange={(e) => setNewInvite({ ...newInvite, email: e.target.value })}
                      disabled={isSendingInvite}
                      required
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Name (Optional)</label>
                    <input
                      style={styles.input}
                      type="text"
                      placeholder="John Doe"
                      value={newInvite.name}
                      onChange={(e) => setNewInvite({ ...newInvite, name: e.target.value })}
                      disabled={isSendingInvite}
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Role</label>
                    <select
                      style={styles.select}
                      value={newInvite.role}
                      onChange={(e) => setNewInvite({ ...newInvite, role: e.target.value })}
                      disabled={isSendingInvite}
                    >
                      <option value="student">Student</option>
                      <option value="participant">Participant</option>
                      <option value="facilitator">Facilitator</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div style={styles.formGroup}>
                    <label style={{ ...styles.label, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="checkbox"
                        checked={newInvite.isTestUser}
                        onChange={(e) => setNewInvite({ ...newInvite, isTestUser: e.target.checked })}
                        disabled={isSendingInvite}
                        style={{ margin: 0 }}
                      />
                      Test User
                    </label>
                    <small style={{ color: '#6b7280', fontSize: '12px', marginTop: '4px' }}>
                      Mark this user as a test account for development/testing purposes
                    </small>
                  </div>
                </div>

                <button
                  style={{
                    ...styles.button,
                    opacity: isSendingInvite ? 0.6 : 1,
                    cursor: isSendingInvite ? 'not-allowed' : 'pointer'
                  }}
                  type="submit"
                  disabled={isSendingInvite}
                >
                  {isSendingInvite ? 'Creating...' : 'Create Invite'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'manage' && (
            <div>
              <h3 style={{ margin: '0 0 20px 0', fontSize: '20px' }}>Manage Invites</h3>
              <p style={{ color: '#6b7280', marginBottom: '30px' }}>
                View and manage existing invitation codes.
              </p>

              {invites.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '60px 20px',
                  backgroundColor: '#f9fafb',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb'
                }}>
                  <p style={{ color: '#6b7280' }}>No invites created yet.</p>
                </div>
              ) : (
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Email</th>
                      <th style={styles.th}>Name</th>
                      <th style={styles.th}>Role</th>
                      <th style={styles.th}>Code</th>
                      <th style={styles.th}>Status</th>
                      <th style={styles.th}>Created</th>
                      <th style={styles.th}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invites.map((invite) => (
                      <tr key={invite.id}>
                        <td style={styles.td}>{invite.email}</td>
                        <td style={styles.td}>{invite.name || 'N/A'}</td>
                        <td style={styles.td}>
                          <span style={{
                            ...styles.badge,
                            ...getRoleBadgeStyle(invite.role)
                          }}>
                            {invite.role}
                          </span>
                        </td>
                        <td style={styles.td}>
                          <button
                            style={styles.codeButton}
                            onClick={() => copyToClipboard(invite.inviteCode || invite.invite_code)}
                            title="Click to copy"
                          >
                            {formatInviteCode(invite.inviteCode || invite.invite_code)}
                          </button>
                        </td>
                        <td style={styles.td}>
                          <span style={{
                            ...styles.badge,
                            backgroundColor: invite.isUsed || invite.used_at ? '#d1fae5' : '#fef3c7',
                            color: invite.isUsed || invite.used_at ? '#059669' : '#d97706'
                          }}>
                            {invite.isUsed || invite.used_at ? 'Used' : 'Pending'}
                          </span>
                        </td>
                        <td style={styles.td}>
                          {formatDate(invite.createdAt || invite.created_at)}
                        </td>
                        <td style={styles.td}>
                          {!invite.isUsed && !invite.used_at && (
                            <button
                              style={styles.deleteButton}
                              onClick={() => handleDeleteInvite(invite.id)}
                              title="Delete invite"
                            >
                              Delete
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Main Admin Dashboard Component
export default function AdminDashboard() {
  console.log('🚀 NEW ADMIN DASHBOARD: Component rendering started');
  
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = React.useState('users');
  const [aiSubTab, setAiSubTab] = React.useState('dashboard'); // 'dashboard' or 'training'
  const [contentAccess, setContentAccess] = React.useState<'student' | 'professional'>('professional');
  const [astLogoError, setAstLogoError] = React.useState(false);
  const [iaLogoError, setIaLogoError] = React.useState(false);

  // Fetch current user to check permissions
  const { data: userProfile, isLoading: isLoadingUser, error } = useQuery<any>({
    queryKey: ['/api/auth/me'],
    queryFn: () => apiRequest('/api/auth/me'),
    retry: false,
    staleTime: 0, // Always refetch
    gcTime: 0, // Don't cache (new property name in React Query v5)
    refetchOnWindowFocus: true, // Refetch when window gains focus
  });

  console.log('🔍 NEW ADMIN DASHBOARD DEBUG:');
  console.log('userProfile:', userProfile);
  console.log('error:', error);
  
  // Handle both response formats: direct user object OR {success: true, user: {...}}
  const currentUser = userProfile?.id 
    ? userProfile  // Direct format: {id: 1, name: "...", ...}
    : userProfile?.success && userProfile?.user 
      ? userProfile.user  // Wrapped format: {success: true, user: {...}}
      : null;
  console.log('currentUser:', currentUser);

  // Update content access mutation
  const updateContentAccessMutation = useMutation({
    mutationFn: (newAccess: 'student' | 'professional') => 
      apiRequest('/api/auth/me', {
        method: 'PUT',
        body: JSON.stringify({ contentAccess: newAccess }),
      }),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      // Temporary debug message - remove in production
      console.log(`✅ Interface switched to: ${variables}`);
    },
  });

  // Set initial content access from user profile
  React.useEffect(() => {
    console.log('🔧 Content Access Debug:', { 
      currentUser: currentUser, 
      contentAccess: currentUser?.contentAccess,
      currentState: contentAccess 
    });
    if (currentUser?.contentAccess) {
      setContentAccess(currentUser.contentAccess as 'student' | 'professional');
    }
  }, [currentUser]);

  const handleContentAccessChange = (newAccess: 'student' | 'professional') => {
    setContentAccess(newAccess);
    updateContentAccessMutation.mutate(newAccess);
  };

  // Logout function
  const handleLogout = async () => {
    try {
      await apiRequest('/api/auth/logout', { method: 'POST' });
      queryClient.clear();
      toast({ 
        title: 'Logged out successfully' 
      });
      navigate('/');
    } catch (error) {
      toast({ 
        title: 'Logout failed', 
        variant: 'destructive' 
      });
    }
  };

  const styles = {
    container: {
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '30px',
      paddingBottom: '20px',
      borderBottom: '2px solid #e5e7eb'
    },
    title: {
      fontSize: '32px',
      fontWeight: 'bold',
      color: '#1f2937',
      margin: 0
    },
    subtitle: {
      fontSize: '14px',
      color: '#6b7280',
      marginTop: '5px'
    },
    headerActions: {
      display: 'flex',
      gap: '10px',
      alignItems: 'center'
    },
    button: {
      padding: '8px 16px',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      backgroundColor: 'white',
      cursor: 'pointer',
      fontSize: '14px',
      textDecoration: 'none',
      color: '#374151'
    },
    logoutButton: {
      padding: '8px 16px',
      border: 'none',
      borderRadius: '6px',
      backgroundColor: '#dc2626',
      color: 'white',
      cursor: 'pointer',
      fontSize: '14px'
    },
    tabsContainer: {
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      overflow: 'hidden',
      backgroundColor: 'white'
    },
    tabsList: {
      display: 'flex',
      backgroundColor: '#f9fafb',
      borderBottom: '1px solid #e5e7eb'
    },
    tab: {
      flex: 1,
      padding: '15px 20px',
      border: 'none',
      backgroundColor: 'transparent',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      borderBottom: '3px solid transparent'
    },
    activeTab: {
      backgroundColor: 'white',
      borderBottom: '3px solid #3b82f6',
      color: '#3b82f6'
    },
    tabContent: {
      minHeight: '600px'
    }
  };

  if (isLoadingUser) {
    return (
      <div style={styles.container}>
        <div style={{ textAlign: 'center', padding: '100px' }}>
          <div style={{ fontSize: '18px', marginBottom: '10px' }}>Loading admin dashboard...</div>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>Authenticating user access</div>
        </div>
      </div>
    );
  }

  if (!userProfile || !currentUser) {
    return (
      <div style={styles.container}>
        <div style={{ textAlign: 'center', padding: '100px' }}>
          <div style={{ fontSize: '18px', color: '#dc2626', marginBottom: '10px' }}>Authentication Required</div>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>Please log in to access admin features</div>
          <button 
            style={{ marginTop: '20px', ...styles.button }}
            onClick={() => navigate('/')}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const hasManagementAccess = currentUser.role === 'admin' || currentUser.role === 'facilitator';
  const isAdmin = currentUser.role === 'admin';
  
  console.log('🔍 Admin Check Debug:');
  console.log('currentUser.role:', currentUser.role);
  console.log('hasManagementAccess:', hasManagementAccess);
  console.log('isAdmin:', isAdmin);

  if (!hasManagementAccess) {
    return (
      <div style={styles.container}>
        <div style={{ textAlign: 'center', padding: '100px' }}>
          <div style={{ fontSize: '18px', color: '#dc2626', marginBottom: '10px' }}>Access Denied</div>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>You do not have permission to access the management console</div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <h1 style={styles.title}>
              {isAdmin ? 'Admin Console' : 'Facilitator Console'}
            </h1>
            <VersionInfo variant="detailed" />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <p style={styles.subtitle}>
              Logged in as {currentUser.name} ({currentUser.role}) • {currentUser.email}
            </p>
            <FeedbackTrigger 
              currentPage={{
                title: 'Admin Console',
                workshop: 'ast',
                workshopName: 'Management Dashboard',
                url: window.location.pathname
              }}
              variant="text"
              className="text-blue-600 hover:text-blue-800 text-xs"
            />
          </div>
        </div>
        <div style={styles.headerActions}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 12px',
            backgroundColor: '#f3f4f6',
            borderRadius: '6px',
            border: '1px solid #d1d5db'
          }}>
            <span style={{ fontSize: '12px', fontWeight: '500', color: '#374151' }}>Interface:</span>
            <button
              style={{
                padding: '4px 8px',
                border: 'none',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: '500',
                cursor: 'pointer',
                backgroundColor: contentAccess === 'professional' ? '#3b82f6' : 'transparent',
                color: contentAccess === 'professional' ? 'white' : '#6b7280'
              }}
              onClick={() => handleContentAccessChange('professional')}
            >
              Professional
            </button>
            <button
              style={{
                padding: '4px 8px',
                border: 'none',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: '500',
                cursor: 'pointer',
                backgroundColor: contentAccess === 'student' ? '#3b82f6' : 'transparent',
                color: contentAccess === 'student' ? 'white' : '#6b7280'
              }}
              onClick={() => handleContentAccessChange('student')}
            >
              Student
            </button>
          </div>
          <a href="/allstarteams" style={{...styles.button, display: 'flex', alignItems: 'center', gap: '8px'}}>
            {!astLogoError ? (
              <img 
                src="/all-star-teams-logo-square.png" 
                alt="AllStarTeams" 
                style={{width: '20px', height: '20px'}} 
                onError={() => setAstLogoError(true)}
              />
            ) : (
              <span style={{
                width: '20px', 
                height: '20px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                fontSize: '10px', 
                fontWeight: 'bold',
                backgroundColor: '#f59e0b',
                color: 'white',
                borderRadius: '3px'
              }}>AST</span>
            )}
            AllStarTeams
          </a>
          <a href="/imaginal-agility" style={{...styles.button, display: 'flex', alignItems: 'center', gap: '8px'}}>
            {!iaLogoError ? (
              <img 
                src="/IA_sq.png" 
                alt="Imaginal Agility" 
                style={{width: '20px', height: '20px'}} 
                onError={() => setIaLogoError(true)}
              />
            ) : (
              <span style={{
                width: '20px', 
                height: '20px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                fontSize: '10px', 
                fontWeight: 'bold',
                backgroundColor: '#8b5cf6',
                color: 'white',
                borderRadius: '3px'
              }}>IA</span>
            )}
            Imaginal Agility
          </a>
          <button style={styles.logoutButton} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      <div style={styles.tabsContainer}>
        <div style={styles.tabsList}>
          {['users', 'invites', 'videos', 'ai', 'feedback'].map((tab) => (
            <button
              key={tab}
              style={{
                ...styles.tab,
                ...(activeTab === tab ? styles.activeTab : {}),
                ...(tab === 'videos' && !isAdmin ? { opacity: 0.5, cursor: 'not-allowed' } : {}),
                ...(tab === 'cohorts' ? { opacity: 0.5, cursor: 'not-allowed' } : {}),
              }}
              onClick={() => {
                if (tab === 'videos' && !isAdmin) return;
                if (tab === 'cohorts') return; // Disabled
                setActiveTab(tab);
              }}
              disabled={(tab === 'videos' && !isAdmin) || tab === 'cohorts'}
            >
              {tab === 'users' && 'User Management'}
              {tab === 'invites' && 'Invite Management'}
              {tab === 'videos' && `Video Management ${!isAdmin ? '(Admin Only)' : ''}`}
              {tab === 'ai' && 'AI Management'}
              {tab === 'feedback' && 'Feedback Management'}
            </button>
          ))}
        </div>

        <div style={styles.tabContent}>
          {activeTab === 'users' && <UserManagement />}
          {activeTab === 'invites' && <InviteManagement />}
          {activeTab === 'videos' && isAdmin && <SimpleVideoManagement />}
          {activeTab === 'ai' && (
            <div>
              {/* AI Sub-tabs */}
              <div style={{...styles.tabsList, marginBottom: '20px', borderBottom: '1px solid #e2e8f0'}}>
                {['dashboard', 'training'].map((subTab) => (
                  <button
                    key={subTab}
                    style={{
                      ...styles.tab,
                      ...(aiSubTab === subTab ? styles.activeTab : {}),
                      fontSize: '14px',
                      padding: '8px 16px'
                    }}
                    onClick={() => setAiSubTab(subTab)}
                  >
                    {subTab === 'dashboard' && (
                      <>
                        <Bot style={{marginRight: '8px', width: '16px', height: '16px', display: 'inline'}} />
                        AI Dashboard
                      </>
                    )}
                    {subTab === 'training' && (
                      <>
                        <BookOpen style={{marginRight: '8px', width: '16px', height: '16px', display: 'inline'}} />
                        Training Docs
                      </>
                    )}
                  </button>
                ))}
              </div>
              
              {/* AI Sub-tab Content */}
              {aiSubTab === 'dashboard' && <AIManagement />}
              {aiSubTab === 'training' && <TrainingDocumentsManagement />}
            </div>
          )}
          {activeTab === 'feedback' && <FeedbackManagement />}
        </div>
      </div>
    </div>
  );
}
