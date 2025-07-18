import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';

export default function AdminDashboard() {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const [contentAccess, setContentAccess] = React.useState<'student' | 'professional'>('professional');

  // Simple toast functionality without external dependency
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    const toastEl = document.createElement('div');
    toastEl.className = `fixed top-4 right-4 p-4 rounded-lg text-white z-50 ${
      type === 'error' ? 'bg-red-500' : 'bg-green-500'
    }`;
    toastEl.textContent = message;
    document.body.appendChild(toastEl);
    setTimeout(() => {
      document.body.removeChild(toastEl);
    }, 3000);
  };

  // Basic API request function
  const apiRequest = async (url: string, options: RequestInit = {}) => {
    const response = await fetch(url, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }
    
    return response.json();
  };

  // Fetch current user to check permissions
  const { data: userProfile, isLoading: isLoadingUser, error } = useQuery<{
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
    queryFn: () => apiRequest('/api/auth/me'),
    retry: false,
  });

  const currentUser = userProfile?.user;

  // Update content access mutation
  const updateContentAccessMutation = useMutation({
    mutationFn: (newAccess: 'student' | 'professional') => 
      apiRequest('/api/user/content-access', {
        method: 'POST',
        body: JSON.stringify({ contentAccess: newAccess }),
      }),
    onSuccess: (data, newAccess) => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      showToast(`Switched to ${newAccess} interface. This will affect workshop content and assessments.`);
    },
    onError: (error) => {
      showToast('Failed to update interface preference. Please try again.', 'error');
    },
  });

  // Set content access from user profile when loaded
  React.useEffect(() => {
    if (currentUser?.contentAccess) {
      setContentAccess(currentUser.contentAccess as 'student' | 'professional');
    }
  }, [currentUser?.contentAccess]);

  const handleContentAccessChange = (newAccess: 'student' | 'professional') => {
    setContentAccess(newAccess);
    updateContentAccessMutation.mutate(newAccess);
  };

  if (isLoadingUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-md">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> Failed to load admin data. Please refresh the page.</span>
          </div>
        </div>
      </div>
    );
  }

  if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'facilitator')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded max-w-md">
            <strong className="font-bold">Access Denied!</strong>
            <span className="block sm:inline"> You don't have permission to access this area.</span>
            <div className="mt-4">
              <button
                onClick={() => navigate('/')}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                Welcome, {currentUser.name} ({currentUser.role})
              </span>
              <button
                onClick={() => navigate('/')}
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Interface Toggle Section */}
          <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Content Interface Preference
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Choose which interface users will see when accessing workshop content. This affects the complexity and presentation of materials.
              </p>
              
              <div className="flex space-x-4">
                <button
                  onClick={() => handleContentAccessChange('student')}
                  disabled={updateContentAccessMutation.isPending}
                  className={`px-4 py-2 rounded-md font-medium transition-colors ${
                    contentAccess === 'student'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  } ${updateContentAccessMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  Student Interface
                </button>
                <button
                  onClick={() => handleContentAccessChange('professional')}
                  disabled={updateContentAccessMutation.isPending}
                  className={`px-4 py-2 rounded-md font-medium transition-colors ${
                    contentAccess === 'professional'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  } ${updateContentAccessMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  Professional Interface
                </button>
              </div>
              
              {updateContentAccessMutation.isPending && (
                <p className="text-sm text-gray-500 mt-2">Updating interface preference...</p>
              )}
            </div>
          </div>

          {/* Admin Actions */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Admin Actions
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <button
                  onClick={() => navigate('/allstarteams')}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-4 px-4 rounded text-center block"
                >
                  All Star Teams Workshop
                </button>
                <button
                  onClick={() => navigate('/imaginal-agility')}
                  className="bg-green-500 hover:bg-green-700 text-white font-bold py-4 px-4 rounded text-center block"
                >
                  Imaginal Agility Workshop
                </button>
                <button
                  onClick={() => navigate('/workshop-reset-test')}
                  className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-4 px-4 rounded text-center block"
                >
                  Workshop Reset Test
                </button>
              </div>
            </div>
          </div>

          {/* Status Info */}
          <div className="bg-white overflow-hidden shadow rounded-lg mt-6">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                System Status
              </h3>
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Current User</dt>
                  <dd className="mt-1 text-sm text-gray-900">{currentUser.name}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Role</dt>
                  <dd className="mt-1 text-sm text-gray-900">{currentUser.role}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Current Interface</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {contentAccess === 'student' ? 'Student' : 'Professional'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">User ID</dt>
                  <dd className="mt-1 text-sm text-gray-900">{currentUser.id}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
