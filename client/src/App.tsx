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

// Import DemoModeProvider
import { DemoModeProvider } from "@/hooks/use-demo-mode";

// Import NavBar
import { NavBar } from "./components/layout/NavBar";

function Router() {
  const { data: user, isLoading } = useQuery({ queryKey: ['/api/user/profile'] });
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!isLoading) {
      const path = window.location.pathname;
      if (!user && path !== '/auth' && path !== '/' && path !== '/logout') {
        navigate('/auth');
      }
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
            const handleLogout = async () => {
              try {
                await apiRequest('POST', '/api/auth/logout');
                queryClient.invalidateQueries({ queryKey: ['/api/user/profile'] });
                window.location.href = '/auth';
              } catch (error) {
                console.error("Logout failed:", error);
                window.location.href = '/auth';
              }
            };
            
            // Execute logout immediately
            useEffect(() => {
              handleLogout();
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
          <Toaster />
          <Router />
        </DemoModeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
