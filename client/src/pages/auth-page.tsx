import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useApplication } from "@/hooks/use-application";
import { insertUserSchema } from "@shared/schema";
import { TestUserPicker } from "@/components/test-users/TestUserPicker";
import { LoginForm } from "@/components/auth/LoginForm";

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

const loginSchema = z.object({
  username: z.string().min(1, {
    message: "Username is required.",
  }),
  password: z.string().min(1, {
    message: "Password is required.",
  }),
});

const registerSchema = insertUserSchema
  .omit({ progress: true })
  .extend({
    password: z.string().min(6, {
      message: "Password must be at least 6 characters.",
    }),
    confirmPassword: z.string().min(6, {
      message: "Password must be at least 6 characters.",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type LoginValues = z.infer<typeof loginSchema>;
type RegisterValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showTestUsers, setShowTestUsers] = useState(false);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { currentApp, appName, appLogo, appPrimaryColor } = useApplication();

  // We don't need to fetch test users here anymore, that's done in the TestUserPicker component

  // Debug current application state
  console.log('Auth page - currentApp:', currentApp, 'appName:', appName);

  // Check if user is already logged in
  const { data: user, isLoading } = useQuery({
    queryKey: ['/api/user/profile'],
    staleTime: Infinity,
  });

  // Use useEffect for navigation to avoid React hook violations
  useEffect(() => {
    if (!isLoading && user) {
      navigate('/user-home2-refactored');
    }
  }, [isLoading, user, navigate]);

  // Login form
  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "user1", // Set default username to first test user
      password: "password", // Set default password for test accounts
    },
  });

  // Register form
  const registerForm = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      username: "",
      title: "",
      organization: "",
      applicationId: currentApp === 'allstarteams' ? 1 : 2, // Set application ID based on current app
      password: "",
      confirmPassword: "",
    },
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (data: LoginValues) => {
      try {
        const res = await apiRequest('POST', '/api/auth/login', data);

        // Check if the response is OK
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Invalid credentials");
        }

        return await res.json();
      } catch (err) {
        // Rethrow the error with a clear message
        throw new Error(err instanceof Error ? err.message : "Login failed. Please check your credentials.");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/profile'] });
      navigate('/user-home2-refactored');
    },
    onError: (error) => {
      toast({
        title: "Login failed",
        description: String(error),
        variant: "destructive",
      });
    }
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (data: RegisterValues) => {
      const { confirmPassword, ...userData } = data;
      // Ensure applicationId is set based on current selection
      userData.applicationId = currentApp === 'allstarteams' ? 1 : 2;
      const res = await apiRequest('POST', '/api/auth/register', userData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/profile'] });
      navigate('/user-home2-refactored');
    },
    onError: (error) => {
      toast({
        title: "Registration failed",
        description: String(error),
        variant: "destructive",
      });
    }
  });

  // Form submit handlers
  const onLoginSubmit = (data: LoginValues) => {
    loginMutation.mutate(data);
  };

  const onRegisterSubmit = (data: RegisterValues) => {
    registerMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center p-8 lg:p-16">
        <div className="mb-8">
          <img 
            src={appLogo}
            alt={appName}
            className="h-10 w-auto mb-8"
          />
          <h1 className="text-3xl font-bold mb-2">
            {isLogin ? "Welcome back" : "Create an account"}
          </h1>
          <p className="text-gray-600">
            {isLogin 
              ? "Sign in to continue your journey" 
              : currentApp === 'allstarteams'
                ? "Start discovering your strengths today"
                : "Begin your Imaginal Agility journey"
            }
          </p>
        </div>

        {/* Information Message */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <h3 className="font-medium text-blue-800 mb-1">Test Environment</h3>
          <p className="text-sm text-blue-600">
            This is a test environment. Please use the "Select Test User" button below to log in.
          </p>
        </div>

        {/* Login Form */}
        {isLogin && (
          <div className="space-y-6">
              <LoginForm />
            </div>
        )}

        {/* Register Form */}
        {!isLogin && (
          <Form {...registerForm}>
            <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
              <FormField
                control={registerForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Select a test user instead" 
                        {...field} 
                        disabled={true}
                        className="bg-gray-100 text-gray-500 cursor-not-allowed"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={registerForm.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Select a test user instead" 
                        {...field} 
                        disabled={true}
                        className="bg-gray-100 text-gray-500 cursor-not-allowed"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={registerForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Title</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Select a test user instead" 
                        {...field} 
                        disabled={true}
                        className="bg-gray-100 text-gray-500 cursor-not-allowed"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={registerForm.control}
                name="organization"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organization</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Select a test user instead" 
                        {...field} 
                        disabled={true}
                        className="bg-gray-100 text-gray-500 cursor-not-allowed"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={registerForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="Select a test user instead" 
                        {...field} 
                        disabled={true}
                        className="bg-gray-100 text-gray-500 cursor-not-allowed"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={registerForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="Select a test user instead" 
                        {...field} 
                        disabled={true}
                        className="bg-gray-100 text-gray-500 cursor-not-allowed"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button 
                type="button"
                className="w-full bg-gray-400 hover:bg-gray-500 cursor-not-allowed"
                disabled={true}
              >
                Registration Disabled
              </Button>
            </form>
          </Form>
        )}

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            {isLogin ? "" : "Already have an account? "}
            <button 
              onClick={() => setIsLogin(!isLogin)} 
              className={`${currentApp === 'allstarteams' ? 'text-indigo-600 hover:text-indigo-800' : 'text-purple-600 hover:text-purple-800'} font-medium ${isLogin ? 'hidden' : ''}`}
              style={{ display: isLogin ? 'none' : 'inline' }}
            >
              {isLogin ? "Create one" : "Sign in"}
            </button>
          </p>

          <div className="mt-4 pt-4 border-t">
            <Button 
              variant="outline" 
              type="button"
              onClick={() => setShowTestUsers(!showTestUsers)}
              className="text-sm"
            >
              {showTestUsers ? "Hide Test User Info" : "Login with Test User"}
            </Button>
          </div>
        </div>

        {/* Test User Picker - only shown when needed */}
        {showTestUsers && (
          <TestUserPicker
            open={showTestUsers}
            onClose={() => setShowTestUsers(false)}
          />
        )}
      </div>

      {/* Right side - Hero */}
      <div className={`hidden lg:block lg:w-1/2 ${currentApp === 'allstarteams' ? 'bg-indigo-600' : 'bg-purple-600'}`}>
        <div className="h-full flex flex-col justify-center p-16 text-white">
          {currentApp === 'allstarteams' ? (
            <>
              <h2 className="text-4xl font-bold mb-6">Discover your strengths and transform your team</h2>
              <p className="text-lg mb-8">
                The AllStarTeams platform helps you identify your natural talents and how they 
                combine with others to create high-performing teams.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Personalized strengths assessment</span>
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Interactive team dynamics visualization</span>
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Action-oriented development plans</span>
                </li>
              </ul>
            </>
          ) : (
            <>
              <h2 className="text-4xl font-bold mb-6">Develop your imagination and transform your work</h2>
              <p className="text-lg mb-8">
                Imaginal Agility helps you cultivate essential human capabilities to navigate 
                complexity and create innovative solutions to challenging problems.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Interactive 5Cs capability assessment</span>
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Detailed data visualizations and insights</span>
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Collaborative team workshop materials</span>
                </li>
              </ul>
            </>
          )}
        </div>
      </div>
    </div>
  );
}