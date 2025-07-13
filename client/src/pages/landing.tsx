import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import HiLogo from '@/assets/HI_Logo_horizontal.png';
import AllStarTeamsLogo from '../assets/all-star-teams-logo-250px.png';
import ImaginalAgilityLogo from '../assets/imaginal_agility_logo_nobkgrd.png';

export default function Landing() {
  const [, navigate] = useLocation();
  
  // Check if user is already authenticated
  const { data: userData, isLoading } = useQuery({
    queryKey: ['/api/auth/me'],
    staleTime: Infinity,
    refetchInterval: false,
    retry: false // Don't retry if authentication fails
  });

  const user = userData?.user;
  const isAuthenticated = !!user;

  // Redirect authenticated users to appropriate location
  useEffect(() => {
    if (isAuthenticated && user) {
      // If user is admin, redirect to admin dashboard
      if (user.role === 'admin') {
        navigate('/admin');
        return;
      }

      // For other users, redirect to their last completed step in the most recent workshop
      if (user.navigationProgress) {
        try {
          const progress = JSON.parse(user.navigationProgress);
          const appType = progress.appType;
          const completedSteps = progress.completedSteps || [];
          const currentStepId = progress.currentStepId;

          // Determine the redirect path based on app type and progress
          if (appType === 'ast' || appType === 'allstarteams') {
            // Set session storage for AllStarTeams
            sessionStorage.setItem('selectedApp', 'ast');
            
            // If user has progress, go to AllStarTeams workshop
            if (completedSteps.length > 0 || currentStepId) {
              navigate('/allstarteams');
            } else {
              // No progress yet, redirect to workshop start
              navigate('/auth?app=ast');
            }
          } else if (appType === 'ia' || appType === 'imaginal-agility') {
            // Set session storage for Imaginal Agility
            sessionStorage.setItem('selectedApp', 'imaginal-agility');
            
            // If user has progress, go to Imaginal Agility workshop
            if (completedSteps.length > 0 || currentStepId) {
              navigate('/imaginal-agility');
            } else {
              // No progress yet, redirect to workshop start
              navigate('/auth?app=imaginal-agility');
            }
          } else {
            // No app type specified, redirect based on user type
            if (user.isTestUser) {
              navigate('/testuser');
            } else {
              navigate('/');
            }
          }
        } catch (error) {
          console.error('Error parsing navigation progress:', error);
          // Fallback based on user type
          if (user.isTestUser) {
            navigate('/testuser');
          } else {
            navigate('/');
          }
        }
      } else {
        // No navigation progress, redirect based on user type
        if (user.isTestUser) {
          navigate('/testuser');
        } else {
          navigate('/');
        }
      }
    }
  }, [isAuthenticated, user, navigate]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render the landing page if user is authenticated (they'll be redirected)
  if (isAuthenticated) {
    return null;
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="logo flex items-center">
            <img 
              src={HiLogo} 
              alt="Heliotrope Imaginal"
              className="h-10 w-auto"
            />
          </div>
          
          {/* Login button removed for production test */}
          <div className="flex items-center space-x-3">
            {/* <Link href="/auth">
              <Button variant="outline" size="sm" className="rounded-md">Login</Button>
            </Link> */}
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col justify-center">
        <div className="container mx-auto px-4 py-12 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-6xl font-bold text-gray-800 mb-6">
              Choose Your Learning Experience
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Select one of our transformative learning programs to begin your journey
            </p>
          </div>

          <div className="flex justify-center mb-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* AllStarTeams Card */}
              <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow">
                <div className="p-8">
                  <div className="flex justify-center mb-6">
                    <img 
                      src={AllStarTeamsLogo} 
                      alt="AllStarTeams" 
                      className="h-16 w-auto"
                    />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">AllStarTeams</h3>
                  <p className="text-gray-600 mb-6 text-center">
                    Discover your star potential and understand your unique strengths to 
                    leverage them for personal growth and team success.
                  </p>
                  <div className="flex justify-center">
                    <Button 
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md"
                      onClick={() => {
                        // Store the selection in sessionStorage
                        sessionStorage.setItem('selectedApp', 'ast');
                        // Use window.location for more reliable navigation with query params
                        window.location.href = '/auth?app=ast';
                      }}
                    >
                      Start AllStarTeams
                    </Button>
                  </div>
                </div>

                <div className="bg-gray-50 px-8 py-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-indigo-500 font-semibold mb-1">Self-Discovery</div>
                      <p className="text-sm text-gray-500">Identify your natural talents</p>
                    </div>
                    <div className="text-center">
                      <div className="text-indigo-500 font-semibold mb-1">Team Dynamics</div>
                      <p className="text-sm text-gray-500">Understand how strengths combine</p>
                    </div>
                    <div className="text-center">
                      <div className="text-indigo-500 font-semibold mb-1">Growth Insights</div>
                      <p className="text-sm text-gray-500">Develop action strategies</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Imaginal Agility Card - Button disabled for production test */}
              <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow">
                <div className="p-8">
                  <div className="flex justify-center mb-6">
                    <img 
                      src={ImaginalAgilityLogo} 
                      alt="Imaginal Agility" 
                      className="h-16 w-auto"
                    />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">Imaginal Agility</h3>
                  <p className="text-gray-600 mb-6 text-center">
                    Cultivate your imaginal agility and learn how the 5Cs (Curiosity, Empathy, 
                    Creativity, and Courage) can transform your approach to challenges.
                  </p>
                  <div className="flex flex-col items-center">
                    <Button 
                      className="bg-purple-300 text-white px-6 py-2 rounded-md cursor-not-allowed"
                      disabled={true}
                      // No onClick handler
                    >
                      Start Imaginal Agility
                    </Button>
                    <span className="mt-2 text-xs text-purple-700 font-semibold">Coming Soon</span>
                  </div>
                </div>

                <div className="bg-gray-50 px-8 py-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-purple-500 font-semibold mb-1">5Cs Assessment</div>
                      <p className="text-sm text-gray-500">Map your capabilities</p>
                    </div>
                    <div className="text-center">
                      <div className="text-purple-500 font-semibold mb-1">AI Insights</div>
                      <p className="text-sm text-gray-500">Personalized feedback</p>
                    </div>
                    <div className="text-center">
                      <div className="text-purple-500 font-semibold mb-1">Team Workshops</div>
                      <p className="text-sm text-gray-500">Collaborative exercises</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Video Introduction Section */}
          <div className="mb-16">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">See what our workshops are all about!</h3>
              <p className="text-gray-600 max-w-3xl mx-auto">
                Experience the transformative power of our workshops and discover how they can help unlock your team's full potential.
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              {/* Updated YouTube embed with new video ID */}
              <div style={{padding:'56.25% 0 0 0', position:'relative'}} className="rounded-lg shadow-lg overflow-hidden">
                <iframe 
                  src="https://www.youtube.com/embed/LkoL6MErRkg?enablejsapi=1" 
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                  style={{position:'absolute', top:0, left:0, width:'100%', height:'100%'}} 
                  title="Workshop Overview Video"
                ></iframe>
              </div>
            </div>
          </div>

          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Why Choose Heliotrope Imaginal's Platform?</h3>
            <p className="text-gray-600 max-w-3xl mx-auto mb-8">
              Our science-backed assessments and workshops have helped thousands of professionals 
              and teams unlock their full potential through personalized insights and guided growth.
            </p>
          </div>
        </div>
      </main>

      <footer className="bg-gray-50 border-t border-gray-200 py-8">
        <div className="container mx-auto px-4 text-center text-gray-500">
          <p>&copy; 2025 Heliotrope Imaginal. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}