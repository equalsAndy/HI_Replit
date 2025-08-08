
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
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, UserPlus, Mail, RefreshCw, Check, Copy, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Helper function to format invite codes
const formatInviteCode = (code: string) => {
  if (!code) return '';
  return code.replace(/(.{4})/g, '$1-').replace(/-$/, '');
};

// Helper function to safely format dates - completely rewritten to avoid any relative time formatting
const formatDate = (dateString: string) => {
  if (!dateString) return 'Unknown';
  
  try {
    // Parse PostgreSQL timestamp format: "2025-06-30 15:22:45.087482"
    let dateObj;
    if (dateString.includes(' ') && !dateString.includes('T')) {
      // Replace space with T and add Z for UTC timezone
      const isoString = dateString.replace(' ', 'T') + 'Z';
      dateObj = new Date(isoString);
    } else {
      dateObj = new Date(dateString);
    }
    
    // Validate the date
    if (isNaN(dateObj.getTime())) {
      return 'Invalid date';
    }
    
    // Format as absolute date/time: "Jun 30, 2025, 3:22 PM"
    return dateObj.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'Error formatting date';
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
  cohort_name?: string;
  organization_name?: string;
  cohort_id?: number;
  organization_id?: string;
  is_beta_tester?: boolean;
  isBetaTester?: boolean;
  is_test_user?: boolean;
  isTestUser?: boolean;
  user_is_beta_tester?: boolean;
  user_is_test_user?: boolean;
  [key: string]: any; // Allow additional properties for flexibility
}

interface Organization {
  id: string;
  name: string;
  description?: string;
}

interface Cohort {
  id: number;
  name: string;
  description?: string;
  organization_name?: string;
  ast_access: boolean;
  ia_access: boolean;
}

export const InviteManagement: React.FC = () => {
  const [invites, setInvites] = useState<Invite[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [isLoadingInvites, setIsLoadingInvites] = useState(true);
  const [isLoadingOrganizations, setIsLoadingOrganizations] = useState(false);
  const [isLoadingCohorts, setIsLoadingCohorts] = useState(false);
  const [isSendingInvite, setIsSendingInvite] = useState(false);
  const [userRole, setUserRole] = useState<string>('');
  const [newInvite, setNewInvite] = useState({
    email: '',
    role: 'participant',
    name: '',
    cohortId: '',
    organizationId: '',
    isBetaTester: false,
  });
  const { toast } = useToast();

  const fetchUserRole = async () => {
    try {
      console.log('🔍 InviteManagement: Fetching user role...');
      const response = await fetch('/api/auth/me', {
        credentials: 'include'
      });
      const data = await response.json();
      console.log('🔍 InviteManagement: Auth response:', data);
      if (data.success && data.user) {
        console.log('🔍 InviteManagement: Setting user role to:', data.user.role);
        setUserRole(data.user.role);
      } else {
        console.log('🔍 InviteManagement: No user data in response');
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
    }
  };

  const fetchOrganizations = async () => {
    setIsLoadingOrganizations(true);
    try {
      const response = await fetch('/api/facilitator/organizations', {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        setOrganizations(data.organizations);
      }
    } catch (error) {
      console.error('Error fetching organizations:', error);
    } finally {
      setIsLoadingOrganizations(false);
    }
  };

  const fetchCohorts = async () => {
    setIsLoadingCohorts(true);
    try {
      const response = await fetch('/api/facilitator/cohorts', {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        setCohorts(data.cohorts);
      }
    } catch (error) {
      console.error('Error fetching cohorts:', error);
    } finally {
      setIsLoadingCohorts(false);
    }
  };

  useEffect(() => {
    fetchUserRole();
  }, []);

  // Fetch invites and other data after userRole is determined
  useEffect(() => {
    if (userRole) {
      console.log('🔍 InviteManagement: userRole determined, fetching invites:', userRole);
      fetchInvites();
      if (userRole === 'facilitator') {
        fetchOrganizations();
        fetchCohorts();
      }
    }
  }, [userRole]);

  // Debug useEffect to track userRole changes
  useEffect(() => {
    console.log('🔍 InviteManagement: userRole state changed to:', userRole);
  }, [userRole]);

  const fetchInvites = async () => {
    console.log('🔍 InviteManagement: fetchInvites called, userRole:', userRole);
    setIsLoadingInvites(true);
    try {
      // Use role-appropriate endpoint
      const endpoint = userRole === 'admin' ? '/api/admin/invites' : '/api/invites';
      console.log('🔍 InviteManagement: Fetching from endpoint:', endpoint);
      const response = await fetch(endpoint, {
        credentials: 'include'
      });

      const data = await response.json();
      console.log('🔍 InviteManagement: API response:', data);

      if (data.success) {
        console.log('🔍 InviteManagement: Processing', data.invites?.length, 'invites');
        // Process the invites to add computed properties and normalize property names
        const processedInvites = data.invites.map((invite: any) => {
          console.log('🔍 InviteManagement: Processing invite:', invite);
          return {
            ...invite,
            inviteCode: invite.inviteCode || invite.invite_code,
            createdAt: invite.createdAt || invite.created_at,
            isUsed: !!invite.usedAt || !!invite.used_at
          };
        });
        console.log('🔍 InviteManagement: Processed invites:', processedInvites);
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
      const inviteData = {
        ...newInvite,
        cohortId: newInvite.cohortId && newInvite.cohortId !== 'none' ? newInvite.cohortId : null,
        organizationId: newInvite.organizationId && newInvite.organizationId !== 'none' ? newInvite.organizationId : null
      };

      // Use role-appropriate endpoint for invite creation
      const endpoint = userRole === 'admin' ? '/api/admin/invites' : '/api/invites';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(inviteData),
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
          cohortId: '',
          organizationId: '',
          isBetaTester: false,
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
              
              {/* Beta Tester Checkbox - show for admins */}
              <div className="pt-4 border-t">
                <div className="text-xs text-muted-foreground mb-2">
                  Debug: Current user role = "{userRole}"
                </div>
                {userRole === 'admin' ? (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="betaTester"
                      checked={newInvite.isBetaTester}
                      onCheckedChange={(checked) => 
                        setNewInvite({ ...newInvite, isBetaTester: !!checked })
                      }
                      disabled={isSendingInvite}
                    />
                    <Label htmlFor="betaTester" className="text-sm font-medium">
                      Beta Tester
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Mark this user as a beta tester with enhanced access and features
                    </p>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    Beta Tester checkbox only available for admin users (current: {userRole})
                  </div>
                )}
              </div>
              
              {/* Cohort and Organization Assignment Section for Facilitators */}
              {userRole === 'facilitator' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t">
                  <div className="space-y-2">
                    <Label htmlFor="organization">Organization (Optional)</Label>
                    <Select
                      value={newInvite.organizationId}
                      onValueChange={(value) => setNewInvite({ ...newInvite, organizationId: value })}
                      disabled={isSendingInvite || isLoadingOrganizations}
                    >
                      <SelectTrigger id="organization">
                        <SelectValue placeholder="Select organization" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No organization</SelectItem>
                        {organizations.map((org) => (
                          <SelectItem key={org.id} value={org.id}>
                            {org.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {isLoadingOrganizations && (
                      <p className="text-sm text-muted-foreground">Loading organizations...</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cohort">Cohort (Optional)</Label>
                    <Select
                      value={newInvite.cohortId}
                      onValueChange={(value) => setNewInvite({ ...newInvite, cohortId: value })}
                      disabled={isSendingInvite || isLoadingCohorts}
                    >
                      <SelectTrigger id="cohort">
                        <SelectValue placeholder="Select cohort" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No cohort</SelectItem>
                        {cohorts.map((cohort) => (
                          <SelectItem key={cohort.id} value={cohort.id.toString()}>
                            {cohort.name} {cohort.organization_name ? `(${cohort.organization_name})` : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {isLoadingCohorts && (
                      <p className="text-sm text-muted-foreground">Loading cohorts...</p>
                    )}
                  </div>
                </div>
              )}
              
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
                      <TableHead>Beta Tester</TableHead>
                      <TableHead>Test User</TableHead>
                      <TableHead>Organization</TableHead>
                      <TableHead>Cohort</TableHead>
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
                        <TableCell>
                          {invite.is_beta_tester || invite.isBetaTester || invite.user_is_beta_tester ? (
                            <Badge variant="outline" className="bg-purple-50 text-purple-800 border-purple-200">
                              Beta Tester
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {invite.is_test_user || invite.isTestUser || invite.user_is_test_user ? (
                            <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-200">
                              Test User
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {invite.organization_name ? (
                            <span className="text-sm">{invite.organization_name}</span>
                          ) : (
                            <span className="text-muted-foreground text-sm">No organization</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {invite.cohort_name ? (
                            <span className="text-sm">{invite.cohort_name}</span>
                          ) : (
                            <span className="text-muted-foreground text-sm">No cohort</span>
                          )}
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
