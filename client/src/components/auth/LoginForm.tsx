import React, { useState, useEffect } from 'react';
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
import { Loader2, User } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Login form schema
const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [testUsers, setTestUsers] = useState<{username: string; role: string; name: string}[]>([]);
  
  // Fetch test users
  const { data: testUsersData, isLoading: isLoadingTestUsers } = useQuery({
    queryKey: ['/api/auth/test-users'],
    onSuccess: (data) => {
      if (data) {
        setTestUsers(data);
      }
    },
  });
  
  // Initialize react-hook-form
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });
  
  // Function to select a test user
  const selectTestUser = (username: string) => {
    form.setValue('username', username);
    form.setValue('password', 'password'); // Default password for test users
  };
  
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
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Login</CardTitle>
        <CardDescription>
          Enter your username and password to access your account
        </CardDescription>
      </CardHeader>
      <CardContent>
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
        <div className="text-sm text-center mt-2">
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
        
        {/* Test Users Section */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium mb-2">Quick Login (Test Users)</h4>
          <Select onValueChange={selectTestUser}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a test user" />
            </SelectTrigger>
            <SelectContent>
              {testUsers.map((user) => (
                <SelectItem key={user.username} value={user.username}>
                  {user.name} ({user.role})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500 mt-1">
            Password for all test users: "password"
          </p>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full mt-2"
            onClick={async () => {
              try {
                await apiRequest('POST', '/api/auth/setup-test-users', {});
                toast({
                  title: 'Test Users Created',
                  description: 'All test users have been created successfully.',
                });
              } catch (error) {
                console.error('Failed to setup test users:', error);
                toast({
                  title: 'Setup Failed',
                  description: 'Failed to create test users. Please try again.',
                  variant: 'destructive',
                });
              }
            }}
          >
            Setup Test Users
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}