import React, { Suspense, useState, useEffect } from 'react';
import { Route, Switch, useLocation, Router } from 'wouter';
import { Toaster } from '@/components/ui/toaster';
import InviteRegistrationPage from '@/pages/invite-registration';
import BetaTesterPage from '@/pages/beta-tester';
import AuthPage from '@/pages/auth-page';
import LoginPage from '@/pages/auth/login';

import TestUserPage from '@/pages/testuser';
import NotFoundPage from '@/pages/not-found';
import LandingPage from '@/pages/landing';
import AllStarTeamsPage from '@/pages/allstarteams';
import ImaginalAgilityPage from '@/pages/imaginal-agility';
import ImaginalAgilityWorkshopNew from '@/pages/ImaginalAgilityWorkshopNew';
import BetaFeedbackSurveyPage from '@/pages/beta-feedback-survey';

import AdminDashboard from '@/pages/admin/dashboard-new';
import WorkshopResetTestPage from '@/pages/workshop-reset-test';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { ApplicationProvider } from '@/hooks/use-application';
import { DemoModeProvider } from '@/hooks/use-demo-mode';
import ErrorBoundary from '@/components/core/ErrorBoundary';
import AutoSync from '@/components/AutoSync';
import { FloatingAIProvider } from '@/components/ai/FloatingAIProvider';
import { ReportTaliaProvider } from '@/contexts/ReportTaliaContext';
import { useQuery } from '@tanstack/react-query';
import { ProtectedRoute } from '@/components/core/ProtectedRoute';
import { SessionManagerProvider } from '@/components/core/SessionManagerProvider';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useBetaWelcome } from '@/hooks/use-beta-welcome';
import { useBetaFeedbackReview } from '@/hooks/use-beta-feedback-review';
import { useBetaWorkshopCompletion } from '@/hooks/use-beta-workshop-completion';
import { ReportPromptModal } from '@/components/beta-testing/ReportPromptModal';
import BetaTesterWelcomeModal from '@/components/modals/BetaTesterWelcomeModal';
import { BetaTesterFAB } from '@/components/beta-testing/BetaTesterFAB';
import { BetaTesterReviewModal } from '@/components/beta-testing/BetaTesterReviewModal';
import { BetaTesterFeedbackModal } from '@/components/beta-testing/BetaTesterFeedbackModal';

// No need for a custom history hook, we'll use the default wouter behavior

// Component to conditionally render AutoSync with user data
const AutoSyncWrapper: React.FC = () => {
  const { data: user, isLoggedIn } = useCurrentUser();

  return isLoggedIn && user?.id ? <AutoSync userId={user.id} /> : null;
};

// Component to handle beta tester welcome modal
const BetaWelcomeWrapper: React.FC = () => {
  const { data: user } = useCurrentUser();
  
  console.log('🔍 BetaWelcomeWrapper render - User data:', {
    userId: user?.id,
    username: user?.username,
    isBetaTester: user?.isBetaTester,
    hasSeenBetaWelcome: user?.hasSeenBetaWelcome,
    role: user?.role
  });
  
  const {
    showWelcomeModal,
    handleCloseModal,
    handleDontShowAgain,
    handleStartWorkshop,
    triggerWelcomeModal,
  } = useBetaWelcome();

  console.log('🔍 BetaWelcomeWrapper - showWelcomeModal:', showWelcomeModal);

  // Make triggerWelcomeModal available globally for navbar
  React.useEffect(() => {
    (window as any).triggerBetaWelcomeModal = triggerWelcomeModal;
    return () => {
      delete (window as any).triggerBetaWelcomeModal;
    };
  }, [triggerWelcomeModal]);

  return (
    <BetaTesterWelcomeModal
      isOpen={showWelcomeModal}
      onClose={handleCloseModal}
      onDontShowAgain={handleDontShowAgain}
      onStartWorkshop={handleStartWorkshop}
      user={user}
    />
  );
};

// Component to handle beta tester feedback review modal
const BetaFeedbackReviewWrapper: React.FC = () => {
  const {
    showReviewModal,
    handleCloseReview,
    handleCompleteReview,
    workshopType
  } = useBetaFeedbackReview();

  return (
    <BetaTesterReviewModal
      isOpen={showReviewModal}
      onClose={handleCloseReview}
      onComplete={handleCompleteReview}
      workshopType={workshopType}
    />
  );
};

// Component to handle showing report prompt modal after workshop completion
const BetaReportPromptWrapper: React.FC = () => {
  const { data: user } = useCurrentUser();
  const [showReportPrompt, setShowReportPrompt] = useState(false);

  useEffect(() => {
    // Listen for workshopCompleted events
    const handleWorkshopCompleted = (event: CustomEvent) => {
      console.log('🎉 Workshop completed, showing report prompt modal');
      // Only show for beta testers and admins
      if (user?.isBetaTester || user?.role === 'admin') {
        setShowReportPrompt(true);
      }
    };

    window.addEventListener('workshopCompleted', handleWorkshopCompleted as EventListener);

    return () => {
      window.removeEventListener('workshopCompleted', handleWorkshopCompleted as EventListener);
    };
  }, [user]);

  if (!user?.isBetaTester && user?.role !== 'admin') return null;

  return (
    <ReportPromptModal
      isOpen={showReportPrompt}
      onClose={() => setShowReportPrompt(false)}
    />
  );
};

// Component to handle beta tester workshop completion feedback
const BetaCompletionFeedbackWrapper: React.FC = () => {
  const {
    isBetaTester,
    showFeedbackModal,
    closeFeedbackModal,
    submitFeedback
  } = useBetaWorkshopCompletion();

  if (!isBetaTester) return null;

  return (
    <BetaTesterFeedbackModal
      isOpen={showFeedbackModal}
      onClose={closeFeedbackModal}
      onSubmitFeedback={submitFeedback}
    />
  );
};

const App: React.FC = () => {
  const [location] = useLocation();

  // Debug current route
  React.useEffect(() => {
    console.log('Current route:', 
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
              <ReportTaliaProvider>
                <FloatingAIProvider>
                <SessionManagerProvider>
                  <div className="min-h-screen bg-background">
                    <AutoSyncWrapper />
                    <BetaWelcomeWrapper />
                    <BetaFeedbackReviewWrapper />
                    <BetaReportPromptWrapper />
                    <BetaCompletionFeedbackWrapper />
                    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
                    <Switch>
                    {/* Main routes */}
                    <Route path="/" component={LandingPage} />
                    
                    {/* User dashboard routes */}
                    <Route path="/dashboard">
                      <ProtectedRoute>
                        <TestUserPage />
                      </ProtectedRoute>
                    </Route>
                    <Route path="/testuser">
                      <ProtectedRoute>
                        <TestUserPage />
                      </ProtectedRoute>
                    </Route>

                    {/* Authentication routes */}
                    <Route path="/auth" component={AuthPage} />
                    <Route path="/auth/login" component={AuthPage} />
                    <Route path="/login" component={AuthPage} /> {/* Alias for backward compatibility */}
                    <Route path="/beta-tester" component={BetaTesterPage} />
                    <Route path="/beta-feedback-survey">
                      <ProtectedRoute>
                        <BetaFeedbackSurveyPage />
                      </ProtectedRoute>
                    </Route>
                    <Route path="/register/:inviteCode?" component={InviteRegistrationPage} />

                    {/* Workshop routes */}
                    <Route path="/allstarteams">
                      <ProtectedRoute>
                        <AllStarTeamsPage />
                      </ProtectedRoute>
                    </Route>
                    <Route path="/ast">
                      <ProtectedRoute>
                        <AllStarTeamsPage />
                      </ProtectedRoute>
                    </Route>
                    <Route path="/imaginal-agility">
                      <ProtectedRoute>
                        <ImaginalAgilityWorkshopNew />
                      </ProtectedRoute>
                    </Route>
                    <Route path="/ia-legacy">
                      <ProtectedRoute>
                        <ImaginalAgilityPage />
                      </ProtectedRoute>
                    </Route>

                    {/* Admin routes */}
                    <Route path="/admin">
                      <ProtectedRoute requireAdmin={true}>
                        <AdminDashboard />
                      </ProtectedRoute>
                    </Route>
                    <Route path="/admin/dashboard">
                      <ProtectedRoute requireAdmin={true}>
                        <AdminDashboard />
                      </ProtectedRoute>
                    </Route>

                    {/* Reset and test routes */}
                    <Route path="/workshop-reset-test" component={WorkshopResetTestPage} />
                    <Route path="/reset-test" component={React.lazy(() => import('@/pages/reset-test'))} />

                    {/* Fallback route */}
                    <Route component={NotFoundPage} />
                  </Switch>
                  </Suspense>
                  <BetaTesterFAB />
                  <Toaster />
                </div>
                </SessionManagerProvider>
                </FloatingAIProvider>
              </ReportTaliaProvider>
            </DemoModeProvider>
          </ApplicationProvider>
        </QueryClientProvider>
      </Router>
    </ErrorBoundary>
  );
};

export default App;