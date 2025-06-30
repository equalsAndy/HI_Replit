
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Loader2, UserPlus, Mail, RefreshCw, Check, Copy, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Helper function to format invite codes
const formatInviteCode = (code: string) => {
  if (!code) return '';
  return code.replace(/(.{4})/g, '$1-').replace(/-$/, '');
};

// Helper function to safely format dates
const formatDate = (dateString: string) => {
  console.log('Formatting date:', dateString);
  if (!dateString) return 'Unknown';
  try {
    // Handle different date formats from backend
    let date;
    if (dateString.includes(' ') && !dateString.includes('T')) {
      // Handle PostgreSQL timestamp format: "2025-06-30 15:22:45.087482"
      date = new Date(dateString.replace(' ', 'T') + 'Z');
    } else {
      date = new Date(dateString);
    }
    
    console.log('Parsed date:', date);
    
    if (isNaN(date.getTime())) {
      console.log('Invalid date detected');
      return 'Invalid date';
    }
    
    // Format as a readable date instead of relative time
    const formatted = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    console.log('Formatted result:', formatted);
    return formatted;
  } catch (error) {
    console.error('Date formatting error:', error, 'for date:', dateString);
    return 'Invalid date';
  }
};

interface Invite {
  id: number;
  inviteCode?: string;
  invite_code?: string;
  email: string;
  role: string;
  name: string | null;
  createdAt: string;
  expiresAt: string | null;
  usedAt: string | null;
  isUsed: boolean;
  creator_name?: string;
  creator_email?: string;
  creator_role?: string;
  [key: string]: any; // Allow additional properties for flexibility
}

export const InviteManagement: React.FC = () => {
  const [invites, setInvites] = useState<Invite[]>([]);
  const [isLoadingInvites, setIsLoadingInvites] = useState(true);
  const [isSendingInvite, setIsSendingInvite] = useState(false);
  const [userRole, setUserRole] = useState<string>('');
  const [newInvite, setNewInvite] = useState({
    email: '',
    role: 'participant',
    name: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchUserRole();
    fetchInvites();
  }, []);

  const fetchUserRole = async () => {
    try {
      const response = await fetch('/api/user/profile', {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success && data.user) {
        setUserRole(data.user.role);
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
    }
  };

  const fetchInvites = async () => {
    setIsLoadingInvites(true);
    try {
      // Use role-appropriate endpoint
      const endpoint = userRole === 'admin' ? '/api/admin/invites' : '/api/invites';
      const response = await fetch(endpoint, {
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        // Process the invites to add computed properties and normalize property names
        const processedInvites = data.invites.map((invite: any) => {
          console.log('Processing invite:', invite);
          return {
            ...invite,
            inviteCode: invite.inviteCode || invite.invite_code,
            createdAt: invite.createdAt || invite.created_at,
            isUsed: !!invite.usedAt || !!invite.used_at
          };
        });
        setInvites(processedInvites);
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
      // Use role-appropriate endpoint for invite creation
      const endpoint = userRole === 'admin' ? '/api/admin/invites' : '/api/invites';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
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

  const handleDeleteInvite = async (inviteId: number) => {
    if (!confirm('Are you sure you want to delete this invite?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/invites/${inviteId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Invite deleted',
          description: 'Invite has been successfully deleted.',
        });
        fetchInvites();
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: data.error || 'Failed to delete invite',
        });
      }
    } catch (error) {
      console.error('Error deleting invite:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete invite. Please try again later.',
      });
    }
  };

  const formatInviteCode = (code: string) => {
    // Add dashes every 4 characters for readability
    return code.replace(/(.{4})/g, '$1-').slice(0, -1);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: 'Copied!',
        description: 'Invite code copied to clipboard.',
      });
    } catch (error) {
      console.error('Failed to copy:', error);
      toast({
        variant: 'destructive',
        title: 'Copy failed',
        description: 'Failed to copy invite code to clipboard.',
      });
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      case 'facilitator':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'participant':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'student':
        return 'bg-purple-100 text-purple-800 hover:bg-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  return (
    <Tabs defaultValue="create" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="create">Create Invite</TabsTrigger>
        <TabsTrigger value="existing">Manage Invites</TabsTrigger>
      </TabsList>
      
      {/* Tab for creating new invites */}
      <TabsContent value="create" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Create New Invite</CardTitle>
            <CardDescription>
              Generate an invitation code for a new user to join the workshop.
            </CardDescription>
          </CardHeader>
          <CardContent>
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
                      {userRole === 'admin' && (
                        <>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="facilitator">Facilitator</SelectItem>
                        </>
                      )}
                      <SelectItem value="participant">Participant</SelectItem>
                      <SelectItem value="student">Student</SelectItem>
                    </SelectContent>
                  </Select>
                  {userRole === 'facilitator' && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Facilitators can only create participant and student invites
                    </p>
                  )}
                </div>
              </div>
              <Button type="submit" className="mt-4" disabled={isSendingInvite}>
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
          </CardContent>
        </Card>
      </TabsContent>
      
      {/* Tab for viewing existing invites */}
      <TabsContent value="existing" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Invite Codes</CardTitle>
            <CardDescription>
              Manage existing invite codes and their status.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingInvites ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : invites.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <p>No invite codes found. Create a new one to get started.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Invite Code</TableHead>
                      <TableHead>Role</TableHead>
                      {userRole === 'admin' && <TableHead>Created By</TableHead>}
                      <TableHead>Created</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invites.map((invite: Invite) => (
                      <TableRow key={invite.id}>
                        <TableCell className="font-medium">{invite.name}</TableCell>
                        <TableCell>{invite.email}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <code className="bg-muted px-1 py-0.5 rounded text-sm">
                              {formatInviteCode(invite.inviteCode || invite.invite_code)}
                            </code>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() => copyToClipboard(invite.inviteCode || invite.invite_code)}
                                  >
                                    <Copy className="h-3.5 w-3.5" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Copy invite code</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getRoleBadgeColor(invite.role)}>
                            {invite.role.charAt(0).toUpperCase() + invite.role.slice(1)}
                          </Badge>
                        </TableCell>
                        {userRole === 'admin' && (
                          <TableCell>
                            {invite.creator_name ? (
                              <div className="text-sm">
                                <div className="font-medium">{invite.creator_name}</div>
                                <div className="text-muted-foreground text-xs">{invite.creator_email}</div>
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-sm">Unknown</span>
                            )}
                          </TableCell>
                        )}
                        <TableCell>
                          {(() => {
                            const dateValue = invite.createdAt || invite.created_at;
                            console.log('Date value for invite', invite.id, ':', dateValue);
                            const result = formatDate(dateValue);
                            console.log('Formatted result:', result);
                            return result;
                          })()}
                        </TableCell>
                        <TableCell>
                          {invite.isUsed ? (
                            <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200">
                              <Check className="h-3 w-3 mr-1" /> Used
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-green-50 text-green-800 border-green-200">
                              Active
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-1">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    disabled={invite.isUsed}
                                    onClick={() => {/* TODO: Add regenerate functionality */}}
                                  >
                                    <RefreshCw className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Regenerate code</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-red-600 hover:text-red-800 hover:bg-red-50"
                                    onClick={() => handleDeleteInvite(invite.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Delete invite</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
            
            <div className="flex justify-end mt-4">
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
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};
