import MainContainer from "@/components/layout/MainContainer";
import { useApplication } from "@/hooks/use-application";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function ImaginationAssessment() {
  const { appName } = useApplication();
  
  return (
    <MainContainer stepId="A" showStepNavigation={true}>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Imagination Assessment</h1>
        <p className="text-lg mb-8">
          Welcome to the {appName} assessment. This tool will help you understand your default 
          imagination patterns and how they influence your thinking and decision-making.
        </p>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>What is Imaginal Agility?</CardTitle>
            <CardDescription>
              The ability to form mental images of things not present or previously experienced.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="aspect-video rounded-md overflow-hidden mb-4">
              <iframe 
                className="w-full h-full" 
                src="https://www.youtube.com/embed/1Belekdly70" 
                title="Imaginal Agility Overview"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
            <p>
              Imaginal Agility combines swift envisioning and articulation of possibilities with adaptability. 
              It's crucial for creative problem-solving and innovation. This assessment will help you 
              understand your current imaginal capabilities.
            </p>
          </CardContent>
        </Card>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Assessment Instructions</CardTitle>
            <CardDescription>
              Complete these steps to discover your imaginal strengths
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal pl-6 space-y-2">
              <li>The assessment contains questions about the 5 Core Capabilities (5Cs): Curiosity, Empathy, Creativity, Courage, and Connection.</li>
              <li>For each capability, you'll rate yourself on a scale from 1-5.</li>
              <li>You'll also answer brief reflection questions to deepen your insights.</li>
              <li>Be honest in your self-assessment—there are no right or wrong answers.</li>
              <li>The entire process takes approximately 15-20 minutes.</li>
            </ol>
          </CardContent>
        </Card>
        
        <div className="flex justify-center">
          <Link href="/5cs-assessment">
            <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
              Begin 5Cs Assessment
            </Button>
          </Link>
        </div>
      </div>
    </MainContainer>
  );
}