import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserManagement as FullUserManagement } from '../../components/admin/UserManagement';

// Simple Toast implementation
const useToast = () => {
  const toast = (options: { title: string; description?: string; variant?: 'destructive' }) => {
    alert(`${options.title}\n${options.description || ''}`);
  };
  return { toast };
};

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
  const [searchTerm, setSearchTerm] = React.useState('');
  const [workshopFilter, setWorkshopFilter] = React.useState<'all' | 'allstarteams' | 'imaginal-agility' | 'general'>('all');
  const [sortField, setSortField] = React.useState<string>('sort_order');
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('asc');

  const { data: videosResponse, isLoading, refetch } = useQuery({
    queryKey: ['/api/admin/videos'],
    queryFn: () => apiRequest('/api/admin/videos'),
  });

  const updateVideoMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      apiRequest(`/api/admin/videos/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onSuccess: () => refetch(),
  });

  // Handle both response formats: direct array OR {videos: [...]}
  const videoData = Array.isArray(videosResponse) ? videosResponse : (videosResponse?.videos || []);

  // Filter and sort videos
  const filteredAndSortedVideos = React.useMemo(() => {
    let filtered = videoData.filter((video: any) => {
      const matchesSearch = video.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           video.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesWorkshop = workshopFilter === 'all' || video.workshop_type === workshopFilter;
      return matchesSearch && matchesWorkshop;
    });

    return filtered.sort((a: any, b: any) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      
      if (typeof aValue === 'string') aValue = aValue.toLowerCase();
      if (typeof bValue === 'string') bValue = bValue.toLowerCase();
      
      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
  }, [videoData, searchTerm, workshopFilter, sortField, sortDirection]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getWorkshopBadge = (type: string) => {
    const badges = {
      'allstarteams': { text: 'AST', color: '#f59e0b', bg: '#fef3c7' },
      'imaginal-agility': { text: 'IA', color: '#8b5cf6', bg: '#f3e8ff' },
      'general': { text: 'GEN', color: '#6b7280', bg: '#f3f4f6' }
    };
    const badge = badges[type as keyof typeof badges] || badges.general;
    
    return (
      <span style={{
        padding: '2px 8px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: '600',
        color: badge.color,
        backgroundColor: badge.bg
      }}>
        {badge.text}
      </span>
    );
  };

  const styles = {
    container: {
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px',
      paddingBottom: '15px',
      borderBottom: '2px solid #e5e7eb'
    },
    title: {
      fontSize: '24px',
      fontWeight: 'bold',
      margin: 0,
      color: '#1f2937'
    },
    controls: {
      display: 'flex',
      gap: '15px',
      marginBottom: '20px',
      flexWrap: 'wrap' as const,
      alignItems: 'center'
    },
    searchInput: {
      padding: '8px 12px',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      fontSize: '14px',
      minWidth: '200px'
    },
    select: {
      padding: '8px 12px',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      fontSize: '14px',
      backgroundColor: 'white'
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
      textAlign: 'left' as const,
      backgroundColor: '#f9fafb',
      borderBottom: '1px solid #e5e7eb',
      fontWeight: '600',
      cursor: 'pointer',
      fontSize: '14px'
    },
    td: {
      padding: '12px',
      borderBottom: '1px solid #f3f4f6',
      fontSize: '14px'
    },
    editableInput: {
      padding: '4px 8px',
      border: '1px solid #d1d5db',
      borderRadius: '4px',
      fontSize: '13px',
      width: '80px'
    }
  };

  if (isLoading) {
    return (
      <div style={styles.container}>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          Loading video management...
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Video Management</h2>
        <div style={{ fontSize: '14px', color: '#6b7280' }}>
          {filteredAndSortedVideos.length} of {videoData.length} videos
        </div>
      </div>

      <div style={styles.controls}>
        <input
          style={styles.searchInput}
          type="text"
          placeholder="Search videos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        
        <select
          style={styles.select}
          value={workshopFilter}
          onChange={(e) => setWorkshopFilter(e.target.value as any)}
        >
          <option value="all">All Workshops</option>
          <option value="allstarteams">AllStarTeams</option>
          <option value="imaginal-agility">Imaginal Agility</option>
          <option value="general">General</option>
        </select>
      </div>

      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th} onClick={() => handleSort('title')}>
              Title {sortField === 'title' && (sortDirection === 'asc' ? '↑' : '↓')}
            </th>
            <th style={styles.th} onClick={() => handleSort('workshop_type')}>
              Workshop {sortField === 'workshop_type' && (sortDirection === 'asc' ? '↑' : '↓')}
            </th>
            <th style={styles.th} onClick={() => handleSort('step_id')}>
              Step {sortField === 'step_id' && (sortDirection === 'asc' ? '↑' : '↓')}
            </th>
            <th style={styles.th} onClick={() => handleSort('sort_order')}>
              Order {sortField === 'sort_order' && (sortDirection === 'asc' ? '↑' : '↓')}
            </th>
            <th style={styles.th}>YouTube ID</th>
            <th style={styles.th} onClick={() => handleSort('required_watch_percentage')}>
              Watch % {sortField === 'required_watch_percentage' && (sortDirection === 'asc' ? '↑' : '↓')}
            </th>
            <th style={styles.th}>Mode</th>
          </tr>
        </thead>
        <tbody>
          {filteredAndSortedVideos.map((video: any) => (
            <tr key={video.id}>
              <td style={styles.td}>
                <div style={{ fontWeight: '500' }}>{video.title}</div>
                {video.description && (
                  <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                    {video.description.substring(0, 80)}...
                  </div>
                )}
              </td>
              <td style={styles.td}>
                {getWorkshopBadge(video.workshop_type)}
              </td>
              <td style={styles.td}>
                <span style={{
                  padding: '2px 6px',
                  backgroundColor: '#f3f4f6',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontFamily: 'monospace'
                }}>
                  {video.step_id || 'N/A'}
                </span>
              </td>
              <td style={styles.td}>{video.sort_order}</td>
              <td style={styles.td}>
                <input
                  style={styles.editableInput}
                  type="text"
                  value={video.editable_id || ''}
                  onChange={(e) => {
                    updateVideoMutation.mutate({
                      id: video.id,
                      data: { editable_id: e.target.value }
                    });
                  }}
                  placeholder="YouTube ID"
                />
              </td>
              <td style={styles.td}>
                <input
                  style={styles.editableInput}
                  type="number"
                  value={video.required_watch_percentage || 1}
                  onChange={(e) => {
                    updateVideoMutation.mutate({
                      id: video.id,
                      data: { required_watch_percentage: parseInt(e.target.value) || 1 }
                    });
                  }}
                  min="1"
                  max="100"
                />%
              </td>
              <td style={styles.td}>
                <select
                  style={{ ...styles.select, width: '80px', padding: '4px 8px' }}
                  value={video.content_mode || 'both'}
                  onChange={(e) => {
                    updateVideoMutation.mutate({
                      id: video.id,
                      data: { content_mode: e.target.value }
                    });
                  }}
                >
                  <option value="both">Both</option>
                  <option value="student">Student</option>
                  <option value="professional">Pro</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {filteredAndSortedVideos.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '40px',
          color: '#6b7280',
          backgroundColor: '#f9fafb',
          borderRadius: '8px',
          marginTop: '20px'
        }}>
          No videos found matching your criteria
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
      toast({ title: 'Error', description: 'Failed to load invites' });
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
      toast({ title: 'Error', description: 'Please enter an email address' });
      return;
    }

    setIsSendingInvite(true);
    try {
      const response = await apiRequest('/api/invites', {
        method: 'POST',
        body: JSON.stringify(newInvite),
      });

      if (response.success) {
        toast({ title: 'Success', description: `Invite created for ${newInvite.email}` });
        setNewInvite({ email: '', role: 'participant', name: '' });
        fetchInvites();
      } else {
        toast({ title: 'Error', description: response.error || 'Failed to create invite' });
      }
    } catch (error) {
      console.error('Error creating invite:', error);
      toast({ title: 'Error', description: 'Failed to create invite' });
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
        toast({ title: 'Success', description: 'Invite deleted successfully' });
        fetchInvites();
      } else {
        toast({ title: 'Error', description: response.error || 'Failed to delete invite' });
      }
    } catch (error) {
      console.error('Error deleting invite:', error);
      toast({ title: 'Error', description: 'Failed to delete invite' });
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: 'Copied!', description: 'Invite code copied to clipboard' });
    } catch (error) {
      toast({ title: 'Copy failed', description: 'Failed to copy invite code' });
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
  const [contentAccess, setContentAccess] = React.useState<'student' | 'professional'>('professional');

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
      toast({ title: 'Logged out successfully' });
      navigate('/');
    } catch (error) {
      toast({ title: 'Logout failed', variant: 'destructive' });
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
          <h1 style={styles.title}>
            {isAdmin ? 'Admin Console' : 'Facilitator Console'}
          </h1>
          <p style={styles.subtitle}>
            Logged in as {currentUser.name} ({currentUser.role}) • {currentUser.email}
          </p>
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
          {/* Subtle indicator showing current interface */}
          <div style={{ 
            fontSize: '12px', 
            color: '#2563eb', 
            marginTop: '8px',
            fontWeight: 'bold',
            padding: '4px 8px',
            backgroundColor: '#f1f5f9',
            borderRadius: '4px',
            textAlign: 'center'
          }}>
            🔄 Active: {contentAccess} interface
          </div>
          <a href="/allstarteams" style={styles.button}>⭐ AllStarTeams</a>
          <a href="/imaginal-agility" style={styles.button}>🧠 Imaginal Agility</a>
          <button style={styles.logoutButton} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      <div style={styles.tabsContainer}>
        <div style={styles.tabsList}>
          {['users', 'cohorts', 'invites', 'videos'].map((tab) => (
            <button
              key={tab}
              style={{
                ...styles.tab,
                ...(activeTab === tab ? styles.activeTab : {}),
                ...(tab === 'videos' && !isAdmin ? { opacity: 0.5, cursor: 'not-allowed' } : {}),
                ...(tab === 'cohorts' ? { opacity: 0.5, cursor: 'not-allowed' } : {})
              }}
              onClick={() => {
                if (tab === 'videos' && !isAdmin) return;
                if (tab === 'cohorts') return; // Disabled
                setActiveTab(tab);
              }}
              disabled={(tab === 'videos' && !isAdmin) || tab === 'cohorts'}
            >
              {tab === 'users' && 'User Management'}
              {tab === 'cohorts' && 'Cohort Management (Disabled)'}
              {tab === 'invites' && 'Invite Management'}
              {tab === 'videos' && `Video Management ${!isAdmin ? '(Admin Only)' : ''}`}
            </button>
          ))}
        </div>

        <div style={styles.tabContent}>
          {activeTab === 'users' && <UserManagement />}
          {activeTab === 'cohorts' && <CohortManagement />}
          {activeTab === 'invites' && <InviteManagement />}
          {activeTab === 'videos' && isAdmin && <SimpleVideoManagement />}
        </div>
      </div>
    </div>
  );
}
