
import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from 'lucide-react';

// Login form schema
const loginSchema = z.object({
  identifier: z.string().min(1, 'Username or email is required'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [showTestInfo, setShowTestInfo] = useState(false);
  

  // Initialize react-hook-form
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: '',
      password: '',
    },
  });
  
  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (data: LoginFormValues) => {
      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            identifier: data.identifier,
            username: data.identifier,
            password: data.password,
          }),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Login failed');
        }
        
        return await response.json();
      } catch (error) {
        console.error('Login error:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      // Update authentication state
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      
      // Set fresh login flag for beta tester welcome modal
      if (data.user.isBetaTester && data.user.id) {
        sessionStorage.setItem(`beta_fresh_login_${data.user.id}`, 'true');
      }
      
      // Show success message
      toast({
        title: 'Login successful',
        description: `Welcome back, ${data.user.name || 'User'}!`,
      });
      
      // Route users based on their role and user type
      if (data.user.role === 'admin') {
        // Admins go to admin console
        navigate('/admin');
        return;
      }
      
      if (data.user.role === 'facilitator') {
        // Facilitators go to dashboard/console
        navigate('/dashboard');
        return;
      }
      
      if (data.user.isTestUser) {
        // Test users go to dashboard/console
        navigate('/dashboard');
        return;
      }
      
      // Beta testers and regular users go directly to workshops
      // Clear any stored return URL to prevent session manager override
      sessionStorage.removeItem('returnUrl');
      
      if (data.user.isBetaTester || !data.user.isTestUser) {
        if (data.user.astAccess) {
          navigate('/allstarteams');
        } else if (data.user.iaAccess) {
          navigate('/imaginal-agility');
        } else {
          // Check if we should redirect to a specific workshop
          const selectedWorkshop = sessionStorage.getItem('selectedWorkshop');
          
          if (selectedWorkshop) {
            // Clear the stored selection
            sessionStorage.removeItem('selectedWorkshop');
            
            // Redirect to the appropriate workshop
            if (selectedWorkshop === 'allstarteams') {
              navigate('/allstarteams');
            } else if (selectedWorkshop === 'imaginalagility') {
              navigate('/imaginal-agility');
            } else {
              // Default to AllStarTeams for regular users
              navigate('/allstarteams');
            }
          } else {
            // Default to AllStarTeams for regular users
            navigate('/allstarteams');
          }
        }
        return;
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Login failed',
        description: error.message || 'Invalid username or password',
        variant: 'destructive',
      });
    },
  });
  
  // Form submission handler
  const onSubmit = (data: LoginFormValues) => {
    // Use credentials-based login via API to establish session
    loginMutation.mutate(data);
  };
  
  // Set up test users if needed
  const setupTestUsers = async () => {
    try {
      await apiRequest('POST', '/api/auth/setup-test-users', {});
      toast({
        title: 'Test Users Created',
        description: 'All test users have been created successfully.',
      });
      setShowTestInfo(true);
    } catch (error) {
      console.error('Failed to setup test users:', error);
      toast({
        title: 'Setup Failed',
        description: 'Failed to create test users. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Sign in to continue your journey</CardTitle>
        <CardDescription>
          Enter your username and password to access your account
        </CardDescription>
        <Button 
          variant="outline" 
          type="button"
          onClick={() => {
            setShowTestInfo(!showTestInfo);
            if (!showTestInfo) {
              // Open test user picker when button is clicked
              const modal = document.querySelector('[role="dialog"]');
              if (!modal) {
                const testUserPickerModal = document.createElement('div');
                testUserPickerModal.setAttribute('role', 'dialog');
                document.body.appendChild(testUserPickerModal);
              }
            }
          }}
          className="text-sm"
        >
          {showTestInfo ? "Hide Test User Info" : "Test User Info"}
        </Button>
      </CardHeader>

      {showTestInfo && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium text-blue-800">Test Environment</h3>
          <p className="mt-2 text-blue-700">Admin login: <strong>admin / Heliotrope@2025</strong></p>
          <p className="mt-2 text-blue-700 italic">You can use either username or email to login</p>
          <Alert className="mt-2 bg-amber-50 border-amber-200">
            <InfoIcon className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-amber-700">Production Access</AlertTitle>
            <AlertDescription className="text-amber-700">
              For production admin access, use the credentials provided by your administrator.
            </AlertDescription>
          </Alert>
          <ul className="mt-4 space-y-1 text-blue-700">
            <li><strong>Admin:</strong> username: admin</li>
            <li><strong>Facilitators:</strong> username: facilitator1, facilitator2</li>
            <li><strong>Participants:</strong> username: participant1, participant2, participant3</li>
          </ul>
        </div>
      )}

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="identifier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username or Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your username or email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <PasswordInput
                      placeholder="Enter your password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button
              type="submit"
              className="w-full"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                'Login'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col">
      </CardFooter>
    </Card>
  );
}
