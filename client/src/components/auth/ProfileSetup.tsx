import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Schema for profile setup validation
const profileSchema = z.object({
  username: z.string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username cannot exceed 20 characters"),
  password: z.string()
    .min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  name: z.string()
    .min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  organization: z.string().optional(),
  jobTitle: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface ProfileSetupProps {
  inviteData: {
    id: number;
    email: string;
    role: string;
    name?: string;
    inviteCode: string;
  };
  onComplete: (userData: any) => void;
}

export function ProfileSetup({ inviteData, onComplete }: ProfileSetupProps) {
  const [error, setError] = useState<string | null>(null);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);

  // Form setup
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: '',
      password: '',
      confirmPassword: '',
      name: inviteData.name || '',
      email: inviteData.email, // Pre-fill from invite data and make readonly
      organization: '',
      jobTitle: '',
    },
  });

  // Check username availability with debounce
  const checkUsername = async (username: string) => {
    if (username.length < 3) {
      return;
    }

    setIsCheckingUsername(true);
    setUsernameAvailable(null);

    try {
      const response = await fetch('/api/auth/check-username', {
        method: 'POST',
        body: JSON.stringify({ username }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      setUsernameAvailable(data.available);
    } catch (err) {
      console.error('Error checking username:', err);
    } finally {
      setIsCheckingUsername(false);
    }
  };

  // Register with invite code mutation
  const registerMutation = useMutation({
    mutationFn: async (data: ProfileFormValues) => {
      // Remove confirmPassword before sending to API
      const { confirmPassword, ...registerData } = data;
      
      const response = await fetch('/api/auth/register-with-invite', {
        method: 'POST',
        body: JSON.stringify({
          ...registerData,
          inviteCode: inviteData.inviteCode,
          role: inviteData.role,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Registration failed');
      }
      
      const responseData = await response.json();
      return responseData.user;
    },
    onSuccess: (userData) => {
      onComplete(userData);
    },
    onError: (error: Error) => {
      setError(error.message || 'An error occurred during registration');
    },
  });

  // Form submission handler
  const onSubmit = (data: ProfileFormValues) => {
    setError(null);
    registerMutation.mutate(data);
  };

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Create Your Account</CardTitle>
        <CardDescription>
          Complete your profile information to create your account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        placeholder="Choose a username" 
                        {...field} 
                        onChange={(e) => {
                          field.onChange(e);
                          checkUsername(e.target.value);
                        }}
                      />
                      {field.value.length >= 3 && (
                        <div className="absolute right-3 top-2.5 text-xs">
                          {isCheckingUsername ? (
                            <span className="text-gray-400">Checking...</span>
                          ) : usernameAvailable === true ? (
                            <span className="text-green-600">Available</span>
                          ) : usernameAvailable === false ? (
                            <span className="text-red-600">Taken</span>
                          ) : null}
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input 
                        type="password"
                        placeholder="Create a password" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input 
                        type="password"
                        placeholder="Confirm your password" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter your full name" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Your email address" 
                      {...field} 
                      disabled // Email from invite cannot be changed
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="organization"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organization (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Your organization" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="jobTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Title (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Your job title" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={registerMutation.isPending || usernameAvailable === false}
            >
              {registerMutation.isPending ? "Creating Account..." : "Create Account"}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col">
        <p className="text-sm text-muted-foreground text-center">
          Your account will be created with {inviteData.role} access.
        </p>
      </CardFooter>
    </Card>
  );
}