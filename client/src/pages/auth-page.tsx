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
import { Loader2 } from 'lucide-react';

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
      
      // Redirect based on user role and selected app
      if (result.user.role === 'admin') {
        setLocation('/admin');
      } else if (selectedApp) {
        // Redirect to the selected workshop
        if (selectedApp === 'ast') {
          setLocation('/allstarteams');
        } else if (selectedApp === 'imaginal-agility') {
          setLocation('/imaginal-agility');
        } else {
          // Default to dashboard if app is unknown
          setLocation('/dashboard');
        }
      } else {
        // No app selected, go to dashboard
        setLocation('/dashboard');
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

  return (
    <div className="flex flex-col min-h-screen">
      <header className="container mx-auto py-6">
        <div className="flex items-center space-x-2">
          <Link href="/">
            <Button variant="ghost" className="font-semibold text-lg">
              {getAppTitle()}
            </Button>
          </Link>
        </div>
      </header>
      
      <div className="flex-1 flex items-center justify-center p-4">
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