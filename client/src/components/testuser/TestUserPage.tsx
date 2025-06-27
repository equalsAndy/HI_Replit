import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
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

  // Fetch user profile
  const { data: userResponse, isLoading: userLoading } = useQuery<{
    success: boolean;
    user: UserProfile;
  }>({
    queryKey: ['/api/user/profile'],
    retry: false,
    refetchOnWindowFocus: false
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

      // Determine last activity
      const lastActivity = lastVisitedAt 
        ? getTimeAgo(new Date(lastVisitedAt))
        : 'No recent activity';

      // AST Workshop Progress
      const astSteps = completedSteps.filter((step: string) => !step.startsWith('ia-'));
      const astCurrentStep = appType === 'ast' ? currentStepId : '1-1';
      const astProgress: WorkshopProgress = {
        type: 'ast',
        title: 'AllStarTeams Workshop',
        subtitle: 'Discover your unique strengths',
        currentStep: getStepNumber(astCurrentStep),
        totalSteps: 19,
        stepName: getStepName(astCurrentStep),
        lastActivity: appType === 'ast' ? lastActivity : 'Not recently active',
        logoPath: '/all-star-teams-logo-square.png',
        route: 'allstarteams'
      };

      // IA Workshop Progress
      const iaSteps = completedSteps.filter((step: string) => step.startsWith('ia-'));
      const iaCurrentStep = appType === 'ia' ? currentStepId : 'ia-1-1';
      const iaProgress: WorkshopProgress = {
        type: 'ia',
        title: 'Imaginal Agility Workshop',
        subtitle: 'Enhance your creative thinking',
        currentStep: getStepNumber(iaCurrentStep),
        totalSteps: 8,
        stepName: getStepName(iaCurrentStep),
        lastActivity: appType === 'ia' ? lastActivity : 'Not recently active',
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

  // Create default workshop data if no progress exists
  const createDefaultWorkshops = (): { astProgress: WorkshopProgress; iaProgress: WorkshopProgress; lastActive: 'ast' | 'ia' } => {
    return {
      astProgress: {
        type: 'ast',
        title: 'AllStarTeams Workshop',
        subtitle: 'Discover your unique strengths',
        currentStep: 1,
        totalSteps: 19,
        stepName: 'Workshop Introduction',
        lastActivity: 'Not started',
        logoPath: '/attached_assets/all-star-teams-logo-square.png',
        route: 'allstarteams'
      },
      iaProgress: {
        type: 'ia',
        title: 'Imaginal Agility Workshop',
        subtitle: 'Enhance your creative thinking',
        currentStep: 1,
        totalSteps: 8,
        stepName: 'Introduction to Imaginal Agility',
        lastActivity: 'Not started',
        logoPath: '/attached_assets/IA_sq.png',
        route: 'imaginal-agility'
      },
      lastActive: 'ast'
    };
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

  const { astProgress, iaProgress, lastActive } = getWorkshopProgress.astProgress 
    ? getWorkshopProgress 
    : createDefaultWorkshops();

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Test User Page</h1>
          <p className="text-muted-foreground">Access your workshops and manage your testing progress</p>
        </div>

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