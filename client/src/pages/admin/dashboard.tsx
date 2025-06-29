import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { UserRole } from '@/shared/types';
import { useLocation } from 'wouter';
import { apiRequest } from '@/lib/queryClient';

// Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Loader2, LogOut } from 'lucide-react';

// Admin Components
import { UserManagement } from '@/components/admin/UserManagement';
import { CohortManagement } from '@/components/admin/CohortManagement';
import { InviteManagement } from '@/components/admin/InviteManagement';
import { SimpleVideoManagement } from '@/components/admin/SimpleVideoManagement';

export default function AdminDashboard() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();

  // Fetch current user to check permissions
  const { data: currentUser, isLoading: isLoadingUser } = useQuery<{
    id: number;
    name: string;
    role: string;
    title?: string;
    organization?: string;
  }>({
    queryKey: ['/api/user/me'],
    retry: false,
  });

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
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
            {isAdmin ? 'Admin Console' : 'Management Console'}
          </h1>
          <p className="text-sm text-muted-foreground">
            Logged in as {currentUser.name} ({currentUser.role})
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => navigate('/allstarteams')}>
            AllStarTeams Workshop
          </Button>
          <Button variant="outline" onClick={() => navigate('/imaginal-agility')}>
            Imaginal Agility Workshop
          </Button>
          <Button
            variant="destructive"
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
            className="flex items-center gap-2"
          >
            {logoutMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <LogOut className="h-4 w-4" />
            )}
            Logout
          </Button>
        </div>
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="cohorts">Cohort Management</TabsTrigger>
          <TabsTrigger value="invites">Invite Management</TabsTrigger>
          <TabsTrigger 
            value="videos" 
            disabled={!isAdmin} 
            className={!isAdmin ? "opacity-50 cursor-not-allowed" : ""}
          >
            Video Management {!isAdmin && "(Admin Only)"}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-6">
          <UserManagementTab />
        </TabsContent>

        <TabsContent value="cohorts" className="mt-6">
          <CohortManagementTab />
        </TabsContent>

        <TabsContent value="invites" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Invite Management</CardTitle>
              <CardDescription>Create and manage invitation codes for new users.</CardDescription>
            </CardHeader>
            <CardContent>
              <InviteManagement />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="videos" className="mt-6">
          <VideoManagementTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// User Management Tab Component
function UserManagementTab() {
  return <UserManagement />;
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