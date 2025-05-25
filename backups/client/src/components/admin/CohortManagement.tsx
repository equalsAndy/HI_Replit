import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { User } from '@/shared/types';

// UI Components
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, PencilIcon, Plus, UsersIcon, PlusIcon } from 'lucide-react';

// Interfaces
interface Cohort {
  id: number;
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  status: 'active' | 'completed' | 'upcoming';
  facilitatorId?: number;
  facilitatorName?: string;
  memberCount: number;
  cohortType: 'leadership' | 'team' | 'standard';
  parentCohortId?: number; // For team cohorts linked to a leadership cohort
}

interface Facilitator {
  id: number;
  name: string;
}

// Cohort management component
export function CohortManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddCohortOpen, setIsAddCohortOpen] = useState(false);
  const [isEditCohortOpen, setIsEditCohortOpen] = useState(false);
  const [isManageMembersOpen, setIsManageMembersOpen] = useState(false);
  const [selectedCohort, setSelectedCohort] = useState<Cohort | null>(null);
  const [filter, setFilter] = useState('');

  // Fetch all cohorts
  const { data: cohorts, isLoading } = useQuery({
    queryKey: ['/api/admin/cohorts'],
    queryFn: async () => {
      try {
        // This will be implemented on the backend
        // For now, return a placeholder array of cohorts
        return [
          {
            id: 1,
            name: 'AllStarTeams Workshop - Spring 2025',
            description: 'Spring 2025 workshop for leadership teams',
            startDate: '2025-05-01',
            endDate: '2025-06-30',
            status: 'active',
            facilitatorId: 2,
            facilitatorName: 'Jane Smith',
            memberCount: 12
          },
          {
            id: 2,
            name: 'Imaginal Agility Workshop - Summer 2025',
            description: 'Summer 2025 workshop focusing on agility training',
            startDate: '2025-07-15',
            endDate: '2025-08-30',
            status: 'upcoming',
            facilitatorId: 2,
            facilitatorName: 'Jane Smith',
            memberCount: 8
          }
        ] as Cohort[];
      } catch (error) {
        console.error('Failed to fetch cohorts:', error);
        toast({
          title: 'Error',
          description: 'Failed to load cohorts. Please try again.',
          variant: 'destructive',
        });
        return [];
      }
    },
  });

  // Filter cohorts based on search input
  const filteredCohorts = cohorts?.filter(cohort => 
    cohort.name.toLowerCase().includes(filter.toLowerCase()) ||
    cohort.description?.toLowerCase().includes(filter.toLowerCase()) ||
    cohort.facilitatorName?.toLowerCase().includes(filter.toLowerCase())
  ) || [];

  // Handle selecting a cohort for editing
  const handleEditCohort = (cohort: Cohort) => {
    setSelectedCohort(cohort);
    setIsEditCohortOpen(true);
  };

  // Handle managing members for a cohort
  const handleManageMembers = (cohort: Cohort) => {
    setSelectedCohort(cohort);
    setIsManageMembersOpen(true);
  };

  // Handle creating a new cohort
  const handleAddNewCohort = () => {
    setSelectedCohort(null);
    setIsAddCohortOpen(true);
  };

  // Get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>;
      case 'completed':
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Completed</Badge>;
      case 'upcoming':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Upcoming</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Cohort Management</CardTitle>
          <CardDescription>Manage workshop cohorts and assignments</CardDescription>
        </div>
        <Button onClick={handleAddNewCohort}>
          <PlusIcon className="mr-2 h-4 w-4" />
          New Cohort
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex items-center mb-4">
          <UsersIcon className="mr-2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search cohorts..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="max-w-sm"
          />
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Facilitator</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Members</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCohorts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center p-4 text-muted-foreground">
                    No cohorts found
                  </TableCell>
                </TableRow>
              ) : (
                filteredCohorts.map((cohort) => (
                  <TableRow key={cohort.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{cohort.name}</div>
                        <div className="text-sm text-muted-foreground">{cohort.description}</div>
                      </div>
                    </TableCell>
                    <TableCell>{cohort.facilitatorName || 'Unassigned'}</TableCell>
                    <TableCell>
                      {cohort.startDate && cohort.endDate ? (
                        <span className="text-sm">
                          {new Date(cohort.startDate).toLocaleDateString()} - {new Date(cohort.endDate).toLocaleDateString()}
                        </span>
                      ) : (
                        'Not scheduled'
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(cohort.status)}</TableCell>
                    <TableCell>{cohort.memberCount}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditCohort(cohort)}
                        >
                          <PencilIcon className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleManageMembers(cohort)}
                        >
                          <UsersIcon className="h-4 w-4" />
                          <span className="sr-only">Manage Members</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {/* Add Cohort Dialog */}
      <AddCohortDialog
        open={isAddCohortOpen}
        onOpenChange={setIsAddCohortOpen}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['/api/admin/cohorts'] });
        }}
      />

      {/* Edit Cohort Dialog */}
      {selectedCohort && (
        <EditCohortDialog
          cohort={selectedCohort}
          open={isEditCohortOpen}
          onOpenChange={setIsEditCohortOpen}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['/api/admin/cohorts'] });
          }}
        />
      )}

      {/* Manage Members Dialog */}
      {selectedCohort && (
        <ManageMembersDialog
          cohort={selectedCohort}
          open={isManageMembersOpen}
          onOpenChange={setIsManageMembersOpen}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['/api/admin/cohorts'] });
          }}
        />
      )}
    </Card>
  );
}

// Add Cohort Dialog Component
interface AddCohortDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

function AddCohortDialog({ open, onOpenChange, onSuccess }: AddCohortDialogProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    facilitatorId: '',
    status: 'upcoming',
    cohortType: 'standard',
    parentCohortId: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch facilitators
  const { data: facilitators = [] } = useQuery({
    queryKey: ['/api/admin/facilitators'],
    queryFn: async () => {
      try {
        // This will be implemented on the backend
        // For now, return a placeholder array of facilitators
        return [
          { id: 2, name: 'Jane Smith' },
          { id: 3, name: 'Bob Johnson' }
        ] as Facilitator[];
      } catch (error) {
        console.error('Failed to fetch facilitators:', error);
        return [];
      }
    },
  });

  const addCohortMutation = useMutation({
    mutationFn: async (cohortData: typeof formData) => {
      // This will be implemented on the backend
      // For now, just simulate a successful response
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true, id: Math.floor(Math.random() * 1000) };
    },
    onSuccess: () => {
      toast({
        title: 'Cohort added',
        description: 'The cohort has been created successfully.',
      });
      onSuccess();
      onOpenChange(false);
      resetForm();
    },
    onError: (error) => {
      console.error('Error adding cohort:', error);
      toast({
        title: 'Error',
        description: 'Failed to create cohort. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      startDate: '',
      endDate: '',
      facilitatorId: '',
      status: 'upcoming',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await addCohortMutation.mutateAsync(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Cohort</DialogTitle>
          <DialogDescription>
            Set up a new workshop cohort and assign a facilitator.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Cohort Name
            </label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="e.g., AllStarTeams Workshop - Spring 2025"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description
            </label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of this workshop cohort"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="startDate" className="text-sm font-medium">
                Start Date
              </label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="endDate" className="text-sm font-medium">
                End Date
              </label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="facilitator" className="text-sm font-medium">
                Facilitator
              </label>
              <Select
                value={formData.facilitatorId}
                onValueChange={(value) => setFormData({ ...formData, facilitatorId: value })}
              >
                <SelectTrigger id="facilitator">
                  <SelectValue placeholder="Select facilitator" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Unassigned</SelectItem>
                  {facilitators.map((facilitator) => (
                    <SelectItem key={facilitator.id} value={String(facilitator.id)}>
                      {facilitator.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label htmlFor="status" className="text-sm font-medium">
                Status
              </label>
              <Select
                value={formData.status}
                onValueChange={(value: 'active' | 'completed' | 'upcoming') => 
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline" 
              onClick={() => {
                resetForm();
                onOpenChange(false);
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Cohort
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Edit Cohort Dialog Component
interface EditCohortDialogProps {
  cohort: Cohort;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

function EditCohortDialog({ cohort, open, onOpenChange, onSuccess }: EditCohortDialogProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: cohort.name,
    description: cohort.description || '',
    startDate: cohort.startDate || '',
    endDate: cohort.endDate || '',
    facilitatorId: cohort.facilitatorId ? String(cohort.facilitatorId) : '',
    status: cohort.status,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch facilitators
  const { data: facilitators = [] } = useQuery({
    queryKey: ['/api/admin/facilitators'],
    queryFn: async () => {
      try {
        // This will be implemented on the backend
        // For now, return a placeholder array of facilitators
        return [
          { id: 2, name: 'Jane Smith' },
          { id: 3, name: 'Bob Johnson' }
        ] as Facilitator[];
      } catch (error) {
        console.error('Failed to fetch facilitators:', error);
        return [];
      }
    },
  });

  // Update form data when cohort changes
  React.useEffect(() => {
    setFormData({
      name: cohort.name,
      description: cohort.description || '',
      startDate: cohort.startDate || '',
      endDate: cohort.endDate || '',
      facilitatorId: cohort.facilitatorId ? String(cohort.facilitatorId) : '',
      status: cohort.status,
    });
  }, [cohort]);

  const updateCohortMutation = useMutation({
    mutationFn: async (cohortData: typeof formData) => {
      // This will be implemented on the backend
      // For now, just simulate a successful response
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: 'Cohort updated',
        description: 'The cohort has been updated successfully.',
      });
      onSuccess();
      onOpenChange(false);
    },
    onError: (error) => {
      console.error('Error updating cohort:', error);
      toast({
        title: 'Error',
        description: 'Failed to update cohort. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await updateCohortMutation.mutateAsync(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Cohort</DialogTitle>
          <DialogDescription>
            Update cohort details and scheduling.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <label htmlFor="edit-name" className="text-sm font-medium">
              Cohort Name
            </label>
            <Input
              id="edit-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="edit-description" className="text-sm font-medium">
              Description
            </label>
            <Input
              id="edit-description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="edit-startDate" className="text-sm font-medium">
                Start Date
              </label>
              <Input
                id="edit-startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="edit-endDate" className="text-sm font-medium">
                End Date
              </label>
              <Input
                id="edit-endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="edit-facilitator" className="text-sm font-medium">
                Facilitator
              </label>
              <Select
                value={formData.facilitatorId}
                onValueChange={(value) => setFormData({ ...formData, facilitatorId: value })}
              >
                <SelectTrigger id="edit-facilitator">
                  <SelectValue placeholder="Select facilitator" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Unassigned</SelectItem>
                  {facilitators.map((facilitator) => (
                    <SelectItem key={facilitator.id} value={String(facilitator.id)}>
                      {facilitator.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label htmlFor="edit-status" className="text-sm font-medium">
                Status
              </label>
              <Select
                value={formData.status}
                onValueChange={(value: 'active' | 'completed' | 'upcoming') => 
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger id="edit-status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Manage Members Dialog Component
interface ManageMembersDialogProps {
  cohort: Cohort;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

function ManageMembersDialog({ cohort, open, onOpenChange, onSuccess }: ManageMembersDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch cohort members
  const { data: members = [] } = useQuery({
    queryKey: [`/api/admin/cohorts/${cohort.id}/members`],
    queryFn: async () => {
      try {
        // This will be implemented on the backend
        // For now, return a placeholder array of members
        return [
          { id: 3, name: 'Test User 3', title: 'Data Scientist' },
          { id: 4, name: 'Test User 4', title: 'Marketing Manager' }
        ] as User[];
      } catch (error) {
        console.error('Failed to fetch cohort members:', error);
        return [];
      }
    },
  });

  // Fetch available users (not already in the cohort)
  const { data: availableUsers = [] } = useQuery({
    queryKey: [`/api/admin/users/available-for-cohort/${cohort.id}`],
    queryFn: async () => {
      try {
        // This will be implemented on the backend
        // For now, return a placeholder array of available users
        return [
          { id: 5, name: 'Test User 5', title: 'Product Manager', email: 'user5@example.com' },
          { id: 6, name: 'Test User 6', title: 'UX Designer', email: 'user6@example.com' },
          { id: 7, name: 'Test User 7', title: 'Fullstack Developer', email: 'user7@example.com' }
        ] as User[];
      } catch (error) {
        console.error('Failed to fetch available users:', error);
        return [];
      }
    },
  });

  // Filter available users based on search
  const filteredAvailableUsers = availableUsers.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const updateMembersMutation = useMutation({
    mutationFn: async (userIds: number[]) => {
      // This will be implemented on the backend
      // For now, just simulate a successful response
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: 'Members updated',
        description: 'Cohort members have been updated successfully.',
      });
      onSuccess();
      onOpenChange(false);
    },
    onError: (error) => {
      console.error('Error updating cohort members:', error);
      toast({
        title: 'Error',
        description: 'Failed to update cohort members. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleAddSelected = async () => {
    if (selectedUserIds.length === 0) {
      toast({
        title: 'No users selected',
        description: 'Please select users to add to the cohort.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await updateMembersMutation.mutateAsync(selectedUserIds);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleUserSelection = (userId: number) => {
    setSelectedUserIds(prev => 
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Manage Cohort Members</DialogTitle>
          <DialogDescription>
            Add or remove participants from the "{cohort.name}" cohort.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Current Members ({members.length})</h3>
            <div className="rounded-md border max-h-48 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center p-4 text-muted-foreground">
                        No members in this cohort
                      </TableCell>
                    </TableRow>
                  ) : (
                    members.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell>{member.name}</TableCell>
                        <TableCell>{member.title || '-'}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            Remove
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-medium">Add New Members</h3>
            <Input
              placeholder="Search users by name or title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mb-2"
            />
            
            <div className="rounded-md border max-h-48 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <span className="sr-only">Select</span>
                    </TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Title</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAvailableUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center p-4 text-muted-foreground">
                        No available users found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAvailableUsers.map((user) => (
                      <TableRow key={user.id} className="cursor-pointer hover:bg-slate-50">
                        <TableCell onClick={() => toggleUserSelection(user.id)}>
                          <input
                            type="checkbox"
                            checked={selectedUserIds.includes(user.id)}
                            onChange={() => toggleUserSelection(user.id)}
                            className="h-4 w-4 rounded border-gray-300"
                          />
                        </TableCell>
                        <TableCell onClick={() => toggleUserSelection(user.id)}>
                          {user.name}
                        </TableCell>
                        <TableCell onClick={() => toggleUserSelection(user.id)}>
                          {user.title || '-'}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAddSelected} 
              disabled={isSubmitting || selectedUserIds.length === 0}
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Selected Users
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}