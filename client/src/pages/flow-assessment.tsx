import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import MainContainer from "@/components/layout/MainContainer";
import FlowAssessmentSimple from "@/components/flow/FlowAssessmentSimple";

export default function FlowAssessmentPage() {
  // Get user profile
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['/api/user/profile'],
    staleTime: Infinity,
  });
  
  // Show loading state
  if (userLoading) {
    return (
      <MainContainer stepId="B" className="bg-white">
        <div className="text-center">
          <p className="text-lg">Loading your profile information...</p>
        </div>
      </MainContainer>
    );
  }
  
  return (
    <MainContainer stepId="B" className="bg-white">
      <div className="flex items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Your Flow State Self-Assessment</h1>
      </div>
      
      <div className="mb-4">
        <p className="text-gray-700">
          <span className="font-medium">Purpose:</span> This exercise is designed to help you easily understand what "flow" is and recognize when you are in it, personally and professionally.
        </p>
        <p className="text-gray-700 mt-2">
          <span className="font-medium">Instructions:</span> Rate your agreement with each of the following statements on a scale from 1 (Never) to 5 (Always). Answer with a specific activity or task in mind where you most often seek or experience flow.
        </p>
      </div>
      
      <div className="flex flex-col gap-6">
        <FlowAssessmentSimple />
        
        <div className="flex space-x-3 mt-6">
          <Link href="/user-home">
            <Button type="button" variant="outline" className="px-8">
              Return to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </MainContainer>
  );
}