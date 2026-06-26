import React, { useState, useRef, useCallback } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
  UserMinus,
  Clock,
  Pencil,
  AlertTriangle,
  ShieldOff,
  ShieldCheck,
  Download,
  Upload,
  LogIn,
  FileSpreadsheet,
  MoreHorizontal,
  ArrowRight,
  X,
} from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────

interface Participant {
  id: number;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  jobTitle: string;
  organization: string;
  joinedAt: string;
  lastLoginAt: string | null;
  disabledAt: string | null;
  astAccess: boolean;
  iaAccess: boolean;
  astStatus: 'complete' | 'in_progress' | 'not_started';
  iaStatus: 'complete' | 'in_progress' | 'not_started';
  astStepCount: number;
  iaStepCount: number;
  inviteUsed: boolean;
}

interface PendingInvite {
  id: number;
  invite_code: string;
  email: string;
  name: string | null;
  created_by: number;
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
  name?: string; description?: string; organizationId?: string | null;
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

async function fetchFacilitatorCohorts() {
  const res = await fetch('/api/facilitator/cohorts', { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch cohorts');
  return res.json();
}

async function deleteInvite(cohortId: string, inviteId: number) {
  const res = await fetch(`/api/facilitator/cohorts/${cohortId}/invites/${inviteId}`, {
    method: 'DELETE', credentials: 'include',
  });
  const json = await res.json();
  if (!res.ok || !json.success) throw new Error(json.error || 'Failed to delete invite');
  return json;
}

async function removeInviteFromCohort(cohortId: string, inviteId: number) {
  const res = await fetch(`/api/facilitator/cohorts/${cohortId}/invites/${inviteId}/remove`, {
    method: 'PATCH', credentials: 'include',
  });
  const json = await res.json();
  if (!res.ok || !json.success) throw new Error(json.error || 'Failed to remove invite');
  return json;
}

async function moveInvite(cohortId: string, inviteId: number, targetCohortId: number) {
  const res = await fetch(`/api/facilitator/cohorts/${cohortId}/invites/${inviteId}/move`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ targetCohortId }),
  });
  const json = await res.json();
  if (!res.ok || !json.success) throw new Error(json.error || 'Failed to move invite');
  return json;
}

async function moveParticipant(cohortId: string, userId: number, targetCohortId: number) {
  const res = await fetch(`/api/facilitator/cohorts/${cohortId}/participants/${userId}/move`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ targetCohortId }),
  });
  const json = await res.json();
  if (!res.ok || !json.success) throw new Error(json.error || 'Failed to move participant');
  return json;
}

async function bulkCreateInvites(cohortId: string, invitees: { email: string; name: string; jobTitle?: string; organization?: string }[]) {
  const res = await fetch(`/api/facilitator/cohorts/${cohortId}/invites/bulk`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ invitees }),
  });
  const json = await res.json();
  if (!res.ok || !json.success) throw new Error(json.error || 'Failed to create invites');
  return json;
}

interface InviteeRow {
  key: string;
  name: string;
  email: string;
  jobTitle: string;
  organization: string;
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

  // Invite modal state — multi-row form
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteeRows, setInviteeRows] = useState<InviteeRow[]>([{ key: '1', name: '', email: '', jobTitle: '', organization: '' }]);
  const [inviteModalStep, setInviteModalStep] = useState<'form' | 'success'>('form');
  const [createdInvites, setCreatedInvites] = useState<any[]>([]);
  const [inviteErrors, setInviteErrors] = useState<string[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [parseError, setParseError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Remove confirmation
  const [removeTarget, setRemoveTarget] = useState<Participant | null>(null);

  // Edit profile modal
  const [editProfileTarget, setEditProfileTarget] = useState<Participant | null>(null);
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editJobTitle, setEditJobTitle] = useState('');
  const [editOrganization, setEditOrganization] = useState('');

  // Disable/enable confirmation
  const [disableTarget, setDisableTarget] = useState<Participant | null>(null);

  // Delete invite confirmation
  const [deleteInviteTarget, setDeleteInviteTarget] = useState<PendingInvite | null>(null);

  // Move modal (invite or participant)
  const [moveInviteTarget, setMoveInviteTarget] = useState<PendingInvite | null>(null);
  const [moveParticipantTarget, setMoveParticipantTarget] = useState<Participant | null>(null);
  const [moveTargetCohortId, setMoveTargetCohortId] = useState<string>('');

  // Email modal state
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailTargetInvite, setEmailTargetInvite] = useState<PendingInvite | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [emailSelectedIds, setEmailSelectedIds] = useState<Set<number>>(new Set());

  // Change organization modal state
  const [showChangeOrgModal, setShowChangeOrgModal] = useState(false);
  const [changeOrgId, setChangeOrgId] = useState<string>('');

  // Edit cohort modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editOrgId, setEditOrgId] = useState<string | null>(null);
  const [editStartDate, setEditStartDate] = useState('');
  const [editEndDate, setEditEndDate] = useState('');
  const [editAstAccess, setEditAstAccess] = useState(true);
  const [editIaAccess, setEditIaAccess] = useState(true);
  const [editIsTestCohort, setEditIsTestCohort] = useState(false);
  const [editIsBetaCohort, setEditIsBetaCohort] = useState(false);
  const [editShowDemoData, setEditShowDemoData] = useState(false);

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

  const allCohortsQuery = useQuery({
    queryKey: ['facilitator', 'cohorts'],
    queryFn: fetchFacilitatorCohorts,
    enabled: !!(moveInviteTarget || moveParticipantTarget),
  });

  // ── Mutations ────────────────────────────────────────────────────────────

  const removeMutation = useMutation({
    mutationFn: (userId: number) => removeParticipant(cohortId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facilitator', 'cohort', cohortId, 'participants'] });
      setRemoveTarget(null);
    },
  });

  const bulkInviteMutation = useMutation({
    mutationFn: (rows: InviteeRow[]) =>
      bulkCreateInvites(cohortId, rows.map(r => ({ email: r.email, name: r.name, jobTitle: r.jobTitle, organization: r.organization }))),
    onSuccess: (data) => {
      setCreatedInvites(data.invites || []);
      setInviteErrors(data.errors || []);
      setInviteModalStep('success');
      queryClient.invalidateQueries({ queryKey: ['facilitator', 'cohort', cohortId, 'invites'] });
    },
  });

  const disableParticipantMutation = useMutation({
    mutationFn: ({ userId, disabled }: { userId: number; disabled: boolean }) =>
      fetch(`/api/facilitator/cohorts/${cohortId}/participants/${userId}/disable`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ disabled }),
      }).then(async (r) => {
        if (!r.ok) throw new Error('Failed to update account status');
        return r.json();
      }),
    onSuccess: (_, vars) => {
      toast({
        title: vars.disabled ? 'Account disabled' : 'Account re-enabled',
        description: vars.disabled
          ? 'The participant can no longer log in.'
          : 'The participant can now log in again.',
      });
      setDisableTarget(null);
      queryClient.invalidateQueries({ queryKey: ['facilitator', 'cohort', cohortId, 'participants'] });
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data: { userId: number; firstName: string; lastName: string; email: string; jobTitle: string; organization: string }) =>
      fetch(`/api/facilitator/cohorts/${cohortId}/participants/${data.userId}/profile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      }).then(async (r) => {
        if (!r.ok) throw new Error('Failed to update profile');
        return r.json();
      }),
    onSuccess: () => {
      toast({ title: 'Profile updated' });
      setEditProfileTarget(null);
      queryClient.invalidateQueries({ queryKey: ['facilitator', 'cohort', cohortId, 'participants'] });
    },
  });

  const deleteInviteMutation = useMutation({
    mutationFn: (inviteId: number) => deleteInvite(cohortId, inviteId),
    onSuccess: () => {
      toast({ title: 'Invite deleted' });
      setDeleteInviteTarget(null);
      queryClient.invalidateQueries({ queryKey: ['facilitator', 'cohort', cohortId, 'invites'] });
    },
    onError: (err: Error) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  });

  const removeInviteMutation = useMutation({
    mutationFn: (inviteId: number) => removeInviteFromCohort(cohortId, inviteId),
    onSuccess: () => {
      toast({ title: 'Invite removed from cohort' });
      queryClient.invalidateQueries({ queryKey: ['facilitator', 'cohort', cohortId, 'invites'] });
    },
    onError: (err: Error) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  });

  const moveInviteMutation = useMutation({
    mutationFn: ({ inviteId, targetCohortId }: { inviteId: number; targetCohortId: number }) =>
      moveInvite(cohortId, inviteId, targetCohortId),
    onSuccess: () => {
      toast({ title: 'Invite moved' });
      setMoveInviteTarget(null);
      setMoveTargetCohortId('');
      queryClient.invalidateQueries({ queryKey: ['facilitator', 'cohort', cohortId, 'invites'] });
    },
    onError: (err: Error) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  });

  const moveParticipantMutation = useMutation({
    mutationFn: ({ userId, targetCohortId }: { userId: number; targetCohortId: number }) =>
      moveParticipant(cohortId, userId, targetCohortId),
    onSuccess: () => {
      toast({ title: 'Participant moved' });
      setMoveParticipantTarget(null);
      setMoveTargetCohortId('');
      queryClient.invalidateQueries({ queryKey: ['facilitator', 'cohort', cohortId, 'participants'] });
      queryClient.invalidateQueries({ queryKey: ['facilitator', 'cohort', cohortId, 'invites'] });
    },
    onError: (err: Error) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  });

  const editMutation = useMutation({
    mutationFn: (data: Parameters<typeof updateCohort>[1]) => updateCohort(cohortId, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['facilitator', 'cohort', cohortId] });
      queryClient.invalidateQueries({ queryKey: ['facilitator', 'cohorts'] });
      setShowEditModal(false);
      if (data.propagatedCount > 0) {
        toast({
          title: 'Cohort settings updated',
          description: `Flags updated for ${data.propagatedCount} participant${data.propagatedCount !== 1 ? 's' : ''} and all pending invites.`,
        });
      }
    },
  });

  const changeOrgMutation = useMutation({
    mutationFn: (organizationId: string | null) => updateCohort(cohortId, { organizationId: organizationId || null }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facilitator', 'cohort', cohortId] });
      queryClient.invalidateQueries({ queryKey: ['facilitator', 'cohorts'] });
      queryClient.invalidateQueries({ queryKey: ['facilitator', 'organizations'] });
      setShowChangeOrgModal(false);
      toast({ title: 'Organization updated' });
    },
    onError: (err: Error) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  });

  const templatesQuery = useQuery({
    queryKey: ['email-templates'],
    queryFn: async () => {
      const res = await fetch('/api/email-templates', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch templates');
      const data = await res.json();
      return (data.templates || []) as Array<{ id: number; name: string; subject: string }>;
    },
    enabled: showEmailModal || inviteModalStep === 'success',
  });

  const sendEmailMutation = useMutation({
    mutationFn: async ({ inviteIds, templateId }: { inviteIds: number[]; templateId: number }) => {
      const res = await fetch('/api/email-send/bulk', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteIds, templateId, senderIdentity: 'heliotrope' }),
      });
      if (!res.ok) throw new Error('Failed to send email');
      return res.json();
    },
    onSuccess: (_, vars) => {
      toast({
        title: 'Email sent',
        description: `Invite email sent to ${vars.inviteIds.length} recipient${vars.inviteIds.length !== 1 ? 's' : ''}.`,
      });
      setShowEmailModal(false);
      setEmailTargetInvite(null);
      // Close invite modal if send was triggered from there
      if (inviteModalStep === 'success') {
        setShowInviteModal(false);
        resetInviteModal();
      }
      setSelectedTemplateId('');
      queryClient.invalidateQueries({ queryKey: ['facilitator', 'cohort', cohortId, 'invites'] });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to send email. Please try again.', variant: 'destructive' });
    },
  });

  function openEmailModal(invite: PendingInvite | null) {
    setEmailTargetInvite(invite);
    setSelectedTemplateId('');
    setEmailSelectedIds(invite ? new Set([invite.id]) : new Set(pendingInvites.map((i) => i.id)));
    setShowEmailModal(true);
  }

  function handleSendEmail() {
    const templateId = parseInt(selectedTemplateId);
    if (!templateId) return;
    const inviteIds = emailTargetInvite
      ? [emailTargetInvite.id]
      : Array.from(emailSelectedIds);
    if (inviteIds.length === 0) return;
    sendEmailMutation.mutate({ inviteIds, templateId });
  }

  function toggleEmailRecipient(id: number) {
    setEmailSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

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
    setEditIsTestCohort(cohort.is_test_cohort ?? false);
    setEditIsBetaCohort(cohort.is_beta_cohort ?? false);
    setEditShowDemoData(cohort.show_demo_data_buttons ?? false);
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
      isTestCohort: editIsTestCohort,
      isBetaCohort: editIsBetaCohort,
      showDemoDataButtons: editShowDemoData,
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

  function openEditProfile(p: Participant) {
    setEditProfileTarget(p);
    setEditFirstName(p.firstName);
    setEditLastName(p.lastName);
    setEditEmail(p.email);
    setEditJobTitle(p.jobTitle);
    setEditOrganization(p.organization);
  }

  function addInviteeRow() {
    setInviteeRows(rows => [...rows, { key: String(Date.now()), name: '', email: '', jobTitle: '', organization: '' }]);
  }

  function removeInviteeRow(key: string) {
    setInviteeRows(rows => rows.filter(r => r.key !== key));
  }

  function updateInviteeRow(key: string, field: keyof Omit<InviteeRow, 'key'>, value: string) {
    setInviteeRows(rows => rows.map(r => r.key === key ? { ...r, [field]: value } : r));
  }

  function resetInviteModal() {
    setInviteeRows([{ key: '1', name: '', email: '', jobTitle: '', organization: '' }]);
    setInviteModalStep('form');
    setCreatedInvites([]);
    setInviteErrors([]);
    setSelectedTemplateId('');
    setParseError('');
    setDragOver(false);
  }

  function handleSubmitInvites(e: React.FormEvent) {
    e.preventDefault();
    const valid = inviteeRows.filter(r => r.email.trim());
    if (!valid.length) return;
    bulkInviteMutation.mutate(valid);
  }

  function downloadTemplate() {
    const csv = 'Full name,Email,Job title,Organization\nJane Smith,jane@example.com,Product Manager,Acme Corp\n';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'participant-invite-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  function normalizeHeader(h: string) {
    return h.toLowerCase().replace(/[\s_-]+/g, '');
  }

  function rowsFromData(headers: string[], data: string[][]): InviteeRow[] {
    const idx = (candidates: string[]) => {
      for (const c of candidates) {
        const found = headers.findIndex(h => normalizeHeader(h) === c);
        if (found !== -1) return found;
      }
      return -1;
    };
    const nameIdx   = idx(['fullname', 'name', 'firstname']);
    const emailIdx  = idx(['email', 'emailaddress']);
    const titleIdx  = idx(['jobtitle', 'title', 'position', 'role']);
    const orgIdx    = idx(['organization', 'org', 'company', 'employer']);

    return data
      .filter(row => row.some(cell => cell?.trim()))
      .map((row, i) => ({
        key: `upload-${i}-${Date.now()}`,
        name:         nameIdx  >= 0 ? (row[nameIdx]  || '').trim() : '',
        email:        emailIdx >= 0 ? (row[emailIdx] || '').trim() : '',
        jobTitle:     titleIdx >= 0 ? (row[titleIdx] || '').trim() : '',
        organization: orgIdx   >= 0 ? (row[orgIdx]   || '').trim() : '',
      }))
      .filter(r => r.email);
  }

  const handleFileUpload = useCallback((file: File) => {
    setParseError('');
    const ext = file.name.split('.').pop()?.toLowerCase();

    if (ext === 'csv') {
      Papa.parse(file, {
        skipEmptyLines: true,
        complete: (result) => {
          const [headers, ...data] = result.data as string[][];
          if (!headers) { setParseError('Could not read file headers.'); return; }
          const parsed = rowsFromData(headers, data);
          if (!parsed.length) { setParseError('No valid rows found (email column required).'); return; }
          setInviteeRows(parsed);
        },
        error: () => setParseError('Failed to parse CSV file.'),
      });
    } else if (ext === 'xlsx' || ext === 'xls') {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const wb = XLSX.read(e.target?.result, { type: 'array' });
          const ws = wb.Sheets[wb.SheetNames[0]];
          const raw = XLSX.utils.sheet_to_json<string[]>(ws, { header: 1 }) as string[][];
          const [headers, ...data] = raw;
          if (!headers) { setParseError('Could not read file headers.'); return; }
          const parsed = rowsFromData(headers.map(String), data.map(r => r.map(c => String(c ?? ''))));
          if (!parsed.length) { setParseError('No valid rows found (email column required).'); return; }
          setInviteeRows(parsed);
        } catch {
          setParseError('Failed to parse spreadsheet.');
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      setParseError('Please upload a .csv, .xlsx, or .xls file.');
    }
  }, []);

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
          {/* Cohort Details Card */}
          <div className="bg-white rounded-lg border border-slate-200 mb-8">
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-medium text-slate-800">Cohort Details</h2>
            </div>
            <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4 text-sm">
              <div>
                <span className="text-slate-400 block mb-1">Organization</span>
                <div className="flex items-center gap-2">
                  <span className="text-slate-800 font-medium">
                    {cohort.organization_name || <span className="text-slate-400 font-normal italic">None</span>}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs text-slate-500 hover:text-slate-700"
                    onClick={() => {
                      setChangeOrgId(cohort.organization_id ?? '');
                      setShowChangeOrgModal(true);
                    }}
                  >
                    Change
                  </Button>
                </div>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Status</span>
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
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Participants</span>
                <span className="text-slate-800 font-medium">{participants.length}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Workshop Access</span>
                <div className="flex gap-2">
                  {cohort.ast_access && (
                    <Badge variant="outline" className="border-blue-300 text-blue-700">AST</Badge>
                  )}
                  {cohort.ia_access && (
                    <Badge variant="outline" className="border-purple-300 text-purple-700">IA</Badge>
                  )}
                  {!cohort.ast_access && !cohort.ia_access && (
                    <span className="text-slate-400 italic">None</span>
                  )}
                </div>
              </div>
              {(cohort.is_test_cohort || cohort.is_beta_cohort || cohort.show_demo_data_buttons) && (
                <div>
                  <span className="text-slate-400 block mb-1">Participant Flags</span>
                  <div className="flex gap-2 flex-wrap">
                    {cohort.is_test_cohort && (
                      <Badge variant="outline" className="border-slate-300 text-slate-600">Test</Badge>
                    )}
                    {cohort.is_beta_cohort && (
                      <Badge variant="outline" className="border-emerald-300 text-emerald-700">Beta</Badge>
                    )}
                    {cohort.show_demo_data_buttons && (
                      <Badge variant="outline" className="border-orange-300 text-orange-700">Demo Data</Badge>
                    )}
                  </div>
                </div>
              )}
              <div>
                <span className="text-slate-400 block mb-1">Start Date</span>
                <span className="text-slate-800 font-medium">
                  {cohort.start_date
                    ? new Date(cohort.start_date).toLocaleDateString()
                    : <span className="text-slate-400 font-normal italic">Not set</span>}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">End Date</span>
                <span className="text-slate-800 font-medium">
                  {cohort.end_date
                    ? new Date(cohort.end_date).toLocaleDateString()
                    : <span className="text-slate-400 font-normal italic">Not set</span>}
                </span>
              </div>
              {cohort.description && (
                <div className="sm:col-span-2 lg:col-span-3">
                  <span className="text-slate-400 block mb-1">Description</span>
                  <span className="text-slate-800">{cohort.description}</span>
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 mb-6">
            <Button
              onClick={() => {
                resetInviteModal();
                setShowInviteModal(true);
              }}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Invite Participant
            </Button>

            <Button
              variant="outline"
              className="gap-2"
              onClick={() => openEmailModal(null)}
              disabled={pendingInvites.length === 0}
            >
              <Mail className="h-4 w-4" />
              Send Email
            </Button>
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
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Participant</TableHead>
                      <TableHead>Access</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>AST</TableHead>
                      <TableHead>IA</TableHead>
                      <TableHead className="text-right pr-4">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {participants.map((p) => (
                      <TableRow key={p.id} className={p.disabledAt ? 'opacity-50' : undefined}>
                        {/* Participant name + email */}
                        <TableCell>
                          <div>
                            <p className="font-medium text-slate-800 flex items-center gap-1.5">
                              {p.name || 'Unnamed'}
                              {p.disabledAt && (
                                <Badge variant="outline" className="text-xs text-red-500 border-red-300 py-0">
                                  Disabled
                                </Badge>
                              )}
                            </p>
                            <p className="text-xs text-slate-400">{p.email}</p>
                          </div>
                        </TableCell>

                        {/* Workshop access */}
                        <TableCell>
                          <div className="flex gap-1">
                            {p.astAccess && (
                              <Badge variant="outline" className="text-xs border-blue-200 text-blue-600">AST</Badge>
                            )}
                            {p.iaAccess && (
                              <Badge variant="outline" className="text-xs border-purple-200 text-purple-600">IA</Badge>
                            )}
                          </div>
                        </TableCell>

                        {/* Login / joined status */}
                        <TableCell>
                          {p.lastLoginAt ? (
                            <div>
                              <p className="text-xs text-slate-500 flex items-center gap-1">
                                <LogIn className="h-3 w-3" />
                                {new Date(p.lastLoginAt).toLocaleDateString()}
                              </p>
                              <p className="text-xs text-slate-400">
                                Joined {new Date(p.joinedAt).toLocaleDateString()}
                              </p>
                            </div>
                          ) : p.inviteUsed ? (
                            <p className="text-xs text-amber-600">Invite redeemed, not logged in</p>
                          ) : (
                            <p className="text-xs text-slate-400 italic">Never logged in</p>
                          )}
                        </TableCell>

                        {/* AST progress */}
                        <TableCell>
                          {p.astAccess ? (
                            <div>
                              <StatusBadge status={p.astStatus} />
                              {p.astStatus === 'in_progress' && (
                                <p className="text-xs text-slate-400 mt-0.5">{p.astStepCount} steps</p>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-slate-300">—</span>
                          )}
                        </TableCell>

                        {/* IA progress */}
                        <TableCell>
                          {p.iaAccess ? (
                            <div>
                              <StatusBadge status={p.iaStatus} />
                              {p.iaStatus === 'in_progress' && (
                                <p className="text-xs text-slate-400 mt-0.5">{p.iaStepCount} steps</p>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-slate-300">—</span>
                          )}
                        </TableCell>

                        {/* Actions */}
                        <TableCell>
                          <div className="flex items-center justify-end gap-1">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-slate-400 hover:text-indigo-600"
                                  onClick={() => openEditProfile(p)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent><p>Edit profile</p></TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-slate-400 hover:text-indigo-600"
                                  onClick={() => window.open(`/api/star-card/admin/download/${p.id}`, '_blank')}
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent><p>Download star card</p></TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className={`h-8 w-8 p-0 ${p.disabledAt ? 'text-amber-500 hover:text-emerald-600' : 'text-slate-400 hover:text-amber-600'}`}
                                  onClick={() => setDisableTarget(p)}
                                >
                                  {p.disabledAt ? (
                                    <ShieldCheck className="h-4 w-4" />
                                  ) : (
                                    <ShieldOff className="h-4 w-4" />
                                  )}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{p.disabledAt ? 'Re-enable account' : 'Disable account'}</p>
                              </TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-slate-400 hover:text-slate-600"
                                  onClick={() => { setMoveParticipantTarget(p); setMoveTargetCohortId(''); }}
                                >
                                  <ArrowRight className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent><p>Move to another cohort</p></TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-slate-400 hover:text-red-600"
                                  onClick={() => setRemoveTarget(p)}
                                >
                                  <UserMinus className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent><p>Remove from cohort</p></TooltipContent>
                            </Tooltip>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
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
                          <div className="flex items-center gap-1">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => openEmailModal(inv)}>
                                  <RefreshCw className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent><p>Send invite email</p></TooltipContent>
                            </Tooltip>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => { setMoveInviteTarget(inv); setMoveTargetCohortId(''); }}>
                                  <ArrowRight className="h-4 w-4 mr-2" />
                                  Move to cohort…
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => removeInviteMutation.mutate(inv.id)}>
                                  <X className="h-4 w-4 mr-2" />
                                  Remove from cohort
                                </DropdownMenuItem>
                                {inv.created_by === cohort?.facilitator_id && (
                                  <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      className="text-red-600 focus:text-red-600"
                                      onClick={() => setDeleteInviteTarget(inv)}
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Delete invite
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
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
        <Dialog open={showInviteModal} onOpenChange={(open) => {
          setShowInviteModal(open);
          if (!open) resetInviteModal();
        }}>
          <DialogContent className="sm:max-w-4xl">
            {inviteModalStep === 'form' ? (
              <>
                <DialogHeader>
                  <DialogTitle>Add Participants</DialogTitle>
                  <DialogDescription>
                    Enter each person's details. Email is required; name, job title, and organization are optional but recommended.
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmitInvites} className="space-y-4 pt-2">

                  {/* Drop zone + template download */}
                  <div
                    className={`border-2 border-dashed rounded-lg p-5 text-center transition-colors ${dragOver ? 'border-indigo-400 bg-indigo-50' : 'border-slate-200 hover:border-slate-300'}`}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragOver(false);
                      const file = e.dataTransfer.files[0];
                      if (file) handleFileUpload(file);
                    }}
                  >
                    <FileSpreadsheet className="h-7 w-7 mx-auto text-slate-300 mb-2" />
                    <p className="text-sm text-slate-500 mb-3">
                      Drop a CSV or Excel file here, or{' '}
                      <button
                        type="button"
                        className="text-indigo-600 hover:underline font-medium"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        browse to upload
                      </button>
                    </p>
                    <Button type="button" variant="outline" size="sm" onClick={downloadTemplate} className="gap-1.5 text-xs">
                      <Download className="h-3.5 w-3.5" />
                      Download blank template
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv,.xlsx,.xls"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file);
                        e.target.value = '';
                      }}
                    />
                  </div>

                  {parseError && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertTriangle className="h-4 w-4" /> {parseError}
                    </p>
                  )}

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
                    <div className="relative flex justify-center">
                      <span className="bg-white px-2 text-xs text-slate-400">or enter manually</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="grid grid-cols-[1fr_1.2fr_1fr_1fr_36px] gap-2 text-xs font-medium text-slate-500 px-1">
                      <span>Full name</span>
                      <span>Email *</span>
                      <span>Job title</span>
                      <span>Organization</span>
                      <span />
                    </div>
                    {inviteeRows.map((row) => (
                      <div key={row.key} className="grid grid-cols-[1fr_1.2fr_1fr_1fr_36px] gap-2 items-center">
                        <Input
                          value={row.name}
                          onChange={(e) => updateInviteeRow(row.key, 'name', e.target.value)}
                          placeholder="Jane Smith"
                        />
                        <Input
                          type="email"
                          value={row.email}
                          onChange={(e) => updateInviteeRow(row.key, 'email', e.target.value)}
                          placeholder="jane@example.com"
                          required={inviteeRows.length === 1}
                        />
                        <Input
                          value={row.jobTitle}
                          onChange={(e) => updateInviteeRow(row.key, 'jobTitle', e.target.value)}
                          placeholder="Product Manager"
                        />
                        <Input
                          value={row.organization}
                          onChange={(e) => updateInviteeRow(row.key, 'organization', e.target.value)}
                          placeholder="Acme Corp"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-slate-400 hover:text-red-500 px-2"
                          onClick={() => removeInviteeRow(row.key)}
                          disabled={inviteeRows.length === 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 mt-1"
                      onClick={addInviteeRow}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Another
                    </Button>
                  </div>

                  {bulkInviteMutation.isError && (
                    <p className="text-sm text-red-600">
                      {(bulkInviteMutation.error as Error).message}
                    </p>
                  )}

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setShowInviteModal(false)}>
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="bg-indigo-600 hover:bg-indigo-700"
                      disabled={bulkInviteMutation.isPending || !inviteeRows.some(r => r.email.trim())}
                    >
                      {bulkInviteMutation.isPending
                        ? 'Creating...'
                        : `Create Invite${inviteeRows.filter(r => r.email.trim()).length !== 1 ? 's' : ''}`}
                    </Button>
                  </DialogFooter>
                </form>
              </>
            ) : (
              <>
                <DialogHeader>
                  <DialogTitle>Invites Created</DialogTitle>
                  <DialogDescription>
                    {createdInvites.length} invite{createdInvites.length !== 1 ? 's' : ''} created successfully.
                    {inviteErrors.length > 0 && ` ${inviteErrors.length} skipped.`}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 pt-2">
                  {/* Errors (skipped rows) */}
                  {inviteErrors.length > 0 && (
                    <div className="rounded-md bg-amber-50 border border-amber-200 p-3 space-y-1">
                      {inviteErrors.map((err, i) => (
                        <p key={i} className="text-xs text-amber-700">{err}</p>
                      ))}
                    </div>
                  )}

                  {/* Created invite links */}
                  <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 space-y-2 max-h-40 overflow-y-auto">
                    {createdInvites.map((inv) => {
                      const code = inv.invite_code || inv.inviteCode;
                      const url = getInviteUrl(code);
                      return (
                        <div key={inv.id} className="flex items-center gap-2">
                          <span className="text-xs text-emerald-800 font-medium min-w-[120px] truncate">
                            {inv.name || inv.email}
                          </span>
                          <code className="flex-1 text-xs bg-white px-2 py-1 rounded border border-emerald-200 truncate">
                            {url}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 shrink-0"
                            onClick={() => copyToClipboard(url, `ci-${inv.id}`)}
                          >
                            {copiedId === `ci-${inv.id}` ? (
                              <Check className="h-3 w-3 text-emerald-600" />
                            ) : (
                              <Copy className="h-3 w-3 text-slate-500" />
                            )}
                          </Button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Template picker for email send */}
                  <div className="border-t pt-4 space-y-3">
                    <p className="text-sm font-medium text-slate-700">Send invite emails now?</p>
                    {templatesQuery.isLoading ? (
                      <p className="text-sm text-slate-500">Loading templates...</p>
                    ) : (templatesQuery.data?.length ?? 0) === 0 ? (
                      <p className="text-sm text-slate-500">No templates available. You can send links manually above.</p>
                    ) : (
                      <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a template to send emails" />
                        </SelectTrigger>
                        <SelectContent>
                          {templatesQuery.data?.map((t) => (
                            <SelectItem key={t.id} value={String(t.id)}>
                              {t.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>

                <DialogFooter className="gap-2">
                  <Button variant="outline" onClick={() => { setShowInviteModal(false); resetInviteModal(); }}>
                    Done
                  </Button>
                  <Button
                    onClick={() => {
                      const templateId = parseInt(selectedTemplateId);
                      if (!templateId) return;
                      sendEmailMutation.mutate({
                        inviteIds: createdInvites.map(i => i.id),
                        templateId,
                      });
                    }}
                    disabled={!selectedTemplateId || sendEmailMutation.isPending}
                    className="bg-indigo-600 hover:bg-indigo-700"
                  >
                    {sendEmailMutation.isPending ? 'Sending...' : 'Send Invite Emails'}
                  </Button>
                </DialogFooter>
              </>
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

        {/* ── Edit Participant Profile Modal ────────────────────────────────── */}
        <Dialog open={!!editProfileTarget} onOpenChange={(open) => !open && setEditProfileTarget(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Profile</DialogTitle>
              <DialogDescription>
                Update {editProfileTarget?.name || 'this participant'}'s profile information.
              </DialogDescription>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!editProfileTarget) return;
                updateProfileMutation.mutate({
                  userId: editProfileTarget.id,
                  firstName: editFirstName,
                  lastName: editLastName,
                  email: editEmail,
                  jobTitle: editJobTitle,
                  organization: editOrganization,
                });
              }}
              className="space-y-3 pt-1"
            >
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="ep-first">First name</Label>
                  <Input id="ep-first" value={editFirstName} onChange={(e) => setEditFirstName(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="ep-last">Last name</Label>
                  <Input id="ep-last" value={editLastName} onChange={(e) => setEditLastName(e.target.value)} />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="ep-email">Email</Label>
                <Input id="ep-email" type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="ep-title">Job title</Label>
                <Input id="ep-title" value={editJobTitle} onChange={(e) => setEditJobTitle(e.target.value)} placeholder="Optional" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="ep-org">Organization</Label>
                <Input id="ep-org" value={editOrganization} onChange={(e) => setEditOrganization(e.target.value)} placeholder="Optional" />
              </div>
              {updateProfileMutation.isError && (
                <p className="text-sm text-red-600">{(updateProfileMutation.error as Error).message}</p>
              )}
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditProfileTarget(null)}>Cancel</Button>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700" disabled={updateProfileMutation.isPending}>
                  {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* ── Disable / Enable Account Dialog ──────────────────────────────── */}
        <Dialog open={!!disableTarget} onOpenChange={(open) => !open && setDisableTarget(null)}>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>
                {disableTarget?.disabledAt ? 'Re-enable Account' : 'Disable Account'}
              </DialogTitle>
              <DialogDescription>
                {disableTarget?.disabledAt
                  ? `Re-enable ${disableTarget.name}'s account so they can log in again.`
                  : `Disable ${disableTarget?.name}'s account. They will not be able to log in until re-enabled. Their data will not be deleted.`}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDisableTarget(null)}>Cancel</Button>
              <Button
                variant={disableTarget?.disabledAt ? 'default' : 'destructive'}
                className={disableTarget?.disabledAt ? 'bg-emerald-600 hover:bg-emerald-700' : undefined}
                onClick={() => {
                  if (!disableTarget) return;
                  disableParticipantMutation.mutate({
                    userId: disableTarget.id,
                    disabled: !disableTarget.disabledAt,
                  });
                }}
                disabled={disableParticipantMutation.isPending}
              >
                {disableParticipantMutation.isPending
                  ? 'Updating...'
                  : disableTarget?.disabledAt ? 'Re-enable Account' : 'Disable Account'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ── Delete Invite Confirmation ────────────────────────────────────── */}
        <Dialog open={!!deleteInviteTarget} onOpenChange={(open) => !open && setDeleteInviteTarget(null)}>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>Delete Invite</DialogTitle>
              <DialogDescription>
                Permanently delete the invite for <strong>{deleteInviteTarget?.email}</strong>? The invite
                link will stop working. This cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteInviteTarget(null)}>Cancel</Button>
              <Button
                variant="destructive"
                disabled={deleteInviteMutation.isPending}
                onClick={() => deleteInviteTarget && deleteInviteMutation.mutate(deleteInviteTarget.id)}
              >
                {deleteInviteMutation.isPending ? 'Deleting…' : 'Delete Invite'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ── Move Invite Dialog ────────────────────────────────────────────── */}
        <Dialog
          open={!!moveInviteTarget}
          onOpenChange={(open) => { if (!open) { setMoveInviteTarget(null); setMoveTargetCohortId(''); } }}
        >
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>Move Invite to Cohort</DialogTitle>
              <DialogDescription>
                Move the invite for <strong>{moveInviteTarget?.email}</strong> to a different cohort.
              </DialogDescription>
            </DialogHeader>
            <div className="py-2">
              <Label className="mb-2 block">Select cohort</Label>
              <Select value={moveTargetCohortId} onValueChange={setMoveTargetCohortId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a cohort…" />
                </SelectTrigger>
                <SelectContent>
                  {(allCohortsQuery.data?.cohorts ?? [])
                    .filter((c: any) => String(c.id) !== cohortId)
                    .map((c: any) => (
                      <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setMoveInviteTarget(null); setMoveTargetCohortId(''); }}>
                Cancel
              </Button>
              <Button
                disabled={!moveTargetCohortId || moveInviteMutation.isPending}
                onClick={() => {
                  if (moveInviteTarget && moveTargetCohortId) {
                    moveInviteMutation.mutate({ inviteId: moveInviteTarget.id, targetCohortId: parseInt(moveTargetCohortId) });
                  }
                }}
              >
                {moveInviteMutation.isPending ? 'Moving…' : 'Move Invite'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ── Move Participant Dialog ───────────────────────────────────────── */}
        <Dialog
          open={!!moveParticipantTarget}
          onOpenChange={(open) => { if (!open) { setMoveParticipantTarget(null); setMoveTargetCohortId(''); } }}
        >
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>Move Participant to Cohort</DialogTitle>
              <DialogDescription>
                Move <strong>{moveParticipantTarget?.name}</strong> to a different cohort. Their invite (if any) will move with them.
              </DialogDescription>
            </DialogHeader>
            <div className="py-2">
              <Label className="mb-2 block">Select cohort</Label>
              <Select value={moveTargetCohortId} onValueChange={setMoveTargetCohortId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a cohort…" />
                </SelectTrigger>
                <SelectContent>
                  {(allCohortsQuery.data?.cohorts ?? [])
                    .filter((c: any) => String(c.id) !== cohortId)
                    .map((c: any) => (
                      <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setMoveParticipantTarget(null); setMoveTargetCohortId(''); }}>
                Cancel
              </Button>
              <Button
                disabled={!moveTargetCohortId || moveParticipantMutation.isPending}
                onClick={() => {
                  if (moveParticipantTarget && moveTargetCohortId) {
                    moveParticipantMutation.mutate({ userId: moveParticipantTarget.id, targetCohortId: parseInt(moveTargetCohortId) });
                  }
                }}
              >
                {moveParticipantMutation.isPending ? 'Moving…' : 'Move Participant'}
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
                  onChange={(e) => setEditOrgId(e.target.value || null)}
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

              {/* Participant flags */}
              <div>
                <Label className="text-sm text-slate-600 mb-2 block">Participant Flags</Label>
                <div className="grid grid-cols-3 gap-3">
                  <div className="flex items-center justify-between rounded-md border border-input px-3 py-2">
                    <Label htmlFor="edit-is-test" className="text-sm cursor-pointer">Test</Label>
                    <Switch id="edit-is-test" checked={editIsTestCohort} onCheckedChange={setEditIsTestCohort} />
                  </div>
                  <div className="flex items-center justify-between rounded-md border border-input px-3 py-2">
                    <Label htmlFor="edit-is-beta" className="text-sm cursor-pointer">Beta</Label>
                    <Switch id="edit-is-beta" checked={editIsBetaCohort} onCheckedChange={setEditIsBetaCohort} />
                  </div>
                  <div className="flex items-center justify-between rounded-md border border-input px-3 py-2">
                    <Label htmlFor="edit-show-demo" className="text-sm cursor-pointer">Demo Data</Label>
                    <Switch id="edit-show-demo" checked={editShowDemoData} onCheckedChange={setEditShowDemoData} />
                  </div>
                </div>
              </div>

              {/* Warning banner when any flag differs from current */}
              {cohort && (
                editAstAccess !== (cohort.ast_access ?? true) ||
                editIaAccess !== (cohort.ia_access ?? true) ||
                editIsTestCohort !== (cohort.is_test_cohort ?? false) ||
                editIsBetaCohort !== (cohort.is_beta_cohort ?? false) ||
                editShowDemoData !== (cohort.show_demo_data_buttons ?? false)
              ) && (
                <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                  <p className="text-sm text-amber-800">
                    Flag changes will immediately update all{' '}
                    <strong>{participants.length}</strong> current participant{participants.length !== 1 ? 's' : ''} and all pending invites in this cohort.
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
        {/* ── Send Email Modal ──────────────────────────────────────────────── */}
        <Dialog open={showEmailModal} onOpenChange={(open) => {
          setShowEmailModal(open);
          if (!open) { setEmailTargetInvite(null); setSelectedTemplateId(''); setEmailSelectedIds(new Set()); }
        }}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Send Invite Email</DialogTitle>
              <DialogDescription>
                {emailTargetInvite
                  ? `Send an invite email to ${emailTargetInvite.name || emailTargetInvite.email}.`
                  : `Select recipients and choose a template.`}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              {/* Recipient checklist — only shown in bulk mode */}
              {!emailTargetInvite && pendingInvites.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Recipients</Label>
                    <button
                      type="button"
                      className="text-xs text-indigo-600 hover:underline"
                      onClick={() =>
                        setEmailSelectedIds(
                          emailSelectedIds.size === pendingInvites.length
                            ? new Set()
                            : new Set(pendingInvites.map((i) => i.id))
                        )
                      }
                    >
                      {emailSelectedIds.size === pendingInvites.length ? 'Deselect all' : 'Select all'}
                    </button>
                  </div>
                  <div className="max-h-48 overflow-y-auto rounded-md border border-slate-200 divide-y divide-slate-100">
                    {pendingInvites.map((inv) => (
                      <label
                        key={inv.id}
                        className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-slate-50"
                      >
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                          checked={emailSelectedIds.has(inv.id)}
                          onChange={() => toggleEmailRecipient(inv.id)}
                        />
                        <span className="text-sm text-slate-700 truncate">
                          {inv.name ? `${inv.name} — ${inv.email}` : inv.email}
                        </span>
                      </label>
                    ))}
                  </div>
                  <p className="text-xs text-slate-500">
                    {emailSelectedIds.size} of {pendingInvites.length} selected
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="template-select">Email Template</Label>
                {templatesQuery.isLoading ? (
                  <p className="text-sm text-slate-500">Loading templates...</p>
                ) : (templatesQuery.data?.length ?? 0) === 0 ? (
                  <p className="text-sm text-slate-500">
                    No templates available. Create one in the Email Templates section.
                  </p>
                ) : (
                  <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                    <SelectTrigger id="template-select">
                      <SelectValue placeholder="Select a template" />
                    </SelectTrigger>
                    <SelectContent>
                      {templatesQuery.data?.map((t) => (
                        <SelectItem key={t.id} value={String(t.id)}>
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEmailModal(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSendEmail}
                disabled={
                  !selectedTemplateId ||
                  sendEmailMutation.isPending ||
                  (!emailTargetInvite && emailSelectedIds.size === 0)
                }
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                {sendEmailMutation.isPending
                  ? 'Sending...'
                  : emailTargetInvite
                  ? 'Send Email'
                  : `Send to ${emailSelectedIds.size}`}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      {/* ── Change Organization Modal ──────────────────────────────────────── */}
      <Dialog open={showChangeOrgModal} onOpenChange={setShowChangeOrgModal}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Change Organization</DialogTitle>
            <DialogDescription>
              Move this cohort to a different organization, or remove it from any organization.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Label htmlFor="change-org-select">Organization</Label>
            <select
              id="change-org-select"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={changeOrgId}
              onChange={(e) => setChangeOrgId(e.target.value)}
            >
              <option value="">— None —</option>
              {(orgsQuery.data?.organizations ?? []).map((org: any) => (
                <option key={org.id} value={org.id}>{org.name}</option>
              ))}
            </select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowChangeOrgModal(false)}>
              Cancel
            </Button>
            <Button
              className="bg-indigo-600 hover:bg-indigo-700"
              disabled={changeOrgMutation.isPending}
              onClick={() => changeOrgMutation.mutate(changeOrgId || null)}
            >
              {changeOrgMutation.isPending ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      </div>
    </TooltipProvider>
  );
};

export default FacilitatorCohortDetail;
