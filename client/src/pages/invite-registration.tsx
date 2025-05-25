import React, { useState } from 'react';
import { useRoute } from 'wouter';
import { InviteVerification } from '@/components/auth/InviteVerification';
import { ProfileSetup } from '@/components/auth/ProfileSetup';

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
        <div className="mb-8">
          <div className="flex flex-col space-y-2">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-start">
                <div className="flex-shrink-0 mr-3">
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                      index === currentStep || index < currentStep 
                        ? "border-primary bg-primary text-white" 
                        : "border-gray-300 bg-white text-gray-500"
                    }`}
                  >
                    {index < currentStep ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <span>{index === currentStep ? "•" : ""}</span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col">
                  <span
                    className={`text-sm font-medium ${
                      index === currentStep || index < currentStep 
                        ? "text-primary" 
                        : "text-gray-900"
                    }`}
                  >
                    {step.title}
                  </span>
                  {step.description && (
                    <span
                      className={`text-xs ${
                        index !== currentStep 
                          ? "text-gray-500" 
                          : "text-primary/80"
                      }`}
                    >
                      {step.description}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        
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