import React, { useState } from 'react';
import { useRoute } from 'wouter';
import { InviteVerification } from '@/components/auth/InviteVerification';
import { ProfileSetup } from '@/components/auth/ProfileSetup';
import { Steps, Step } from '@/components/ui/steps';

// Steps for the registration process
const STEPS = [
  {
    id: 'verify-invite',
    title: 'Verify Invite',
    description: 'Verify your invitation code'
  },
  {
    id: 'create-profile',
    title: 'Create Profile',
    description: 'Set up your account information'
  },
  {
    id: 'complete',
    title: 'Complete',
    description: 'Registration complete'
  }
];

export default function InviteRegistrationPage() {
  // Get invite code from URL if available
  const [, params] = useRoute('/register/:inviteCode?');
  const initialCode = params?.inviteCode || '';
  
  // Track current step and invite data
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [inviteData, setInviteData] = useState<{
    email: string;
    role: string;
    name?: string;
    inviteCode: string;
  } | null>(null);
  
  // Handle verification success
  const handleInviteVerified = (data: {
    email: string;
    role: string;
    name?: string;
    inviteCode: string;
  }) => {
    setInviteData(data);
    setCurrentStep(1);
  };
  
  // Handle registration completion
  const handleRegistrationComplete = () => {
    setCurrentStep(2);
  };
  
  return (
    <div className="container flex flex-col items-center justify-center min-h-screen py-12">
      <div className="max-w-md w-full mx-auto mb-8">
        <h1 className="text-3xl font-bold text-center mb-2">
          Welcome to Heliotrope Imaginal
        </h1>
        <p className="text-muted-foreground text-center mb-8">
          Join our workshops and collaborative learning platform
        </p>
        
        {/* Registration steps indicator */}
        <Steps currentStep={currentStep} className="mb-8">
          {STEPS.map((step, index) => (
            <Step 
              key={step.id}
              title={step.title}
              description={step.description}
              active={index === currentStep}
              completed={index < currentStep}
            />
          ))}
        </Steps>
        
        {/* Step content */}
        <div className="mt-6">
          {currentStep === 0 && (
            <InviteVerification 
              onVerified={handleInviteVerified} 
            />
          )}
          
          {currentStep === 1 && inviteData && (
            <ProfileSetup 
              inviteData={inviteData} 
              onComplete={handleRegistrationComplete} 
            />
          )}
          
          {currentStep === 2 && (
            <div className="text-center p-8 bg-white rounded-lg shadow-md">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-8 w-8 text-green-600" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M5 13l4 4L19 7" 
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-2">Registration Complete!</h2>
              <p className="text-gray-600 mb-6">
                Your account has been created successfully.
              </p>
              <a 
                href="/" 
                className="inline-block px-6 py-3 bg-primary text-white rounded-md font-medium hover:bg-primary/90 transition-colors"
              >
                Go to Dashboard
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}