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
import { Loader2, Check, X, UserPlus, KeyRound, Trash2, Mail, PencilIcon, UndoIcon, Download, Database, UserX } from 'lucide-react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
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
interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  organization?: string;
  jobTitle?: string;
  profilePicture?: string;
  role: 'admin' | 'facilitator' | 'participant';
  isTestUser: boolean;
  progress?: number;
  hasAssessment?: boolean;
  hasStarCard?: boolean;
  hasFlowAttributes?: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  isDeleted: boolean;
}

// Form schema for creating new users (direct creation by admin)
const createUserSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username cannot exceed 20 characters')
    .regex(/^[a-z0-9][a-z0-9_\-]*[a-z0-9]$/i, 'Username must start and end with letter or number, and contain only letters, numbers, underscores, and hyphens'),
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Please enter a valid email').optional(),
  organization: z.string().max(30, 'Organization cannot exceed 30 characters').optional(),
  jobTitle: z.string().max(30, 'Job title cannot exceed 30 characters').optional(),
  role: z.enum(['admin', 'facilitator' | 'participant']),
  generatePassword: z.boolean().default(true),
});

type CreateUserFormValues = z.infer<typeof createUserSchema>;

// Form schema for editing users
const editUserSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Please enter a valid email').optional(),
  organization: z.string().max(30, 'Organization cannot exceed 30 characters').optional(),
  jobTitle: z.string().max(30, 'Job title cannot exceed 30 characters').optional(),
  role: z.enum(['admin', 'facilitator' | 'participant']),
  resetPassword: z.boolean().default(false),
  newPassword: z.string().optional(),
  setCustomPassword: z.boolean().default(false),
}).refine((data) => {
  if (data.setCustomPassword && (!data.newPassword || data.newPassword.length < 6)) {
    return false;
  }
  return true;
}, {
  message: "Password must be at least 6 characters when setting custom password",
  path: ["newPassword"],
});

type EditUserFormValues = z.infer<typeof editUserSchema>;

// Password Input Component
const PasswordInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
      <div className="relative">
        <Input
          type={showPassword ? 'text' : 'password'}
          className={className}
          {...props}
          ref={ref}
        />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-2 top-1/2 -translate-y-1/2"
          type="button"
        >
          {showPassword ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-5 w-5"
            >
              <path
                fillRule="evenodd"
                d="M3.28 2.22a.75.75 0 00-1.06 1.06l14.5 14.5a.75.75 0 101.06-1.06l-1.72-1.72a4.5 4.5 0 00-6.36-6.36L3.28 2.22zM14.72 5.28a4.5 4.5 0 00-6.36 6.36L3.28 17.78a.75.75 0 001.06 1.06l1.72-1.72a4.5 4.5 0 006.36-6.36L14.72 5.28zM10 7a3 3 0 110 6 3 3 0 010-6z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-5 w-5"
            >
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path
                fillRule="evenodd"
                d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14.083 10a4 4 0 10-8.166 0c0 1.017.372 2.032 1.06 2.904.243.294.487.588.733.884-.083.03-.168.061-.253.091-.666.222-1.345.413-2.034.57a1.012 1.012 0 00-.215 1.06c1.129.38 2.332.61 3.551.789a.75.75 0 00.747-.805c-.002-.246.009-.492.031-.736.151-.453.37.899.522 1.352.022.244.033.49.031.736a.75.75 0 00.747.805c1.219-.179 2.422-.408 3.551-.789a1.012 1.012 0 00-.215-1.06c-.69-.157-1.368-.348-2.034-.57a1.22 1.22 0 01-.253-.091.968.968 0 01.733-.884 3.979 3.979 0 001.06-2.904z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </Button>
      </div>
    );
  }
);
PasswordInput.displayName = "PasswordInput";

export function UserManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [confirmDeleteDataOpen, setConfirmDeleteDataOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [includeDeleted, setIncludeDeleted] = useState(false);

  // Query for fetching users
  const { data: users = [], isLoading: isLoadingUsers, refetch: refetchUsers } = useQuery({
    queryKey: ['/api/admin/users', includeDeleted],
    queryFn: async () => {
      const data = await apiRequest(`/api/admin/users?includeDeleted=${includeDeleted}`, {
        method: 'GET',
      });
      console.log('User data response:', data);
      return data.users || [];
    },
  });

  // Form for creating new users
  const createForm = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      username: '',
      name: '',
      email: '',
      organization: '',
      jobTitle: '',
      role: 'participant',
      generatePassword: true,
    },
  });

  // Form for editing users
  const editForm = useForm<EditUserFormValues>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      name: '',
      email: '',
      organization: '',
      jobTitle: '',
      role: 'participant',
      resetPassword: false,
      newPassword: '',
      setCustomPassword: false,
    },
  });

  // Mutation for creating a new user
  const createUserMutation = useMutation({
    mutationFn: async (data: CreateUserFormValues) => {
      return await apiRequest('/api/admin/users', {
        method: 'POST',
        body: data,
      });
    },
    onSuccess: (data) => {
      toast({
        title: 'User created successfully',
        description: data.temporaryPassword 
          ? `Temporary password: ${data.temporaryPassword}` 
          : 'The user has been created.',
      });

      // Reset form
      createForm.reset();

      // Refresh users list
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error creating user',
        description: error.message || 'Failed to create user. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Mutation for updating a user
  const updateUserMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: EditUserFormValues }) => {
      return await apiRequest(`/api/admin/users/${id}`, {
        method: 'PUT',
        body: data,
      });
    },
    onSuccess: (data) => {
      toast({
        title: 'User updated successfully',
        description: data.temporaryPassword 
          ? `New temporary password: ${data.temporaryPassword}` 
          : 'The user has been updated.',
      });

      // Close edit dialog
      setEditDialogOpen(false);
      setSelectedUser(null);

      // Refresh users list
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error updating user',
        description: error.message || 'Failed to update user. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Mutation for deleting a user
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      return await apiRequest(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      toast({
        title: 'User deleted',
        description: 'The user has been successfully deleted.',
      });

      // Close delete dialog
      setConfirmDeleteOpen(false);
      setSelectedUser(null);

      // Refresh users list
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error deleting user',
        description: error.message || 'Failed to delete user. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Mutation for deleting user data (keeping profile and password)
  const deleteUserDataMutation = useMutation({
    mutationFn: async (userId: number) => {
      return await apiRequest(`/api/admin/users/${userId}/data`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      toast({
        title: 'User data deleted',
        description: 'All user assessment and progress data has been deleted.',
      });

      // Close delete data dialog
      setConfirmDeleteDataOpen(false);
      setSelectedUser(null);

      // Refresh users list
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error deleting user data',
        description: error.message || 'Failed to delete user data. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Mutation for restoring a deleted user
  const restoreUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      return await apiRequest(`/api/admin/users/${userId}/restore`, {
        method: 'PUT',
      });
    },
    onSuccess: () => {
      toast({
        title: 'User restored',
        description: 'The user has been successfully restored.',
      });

      // Refresh users list
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error restoring user',
        description: error.message || 'Failed to restore user. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Track loading state per user
  const [loadingUsers, setLoadingUsers] = useState<Set<number>>(new Set());

  // User data export mutation
  const exportUserDataMutation = useMutation({
    mutationFn: async (userId: number) => {
      setLoadingUsers(prev => new Set(prev).add(userId));

      const response = await fetch(`/api/admin/users/${userId}/export`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Export failed');
      }

      // Get the filename from the Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition');
      const filename = contentDisposition
        ? contentDisposition.split('filename=')[1]?.replace(/"/g, '')
        : `user-export-${Date.now()}.json`;

      // Get the JSON data
      const exportData = await response.json();

      // Create a blob and download
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return userId;
    },
    onSuccess: (userId) => {
      setLoadingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
      toast({
        title: 'Export successful',
        description: `User data for ${users.find(user => user.id === userId)?.username} has been downloaded.`,
      });
    },
    onError: (error: any, userId) => {
      setLoadingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
      toast({
        title: 'Export failed',
        description: error.message || 'Failed to export user data. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Mutation for toggling test user status
  const toggleTestUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      return await apiRequest(`/api/admin/users/${userId}/test-status`, {
        method: 'PUT',
      });
    },
    onSuccess: (data) => {
      const isNowTestUser = data.user?.isTestUser;
      toast({
        title: 'Test user status updated',
        description: `User is ${isNowTestUser ? 'now' : 'no longer'} a test user.`,
      });

      // Refresh users list
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error updating test user status',
        description: error.message || 'Failed to update test user status. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Handler for creating a new user
  const onCreateSubmit = (values: CreateUserFormValues) => {
    createUserMutation.mutate(values);
  };

  // Handler for editing a user
  const onEditSubmit = (values: EditUserFormValues) => {
    if (selectedUser) {
      updateUserMutation.mutate({ id: selectedUser.id, data: values });
    }
  };

  // Open edit dialog and populate form with user data
  const handleEditUser = (user: User) => {
    setSelectedUser(user);

    editForm.reset({
      name: user.name,
      email: user.email,
      organization: user.organization || '',
      jobTitle: user.jobTitle || '',
      role: user.role as 'admin' | 'facilitator' | 'participant',
      resetPassword: false,
      newPassword: '',
      setCustomPassword: false,
    });

    setEditDialogOpen(true);
  };

  // Handler for toggling test user status
  const handleToggleTestUser = (userId: number) => {
    toggleTestUserMutation.mutate(userId);
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

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="existing" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="existing">Manage Users</TabsTrigger>
          <TabsTrigger value="create">Create New User</TabsTrigger>
        </TabsList>

        {/* Tab for managing existing users */}
        <TabsContent value="existing" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                  Manage user accounts and their roles.
                </CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">Include deleted users</span>
                <Switch 
                  checked={includeDeleted} 
                  onCheckedChange={setIncludeDeleted} 
                  aria-label="Toggle deleted users"
                />
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingUsers ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : users.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  <p>No users found. Create a new user to get started.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <div className="min-w-[1200px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[60px]">ID</TableHead>
                          <TableHead className="min-w-[180px]">User</TableHead>
                          <TableHead className="w-[100px]">Username</TableHead>
                          <TableHead className="w-[80px]">Role</TableHead>
                          <TableHead className="w-[120px]">Current Step</TableHead>
                          <TableHead className="w-[100px]">Created</TableHead>
                          <TableHead className="w-[70px]">Status</TableHead>
                          <TableHead className="min-w-[320px] sticky right-0 bg-white border-l">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                    <TableBody>
                      {users.map((user: User) => (
                        <TableRow key={user.id} className={user.isDeleted ? 'bg-gray-50 opacity-70' : ''}>
                          <TableCell className="w-[60px]">
                            <span className="font-mono text-xs text-muted-foreground">#{user.id}</span>
                          </TableCell>
                          <TableCell className="min-w-[180px]">
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-8 w-8 flex-shrink-0">
                                {user.profilePicture ? (
                                  <AvatarImage src={user.profilePicture} alt={user.name} />
                                ) : (
                                  <AvatarFallback className="text-xs">{getInitials(user.name)}</AvatarFallback>
                                )}
                              </Avatar>
                              <div className="space-y-0.5 min-w-0">
                                <p className="font-medium text-sm truncate">{user.name}</p>
                                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="w-[100px]">
                            <span className="text-sm truncate block">{user.username}</span>
                          </TableCell>
                          <TableCell className="w-[80px]">
                            <Badge className={`${getRoleBadgeColor(user.role)} text-xs px-1.5 py-0.5`}>
                              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell className="w-[120px]">
                            <div className="space-y-1">
                              {(() => {
                                let currentStep = 'Not Started';
                                let stepType = 'not-started';

                                // First check if user has any assessment data regardless of navigation progress
                                const hasAnyData = user.hasAssessment || user.hasStarCard || user.hasFlowAttributes;

                                // Determine progress based on actual assessment data first
                                const determineStepFromData = () => {
                                  // If user has all three types of data, they've likely completed most of the workshop
                                  if (user.hasAssessment && user.hasStarCard && user.hasFlowAttributes) {
                                    return { step: 'Near Complete (3-4)', type: 'active' };
                                  }
                                  // If user has star card and flow attributes but no assessment, they're in flow section
                                  else if (user.hasStarCard && user.hasFlowAttributes) {
                                    return { step: 'Flow Section (3-2)', type: 'active' };
                                  }
                                  // If user only has star card, they're past the star card creation
                                  else if (user.hasStarCard) {
                                    return { step: 'Star Review (2-3)', type: 'active' };
                                  }
                                  // If user has any assessment data, they've started
                                  else if (hasAnyData) {
                                    return { step: 'In Progress', type: 'active' };
                                  }
                                  return null;
                                };

                                if (user.navigationProgress) {
                                  try {
                                    const progress = JSON.parse(user.navigationProgress);
                                    const completedSteps = progress.completedSteps || [];
                                    const currentStepId = progress.currentStepId;

                                    // Check if user completed final reflection (3-4 for AllStarTeams)
                                    if (completedSteps.includes('3-4')) {
                                      currentStep = 'Complete';
                                      stepType = 'complete';
                                    } else if (currentStepId) {
                                      currentStep = currentStepId;
                                      stepType = 'active';
                                    } else if (completedSteps.length > 0) {
                                      // Get the last completed step
                                      const lastStep = completedSteps[completedSteps.length - 1];
                                      currentStep = `${lastStep} ✓`;
                                      stepType = 'completed';
                                    } else {
                                      // No progress in navigation but check actual data
                                      const dataBasedStep = determineStepFromData();
                                      if (dataBasedStep) {
                                        currentStep = dataBasedStep.step;
                                        stepType = dataBasedStep.type;
                                      }
                                    }
                                  } catch (e) {
                                    // If parsing fails, use data-based assessment
                                    const dataBasedStep = determineStepFromData();
                                    if (dataBasedStep) {
                                      currentStep = dataBasedStep.step;
                                      stepType = dataBasedStep.type;
                                    }
                                  }
                                } else {
                                  // No navigation progress, use data-based assessment
                                  const dataBasedStep = determineStepFromData();
                                  if (dataBasedStep) {
                                    currentStep = dataBasedStep.step;
                                    stepType = dataBasedStep.type;
                                  }
                                }

                                const getStepColor = () => {
                                  switch (stepType) {
                                    case 'complete': return 'text-green-700 bg-green-50 border-green-200';
                                    case 'active': return 'text-blue-700 bg-blue-50 border-blue-200';
                                    case 'completed': return 'text-purple-700 bg-purple-50 border-purple-200';
                                    default: return 'text-gray-500 bg-gray-50 border-gray-200';
                                  }
                                };

                                return (
                                  <div className={`px-2 py-1 rounded border text-xs font-medium text-center ${getStepColor()}`}>
                                    {currentStep}
                                  </div>
                                );
                              })()}

                              <div className="flex items-center justify-center gap-1 mt-1">
                                {user.hasAssessment && (
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger>
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Has Assessment Data</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                )}
                                {user.hasStarCard && (
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger>
                                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Has Star Card Data</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                )}
                                {user.hasFlowAttributes && (
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger>
                                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Has Flow Attributes Data</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="w-[100px]">
                            <span className="text-xs truncate block">
                              {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                            </span>
                          </TableCell>
                          <TableCell className="w-[70px]">
                            {user.isDeleted ? (
                              <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200 text-xs px-1.5 py-0.5">
                                Deleted
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-green-50 text-green-800 border-green-200 text-xs px-1.5 py-0.5">
                                Active
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="min-w-[320px] sticky right-0 bg-white border-l">
                            <TooltipProvider>
                              <div className="flex items-center gap-1 justify-start">
                                {!user.isDeleted && (
                                  <>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="h-8 px-3 text-xs hover:bg-blue-50 border-blue-200 text-blue-600 hover:text-blue-800"
                                          onClick={() => handleEditUser(user)}
                                        >
                                          <PencilIcon className="h-3 w-3 mr-1" />
                                          Edit
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Edit user profile</p>
                                      </TooltipContent>
                                    </Tooltip>

                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="h-8 px-3 text-xs text-green-600 hover:text-green-800 hover:bg-green-50 border-green-200"
                                          onClick={() => exportUserDataMutation.mutate(user.id)}
                                          disabled={loadingUsers.has(user.id)}
                                        >
                                          {loadingUsers.has(user.id) ? (
                                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                          ) : (
                                            <Download className="h-3 w-3 mr-1" />
                                          )}
                                          Download
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Download all user data as JSON file</p>
                                      </TooltipContent>
                                    </Tooltip>

                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="h-8 px-3 text-xs text-orange-600 hover:text-orange-800 hover:bg-orange-50 border-orange-200"
                                          onClick={() => {
                                            setSelectedUser(user);
                                            setConfirmDeleteDataOpen(true);
                                          }}
                                        >
                                          <Database className="h-3 w-3 mr-1" />
                                          Clear Data
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Delete all user assessment and progress data</p>
                                      </TooltipContent>
                                    </Tooltip>

                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="h-8 px-3 text-xs text-red-600 hover:text-red-800 hover:bg-red-50 border-red-200"
                                          onClick={() => {
                                            setSelectedUser(user);
                                            setConfirmDeleteOpen(true);
                                          }}
                                        >
                                          <UserX className="h-3 w-3 mr-1" />
                                          Delete User
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Delete user account completely</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </>
                                )}

                                {user.isDeleted && (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="outline"
                                        size="sm"className="h-8 px-3 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 border-blue-200"
                                        onClick={() => restoreUserMutation.mutate(user.id)}
                                      >
                                        <UndoIcon className="h-3 w-3 mr-1" />
                                        Restore
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Restore deleted user account</p>
                                    </TooltipContent>
                                  </Tooltip>
                                )}
                              </div>
                            </TooltipProvider>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => refetchUsers()}>
                Refresh
              </Button>

              <div className="text-sm text-muted-foreground">
                Total: {users.length} user{users.length !== 1 ? 's' : ''}
              </div>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Tab for creating new users */}
        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle>Create New User</CardTitle>
              <CardDescription>
                Create a new user account directly (without invite code).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...createForm}>
                <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField
                      control={createForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter user's full name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={createForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input placeholder="Choose a unique username" {...field} />
                          </FormControl>
                          <FormDescription>
                            3-20 characters, letters, numbers, hyphens, and underscores
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={createForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="user@example.com" {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField
                      control={createForm.control}
                      name="organization"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Organization (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="User's organization" {...field} value={field.value || ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={createForm.control}
                      name="jobTitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Job Title (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="User's job title" {...field} value={field.value || ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField
                      control={createForm.control}
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
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={createForm.control}
                      name="generatePassword"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-end space-x-3 space-y-0 rounded-md border p-3">
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Generate temporary password</FormLabel>
                            <FormDescription>
                              System will generate a secure random password
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={createUserMutation.isPending}
                  >
                    {createUserMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Create User
                  </Button>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="text-sm text-muted-foreground">
              <p>
                <span className="font-medium">Note:</span> For large groups, consider using invite codes instead of manual creation.
              </p>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information and role.
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
                <FormField
                  control={editForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="organization"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Organization</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
                    name="jobTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Job Title</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex flex-col justify-end">
                    <div className="flex items-center space-x-3 rounded-md border p-3">
                      <Switch 
                        checked={selectedUser?.isTestUser || false}
                        onCheckedChange={() => selectedUser && handleToggleTestUser(selectedUser.id)}
                        aria-label="Toggle test user status"
                        className="data-[state=checked]:bg-amber-500"
                      />
                      <div className="space-y-1 leading-none">
                        <label className="text-sm font-medium">Test User</label>
                        <p className="text-xs text-muted-foreground">
                          Mark as test account
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <FormField
                    control={editForm.control}
                    name="resetPassword"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3">
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={(checked) => {
                              field.onChange(checked);
                              if (checked) {
                                editForm.setValue('setCustomPassword', false);
                                editForm.setValue('newPassword', '');
                              }
                            }}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Reset password</FormLabel>
                          <FormDescription>
                            Generate a new temporary password for this user
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
                    name="setCustomPassword"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3">
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={(checked) => {
                              field.onChange(checked);
                              if (checked) {
                                editForm.setValue('resetPassword', false);
                              } else {
                                editForm.setValue('newPassword', '');
                              }
                            }}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Set custom password</FormLabel>
                          <FormDescription>
                            Manually set a specific password for this user
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  {editForm.watch('setCustomPassword') && (
                    <FormField
                      control={editForm.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>New Password</FormLabel>
                          <FormControl>
                            <PasswordInput
                              {...field}
                              placeholder="Enter new password"
                            />
                          </FormControl>
                          <FormDescription>
                            Enter a custom password for this user
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>

                <DialogFooter className="mt-6">
                  <Button variant="outline" type="button" onClick={() => setEditDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    disabled={updateUserMutation.isPending}
                  >
                    {updateUserMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Save Changes
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog for Delete User */}
      <Dialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              This will deactivate the user account. The user data will be preserved but they won't be able to log in.
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="py-4">
              <div className="flex items-center gap-4 p-3 border rounded-md">
                <div>
                  <Avatar className="h-10 w-10">
                    {selectedUser.profilePicture ? (
                      <AvatarImage src={selectedUser.profilePicture} alt={selectedUser.name} />
                    ) : (
                      <AvatarFallback>{getInitials(selectedUser.name)}</AvatarFallback>
                    )}
                  </Avatar>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">{selectedUser.name}</h4>
                  <p className="text-sm text-muted-foreground">{selectedUser.username}</p>
                </div>
                <Badge className={getRoleBadgeColor(selectedUser.role)}>
                  {selectedUser.role}
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
              onClick={() => selectedUser && deleteUserMutation.mutate(selectedUser.id)}
              disabled={deleteUserMutation.isPending}
            >
              {deleteUserMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog for Delete User Data */}
      <Dialog open={confirmDeleteDataOpen} onOpenChange={setConfirmDeleteDataOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User Data</DialogTitle>
            <DialogDescription>
              This will permanently delete all assessment data, progress, and workshop results for this user. 
              The user profile and login credentials will be preserved. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="py-4">
              <div className="flex items-center gap-4 p-3 border rounded-md">
                <div>
                  <Avatar className="h-10 w-10">
                    {selectedUser.profilePicture ? (
                      <AvatarImage src={selectedUser.profilePicture} alt={selectedUser.name} />
                    ) : (
                      <AvatarFallback>{getInitials(selectedUser.name)}</AvatarFallback>
                    )}
                  </Avatar>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">{selectedUser.name}</h4>
                  <p className="text-sm text-muted-foreground">{selectedUser.username}</p>
                </div>
                <Badge className={getRoleBadgeColor(selectedUser.role)}>
                  {selectedUser.role}
                </Badge>
              </div>

              <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-md">
                <h5 className="font-medium text-orange-800 mb-2">Data to be deleted:</h5>
                <ul className="text-sm text-orange-700 space-y-1">
                  <li>• Star card assessments</li>
                  <li>• Flow attribute data</li>
                  <li>• Workshop progress</li>
                  <li>• Assessment results</li>
                  <li>• Navigation history</li>
                </ul>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDeleteDataOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => selectedUser && deleteUserDataMutation.mutate(selectedUser.id)}
              disabled={deleteUserDataMutation.isPending}
            >
              {deleteUserDataMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete Data
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}