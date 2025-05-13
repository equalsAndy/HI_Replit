import { useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
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
      <div className="container mx-auto py-8 max-w-4xl">
        <div className="text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-gray-800 mb-8">Your Star Profile + Star Card</h1>
          <p className="text-lg">Loading your profile information...</p>
        </div>
      </div>
    );
  }
  
  // Ensure we have star card data
  if (!starCard) {
    return (
      <div className="container mx-auto py-8 max-w-4xl">
        <div className="text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-gray-800 mb-8">Your Star Profile + Star Card</h1>
          <p className="text-lg text-red-500 mb-4">No star card data found. Please complete the assessment first.</p>
          <Button onClick={handleReturnToDashboard}>
            Return to Dashboard
          </Button>
        </div>
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
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-5xl font-bold text-gray-800 mb-8">Your Star Profile + Star Card</h1>
      </div>
      
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div>
          <div className="text-left mb-6">
            <p className="mb-4">
              Your Star Profile captures your current strengths and
              growth edge. It's not a fixed label — it's a reflection of
              where you are now in your development journey.
            </p>
            
            <p className="mb-4">This exercise invites you to:</p>
            
            <ul className="list-disc pl-5 mb-4 space-y-2">
              <li>Reflect on your apex strength and how it shows up</li>
              <li>Consider how your profile shifts over time and in different roles</li>
              <li>Use your Star Card as a personal development compass</li>
            </ul>
            
            <p className="mb-4">Watch the short video, then explore your profile with fresh eyes.</p>
          </div>
          
          <div className="aspect-video mb-6">
            <iframe 
              className="w-full h-full"
              src="https://www.youtube.com/embed/dQw4w9WgXcQ" 
              title="Star Review Video" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen>
            </iframe>
          </div>
        </div>
        
        <div className="flex justify-center items-start">
          <StarCard 
            profile={profileData}
            quadrantData={starCard}
            downloadable={true}
            pending={starCard?.pending === true}
          />
        </div>
      </div>
      
      <div className="text-center mt-8">
        <Link href="/core-strengths">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded">
            NEXT
          </Button>
        </Link>
      </div>
    </div>
  );
}
