import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { UserRole } from '@/shared/types';
import { useLocation } from 'wouter';

// Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

// Admin Components
import { UserManagement } from '@/components/admin/UserManagement';
import { CohortManagement } from '@/components/admin/CohortManagement';

export default function AdminDashboard() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  // Fetch current user to check permissions
  const { data: currentUser, isLoading: isLoadingUser } = useQuery<{
    id: number;
    name: string;
    title?: string;
    organization?: string;
  }>({
    queryKey: ['/api/user/profile'],
    retry: false,
  });
  
  // Redirect non-admin users (for now, we'll consider only user ID 1 as admin)
  React.useEffect(() => {
    if (currentUser && currentUser.id !== 1) {
      toast({
        title: 'Access denied',
        description: 'You do not have permission to access the admin dashboard.',
        variant: 'destructive',
      });
      navigate('/');
    }
  }, [currentUser, navigate, toast]);

  if (isLoadingUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!currentUser || currentUser.id !== 1) {
    return null; // Will redirect via useEffect for non-admin users
  }

  return (
    <div className="container mx-auto py-10 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <Button variant="outline" onClick={() => navigate('/')}>
          Return to Dashboard
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Overview</CardTitle>
          <CardDescription>
            View and manage your application's key components
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatsCard title="Total Users" value="..." />
            <StatsCard title="Active Cohorts" value="..." />
            <StatsCard title="Completed Assessments" value="..." />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid grid-cols-3 w-[600px]">
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="cohorts">Cohort Management</TabsTrigger>
          <TabsTrigger value="videos">Video Management</TabsTrigger>
        </TabsList>
        
        <TabsContent value="users" className="mt-6">
          <UserManagementTab />
        </TabsContent>
        
        <TabsContent value="cohorts" className="mt-6">
          <CohortManagementTab />
        </TabsContent>

        <TabsContent value="videos" className="mt-6">
          <VideoManagementTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface StatsCardProps {
  title: string;
  value: string;
}

function StatsCard({ title, value }: StatsCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col space-y-2">
          <span className="text-sm text-muted-foreground">{title}</span>
          <span className="text-3xl font-bold">{value}</span>
        </div>
      </CardContent>
    </Card>
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