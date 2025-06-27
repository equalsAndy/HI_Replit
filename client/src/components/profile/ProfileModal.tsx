import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { ArrowLeftRight } from 'lucide-react';
import { useApplication } from '@/hooks/use-application';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface User {
  id: number;
  name: string;
  username: string;
  email: string | null;
  title: string | null;
  organization: string | null;
  role?: string;
  isTestUser?: boolean;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  const { currentApp } = useApplication();
  
  const { data: user, isLoading } = useQuery<User>({
    queryKey: ['/api/user/profile'],
    enabled: isOpen,
  });
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    title: '',
    organization: '',
  });
  
  // Reset form when user data is loaded
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        title: user.title || '',
        organization: user.organization || '',
      });
    }
  }, [user]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await apiRequest(
        'PUT',
        '/api/user/update',
        formData
      );
      
      // Invalidate user profile cache to trigger a refetch
      queryClient.invalidateQueries({ queryKey: ['/api/user/profile'] });
      
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been successfully updated.',
      });
      
      onClose();
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast({
        title: 'Update Failed',
        description: 'There was an error updating your profile. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Function to toggle between applications (admin only)
  const toggleApplication = () => {
    const newApp = currentApp === 'allstarteams' ? 'imaginal-agility' : 'allstarteams';
    
    if (newApp === 'allstarteams') {
      navigate('/allstarteams');
    } else {
      navigate('/imaginal-agility');
    }
    
    onClose();
  };
  
  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Loading profile information...</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email || ''}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input
                id="title"
                name="title"
                value={formData.title || ''}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="organization" className="text-right">
                Organization
              </Label>
              <Input
                id="organization"
                name="organization"
                value={formData.organization || ''}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
          </div>
          
          {/* Workshop Switcher for Test Users and Admins */}
          {(user?.role === 'admin' || user?.isTestUser) && (
            <div className="border-t pt-4">
              <Label className="text-sm font-medium text-gray-700 mb-3 block">
                {user?.role === 'admin' ? 'Admin Tools' : 'Workshop Selection'}
              </Label>
              <div className="space-y-2">
                <div className="text-sm text-gray-600 mb-2">
                  Current Workshop: <span className="font-medium">
                    {currentApp === 'allstarteams' ? 'AllStarTeams' : 'Imaginal Agility'}
                  </span>
                </div>
                <Button 
                  type="button"
                  variant="outline" 
                  className={`w-full flex items-center justify-center ${
                    user?.role === 'admin' 
                      ? 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100'
                      : 'bg-purple-50 text-purple-600 border-purple-200 hover:bg-purple-100'
                  }`}
                  onClick={toggleApplication}
                >
                  <ArrowLeftRight className="h-4 w-4 mr-2" />
                  <span>Switch to {currentApp === 'allstarteams' ? 'Imaginal Agility' : 'AllStarTeams'}</span>
                </Button>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileModal;