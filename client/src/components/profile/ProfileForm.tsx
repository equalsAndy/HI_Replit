import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ProfileData } from "@shared/schema";

interface ProfileFormProps {
  onCompleted: () => void;
}

export default function ProfileForm({ onCompleted }: ProfileFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: user, isLoading } = useQuery({
    queryKey: ['/api/user/profile'],
    staleTime: Infinity
  });

  const { register, handleSubmit, formState: { errors } } = useForm<ProfileData>({
    defaultValues: {
      name: user?.name || "",
      title: user?.title || "",
      organization: user?.organization || "",
      avatarUrl: user?.avatarUrl || ""
    }
  });

  const updateProfile = useMutation({
    mutationFn: async (data: ProfileData) => {
      const res = await apiRequest('PUT', '/api/user/profile', data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/profile'] });
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

  if (isLoading) {
    return <div>Loading profile information...</div>;
  }

  return (
    <div className="mb-4">
      <p className="text-sm mb-4">This information builds your Star Badge.</p>
      
      <div className="flex items-center mb-4">
        <div className="mr-4">
          <p className="text-sm mb-1">Your Avatar:</p>
          <Avatar className="h-16 w-16">
            <AvatarImage src={user?.avatarUrl} alt={user?.name} />
            <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>
        </div>
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
        
        <Button 
          type="submit" 
          className="bg-primary hover:bg-primary-dark text-white"
          disabled={updateProfile.isPending}
        >
          {updateProfile.isPending ? "Saving..." : "Edit Profile"}
        </Button>
      </form>
    </div>
  );
}
