import { useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
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

// Import module pages
import CoreStrengths from "./pages/core-strengths";
import FlowAssessment from "./pages/flow-assessment";
import FindYourFlow from "./pages/find-your-flow";
import RoundingOut from "./pages/rounding-out";
import Foundations from "./pages/foundations";
import VisualizeYourself from "./pages/visualize-yourself";

// Import Imaginal Agility pages
import ImaginationAssessment from "./pages/imagination-assessment";
import FiveCsAssessment from "./pages/5cs-assessment";
import InsightsDashboard from "./pages/insights-dashboard";
import TeamWorkshop from "./pages/team-workshop";

// Import providers
import { DemoModeProvider } from "@/hooks/use-demo-mode";
import { ApplicationProvider } from "@/hooks/use-application";

// Import NavBar
import { NavBar } from "./components/layout/NavBar";

function Router() {
  const [, navigate] = useLocation();
  // Query user profile with proper error handling
  const { data: user, isLoading } = useQuery({ queryKey: ['/api/user/profile'] });

  useEffect(() => {
    if (!isLoading) {
      const path = window.location.pathname;
      // If not logged in, redirect to auth page
      if (!user && path !== '/auth' && path !== '/' && path !== '/logout') {
        navigate('/auth');
      }
      // If logged in and on auth page or root, go to user home
      if (user && (path === '/auth' || path === '/')) {
        navigate('/user-home');
      }
    }
  }, [user, isLoading, navigate]);

  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />
      <div className="flex-1">
        <Switch>
          <Route path="/" component={Landing} />
          <Route path="/auth" component={AuthPage} />
          <Route path="/user-home" component={UserHome} />
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
          <Route path="/foundations" component={Foundations} />
          <Route path="/assessment" component={Assessment} />
          <Route path="/report" component={Report} />
          <Route path="/core-strengths" component={CoreStrengths} />
          <Route path="/flow-assessment" component={FlowAssessment} />
          <Route path="/find-your-flow" component={FindYourFlow} />
          <Route path="/rounding-out" component={RoundingOut} />
          <Route path="/visualize-yourself" component={VisualizeYourself} />
          
          {/* Imaginal Agility Routes */}
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
