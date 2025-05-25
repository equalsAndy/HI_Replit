import React, { useState } from "react";
import { InviteVerification } from "@/components/auth/InviteVerification";
import { ProfileSetup } from "@/components/auth/ProfileSetup";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Steps, Step } from "@/components/ui/steps";
import { HI_Logo } from "@/components/branding/Logo";

export default function InviteRegistrationPage() {
  const [, navigate] = useLocation();
  const [currentStep, setCurrentStep] = useState(0);
  const [inviteData, setInviteData] = useState<any>(null);

  // Registration mutation
  const registerMutation = useMutation({
    mutationFn: (data: any) =>
      apiRequest("/api/auth/register", {
        method: "POST",
        data,
      }),
    onSuccess: (data) => {
      toast({
        title: "Registration successful",
        description: "Your account has been created successfully.",
      });
      
      // Navigate to the home page or a welcome page
      setTimeout(() => {
        navigate("/");
      }, 1500);
    },
    onError: (error: any) => {
      toast({
        title: "Registration failed",
        description: error.message || "Please check your information and try again.",
        variant: "destructive",
      });
    },
  });

  // Handle invite verification
  const handleInviteVerified = (data: any) => {
    setInviteData({
      ...data,
      inviteCode: data.inviteCode,
    });
    setCurrentStep(1);
  };

  // Handle profile setup
  const handleProfileSetup = (data: any) => {
    registerMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30 p-4">
      <div className="mb-8">
        <HI_Logo className="h-10 w-auto" />
      </div>
      
      <Card className="w-full max-w-2xl shadow-lg">
        <CardContent className="p-6">
          <div className="mb-6">
            <Steps currentStep={currentStep} className="mb-8">
              <Step title="Verify Invite" />
              <Step title="Create Account" />
            </Steps>
          </div>

          {currentStep === 0 && (
            <InviteVerification onVerified={handleInviteVerified} />
          )}

          {currentStep === 1 && (
            <ProfileSetup
              inviteData={inviteData}
              onSubmit={handleProfileSetup}
              isPending={registerMutation.isPending}
            />
          )}
        </CardContent>
      </Card>
      
      <div className="mt-6 text-center text-sm text-muted-foreground">
        <p>
          &copy; {new Date().getFullYear()} Heliotrope Imaginal Workshops. All rights reserved.
        </p>
      </div>
    </div>
  );
}