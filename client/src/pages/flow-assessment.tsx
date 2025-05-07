import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import MainContainer from "@/components/layout/MainContainer";

export default function FlowAssessment() {
  // Get user profile
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['/api/user/profile'],
    staleTime: Infinity,
  });
  
  // Use state for form values
  const [formValues, setFormValues] = useState({
    mostEngagedActivities: "",
    timeOfDayForFlow: "",
    physicalAndMentalFeelings: "",
    potentialFlowActivities: "",
    flowConditionsAtWork: ""
  });
  
  const handleInputChange = (field: string, value: string) => {
    setFormValues(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Flow assessment submitted:", formValues);
    // In a real app, this would save the data to the server
  };
  
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
        <h1 className="text-2xl font-bold text-gray-800">Identify Your Flow</h1>
      </div>
      
      <div className="mb-4">
        <p className="text-gray-700">
          <span className="font-medium">Purpose:</span> This exercise is designed to help you easily understand what "flow" is and recognize when you are in it, personally and professionally.
        </p>
        <p className="text-gray-700 mt-2">
          <span className="font-medium">Definition:</span> Flow happens when you're completely absorbed in a task that is challenging but within your ability to handle. It's the sweet spot where you feel your best, time seems to fly, and you're at your most productive. Athletes, artists, and top performers often talk about being "in the zone"— that's flow.
        </p>
      </div>
      
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-1/2">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-6">
              <div>
                <label className="block font-medium text-gray-700 mb-2">
                  Where do you find flow? Think about activities where you feel most engaged, energized, and lose track of time. This could be at work, during a hobby, sport, meditation, or in a simple task at home.
                </label>
                <Textarea 
                  value={formValues.mostEngagedActivities}
                  onChange={(e) => handleInputChange('mostEngagedActivities', e.target.value)}
                  placeholder="Your answer"
                  className="w-full min-h-[100px] border border-gray-300"
                />
              </div>
              
              <div>
                <label className="block font-medium text-gray-700 mb-2">
                  When do you find flow? Are there specific times of day when you find yourself more likely to experience flow?
                </label>
                <Textarea 
                  value={formValues.timeOfDayForFlow}
                  onChange={(e) => handleInputChange('timeOfDayForFlow', e.target.value)}
                  placeholder="Your answer"
                  className="w-full min-h-[100px] border border-gray-300"
                />
              </div>
              
              <div>
                <label className="block font-medium text-gray-700 mb-2">
                  How do you know when you're in flow? Reflect on how you feel physically and mentally when you're in this state.
                </label>
                <Textarea 
                  value={formValues.physicalAndMentalFeelings}
                  onChange={(e) => handleInputChange('physicalAndMentalFeelings', e.target.value)}
                  placeholder="Your answer"
                  className="w-full min-h-[100px] border border-gray-300"
                />
              </div>
              
              <div>
                <label className="block font-medium text-gray-700 mb-2">
                  If you've never felt flow, where do you think you could find it?
                </label>
                <Textarea 
                  value={formValues.potentialFlowActivities}
                  onChange={(e) => handleInputChange('potentialFlowActivities', e.target.value)}
                  placeholder="Your answer"
                  className="w-full min-h-[100px] border border-gray-300"
                />
              </div>
              
              <div>
                <label className="block font-medium text-gray-700 mb-2">
                  How can you create the right conditions for flow at work?
                </label>
                <Textarea 
                  value={formValues.flowConditionsAtWork}
                  onChange={(e) => handleInputChange('flowConditionsAtWork', e.target.value)}
                  placeholder="Your answer"
                  className="w-full min-h-[100px] border border-gray-300"
                />
              </div>
            </div>
            
            <div className="flex space-x-3">
              <Link href="/foundations">
                <Button type="button" variant="outline" className="px-8">
                  Return
                </Button>
              </Link>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-8">
                Save
              </Button>
            </div>
          </form>
        </div>
        
        <div className="w-full md:w-1/2">
          <div className="aspect-video mb-6 relative">
            <iframe 
              className="w-full h-full"
              src="https://www.youtube.com/embed/dQw4w9WgXcQ" 
              title="Identify Your Flow" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen>
            </iframe>
          </div>
          
          <div className="text-center bg-blue-50 rounded-lg p-4 border border-blue-100 mb-6">
            <h3 className="uppercase font-bold text-lg mb-2 text-blue-700">Identify Your Flow</h3>
            <a href="https://drive.google.com" className="text-blue-600 hover:text-blue-800 text-sm" target="_blank" rel="noopener noreferrer">
              https://drive.google.com/link/to/video
            </a>
          </div>
          
          <div className="rounded-lg border border-gray-200 overflow-hidden">
            <img 
              src="https://via.placeholder.com/600x450/f8fafc/1e40af?text=FLOW+CHANNEL+CHART" 
              alt="Flow Channel Chart"
              className="w-full h-auto"
            />
            <div className="p-4 text-center bg-gray-50">
              <p className="text-sm text-gray-600">Flow occurs in the optimal channel between anxiety and boredom</p>
            </div>
          </div>
        </div>
      </div>
    </MainContainer>
  );
}