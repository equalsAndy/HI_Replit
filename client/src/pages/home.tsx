import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import allStarTeamsLogo from "@/assets/all-star-teams-logo-250px.png";
import imaginalAgilityLogo from "@/assets/HI_Logo_horizontal.png";
import logoHorizontal from "@/assets/HI_Logo_horizontal.png";

export default function Home() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Fetch user profile
  const { data: userData } = useQuery({
    queryKey: ['/api/user/profile'],
    staleTime: Infinity,
    refetchInterval: false, // We don't need constant updates on landing page
    retry: false // Don't retry if authentication fails
  });
  
  const user = (userData as any)?.user;
  const isAuthenticated = !!user;

  // Handle workshop selection
  const handleWorkshopSelection = (workshopType: 'allstarteams' | 'imaginalagility') => {
    // If user is not logged in, redirect to login page with return path
    if (!isAuthenticated) {
      // Store the selected workshop in session storage to retrieve after login
      sessionStorage.setItem('selectedWorkshop', workshopType);
      toast({
        title: "Authentication Required",
        description: "Please log in to access the workshop.",
      });
      setLocation("/auth/login");
      return;
    }
    
    // If logged in, redirect to the appropriate workshop
    if (workshopType === 'allstarteams') {
      setLocation("/allstarteams");
    } else {
      setLocation("/imaginal-agility");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Logo and Login Button */}
      <header className="bg-white py-4 shadow-sm">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center">
            <img 
              src={logoHorizontal} 
              alt="Heliotrope Imaginal" 
              className="h-10" 
            />
          </div>
          <div>
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <span className="text-gray-700">Welcome, {user.name}</span>
                <Link href="/dashboard">
                  <Button variant="outline">Dashboard</Button>
                </Link>
              </div>
            ) : (
              <Link href="/auth/login">
                <Button variant="ghost">Login</Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main>
        {/* Hero Section */}
        <section className="py-12 px-4">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold mb-4">Choose Your Learning Experience</h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Select one of our transformative learning programs to begin your journey
              </p>
            </div>

            {/* Workshop Cards */}
            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {/* AllStarTeams Card */}
              <Card className="overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-center mb-4">
                    <img 
                      src={allStarTeamsLogo} 
                      alt="AllStarTeams" 
                      className="h-16" 
                    />
                  </div>
                  <h2 className="text-2xl font-bold text-center mb-4">AllStarTeams</h2>
                  <p className="text-gray-600 mb-6">
                    Discover your star potential and understand your unique strengths to leverage them for personal growth and team success.
                  </p>
                  
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    <div className="text-center p-2 bg-blue-50 rounded">
                      <h3 className="text-sm text-blue-700 font-medium">Self-Discovery</h3>
                      <p className="text-xs mt-1">Identify your natural talents</p>
                    </div>
                    <div className="text-center p-2 bg-blue-50 rounded">
                      <h3 className="text-sm text-blue-700 font-medium">Team Dynamics</h3>
                      <p className="text-xs mt-1">Understand how strengths combine</p>
                    </div>
                    <div className="text-center p-2 bg-blue-50 rounded">
                      <h3 className="text-sm text-blue-700 font-medium">Growth Insights</h3>
                      <p className="text-xs mt-1">Develop action strategies</p>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700" 
                    onClick={() => handleWorkshopSelection('allstarteams')}
                  >
                    Start AllStarTeams
                  </Button>
                </div>
              </Card>
              
              {/* Imaginal Agility Card */}
              <Card className="overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-center mb-4">
                    <img 
                      src={imaginalAgilityLogo} 
                      alt="Imaginal Agility" 
                      className="h-16" 
                    />
                  </div>
                  <h2 className="text-2xl font-bold text-center mb-4">Imaginal Agility</h2>
                  <p className="text-gray-600 mb-6">
                    Cultivate your imaginal agility and learn how the 5Cs (Curiosity, Empathy, Creativity, and Courage) can transform your approach to challenges.
                  </p>
                  
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    <div className="text-center p-2 bg-purple-50 rounded">
                      <h3 className="text-sm text-purple-700 font-medium">5Cs Assessment</h3>
                      <p className="text-xs mt-1">Map your capabilities</p>
                    </div>
                    <div className="text-center p-2 bg-purple-50 rounded">
                      <h3 className="text-sm text-purple-700 font-medium">AI Insights</h3>
                      <p className="text-xs mt-1">Personalized feedback</p>
                    </div>
                    <div className="text-center p-2 bg-purple-50 rounded">
                      <h3 className="text-sm text-purple-700 font-medium">Team Workshops</h3>
                      <p className="text-xs mt-1">Collaborative exercises</p>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full bg-purple-600 hover:bg-purple-700" 
                    onClick={() => handleWorkshopSelection('imaginalagility')}
                  >
                    Start Imaginal Agility
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </section>
        
        {/* Workshop Video Section */}
        <section className="py-12 px-4 bg-white">
          <div className="container mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">See what our workshops are all about!</h2>
              <p className="text-gray-600 max-w-3xl mx-auto">
                Experience the transformative power of our workshops and discover how they can help unlock your team's full potential.
              </p>
            </div>
            
            <div className="max-w-4xl mx-auto aspect-video bg-gray-100 rounded-lg overflow-hidden shadow-lg flex items-center justify-center">
              <div className="text-center">
                <p className="text-xl text-gray-600 font-medium">Video Available</p>
                <p className="text-gray-500">Heliotrope Imaginal Workshops Overview</p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Why Choose Section */}
        <section className="py-12 px-4">
          <div className="container mx-auto">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold mb-6">Why Choose Heliotrope Imaginal's Platform?</h2>
              <p className="text-lg text-gray-600">
                Our science-backed assessments and workshops have helped thousands of professionals and teams 
                unlock their full potential through personalized insights and guided growth.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 py-6">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>© 2025 Heliotrope Imaginal. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
