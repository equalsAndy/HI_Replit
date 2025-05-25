import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useApplication } from "@/hooks/use-application";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

// ProfileSetup schema
const profileSetupSchema = z.object({
  inviteId: z.number(),
  username: z.string().min(3, {
    message: "Username must be at least 3 characters.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
  confirmPassword: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
  title: z.string().optional(),
  organization: z.string().optional(),
  profilePicture: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ProfileSetupValues = z.infer<typeof profileSetupSchema>;

interface ProfileSetupProps {
  inviteData: any;
  onSubmit: (data: ProfileSetupValues) => void;
  isPending: boolean;
}

export function ProfileSetup({ inviteData, onSubmit, isPending }: ProfileSetupProps) {
  const { appName, appPrimaryColor } = useApplication();
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  
  // Generate a username suggestion based on invite name
  const generateUsernameSuggestion = (name: string) => {
    if (!name) return "";
    
    // Remove special characters, convert to lowercase, and replace spaces with dots
    const cleanedName = name
      .toLowerCase()
      .replace(/[^\w\s]/gi, '')
      .replace(/\s+/g, '.');
    
    // Add random numbers to make it more unique
    const randomSuffix = Math.floor(Math.random() * 1000);
    return `${cleanedName}${randomSuffix}`;
  };
  
  // Form setup
  const form = useForm<ProfileSetupValues>({
    resolver: zodResolver(profileSetupSchema),
    defaultValues: {
      inviteId: inviteData?.id || 0,
      username: generateUsernameSuggestion(inviteData?.name || ""),
      password: "",
      confirmPassword: "",
      title: "",
      organization: "",
      profilePicture: "",
    },
  });
  
  // Update form when inviteData changes
  useEffect(() => {
    if (inviteData) {
      form.setValue("inviteId", inviteData.id);
      
      // Only set username if it's not already filled in
      if (!form.getValues("username")) {
        form.setValue("username", generateUsernameSuggestion(inviteData.name));
      }
    }
  }, [inviteData, form]);
  
  const handleSubmit = (data: ProfileSetupValues) => {
    onSubmit(data);
  };
  
  // Generate initials for avatar fallback
  const getInitials = (name: string) => {
    if (!name) return "U";
    const nameParts = name.split(" ");
    if (nameParts.length === 1) {
      return nameParts[0].charAt(0).toUpperCase();
    }
    return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
  };
  
  // Handle file upload for profile picture
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        form.setError("profilePicture", {
          type: "manual",
          message: "Image size should be less than 2MB",
        });
        return;
      }
      
      // Check file type
      if (!file.type.startsWith("image/")) {
        form.setError("profilePicture", {
          type: "manual",
          message: "Please upload an image file",
        });
        return;
      }
      
      // Create a preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setAvatarPreview(result);
        form.setValue("profilePicture", result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Profile Picture Upload */}
        <div className="flex flex-col items-center space-y-4">
          <Avatar className="w-24 h-24">
            <AvatarImage 
              src={avatarPreview || ""} 
              alt={inviteData?.name || "User"} 
            />
            <AvatarFallback className="text-lg">
              {getInitials(inviteData?.name || "")}
            </AvatarFallback>
          </Avatar>
          
          <div>
            <label 
              htmlFor="profile-picture" 
              className="cursor-pointer text-sm text-blue-600 hover:text-blue-800"
            >
              Upload profile picture
            </label>
            <input 
              id="profile-picture" 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleFileUpload}
            />
          </div>
          
          <FormField
            control={form.control}
            name="profilePicture"
            render={({ field }) => (
              <FormMessage className="text-xs text-center" />
            )}
          />
        </div>
        
        {/* Username Field */}
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Create a unique username" 
                  {...field} 
                />
              </FormControl>
              <FormDescription className="text-xs">
                This will be used to log in to your account
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Password Fields */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input 
                    type="password" 
                    placeholder="Create a password" 
                    {...field} 
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
        
        {/* Additional Profile Fields */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Job Title</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Your job title (optional)" 
                    {...field} 
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
                    placeholder="Your organization (optional)" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <Button 
          type="submit" 
          className="w-full" 
          disabled={isPending}
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating Account...
            </>
          ) : (
            "Complete Registration"
          )}
        </Button>
      </form>
    </Form>
  );
}