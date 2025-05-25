import React from 'react';
import { Route, Switch, Router } from 'wouter';
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
import ErrorBoundary from '@/components/core/ErrorBoundary';

// Create a custom history object that safely handles browser navigation
const useHashLocation = () => {
  const [loc, setLoc] = React.useState(window.location.pathname);
  
  React.useEffect(() => {
    // Handle navigation events (back/forward)
    const handleNavigation = () => {
      setLoc(window.location.pathname);
    };

    // Listen for navigation events
    window.addEventListener('popstate', handleNavigation);
    
    // Clean up event listeners
    return () => {
      window.removeEventListener('popstate', handleNavigation);
    };
  }, []);
  
  // Return location and a navigation function
  return [
    loc,
    (to: string) => {
      window.history.pushState(null, '', to);
      setLoc(to);
    }
  ];
};

const App: React.FC = () => {
  // Use error boundary to catch any rendering or navigation errors
  return (
    <ErrorBoundary>
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
    </ErrorBoundary>
  );
};

export default App;