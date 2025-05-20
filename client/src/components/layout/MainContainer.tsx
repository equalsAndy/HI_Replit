import { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import StepNavigation from "./StepNavigation";
import Header from "./Header";
import { Navigation } from "@/components/navigation/Navigation";
import { useNavigationProgress } from "@/hooks/use-navigation-progress";

interface MainContainerProps {
  children: ReactNode;
  stepId?: string;
  showStepNavigation?: boolean;
  showHeader?: boolean;
  className?: string;
  useModernNavigation?: boolean;
}

// Define our learning path steps (legacy navigation)
const steps = [
  { id: "A", label: "Reflect On Your Strengths", path: "/core-strengths" },
  { id: "B", label: "Identify Your Flow", path: "/flow-assessment" },
  { id: "C", label: "Rounding Out", path: "/rounding-out" },
  { id: "D", label: "Complete Your Star Card", path: "/report" }
];

export default function MainContainer({ 
  children, 
  stepId, 
  showStepNavigation = true,
  showHeader = true,
  className = "",
  useModernNavigation = true
}: MainContainerProps) {
  const [location] = useLocation();
  
  // Get user profile
  const { data: user } = useQuery({
    queryKey: ['/api/user/profile'],
    staleTime: Infinity,
  });
  
  // If using modern navigation, use the new Navigation component
  if (useModernNavigation) {
    return (
      <Navigation currentStepId={stepId}>
        <div className={className}>
          {children}
        </div>
      </Navigation>
    );
  }
  
  // Otherwise, use the legacy navigation
  return (
    <div className="flex flex-col min-h-screen">
      {showHeader && <Header />}
      
      <main className={`flex-1 ${className}`}>
        {showStepNavigation && stepId && (
          <div className="bg-gray-50 border-b border-gray-200">
            <div className="container mx-auto px-4">
              <StepNavigation steps={steps} currentStepId={stepId} />
            </div>
          </div>
        )}
        
        <div className="container mx-auto px-4 py-6">
          {children}
        </div>
      </main>
    </div>
  );
}

// Left panel component for two-column layouts
interface PanelProps {
  children: ReactNode;
  className?: string;
}

export function LeftPanel({ children, className = "" }: PanelProps) {
  return (
    <div className={`w-full md:w-1/2 ${className}`}>
      {children}
    </div>
  );
}

// Right panel component for two-column layouts
export function RightPanel({ children, className = "" }: PanelProps) {
  return (
    <div className={`w-full md:w-1/2 ${className}`}>
      {children}
    </div>
  );
}