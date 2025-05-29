import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'wouter';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, UserPlus, Mail, RefreshCw, Check, X, PencilIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { SimpleVideoManagement } from '@/components/admin/SimpleVideoManagement';
import { PasswordInput } from '@/components/ui/password-input';

interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  role: string;
  organization: string | null;
  jobTitle: string | null;
}

interface Invite {
  id: number;
  inviteCode: string;
  email: string;
  role: string;
  name: string | null;
  createdAt: string;
  expiresAt: string | null;
  usedAt: string | null;
}

const AdminPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [isLoadingInvites, setIsLoadingInvites] = useState(true);
  const [isSendingInvite, setIsSendingInvite] = useState(false);
  const [activeTab, setActiveTab] = useState('users');
  const [newInvite, setNewInvite] = useState({
    email: '',
    role: 'participant',
    name: '',
  });
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    organization: '',
    jobTitle: '',
    role: 'participant',
    resetPassword: false,
    newPassword: '',
  });
  const [isUpdatingUser, setIsUpdatingUser] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    // Fetch users and invites on component mount
    fetchUsers();
    fetchInvites();
  }, []);

  // Fetch users
  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const response = await fetch('/api/admin/users', {
        credentials: 'include' // Include credentials to send session cookies
      });

      // If not authenticated or not admin, redirect to login
      if (response.status === 401 || response.status === 403) {
        toast({
          variant: 'destructive',
          title: 'Access denied',
          description: 'You do not have permission to access the admin panel.',
        });
        setLocation('/login');
        return;
      }

      const data = await response.json();
      console.log("User data response:", data);

      if (data.users) {
        setUsers(data.users);
      } else if (data.message) {
        // If we got a message but no users, it might be an error
        toast({
          variant: 'destructive',
          title: 'Error',
          description: data.message || 'Failed to load users',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load users',
        });
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load users. Please try again later.',
      });
    } finally {
      setIsLoadingUsers(false);
    }
  };

  // Fetch invites
  const fetchInvites = async () => {
    setIsLoadingInvites(true);
    try {
      const response = await fetch('/api/admin/invites');

      const data = await response.json();

      if (data.success) {
        setInvites(data.invites);
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: data.error || 'Failed to load invites',
        });
      }
    } catch (error) {
      console.error('Error fetching invites:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load invites. Please try again later.',
      });
    } finally {
      setIsLoadingInvites(false);
    }
  };

  // Handle editing a user
  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      organization: user.organization || '',
      jobTitle: user.jobTitle || '',
      role: user.role,
      resetPassword: false,
      newPassword: '',
    });
    setEditDialogOpen(true);
  };

  // Handle updating a user
  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedUser) return;

    setIsUpdatingUser(true);

    try {
      // Transform the form data to match backend expectations
      const updateData: any = {
        name: editForm.name,
        email: editForm.email,
        organization: editForm.organization,
        title: editForm.jobTitle, // Backend expects 'title' not 'jobTitle'
      };

      // Add password if reset is requested
      if (editForm.resetPassword) {
        updateData.password = editForm.newPassword || undefined; // Backend will generate if empty
      }

      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (response.ok) {
        const successMessage = editForm.resetPassword && data.temporaryPassword 
          ? `User updated successfully. New temporary password: ${data.temporaryPassword}`
          : 'User information has been successfully updated.';

        toast({
          title: 'User updated',
          description: successMessage,
        });

        setEditDialogOpen(false);
        setSelectedUser(null);
        fetchUsers(); // Refresh the users list
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: data.message || data.error || 'Failed to update user',
        });
      }
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update user. Please try again later.',
      });
    } finally {
      setIsUpdatingUser(false);
    }
  };

  // Handle deleting user data (keeping profile and password)
  const handleDeleteUserData = async (user: User) => {
    if (!confirm(`Are you sure you want to delete all assessment and progress data for ${user.name}? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${user.id}/data`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'User data deleted',
          description: `All assessment and progress data for ${user.name} has been deleted.`,
        });
        fetchUsers(); // Refresh the users list
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: data.message || data.error || 'Failed to delete user data',
        });
      }
    } catch (error) {
      console.error('Error deleting user data:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete user data. Please try again later.',
      });
    }
  };

  // Handle deleting a user completely
  const handleDeleteUser = async (user: User) => {
    if (!confirm(`Are you sure you want to completely delete the user account for ${user.name}? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'User deleted',
          description: `User account for ${user.name} has been completely deleted.`,
        });
        fetchUsers(); // Refresh the users list
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: data.message || data.error || 'Failed to delete user',
        });
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete user. Please try again later.',
      });
    }
  };

  // Handle creating a new invite
  const handleCreateInvite = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newInvite.email) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please enter an email address.',
      });
      return;
    }

    setIsSendingInvite(true);

    try {
      const response = await fetch('/api/admin/invites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newInvite),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Invite created',
          description: `Invite code created for ${newInvite.email}.`,
        });

        // Reset form and refresh invites
        setNewInvite({
          email: '',
          role: 'participant',
          name: '',
        });
        fetchInvites();
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: data.error || 'Failed to create invite',
        });
      }
    } catch (error) {
      console.error('Error creating invite:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to create invite. Please try again later.',
      });
    } finally {
      setIsSendingInvite(false);
    }
  };

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold">Heliotrope Imaginal Workshops</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" asChild>
              <Link href="/dashboard">Dashboard</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/login">Log out</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <h2 className="text-3xl font-bold">Admin Panel</h2>
          <Button asChild>
            <Link href="/dashboard">Return to Dashboard</Link>
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="invites">Invites</TabsTrigger>
            <TabsTrigger value="videos">Videos</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>View and manage user accounts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-end mb-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={fetchUsers}
                    disabled={isLoadingUsers}
                  >
                    {isLoadingUsers ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4 mr-2" />
                    )}
                    Refresh
                  </Button>
                </div>

                {isLoadingUsers ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Username</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Organization</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.length > 0 ? (
                          users.map((user) => (
                            <TableRow key={user.id}>
                              <TableCell className="font-medium">{user.name}</TableCell>
                              <TableCell>{user.username}</TableCell>
                              <TableCell>{user.email}</TableCell>
                              <TableCell>{user.role}</TableCell>
                              <TableCell>{user.organization || 'N/A'}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 px-2 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 border-blue-200"
                                    onClick={() => handleEditUser(user)}
                                  >
                                    <PencilIcon className="h-3 w-3 mr-1" />
                                    Edit
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 px-2 text-xs text-orange-600 hover:text-orange-800 hover:bg-orange-50 border-orange-200"
                                    onClick={() => handleDeleteUserData(user)}
                                  >
                                    Delete Data
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 px-2 text-xs text-red-600 hover:text-red-800 hover:bg-red-50 border-red-200"
                                    onClick={() => handleDeleteUser(user)}
                                  >
                                    Delete User
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={6} className="h-24 text-center">
                              No users found
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="videos" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Video Management</CardTitle>
                <CardDescription>Manage workshop videos</CardDescription>
              </CardHeader>
              <CardContent>
                <SimpleVideoManagement />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="invites" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Invite Management</CardTitle>
                <CardDescription>Create and manage invite codes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Create New Invite</h3>
                    <form onSubmit={handleCreateInvite} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="email">Email Address</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="user@example.com"
                            value={newInvite.email}
                            onChange={(e) => setNewInvite({ ...newInvite, email: e.target.value })}
                            disabled={isSendingInvite}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="name">Name (Optional)</Label>
                          <Input
                            id="name"
                            placeholder="John Doe"
                            value={newInvite.name}
                            onChange={(e) => setNewInvite({ ...newInvite, name: e.target.value })}
                            disabled={isSendingInvite}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="role">Role</Label>
                          <Select
                            value={newInvite.role}
                            onValueChange={(value) => setNewInvite({ ...newInvite, role: value })}
                            disabled={isSendingInvite}
                          >
                            <SelectTrigger id="role">
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="facilitator">Facilitator</SelectItem>
                              <SelectItem value="participant">Participant</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <Button type="submit" className="mt-2" disabled={isSendingInvite}>
                        {isSendingInvite ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating...
                          </>
                        ) : (
                          <>
                            <UserPlus className="mr-2 h-4 w-4" />
                            Create Invite
                          </>
                        )}
                      </Button>
                    </form>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium">Active Invites</h3>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={fetchInvites}
                        disabled={isLoadingInvites}
                      >
                        {isLoadingInvites ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <RefreshCw className="h-4 w-4 mr-2" />
                        )}
                        Refresh
                      </Button>
                    </div>

                    {isLoadingInvites ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : (
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Invite Code</TableHead>
                              <TableHead>Email</TableHead>
                              <TableHead>Role</TableHead>
                              <TableHead>Created</TableHead>
                              <TableHead>Expires</TableHead>
                              <TableHead>Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {invites.length > 0 ? (
                              invites.map((invite) => (
                                <TableRow key={invite.id}>
                                  <TableCell className="font-mono">{invite.inviteCode}</TableCell>
                                  <TableCell>{invite.email}</TableCell>
                                  <TableCell>{invite.role}</TableCell>
                                  <TableCell>{formatDate(invite.createdAt)}</TableCell>
                                  <TableCell>{formatDate(invite.expiresAt)}</TableCell>
                                  <TableCell>
                                    {invite.usedAt ? (
                                      <div className="flex items-center">
                                        <Check className="h-4 w-4 text-green-500 mr-2" />
                                        Used
                                      </div>
                                    ) : (
                                      <div className="flex items-center">
                                        <Mail className="h-4 w-4 text-blue-500 mr-2" />
                                        Pending
                                      </div>
                                    )}
                                  </TableCell>
                                </TableRow>
                              ))
                            ) : (
                              <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                  No invites found
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information and settings.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateUser} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-organization">Organization</Label>
              <Input
                id="edit-organization"
                value={editForm.organization}
                onChange={(e) => setEditForm({ ...editForm, organization: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-jobTitle">Job Title</Label>
              <Input
                id="edit-jobTitle"
                value={editForm.jobTitle}
                onChange={(e) => setEditForm({ ...editForm, jobTitle: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role">Role</Label>
              <Select
                value={editForm.role}
                onValueChange={(value) => setEditForm({ ...editForm, role: value })}
              >
                <SelectTrigger id="edit-role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="facilitator">Facilitator</SelectItem>
                  <SelectItem value="participant">Participant</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3 border-t pt-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="reset-password"
                  checked={editForm.resetPassword}
                  onCheckedChange={(checked) => 
                    setEditForm({ 
                      ...editForm, 
                      resetPassword: checked as boolean,
                      newPassword: checked ? editForm.newPassword : ''
                    })
                  }
                />
                <Label htmlFor="reset-password" className="text-sm font-medium">
                  Reset password
                </Label>
              </div>
              {editForm.resetPassword && (
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <PasswordInput
                    id="new-password"
                    value={editForm.newPassword}
                    onChange={(e) => setEditForm({ ...editForm, newPassword: e.target.value })}
                    placeholder="Leave empty to generate random password"
                  />
                  <p className="text-xs text-muted-foreground">
                    Leave empty to generate a random password
                  </p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setEditDialogOpen(false)}
                disabled={isUpdatingUser}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isUpdatingUser}>
                {isUpdatingUser ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update User'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPage;