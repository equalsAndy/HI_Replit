import React from 'react';
import { Route, Switch } from 'wouter';
import { Toaster } from '@/components/ui/toaster';
import InviteRegistrationPage from '@/pages/invite-registration';
import AuthPage from '@/pages/auth-page';
import LoginPage from '@/pages/auth/login';
import DashboardPage from '@/pages/dashboard';
import NotFoundPage from '@/pages/not-found';
import HomePage from '@/pages/home';
import WorkshopPage from '@/pages/workshop';
import AdminPage from '@/pages/admin';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-background">
        <Switch>
          {/* Main routes */}
          <Route path="/" component={HomePage} />
          <Route path="/dashboard" component={DashboardPage} />
          
          {/* Authentication routes */}
          <Route path="/auth/login" component={LoginPage} />
          <Route path="/login" component={LoginPage} /> {/* Alias for backward compatibility */}
          <Route path="/register/:inviteCode?" component={InviteRegistrationPage} />
          
          {/* Workshop routes */}
          <Route path="/workshop/allstarteams" component={WorkshopPage} />
          <Route path="/workshop/imaginalagility" component={WorkshopPage} />
          <Route path="/workshop/:id" component={WorkshopPage} />
          
          {/* Admin routes */}
          <Route path="/admin" component={AdminPage} />
          
          {/* Fallback route */}
          <Route component={NotFoundPage} />
        </Switch>
        <Toaster />
      </div>
    </QueryClientProvider>
  );
};

export default App;