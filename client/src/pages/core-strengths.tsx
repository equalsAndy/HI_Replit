import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { useForm } from "react-hook-form";

export default function CoreStrengths() {
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
  
  // Form for strength reflection
  const form = useForm({
    defaultValues: {
      firstStrength: "",
      secondStrength: "",
      thirdStrength: "",
      fourthStrength: "",
      fifthStrength: "",
      complementaryStrengths: "",
      uniqueContribution: "",
      futureProjects: ""
    },
  });
  
  const onSubmit = (data: any) => {
    console.log("Submitted strength reflection:", data);
    // In a real app, this would save the reflection to the server
  };
  
  // Show loading state
  if (userLoading || starCardLoading) {
    return (
      <div className="container mx-auto py-8 max-w-4xl">
        <div className="text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-gray-800 mb-8">Your Core Strengths</h1>
          <p className="text-lg">Loading your profile information...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-5xl font-bold text-gray-800 mb-8">Your Core Strengths</h1>
      </div>
      
      <div className="mb-8">
        <div className="text-left mb-6">
          <h2 className="text-xl font-semibold mb-2">Purpose</h2>
          <p className="mb-4">
            This exercise helps you reflect on how your core strengths show up in real situations. It 
            builds clarity and confidence by grounding your strengths in lived experience — so you 
            can recognize, trust, and apply them more intentionally.
          </p>
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div>
          <div className="aspect-video mb-6">
            <iframe 
              className="w-full h-full"
              src="https://www.youtube.com/embed/dQw4w9WgXcQ" 
              title="Your Superpower" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen>
            </iframe>
          </div>
        </div>
        
        <div className="bg-purple-100 rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4">Your Core Strengths Reflection</h3>
          <p className="mb-4 text-sm">
            Express in your own words how you see yourself, your strengths, 
            values, what you uniquely bring to the team, what you value in others,
            and what gets you excited about professional opportunities. Click into each box below and type your response. Just a 
            few short sentences.
          </p>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="firstStrength"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>How and when I see my 1st strength</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Your answer" 
                        className="min-h-[80px]"
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
                    <FormLabel>How and when I see my 2nd strength</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Your answer" 
                        className="min-h-[80px]"
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
                    <FormLabel>How and when I see my 3rd strength</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Your answer" 
                        className="min-h-[80px]"
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
                    <FormLabel>How and when I see my 4th strength</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Your answer" 
                        className="min-h-[80px]"
                        {...field} 
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="fifthStrength"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>How and when I used my 5th strength, imagination</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Your answer" 
                        className="min-h-[80px]"
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
                        className="min-h-[80px]"
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
                        className="min-h-[80px]"
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
                        className="min-h-[80px]"
                        {...field} 
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <div className="flex justify-center mt-6">
                <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white">Save Reflection</Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
      
      <div className="text-center mt-8">
        <Link href="/flow-assessment">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded">
            NEXT
          </Button>
        </Link>
      </div>
    </div>
  );
}