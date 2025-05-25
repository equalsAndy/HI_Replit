import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { InviteVerification } from '@/components/auth/InviteVerification';
import { ProfileSetup } from '@/components/auth/ProfileSetup';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export function InviteRegistration() {
  const [location, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState<'verification' | 'profile'>('verification');
  const [inviteCode, setInviteCode] = useState<string>('');
  const [inviteData, setInviteData] = useState<{
    id: number;
    email: string;
    name: string;
    role: string;
  } | null>(null);
  
  // Check for invite code in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    
    if (code) {
      setInviteCode(code);
    }
  }, []);
  
  // Handle successful verification
  const handleVerification = (data: {
    id: number;
    email: string;
    name: string;
    role: string;
  }) => {
    setInviteData(data);
    setCurrentStep('profile');
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-muted/40">
      <div className="w-full max-w-3xl mx-auto">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            className="mr-2"
            onClick={() => setLocation('/')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6 bg-primary text-primary-foreground">
            <h1 className="text-2xl font-bold text-center">
              Welcome to Heliotrope Imaginal Workshops
            </h1>
            <p className="text-center mt-2 text-primary-foreground/80">
              Complete your registration to access your workshop content
            </p>
          </div>
          
          <Tabs
            defaultValue="verification"
            value={currentStep}
            className="w-full"
            onValueChange={(value) => {
              // Only allow going to profile if invite is verified
              if (value === 'profile' && !inviteData) {
                return;
              }
              setCurrentStep(value as 'verification' | 'profile');
            }}
          >
            <div className="px-6 pt-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="verification" disabled={currentStep === 'profile'}>
                  1. Verify Invite
                </TabsTrigger>
                <TabsTrigger value="profile" disabled={!inviteData}>
                  2. Complete Profile
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="verification" className="p-6">
              <InviteVerification onVerified={handleVerification} />
            </TabsContent>
            
            <TabsContent value="profile" className="p-6">
              {inviteData && (
                <ProfileSetup inviteCode={inviteCode} inviteData={inviteData} />
              )}
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            Already have an account? <a href="/login" className="text-primary underline hover:text-primary/80">Log in</a>
          </p>
          <p className="mt-2">
            Need help? Contact your workshop facilitator or <a href="mailto:support@heliotropeimaginal.com" className="text-primary underline hover:text-primary/80">support@heliotropeimaginal.com</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default InviteRegistration;