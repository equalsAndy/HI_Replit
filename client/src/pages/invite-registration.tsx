import React, { useState } from 'react';
import { InviteVerification } from '../components/auth/InviteVerification';
import { ProfileSetup } from '../components/auth/ProfileSetup';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Steps } from '@/components/ui/steps';

const InviteRegistrationPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [inviteData, setInviteData] = useState<any>(null);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [newUser, setNewUser] = useState<any>(null);

  // Handle invite verification success
  const handleInviteVerified = (data: any) => {
    setInviteData(data);
    setCurrentStep(2);
  };

  // Handle registration success
  const handleRegistrationSuccess = (userData: any) => {
    setNewUser(userData);
    setRegistrationComplete(true);
    setCurrentStep(3);
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <Steps 
          steps={[
            { label: "Verify Invite", status: currentStep === 1 ? "current" : "complete" },
            { label: "Create Account", status: currentStep < 2 ? "upcoming" : currentStep === 2 ? "current" : "complete" },
            { label: "Complete", status: currentStep < 3 ? "upcoming" : "current" }
          ]} 
        />
      </div>

      {currentStep === 1 && (
        <InviteVerification onVerified={handleInviteVerified} />
      )}

      {currentStep === 2 && inviteData && (
        <ProfileSetup 
          inviteData={inviteData} 
          onComplete={handleRegistrationSuccess} 
        />
      )}

      {currentStep === 3 && registrationComplete && (
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Registration Complete!</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <p className="text-lg">
                Welcome, <span className="font-bold">{newUser?.name}</span>!
              </p>
              <p>
                Your account has been created successfully. You can now log in with your username and password.
              </p>
              <div className="mt-6">
                <a href="/login" className="text-blue-600 hover:underline">
                  Click here to log in
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default InviteRegistrationPage;