import React from 'react';
import { User, UserRole } from '@/shared/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';

interface ProfileViewProps {
  user: User;
  onEdit?: () => void;
  canEdit?: boolean;
  isSelf?: boolean;
}

export function ProfileView({ user, onEdit, canEdit = false, isSelf = true }: ProfileViewProps) {
  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  };

  // Role display
  const getRoleDisplay = () => {
    switch (user.role) {
      case UserRole.Admin:
        return { name: 'Administrator', color: 'bg-red-100 text-red-800 border-red-300' };
      case UserRole.Facilitator:
        return { name: 'Facilitator', color: 'bg-blue-100 text-blue-800 border-blue-300' };
      case UserRole.Participant:
      default:
        return { name: 'Participant', color: 'bg-green-100 text-green-800 border-green-300' };
    }
  };

  const roleDisplay = getRoleDisplay();

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Profile Information</CardTitle>
        {canEdit && isSelf && (
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Pencil className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-6">
          {/* Avatar and basic info */}
          <div className="flex flex-col items-center space-y-3">
            <Avatar className="h-24 w-24">
              <AvatarImage src={user.avatarUrl || undefined} alt={user.name} />
              <AvatarFallback className="text-lg">{getInitials(user.name)}</AvatarFallback>
            </Avatar>
            
            {/* Role badge */}
            <div className={`text-sm font-medium py-1 px-3 rounded-full border ${roleDisplay.color}`}>
              {roleDisplay.name}
            </div>
          </div>
          
          {/* User details */}
          <div className="flex-1">
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-medium">{user.name}</h3>
                <div className="text-gray-500">
                  {user.title && <p>{user.title}</p>}
                  {user.organization && <p>{user.organization}</p>}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {user.email && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Email</h4>
                    <p className="text-gray-900">{user.email}</p>
                  </div>
                )}
                
                {user.phone && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Phone</h4>
                    <p className="text-gray-900">{user.phone}</p>
                  </div>
                )}
              </div>
              
              {user.bio && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Bio</h4>
                  <p className="text-gray-900 whitespace-pre-line">{user.bio}</p>
                </div>
              )}
              
              {user.facilitatorId && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Assigned Facilitator</h4>
                  <p className="text-gray-900">
                    {/* This would ideally show the facilitator name from a query */}
                    Facilitator #{user.facilitatorId}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}