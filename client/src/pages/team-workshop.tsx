import MainContainer from "@/components/layout/MainContainer";
import { useApplication } from "@/hooks/use-application";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "wouter";

export default function TeamWorkshop() {
  const { appName } = useApplication();
  
  return (
    <MainContainer stepId="D" showStepNavigation={true}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Team Workshop</h1>
        <p className="text-lg mb-6">
          The spotlight turns to the team — transforming individual imaginal agility into 
          shared creative force. Together, you'll be guided through dynamic whiteboard 
          exercises to unlock collective insight and AI collaboration.
        </p>
        
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle>Workshop A: Imaginal Agility Basic Exercises</CardTitle>
              <CardDescription>
                Foundation exercises for teams new to imaginal work
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="aspect-video rounded-md overflow-hidden">
                <iframe 
                  className="w-full h-full" 
                  src="https://www.youtube.com/embed/1Belekdly70" 
                  title="Imaginal Agility Basic Exercises"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
              <p>
                These foundational exercises help teams develop their collaborative 
                imagination capabilities through structured activities.
              </p>
              <Button className="w-full bg-purple-600 hover:bg-purple-700">
                Open Workshop A Materials
              </Button>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle>Workshop B: Imaginal Agility Advanced AI Exercises</CardTitle>
              <CardDescription>
                Advanced exercises incorporating AI collaboration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="aspect-video rounded-md overflow-hidden">
                <iframe 
                  className="w-full h-full" 
                  src="https://www.youtube.com/embed/zQmEicnjQn8" 
                  title="Imaginal Agility Advanced AI Exercises"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
              <p>
                These advanced exercises help teams leverage AI tools while maintaining 
                human creativity and imagination at the center of the process.
              </p>
              <Button className="w-full bg-purple-600 hover:bg-purple-700">
                Open Workshop B Materials
              </Button>
            </CardContent>
          </Card>
        </div>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Workshop Template and Mural Board</CardTitle>
            <CardDescription>
              Collaborative tools for your team workshop
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border rounded-md overflow-hidden">
              <img 
                src="/src/assets/28 screencapture-sites-google-view-imaginalagilityworkshop-stage-2-team-workshop-2025-05-05-15_54_49.png" 
                alt="Mural Board Preview" 
                className="w-full h-auto"
              />
            </div>
            <p>
              Upon completion of your 5Cs Self-Assessment, you're ready for Stage 2: The Workshop. 
              In the meantime, check out the Workshop Template and Exercises to familiarize yourself 
              with the process.
            </p>
            <div className="flex space-x-4">
              <Button className="flex-1 bg-purple-600 hover:bg-purple-700">
                Launch Team Whiteboard
              </Button>
              <Button variant="outline" className="flex-1">
                Download Workshop Guide
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <div className="flex justify-center">
          <Link href="/workshop-compendium">
            <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
              Continue to Workshop Compendium
            </Button>
          </Link>
        </div>
      </div>
    </MainContainer>
  );
}