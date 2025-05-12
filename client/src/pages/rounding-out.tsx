import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import MainContainer from "@/components/layout/MainContainer";

export default function RoundingOut() {
  // Get user profile
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['/api/user/profile'],
    staleTime: Infinity,
  });
  
  // Form state
  const [formValues, setFormValues] = useState({
    stressTriggers: "",
    strengthsAttention: "",
    flowStrategies: ""
  });
  
  const handleInputChange = (field: string, value: string) => {
    setFormValues(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Rounding Out reflection submitted:", formValues);
    // Save the data then navigate to star card completion
    navigate('/visualize-yourself');
  };
  
  // Show loading state
  if (userLoading) {
    return (
      <MainContainer stepId="C" className="bg-white">
        <div className="text-center">
          <p className="text-lg">Loading your profile information...</p>
        </div>
      </MainContainer>
    );
  }
  
  return (
    <MainContainer stepId="C" className="bg-white">
      <div className="flex items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Rounding Out</h1>
      </div>
      
      <div className="mb-4">
        <p className="text-gray-700 uppercase font-bold text-sm mb-1">PURPOSE</p>
        <p className="text-gray-700">
          This exercise asks you to consider what areas need extra attention to achieve your envisioned professional growth.
        </p>
        
        <p className="text-gray-700 uppercase font-bold text-sm mt-4 mb-1">DIRECTIONS</p>
        <p className="text-gray-700">
          Answer the following question in the space below: Given the strengths you draw on in your daily work, when coping with stress, and when in flow, 
          what particular strengths and attributes may need special attention moving ahead to achieve your goals? <span className="font-medium">The Stress Inducers and Possible 
          Behaviors Under Stress</span> in your Star Report may help answer this question.
        </p>
        
        <p className="text-gray-700 mt-4 font-medium">EXAMPLE</p>
        <p className="text-gray-700 text-sm">
          To lead cross-functional teams more effectively, you plan to improve your empathy and active listening by taking a course on advanced
          communication techniques and volunteering in the community soup kitchen.
        </p>
      </div>
      
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-1/2">
          <div className="aspect-video mb-6">
            <iframe 
              className="w-full h-full"
              src="https://www.youtube.com/embed/dQw4w9WgXcQ" 
              title="Rounding Out" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen>
            </iframe>
          </div>
        </div>
        
        <div className="w-full md:w-1/2">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <div className="cloud-bubble rounded-[40px] p-6 bg-white border border-gray-200 shadow-sm relative">
                <div className="absolute -top-4 -left-4 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <p className="text-indigo-800 font-medium mb-2 text-center">
                  When can I expect to have stress, anxiety, or boredom triggered, and what can I do to mitigate it?
                </p>
                <Textarea 
                  value={formValues.stressTriggers}
                  onChange={(e) => handleInputChange('stressTriggers', e.target.value)}
                  placeholder="Type your paragraph..."
                  className="w-full min-h-[100px] border border-gray-300 mt-2"
                />
              </div>
            </div>
            
            <div className="relative mt-12">
              <div className="cloud-bubble rounded-[40px] p-6 bg-white border border-gray-200 shadow-sm relative">
                <div className="absolute -top-4 -left-4 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <p className="text-indigo-800 font-medium mb-2 text-center">
                  What strengths and attributes need special attention moving forward?
                </p>
                <Textarea 
                  value={formValues.strengthsAttention}
                  onChange={(e) => handleInputChange('strengthsAttention', e.target.value)}
                  placeholder="Type your paragraph..."
                  className="w-full min-h-[100px] border border-gray-300 mt-2"
                />
              </div>
            </div>
            
            <div className="relative mt-12">
              <div className="cloud-bubble rounded-[40px] p-6 bg-white border border-gray-200 shadow-sm relative">
                <div className="absolute -top-4 -left-4 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <p className="text-indigo-800 font-medium mb-2 text-center">
                  How can I use my strengths to overcome my constraints and help me achieve more flow?
                </p>
                <Textarea 
                  value={formValues.flowStrategies}
                  onChange={(e) => handleInputChange('flowStrategies', e.target.value)}
                  placeholder="Type your paragraph..."
                  className="w-full min-h-[100px] border border-gray-300 mt-2"
                />
              </div>
            </div>
            
            <div className="flex justify-between mt-8">
              <Link href="/flow-assessment">
                <Button type="button" variant="outline" className="px-8">
                  Return
                </Button>
              </Link>
              <div className="flex space-x-3">
                <Button type="reset" variant="outline" className="px-8" onClick={() => setFormValues({stressTriggers: "", strengthsAttention: "", flowStrategies: ""})}>
                  Reset
                </Button>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-8">
                  Save
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </MainContainer>
  );
}