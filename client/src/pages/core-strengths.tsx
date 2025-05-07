import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import MainContainer from "@/components/layout/MainContainer";

export default function CoreStrengths() {
  // Get user profile
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['/api/user/profile'],
    staleTime: Infinity,
  });
  
  // Form for strength reflection
  const form = useForm({
    defaultValues: {
      firstStrength: "",
      secondStrength: "",
      thirdStrength: "",
      stressCoping: "",
      complementaryStrengths: "",
      futureProjects: "",
      uniqueContribution: "",
      fourthStrength: ""
    },
  });
  
  const onSubmit = (data: any) => {
    console.log("Submitted strength reflection:", data);
    // In a real app, this would save the reflection to the server
  };
  
  // Show loading state
  if (userLoading) {
    return (
      <MainContainer stepId="A" className="bg-white">
        <div className="text-center">
          <p className="text-lg">Loading your profile information...</p>
        </div>
      </MainContainer>
    );
  }
  
  return (
    <MainContainer stepId="A" className="bg-white">
      <div className="flex items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Reflect On Your Strengths</h1>
      </div>
      
      <div className="mb-4">
        <p className="text-gray-700">
          <span className="font-medium">Purpose:</span> Express in your own words how you see yourself, your strengths, values, what you uniquely bring to the team, what you value in others,
          and what gets you enthused about professionally.
        </p>
        <p className="text-gray-700 mt-2">
          <span className="font-medium">Directions:</span> Respond to the prompts.
        </p>
      </div>
      
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-1/2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstStrength"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>How and when I use my 1st strength</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Your answer" 
                          className="min-h-[80px] border border-gray-300"
                          {...field} 
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="secondStrength"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>How and when I use my 2nd strength</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Your answer" 
                          className="min-h-[80px] border border-gray-300"
                          {...field} 
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="stressCoping"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reflect on your Stress Coping Strengths</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Your answer" 
                          className="min-h-[80px] border border-gray-300"
                          {...field} 
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="thirdStrength"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>How and when I use my 3rd strength</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Your answer" 
                          className="min-h-[80px] border border-gray-300"
                          {...field} 
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="complementaryStrengths"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Three complementary strengths I value in others</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Your answer" 
                          className="min-h-[80px] border border-gray-300"
                          {...field} 
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="futureProjects"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current or future projects I'm really enthused about</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Your answer" 
                          className="min-h-[80px] border border-gray-300"
                          {...field} 
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="uniqueContribution"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>What I uniquely bring to the team</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Your answer" 
                          className="min-h-[80px] border border-gray-300"
                          {...field} 
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="fourthStrength"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>How and when I use my 4th strength</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Your answer" 
                          className="min-h-[80px] border border-gray-300"
                          {...field} 
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="flex space-x-3">
                <Button type="button" variant="outline" onClick={() => form.reset()} className="px-8">
                  Return
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-8">
                  Save
                </Button>
              </div>
            </form>
          </Form>
        </div>
        
        <div className="w-full md:w-1/2">
          <div className="aspect-video mb-6 relative">
            <iframe 
              className="w-full h-full"
              src="https://www.youtube.com/embed/dQw4w9WgXcQ" 
              title="Reflect On Your Strengths" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen>
            </iframe>
          </div>
          
          <div className="text-center bg-blue-50 rounded-lg p-4 border border-blue-100">
            <h3 className="uppercase font-bold text-lg mb-2 text-blue-700">Reflect On Your Strengths</h3>
            <a href="https://drive.google.com" className="text-blue-600 hover:text-blue-800 text-sm" target="_blank" rel="noopener noreferrer">
              https://drive.google.com/file/link/to/video
            </a>
          </div>
        </div>
      </div>
    </MainContainer>
  );
}