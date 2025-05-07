import { useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import StarCard from "@/components/starcard/StarCard";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Report() {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  
  // Get user profile
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['/api/user/profile'],
    staleTime: Infinity,
  });
  
  // Get star card data
  const { data: starCard, isLoading: starCardLoading } = useQuery({
    queryKey: ['/api/starcard'],
    enabled: !!user,
    staleTime: Infinity,
  });
  
  // Mark report as reviewed
  const markReviewed = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/starcard/reviewed', {});
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Report reviewed",
        description: "Your progress has been updated.",
        variant: "default",
      });
      navigate('/');
    },
    onError: (error) => {
      toast({
        title: "Failed to update progress",
        description: String(error),
        variant: "destructive",
      });
    }
  });
  
  // Check if user has completed assessment
  useEffect(() => {
    if (user && user.progress < 67) {
      toast({
        title: "Assessment not completed",
        description: "Please complete the assessment first.",
        variant: "destructive",
      });
      navigate('/');
    }
  }, [user, navigate, toast]);
  
  // Automatically mark as reviewed when the page loads
  useEffect(() => {
    if (user && starCard && user.progress < 100) {
      markReviewed.mutate();
    }
  }, [user, starCard]);
  
  // Handle return to dashboard
  const handleReturnToDashboard = () => {
    navigate('/');
  };
  
  // Show loading state
  if (userLoading || starCardLoading) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center p-8">
              <p className="text-lg">Loading your Star Report...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Ensure we have star card data
  if (!starCard) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center p-8">
              <p className="text-lg text-red-500">No star card data found. Please complete the assessment first.</p>
              <Button 
                onClick={handleReturnToDashboard}
                className="mt-4"
              >
                Return to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Default profile data
  const profileData = {
    name: user?.name || "User",
    title: user?.title || "Title",
    organization: user?.organization || "Organization",
    avatarUrl: user?.avatarUrl
  };
  
  return (
    <div className="container mx-auto py-10 max-w-4xl">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Your Star Report</h1>
        <Button onClick={handleReturnToDashboard}>
          Return to Dashboard
        </Button>
      </div>
      
      <Card>
        <CardContent className="pt-6">
          <div className="mb-6">
            <p className="text-lg mb-4">
              This is your personal Star Report based on your assessment responses. Your apex strength is <strong>{starCard.apexStrength}</strong>.
            </p>
            
            <StarCard 
              profile={profileData}
              quadrantData={starCard}
              downloadable={true}
            />
            
            <div className="mt-8">
              <h2 className="text-xl font-bold mb-2">Understanding Your Quadrants</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div className="border border-neutral-200 rounded-lg p-4">
                  <h3 className="font-bold text-chart-1 mb-2">Thinking ({starCard.thinking}%)</h3>
                  <p>The Thinking quadrant represents your analytical and conceptual abilities. You use logic, reason, and abstract thinking to understand complex situations.</p>
                </div>
                
                <div className="border border-neutral-200 rounded-lg p-4">
                  <h3 className="font-bold text-chart-2 mb-2">Acting ({starCard.acting}%)</h3>
                  <p>The Acting quadrant represents your preference for taking action, being decisive, and making things happen. You are results-oriented and practical.</p>
                </div>
                
                <div className="border border-neutral-200 rounded-lg p-4">
                  <h3 className="font-bold text-chart-3 mb-2">Feeling ({starCard.feeling}%)</h3>
                  <p>The Feeling quadrant represents your emotional intelligence and social awareness. You are attuned to people's needs and value collaboration.</p>
                </div>
                
                <div className="border border-neutral-200 rounded-lg p-4">
                  <h3 className="font-bold text-chart-4 mb-2">Planning ({starCard.planning}%)</h3>
                  <p>The Planning quadrant represents your organizational skills and preference for structure. You like to plan ahead and create systems and processes.</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
