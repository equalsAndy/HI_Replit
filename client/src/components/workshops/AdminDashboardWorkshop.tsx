import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserManagement as FullUserManagement } from '@/components/admin/UserManagement';
import FeedbackManagement from '@/components/admin/FeedbackManagement';
import AIManagement from '@/components/admin/AIManagement';
import IAExerciseInstructions from '@/components/admin/IAExerciseInstructions';
import AdminChat from '@/components/admin/AdminChat';
import { SimpleVideoManagement } from '@/components/admin/SimpleVideoManagement';
import { useToast } from '@/hooks/use-toast';
import { useLogout } from '@/hooks/use-logout';
import { Play, Edit3, Trash2, Eye, ChevronUp, ChevronDown, Bot, BookOpen, Brain, Users, Mail, Video } from 'lucide-react';
import VersionInfo from '@/components/ui/VersionInfo';
import { FeedbackTrigger } from '@/components/feedback/FeedbackTrigger';
import { detectCurrentPage } from '@/utils/pageContext';

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

// Import the full UserManagement component
const UserManagement: React.FC = () => {
  return <FullUserManagement />;
};

// AI Training Launcher Component  
const ReportAssistantLauncher: React.FC = () => {
  const styles = {
    container: { padding: '20px' },
    header: { marginBottom: '30px' },
    title: { fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' },
    subtitle: { color: '#6b7280', fontSize: '14px' },
    launchCard: {
      padding: '40px',
      border: '2px solid #e5e7eb',
      borderRadius: '12px',
      textAlign: 'center' as const,
      backgroundColor: '#f8fafc'
    },
    launchButton: {
      padding: '12px 24px',
      backgroundColor: '#3b82f6',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      margin: '0 auto'
    }
  };

  const handleLaunchReportAssistant = () => {
    window.open('/ai-training', '_blank');
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>AI Training & Testing Tool</h2>
        <p style={styles.subtitle}>
          Comprehensive interface for training AI personas, running A/B tests, and managing training documents
        </p>
      </div>

      <div style={styles.launchCard}>
        <h3 style={{ marginBottom: '16px', fontSize: '20px' }}>AI Training Interface</h3>
        <p style={{ marginBottom: '24px', color: '#6b7280' }}>
          Launch the comprehensive training tool to work with AI personas, test responses, and upload training documents to OpenAI.
        </p>
        <button
          style={styles.launchButton}
          onClick={handleLaunchReportAssistant}
        >
          <BookOpen size={20} />
          Launch AI Training
        </button>
      </div>
    </div>
  );
};

// IA Assistant Launcher Component  
const IAAssistantLauncher: React.FC = () => {
  const [showIAChat, setShowIAChat] = React.useState(false);

  const styles = {
    container: { padding: '20px' },
    header: { marginBottom: '30px' },
    title: { fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' },
    subtitle: { color: '#6b7280', fontSize: '14px' },
    launchCard: {
      padding: '40px',
      border: '2px solid #e5e7eb',
      borderRadius: '12px',
      textAlign: 'center' as const,
      backgroundColor: '#faf5ff'
    },
    launchButton: {
      padding: '12px 24px',
      backgroundColor: '#8b5cf6',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      margin: '0 auto'
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
      width: '95vw',
      height: '90vh',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column' as const
    },
    modalHeader: {
      padding: '20px',
      borderBottom: '1px solid #e5e7eb',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    modalBody: {
      flex: 1,
      overflow: 'auto'
    },
    closeButton: {
      padding: '8px 16px',
      backgroundColor: '#6b7280',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Imaginal Agility Assistant</h2>
        <p style={styles.subtitle}>
          AI chat interface for Imaginal Agility workshop support and testing
        </p>
      </div>

      <div style={styles.launchCard}>
        <h3 style={{ marginBottom: '16px', fontSize: '20px' }}>IA AI Assistant</h3>
        <p style={{ marginBottom: '24px', color: '#6b7280' }}>
          Launch the AI assistant interface configured specifically for Imaginal Agility workshop participants and facilitators.
        </p>
        <button
          style={styles.launchButton}
          onClick={() => setShowIAChat(true)}
        >
          <Bot size={20} />
          Launch IA Assistant
        </button>
      </div>

      {/* IA Chat Modal */}
      {showIAChat && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
                Imaginal Agility AI Assistant
              </h3>
              <button
                style={styles.closeButton}
                onClick={() => setShowIAChat(false)}
              >
                Close
              </button>
            </div>
            <div style={styles.modalBody}>
              <AdminChat />
            </div>
          </div>
        </div>
      )}
    </div>
  );
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
    isBetaTester: false,
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
                  <div style={styles.formGroup}>
                    <label style={{ ...styles.label, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="checkbox"
                        checked={newInvite.isBetaTester}
                        onChange={(e) => setNewInvite({ ...newInvite, isBetaTester: e.target.checked })}
                        disabled={isSendingInvite}
                        style={{ margin: 0 }}
                      />
                      Beta Tester
                    </label>
                    <small style={{ color: '#6b7280', fontSize: '12px', marginTop: '4px' }}>
                      Mark this user as a beta tester with enhanced access and features
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
export default function AdminDashboardWorkshop() {
  console.log('🚀 NEW ADMIN DASHBOARD: Component rendering started');
  
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const appLogout = useLogout();
  const [activeTab, setActiveTab] = React.useState('users');
  const [activeAITab, setActiveAITab] = React.useState('overview');
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

  // Unified app logout
  const handleLogout = () => {
    appLogout.mutate();
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
    },
    subTabsContainer: {
      borderBottom: '1px solid #e5e7eb',
      marginBottom: '20px'
    },
    subTabsList: {
      display: 'flex',
      gap: '2px',
      width: '100%',
      justifyContent: 'flex-start'
    },
    subTab: {
      flex: 1,
      padding: '12px 24px',
      backgroundColor: '#f9fafb',
      border: 'none',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      color: '#6b7280',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '6px 6px 0 0',
      transition: 'all 0.2s ease',
      marginRight: '2px'
    },
    activeSubTab: {
      backgroundColor: 'white',
      borderBottom: '2px solid #8b5cf6',
      color: '#8b5cf6',
      fontWeight: '600'
    },
    subTabContent: {
      backgroundColor: 'white',
      minHeight: '400px'
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
          {[
            { id: 'users', label: 'Users', icon: Users },
            { id: 'invites', label: 'Invites', icon: Mail },
            { id: 'videos', label: 'Videos', icon: Video, adminOnly: true },
            { id: 'ai', label: 'AI', icon: Bot },
            { id: 'feedback', label: 'Feedback', icon: null }
          ].map((tab) => (
            <button
              key={tab.id}
              style={{
                ...styles.tab,
                ...(activeTab === tab.id ? styles.activeTab : {}),
                ...(tab.adminOnly && !isAdmin ? { opacity: 0.5, cursor: 'not-allowed' } : {}),
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                justifyContent: 'center'
              }}
              onClick={() => {
                if (tab.adminOnly && !isAdmin) return;
                setActiveTab(tab.id);
              }}
              disabled={tab.adminOnly && !isAdmin}
            >
              {tab.icon && <tab.icon size={16} />}
              {tab.label}
              {tab.adminOnly && !isAdmin && ' (Admin Only)'}
            </button>
          ))}
        </div>

        <div style={styles.tabContent}>
          {activeTab === 'users' && <UserManagement />}
          {activeTab === 'invites' && <InviteManagement />}
          {activeTab === 'videos' && isAdmin && <SimpleVideoManagement />}
          {activeTab === 'ai' && (
            <div>
              <div style={styles.subTabsContainer}>
                <div style={styles.subTabsList}>
                  {[
                    { id: 'overview', label: 'Overview', icon: Bot },
                    { id: 'training', label: 'Training', icon: BookOpen }
                  ].map((subTab) => (
                    <button
                      key={subTab.id}
                      style={{
                        ...styles.subTab,
                        ...(activeAITab === subTab.id ? styles.activeSubTab : {})
                      }}
                      onClick={() => setActiveAITab(subTab.id)}
                    >
                      {subTab.icon && <subTab.icon size={16} style={{ marginRight: '8px' }} />}
                      {subTab.label}
                    </button>
                  ))}
                </div>
              </div>
              <div style={styles.subTabContent}>
                {activeAITab === 'overview' && <AIManagement />}
                {activeAITab === 'training' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-xl font-semibold">Training Tools</h2>
                        <p className="text-sm text-gray-600">Manage per‑exercise instructions</p>
                      </div>
                    </div>

                    {/* IA Exercise Instructions inline */}
                    <IAExerciseInstructions />

                    {/* Vector Store Panels */}
                    <AIVectorStoresPanel />
                  </div>
                )}
              </div>
            </div>
          )}
          {activeTab === 'feedback' && <FeedbackManagement />}
        </div>
      </div>
    </div>
  );
}

// Small panel to show vector store files for key assistants
const AIVectorStoresPanel: React.FC = () => {
  const [assistants, setAssistants] = useState<any[]>([]);
  const [filesByStore, setFilesByStore] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/admin/ai/assistants/resources', { credentials: 'include' });
        const data = await res.json();
        if (data?.assistants) {
          setAssistants(data.assistants);
          // Load files for Report Talia and Reflection Talia if available
          const targets = data.assistants.filter((a: any) => /Report Talia|Reflection Talia/i.test(a.name));
          for (const a of targets) {
            try {
              const fr = await fetch(`/api/admin/ai/vector-store/${a.vectorStoreId}/files`, { credentials: 'include' });
              const fdata = await fr.json();
              setFilesByStore(prev => ({ ...prev, [a.vectorStoreId]: fdata.files || [] }));
            } catch {}
          }
          // Load Ultra vector store files if configured (uses projectKey=ultra)
          try {
            const frUltra = await fetch(`/api/admin/ai/vector-store/${ULTRA_VECTOR_STORE_ID}/files?projectKey=ultra`, { credentials: 'include' });
            const fdataUltra = await frUltra.json();
            setFilesByStore(prev => ({ ...prev, [ULTRA_VECTOR_STORE_ID]: fdataUltra.files || [] }));
          } catch {}
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const reportAssistant = assistants.find(a => /Report Talia/i.test(a.name));
  const reflectionAssistant = assistants.find(a => /Reflection Talia/i.test(a.name));
  const ULTRA_VECTOR_STORE_ID = 'vs_689c0216a784819180bd2d242c868588';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="border rounded p-4 bg-white">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold">Production Report Writer</h3>
          {!reportAssistant && <span className="text-xs text-red-600">Not configured</span>}
        </div>
        {reportAssistant && (
          <div className="text-sm text-gray-600 mb-2">Vector Store: {reportAssistant.vectorStoreId}</div>
        )}
        <ul className="text-sm list-disc pl-4">
          {(reportAssistant ? (filesByStore[reportAssistant.vectorStoreId] || []) : []).map((f: any) => (
            <li key={f.id}>{f.filename || f.id}</li>
          ))}
          {!loading && reportAssistant && (filesByStore[reportAssistant.vectorStoreId] || []).length === 0 && (
            <li className="text-gray-500">No files found or no access</li>
          )}
        </ul>
      </div>

      <div className="border rounded p-4 bg-white">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold">Ultra Talia Report Writer</h3>
          {!ULTRA_VECTOR_STORE_ID && <span className="text-xs text-red-600">Not configured</span>}
        </div>
        <div className="text-sm text-gray-600 mb-2">Vector Store: {ULTRA_VECTOR_STORE_ID || '—'}</div>
        <ul className="text-sm list-disc pl-4">
          {(filesByStore[ULTRA_VECTOR_STORE_ID] || []).map((f: any) => (
            <li key={f.id}>{f.filename || f.id}</li>
          ))}
          {!loading && (filesByStore[ULTRA_VECTOR_STORE_ID] || []).length === 0 && (
            <li className="text-gray-500">No files found or no access</li>
          )}
        </ul>
      </div>
    </div>
  );
};
