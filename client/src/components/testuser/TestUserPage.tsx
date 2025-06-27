import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import WorkshopCard from './WorkshopCard';
import TestUserTools from './TestUserTools';

interface UserProfile {
  id: number;
  name: string;
  username: string;
  email: string;
  role: string;
  organization: string | null;
  jobTitle: string | null;
  profilePicture: string | null;
  isTestUser?: boolean;
  navigationProgress?: string | null;
}

interface WorkshopProgress {
  type: 'ast' | 'ia';
  title: string;
  subtitle: string;
  currentStep: number;
  totalSteps: number;
  stepName: string;
  lastActivity: string;
  logoPath: string;
  route: string;
}

const TestUserPage: React.FC = () => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user profile
  const { data: userResponse, isLoading: userLoading } = useQuery<{
    success: boolean;
    user: UserProfile;
  }>({
    queryKey: ['/api/user/profile'],
    retry: false,
    refetchOnWindowFocus: false
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: () => apiRequest('/api/auth/logout', { method: 'POST' }),
    onSuccess: () => {
      queryClient.clear();
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      });
      setLocation('/auth');
    },
    onError: (error: any) => {
      toast({
        title: "Logout failed",
        description: error.message || "There was an error logging out.",
        variant: "destructive"
      });
    }
  });

  // Redirect non-test users
  React.useEffect(() => {
    if (userResponse && !userResponse.user?.isTestUser) {
      toast({
        variant: 'destructive',
        title: 'Access Denied',
        description: 'This page is only available to test users.',
      });
      setLocation('/dashboard');
    }
  }, [userResponse, setLocation, toast]);

  // Parse navigation progress to determine workshop data
  const getWorkshopProgress = React.useMemo(() => {
    if (!userResponse?.user?.navigationProgress) {
      return { astProgress: null, iaProgress: null, lastActive: 'ast' };
    }

    try {
      const navData = JSON.parse(userResponse.user.navigationProgress);
      const completedSteps = navData.completedSteps || [];
      const currentStepId = navData.currentStepId || '1-1';
      const appType = navData.appType || 'ast';
      const lastVisitedAt = navData.lastVisitedAt;

      // Filter steps by workshop type
      const astSteps = completedSteps.filter((step: string) => !step.startsWith('ia-'));
      const iaSteps = completedSteps.filter((step: string) => step.startsWith('ia-'));

      // Determine AST workshop progress
      const astProgress: WorkshopProgress = {
        type: 'ast',
        title: 'AllStarTeams Workshop',
        subtitle: 'Discover your unique strengths',
        currentStep: astSteps.length === 0 ? 1 : getStepNumber(appType === 'ast' ? currentStepId : '1-1'),
        totalSteps: 19,
        stepName: astSteps.length === 0 ? 'Workshop Introduction' : getStepName(appType === 'ast' ? currentStepId : '1-1'),
        lastActivity: astSteps.length === 0 ? 'Not started' : (appType === 'ast' && lastVisitedAt ? getTimeAgo(new Date(lastVisitedAt)) : 'Not recently active'),
        logoPath: '/all-star-teams-logo-square.png',
        route: 'allstarteams'
      };

      // Determine IA workshop progress
      const iaProgress: WorkshopProgress = {
        type: 'ia',
        title: 'Imaginal Agility Workshop',
        subtitle: 'Enhance your creative thinking',
        currentStep: iaSteps.length === 0 ? 1 : getStepNumber(appType === 'ia' ? currentStepId : 'ia-1-1'),
        totalSteps: 8,
        stepName: iaSteps.length === 0 ? 'Introduction to Imaginal Agility' : getStepName(appType === 'ia' ? currentStepId : 'ia-1-1'),
        lastActivity: iaSteps.length === 0 ? 'Not started' : (appType === 'ia' && lastVisitedAt ? getTimeAgo(new Date(lastVisitedAt)) : 'Not recently active'),
        logoPath: '/IA_sq.png',
        route: 'imaginal-agility'
      };

      return {
        astProgress,
        iaProgress,
        lastActive: appType
      };
    } catch (error) {
      console.error('Error parsing navigation progress:', error);
      return { astProgress: null, iaProgress: null, lastActive: 'ast' };
    }
  }, [userResponse?.user?.navigationProgress]);

  // Helper function to get time ago string
  const getTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffWeeks = Math.floor(diffDays / 7);

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffWeeks === 1) return '1 week ago';
    return `${diffWeeks} weeks ago`;
  };

  // Helper function to extract step number
  const getStepNumber = (stepId: string): number => {
    if (stepId.startsWith('ia-')) {
      const match = stepId.match(/ia-(\d+)-/);
      return match ? parseInt(match[1]) : 1;
    }
    const match = stepId.match(/(\d+)/);
    return match ? parseInt(match[1]) : 1;
  };

  // Helper function to get step name
  const getStepName = (stepId: string): string => {
    const stepNames: Record<string, string> = {
      // AST steps
      '1-1': 'Workshop Introduction',
      '2-1': 'Strengths Overview',
      '2-2': 'Star Strengths Assessment',
      '3-1': 'Flow Introduction',
      '4-1': 'Flow Assessment',
      '5': 'Well-being Assessment',
      '5-1': 'Well-being Assessment',
      '6-1': 'Final Reflection',
      // IA steps
      'ia-1-1': 'Introduction to Imaginal Agility',
      'ia-2-1': 'Reality Discernment',
      'ia-3-1': 'Creative Solutions',
      'ia-4-1': 'Self-Assessment',
      'ia-5-1': 'Teamwork Preparation',
      'ia-6-1': 'Advanced Discernment',
      'ia-7-1': 'Integration',
      'ia-8-1': 'Final Application'
    };
    return stepNames[stepId] || 'Workshop Step';
  };



  if (userLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your test user dashboard...</p>
        </div>
      </div>
    );
  }

  if (!userResponse?.user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-destructive">Failed to load user data</p>
        </div>
      </div>
    );
  }

  // Get workshop progress data - either from parsed navigationProgress or create "Not started" defaults
  const progress = getWorkshopProgress;
  
  // Create default "Not started" workshops if no progress exists
  const astProgress = progress.astProgress || {
    type: 'ast' as const,
    title: 'AllStarTeams Workshop',
    subtitle: 'Discover your unique strengths',
    currentStep: 1,
    totalSteps: 19,
    stepName: 'Workshop Introduction',
    lastActivity: 'Not started',
    logoPath: '/all-star-teams-logo-square.png',
    route: 'allstarteams' as const
  };
  
  const iaProgress = progress.iaProgress || {
    type: 'ia' as const,
    title: 'Imaginal Agility Workshop',
    subtitle: 'Enhance your creative thinking',
    currentStep: 1,
    totalSteps: 8,
    stepName: 'Introduction to Imaginal Agility',
    lastActivity: 'Not started',
    logoPath: '/IA_sq.png',
    route: 'imaginal-agility' as const
  };
  
  const lastActive = progress.lastActive || 'ast';

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Test User Page</h1>
          <p className="text-muted-foreground">Access your workshops and manage your testing progress</p>
        </div>

        {/* Profile Information Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Logged in as:</p>
                <p className="font-medium">{userResponse.user.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email:</p>
                <p className="font-medium">{userResponse.user.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Role:</p>
                <p className="font-medium">Test User</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Username:</p>
                <p className="font-medium">{userResponse.user.username}</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              {logoutMutation.isPending ? 'Logging out...' : 'Logout'}
            </Button>
          </CardContent>
        </Card>

        {/* Workshop Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {astProgress && (
            <WorkshopCard 
              workshop={astProgress}
              isLastActive={lastActive === 'ast'}
            />
          )}
          {iaProgress && (
            <WorkshopCard 
              workshop={iaProgress}
              isLastActive={lastActive === 'ia'}
            />
          )}
        </div>

        {/* Test User Tools */}
        <TestUserTools userId={userResponse.user.id} />
      </main>
    </div>
  );
};

export default TestUserPage;