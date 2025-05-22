import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ProfileView } from '@/components/profile/ProfileView';
import { ProfileEditor } from '@/components/profile/ProfileEditor';
import { User, UserRole } from '@/shared/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Users } from 'lucide-react';

export default function ProfileManagement() {
  // State for controlling edit mode
  const [isEditing, setIsEditing] = useState(false);
  // State for tracking which user is being viewed (for admins/facilitators)
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<string>('profile');

  // Fetch current user data
  const { data: currentUser, isLoading: isCurrentUserLoading } = useQuery<User>({
    queryKey: ['/api/user/profile'],
  });

  // Determine if current user is admin or facilitator (would be based on the roleId in a real implementation)
  // For the UI prototype, we'll mock this with a check on the user's title
  const isAdmin = currentUser?.title?.toLowerCase().includes('admin') || false;
  const isFacilitator = currentUser?.title?.toLowerCase().includes('facilitator') || false;
  
  // For the demo, assign a role based on the title
  const getUserRole = (user: User | undefined): UserRole => {
    if (!user) return UserRole.Participant;
    
    if (user.title?.toLowerCase().includes('admin')) {
      return UserRole.Admin;
    } else if (user.title?.toLowerCase().includes('facilitator')) {
      return UserRole.Facilitator;
    } else {
      return UserRole.Participant;
    }
  };

  // For UI demo, let's add the role to the user object
  const userWithRole = currentUser ? {
    ...currentUser,
    role: getUserRole(currentUser),
  } : undefined;

  // Fetch users (for admins/facilitators to manage)
  const { data: users, isLoading: isUsersLoading } = useQuery<User[]>({
    queryKey: ['/api/users'],
    enabled: isAdmin || isFacilitator,
    // Fallback to an empty array if the endpoint doesn't exist yet
    onError: () => { return []; }
  });

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  };

  if (isCurrentUserLoading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!userWithRole) {
    return (
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <p className="text-yellow-700">
            User profile not found. Please log in to view your profile.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6">
      <h1 className="text-3xl font-bold mb-8">Profile Management</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="profile">Your Profile</TabsTrigger>
          {(isAdmin || isFacilitator) && (
            <TabsTrigger value="users">Manage Users</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          {isEditing ? (
            <ProfileEditor 
              user={userWithRole} 
              onSaved={() => setIsEditing(false)}
              isCurrentUser={true}
            />
          ) : (
            <ProfileView 
              user={userWithRole} 
              onEdit={() => setIsEditing(true)} 
              canEdit={true}
              isSelf={true}
            />
          )}
        </TabsContent>

        {(isAdmin || isFacilitator) && (
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Users</h2>
                
                {isUsersLoading ? (
                  <div className="flex items-center justify-center min-h-[200px]">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* For demo purposes, we'll show a few mock users since the endpoint may not exist yet */}
                    {(users?.length || 0) > 0 ? (
                      <div className="grid gap-4">
                        {users?.map(user => (
                          <div 
                            key={user.id} 
                            className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                            onClick={() => setSelectedUserId(user.id)}
                          >
                            <Avatar className="h-10 w-10 mr-3">
                              <AvatarImage src={user.avatarUrl || undefined} alt={user.name} />
                              <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <p className="font-medium">{user.name}</p>
                              <p className="text-sm text-gray-500">{user.title || 'No title'}</p>
                            </div>
                            <Button variant="ghost" size="sm">View</Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      // Show mock users for the UI demo
                      <div className="grid gap-4">
                        {[
                          { id: 2, name: 'Jane Smith', title: 'Marketing Director', organization: 'Acme Corp' },
                          { id: 3, name: 'John Doe', title: 'Sales Representative', organization: 'Acme Corp' },
                          { id: 4, name: 'Maria Garcia', title: 'Product Manager', organization: 'Acme Corp' },
                        ].map(user => (
                          <div 
                            key={user.id} 
                            className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                          >
                            <Avatar className="h-10 w-10 mr-3">
                              <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <p className="font-medium">{user.name}</p>
                              <p className="text-sm text-gray-500">{user.title || 'No title'}</p>
                            </div>
                            <Button variant="ghost" size="sm">View</Button>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <Users className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">
                        {isAdmin ? 'As an administrator, you can view and manage all users.' : 
                         'As a facilitator, you can view and manage your assigned participants.'}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* If a user is selected, show their profile */}
            {selectedUserId && (
              <div className="mt-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">User Profile</h2>
                  <Button variant="ghost" onClick={() => setSelectedUserId(null)}>
                    Back to List
                  </Button>
                </div>
                
                {/* For the demo, just show the same profile but with different edit permissions */}
                <ProfileView 
                  user={{
                    ...userWithRole,
                    id: selectedUserId,
                    name: selectedUserId === 2 ? 'Jane Smith' : (selectedUserId === 3 ? 'John Doe' : 'Maria Garcia'),
                    title: selectedUserId === 2 ? 'Marketing Director' : (selectedUserId === 3 ? 'Sales Representative' : 'Product Manager'),
                    role: UserRole.Participant
                  }}
                  canEdit={isAdmin}
                  isSelf={false}
                />
              </div>
            )}
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}