import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Validation schema for profile setup
const profileSetupSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must be less than 50 characters')
    .regex(/^[a-zA-Z0-9._-]+$/, 'Username can only contain letters, numbers, and ._-'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  confirmPassword: z.string(),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  organization: z.string().optional(),
  jobTitle: z.string().optional(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  profilePictureUrl: z.string().optional(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type ProfileSetupValues = z.infer<typeof profileSetupSchema>;

interface ProfileSetupProps {
  inviteCode: string;
  inviteData?: {
    id: number;
    email: string;
    name: string;
    role: string;
  };
}

export function ProfileSetup({ inviteCode, inviteData }: ProfileSetupProps) {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
  // Form for profile setup
  const form = useForm<ProfileSetupValues>({
    resolver: zodResolver(profileSetupSchema),
    defaultValues: {
      username: '',
      password: '',
      confirmPassword: '',
      firstName: inviteData?.name?.split(' ')[0] || '',
      lastName: inviteData?.name?.split(' ').slice(1).join(' ') || '',
      organization: '',
      jobTitle: '',
      bio: '',
      profilePictureUrl: '',
    },
  });
  
  // Handle profile picture upload
  const handleProfilePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Profile picture must be less than 5MB',
        variant: 'destructive',
      });
      return;
    }
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload an image file',
        variant: 'destructive',
      });
      return;
    }
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setPreviewImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
    
    // Upload the file
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('profilePicture', file);
      
      const response = await fetch('/api/upload-profile-picture', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload profile picture');
      }
      
      const data = await response.json();
      form.setValue('profilePictureUrl', data.url);
      
      toast({
        title: 'Profile picture uploaded',
        description: 'Your profile picture has been uploaded successfully',
      });
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: 'Failed to upload profile picture. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  // Mutation for creating user account
  const registerMutation = useMutation({
    mutationFn: async (data: ProfileSetupValues) => {
      const response = await apiRequest('POST', '/api/register', {
        ...data,
        inviteCode,
        email: inviteData?.email,
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Registration successful',
        description: 'Your account has been created successfully. Please log in to continue.',
      });
      
      // Redirect to login page
      setLocation('/login');
    },
    onError: (error: any) => {
      toast({
        title: 'Registration failed',
        description: error.message || 'Failed to create your account. Please try again.',
        variant: 'destructive',
      });
    },
  });
  
  // Handle form submission
  const onSubmit = (values: ProfileSetupValues) => {
    registerMutation.mutate(values);
  };
  
  // Check if username is available
  const checkUsername = async (username: string) => {
    try {
      const response = await apiRequest('POST', '/api/check-username', { username });
      const data = await response.json();
      
      if (!data.available) {
        form.setError('username', {
          type: 'manual',
          message: 'This username is already taken',
        });
      }
    } catch (error) {
      console.error('Failed to check username availability', error);
    }
  };
  
  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle>Complete Your Profile</CardTitle>
        <CardDescription>
          Set up your account details to complete registration
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Profile Picture Section */}
            <div className="flex flex-col items-center space-y-4 mb-6">
              <Avatar className="w-24 h-24">
                <AvatarImage src={previewImage || ''} />
                <AvatarFallback>
                  {inviteData?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex items-center">
                <Label
                  htmlFor="profile-picture"
                  className="cursor-pointer text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 py-2 px-4 rounded-md"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 inline animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    'Choose Profile Picture'
                  )}
                </Label>
                <Input
                  id="profile-picture"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleProfilePictureUpload}
                  disabled={isUploading}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Account Information */}
              <div className="space-y-4 md:col-span-2">
                <h3 className="text-lg font-medium">Account Information</h3>
                
                {/* Email display (non-editable) */}
                <div>
                  <Label>Email</Label>
                  <Input
                    value={inviteData?.email || ''}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Email address cannot be changed
                  </p>
                </div>
                
                {/* Username */}
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter a unique username" 
                          {...field}
                          onBlur={(e) => {
                            field.onBlur();
                            if (e.target.value) {
                              checkUsername(e.target.value);
                            }
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        Your username will be used for logging in
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Password */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="Create a secure password" 
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Must be at least 8 characters with uppercase, lowercase, and numbers
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Confirm Password */}
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="Confirm your password" 
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {/* Personal Information */}
              <div className="space-y-4 md:col-span-2">
                <h3 className="text-lg font-medium">Personal Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* First Name */}
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input placeholder="First name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Last Name */}
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Last name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Organization */}
                  <FormField
                    control={form.control}
                    name="organization"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Organization</FormLabel>
                        <FormControl>
                          <Input placeholder="Your organization (optional)" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Job Title */}
                  <FormField
                    control={form.control}
                    name="jobTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Job Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Your job title (optional)" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                {/* Bio */}
                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bio</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Tell us a bit about yourself (optional)" 
                          className="resize-none h-24"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        <span className={field.value?.length > 400 ? 'text-amber-500' : ''}>
                          {field.value?.length || 0}/500 characters
                        </span>
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Complete Registration
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center border-t pt-6">
        <p className="text-sm text-muted-foreground">
          By completing registration, you agree to our Terms of Service and Privacy Policy.
        </p>
      </CardFooter>
    </Card>
  );
}