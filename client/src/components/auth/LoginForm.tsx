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
  username: z.string().min(1, 'Username is required'),
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
      username: '',
      password: '',
    },
  });
  
  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (data: LoginFormValues) => {
      const response = await apiRequest('POST', '/api/auth/login', data);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }
      return response.json();
    },
    onSuccess: (data) => {
      // Update authentication state
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      
      // Show success message
      toast({
        title: 'Login successful',
        description: `Welcome back, ${data.name}!`,
      });
      
      // Redirect to home page
      navigate('/');
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
      </CardHeader>
      <CardContent>
        {showTestInfo && (
          <Alert className="mb-4 bg-blue-50">
            <InfoIcon className="h-4 w-4 text-blue-700" />
            <AlertTitle className="font-medium text-blue-700">Test Environment</AlertTitle>
            <AlertDescription className="text-blue-800">
              <p className="mt-1">All test accounts use the password <strong>password</strong></p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li><strong>Admin:</strong> username: admin</li>
                <li><strong>Facilitator:</strong> username: facilitator</li>
                <li><strong>Participant:</strong> username: user1 or user2</li>
              </ul>
            </AlertDescription>
          </Alert>
        )}
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your username" {...field} />
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
        <div className="text-sm text-center">
          Don't have an account?{' '}
          <a
            href="/register"
            className="underline text-primary"
            onClick={(e) => {
              e.preventDefault();
              navigate('/register');
            }}
          >
            Register
          </a>
        </div>
        
        {/* Simplified Test User Button */}
        <div className="w-full mt-6">
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => {
              setupTestUsers();
              setShowTestInfo(!showTestInfo);
            }}
          >
            {showTestInfo ? "Hide Test User Info" : "Log in with Test User"}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}