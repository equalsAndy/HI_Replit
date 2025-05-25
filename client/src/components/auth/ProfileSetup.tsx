import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { apiRequest } from '@/lib/queryClient';
import { Loader2, RefreshCw, CheckCircle, XCircle, Upload, UserCircle, ImagePlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Username and password validation
const reservedUsernames = ['admin', 'system', 'test', 'support', 'help', 'api', 'root'];

// Profile setup validation schema
const profileSetupSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username cannot exceed 20 characters')
    .regex(/^[a-zA-Z0-9][a-zA-Z0-9_-]*$/, 'Username must start with a letter or number and can only contain letters, numbers, underscores, and hyphens')
    .refine(val => !reservedUsernames.includes(val.toLowerCase()), 'This username is reserved')
    .refine(val => !/--/.test(val) && !/__/.test(val), 'Username cannot contain consecutive hyphens or underscores'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[!@#$%^&*]/, 'Password must contain at least one special character (!@#$%^&*)'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  organization: z.string().max(30, 'Organization cannot exceed 30 characters').optional(),
  jobTitle: z.string().max(30, 'Job title cannot exceed 30 characters').optional(),
  profilePicture: z.string().optional(),
});

type ProfileSetupProps = {
  inviteData: {
    inviteCode: string;
    name?: string;
    email: string;
    role: string;
    cohortId?: number;
  };
  onComplete: (userData: any) => void;
};

const ProfileSetup: React.FC<ProfileSetupProps> = ({ inviteData, onComplete }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof profileSetupSchema>>({
    resolver: zodResolver(profileSetupSchema),
    defaultValues: {
      username: '',
      password: '',
      name: inviteData.name || '',
      organization: '',
      jobTitle: '',
      profilePicture: '',
    },
  });

  const watchPassword = form.watch('password');
  const watchUsername = form.watch('username');

  // Check password strength
  React.useEffect(() => {
    if (!watchPassword) {
      setPasswordStrength(0);
      return;
    }

    let strength = 0;
    if (watchPassword.length >= 8) strength += 20;
    if (/[A-Z]/.test(watchPassword)) strength += 20;
    if (/[a-z]/.test(watchPassword)) strength += 20;
    if (/[0-9]/.test(watchPassword)) strength += 20;
    if (/[!@#$%^&*]/.test(watchPassword)) strength += 20;

    setPasswordStrength(strength);
  }, [watchPassword]);

  // Check username availability with debounce
  React.useEffect(() => {
    if (!watchUsername || watchUsername.length < 3) {
      setUsernameAvailable(null);
      return;
    }

    const timer = setTimeout(async () => {
      if (reservedUsernames.includes(watchUsername.toLowerCase())) {
        setUsernameAvailable(false);
        return;
      }

      setIsCheckingUsername(true);
      try {
        const response = await apiRequest('/api/auth/check-username', {
          method: 'POST',
          data: { username: watchUsername },
        });
        setUsernameAvailable(response.available);
      } catch (error) {
        console.error('Error checking username:', error);
        setUsernameAvailable(null);
      } finally {
        setIsCheckingUsername(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [watchUsername]);

  // Generate a secure password
  const generatePassword = () => {
    const lowercase = 'abcdefghijkmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const numbers = '23456789';
    const symbols = '!@#$%^&*';
    const allChars = lowercase + uppercase + numbers + symbols;
    
    let password = '';
    // Ensure at least one of each required character type
    password += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
    password += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
    password += numbers.charAt(Math.floor(Math.random() * numbers.length));
    password += symbols.charAt(Math.floor(Math.random() * symbols.length));
    
    // Fill the rest with random characters
    for (let i = 0; i < 8; i++) {
      password += allChars.charAt(Math.floor(Math.random() * allChars.length));
    }
    
    // Shuffle the password
    password = password.split('').sort(() => 0.5 - Math.random()).join('');
    
    form.setValue('password', password);
  };

  // Handle profile image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Profile picture must be less than 2MB',
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

    // Convert to base64
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setProfileImagePreview(base64);
      form.setValue('profilePicture', base64);
    };
    reader.readAsDataURL(file);
  };

  // Form submission
  const onSubmit = async (values: z.infer<typeof profileSetupSchema>) => {
    setIsRegistering(true);
    try {
      // Register the user
      const userData = await apiRequest('/api/auth/register', {
        method: 'POST',
        data: {
          ...values,
          email: inviteData.email,
          inviteCode: inviteData.inviteCode,
        },
      });
      
      toast({
        title: 'Registration Successful',
        description: 'Your account has been created successfully.',
      });
      
      // Pass the user data to the parent component
      onComplete(userData.user);
    } catch (error: any) {
      console.error('Registration error:', error);
      toast({
        title: 'Registration Failed',
        description: error.message || 'An error occurred during registration. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Complete Your Profile</CardTitle>
        <CardDescription>
          Set up your account to access the workshop platform as a {inviteData.role}.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Left column - Account details */}
              <div className="flex-1 space-y-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Account Details</h3>
                  <Separator />
                </div>
                
                {/* Email field (read-only) */}
                <div className="space-y-1">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={inviteData.email} readOnly disabled className="bg-muted" />
                  <p className="text-xs text-muted-foreground">Your email cannot be changed</p>
                </div>
                
                {/* Username field */}
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Input {...field} placeholder="Choose a username" />
                        </FormControl>
                        {watchUsername && watchUsername.length >= 3 && (
                          <div className="absolute right-3 top-2.5">
                            {isCheckingUsername ? (
                              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                            ) : usernameAvailable === true ? (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            ) : usernameAvailable === false ? (
                              <XCircle className="h-5 w-5 text-red-500" />
                            ) : null}
                          </div>
                        )}
                      </div>
                      <FormDescription>
                        Your unique username for logging in. 3-20 characters, letters, numbers, underscores, and hyphens only.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Password field */}
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
                            type="password" 
                            placeholder="Create a strong password" 
                          />
                        </FormControl>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-1 top-1 h-7"
                          onClick={generatePassword}
                        >
                          <RefreshCw className="h-4 w-4 mr-1" />
                          Generate
                        </Button>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <Progress value={passwordStrength} className="h-2" />
                          <span className="text-xs font-medium">
                            {passwordStrength === 100 ? 'Strong' : 
                             passwordStrength >= 60 ? 'Good' : 
                             passwordStrength >= 20 ? 'Weak' : 'Poor'}
                          </span>
                        </div>
                        <FormDescription>
                          Password must be at least 8 characters with uppercase, lowercase, number, and special character.
                        </FormDescription>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {/* Right column - Profile details */}
              <div className="flex-1 space-y-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Profile Information</h3>
                  <Separator />
                </div>
                
                {/* Name field */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Your full name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Organization field */}
                <FormField
                  control={form.control}
                  name="organization"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Organization</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Your organization (optional)" />
                      </FormControl>
                      <FormDescription>
                        Limited to 30 characters
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Job Title field */}
                <FormField
                  control={form.control}
                  name="jobTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Title</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Your job title (optional)" />
                      </FormControl>
                      <FormDescription>
                        Limited to 30 characters
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Profile Picture upload */}
                <div className="space-y-3">
                  <FormLabel>Profile Picture</FormLabel>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16 border">
                      {profileImagePreview ? (
                        <AvatarImage src={profileImagePreview} alt="Profile Preview" />
                      ) : (
                        <AvatarFallback>
                          <UserCircle className="h-8 w-8 text-muted-foreground" />
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="flex-1">
                      <Label 
                        htmlFor="profile-image" 
                        className="cursor-pointer flex items-center justify-center p-2 border border-dashed rounded-md hover:bg-muted transition-colors"
                      >
                        <ImagePlus className="h-4 w-4 mr-2" />
                        <span>Choose Image</span>
                        <input
                          id="profile-image"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageUpload}
                        />
                      </Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        JPEG, PNG or GIF (max 2MB)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="pt-4">
              <Button type="submit" className="w-full" disabled={isRegistering}>
                {isRegistering ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Your Account...
                  </>
                ) : (
                  'Complete Registration'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center pt-0">
        <p className="text-sm text-muted-foreground">
          By completing registration, you agree to the terms of service and privacy policy.
        </p>
      </CardFooter>
    </Card>
  );
};

export default ProfileSetup;