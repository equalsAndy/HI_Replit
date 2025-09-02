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
import { useEffect } from 'react';
import { useLocation } from 'wouter';

// Define the form schema
const profileFormSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  jobTitle: z.string().optional(),
  externalEmail: z.string().email('Invalid email address').optional(),
  password: z.string().min(8, 'Password must be at least 8 characters').regex(/[A-Z]/, 'Must include an uppercase letter').regex(/[a-z]/, 'Must include a lowercase letter').regex(/[0-9]/, 'Must include a number'),
  confirmPassword: z.string().min(8, 'Password must be at least 8 characters').regex(/[A-Z]/, 'Must include an uppercase letter').regex(/[a-z]/, 'Must include a lowercase letter').regex(/[0-9]/, 'Must include a number'),
});

// Ensure passwords match
profileFormSchema.refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

const ProfileSetup: React.FC<{ inviteData: { email: string; name?: string; organization?: string } }> = ({ inviteData }) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [, navigate] = useLocation();

  // Initialize form
  const form = useForm({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      fullName: inviteData.name || '',
      jobTitle: '',
      externalEmail: inviteData.email || '',
      organization: inviteData.organization || '',
      password: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    form.setValue('fullName', inviteData.name || '');
    form.setValue('externalEmail', inviteData.email || '');
    form.setValue('organization', inviteData.organization || '');
  }, [inviteData, form]);

  // Handle form submission
  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      // Handle profile picture upload
      if (profilePicture) {
        // Upload logic here
      }

      // Submit profile data
      // API call to save profile data

      toast({
        title: 'Profile created',
        description: 'Your profile has been successfully created.',
      });

      // Redirect to the login page
      navigate('/auth');
    } catch (error) {
      console.error('Error creating profile:', error);
      toast({
        variant: 'destructive',
        title: 'Profile creation failed',
        description: 'There was a problem creating your profile. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle profile picture change
  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfilePicture(e.target.files[0]);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Create Your Profile</CardTitle>
        <CardDescription className="text-center">
          Set up your account details to complete registration
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Full Name" />
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
                    <Input {...field} placeholder="Your position" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="externalEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>External Email</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="External Email" />
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
                    <Input type="password" {...field} placeholder="Create a secure password" />
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
                    <Input type="password" {...field} placeholder="Confirm your password" />
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
                    <Input {...field} placeholder="Company or Organization" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex flex-col items-center">
              <label htmlFor="profilePicture" className="cursor-pointer">
                <div className="text-center mb-2">Profile Picture</div>
                <div className="border border-dashed border-gray-300 p-4 rounded-full overflow-hidden">
                  {profilePicture ? (
                    <img
                      src={URL.createObjectURL(profilePicture)}
                      alt="Profile"
                      className="h-24 w-24 object-cover rounded-full"
                    />
                  ) : (
                    <div className="h-24 w-24 bg-gray-200 rounded-full flex items-center justify-center">
                      Click to update avatar
                    </div>
                  )}
                </div>
              </label>
              <input
                id="profilePicture"
                type="file"
                accept="image/*"
                onChange={handleProfilePictureChange}
                className="hidden"
              />
              <div className="text-sm text-gray-500 mt-2">Upload a profile picture (optional)</div>
            </div>
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
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center text-sm text-muted-foreground">
        <p>
          If you have any questions, please contact support.
        </p>
      </CardFooter>
    </Card>
  );
};

export default ProfileSetup;