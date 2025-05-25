import React, { useEffect, useState } from 'react';
import { useRoute, Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const WorkshopPage: React.FC = () => {
  const [, params] = useRoute('/workshop/:id');
  const workshopId = params?.id;
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [workshopData, setWorkshopData] = useState<any>(null);

  useEffect(() => {
    // This is a placeholder - in a real implementation, we would fetch workshop data
    // from the API based on the workshopId
    const loadWorkshopData = () => {
      setLoading(true);
      
      // Simulate loading workshop data
      setTimeout(() => {
        if (workshopId === 'allstar') {
          setWorkshopData({
            id: 'allstar',
            title: 'AllStar Teams Workshop',
            description: 'Discover your unique strengths and leadership style',
            modules: [
              { id: 1, title: 'Your Star Self-Assessment', completed: false },
              { id: 2, title: 'Review Your Star Profile', completed: false },
              { id: 3, title: 'Your Core Strengths', completed: false },
              { id: 4, title: 'Flow Self Assessment', completed: false },
              { id: 5, title: 'Rounding Out', completed: false },
              { id: 6, title: 'Complete Your Star Card', completed: false },
              { id: 7, title: 'Ladder of Wellbeing', completed: false },
              { id: 8, title: 'Visualizing Potential', completed: false },
              { id: 9, title: 'Your Future Self', completed: false },
              { id: 10, title: 'Recap Your Insights', completed: false }
            ]
          });
        } else if (workshopId === 'imaginal') {
          setWorkshopData({
            id: 'imaginal',
            title: 'Imaginal Agility Workshop',
            description: 'Enhance your creative thinking and adaptability',
            modules: [
              { id: 1, title: 'Welcome to Imaginal Agility', completed: false },
              { id: 2, title: 'Module 1: The Challenge', completed: false },
              { id: 3, title: 'Module 2: Solution', completed: false },
              { id: 4, title: 'Module 3: Your 5Cs', completed: false },
              { id: 5, title: '5Cs Self Assessment', completed: false },
              { id: 6, title: 'Insights Distilled', completed: false },
              { id: 7, title: 'Next Steps', completed: false }
            ]
          });
        } else {
          toast({
            variant: 'destructive',
            title: 'Workshop not found',
            description: 'The requested workshop could not be found.',
          });
        }
        
        setLoading(false);
      }, 1000);
    };

    loadWorkshopData();
  }, [workshopId, toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading workshop...</p>
        </div>
      </div>
    );
  }

  if (!workshopData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <h1 className="text-4xl font-bold mb-4">Workshop Not Found</h1>
        <p className="text-muted-foreground mb-8">
          The workshop you're looking for doesn't exist or you don't have permission to access it.
        </p>
        <Button asChild>
          <Link href="/dashboard">Return to Dashboard</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold">Heliotrope Imaginal Workshops</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" asChild>
              <Link href="/dashboard">Dashboard</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/login">Log out</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" className="mb-4">
              ← Back to Dashboard
            </Button>
          </Link>
          <h2 className="text-3xl font-bold">{workshopData.title}</h2>
          <p className="text-muted-foreground mt-2">{workshopData.description}</p>
        </div>
        
        <div className="grid gap-6">
          {workshopData.modules.map((module: any) => (
            <Card key={module.id}>
              <CardHeader>
                <CardTitle>Module {module.id}: {module.title}</CardTitle>
                <CardDescription>
                  {module.completed ? 'Completed' : 'Not started'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button>
                  {module.completed ? 'Review Module' : 'Start Module'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default WorkshopPage;