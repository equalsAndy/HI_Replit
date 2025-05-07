import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Assessment from "@/pages/assessment";
import Report from "@/pages/report";
import AppHeader from "@/components/layout/AppHeader";

// Import pages
import CoreStrengths from "./pages/core-strengths";
import FlowAssessment from "./pages/flow-assessment";
import RoundingOut from "./pages/rounding-out";
import Foundations from "./pages/foundations";

function Router() {
  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/foundations" component={Foundations} />
        <Route path="/assessment" component={Assessment} />
        <Route path="/report" component={Report} />
        <Route path="/core-strengths" component={CoreStrengths} />
        <Route path="/flow-assessment" component={FlowAssessment} />
        <Route path="/rounding-out" component={RoundingOut} />
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
