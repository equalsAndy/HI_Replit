import React from 'react';
import { Route, Switch } from 'wouter';
import { Toaster } from '@/components/ui/toaster';
import InviteRegistrationPage from '@/pages/invite-registration';
import AuthPage from '@/pages/auth-page';
import LoginPage from '@/pages/auth/login';
import DashboardPage from '@/pages/dashboard';
import NotFoundPage from '@/pages/not-found';
import LandingPage from '@/pages/landing';
import AllStarTeamsPage from '@/pages/allstarteams';
import ImaginalAgilityPage from '@/pages/imaginal-agility';
import AdminPage from '@/pages/admin';
import WorkshopResetTestPage from '@/pages/workshop-reset-test';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { ApplicationProvider } from '@/hooks/use-application';
import { DemoModeProvider } from '@/hooks/use-demo-mode';

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ApplicationProvider>
        <DemoModeProvider>
          <div className="min-h-screen bg-background">
            <Switch>
              {/* Main routes */}
              <Route path="/" component={LandingPage} />
              <Route path="/dashboard" component={DashboardPage} />
              
              {/* Authentication routes */}
              <Route path="/auth" component={AuthPage} />
              <Route path="/auth/login" component={AuthPage} />
              <Route path="/login" component={AuthPage} /> {/* Alias for backward compatibility */}
              <Route path="/register/:inviteCode?" component={InviteRegistrationPage} />
              
              {/* Workshop routes */}
              <Route path="/allstarteams" component={AllStarTeamsPage} />
              <Route path="/imaginal-agility" component={ImaginalAgilityPage} />
              
              {/* Admin routes */}
              <Route path="/admin" component={AdminPage} />
              
              {/* Reset and test routes */}
              <Route path="/workshop-reset-test" component={WorkshopResetTestPage} />
              
              {/* Fallback route */}
              <Route component={NotFoundPage} />
            </Switch>
            <Toaster />
          </div>
        </DemoModeProvider>
      </ApplicationProvider>
    </QueryClientProvider>
  );
};

export default App;