import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Upload, User, LogOut, Edit3, RefreshCw, AlertTriangle, LayoutDashboard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useLocation } from 'wouter';

interface ProfileEditorProps {
  user: any;
  onLogout: () => void;
}

export default function ProfileEditor({ user, onLogout }: ProfileEditorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || user?.username || '',
    organization: user?.organization || '',
    jobTitle: user?.jobTitle || user?.title || '',
  });
  const [profileImage, setProfileImage] = useState(user?.profilePicture);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();

  // Update form data when user prop changes
  React.useEffect(() => {
    if (user) {
      const mappedData = {
        name: user.name || '',
        email: user.email || user.username || '',
        organization: user.organization || '',
        jobTitle: user.jobTitle || user.title || '',
      };
      setFormData(mappedData);
      setProfileImage(user.profilePicture);
    }
  }, [user]);

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('/api/user/profile', {
        method: 'PUT',
        body: data,
      });
    },
    onSuccess: () => {
      toast({
        title: 'Profile updated successfully',
        description: 'Your profile information has been saved.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user/profile'] });
      setIsEditing(false);
    },
    onError: (error) => {
      toast({
        title: 'Error updating profile',
        description: 'Failed to update your profile. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Photo upload mutation
  const uploadPhotoMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('photo', file);
      
      const response = await fetch('/api/user/upload-photo', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setProfileImage(data.profilePicture);
      toast({
        title: 'Photo uploaded successfully',
        description: 'Your profile photo has been updated.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user/profile'] });
    },
    onError: () => {
      toast({
        title: 'Upload failed',
        description: 'Failed to upload photo. Please ensure it\'s under 1MB.',
        variant: 'destructive',
      });
    },
  });

  // Data reset mutation for test users
  const resetDataMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('/api/user/data', {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      toast({
        title: 'Data reset successful',
        description: 'All your workshop data has been reset. Redirecting to home page...',
      });
      
      // Clear React Query cache
      queryClient.clear();
      
      // Redirect to home page after brief delay
      setTimeout(() => {
        window.location.href = '/';
      }, 1500);
    },
    onError: (error: any) => {
      toast({
        title: 'Reset failed',
        description: error.message || 'Failed to reset your data. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size (1MB limit)
    if (file.size > 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please select an image under 1MB.',
        variant: 'destructive',
      });
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please select an image file.',
        variant: 'destructive',
      });
      return;
    }

    uploadPhotoMutation.mutate(file);
  };

  const handleSave = () => {
    updateProfileMutation.mutate({
      ...formData,
      profilePicture: profileImage,
    });
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    // Reset form data to original user data
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || user.username || '',
        organization: user.organization || '',
        jobTitle: user.jobTitle || user.title || '',
      });
      setProfileImage(user.profilePicture);
    }
    setIsEditing(false);
  };

  const handleModalClose = () => {
    setIsOpen(false);
    setIsEditing(false);
    // Reset form data when closing modal
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || user.username || '',
        organization: user.organization || '',
        jobTitle: user.jobTitle || user.title || '',
      });
      setProfileImage(user.profilePicture);
    }
  };

  // Handle navigation to test user dashboard
  const handleTestUserDashboard = () => {
    navigate('/testuser');
    setIsOpen(false);
  };

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={user?.profilePicture} />
            <AvatarFallback className="text-xs">
              {user?.name ? getUserInitials(user.name) : <User className="h-3 w-3" />}
            </AvatarFallback>
          </Avatar>
          <span className="hidden sm:inline">{user?.name || 'Profile'}</span>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Profile' : 'Profile'}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Profile Photo Section */}
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src={profileImage} />
              <AvatarFallback className="text-lg">
                {formData.name ? getUserInitials(formData.name) : <User className="h-8 w-8" />}
              </AvatarFallback>
            </Avatar>
            
            {isEditing && (
              <>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadPhotoMutation.isPending}
                    className="flex items-center gap-2"
                  >
                    <Camera className="h-4 w-4" />
                    {profileImage ? 'Change Photo' : 'Upload Photo'}
                  </Button>
                  
                  {profileImage && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setProfileImage(null);
                        toast({
                          title: 'Photo removed',
                          description: 'Your profile photo has been removed.',
                        });
                      }}
                    >
                      Remove
                    </Button>
                  )}
                </div>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                
                <p className="text-xs text-muted-foreground text-center">
                  Upload a photo under 1MB. JPG, PNG, or GIF format.
                </p>
              </>
            )}
          </div>

          {/* Profile Information */}
          <div className="space-y-4">
            {isEditing ? (
              // Edit Mode - Show input fields
              <>
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Enter your email"
                  />
                </div>

                <div>
                  <Label htmlFor="organization">Organization</Label>
                  <Input
                    id="organization"
                    value={formData.organization}
                    onChange={(e) => handleInputChange('organization', e.target.value)}
                    placeholder="Enter your organization"
                  />
                </div>

                <div>
                  <Label htmlFor="jobTitle">Job Title</Label>
                  <Input
                    id="jobTitle"
                    value={formData.jobTitle}
                    onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                    placeholder="Enter your job title"
                  />
                </div>
              </>
            ) : (
              // View Mode - Show read-only information
              <>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Full Name</Label>
                  <p className="text-sm mt-1 p-2 bg-muted rounded-md">{formData.name || 'Not provided'}</p>
                </div>

                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                  <p className="text-sm mt-1 p-2 bg-muted rounded-md">{formData.email || 'Not provided'}</p>
                </div>

                {formData.organization && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Organization</Label>
                    <p className="text-sm mt-1 p-2 bg-muted rounded-md">{formData.organization}</p>
                  </div>
                )}

                {formData.jobTitle && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Job Title</Label>
                    <p className="text-sm mt-1 p-2 bg-muted rounded-md">{formData.jobTitle}</p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2">
            {isEditing ? (
              // Edit Mode buttons
              <div className="flex gap-2">
                <Button
                  onClick={handleSave}
                  disabled={updateProfileMutation.isPending}
                  className="flex-1"
                >
                  {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            ) : (
              // View Mode buttons
              <>
                <div className="flex gap-2">
                  <Button
                    onClick={handleEdit}
                    className="flex-1 flex items-center gap-2"
                  >
                    <Edit3 className="h-4 w-4" />
                    Edit Profile
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={handleModalClose}
                    className="flex-1"
                  >
                    Close
                  </Button>
                </div>

                {/* Test User Dashboard Button */}
                {user?.isTestUser && (
                  <Button
                    onClick={handleTestUserDashboard}
                    className="w-full flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Test User Dashboard
                  </Button>
                )}
              </>
            )}

            {/* Test User Data Reset Section */}
            {user?.isTestUser && (
              <div className="border-t border-destructive/20 pt-4 mt-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  <span className="text-sm font-medium text-destructive">Test User Data Reset</span>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  Delete all your workshop progress including assessments, reflections, and navigation data. This cannot be undone.
                </p>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                      disabled={resetDataMutation.isPending}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      {resetDataMutation.isPending ? 'Resetting...' : 'Reset My Data'}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Reset All Workshop Data</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete all your workshop progress including:
                        <ul className="list-disc list-inside mt-2 space-y-1">
                          <li>Star Card assessments and results</li>
                          <li>Flow attributes and assessments</li>
                          <li>Well-being ladder responses</li>
                          <li>Step-by-step reflections</li>
                          <li>Navigation progress and completed steps</li>
                          <li>Growth plans and final reflections</li>
                        </ul>
                        <br />
                        Your account and profile information will be preserved. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => resetDataMutation.mutate()}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Reset All Data
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
            
            <Button
              variant="destructive"
              onClick={onLogout}
              className="flex items-center gap-2 justify-center"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}