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

  // Fetch navigation progress data using admin endpoint (same structure)
  const { data: navigationData, isLoading: navLoading } = useQuery<any>({
    queryKey: [`/api/admin/users/${userResponse?.user?.id}/export`],
    queryFn: async () => {
      if (!userResponse?.user?.id) return null;
      const response = await fetch(`/api/admin/users/${userResponse.user.id}/export`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch navigation data');
      return response.json();
    },
    enabled: !!userResponse?.user?.id,
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

  // Helper function to extract step number (sequential position in workshop)
  const getStepNumber = (stepId: string): number => {
    if (stepId.startsWith('ia-')) {
      const match = stepId.match(/ia-(\d+)-/);
      return match ? parseInt(match[1]) : 1;
    }
    
    // AST step ID to sequential number mapping
    const astStepOrder: Record<string, number> = {
      '1-1': 1,   // Section 1
      '2-1': 2,   // Section 2
      '2-2': 3,
      '2-3': 4,
      '2-4': 5,
      '3-1': 6,   // Section 3
      '3-2': 7,
      '3-3': 8,
      '3-4': 9,
      '4-1': 10,  // Section 4
      '4-2': 11,
      '4-3': 12,
      '4-4': 13,
      '4-5': 14   // Final step
    };
    
    return astStepOrder[stepId] || 1;
  };

  // Helper function to get step name
  const getStepName = (stepId: string): string => {
    const stepNames: Record<string, string> = {
      // AST steps
      '1-1': 'Workshop Introduction',
      '2-1': 'Strengths Overview',
      '2-2': 'Star Strengths Assessment',
      '2-3': 'Review Your Star Card',
      '2-4': 'Strength Reflection',
      '3-1': 'Intro to Flow',
      '3-2': 'Flow Assessment',
      '3-3': 'Rounding Out',
      '3-4': 'Add Flow to Star Card',
      '4-1': 'Ladder of Well-being',
      '4-2': 'Well-being Reflections',
      '4-3': 'Visualizing You',
      '4-4': 'Your Future Self',
      '4-5': 'Final Reflection',
      // IA steps
      'ia-1-1': 'Introduction to Imaginal Agility',
      'ia-2-1': 'The Triple Challenge',
      'ia-3-1': 'The Imaginal Agility Solution',
      'ia-4-1': 'Self-Assessment',
      'ia-5-1': 'Assessment Results',
      'ia-6-1': 'Teamwork Preparation',
      'ia-7-1': 'Reality Discernment',
      'ia-8-1': 'Neuroscience'
    };
    return stepNames[stepId] || 'Workshop Step';
  };

  // Parse navigation progress to determine workshop data
  const getWorkshopProgress = React.useMemo(() => {
    if (!navigationData?.navigationProgress) {
      return { astProgress: null, iaProgress: null, lastActive: 'ast' };
    }

    try {
      const navProgress = navigationData.navigationProgress;
      console.log('Navigation data structure:', navProgress);

      // AST Workshop Progress
      const astData = navProgress.ast;
      let astProgress: WorkshopProgress | null = null;
      
      if (astData) {
        const astCompletedSteps = astData.completedSteps || [];
        const astCurrentStep = astData.currentStepId;
        const astLastVisited = astData.lastVisitedAt;
        
        // Determine if AST workshop is started
        const astStarted = astCompletedSteps.length > 0 || (astCurrentStep && astCurrentStep !== '1-1');
        
        astProgress = {
          type: 'ast',
          title: 'AllStarTeams Workshop',
          subtitle: 'Discover your unique strengths',
          currentStep: astStarted ? getStepNumber(astCurrentStep || '1-1') : 1,
          totalSteps: 14, // Only 14 actual steps in AST workshop
          stepName: astStarted ? getStepName(astCurrentStep || '1-1') : 'Workshop Introduction',
          lastActivity: astStarted && astLastVisited ? getTimeAgo(new Date(astLastVisited)) : 'Not started',
          logoPath: '/all-star-teams-logo-square.png',
          route: 'allstarteams'
        };
      }

      // IA Workshop Progress  
      const iaData = navProgress.ia;
      let iaProgress: WorkshopProgress | null = null;
      
      if (iaData) {
        const iaCompletedSteps = iaData.completedSteps || [];
        const iaCurrentStep = iaData.currentStepId;
        const iaLastVisited = iaData.lastVisitedAt;
        
        // Determine if IA workshop is started
        const iaStarted = iaCompletedSteps.length > 0 || (iaCurrentStep && iaCurrentStep !== 'ia-1-1');
        
        iaProgress = {
          type: 'ia',
          title: 'Imaginal Agility Workshop',
          subtitle: 'Enhance your creative thinking',
          currentStep: iaStarted ? getStepNumber(iaCurrentStep || 'ia-1-1') : 1,
          totalSteps: 8,
          stepName: iaStarted ? getStepName(iaCurrentStep || 'ia-1-1') : 'Introduction to Imaginal Agility',
          lastActivity: iaStarted && iaLastVisited ? getTimeAgo(new Date(iaLastVisited)) : 'Not started',
          logoPath: '/IA_sq.png',
          route: 'imaginal-agility'
        };
      }

      // Determine which workshop was last active
      let lastActive: 'ast' | 'ia' = 'ast';
      if (astData?.lastVisitedAt && iaData?.lastVisitedAt) {
        lastActive = new Date(astData.lastVisitedAt) > new Date(iaData.lastVisitedAt) ? 'ast' : 'ia';
      } else if (iaData?.lastVisitedAt) {
        lastActive = 'ia';
      }

      return {
        astProgress,
        iaProgress,
        lastActive
      };
    } catch (error) {
      console.error('Error parsing navigation progress:', error);
      return { astProgress: null, iaProgress: null, lastActive: 'ast' };
    }
  }, [navigationData]);


  if (userLoading || navLoading) {
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
    totalSteps: 14,
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