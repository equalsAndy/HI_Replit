import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Loader2, CheckCircle, AlertCircle, EyeIcon, EyeOffIcon } from 'lucide-react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Username and password requirements
const usernamePattern = /^[a-z0-9][a-z0-9_\-]*[a-z0-9]$/i;
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

// Reserved usernames
const RESERVED_USERNAMES = [
  'admin', 'system', 'test', 'support', 'help', 'api', 'root'
];

// Profile setup schema
const profileSetupSchema = z.object({
  inviteCode: z.string(),
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username cannot exceed 20 characters')
    .regex(usernamePattern, 'Username must start and end with letter or number, and contain only letters, numbers, underscores, and hyphens')
    .refine(username => !RESERVED_USERNAMES.includes(username.toLowerCase()), 'This username is reserved'),
  name: z.string().min(1, 'Name is required'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(passwordPattern, 'Password must include uppercase, lowercase, number, and special character'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
  organization: z.string().max(30, 'Organization cannot exceed 30 characters').optional(),
  jobTitle: z.string().max(30, 'Job title cannot exceed 30 characters').optional(),
  profilePicture: z.string().optional(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type ProfileSetupFormValues = z.infer<typeof profileSetupSchema>;

interface ProfileSetupProps {
  inviteData: {
    inviteCode: string;
    name: string;
    email: string;
    expiresAt: string;
  };
  onRegistrationComplete: () => void;
}

export function ProfileSetup({ inviteData, onRegistrationComplete }: ProfileSetupProps) {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [validatingUsername, setValidatingUsername] = useState(false);
  
  // Form definition
  const form = useForm<ProfileSetupFormValues>({
    resolver: zodResolver(profileSetupSchema),
    defaultValues: {
      inviteCode: inviteData.inviteCode,
      name: inviteData.name,
      username: '',
      password: '',
      confirmPassword: '',
      organization: '',
      jobTitle: '',
      profilePicture: '',
    }
  });
  
  // Username validation mutation
  const validateUsernameMutation = useMutation({
    mutationFn: async (username: string) => {
      const response = await apiRequest('POST', '/api/auth/validate-username', { username });
      return response.json();
    },
    onSuccess: (data) => {
      setUsernameAvailable(data.valid);
      if (!data.valid) {
        form.setError('username', { 
          type: 'validate', 
          message: data.message || 'Username is not available' 
        });
      } else {
        form.clearErrors('username');
      }
    },
    onError: () => {
      setUsernameAvailable(false);
      form.setError('username', { 
        type: 'validate', 
        message: 'Error checking username availability' 
      });
    },
    onSettled: () => {
      setValidatingUsername(false);
    }
  });
  
  // Check username availability when it changes
  const username = form.watch('username');
  useEffect(() => {
    if (username && username.length >= 3 && usernamePattern.test(username)) {
      const timer = setTimeout(() => {
        setValidatingUsername(true);
        validateUsernameMutation.mutate(username);
      }, 500);
      
      return () => clearTimeout(timer);
    } else {
      setUsernameAvailable(null);
    }
  }, [username]);
  
  // Registration mutation
  const registerMutation = useMutation({
    mutationFn: async (data: ProfileSetupFormValues) => {
      const response = await apiRequest('POST', '/api/auth/register-with-invite', {
        inviteCode: data.inviteCode,
        username: data.username,
        password: data.password,
        name: data.name,
        organization: data.organization,
        jobTitle: data.jobTitle,
        profilePicture: data.profilePicture,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Registration successful',
        description: 'Your account has been created.',
      });
      
      onRegistrationComplete();
      setLocation('/dashboard');
    },
    onError: (error: any) => {
      console.error('Error registering user:', error);
      toast({
        title: 'Registration failed',
        description: error.message || 'Failed to register. Please try again.',
        variant: 'destructive',
      });
    }
  });
  
  const onSubmit = async (data: ProfileSetupFormValues) => {
    setIsSubmitting(true);
    try {
      await registerMutation.mutateAsync(data);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Generate initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
        <CardDescription>
          Set up your account to start using the platform
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex justify-center mb-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={form.watch('profilePicture')} alt="Profile picture" />
                <AvatarFallback className="text-xl">
                  {getInitials(form.watch('name'))}
                </AvatarFallback>
              </Avatar>
            </div>
            
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="organization"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organization (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        value={field.value || ''}
                        placeholder="Your organization" 
                      />
                    </FormControl>
                    <FormDescription>30 characters maximum</FormDescription>
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
                        {...field} 
                        value={field.value || ''}
                        placeholder="Your role" 
                      />
                    </FormControl>
                    <FormDescription>30 characters maximum</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input 
                        {...field}
                        placeholder="Choose a unique username"
                        className="pr-10"
                      />
                    </FormControl>
                    {validatingUsername && (
                      <Loader2 className="h-4 w-4 animate-spin absolute right-3 top-3 text-muted-foreground" />
                    )}
                    {usernameAvailable === true && !validatingUsername && (
                      <CheckCircle className="h-4 w-4 absolute right-3 top-3 text-green-500" />
                    )}
                    {usernameAvailable === false && !validatingUsername && (
                      <AlertCircle className="h-4 w-4 absolute right-3 top-3 text-red-500" />
                    )}
                  </div>
                  <FormDescription>
                    3-20 characters, letters, numbers, hyphens, and underscores only
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input 
                          {...field}
                          type={showPassword ? "text" : "password"}
                          className="pr-10"
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOffIcon className="h-4 w-4" />
                        ) : (
                          <EyeIcon className="h-4 w-4" />
                        )}
                        <span className="sr-only">
                          {showPassword ? "Hide password" : "Show password"}
                        </span>
                      </Button>
                    </div>
                    <FormDescription>
                      8+ characters with uppercase, lowercase, number, and special character
                    </FormDescription>
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
                        {...field}
                        type={showPassword ? "text" : "password"}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="pt-2">
              <Button 
                type="submit" 
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Complete Registration
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <div className="text-sm text-muted-foreground">
          Your account will be linked to: <span className="font-medium">{inviteData.email}</span>
        </div>
      </CardFooter>
    </Card>
  );
}