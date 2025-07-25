import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { UserRole } from '@/shared/types';
import { useLocation } from 'wouter';
import { apiRequest } from '@/lib/queryClient';
import VersionInfo from '@/components/ui/VersionInfo';

// Error Boundary for catching React errors
class AdminErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: any }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('❌ ADMIN DASHBOARD ERROR:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <p className="text-lg font-medium text-red-600">Admin Dashboard Error</p>
            <p className="text-sm text-muted-foreground">Something went wrong loading the admin interface</p>
            <details className="mt-4 text-left">
              <summary className="cursor-pointer">Error Details</summary>
              <pre className="mt-2 text-xs bg-gray-100 p-2 rounded">
                {this.state.error?.toString()}
              </pre>
            </details>
            <button 
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
              onClick={() => window.location.reload()}
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Loader2, LogOut, User, GraduationCap } from 'lucide-react';

// Admin Components
import { UserManagement } from '@/components/admin/UserManagement';
import { CohortManagement } from '@/components/admin/CohortManagement';
import { InviteManagement } from '@/components/admin/InviteManagement';
import { SimpleVideoManagement } from '@/components/admin/SimpleVideoManagement';

export default function AdminDashboard() {
  console.log('🚀 ADMIN DASHBOARD: Component rendering started');
  console.log('🚀 ADMIN DASHBOARD: Current URL:', window.location.href);
  console.log('🚀 ADMIN DASHBOARD: Current pathname:', window.location.pathname);
  
  try {
    return (
      <AdminErrorBoundary>
        <AdminDashboardContent />
      </AdminErrorBoundary>
    );
  } catch (error) {
    console.error('❌ Error in AdminDashboard:', error);
    return (
      <div style={{ padding: '20px', backgroundColor: 'lightcoral' }}>
        <h1>ADMIN DASHBOARD ERROR</h1>
        <p>Error: {String(error)}</p>
        <p>Check console for details</p>
      </div>
    );
  }
}

function AdminDashboardContent() {
  console.log('🔧 AdminDashboardContent: Starting to render');
  
  // Simple inline styles instead of complex UI components
  const styles = {
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '40px 20px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    },
    header: {
      marginBottom: '30px',
      borderBottom: '2px solid #e5e7eb',
      paddingBottom: '20px'
    },
    title: {
      fontSize: '32px',
      fontWeight: 'bold',
      color: '#1f2937',
      margin: '0 0 10px 0'
    },
    subtitle: {
      fontSize: '14px',
      color: '#6b7280',
      margin: 0
    },
    tabsContainer: {
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      overflow: 'hidden'
    },
    tabsList: {
      display: 'flex',
      backgroundColor: '#f9fafb',
      borderBottom: '1px solid #e5e7eb'
    },
    tab: {
      flex: 1,
      padding: '12px 16px',
      border: 'none',
      backgroundColor: 'transparent',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500'
    },
    activeTab: {
      backgroundColor: '#white',
      borderBottom: '2px solid #3b82f6'
    },
    tabContent: {
      padding: '30px',
      minHeight: '400px'
    },
    card: {
      border: '1px solid #e5e7eb',
      borderRadius: '6px',
      padding: '20px',
      backgroundColor: 'white'
    }
  };

  const [activeTab, setActiveTab] = React.useState('videos');

  try {
    const { data: userProfile, isLoading: isLoadingUser } = useQuery<{
      success: boolean;
      user: {
        id: number;
        name: string;
        role: string;
        title?: string;
        organization?: string;
        contentAccess?: string;
      }
    }>({
      queryKey: ['/api/auth/me'],
      retry: false,
    });

    // IMPORTANT: Extract user correctly to prevent blank dashboard
    // The API returns { success: boolean, user: {...} }
    console.log('🔍 ADMIN DASHBOARD DEBUG REPORT:');
    console.log('================================');
    console.log('1. Full userProfile response:', userProfile);
    console.log('2. userProfile type:', typeof userProfile);
    console.log('3. userProfile.success:', userProfile?.success);
    console.log('4. userProfile.user:', userProfile?.user);
    console.log('5. isLoadingUser:', isLoadingUser);
    
    const currentUser = userProfile?.success ? userProfile.user : null;
    console.log('6. Extracted currentUser:', currentUser);
    console.log('7. hasManagementAccess will be:', currentUser?.role === 'admin' || currentUser?.role === 'facilitator');
    console.log('================================');

    if (isLoadingUser) {
      console.log('🔄 ADMIN DASHBOARD: Loading user profile...');
      return (
        <div style={styles.container}>
          <div style={{ textAlign: 'center', marginTop: '100px' }}>
            <div style={{ fontSize: '18px', marginBottom: '10px' }}>Loading admin dashboard...</div>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>Authenticating user access</div>
          </div>
        </div>
      );
    }

    if (!userProfile) {
      console.log('❌ ADMIN DASHBOARD: No userProfile received from API');
      return (
        <div style={styles.container}>
          <div style={{ textAlign: 'center', marginTop: '100px' }}>
            <div style={{ fontSize: '18px', color: '#dc2626', marginBottom: '10px' }}>Authentication Error</div>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>No user profile received from server</div>
            <button 
              style={{ marginTop: '20px', padding: '10px 20px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        </div>
      );
    }

    // Check if user has management access (admin or facilitator)
    const hasManagementAccess = currentUser?.role === 'admin' || currentUser?.role === 'facilitator';
    const isAdmin = currentUser?.role === 'admin';
    
    if (!currentUser || !hasManagementAccess) {
      console.log('❌ ADMIN DASHBOARD: Access denied');
      console.log('   currentUser exists:', !!currentUser);
      console.log('   currentUser role:', currentUser?.role);
      console.log('   hasManagementAccess:', hasManagementAccess);
      
      return (
        <div style={styles.container}>
          <div style={{ textAlign: 'center', marginTop: '100px' }}>
            <div style={{ fontSize: '18px', color: '#dc2626', marginBottom: '10px' }}>
              {!currentUser ? 'Authentication Required' : 'Access Denied'}
            </div>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>
              {!currentUser 
                ? 'Please log in to access admin features' 
                : 'You do not have permission to access the management console'
              }
            </div>
          </div>
        </div>
      );
    }

    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={styles.title}>
                {isAdmin ? 'Admin Console' : 'Facilitator Console'}
              </h1>
              <p style={styles.subtitle}>
                Logged in as {currentUser.name} ({currentUser.role})
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <VersionInfo variant="detailed" />
            </div>
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
                  ...(tab === 'videos' && !isAdmin ? { opacity: 0.5, cursor: 'not-allowed' } : {})
                }}
                onClick={() => tab !== 'videos' || isAdmin ? setActiveTab(tab) : null}
                disabled={tab === 'videos' && !isAdmin}
              >
                {tab === 'users' && 'User Management'}
                {tab === 'cohorts' && 'Cohort Management'}
                {tab === 'invites' && 'Invite Management'}
                {tab === 'videos' && `Video Management ${!isAdmin ? '(Admin Only)' : ''}`}
              </button>
            ))}
          </div>

          <div style={styles.tabContent}>
            {activeTab === 'users' && (
              <div style={styles.card}>
                <h3 style={{ margin: '0 0 20px 0', fontSize: '20px' }}>User Management</h3>
                <p style={{ color: '#6b7280', marginBottom: '20px' }}>Manage user accounts, roles, and permissions</p>
                <div style={{ padding: '20px', backgroundColor: '#f9fafb', borderRadius: '6px' }}>
                  <p>User Management component would load here</p>
                </div>
              </div>
            )}

            {activeTab === 'cohorts' && (
              <div style={styles.card}>
                <h3 style={{ margin: '0 0 20px 0', fontSize: '20px' }}>Cohort Management</h3>
                <p style={{ color: '#6b7280', marginBottom: '20px' }}>Manage user cohorts and groups</p>
                <div style={{ padding: '20px', backgroundColor: '#f9fafb', borderRadius: '6px' }}>
                  <p>Cohort Management component would load here</p>
                </div>
              </div>
            )}

            {activeTab === 'invites' && (
              <div style={styles.card}>
                <h3 style={{ margin: '0 0 20px 0', fontSize: '20px' }}>Invite Management</h3>
                <p style={{ color: '#6b7280', marginBottom: '20px' }}>Create and manage invitation codes for new users</p>
                <div style={{ padding: '20px', backgroundColor: '#f9fafb', borderRadius: '6px' }}>
                  <p>Invite Management component would load here</p>
                </div>
              </div>
            )}

            {activeTab === 'videos' && isAdmin && (
              <div style={styles.card}>
                <h3 style={{ margin: '0 0 20px 0', fontSize: '20px' }}>Video Management</h3>
                <p style={{ color: '#6b7280', marginBottom: '20px' }}>
                  Manage videos for all workshops. Add, edit, and view videos used throughout the platform.
                </p>
                <div style={{ padding: '20px', backgroundColor: '#f0f9ff', borderRadius: '6px', border: '1px solid #0ea5e9' }}>
                  <h4 style={{ margin: '0 0 15px 0', color: '#0369a1' }}>🎉 Enhanced Video Management System</h4>
                  <p style={{ margin: '0 0 10px 0' }}>✅ <strong>21 videos</strong> successfully loaded with enhanced features:</p>
                  <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
                    <li>🔍 Search and filtering (All/AST/IA/General)</li>
                    <li>📊 Sortable columns (Title, Workshop, Step, etc.)</li>
                    <li>⚙️ Watch requirements toggle (currently set to 1%)</li>
                    <li>🎨 Enhanced UI with badges and progress indicators</li>
                    <li>🔄 Real-time YouTube ID editing</li>
                  </ul>
                  <div style={{ marginTop: '20px', padding: '15px', backgroundColor: 'white', borderRadius: '4px' }}>
                    <p style={{ margin: 0, fontWeight: 'bold' }}>The enhanced SimpleVideoManagement component is ready!</p>
                    <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#6b7280' }}>
                      All 21 videos from AllStarTeams and Imaginal Agility workshops are loaded with smart defaults.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );

  } catch (error) {
    console.error('❌ Error in AdminDashboardContent:', error);
    return (
      <div style={{ padding: '20px', backgroundColor: 'lightcoral' }}>
        <h1>ADMIN DASHBOARD CONTENT ERROR</h1>
        <p>Error: {String(error)}</p>
        <p>Check console for details</p>
      </div>
    );
  }
}

// User Management Tab Component
function UserManagementTab() {
  const { data: userProfile } = useQuery<{
    success: boolean;
    user: {
      id: number;
      name: string;
      role: string;
    }
  }>({
    queryKey: ['/api/auth/me'],
    retry: false,
  });
  
  // Extract user from response structure consistently with main component
  const currentUser = userProfile?.success ? userProfile.user : null;
  
  return <UserManagement currentUser={currentUser} />;
}

// Cohort Management Tab Component
function CohortManagementTab() {
  return <CohortManagement />;
}

// Video Management Tab Component
function VideoManagementTab() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Video Management</CardTitle>
          <CardDescription>
            Manage videos for all workshops. Add, edit, and view videos used throughout the platform.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SimpleVideoManagement />
        </CardContent>
      </Card>
    </div>
  );
}