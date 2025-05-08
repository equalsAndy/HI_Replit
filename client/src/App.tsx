import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
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

// Import ProtectedRoute
import { ProtectedRoute } from "./lib/protected-route";

function Router() {
  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />
      <div className="flex-1">
        <Switch>
          <Route path="/" component={Landing} />
          <Route path="/auth" component={AuthPage} />
          <Route path="/user-home" component={UserHome} />
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
