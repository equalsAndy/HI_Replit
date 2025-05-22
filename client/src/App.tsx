import React, { useEffect, Suspense, lazy } from "react";
import { Switch, Route, useLocation } from "wouter";
import UserHome2 from "./pages/user-home2";
import AllStarTeams from "./pages/allstarteams";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import AuthPage from "@/pages/auth-page";
import Assessment from "@/pages/assessment";
import Report from "@/pages/report";
import UserHome from "@/pages/user-home";
import { TestUserBanner } from "@/components/test-users/TestUserBanner";
import { Button } from "@/components/ui/button";

// Import module pages
import FindYourFlow from "./pages/find-your-flow";
import Foundations from "./pages/foundations";
import VisualizeYourself from "./pages/visualize-yourself";
import NavigationDemo from "./pages/navigation-demo";
import LearningOverview from "./pages/learning-overview";

// Import Imaginal Agility pages
import ImaginationAssessment from "./pages/imagination-assessment";
import FiveCsAssessment from "./pages/5cs-assessment";
import InsightsDashboard from "./pages/insights-dashboard";
import TeamWorkshop from "./pages/team-workshop";

// Lazy-loaded components
const ImaginalAgilityPage = lazy(() => import("./pages/imaginal-agility"));

// Import providers
import { DemoModeProvider } from "@/hooks/use-demo-mode";
import { ApplicationProvider } from "@/hooks/use-application";

// Import NavBar
import { NavBar } from "./components/layout/NavBar";

function Router() {
  const [, navigate] = useLocation();
  // Query user profile with proper error handling
  const { data: user, isLoading } = useQuery<{
    id: number;
    name: string;
    username: string;
    title?: string;
    organization?: string;
    progress?: number;
  }>({ queryKey: ['/api/user/profile'] });

  useEffect(() => {
    if (!isLoading) {
      const path = window.location.pathname;
      // If not logged in and not on allowed public pages, redirect to auth
      if (!user && path !== '/auth' && path !== '/' && path !== '/logout') {
        navigate('/auth');
      }
      // If logged in and on auth page, go to user home
      if (user && path === '/auth') {
        navigate('/user-home');
      }
    }
  }, [user, isLoading, navigate]);

  // Show the test user banner when logged in 
  // and not on public pages (landing or auth)
  const showTestBanner = user && 
    window.location.pathname !== '/' && 
    window.location.pathname !== '/auth';

  return (
    <div className="flex flex-col min-h-screen">
      {/* Only show banner when user data is available and properly typed */}
      {showTestBanner && user?.id && user?.name && (
        <TestUserBanner 
          userId={user.id} 
          userName={user.name} 
        />
      )}
      <NavBar />
      {/* Removed floating button */}
      <div className="flex-1">
        <Switch>
          <Route path="/" component={Landing} />
          <Route path="/auth" component={AuthPage} />
          <Route path="/user-home" component={UserHome} />
          <Route path="/user-home2" component={UserHome2} />
          <Route path="/allstarteams" component={AllStarTeams} />
          <Route path="/user-home2-refactored" component={() => {
            const appType = localStorage.getItem('selectedApp');
            if (appType === 'imaginal-agility') {
              useEffect(() => {
                navigate('/imaginal-agility');
              }, []);
              return <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                  <h2 className="text-xl mb-4">Loading Imaginal Agility Workshop...</h2>
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900 mx-auto"></div>
                </div>
              </div>;
            }
            // Redirect to allstarteams instead
            useEffect(() => {
              navigate('/allstarteams');
            }, []);
            return null;
          }} />
          <Route path="/logout" component={() => {
            // Simplified logout page
            useEffect(() => {
              const logout = async () => {
                try {
                  // Make a fetch request directly instead of using apiRequest
                  await fetch('/api/auth/logout', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                  });
                } catch (error) {
                  console.error("Logout failed:", error);
                } finally {
                  // Always redirect to auth page
                  window.location.href = '/auth';
                }
              };

              logout();
            }, []);

            return <div className="flex items-center justify-center min-h-screen">
              <div className="text-center">
                <h2 className="text-xl mb-4">Logging out...</h2>
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900 mx-auto"></div>
              </div>
            </div>;
          }} />
          {/* Main learning routes - redirect for now until we have all pages */}
          <Route path="/intro/video">
            <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading video...</div>}>
              {React.createElement(lazy(() => import('./pages/intro/video')))}
            </Suspense>
          </Route>
          <Route path="/discover-strengths/intro" component={() => {
            useEffect(() => {
              navigate('/navigation-demo');
            }, []);
            return <div>Loading...</div>;
          }} />

          {/* Existing routes */}
          <Route path="/foundations" component={Foundations} />
          <Route path="/assessment" component={Assessment} />
          <Route path="/report" component={Report} />
          <Route path="/find-your-flow" component={FindYourFlow} />
          <Route path="/visualize-yourself" component={VisualizeYourself} />
          <Route path="/navigation-demo" component={NavigationDemo} />
          <Route path="/learning-overview" component={LearningOverview} />
          <Route path="/user-home2" component={() => {
            return <UserHome2 />;
          }} />

          {/* Imaginal Agility Routes */}
          <Route path="/imaginal-agility">
            <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading Imaginal Agility...</div>}>
              <ImaginalAgilityPage />
            </Suspense>
          </Route>
          <Route path="/imagination-assessment" component={ImaginationAssessment} />
          <Route path="/5cs-assessment" component={FiveCsAssessment} />
          <Route path="/insights-dashboard" component={InsightsDashboard} />
          <Route path="/team-workshop" component={TeamWorkshop} />
          <Route component={NotFound} />
        </Switch>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <DemoModeProvider>
          <ApplicationProvider>
            <Toaster />
            <Router />
          </ApplicationProvider>
        </DemoModeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;