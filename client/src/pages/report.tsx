import { useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import StarCard from "@/components/starcard/StarCard";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { QuadrantData, ProfileData } from "@shared/schema";

// Define quadrant colors
const QUADRANT_COLORS = {
  thinking: 'rgb(1, 162, 82)',    // Green
  acting: 'rgb(241, 64, 64)',     // Red
  feeling: 'rgb(22, 126, 253)',   // Blue
  planning: 'rgb(255, 203, 47)'   // Yellow
} as const;

// Helper function to map attribute names to their color
function getAttributeColor(attrName: string): string {
  // Default to primary colors by category
  const attrColorMap: { [key: string]: string } = {
    // Thinking quadrant attributes (green)
    'Analytical': 'rgb(1, 162, 82)',
    'Strategic': 'rgb(1, 162, 82)',
    'Thoughtful': 'rgb(1, 162, 82)',
    'Clever': 'rgb(1, 162, 82)',
    'Innovative': 'rgb(1, 162, 82)',
    'Investigative': 'rgb(1, 162, 82)',
    'Abstract': 'rgb(1, 162, 82)',
    'Analytic': 'rgb(1, 162, 82)',
    'Astute': 'rgb(1, 162, 82)',
    'Big Picture': 'rgb(1, 162, 82)',
    'Curious': 'rgb(1, 162, 82)',
    'Focussed': 'rgb(1, 162, 82)',
    'Insightful': 'rgb(1, 162, 82)',
    'Logical': 'rgb(1, 162, 82)',
    'Rational': 'rgb(1, 162, 82)',
    'Reflective': 'rgb(1, 162, 82)',
    'Sensible': 'rgb(1, 162, 82)',
    
    // Acting quadrant attributes (red)
    'Energetic': 'rgb(241, 64, 64)',
    'Bold': 'rgb(241, 64, 64)',
    'Decisive': 'rgb(241, 64, 64)',
    'Proactive': 'rgb(241, 64, 64)',
    'Persistent': 'rgb(241, 64, 64)',
    'Physical': 'rgb(241, 64, 64)',
    'Confident': 'rgb(241, 64, 64)',
    'Adaptable': 'rgb(241, 64, 64)',
    'Adventurous': 'rgb(241, 64, 64)',
    'Assertive': 'rgb(241, 64, 64)',
    'Brave': 'rgb(241, 64, 64)',
    'Capable': 'rgb(241, 64, 64)',
    'Challenging': 'rgb(241, 64, 64)',
    'Courageous': 'rgb(241, 64, 64)',
    'Dynamic': 'rgb(241, 64, 64)',
    'Fearless': 'rgb(241, 64, 64)',
    'Resolute': 'rgb(241, 64, 64)',
    'Resourceful': 'rgb(241, 64, 64)',
    'Strong': 'rgb(241, 64, 64)',
    
    // Feeling quadrant attributes (blue)
    'Empathetic': 'rgb(22, 126, 253)',
    'Friendly': 'rgb(22, 126, 253)',
    'Supportive': 'rgb(22, 126, 253)',
    'Compassionate': 'rgb(22, 126, 253)',
    'Intuitive': 'rgb(22, 126, 253)',
    'Empathic': 'rgb(22, 126, 253)',
    'Accepting': 'rgb(22, 126, 253)',
    'Authentic': 'rgb(22, 126, 253)',
    'Calm': 'rgb(22, 126, 253)',
    'Caring': 'rgb(22, 126, 253)',
    'Connected': 'rgb(22, 126, 253)',
    'Considerate': 'rgb(22, 126, 253)',
    'Diplomatic': 'rgb(22, 126, 253)',
    'Emotional': 'rgb(22, 126, 253)',
    'Generous': 'rgb(22, 126, 253)',
    'Gentle': 'rgb(22, 126, 253)',
    'Grateful': 'rgb(22, 126, 253)',
    'Harmonious': 'rgb(22, 126, 253)',
    'Helpful': 'rgb(22, 126, 253)',
    'Kind': 'rgb(22, 126, 253)',
    'Open': 'rgb(22, 126, 253)',
    'Sociable': 'rgb(22, 126, 253)',
    'Vulnerable': 'rgb(22, 126, 253)',
    
    // Planning quadrant attributes (yellow)
    'Organized': 'rgb(255, 203, 47)',
    'Meticulous': 'rgb(255, 203, 47)',
    'Reliable': 'rgb(255, 203, 47)',
    'Consistent': 'rgb(255, 203, 47)',
    'Practical': 'rgb(255, 203, 47)',
    'Careful': 'rgb(255, 203, 47)',
    'Controlled': 'rgb(255, 203, 47)',
    'Dependable': 'rgb(255, 203, 47)',
    'Detailed': 'rgb(255, 203, 47)',
    'Diligent': 'rgb(255, 203, 47)',
    'Methodical': 'rgb(255, 203, 47)',
    'Orderly': 'rgb(255, 203, 47)',
    'Precise': 'rgb(255, 203, 47)',
    'Punctual': 'rgb(255, 203, 47)', 
    'Responsible': 'rgb(255, 203, 47)',
    'Thorough': 'rgb(255, 203, 47)',
    'Trustworthy': 'rgb(255, 203, 47)',
  };
  
  return attrColorMap[attrName] || (
    attrName.toLowerCase().includes('thinking') ? QUADRANT_COLORS.thinking :
    attrName.toLowerCase().includes('acting') ? QUADRANT_COLORS.acting :
    attrName.toLowerCase().includes('feeling') ? QUADRANT_COLORS.feeling :
    attrName.toLowerCase().includes('planning') ? QUADRANT_COLORS.planning :
    'rgb(100, 100, 100)' // Default gray if not found
  );
}

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
    queryKey: ['/api/workshop-data/starcard'],
    enabled: !!user,
    staleTime: Infinity,
  });
  
  // Get flow attributes data
  const { data: flowAttributes } = useQuery<any[]>({
    queryKey: ['/api/flow-attributes'],
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
          
          <div className="aspect-video mb-6 bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <p className="text-xl text-gray-600 font-medium">Video Available</p>
              <p className="text-gray-500">Star Review Video</p>
            </div>
          </div>
        </div>
        
        <div className="flex justify-center items-start">
          <StarCard 
            profile={{
              name: user?.name || "",
              title: user?.title || "",
              organization: user?.organization || ""
            }}
            quadrantData={{
              thinking: starCard?.thinking || 0,
              acting: starCard?.acting || 0,
              feeling: starCard?.feeling || 0,
              planning: starCard?.planning || 0
            }}
            imageUrl={starCard?.imageUrl}
            downloadable={true}
            pending={starCard?.state === 'empty'}
            flowAttributes={flowAttributes ? [
              // Convert flow attributes data into the format expected by StarCard
              // Map position 0 attributes (for the top right flow box)
              ...flowAttributes.filter(attr => attr.position === 0).map(attr => ({
                text: attr.text,
                color: getAttributeColor(attr.text)
              })),
              // Map position 1 attributes (for the bottom right flow box)
              ...flowAttributes.filter(attr => attr.position === 1).map(attr => ({
                text: attr.text,
                color: getAttributeColor(attr.text)
              })),
              // Map position 2 attributes (for the bottom left flow box)
              ...flowAttributes.filter(attr => attr.position === 2).map(attr => ({
                text: attr.text,
                color: getAttributeColor(attr.text)
              })),
              // Map position 3 attributes (for the top left flow box)
              ...flowAttributes.filter(attr => attr.position === 3).map(attr => ({
                text: attr.text,
                color: getAttributeColor(attr.text)
              }))
            ] : []}
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
