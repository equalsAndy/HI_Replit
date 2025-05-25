
import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
          body: JSON.stringify(data),
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
      queryClient.invalidateQueries({ queryKey: ['/api/user/profile'] });
      
      // Show success message
      toast({
        title: 'Login successful',
        description: `Welcome back, ${data.user.name || 'User'}!`,
      });
      
      // Check if we should redirect to a specific workshop
      const selectedWorkshop = sessionStorage.getItem('selectedWorkshop');
      
      if (selectedWorkshop) {
        // Clear the stored selection
        sessionStorage.removeItem('selectedWorkshop');
        
        // Redirect to the appropriate workshop
        if (selectedWorkshop === 'allstarteams') {
          navigate('/workshop/allstarteams');
        } else if (selectedWorkshop === 'imaginalagility') {
          navigate('/workshop/imaginalagility');
        } else {
          navigate('/dashboard');
        }
      } else {
        // No stored workshop selection, go to dashboard
        navigate('/dashboard');
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
          <p className="mt-2 text-blue-700">All test accounts use the password <strong>password</strong></p>
          <p className="mt-2 text-blue-700 italic">You can now log in using either username or email</p>
          <ul className="mt-2 space-y-1 text-blue-700">
            <li><strong>Admin:</strong> username: admin</li>
            <li><strong>Facilitator:</strong> username: facilitator</li>
            <li><strong>Participant:</strong> username: user1 or user2</li>
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
                    <Input
                      type="password"
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
