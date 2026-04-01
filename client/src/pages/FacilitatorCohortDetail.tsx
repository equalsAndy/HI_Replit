import React, { useState } from 'react';
import { useRoute, useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowLeft,
  Plus,
  Mail,
  ChevronDown,
  Copy,
  Check,
  Trash2,
  CheckCircle2,
  Circle,
  MinusCircle,
  RefreshCw,
  UserPlus,
  Clock,
  Pencil,
  AlertTriangle,
} from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────

interface Participant {
  id: number;
  name: string;
  email: string;
  joinedAt: string;
  astStatus: 'complete' | 'in_progress' | 'not_started';
  iaStatus: 'complete' | 'in_progress' | 'not_started';
}

interface PendingInvite {
  id: number;
  invite_code: string;
  email: string;
  name: string | null;
  created_at: string;
  expires_at: string | null;
}

// ── API helpers ──────────────────────────────────────────────────────────────

async function fetchCohortDetail(cohortId: string) {
  const res = await fetch(`/api/facilitator/cohorts/${cohortId}`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch cohort');
  return res.json();
}

async function fetchParticipants(cohortId: string) {
  const res = await fetch(`/api/facilitator/cohorts/${cohortId}/participants`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch participants');
  return res.json();
}

async function fetchPendingInvites(cohortId: string) {
  const res = await fetch(`/api/facilitator/cohorts/${cohortId}/invites`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch invites');
  return res.json();
}

async function removeParticipant(cohortId: string, userId: number) {
  const res = await fetch(`/api/facilitator/cohorts/${cohortId}/participants/${userId}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to remove participant');
  return res.json();
}

async function updateCohort(cohortId: string, data: {
  name?: string; description?: string; organizationId?: number | null;
  startDate?: string | null; endDate?: string | null;
  astAccess?: boolean; iaAccess?: boolean;
}) {
  const res = await fetch(`/api/facilitator/cohorts/${cohortId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update cohort');
  return res.json();
}

async function fetchOrganizations() {
  const res = await fetch('/api/facilitator/organizations', { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch organizations');
  return res.json();
}

async function createInvite(cohortId: string, data: { email: string; name?: string; expiresAt?: string }) {
  const res = await fetch(`/api/facilitator/cohorts/${cohortId}/invites`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok || !json.success) throw new Error(json.error || 'Failed to create invite');
  return json;
}

// ── Status Badge Component ───────────────────────────────────────────────────

function StatusBadge({ status }: { status: 'complete' | 'in_progress' | 'not_started' }) {
  if (status === 'complete') {
    return (
      <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 gap-1">
        <CheckCircle2 className="h-3 w-3" />
        Complete
      </Badge>
    );
  }
  if (status === 'in_progress') {
    return (
      <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100 gap-1">
        <Circle className="h-3 w-3 fill-current" />
        In Progress
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" className="gap-1 text-slate-500">
      <MinusCircle className="h-3 w-3" />
      Not Started
    </Badge>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────

const FacilitatorCohortDetail: React.FC = () => {
  const [, params] = useRoute('/facilitator/cohorts/:cohortId');
  const cohortId = params?.cohortId ?? '';
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();

  // Modal state
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteExpiry, setInviteExpiry] = useState('');
  const [lastCreatedInvite, setLastCreatedInvite] = useState<any>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Remove confirmation
  const [removeTarget, setRemoveTarget] = useState<Participant | null>(null);

  // Edit cohort modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editOrgId, setEditOrgId] = useState<number | null>(null);
  const [editStartDate, setEditStartDate] = useState('');
  const [editEndDate, setEditEndDate] = useState('');
  const [editAstAccess, setEditAstAccess] = useState(true);
  const [editIaAccess, setEditIaAccess] = useState(true);

  const { toast } = useToast();

  // ── Queries ──────────────────────────────────────────────────────────────

  const cohortQuery = useQuery({
    queryKey: ['facilitator', 'cohort', cohortId],
    queryFn: () => fetchCohortDetail(cohortId),
    enabled: !!cohortId,
  });

  const participantsQuery = useQuery({
    queryKey: ['facilitator', 'cohort', cohortId, 'participants'],
    queryFn: () => fetchParticipants(cohortId),
    enabled: !!cohortId,
  });

  const invitesQuery = useQuery({
    queryKey: ['facilitator', 'cohort', cohortId, 'invites'],
    queryFn: () => fetchPendingInvites(cohortId),
    enabled: !!cohortId,
  });

  const orgsQuery = useQuery({
    queryKey: ['facilitator', 'organizations'],
    queryFn: fetchOrganizations,
  });

  // ── Mutations ────────────────────────────────────────────────────────────

  const removeMutation = useMutation({
    mutationFn: (userId: number) => removeParticipant(cohortId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facilitator', 'cohort', cohortId, 'participants'] });
      setRemoveTarget(null);
    },
  });

  const inviteMutation = useMutation({
    mutationFn: (data: { email: string; name?: string; expiresAt?: string }) =>
      createInvite(cohortId, data),
    onSuccess: (data) => {
      setLastCreatedInvite(data.invite);
      setInviteEmail('');
      setInviteName('');
      setInviteExpiry('');
      queryClient.invalidateQueries({ queryKey: ['facilitator', 'cohort', cohortId, 'invites'] });
    },
  });

  const editMutation = useMutation({
    mutationFn: (data: Parameters<typeof updateCohort>[1]) => updateCohort(cohortId, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['facilitator', 'cohort', cohortId] });
      queryClient.invalidateQueries({ queryKey: ['facilitator', 'cohorts'] });
      setShowEditModal(false);
      if (data.propagatedCount > 0) {
        toast({
          title: 'Workshop access updated',
          description: `Workshop access updated for ${data.propagatedCount} participant${data.propagatedCount !== 1 ? 's' : ''}.`,
        });
      }
    },
  });

  // ── Helpers ──────────────────────────────────────────────────────────────

  function openEditModal() {
    if (!cohort) return;
    setEditName(cohort.name || '');
    setEditDescription(cohort.description || '');
    setEditOrgId(cohort.organization_id || null);
    setEditStartDate(cohort.start_date ? new Date(cohort.start_date).toISOString().split('T')[0] : '');
    setEditEndDate(cohort.end_date ? new Date(cohort.end_date).toISOString().split('T')[0] : '');
    setEditAstAccess(cohort.ast_access ?? true);
    setEditIaAccess(cohort.ia_access ?? true);
    setShowEditModal(true);
  }

  function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editName.trim()) return;
    editMutation.mutate({
      name: editName,
      description: editDescription,
      organizationId: editOrgId,
      startDate: editStartDate || null,
      endDate: editEndDate || null,
      astAccess: editAstAccess,
      iaAccess: editIaAccess,
    });
  }

  function getInviteUrl(code: string) {
    const formatted = code.length === 12
      ? `${code.slice(0, 4)}-${code.slice(4, 8)}-${code.slice(8, 12)}`
      : code;
    return `${window.location.origin}/register/${formatted}`;
  }

  async function copyToClipboard(text: string, id: string) {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  function handleSubmitInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    inviteMutation.mutate({
      email: inviteEmail,
      name: inviteName || undefined,
      expiresAt: inviteExpiry || undefined,
    });
  }

  function defaultExpiry() {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  }

  // ── Data ─────────────────────────────────────────────────────────────────

  const cohort = cohortQuery.data?.cohort;
  const participants: Participant[] = participantsQuery.data?.participants ?? [];
  const pendingInvites: PendingInvite[] = invitesQuery.data?.invites ?? [];

  if (cohortQuery.isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (!cohort) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-slate-600">Cohort not found or access denied.</p>
            <Button variant="link" className="mt-4" onClick={() => navigate('/facilitator')}>
              Back to Console
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-slate-50">
        {/* Header */}
        <div className="bg-white border-b border-slate-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-500 mb-4"
              onClick={() => navigate('/facilitator')}
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Console
            </Button>

            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-semibold text-slate-900">{cohort.name}</h1>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-slate-400 hover:text-slate-600"
                    onClick={openEditModal}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-2 mt-2 text-sm text-slate-500 flex-wrap">
                  {cohort.organization_name && (
                    <span>{cohort.organization_name}</span>
                  )}
                  {cohort.organization_name && <span>&middot;</span>}
                  <Badge
                    variant={cohort.status === 'active' ? 'default' : 'secondary'}
                    className={
                      cohort.status === 'active'
                        ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100'
                        : ''
                    }
                  >
                    {cohort.status}
                  </Badge>
                  {(cohort.start_date || cohort.end_date) && (
                    <>
                      <span>&middot;</span>
                      <span>
                        {cohort.start_date
                          ? new Date(cohort.start_date).toLocaleDateString()
                          : '...'}
                        {' \u2013 '}
                        {cohort.end_date
                          ? new Date(cohort.end_date).toLocaleDateString()
                          : '...'}
                      </span>
                    </>
                  )}
                </div>
                <div className="flex gap-2 mt-3">
                  {cohort.ast_access && (
                    <Badge variant="outline" className="border-slate-300">AST</Badge>
                  )}
                  {cohort.ia_access && (
                    <Badge variant="outline" className="border-slate-300">IA</Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Action buttons */}
          <div className="flex items-center gap-3 mb-6">
            <Button
              onClick={() => {
                setLastCreatedInvite(null);
                setShowInviteModal(true);
              }}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Invite Participant
            </Button>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" className="gap-2 opacity-60 cursor-not-allowed" disabled>
                  <Mail className="h-4 w-4" />
                  Send Email
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Email templates coming soon. You can copy invite links manually for now.</p>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Participants Table */}
          <div className="bg-white rounded-lg border border-slate-200 mb-8">
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-medium text-slate-800">
                Participants
                {participants.length > 0 && (
                  <span className="text-sm font-normal text-slate-400 ml-2">
                    ({participants.length})
                  </span>
                )}
              </h2>
            </div>

            {participantsQuery.isLoading ? (
              <div className="text-center py-12 text-slate-400">Loading participants...</div>
            ) : participants.length === 0 ? (
              <div className="py-12 text-center">
                <UserPlus className="h-12 w-12 mx-auto text-slate-300 mb-4" />
                <p className="text-slate-600 font-medium mb-2">No participants yet</p>
                <p className="text-sm text-slate-400">
                  Use the Invite button to add your first participant to this cohort.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>AST</TableHead>
                    <TableHead>IA</TableHead>
                    <TableHead className="w-[60px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {participants.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.name || 'Unnamed'}</TableCell>
                      <TableCell className="text-slate-500">{p.email}</TableCell>
                      <TableCell className="text-slate-500 text-sm">
                        {new Date(p.joinedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell><StatusBadge status={p.astStatus} /></TableCell>
                      <TableCell><StatusBadge status={p.iaStatus} /></TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-slate-400 hover:text-red-600"
                          onClick={() => setRemoveTarget(p)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          {/* Pending Invites */}
          <div className="bg-white rounded-lg border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-medium text-slate-800">
                Pending Invites
                {pendingInvites.length > 0 && (
                  <span className="text-sm font-normal text-slate-400 ml-2">
                    ({pendingInvites.length})
                  </span>
                )}
              </h2>
            </div>

            {invitesQuery.isLoading ? (
              <div className="text-center py-12 text-slate-400">Loading invites...</div>
            ) : pendingInvites.length === 0 ? (
              <div className="py-8 text-center">
                <Clock className="h-10 w-10 mx-auto text-slate-300 mb-3" />
                <p className="text-sm text-slate-400">No pending invites.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Invite Link</TableHead>
                    <TableHead>Invited</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead className="w-[80px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingInvites.map((inv) => {
                    const url = getInviteUrl(inv.invite_code);
                    return (
                      <TableRow key={inv.id}>
                        <TableCell className="font-medium">{inv.name || '\u2014'}</TableCell>
                        <TableCell className="text-slate-500">{inv.email}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <code className="text-xs bg-slate-100 px-2 py-1 rounded truncate max-w-[200px]">
                              {url}
                            </code>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0"
                              onClick={() => copyToClipboard(url, `inv-${inv.id}`)}
                            >
                              {copiedId === `inv-${inv.id}` ? (
                                <Check className="h-3 w-3 text-emerald-600" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-500 text-sm">
                          {new Date(inv.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-slate-500 text-sm">
                          {inv.expires_at
                            ? new Date(inv.expires_at).toLocaleDateString()
                            : '\u2014'}
                        </TableCell>
                        <TableCell>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="opacity-60 cursor-not-allowed"
                                disabled
                              >
                                <RefreshCw className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Resend coming soon</p>
                            </TooltipContent>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </div>
        </div>

        {/* ── Invite Modal ──────────────────────────────────────────────────── */}
        <Dialog open={showInviteModal} onOpenChange={setShowInviteModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Invite Participant</DialogTitle>
              <DialogDescription>
                Send an invite link to add a participant to this cohort.
              </DialogDescription>
            </DialogHeader>

            {lastCreatedInvite ? (
              <div className="space-y-4">
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                  <p className="text-sm font-medium text-emerald-800 mb-2">
                    Invite created successfully!
                  </p>
                  <p className="text-xs text-emerald-600 mb-3">Share this link:</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-xs bg-white px-3 py-2 rounded border border-emerald-200 break-all">
                      {getInviteUrl(lastCreatedInvite.inviteCode || lastCreatedInvite.invite_code)}
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      className="shrink-0"
                      onClick={() =>
                        copyToClipboard(
                          getInviteUrl(lastCreatedInvite.inviteCode || lastCreatedInvite.invite_code),
                          'modal-invite'
                        )
                      }
                    >
                      {copiedId === 'modal-invite' ? (
                        <><Check className="h-4 w-4 mr-1 text-emerald-600" /> Copied</>
                      ) : (
                        <><Copy className="h-4 w-4 mr-1" /> Copy Link</>
                      )}
                    </Button>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setLastCreatedInvite(null)}
                  >
                    Invite Another
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setShowInviteModal(false)}
                  >
                    Done
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitInvite} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="invite-email">Email *</Label>
                  <Input
                    id="invite-email"
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="participant@example.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="invite-name">Name</Label>
                  <Input
                    id="invite-name"
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    placeholder="Optional"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="invite-expiry">Expiration</Label>
                  <Input
                    id="invite-expiry"
                    type="date"
                    value={inviteExpiry || defaultExpiry()}
                    onChange={(e) => setInviteExpiry(e.target.value)}
                  />
                </div>

                {inviteMutation.isError && (
                  <p className="text-sm text-red-600">
                    {(inviteMutation.error as Error).message}
                  </p>
                )}

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowInviteModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700"
                    disabled={inviteMutation.isPending || !inviteEmail.trim()}
                  >
                    {inviteMutation.isPending ? 'Creating...' : 'Create Invite'}
                  </Button>
                </DialogFooter>
              </form>
            )}
          </DialogContent>
        </Dialog>

        {/* ── Remove Confirmation Dialog ────────────────────────────────────── */}
        <Dialog open={!!removeTarget} onOpenChange={() => setRemoveTarget(null)}>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>Remove Participant</DialogTitle>
              <DialogDescription>
                Remove <strong>{removeTarget?.name}</strong> from this cohort? Their workshop
                data will not be deleted.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRemoveTarget(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => removeTarget && removeMutation.mutate(removeTarget.id)}
                disabled={removeMutation.isPending}
              >
                {removeMutation.isPending ? 'Removing...' : 'Remove'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ── Edit Cohort Modal ─────────────────────────────────────────────── */}
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit Cohort</DialogTitle>
              <DialogDescription>
                Update cohort settings and workshop access.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Name *</Label>
                <Input
                  id="edit-name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Input
                  id="edit-description"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Optional description"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-org">Organization</Label>
                <select
                  id="edit-org"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={editOrgId ?? ''}
                  onChange={(e) => setEditOrgId(e.target.value ? Number(e.target.value) : null)}
                >
                  <option value="">None</option>
                  {(orgsQuery.data?.organizations ?? []).map((org: any) => (
                    <option key={org.id} value={org.id}>{org.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between rounded-md border border-input px-3 py-2">
                  <Label htmlFor="edit-ast" className="text-sm cursor-pointer">AST Access</Label>
                  <Switch id="edit-ast" checked={editAstAccess} onCheckedChange={setEditAstAccess} />
                </div>
                <div className="flex items-center justify-between rounded-md border border-input px-3 py-2">
                  <Label htmlFor="edit-ia" className="text-sm cursor-pointer">IA Access</Label>
                  <Switch id="edit-ia" checked={editIaAccess} onCheckedChange={setEditIaAccess} />
                </div>
              </div>

              {/* Warning banner when access flags differ from current */}
              {cohort && (editAstAccess !== (cohort.ast_access ?? true) || editIaAccess !== (cohort.ia_access ?? true)) && (
                <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                  <p className="text-sm text-amber-800">
                    Changing workshop access will immediately update access for all{' '}
                    <strong>{participants.length}</strong> current participant{participants.length !== 1 ? 's' : ''} in this cohort.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-start">Start Date</Label>
                  <Input
                    id="edit-start"
                    type="date"
                    value={editStartDate}
                    onChange={(e) => setEditStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-end">End Date</Label>
                  <Input
                    id="edit-end"
                    type="date"
                    value={editEndDate}
                    onChange={(e) => setEditEndDate(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowEditModal(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700"
                  disabled={editMutation.isPending || !editName.trim()}
                >
                  {editMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};

export default FacilitatorCohortDetail;
