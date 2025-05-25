import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, Check, X, Copy, RefreshCw, Trash2, Mail, Sparkles } from 'lucide-react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { formatDistanceToNow } from 'date-fns';

// Types
interface Invite {
  id: number;
  email: string;
  name: string;
  inviteCode: string;
  expiresAt: string;
  createdAt: string;
  role: 'admin' | 'facilitator' | 'participant';
  isExpired: boolean;
  isUsed: boolean;
}

// Form schema for new invites
const inviteSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  name: z.string().min(1, 'Name is required'),
  role: z.enum(['admin', 'facilitator', 'participant']),
  cohortId: z.number().optional(),
});

type InviteFormValues = z.infer<typeof inviteSchema>;

export function InviteManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedInvite, setSelectedInvite] = useState<Invite | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  
  // Query for fetching invites
  const { data: invites = [], isLoading: isLoadingInvites, refetch: refetchInvites } = useQuery({
    queryKey: ['/api/admin/invites'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/admin/invites');
      return res.json();
    },
  });
  
  // Form for creating new invites
  const form = useForm<InviteFormValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      email: '',
      name: '',
      role: 'participant',
    },
  });
  
  // Mutation for creating a new invite
  const createInviteMutation = useMutation({
    mutationFn: async (data: InviteFormValues) => {
      const response = await apiRequest('POST', '/api/admin/invites', data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Invite created',
        description: `Invite code: ${data.inviteCode}`,
      });
      
      // Reset form
      form.reset();
      
      // Refresh invites list
      queryClient.invalidateQueries({ queryKey: ['/api/admin/invites'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error creating invite',
        description: error.message || 'Failed to create invite. Please try again.',
        variant: 'destructive',
      });
    },
  });
  
  // Mutation for regenerating an invite code
  const regenerateInviteMutation = useMutation({
    mutationFn: async (inviteId: number) => {
      const response = await apiRequest('POST', `/api/admin/invites/${inviteId}/regenerate`);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Invite code regenerated',
        description: `New code: ${data.inviteCode}`,
      });
      
      // Refresh invites list
      queryClient.invalidateQueries({ queryKey: ['/api/admin/invites'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error regenerating code',
        description: error.message || 'Failed to regenerate invite code. Please try again.',
        variant: 'destructive',
      });
    },
  });
  
  // Mutation for deleting an invite
  const deleteInviteMutation = useMutation({
    mutationFn: async (inviteId: number) => {
      const response = await apiRequest('DELETE', `/api/admin/invites/${inviteId}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Invite deleted',
        description: 'The invite has been successfully deleted.',
      });
      
      // Close delete dialog
      setConfirmDeleteOpen(false);
      setSelectedInvite(null);
      
      // Refresh invites list
      queryClient.invalidateQueries({ queryKey: ['/api/admin/invites'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error deleting invite',
        description: error.message || 'Failed to delete invite. Please try again.',
        variant: 'destructive',
      });
    },
  });
  
  // Handler for creating a new invite
  const onSubmit = (values: InviteFormValues) => {
    createInviteMutation.mutate(values);
  };
  
  // Helper to copy invite code to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied to clipboard',
      description: 'The invite code has been copied to your clipboard.',
    });
  };
  
  // Format invite code for display (add hyphens for readability)
  const formatInviteCode = (code: string) => {
    if (!code || code.length !== 12) return code;
    return code.match(/.{1,4}/g)?.join('-') || code;
  };
  
  // Helper to determine role badge color
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
  
  return (
    <div className="space-y-6">
      <Tabs defaultValue="existing" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="existing">Existing Invites</TabsTrigger>
          <TabsTrigger value="create">Create New Invite</TabsTrigger>
        </TabsList>
        
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
                                      onClick={() => regenerateInviteMutation.mutate(invite.id)}
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
                                      onClick={() => {
                                        setSelectedInvite(invite);
                                        setConfirmDeleteOpen(true);
                                      }}
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
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => refetchInvites()}>
                Refresh
              </Button>
              
              <div className="text-sm text-muted-foreground">
                Total: {invites.length} invite{invites.length !== 1 ? 's' : ''}
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Tab for creating new invites */}
        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle>Create New Invite</CardTitle>
              <CardDescription>
                Generate a new invite code to allow a user to register.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter recipient's name" {...field} />
                        </FormControl>
                        <FormDescription>
                          The name of the person you're inviting.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="user@example.com" {...field} />
                        </FormControl>
                        <FormDescription>
                          The email address will be pre-filled during registration.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="facilitator">Facilitator</SelectItem>
                            <SelectItem value="participant">Participant</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          The role that will be assigned upon registration.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={createInviteMutation.isPending}
                  >
                    {createInviteMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Generate Invite Code
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Confirmation Dialog for Delete */}
      <Dialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Invite</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this invite? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {selectedInvite && (
            <div className="py-4">
              <div className="flex items-center gap-4 p-3 border rounded-md">
                <div>
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>{selectedInvite.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">{selectedInvite.name}</h4>
                  <p className="text-sm text-muted-foreground">{selectedInvite.email}</p>
                </div>
                <Badge className={getRoleBadgeColor(selectedInvite.role)}>
                  {selectedInvite.role}
                </Badge>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDeleteOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => selectedInvite && deleteInviteMutation.mutate(selectedInvite.id)}
              disabled={deleteInviteMutation.isPending}
            >
              {deleteInviteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}