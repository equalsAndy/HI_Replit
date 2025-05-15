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
import { TestUserBanner } from "@/components/test-users/TestUserBanner";
import FindYourFlow from "./pages/find-your-flow";
import Foundations from "./pages/foundations";
import VisualizeYourself from "./pages/visualize-yourself";
import ImaginationAssessment from "./pages/imagination-assessment";
import FiveCsAssessment from "./pages/5cs-assessment";
import InsightsDashboard from "./pages/insights-dashboard";
import TeamWorkshop from "./pages/team-workshop";
import { DemoModeProvider } from "@/hooks/use-demo-mode";
import { ApplicationProvider } from "@/hooks/use-application";
import { NavBar } from "./components/layout/NavBar";

function Router() {
  const [location, navigate] = useLocation();
  const { data: user, isLoading } = useQuery<{
    id: number;
    name: string;
    username: string;
    title?: string;
    organization?: string;
    progress?: number;
  }>({ queryKey: ['/api/user/profile'] });

  return (
    <div className="flex flex-col min-h-screen">
      {user && location !== '/' && location !== '/auth' && (
        <TestUserBanner userId={user.id} userName={user.name} />
      )}
      <NavBar />
      <div className="flex-1">
        <Switch>
          <Route path="/" component={Landing} />
          <Route path="/auth" component={AuthPage} />
          <Route path="/user-home" component={UserHome} />
          <Route path="/foundations" component={Foundations} />
          <Route path="/assessment" component={Assessment} />
          <Route path="/report" component={Report} />
          <Route path="/find-your-flow" component={FindYourFlow} />
          <Route path="/visualize-yourself" component={VisualizeYourself} />
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

export default function App() {
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