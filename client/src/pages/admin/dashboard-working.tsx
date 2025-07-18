import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { apiRequest } from '@/lib/queryClient';

export default function AdminDashboard() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const [contentAccess, setContentAccess] = React.useState<'student' | 'professional'>('professional');

  // Fetch current user to check permissions
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

  const currentUser = userProfile?.user;

  // Update content access mutation
  const updateContentAccessMutation = useMutation({
    mutationFn: (newAccess: 'student' | 'professional') => 
      apiRequest('/api/user/content-access', {
        method: 'POST',
        body: { contentAccess: newAccess },
      }),
    onSuccess: (data, newAccess) => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      toast({
        title: 'Interface Updated',
        description: `Switched to ${newAccess} interface. This will affect workshop content and assessments.`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Update failed',
        description: 'Failed to update interface preference. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Update contentAccess state when user data changes
  React.useEffect(() => {
    if (currentUser?.contentAccess) {
      setContentAccess(currentUser.contentAccess as 'student' | 'professional');
    }
  }, [currentUser]);

  // Handle interface toggle
  const handleInterfaceToggle = (newAccess: 'student' | 'professional') => {
    setContentAccess(newAccess);
    updateContentAccessMutation.mutate(newAccess);
  };

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: () => apiRequest('/api/auth/logout', { method: 'POST' }),
    onSuccess: () => {
      queryClient.clear();
      toast({
        title: 'Logged out successfully',
        description: 'You have been logged out of the management console.',
      });
      navigate('/');
    },
    onError: (error) => {
      toast({
        title: 'Logout failed',
        description: 'There was an error logging out. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Check if user has management access (admin or facilitator)
  const hasManagementAccess = currentUser?.role === 'admin' || currentUser?.role === 'facilitator';
  const isAdmin = currentUser?.role === 'admin';
  
  // Check if user has access to both student and professional interfaces
  const hasBothInterfaceAccess = hasManagementAccess;

  // Redirect users without management access
  React.useEffect(() => {
    if (currentUser && !hasManagementAccess) {
      toast({
        title: 'Access denied',
        description: 'You do not have permission to access the management console.',
        variant: 'destructive',
      });
      navigate('/');
    }
  }, [currentUser, hasManagementAccess, navigate, toast]);

  if (isLoadingUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
      </div>
    );
  }

  if (!currentUser || !hasManagementAccess) {
    return null; // Will redirect via useEffect for users without management access
  }

  return (
    <div className="container mx-auto py-10 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex flex-col space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">
            {isAdmin ? 'Admin Console' : 'Facilitator Console'}
          </h1>
          <p className="text-sm text-muted-foreground">
            Logged in as {currentUser.name} ({currentUser.role})
          </p>
        </div>
        <div className="flex items-center space-x-4">
          {/* Workshop Navigation Buttons */}
          <div className="flex items-center space-x-2">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm"
              onClick={() => navigate('/allstarteams')}
            >
              ⭐ AllStarTeams
            </button>
            <button
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded text-sm"
              onClick={() => navigate('/imaginal-agility')}
            >
              🧠 Imaginal Agility
            </button>
          </div>

          {/* Interface Toggle - Only for users with both interface access */}
          {hasBothInterfaceAccess && (
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-600">Interface:</span>
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  className={`flex items-center gap-2 px-3 py-1 rounded ${
                    contentAccess === 'student' 
                      ? 'bg-white shadow text-blue-600' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                  onClick={() => handleInterfaceToggle('student')}
                  disabled={updateContentAccessMutation.isPending}
                >
                  🎓 Student
                </button>
                <button
                  className={`flex items-center gap-2 px-3 py-1 rounded ${
                    contentAccess === 'professional' 
                      ? 'bg-white shadow text-blue-600' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                  onClick={() => handleInterfaceToggle('professional')}
                  disabled={updateContentAccessMutation.isPending}
                >
                  👤 Professional
                </button>
              </div>
            </div>
          )}

          <button
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded text-sm"
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
          >
            {logoutMutation.isPending ? 'Logging out...' : '🚪 Logout'}
          </button>
        </div>
      </div>

      {/* Simple admin content without problematic components */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Admin Dashboard</h2>
        <p className="text-gray-600 mb-4">
          Welcome to the admin console. The interface toggle above allows you to switch between student and professional views when navigating workshops.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Current Settings</h3>
            <p className="text-sm text-blue-600">
              <strong>User:</strong> {currentUser.name}<br/>
              <strong>Role:</strong> {currentUser.role}<br/>
              <strong>Interface:</strong> {contentAccess}
            </p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">Quick Actions</h3>
            <div className="space-y-2">
              <button 
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded text-sm"
                onClick={() => navigate('/allstarteams')}
              >
                Go to AllStarTeams Workshop
              </button>
              <button 
                className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded text-sm"
                onClick={() => navigate('/imaginal-agility')}
              >
                Go to Imaginal Agility Workshop
              </button>
            </div>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
          <h3 className="font-semibold text-yellow-800 mb-2">Interface Toggle Instructions</h3>
          <p className="text-sm text-yellow-700">
            Use the Student/Professional toggle above to switch between different workshop experiences. 
            This setting affects the content and assessments shown in both AllStarTeams and Imaginal Agility workshops.
          </p>
        </div>
      </div>
    </div>
  );
}
