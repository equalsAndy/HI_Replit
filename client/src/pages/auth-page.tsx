import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'wouter';
import { Loader2, AlertCircle, X } from 'lucide-react';
import { queryClient } from '@/lib/queryClient';
import HiLogo from '@/assets/HI_Logo_horizontal.png';
import AllStarTeamsLogo from '@/assets/all-star-teams-logo-250px.png';
import ImaginalAgilityLogo from '@/assets/imaginal_agility_logo_nobkgrd.png';
import { useSessionMessage, useSessionManager } from '@/hooks/use-session-manager';

// Define the login form schema
const loginFormSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

const AuthPage: React.FC = () => {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedApp, setSelectedApp] = useState<string | null>(null);
  const { message: sessionMessage, clearMessage } = useSessionMessage();
  const { redirectToReturnUrl } = useSessionManager();

  // Parse URL parameters to get the app selection
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const app = searchParams.get('app');
    if (app) {
      setSelectedApp(app);
      // Store the app selection in sessionStorage for use after login
      sessionStorage.setItem('selectedApp', app);
    } else {
      // Check if there's a previously selected app in sessionStorage
      const storedApp = sessionStorage.getItem('selectedApp');
      if (storedApp) {
        setSelectedApp(storedApp);
      }
    }
  }, [location]);

  // Initialize form
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  // Handle form submission
  const onSubmit = async (data: LoginFormValues) => {
    setIsLoggingIn(true);
    
    try {
      // Authenticate with the API
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          username: data.username,
          password: data.password,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const result = await response.json();
      
      if (!result.success) {
        toast({
          variant: 'destructive',
          title: 'Login failed',
          description: result.error || 'Invalid username or password',
        });
        setIsLoggingIn(false);
        return;
      }
      
      // Show success message
      toast({
        title: 'Login successful',
        description: `Welcome back, ${result.user.name}!`,
      });
      
      // Force refresh of user data to prevent session manager confusion
      await queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      
      // Small delay to ensure user data is updated before redirect
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Route users based on their role and user type
      if (result.user.role === 'admin') {
        // Admins go to admin console
        setLocation('/admin');
        return;
      }
      
      if (result.user.role === 'facilitator') {
        // Facilitators go to dashboard/console
        setLocation('/dashboard');
        return;
      }
      
      if (result.user.isTestUser) {
        // Test users go to dashboard/console
        setLocation('/dashboard');
        return;
      }
      
      // Beta testers and regular users go directly to workshops
      // Clear any stored return URL to prevent redirect to dashboard
      sessionStorage.removeItem('returnUrl');
      
      if (result.user.isBetaTester || !result.user.isTestUser) {
        if (result.user.astAccess) {
          setLocation('/allstarteams');
        } else if (result.user.iaAccess) {
          setLocation('/imaginal-agility');
        } else if (selectedApp) {
          // Use selected app if no explicit access defined
          if (selectedApp === 'ast') {
            setLocation('/allstarteams');
          } else if (selectedApp === 'imaginal-agility') {
            setLocation('/imaginal-agility');
          } else {
            // Default to AllStarTeams for regular users
            setLocation('/allstarteams');
          }
        } else {
          // Default to AllStarTeams for regular users
          setLocation('/allstarteams');
        }
        return;
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        variant: 'destructive',
        title: 'Login failed',
        description: 'There was a problem logging in. Please try again.',
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Get app-specific title
  const getAppTitle = () => {
    if (selectedApp === 'ast') {
      return 'AllStar Teams Workshop';
    } else if (selectedApp === 'imaginal-agility') {
      return 'Imaginal Agility Workshop';
    }
    return 'Heliotrope Imaginal Workshops';
  };

  // Get session message display text
  const getSessionMessageText = (message: string) => {
    switch (message) {
      case 'logged-out':
        return 'You have been logged out';
      case 'session-expired':
        return 'Your session has expired';
      case 'session-timeout':
        return 'Session timed out due to inactivity';
      case 'login-required':
        return 'Please log in to continue';
      case 'server-restart':
        return 'Please log in again';
      case 'permission-denied':
        return 'Access denied - please log in';
      default:
        return 'Please log in to continue';
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="container mx-auto py-6">
        <div className="flex flex-col items-center space-y-4">
          {/* Main HI Logo */}
          <Link href="/">
            <img 
              src={HiLogo} 
              alt="Heliotrope Imaginal"
              className="h-12 w-auto"
            />
          </Link>
          
          {/* Workshop Logos */}
          <div className="flex items-center space-x-8">
            <img 
              src={AllStarTeamsLogo} 
              alt="AllStarTeams" 
              className="h-10 w-auto opacity-80"
            />
            <img 
              src={ImaginalAgilityLogo} 
              alt="Imaginal Agility" 
              className="h-10 w-auto opacity-80"
            />
          </div>
        </div>
      </header>
      
      <div className="flex-1 flex items-center justify-center p-4">
        {/* Session Message Banner */}
        {sessionMessage && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-blue-600" />
                  <span className="text-blue-800 font-medium">
                    {getSessionMessageText(sessionMessage)}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearMessage}
                  className="h-6 w-6 p-0 text-blue-600 hover:text-blue-800"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
        
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Log In</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access your workshop
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
                        <Input 
                          {...field} 
                          placeholder="Enter your username"
                          disabled={isLoggingIn}
                        />
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
                          {...field}
                          placeholder="••••••••"
                          disabled={isLoggingIn}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isLoggingIn}>
                  {isLoggingIn ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    'Log in'
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2 text-center text-sm text-muted-foreground">
            <div className="flex items-center justify-center">
              <p>Don't have an account?</p>
              <Button variant="link" asChild className="p-0 pl-2 h-auto">
                <Link href="/register">Register with an invite code</Link>
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default AuthPage;