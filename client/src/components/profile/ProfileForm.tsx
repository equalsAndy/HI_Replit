import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ProfileData } from "@shared/schema";
import AvatarUploader from "./AvatarUploader";

interface ProfileFormProps {
  onCompleted: () => void;
}

export default function ProfileForm({ onCompleted }: ProfileFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  
  const { data: user, isLoading } = useQuery({
    queryKey: ['/api/auth/me'],
    staleTime: 5 * 60 * 1000, // 5 minutes - prevent auth loop
    refetchOnWindowFocus: false
  });

  useEffect(() => {
    if (user?.avatarUrl) {
      setAvatarUrl(user.avatarUrl);
    }
  }, [user]);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<ProfileData>({
    defaultValues: {
      name: user?.name || "",
      title: user?.title || "",
      organization: user?.organization || "",
      avatarUrl: user?.avatarUrl || ""
    }
  });

  // Update the avatarUrl field when it changes
  useEffect(() => {
    setValue('avatarUrl', avatarUrl);
  }, [avatarUrl, setValue]);

  const updateProfile = useMutation({
    mutationFn: async (data: ProfileData) => {
      const res = await apiRequest('PUT', '/api/auth/me', data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      toast({
        title: "Profile updated successfully!",
        description: "Your profile information has been saved.",
        variant: "default",
      });
      onCompleted();
    },
    onError: (error) => {
      toast({
        title: "Failed to update profile",
        description: String(error),
        variant: "destructive",
      });
    }
  });

  const onSubmit = (data: ProfileData) => {
    updateProfile.mutate(data);
  };

  const handleAvatarChange = (base64Image: string) => {
    console.log("Avatar changed in ProfileForm", base64Image ? "Image received" : "Avatar removed");
    setAvatarUrl(base64Image);
    // Immediately update the form value
    setValue('avatarUrl', base64Image);
  };

  if (isLoading) {
    return <div>Loading profile information...</div>;
  }

  return (
    <div className="mb-4">
      <p className="text-sm mb-4">This information builds your Star Badge.</p>
      
      <div className="flex flex-col items-center mb-8">
        <AvatarUploader 
          currentAvatar={avatarUrl} 
          onAvatarChange={handleAvatarChange} 
        />
        <p className="text-sm text-gray-500 mt-2">Click on avatar to upload or edit</p>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name:</Label>
          <Input
            id="name"
            placeholder="Your name"
            {...register('name', { required: 'Name is required' })}
          />
          {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="title">Title:</Label>
          <Input
            id="title"
            placeholder="Your job title"
            {...register('title', { required: 'Title is required' })}
          />
          {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="organization">Company:</Label>
          <Input
            id="organization"
            placeholder="Your company or organization"
            {...register('organization', { required: 'Company is required' })}
          />
          {errors.organization && <p className="text-sm text-red-500">{errors.organization.message}</p>}
        </div>
        
        {/* Hidden input for avatarUrl */}
        <input 
          type="hidden" 
          {...register('avatarUrl')}
        />
        
        <Button 
          type="submit" 
          className="bg-indigo-600 hover:bg-indigo-700 text-white w-full"
          disabled={updateProfile.isPending}
        >
          {updateProfile.isPending ? "Saving..." : "Save Profile"}
        </Button>
      </form>
    </div>
  );
}
