import { useQuery } from "@tanstack/react-query";
import MainContainer, { LeftPanel, RightPanel } from "@/components/layout/MainContainer";
import ProgressBar from "@/components/ui/progress-bar";
import StepList from "@/components/steps/StepList";
import StarCard from "@/components/starcard/StarCard";

export default function Home() {
  // Fetch user profile
  const { data: user, isLoading: loadingUser } = useQuery({
    queryKey: ['/api/user/profile'],
    staleTime: Infinity,
    refetchInterval: 60000 // Refetch every minute to keep progress updated
  });

  // Fetch star card data if we have a user
  const { data: starCard, isLoading: loadingStarCard } = useQuery({
    queryKey: ['/api/starcard'],
    enabled: !!user,
    staleTime: Infinity
  });

  // Default empty star card data
  const defaultQuadrantData = {
    thinking: 0,
    acting: 0,
    feeling: 0,
    planning: 0,
    apexStrength: "Imagination"
  };

  // Default profile data
  const defaultProfileData = {
    name: user?.name || "User",
    title: user?.title || "Title",
    organization: user?.organization || "Organization",
    avatarUrl: user?.avatarUrl
  };

  return (
    <MainContainer>
      <LeftPanel>
        <h1 className="text-primary text-2xl font-bold">Hi, {user?.name || "User"}!</h1>
        <p className="text-neutral-700 mb-6">Use these steps to track progress.</p>
        
        <div className="mb-8">
          <ProgressBar progress={user?.progress || 0} />
        </div>
        
        <StepList />
      </LeftPanel>
      
      <RightPanel>
        <h2 className="text-primary text-xl font-bold mb-2">Your Star Card</h2>
        <p className="text-neutral-700 mb-6">Complete the activities on this page to build your Star Card. Once you've finished, download your Star Card for use in the whiteboard activities.</p>
        
        {loadingStarCard ? (
          <div className="p-8 text-center">Loading your Star Card...</div>
        ) : (
          <StarCard 
            profile={defaultProfileData} 
            quadrantData={starCard || defaultQuadrantData} 
          />
        )}
      </RightPanel>
    </MainContainer>
  );
}
