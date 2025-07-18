import React, { useState, useEffect } from 'react';
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
import { Loader2, Check, X, UserPlus, KeyRound, Trash2, Mail, PencilIcon, UndoIcon, Download, Database, UserX, EyeIcon } from 'lucide-react';
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
  role: 'admin' | 'facilitator' | 'participant' | 'student';
  isTestUser: boolean;
  // Access control fields
  contentAccess: 'student' | 'professional' | 'both';
  astAccess: boolean;
  iaAccess: boolean;
  progress?: number;
  hasAssessment?: boolean;
  hasStarCard?: boolean;
  hasFlowAttributes?: boolean;
  navigationProgress?: string;
  astProgress?: any;
  iaProgress?: any;
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
  email: z.string().email('Please enter a valid email'),
  organization: z.string().max(30, 'Organization cannot exceed 30 characters').optional(),
  jobTitle: z.string().max(30, 'Job title cannot exceed 30 characters').optional(),
  role: z.enum(['admin', 'facilitator', 'participant', 'student']),
  generatePassword: z.boolean().default(true),
  isTestUser: z.boolean().default(false),
});

type CreateUserFormValues = z.infer<typeof createUserSchema>;

// Form schema for editing users
const editUserSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Please enter a valid email').optional(),
  organization: z.string().max(30, 'Organization cannot exceed 30 characters').optional(),
  jobTitle: z.string().max(30, 'Job title cannot exceed 30 characters').optional(),
  role: z.enum(['admin', 'facilitator', 'participant', 'student']),
  // Access control fields
  contentAccess: z.enum(['student', 'professional', 'both']),
  astAccess: z.boolean(),
  iaAccess: z.boolean(),
  isTestUser: z.boolean(),
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

export function UserManagement({ currentUser }: { currentUser?: { id: number; name: string; role: string; } }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [confirmDeleteDataOpen, setConfirmDeleteDataOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [dataViewOpen, setDataViewOpen] = useState(false);
  const [userData, setUserData] = useState<any>(null);

  // Query for current user profile to get role information
  const { data: userProfile } = useQuery({
    queryKey: ['/api/auth/me'],
    staleTime: 30000,
  });

  const currentUserRole = (userProfile as any)?.user?.role || (userProfile as any)?.role;
  const isFacilitator = currentUserRole === 'facilitator';
  const isAdmin = currentUserRole === 'admin';

  // Query for fetching users
  const { data: users = [], isLoading: isLoadingUsers, refetch: refetchUsers } = useQuery({
    queryKey: ['/api/admin/users'],
    queryFn: async () => {
      const data = await apiRequest('/api/admin/users', {
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
      isTestUser: false,
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
      contentAccess: 'professional',
      astAccess: true,
      iaAccess: true,
      isTestUser: false,
      resetPassword: false,
      newPassword: '',
      setCustomPassword: false,
    },
  });

  // Watch the role field to dynamically show/hide form sections
  const watchedRole = editForm.watch('role');

  // Auto-set appropriate defaults when role changes
  useEffect(() => {
    if (watchedRole) {
      const currentValues = editForm.getValues();
      
      // Set role-specific defaults
      if (watchedRole === 'admin') {
        editForm.setValue('contentAccess', 'both');
        editForm.setValue('astAccess', true);
        editForm.setValue('iaAccess', true);
      } else if (watchedRole === 'facilitator') {
        if (currentValues.contentAccess !== 'student' && 
            currentValues.contentAccess !== 'professional' && 
            currentValues.contentAccess !== 'both') {
          editForm.setValue('contentAccess', 'professional');
        }
        if (currentValues.astAccess === undefined) editForm.setValue('astAccess', true);
        if (currentValues.iaAccess === undefined) editForm.setValue('iaAccess', true);
      } else if (watchedRole === 'participant') {
        editForm.setValue('contentAccess', 'professional');
        if (currentValues.astAccess === undefined) editForm.setValue('astAccess', true);
        if (currentValues.iaAccess === undefined) editForm.setValue('iaAccess', false);
      } else if (watchedRole === 'student') {
        editForm.setValue('contentAccess', 'student');
        editForm.setValue('astAccess', true);
        editForm.setValue('iaAccess', false);
      }
    }
  }, [watchedRole, editForm]);

  // Mutation for creating a new user
  const createUserMutation = useMutation({
    mutationFn: async (data: CreateUserFormValues) => {
      console.log('🌐 Making POST request to:', `/api/admin/users`);
      console.log('🌐 Request body:', JSON.stringify(data, null, 2));
      
      // Enhanced error handling
      try {
        const response = await fetch('/api/admin/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
          credentials: 'include',
        });
        
        console.log('🌐 Response status:', response.status);
        console.log('🌐 Response headers:', Object.fromEntries(response.headers.entries()));
        
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const responseData = await response.json();
          console.log('🌐 Response data:', responseData);
          return responseData;
        } else {
          const text = await response.text();
          console.error('🌐 Non-JSON response:', text.substring(0, 500));
          throw new Error('Server returned non-JSON response');
        }
      } catch (error) {
        console.error('🌐 Fetch error:', error);
        throw error;
      }
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
      console.log('🌐 Making PUT request to:', `/api/admin/users/${id}`);
      console.log('🌐 Request body:', JSON.stringify(data, null, 2));
      
      // Enhanced error handling
      try {
        const response = await fetch(`/api/admin/users/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
          credentials: 'include',
        });
        
        console.log('🌐 Response status:', response.status);
        console.log('🌐 Response headers:', Object.fromEntries(response.headers.entries()));
        
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const responseData = await response.json();
          console.log('🌐 Response data:', responseData);
          return responseData;
        } else {
          const text = await response.text();
          console.error('🌐 Non-JSON response:', text.substring(0, 500));
          throw new Error('Server returned non-JSON response');
        }
      } catch (error) {
        console.error('🌐 Fetch error:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log('✅ Update successful:', data);
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
      console.error('❌ Update failed:', error);
      console.error('❌ Error details:', {
        message: error.message,
        status: error.status,
        response: error.response
      });
      
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

  // Handler for creating a new user
  const onCreateSubmit = (values: CreateUserFormValues) => {
    createUserMutation.mutate(values);
  };

  // Handler for editing a user
  const onEditSubmit = (values: EditUserFormValues) => {
    console.log('🔍 onEditSubmit called with values:', values);
    console.log('🔍 selectedUser:', selectedUser);
    
    if (selectedUser) {
      const payload = { id: selectedUser.id, data: values };
      console.log('🔍 About to send mutation payload:', payload);
      updateUserMutation.mutate(payload);
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
      role: user.role as 'admin' | 'facilitator' | 'participant' | 'student',
      contentAccess: user.contentAccess || 'professional',
      astAccess: user.astAccess !== undefined ? user.astAccess : true,
      iaAccess: user.iaAccess !== undefined ? user.iaAccess : true,
      isTestUser: user.isTestUser || false,
      resetPassword: false,
      newPassword: '',
      setCustomPassword: false,
    });

    setEditDialogOpen(true);
  };

  // Handler for viewing user data
  const handleViewData = async (user: User) => {
    setSelectedUser(user);
    setDataViewOpen(true);
    setUserData(null); // Reset data while loading
    
    try {
      const data = await apiRequest(`/api/admin/users/${user.id}/export`, {
        method: 'GET',
      });
      setUserData(data);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setUserData({ error: 'Failed to load user data' });
    }
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
      case 'student':
        return 'bg-purple-100 text-purple-800 hover:bg-purple-200';
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
      {/* Role-aware UI Banner */}
      {isFacilitator && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <div>
              <p className="text-sm font-medium text-blue-900">
                Facilitator View - Limited Access
              </p>
              <p className="text-xs text-blue-700">
                You can only see and manage users assigned to your cohorts. Contact an administrator for broader access.
              </p>
            </div>
          </div>
        </div>
      )}

      <Tabs defaultValue="existing" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="existing">Manage Users</TabsTrigger>
          <TabsTrigger value="create">Create New User</TabsTrigger>
        </TabsList>

        {/* Tab for managing existing users */}
        <TabsContent value="existing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Manage user accounts and their roles.
              </CardDescription>
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
                          <TableHead className="w-[50px]">ID</TableHead>
                          <TableHead className="min-w-[160px]">User</TableHead>
                          <TableHead className="w-[90px]">Username</TableHead>
                          <TableHead className="w-[70px]">Role</TableHead>
                          <TableHead className="w-[50px]">Test</TableHead>
                          <TableHead className="w-[120px]">AST Step</TableHead>
                          <TableHead className="w-[120px]">IA Step</TableHead>
                          <TableHead className="min-w-[160px] sticky right-0 bg-white border-l">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                    <TableBody>
                      {users.map((user: User) => (
                        <TableRow key={user.id} className={user.isDeleted ? 'bg-gray-50 opacity-70' : ''}>
                          <TableCell className="w-[50px]">
                            <span className="font-mono text-xs text-muted-foreground">#{user.id}</span>
                          </TableCell>
                          <TableCell className="min-w-[160px]">
                            <div className="flex items-center space-x-2">
                              <Avatar className="h-7 w-7 flex-shrink-0">
                                {user.profilePicture ? (
                                  <AvatarImage src={user.profilePicture} alt={user.name} />
                                ) : (
                                  <AvatarFallback className="text-xs">{getInitials(user.name)}</AvatarFallback>
                                )}
                              </Avatar>
                              <div className="space-y-0.5 min-w-0">
                                <p className="font-medium text-sm truncate">{user.name}</p>
                                <p className="text-xs text-muted-foreground truncate">{user.organization || 'No organization'}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="w-[90px]">
                            <span className="text-sm truncate block">{user.username}</span>
                          </TableCell>
                          <TableCell className="w-[70px]">
                            <Badge className={`${getRoleBadgeColor(user.role)} text-xs px-1 py-0.5`}>
                              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell className="w-[50px]">
                            {user.isTestUser ? (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <div className="w-3 h-3 bg-orange-500 rounded-full mx-auto"></div>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Test User</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            ) : (
                              <div className="w-3 h-3 bg-gray-200 rounded-full mx-auto"></div>
                            )}
                          </TableCell>
                          <TableCell className="w-[120px]">
                            {(() => {
                              // AllStar Teams progress
                              let allstarStep = 'Not Started';
                              let allstarType = 'not-started';

                              // Check AST progress - fallback to parsing navigationProgress if astProgress not available
                              if (user.astProgress) {
                                const progress = user.astProgress;
                                const completedSteps = progress.completedSteps || [];
                                const currentStepId = progress.currentStepId;

                                // Check if workshop is complete (4-5 is the final AST step)
                                if (completedSteps.includes('4-5')) {
                                  allstarStep = 'Complete';
                                  allstarType = 'complete';
                                } else if (completedSteps.length > 0) {
                                  // Show the most recent completed step
                                  const astSteps = completedSteps.filter((step: string) => !step.startsWith('ia-'));
                                  if (astSteps.length > 0) {
                                    const lastStep = astSteps[astSteps.length - 1];
                                    allstarStep = `${lastStep} ✓`;
                                    allstarType = 'completed';
                                  }
                                } else if (currentStepId && !currentStepId.startsWith('ia-')) {
                                  // Show current step if no steps completed yet
                                  allstarStep = currentStepId;
                                  allstarType = 'active';
                                }
                              } else if (user.navigationProgress) {
                                try {
                                  const progress = JSON.parse(user.navigationProgress);
                                  const completedSteps = progress.completedSteps || [];
                                  const currentStepId = progress.currentStepId;
                                  
                                  // Filter out IA steps for AST progress
                                  const astSteps = completedSteps.filter((step: string) => !step.startsWith('ia-'));
                                  
                                  console.log(`Debug AST Progress for user ${user.id}:`, {
                                    allCompletedSteps: completedSteps,
                                    astSteps: astSteps,
                                    currentStepId: currentStepId
                                  });
                                  
                                  if (astSteps.includes('4-5')) {
                                    allstarStep = 'Complete';
                                    allstarType = 'complete';
                                  } else if (currentStepId && !currentStepId.startsWith('ia-')) {
                                    allstarStep = currentStepId;
                                    allstarType = 'active';
                                  } else if (astSteps.length > 0) {
                                    const lastStep = astSteps[astSteps.length - 1];
                                    allstarStep = lastStep;
                                    allstarType = 'completed';
                                  }
                                } catch (e) {
                                  console.error('Parse error for AST progress:', e);
                                }
                              }

                              const getStepColor = (type: string) => {
                                switch (type) {
                                  case 'complete': return 'text-green-700 bg-green-50 border-green-200';
                                  case 'active': return 'text-blue-700 bg-blue-50 border-blue-200';
                                  case 'completed': return 'text-purple-700 bg-purple-50 border-purple-200';
                                  default: return 'text-gray-500 bg-gray-50 border-gray-200';
                                }
                              };

                              return (
                                <div className={`px-1.5 py-0.5 rounded border text-xs font-medium text-center ${getStepColor(allstarType)}`}>
                                  {allstarStep}
                                </div>
                              );
                            })()}
                          </TableCell>
                          <TableCell className="w-[120px]">
                            {(() => {
                              // Imaginal Agility progress
                              let iaStep = 'Not Started';
                              let iaType = 'not-started';

                              // Check IA progress - fallback to parsing navigationProgress if iaProgress not available
                              if (user.iaProgress) {
                                const progress = user.iaProgress;
                                const completedSteps = progress.completedSteps || [];
                                const currentStepId = progress.currentStepId;

                                if (completedSteps.includes('ia-8-1')) {
                                  iaStep = 'Complete';
                                  iaType = 'complete';
                                } else if (currentStepId && currentStepId.startsWith('ia-')) {
                                  iaStep = currentStepId.replace('ia-', '');
                                  iaType = 'active';
                                } else if (completedSteps.length > 0) {
                                  const lastIAStep = completedSteps[completedSteps.length - 1];
                                  iaStep = lastIAStep.replace('ia-', '');
                                  iaType = 'completed';
                                }
                              } else if (user.navigationProgress) {
                                try {
                                  const progress = JSON.parse(user.navigationProgress);
                                  const completedSteps = progress.completedSteps || [];
                                  const currentStepId = progress.currentStepId;
                                  
                                  // Filter IA steps (those with "ia-" prefix)
                                  const iaSteps = completedSteps.filter((step: string) => step.startsWith('ia-'));
                                  
                                  console.log(`Debug IA Progress for user ${user.id}:`, {
                                    allCompletedSteps: completedSteps,
                                    iaSteps: iaSteps,
                                    currentStepId: currentStepId
                                  });
                                  
                                  if (iaSteps.includes('ia-8-1')) {
                                    iaStep = 'Complete';
                                    iaType = 'complete';
                                  } else if (currentStepId && currentStepId.startsWith('ia-')) {
                                    iaStep = currentStepId.replace('ia-', '');
                                    iaType = 'active';
                                  } else if (iaSteps.length > 0) {
                                    const lastIAStep = iaSteps[iaSteps.length - 1];
                                    iaStep = lastIAStep.replace('ia-', '');
                                    iaType = 'completed';
                                  }
                                } catch (e) {
                                  console.error('Parse error for IA progress:', e);
                                }
                              }

                              const getStepColor = (type: string) => {
                                switch (type) {
                                  case 'complete': return 'text-green-700 bg-green-50 border-green-200';
                                  case 'active': return 'text-blue-700 bg-blue-50 border-blue-200';
                                  case 'completed': return 'text-purple-700 bg-purple-50 border-purple-200';
                                  default: return 'text-gray-500 bg-gray-50 border-gray-200';
                                }
                              };

                              return (
                                <div className={`px-1.5 py-0.5 rounded border text-xs font-medium text-center ${getStepColor(iaType)}`}>
                                  {iaStep}
                                </div>
                              );
                            })()}
                          </TableCell>
                          <TableCell className="min-w-[200px] sticky right-0 bg-white border-l">
                            <TooltipProvider>
                              <div className="flex items-center gap-1 justify-start">
                                {!user.isDeleted && (
                                  <>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="h-8 w-8 p-0 hover:bg-blue-50 border-blue-200 text-blue-600 hover:text-blue-800"
                                          onClick={() => handleEditUser(user)}
                                        >
                                          <PencilIcon className="h-3 w-3" />
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
                                          className="h-8 w-8 p-0 hover:bg-green-50 border-green-200 text-green-600 hover:text-green-800"
                                          onClick={() => handleViewData(user)}
                                        >
                                          <EyeIcon className="h-3 w-3" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>View user data</p>
                                      </TooltipContent>
                                    </Tooltip>

                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="h-8 w-8 p-0 text-green-600 hover:text-green-800 hover:bg-green-50 border-green-200"
                                          onClick={() => exportUserDataMutation.mutate(user.id)}
                                          disabled={loadingUsers.has(user.id)}
                                        >
                                          {loadingUsers.has(user.id) ? (
                                            <Loader2 className="h-3 w-3 animate-spin" />
                                          ) : (
                                            <Download className="h-3 w-3" />
                                          )}
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
                                          className="h-8 w-8 p-0 text-orange-600 hover:text-orange-800 hover:bg-orange-50 border-orange-200"
                                          onClick={() => {
                                            setSelectedUser(user);
                                            setConfirmDeleteDataOpen(true);
                                          }}
                                        >
                                          <Database className="h-3 w-3" />
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
                                          className="h-8 w-8 p-0 text-red-600 hover:text-red-800 hover:bg-red-50 border-red-200"
                                          onClick={() => {
                                            setSelectedUser(user);
                                            setConfirmDeleteOpen(true);
                                          }}
                                        >
                                          <UserX className="h-3 w-3" />
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
                                        size="sm"
                                        className="h-8 w-8 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-50 border-blue-200"
                                        onClick={() => restoreUserMutation.mutate(user.id)}
                                      >
                                        <UndoIcon className="h-3 w-3" />
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
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="user@example.com" {...field} value={field.value || ''} />
                        </FormControl>
                        <FormDescription>
                          Email is required for user authentication
                        </FormDescription>
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
                              <SelectItem value="student">Student</SelectItem>
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
                  
                  <FormField
                    control={createForm.control}
                    name="isTestUser"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center space-x-3 rounded-md border p-3">
                          <FormControl>
                            <Switch 
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              aria-label="Toggle test user status"
                              className="data-[state=checked]:bg-amber-500"
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-sm font-medium">Test User</FormLabel>
                            <FormDescription className="text-xs text-muted-foreground">
                              Mark as test account
                            </FormDescription>
                          </div>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

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
        <DialogContent className="max-w-2xl w-[95vw] max-h-[90vh] flex flex-col p-0">
          <DialogHeader className="flex-shrink-0 px-6 pt-6 pb-4">
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information and role.
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="flex flex-col h-full overflow-y-auto">
                {/* Scrollable content area */}
                <div className="px-6 space-y-6 pb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                    <div>
                      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Username
                      </label>
                      <Input 
                        value={selectedUser?.username || ''}
                        disabled
                        className="mt-2 bg-muted"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Username cannot be changed
                      </p>
                    </div>
                  </div>

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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                            <SelectItem value="student">Student</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex flex-col justify-end">
                    <FormField
                      control={editForm.control}
                      name="isTestUser"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center space-x-3 rounded-md border p-3">
                            <FormControl>
                              <Switch 
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                aria-label="Toggle test user status"
                                className="data-[state=checked]:bg-amber-500"
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="text-sm font-medium">Test User</FormLabel>
                              <FormDescription className="text-xs text-muted-foreground">
                                Mark as test account
                              </FormDescription>
                            </div>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Content Type Access Section - Dynamic Role-Based Display */}
                {(watchedRole === 'admin' || watchedRole === 'facilitator') && (
                  <div className="space-y-4">
                    <div className="border-t pt-4">
                      <h4 className="text-sm font-medium mb-3">Content Type Access</h4>
                      <p className="text-xs text-muted-foreground mb-3">
                        {watchedRole === 'admin' ? 'Administrators can toggle between content types during workshop testing' : 'Facilitators can access different content types for management purposes'}
                      </p>
                      <FormField
                        control={editForm.control}
                        name="contentAccess"
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <FormControl>
                              <div className="grid grid-cols-1 gap-2">
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="radio"
                                    id="student-only"
                                    value="student"
                                    checked={field.value === 'student'}
                                    onChange={() => field.onChange('student')}
                                    className="h-4 w-4 text-purple-600"
                                  />
                                  <Label htmlFor="student-only" className="text-sm">Student Content Only</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="radio"
                                    id="professional-only"
                                    value="professional"
                                    checked={field.value === 'professional'}
                                    onChange={() => field.onChange('professional')}
                                    className="h-4 w-4 text-blue-600"
                                  />
                                  <Label htmlFor="professional-only" className="text-sm">Professional Content Only</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="radio"
                                    id="both-content"
                                    value="both"
                                    checked={field.value === 'both'}
                                    onChange={() => field.onChange('both')}
                                    className="h-4 w-4 text-green-600"
                                  />
                                  <Label htmlFor="both-content" className="text-sm">Both Content Types</Label>
                                </div>
                              </div>
                            </FormControl>
                            <FormDescription>
                              Controls which assessment content this user can access
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}

                  {/* Workshop Access Section - All roles except student by default */}
                  {watchedRole !== 'student' && (
                    <div className="border-t pt-4">
                      <h4 className="text-sm font-medium mb-3">Workshop Access</h4>
                      <p className="text-xs text-muted-foreground mb-3">
                        {watchedRole === 'admin' 
                          ? 'Administrators have access to all workshops for testing and management'
                          : watchedRole === 'facilitator'
                          ? 'Facilitators can access workshops they need to manage'
                          : 'Controls which workshops this user can participate in'
                        }
                      </p>
                      <div className="space-y-3">
                        <FormField
                          control={editForm.control}
                          name="astAccess"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                              <div className="space-y-0.5">
                                <FormLabel className="text-sm">AllStarTeams Workshop</FormLabel>
                                <FormDescription className="text-xs">
                                  Access to team collaboration and strengths discovery workshop
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  disabled={watchedRole === 'admin'} // Admins always have access
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={editForm.control}
                          name="iaAccess"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                              <div className="space-y-0.5">
                                <FormLabel className="text-sm">Imaginal Agility Workshop</FormLabel>
                                <FormDescription className="text-xs">
                                  Access to individual development and agility training workshop
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  disabled={watchedRole === 'admin'} // Admins always have access
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                      {watchedRole === 'admin' && (
                        <p className="text-xs text-muted-foreground mt-2 italic">
                          Note: Administrators always have full workshop access and cannot be restricted.
                        </p>
                      )}
                    </div>
                  )}

                  {/* Student-specific Settings Section */}
                  {watchedRole === 'student' && (
                    <div className="border-t pt-4">
                      <h4 className="text-sm font-medium mb-3">Student Settings</h4>
                      <p className="text-xs text-muted-foreground mb-3">
                        Students are automatically configured for youth-focused workshop content
                      </p>
                      <div className="space-y-3">
                        <div className="rounded-lg border p-3 bg-purple-50">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                            <span className="text-sm font-medium">Student Content</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Access to age-appropriate assessment questions and content
                          </p>
                        </div>
                        
                        <div className="rounded-lg border p-3 bg-yellow-50">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                            <span className="text-sm font-medium">AllStarTeams Workshop Only</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Primary workshop focus for team building and strengths discovery
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-3 italic">
                        Note: Student settings are automatically optimized and cannot be modified.
                      </p>
                    </div>
                  )}

                  {/* Password Management Section */}
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-medium mb-3">Password Management</h4>
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
                  </div>
                </div>

                {/* Fixed footer stays at the bottom */}
                <DialogFooter className="flex-shrink-0 px-6 pb-6 pt-4 border-t bg-background">
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

      {/* Data Viewing Modal */}
      <Dialog open={dataViewOpen} onOpenChange={setDataViewOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>User Data - {selectedUser?.name}</DialogTitle>
            <DialogDescription>
              Quick review of all data associated with this user account
            </DialogDescription>
          </DialogHeader>

          <div className="h-[60vh] w-full border rounded-md p-4 overflow-y-auto">
            {userData === null ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span>Loading user data...</span>
              </div>
            ) : userData?.error ? (
              <div className="text-center text-red-600 p-8">
                <p>{userData.error}</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* User Profile */}
                {userData?.profile && (
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg border-b pb-2">User Profile</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div><strong>Name:</strong> {userData.profile.name}</div>
                      <div><strong>Email:</strong> {userData.profile.email}</div>
                      <div><strong>Username:</strong> {userData.profile.username}</div>
                      <div><strong>Role:</strong> {userData.profile.role}</div>
                      <div><strong>Organization:</strong> {userData.profile.organization || 'N/A'}</div>
                      <div><strong>Job Title:</strong> {userData.profile.jobTitle || 'N/A'}</div>
                      <div><strong>Test User:</strong> {userData.profile.isTestUser ? 'Yes' : 'No'}</div>
                      <div><strong>Created:</strong> {new Date(userData.profile.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                )}

                {/* Navigation Progress */}
                {userData?.navigationProgress && (
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg border-b pb-2">Navigation Progress</h3>
                    <pre className="bg-gray-50 p-3 rounded text-xs overflow-x-auto">
                      {JSON.stringify(userData.navigationProgress, null, 2)}
                    </pre>
                  </div>
                )}

                {/* Assessment Data */}
                {userData?.assessments && userData.assessments.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg border-b pb-2">Assessment Data ({userData.assessments.length} records)</h3>
                    {userData.assessments.map((assessment: any, index: number) => (
                      <div key={index} className="bg-blue-50 p-3 rounded">
                        <div className="text-sm mb-2">
                          <strong>Created:</strong> {new Date(assessment.createdAt).toLocaleString()}
                        </div>
                        <pre className="text-xs overflow-x-auto">
                          {JSON.stringify(assessment, null, 2)}
                        </pre>
                      </div>
                    ))}
                  </div>
                )}

                {/* Star Cards */}
                {userData?.starCards && userData.starCards.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg border-b pb-2">Star Cards ({userData.starCards.length} records)</h3>
                    {userData.starCards.map((starCard: any, index: number) => (
                      <div key={index} className="bg-yellow-50 p-3 rounded">
                        <div className="text-sm mb-2">
                          <strong>Created:</strong> {new Date(starCard.createdAt).toLocaleString()}
                        </div>
                        <div className="grid grid-cols-4 gap-2 text-sm mb-2">
                          <div><strong>Thinking:</strong> {starCard.thinking}</div>
                          <div><strong>Acting:</strong> {starCard.acting}</div>
                          <div><strong>Feeling:</strong> {starCard.feeling}</div>
                          <div><strong>Planning:</strong> {starCard.planning}</div>
                        </div>
                        {starCard.imageUrl && (
                          <div className="text-sm"><strong>Has Image:</strong> Yes</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Flow Attributes */}
                {userData?.flowAttributes && userData.flowAttributes.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg border-b pb-2">Flow Attributes ({userData.flowAttributes.length} records)</h3>
                    {userData.flowAttributes.map((flow: any, index: number) => (
                      <div key={index} className="bg-purple-50 p-3 rounded">
                        <div className="text-sm mb-2">
                          <strong>Created:</strong> {new Date(flow.createdAt).toLocaleString()}
                        </div>
                        <pre className="text-xs overflow-x-auto">
                          {JSON.stringify(flow, null, 2)}
                        </pre>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reflections */}
                {userData?.reflections && userData.reflections.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg border-b pb-2">Reflections ({userData.reflections.length} records)</h3>
                    {userData.reflections.map((reflection: any, index: number) => (
                      <div key={index} className="bg-green-50 p-3 rounded">
                        <div className="text-sm mb-2">
                          <strong>Step:</strong> {reflection.stepId} | <strong>Created:</strong> {new Date(reflection.createdAt).toLocaleString()}
                        </div>
                        <div className="text-sm">
                          <strong>Content:</strong> {reflection.content}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Raw Data Fallback */}
                {userData && !userData.profile && !userData.error && (
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg border-b pb-2">Raw Data</h3>
                    <pre className="bg-gray-50 p-3 rounded text-xs overflow-x-auto">
                      {JSON.stringify(userData, null, 2)}
                    </pre>
                  </div>
                )}

                {/* No Data Message */}
                {userData && Object.keys(userData).length === 0 && (
                  <div className="text-center text-gray-500 p-8">
                    <p>No data found for this user</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDataViewOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
