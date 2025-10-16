import React, { useState } from 'react';
import { useLocation, Link } from 'wouter';
import InviteVerification from '@/components/auth/InviteVerification';
import ProfileSetup from '@/components/auth/ProfileSetup';
import { Steps } from '@/components/ui/steps';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import HiLogo from '@/assets/HI_Logo_horizontal.png';
import AllStarTeamsLogo from '@/assets/all-star-teams-logo-250px.png';
import ImaginalAgilityLogo from '@/assets/imaginal_agility_logo_nobkgrd.png';

type InviteData = {
  inviteCode: string;
  email: string;
  role: string;
  name?: string;
  jobTitle?: string;
  organization?: string;
};

const InviteRegistrationPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [inviteData, setInviteData] = useState<InviteData | null>(null);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Define the steps in the registration process
  const steps = [
    {
      title: 'Verify Invitation',
      description: 'Enter your invitation code',
    },
    {
      title: 'Create Profile',
      description: 'Set up your account details',
    },
    {
      title: 'Complete',
      description: 'Registration complete',
    },
  ];

  // Handle successful invite verification
  const handleInviteVerified = (data: InviteData) => {
    setInviteData(data);
    setCurrentStep(1);
  };

  // Handle completion of profile setup
  const handleProfileComplete = () => {
    setCurrentStep(2);
    
    // Clear any beta welcome session storage to ensure clean slate for first login
    // This ensures the welcome modal will show properly after login
    Object.keys(sessionStorage).forEach(key => {
      if (key.startsWith('beta_welcome_shown_')) {
        sessionStorage.removeItem(key);
      }
    });
    
    toast({
      title: 'Registration complete!',
      description: 'Your account has been successfully created. You can now log in.',
    });
  };

  // Handle redirecting to login page
  const handleGoToLogin = () => {
    setLocation('/login');
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="container mx-auto py-6">
        <div className="flex flex-col items-center space-y-4">
          {/* Main HI Logo */}
          <Link href="/">
            <img 
              src={HiLogo} 
              alt="Heliotrope Imaginal"
              className="h-12 w-auto"
            />
          </Link>
          
          {/* Workshop Logos */}
          <div className="flex items-center space-x-8">
            <img 
              src={AllStarTeamsLogo} 
              alt="AllStarTeams" 
              className="h-10 w-auto opacity-80"
            />
            <img 
              src={ImaginalAgilityLogo} 
              alt="Imaginal Agility" 
              className="h-10 w-auto opacity-80"
            />
          </div>
        </div>
      </header>
      
      {/* Navigation buttons */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-center gap-4">
          <Link href="/">
            <Button variant="ghost" className="text-sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to home
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" className="text-sm">
              I have already registered
            </Button>
          </Link>
        </div>
      </div>
      
      <div className="flex-1 container mx-auto px-4 py-8 max-w-5xl">
        <div className="flex flex-col md:flex-row gap-8">
        {/* Left sidebar with steps */}
        <div className="md:w-1/4 py-6">
          <Steps steps={steps} currentStep={currentStep} />
        </div>

        {/* Main content area */}
        <div className="md:w-3/4">
          {currentStep === 0 && (
            <InviteVerification onVerified={handleInviteVerified} />
          )}

          {currentStep === 1 && inviteData && (
            <ProfileSetup 
              inviteData={inviteData} 
              onComplete={handleProfileComplete} 
            />
          )}

          {currentStep === 2 && (
            <Card className="w-full max-w-md mx-auto">
              <CardHeader>
                <div className="flex flex-col items-center space-y-2">
                  <CheckCircle className="h-16 w-16 text-green-500" />
                  <CardTitle className="text-2xl text-center">Registration Complete!</CardTitle>
                  <CardDescription className="text-center">
                    Your account has been successfully created. You can now log in to access the workshop platform.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="flex justify-center">
                <Button onClick={handleGoToLogin}>Go to Login</Button>
              </CardContent>
            </Card>
          )}
        </div>
        </div>
      </div>
    </div>
  );
};

export default InviteRegistrationPage;