import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { useEffect } from 'react';
import { useLocation } from 'wouter';

// Define the form schema
const profileFormSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  jobTitle: z.string().optional(),
  organization: z.string().optional(),
  externalEmail: z.string().email('Invalid email address').optional(),
  password: z.string().min(8, 'Password must be at least 8 characters').regex(/[A-Z]/, 'Must include an uppercase letter').regex(/[a-z]/, 'Must include a lowercase letter').regex(/[0-9]/, 'Must include a number'),
  confirmPassword: z.string().min(8, 'Password must be at least 8 characters').regex(/[A-Z]/, 'Must include an uppercase letter').regex(/[a-z]/, 'Must include a lowercase letter').regex(/[0-9]/, 'Must include a number'),
});

// Ensure passwords match
profileFormSchema.refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

const ProfileSetup: React.FC<{ inviteData: { email: string; name?: string; jobTitle?: string; organization?: string; inviteCode?: string } ; onComplete?: () => void }> = ({ inviteData, onComplete }) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [, navigate] = useLocation();

  // Initialize form
  const form = useForm({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      fullName: inviteData.name || '',
      jobTitle: inviteData.jobTitle || '',
      externalEmail: inviteData.email || '',
      organization: inviteData.organization || '',
      password: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    form.setValue('fullName', inviteData.name || '');
    form.setValue('jobTitle', inviteData.jobTitle || '');
    form.setValue('externalEmail', inviteData.email || '');
    form.setValue('organization', inviteData.organization || '');
  }, [inviteData, form]);

  // Convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  // Handle form submission
  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      // Convert profile picture to base64 if selected
      let profilePictureBase64 = null;
      if (profilePicture) {
        try {
          profilePictureBase64 = await fileToBase64(profilePicture);
          console.log('🔍 Profile picture converted to base64, length:', profilePictureBase64.length);
        } catch (error) {
          console.error('Error converting profile picture to base64:', error);
          // Continue without profile picture if conversion fails
        }
      }

      const payload = {
        inviteCode: (inviteData as any).inviteCode,
        username: (data.externalEmail || inviteData.email),
        password: data.password,
        name: data.fullName,
        email: (data.externalEmail || inviteData.email),
        organization: data.organization || inviteData.organization || '',
        jobTitle: data.jobTitle || '',
        profilePicture: profilePictureBase64
      };

      console.log('🔍 Registration payload:', payload);

      const resp = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      console.log('🔍 Registration response status:', resp.status);
      const result = await resp.json();
      console.log('🔍 Registration response:', result);

      if (!resp.ok || result.success === false) {
        throw new Error(result.error || 'Registration failed');
      }

      toast({ title: 'Profile created', description: 'Your account has been created.' });
      if (onComplete) onComplete();
      // Optionally route now that session is established
      // navigate('/dashboard');
    } catch (error) {
      console.error('Error creating profile:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast({
        variant: 'destructive',
        title: 'Profile creation failed',
        description: `There was a problem creating your profile: ${errorMessage}`,
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
            {/* Profile Picture Section - Moved to top */}
            <div className="flex flex-col items-center mb-6">
              <label htmlFor="profilePicture" className="cursor-pointer">
                <div className="relative">
                  {profilePicture ? (
                    <img
                      src={URL.createObjectURL(profilePicture)}
                      alt="Profile"
                      className="h-24 w-24 object-cover rounded-full border-4 border-blue-100 hover:border-blue-300 transition-colors"
                    />
                  ) : (
                    <div className="h-24 w-24 bg-gradient-to-br from-blue-50 to-blue-100 rounded-full flex items-center justify-center border-4 border-blue-100 hover:border-blue-300 transition-colors">
                      <span className="text-xs text-blue-600 font-medium text-center px-2">Click to add a profile picture</span>
                    </div>
                  )}
                  <div className="absolute -bottom-2 -right-2 bg-blue-500 text-white rounded-full p-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                </div>
              </label>
              <input
                id="profilePicture"
                type="file"
                accept="image/*"
                onChange={handleProfilePictureChange}
                className="hidden"
              />
            </div>

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
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Email" />
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
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        {...field}
                        placeholder="Create a secure password"
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-500" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-500" />
                        )}
                      </Button>
                    </div>
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
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        {...field}
                        placeholder="Confirm your password"
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-500" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-500" />
                        )}
                      </Button>
                    </div>
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
