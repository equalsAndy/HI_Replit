import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Play } from "lucide-react";
import HiLogo from '@/assets/HI_Logo_horizontal.png';
import AllStarTeamsLogo from '../assets/all-star-teams-logo-250px.png';
import ImaginalAgilityLogo from '../assets/imaginal_agility_logo_nobkgrd.png';
import { VideoModal } from '@/components/ui/video-modal';

export default function Landing() {
  const [, navigate] = useLocation();
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  
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
              Welcome to the Heliotrope Imaginal Workshops
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-4xl mx-auto">
              Transformative learning experiences grounded in research-backed psychology and neuroscience, drawing from thousands of years of human wisdom.
            </p>
          </div>

          {/* Login and Invite Buttons - Moved Above Cards */}
          <div className="flex justify-center mb-12">
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-md text-lg font-semibold"
                onClick={() => {
                  window.location.href = '/auth';
                }}
              >
                Login
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 px-8 py-3 rounded-md text-lg font-semibold"
                onClick={() => {
                  window.location.href = '/register';
                }}
              >
                I have an invite code
              </Button>
            </div>
          </div>

          <div className="flex justify-center mb-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* AllStarTeams Card */}
              <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow h-full">
                <div className="p-8 h-full flex flex-col">
                  <div className="flex justify-center mb-6">
                    <img 
                      src={AllStarTeamsLogo} 
                      alt="AllStarTeams" 
                      className="h-16 w-auto"
                    />
                  </div>
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">AllStarTeams</h3>
                    <p className="text-lg font-semibold text-indigo-600 mb-4">Individual & Team Workshop</p>
                  </div>
                  
                  <div className="text-gray-700 leading-relaxed space-y-4">
                    <p><strong>Build Self-Awareness</strong> through five strengths model: imagining, thinking, planning, acting, and feeling.</p>
                    <p><strong>Identify Flow State</strong> when performing at your peak and recreate it on demand.</p>
                    <p><strong>Enhance Wellbeing</strong> by reflecting on current state and how to reach optimal one.</p>
                    <p><strong>Envision Future Growth</strong> to activate deep learning and development.</p>
                    <p><strong>Build Exceptional Teams</strong> through strengths-based fusion mapping and mutual understanding.</p>
                    <p><strong>Humanistic AI</strong> provides supplementary coaching and analytics.</p>
                  </div>
                </div>
              </div>

              {/* Imaginal Agility Card */}
              <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow h-full">
                <div className="p-8 h-full flex flex-col">
                  <div className="flex justify-center mb-6">
                    <img 
                      src={ImaginalAgilityLogo} 
                      alt="Imaginal Agility" 
                      className="h-16 w-auto"
                    />
                  </div>
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">Imaginal Agility</h3>
                    <p className="text-lg font-semibold text-purple-600 mb-4">Individual & Team Workshop</p>
                  </div>
                  
                  <div className="text-gray-700 leading-relaxed space-y-4">
                    <p><strong>Develop Your Imagination</strong> as a core strategic capability as a foundation for growth and change.</p>
                    <p><strong>Learn The I4C Model</strong> to enhance your curiosity, caring, creativity, and courage.</p>
                    <p><strong>Climb Ladder Of Imagination</strong> through structured visioning and creative problem-solving.</p>
                    <p><strong>Elevate Your HaiQ</strong> (Human-AI Collaboration Quotient) for the future workforce.</p>
                    <p><strong>Grow Return On Imagination</strong> (ROI 2.0) at scale across teams and organizations.</p>
                    <p><strong>Humanistic AI</strong> provides supplementary coaching and analytics.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Video Introduction Section */}
          <div className="mb-16">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">See what our workshops are all about!</h3>
              <p className="text-gray-600 max-w-3xl mx-auto mb-6">
                Experience the transformative power of our workshops and discover how they can help unlock your team's full potential.
              </p>
              
              <Button
                size="lg"
                onClick={() => setIsVideoModalOpen(true)}
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-md text-lg font-semibold inline-flex items-center gap-2"
              >
                <Play className="h-5 w-5" />
                Watch Workshop Overview
              </Button>
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

      {/* Video Modal */}
      <VideoModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        videoId="LkoL6MErRkg"
        title="Workshop Overview Video"
      />
    </div>
  );
}