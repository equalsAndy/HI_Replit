import React from 'react';
import { Route, Switch } from 'wouter';
import { Toaster } from '@/components/ui/toaster';
import InviteRegistrationPage from '@/pages/invite-registration';
import AuthPage from '@/pages/auth-page';
import DashboardPage from '@/pages/dashboard';
import NotFoundPage from '@/pages/not-found';
import UserHomePage from '@/pages/user-home';
import WorkshopPage from '@/pages/workshop';
import AdminPage from '@/pages/admin';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-background">
        <Switch>
          <Route path="/" component={UserHomePage} />
          <Route path="/login" component={AuthPage} />
          <Route path="/register/:inviteCode?" component={InviteRegistrationPage} />
          <Route path="/dashboard" component={DashboardPage} />
          <Route path="/workshop/:id" component={WorkshopPage} />
          <Route path="/admin" component={AdminPage} />
          <Route component={NotFoundPage} />
        </Switch>
        <Toaster />
      </div>
    </QueryClientProvider>
  );
};

export default App;