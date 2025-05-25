import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Steps, Step } from '@/components/ui/steps';
import InviteVerification from '@/components/auth/InviteVerification';
import ProfileSetup from '@/components/auth/ProfileSetup';
import Logo from '@/components/branding/Logo';
import { CheckCircle } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

const InviteRegistrationPage: React.FC = () => {
  const [step, setStep] = useState(0);
  const [inviteData, setInviteData] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [location, setLocation] = useLocation();
  const { toast } = useToast();

  // Handle invite code verification
  const handleInviteVerified = (data: any) => {
    setInviteData(data);
    setStep(1);
  };

  // Handle registration completion
  const handleRegistrationComplete = async (user: any) => {
    setUserData(user);
    setStep(2);
    
    // Redirect to dashboard after a short delay
    setTimeout(() => {
      setLocation('/dashboard');
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b py-4 px-6">
        <div className="container mx-auto">
          <Logo size="md" />
        </div>
      </header>
      
      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-4xl mx-auto space-y-8">
          {/* Steps indicator */}
          <Steps activeStep={step} className="mb-8">
            <Step title="Verify Invite" />
            <Step title="Create Profile" />
            <Step title="Complete" />
          </Steps>
          
          {/* Step content */}
          <div className="w-full">
            {step === 0 && (
              <InviteVerification onVerified={handleInviteVerified} />
            )}
            
            {step === 1 && inviteData && (
              <ProfileSetup 
                inviteData={inviteData} 
                onComplete={handleRegistrationComplete} 
              />
            )}
            
            {step === 2 && userData && (
              <Card className="w-full max-w-md mx-auto">
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-10 w-10 text-primary" />
                    </div>
                  </div>
                  <CardTitle className="text-2xl font-bold">Registration Complete!</CardTitle>
                  <CardDescription>
                    Your account has been created successfully.
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="mb-2">Welcome to Heliotrope Imaginal Workshops, <span className="font-semibold">{userData.name}</span>!</p>
                  <p className="text-muted-foreground">
                    You'll be redirected to your dashboard in a moment.
                  </p>
                </CardContent>
                <CardFooter className="flex justify-center pt-0">
                  <div className="text-sm text-muted-foreground">
                    <p>Your role: <span className="capitalize">{userData.role}</span></p>
                  </div>
                </CardFooter>
              </Card>
            )}
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="border-t py-4 px-6 text-center text-sm text-muted-foreground">
        <div className="container mx-auto">
          <p>© {new Date().getFullYear()} Heliotrope Imaginal. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default InviteRegistrationPage;