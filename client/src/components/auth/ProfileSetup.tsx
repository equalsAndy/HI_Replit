import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

// Define the form schema
const profileFormSchema = z
  .object({
    username: z
      .string()
      .min(3, 'Username must be at least 3 characters')
      .max(50, 'Username cannot exceed 50 characters')
      .regex(/^[a-zA-Z0-9._-]+$/, 'Username can only contain letters, numbers, and ._-'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/.*[A-Z].*/, 'Password must contain at least one uppercase letter')
      .regex(/.*[a-z].*/, 'Password must contain at least one lowercase letter')
      .regex(/.*\d.*/, 'Password must contain at least one number'),
    confirmPassword: z.string(),
    name: z.string().min(1, 'Name is required'),
    organization: z.string().optional(),
    jobTitle: z.string().optional(),
    profilePicture: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface ProfileSetupProps {
  inviteData: {
    inviteCode: string;
    email: string;
    role: string;
    name?: string;
  };
  onComplete: () => void;
}

const ProfileSetup: React.FC<ProfileSetupProps> = ({ inviteData, onComplete }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Initialize form
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: '',
      password: '',
      confirmPassword: '',
      name: inviteData.name || '',
      organization: '',
      jobTitle: '',
      profilePicture: '',
    },
  });

  // Handle form submission
  const onSubmit = async (data: ProfileFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Register the user with the API
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          inviteCode: inviteData.inviteCode,
          username: data.username,
          password: data.password,
          name: data.name,
          email: inviteData.email,
          role: inviteData.role,
          organization: data.organization || null,
          jobTitle: data.jobTitle || null,
          profilePicture: data.profilePicture || null,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const result = await response.json();
      
      if (!result.success) {
        toast({
          variant: 'destructive',
          title: 'Registration failed',
          description: result.error || 'Failed to create your account',
        });
        setIsSubmitting(false);
        return;
      }
      
      // Show success message and call the onComplete callback
      toast({
        title: 'Account created',
        description: 'Your account has been successfully created.',
      });
      
      onComplete();
    } catch (error) {
      console.error('Error creating account:', error);
      toast({
        variant: 'destructive',
        title: 'Registration failed',
        description: 'There was a problem creating your account. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if a username is available
  const checkUsernameAvailability = async (username: string) => {
    if (username.length < 3) return;
    
    try {
      const response = await fetch('/api/auth/check-username', {
        method: 'POST',
        body: JSON.stringify({ username }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const result = await response.json();
      
      if (!result.success) {
        form.setError('username', {
          type: 'manual',
          message: 'Error checking username availability',
        });
        return;
      }
      
      if (!result.available) {
        form.setError('username', {
          type: 'manual',
          message: 'Username is already taken',
        });
      }
    } catch (error) {
      console.error('Error checking username availability:', error);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Create Your Profile</CardTitle>
        <CardDescription className="text-center">
          Set up your account details to complete registration
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="username"
                        disabled={isSubmitting}
                        onBlur={(e) => {
                          field.onBlur();
                          checkUsernameAvailability(e.target.value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="John Doe" disabled={isSubmitting} />
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
                        {...field}
                        type="password"
                        placeholder="••••••••"
                        disabled={isSubmitting}
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
                        {...field}
                        type="password"
                        placeholder="••••••••"
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="organization"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organization</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Company or Organization"
                        disabled={isSubmitting}
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
                    <FormLabel>Job Title</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Your position"
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="mt-6">
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center text-sm text-muted-foreground">
        <p>
          You're registering with email: <strong>{inviteData.email}</strong>
        </p>
      </CardFooter>
    </Card>
  );
};

export default ProfileSetup;