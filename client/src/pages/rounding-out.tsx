import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { useForm } from "react-hook-form";

export default function RoundingOut() {
  // Get user profile
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['/api/user/profile'],
    staleTime: Infinity,
  });
  
  // Form for reflection questions
  const form = useForm({
    defaultValues: {
      stressTriggers: "",
      strengthsBalance: "",
      flowMaintenance: ""
    },
  });
  
  const onSubmit = (data: any) => {
    console.log("Submitted reflection:", data);
    // In a real app, this would save the reflection to the server
  };
  
  // Show loading state
  if (userLoading) {
    return (
      <div className="container mx-auto py-8 max-w-4xl">
        <div className="text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-gray-800 mb-8">Rounding Out</h1>
          <p className="text-lg">Loading your profile information...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-5xl font-bold text-gray-800 mb-8">Rounding Out</h1>
      </div>
      
      <div className="mb-8">
        <div className="text-left mb-6">
          <h2 className="text-xl font-semibold mb-2">Purpose</h2>
          <p className="mb-4">
            Before you complete our Star Card, let's take one final look. What may need more 
            attention — strengths you underuse, patterns under pressure, and how to stay in flow 
            more often.
          </p>
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div>
          <div className="aspect-video mb-6">
            <iframe 
              className="w-full h-full"
              src="https://www.youtube.com/embed/dQw4w9WgXcQ" 
              title="Rounding Out" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen>
            </iframe>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="font-bold mb-4">Reflection</h3>
            <p className="mb-4">Before completing your Star Card, take a moment to step back, reflect, and round out your self-awareness.</p>
            
            <div className="space-y-4">
              <div className="p-3 bg-blue-100 rounded-md text-center">
                <p>When stress or distraction tends to show up</p>
              </div>
              
              <div className="p-3 bg-blue-100 rounded-md text-center">
                <p>Which strengths need more care or balance</p>
              </div>
              
              <div className="p-3 bg-blue-100 rounded-md text-center">
                <p>How to stay in flow more often</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-purple-100 rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4">Rounding Out</h3>
          <p className="mb-4 text-sm">
            Before completing your <strong>Star Card</strong>, take a moment to pause and 
            reflect. Please respond to each of the following prompts:
          </p>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="stressTriggers"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>When does stress or distraction tend to show up for you? <em>What patterns, triggers, or situations knock you off balance</em></FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Your answer" 
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="strengthsBalance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Which strengths or qualities do you need to nurture – and why? <em>Consider what parts of you need extra care, attention, or encouragement to thrive.</em></FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Your answer" 
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="flowMaintenance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>How will you harness your strengths to create forward momentum – especially when things feel uncertain or stuck? <em>Consider how your natural abilities could help you move through challenges or take meaningful next steps.</em></FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Your answer" 
                        className="min-h-[100px]"
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
        <Link href="/complete-star-card">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded">
            NEXT
          </Button>
        </Link>
      </div>
    </div>
  );
}