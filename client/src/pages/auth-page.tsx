import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth-provider";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function AuthPage() {
  const [, navigate] = useLocation();
  const { user, isLoading } = useAuth();

  // Redirect to user home if already logged in
  useEffect(() => {
    if (user) {
      navigate('/user-home');
    }
  }, [user, navigate]);

  const handleReplitAuth = () => {
    // Redirect to the Replit Auth endpoint
    window.location.href = '/api/login';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center p-8 lg:p-16">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Welcome to AllStarTeams
          </h1>
          <p className="text-gray-600">
            Sign in to continue your journey
          </p>
        </div>
        
        <div className="flex flex-col items-center space-y-6">
          <Button 
            onClick={handleReplitAuth}
            className="w-full bg-indigo-600 hover:bg-indigo-700"
          >
            Sign in to continue
          </Button>
        </div>
      </div>
      
      {/* Right side - Hero */}
      <div className="hidden lg:block lg:w-1/2 bg-indigo-600">
        <div className="h-full flex flex-col justify-center p-16 text-white">
          <h2 className="text-4xl font-bold mb-6">Discover your strengths and transform your team</h2>
          <p className="text-lg mb-8">
            The AllStarTeams platform helps you identify your natural talents and how they 
            combine with others to create high-performing teams.
          </p>
          <ul className="space-y-4">
            <li className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Personalized strengths assessment</span>
            </li>
            <li className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Interactive team dynamics visualization</span>
            </li>
            <li className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Action-oriented development plans</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}