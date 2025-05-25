import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { InviteCodeVerification } from '@/components/auth/InviteCodeVerification';
import { ProfileSetup } from '@/components/auth/ProfileSetup';

export default function InviteRegistrationPage() {
  const [location, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState<'verify' | 'setup'>('verify');
  const [inviteData, setInviteData] = useState<{
    inviteCode: string;
    name: string;
    email: string;
    expiresAt: string;
  } | null>(null);
  
  // Check if invite code was provided in URL
  const searchParams = new URLSearchParams(window.location.search);
  const codeFromUrl = searchParams.get('code');
  
  // Extract code from URL if available
  React.useEffect(() => {
    if (codeFromUrl) {
      // Auto-verify would go here in the future
      // For now, just pre-fill the code in the verification form
    }
  }, [codeFromUrl]);
  
  // Handle invite code verification
  const handleVerified = (data: {
    inviteCode: string;
    name: string;
    email: string;
    expiresAt: string;
  }) => {
    setInviteData(data);
    setCurrentStep('setup');
  };
  
  // Handle registration completion
  const handleRegistrationComplete = () => {
    // Redirect to dashboard
    setLocation('/dashboard');
  };
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center p-6">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">Heliotrope Workshops</h1>
          <p className="text-muted-foreground mt-2">
            {currentStep === 'verify'
              ? 'Enter your invite code to get started'
              : 'Complete your profile setup'}
          </p>
        </div>
        
        {currentStep === 'verify' ? (
          <InviteCodeVerification onVerified={handleVerified} />
        ) : inviteData ? (
          <ProfileSetup 
            inviteData={inviteData} 
            onRegistrationComplete={handleRegistrationComplete}
          />
        ) : null}
        
        <div className="mt-8 text-center text-sm">
          <p className="text-muted-foreground">
            Already have an account?{' '}
            <a 
              href="/login" 
              className="text-primary hover:underline font-medium"
            >
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}