import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useApplication } from "@/hooks/use-application";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { InviteVerification } from "@/components/auth/InviteVerification";
import { ProfileSetup } from "@/components/auth/ProfileSetup";

// Step 1: Verify invite code
const inviteCodeSchema = z.object({
  inviteCode: z.string().min(12, {
    message: "Invite code must be at least 12 characters.",
  }),
});

// Step 2: Set up password and complete profile
const registerWithInviteSchema = z.object({
  inviteId: z.number(),
  username: z.string().min(3, {
    message: "Username must be at least 3 characters.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
  confirmPassword: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
  title: z.string().optional(),
  organization: z.string().optional(),
  profilePicture: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type InviteCodeValues = z.infer<typeof inviteCodeSchema>;
type RegisterWithInviteValues = z.infer<typeof registerWithInviteSchema>;

export default function InviteRegistration() {
  const [step, setStep] = useState(1);
  const [verifiedInvite, setVerifiedInvite] = useState<any>(null);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { appName, appLogo, appPrimaryColor } = useApplication();

  // Step 1: Verify invite code
  const handleInviteVerified = (invite: any) => {
    setVerifiedInvite(invite);
    setStep(2);
  };

  // Step 2: Register with invite code
  const registerForm = useForm<RegisterWithInviteValues>({
    resolver: zodResolver(registerWithInviteSchema),
    defaultValues: {
      inviteId: 0,
      username: "",
      password: "",
      confirmPassword: "",
      title: "",
      organization: "",
      profilePicture: "",
    },
  });

  // Update form when invite is verified
  useState(() => {
    if (verifiedInvite) {
      registerForm.setValue("inviteId", verifiedInvite.id);
    }
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (data: RegisterWithInviteValues) => {
      const { confirmPassword, ...userData } = data;
      const res = await apiRequest('POST', '/api/auth/register-with-invite', userData);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Registration successful",
        description: "Your account has been created. You can now log in.",
      });
      navigate('/auth');
    },
    onError: (error) => {
      toast({
        title: "Registration failed",
        description: String(error),
        variant: "destructive",
      });
    }
  });

  const onRegisterSubmit = (data: RegisterWithInviteValues) => {
    registerMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <img 
              src={appLogo}
              alt={appName}
              className="h-10 w-auto"
            />
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            {step === 1 ? "Enter Your Invite Code" : "Complete Your Registration"}
          </CardTitle>
          <CardDescription className="text-center">
            {step === 1 
              ? "Please enter the invite code you received" 
              : `Welcome, ${verifiedInvite?.name || "New User"}! Complete your profile to get started.`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 1 ? (
            <InviteVerification onInviteVerified={handleInviteVerified} />
          ) : (
            <ProfileSetup 
              inviteData={verifiedInvite}
              onSubmit={onRegisterSubmit}
              isPending={registerMutation.isPending}
            />
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <div className="text-sm text-gray-500 text-center">
            {step === 1 ? (
              "Don't have an invite code? Contact your administrator."
            ) : (
              "By completing registration, you agree to our Terms of Service and Privacy Policy."
            )}
          </div>
          {step === 1 && (
            <div className="text-sm text-center">
              <a href="/auth" className="text-blue-600 hover:underline">
                Back to login
              </a>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}