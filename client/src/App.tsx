import React, { Suspense } from 'react';
import { Route, Switch, useLocation, Router } from 'wouter';
import { Toaster } from '@/components/ui/toaster';
import InviteRegistrationPage from '@/pages/invite-registration';
import AuthPage from '@/pages/auth-page';
import LoginPage from '@/pages/auth/login';
import DashboardPage from '@/pages/dashboard';
import TestUserPage from '@/pages/testuser';
import NotFoundPage from '@/pages/not-found';
import LandingPage from '@/pages/landing';
import AllStarTeamsPage from '@/pages/allstarteams';
import ImaginalAgilityPage from '@/pages/imaginal-agility';
import ImaginalAgilityWorkshop from '@/pages/ImaginalAgilityWorkshop';
import ImaginalAgilityDemo from '@/pages/ImaginalAgilityDemo';
import ImaginalAgilityWorkshopNew from '@/pages/ImaginalAgilityWorkshopNew';

import AdminDashboard from '@/pages/admin/dashboard';
import WorkshopResetTestPage from '@/pages/workshop-reset-test';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { ApplicationProvider } from '@/hooks/use-application';
import { DemoModeProvider } from '@/hooks/use-demo-mode';
import ErrorBoundary from '@/components/core/ErrorBoundary';
import AutoSync from '@/components/AutoSync';
import { useQuery } from '@tanstack/react-query';

// No need for a custom history hook, we'll use the default wouter behavior

// Component to conditionally render AutoSync with user data
const AutoSyncWrapper: React.FC = () => {
  const { data: user } = useQuery<{ id: number; name: string; role: string }>({
    queryKey: ['/api/user/me'],
    retry: false,
    refetchOnWindowFocus: false
  });

  return user?.id ? <AutoSync userId={user.id} /> : null;
};

const App: React.FC = () => {
  const [location] = useLocation();

  // Debug current route
  React.useEffect(() => {
    console.log('🔍 APP ROUTE DEBUG - Current location:', location);
    console.log('🔍 APP ROUTE DEBUG - Is IA route?', location.includes('/imaginal-agility'));
    console.log('🔍 APP ROUTE DEBUG - Is AST route?', location.includes('/allstarteams'));
    console.log('🔍 APP ROUTE DEBUG - Route should go to:', 
      location.includes('/imaginal-agility') ? 'imaginal-agility.tsx' : 
      location.includes('/allstarteams') ? 'allstarteams.tsx' : 
      'default routing'
    );
  }, [location]);

  return (
    <ErrorBoundary>
      {/* Use standard router */}
      <Router>
        <QueryClientProvider client={queryClient}>
          <ApplicationProvider>
            <DemoModeProvider>
              <div className="min-h-screen bg-background">
                <AutoSyncWrapper />
                <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
                  <Switch>
                    {/* Main routes */}
                    <Route path="/" component={LandingPage} />
                    <Route path="/dashboard" component={DashboardPage} />
                    <Route path="/testuser" component={TestUserPage} />

                    {/* Authentication routes */}
                    <Route path="/auth" component={AuthPage} />
                    <Route path="/auth/login" component={AuthPage} />
                    <Route path="/login" component={AuthPage} /> {/* Alias for backward compatibility */}
                    <Route path="/register/:inviteCode?" component={InviteRegistrationPage} />

                    {/* Workshop routes */}
                    <Route path="/allstarteams" component={AllStarTeamsPage} />
                    <Route path="/ast" component={AllStarTeamsPage} />
                    <Route path="/imaginal-agility" component={ImaginalAgilityPage} />
                    <Route path="/ia-legacy" component={ImaginalAgilityPage} />

                    {/* Admin routes */}
                    <Route path="/admin" component={AdminDashboard} />
                    <Route path="/admin/dashboard" component={AdminDashboard} />

                    {/* Reset and test routes */}
                    <Route path="/workshop-reset-test" component={WorkshopResetTestPage} />
                    <Route path="/reset-test" component={React.lazy(() => import('@/pages/reset-test'))} />

                    {/* Fallback route */}
                    <Route component={NotFoundPage} />
                  </Switch>
                </Suspense>
                <Toaster />
              </div>
            </DemoModeProvider>
          </ApplicationProvider>
        </QueryClientProvider>
      </Router>
    </ErrorBoundary>
  );
};

export default App;