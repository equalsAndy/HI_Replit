
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
import { formatDistanceToNow } from 'date-fns';

interface Invite {
  id: number;
  inviteCode: string;
  email: string;
  role: string;
  name: string | null;
  createdAt: string;
  expiresAt: string | null;
  usedAt: string | null;
  isUsed: boolean;
  isExpired: boolean;
}

export const InviteManagement: React.FC = () => {
  const [invites, setInvites] = useState<Invite[]>([]);
  const [isLoadingInvites, setIsLoadingInvites] = useState(true);
  const [isSendingInvite, setIsSendingInvite] = useState(false);
  const [newInvite, setNewInvite] = useState({
    email: '',
    role: 'participant',
    name: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchInvites();
  }, []);

  const fetchInvites = async () => {
    setIsLoadingInvites(true);
    try {
      const response = await fetch('/api/admin/invites', {
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        // Process the invites to add computed properties
        const processedInvites = data.invites.map((invite: any) => ({
          ...invite,
          isUsed: !!invite.usedAt,
          isExpired: invite.expiresAt ? new Date(invite.expiresAt) < new Date() : false
        }));
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
      const response = await fetch('/api/admin/invites', {
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
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="facilitator">Facilitator</SelectItem>
                      <SelectItem value="participant">Participant</SelectItem>
                    </SelectContent>
                  </Select>
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
                      <TableHead>Created</TableHead>
                      <TableHead>Expires</TableHead>
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
                              {formatInviteCode(invite.inviteCode)}
                            </code>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() => copyToClipboard(invite.inviteCode)}
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
                        <TableCell>
                          {formatDistanceToNow(new Date(invite.createdAt), { addSuffix: true })}
                        </TableCell>
                        <TableCell>
                          {formatDistanceToNow(new Date(invite.expiresAt), { addSuffix: true })}
                        </TableCell>
                        <TableCell>
                          {invite.isUsed ? (
                            <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200">
                              <Check className="h-3 w-3 mr-1" /> Used
                            </Badge>
                          ) : invite.isExpired ? (
                            <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-200">
                              Expired
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
