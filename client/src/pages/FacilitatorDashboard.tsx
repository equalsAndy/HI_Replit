import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCurrentUser } from '@/hooks/use-current-user';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
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
import { Plus, Building2, Users, Calendar, ArrowLeft, Mail } from 'lucide-react';
import EmailTemplateManagement from '@/components/admin/email/EmailTemplateManagement';
import { useLocation } from 'wouter';

// ── API helpers ──────────────────────────────────────────────────────────────

async function fetchOrganizations() {
  const res = await fetch('/api/facilitator/organizations', { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch organizations');
  return res.json();
}

async function fetchCohorts() {
  const res = await fetch('/api/facilitator/cohorts', { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch cohorts');
  return res.json();
}

async function createOrganization(data: { name: string; description: string }) {
  const res = await fetch('/api/facilitator/organizations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create organization');
  return res.json();
}

async function createCohort(data: {
  name: string;
  description: string;
  organizationId: number | null;
  astAccess: boolean;
  iaAccess: boolean;
  startDate: string;
  endDate: string;
}) {
  const res = await fetch('/api/facilitator/cohorts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create cohort');
  return res.json();
}

// ── Main component ───────────────────────────────────────────────────────────

const FacilitatorDashboard: React.FC = () => {
  const { data: user } = useCurrentUser();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();

  const [showOrgModal, setShowOrgModal] = useState(false);
  const [showCohortModal, setShowCohortModal] = useState(false);

  // Form state — organizations
  const [orgName, setOrgName] = useState('');
  const [orgDescription, setOrgDescription] = useState('');

  // Form state — cohorts
  const [cohortName, setCohortName] = useState('');
  const [cohortDescription, setCohortDescription] = useState('');
  const [cohortOrgId, setCohortOrgId] = useState<number | null>(null);
  const [cohortAst, setCohortAst] = useState(true);
  const [cohortIa, setCohortIa] = useState(true);
  const [cohortStartDate, setCohortStartDate] = useState('');
  const [cohortEndDate, setCohortEndDate] = useState('');

  // ── Queries ──────────────────────────────────────────────────────────────

  const orgsQuery = useQuery({
    queryKey: ['facilitator', 'organizations'],
    queryFn: fetchOrganizations,
  });

  const cohortsQuery = useQuery({
    queryKey: ['facilitator', 'cohorts'],
    queryFn: fetchCohorts,
  });

  // ── Mutations ────────────────────────────────────────────────────────────

  const createOrgMutation = useMutation({
    mutationFn: createOrganization,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facilitator', 'organizations'] });
      setShowOrgModal(false);
      setOrgName('');
      setOrgDescription('');
    },
  });

  const createCohortMutation = useMutation({
    mutationFn: createCohort,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facilitator', 'cohorts'] });
      setShowCohortModal(false);
      setCohortName('');
      setCohortDescription('');
      setCohortOrgId(null);
      setCohortAst(true);
      setCohortIa(true);
      setCohortStartDate('');
      setCohortEndDate('');
    },
  });

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleCreateOrg = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName.trim()) return;
    createOrgMutation.mutate({ name: orgName, description: orgDescription });
  };

  const handleCreateCohort = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cohortName.trim()) return;
    createCohortMutation.mutate({
      name: cohortName,
      description: cohortDescription,
      organizationId: cohortOrgId,
      astAccess: cohortAst,
      iaAccess: cohortIa,
      startDate: cohortStartDate,
      endDate: cohortEndDate,
    });
  };

  const organizations: any[] = orgsQuery.data?.organizations ?? [];
  const cohorts: any[] = cohortsQuery.data?.cohorts ?? [];

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">
                Heliotrope Imaginal &mdash; Facilitator Console
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Welcome, {user?.firstName || user?.username || 'Facilitator'}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-500"
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="organizations">
          <TabsList className="mb-6">
            <TabsTrigger value="organizations" className="gap-2">
              <Building2 className="h-4 w-4" />
              Organizations
            </TabsTrigger>
            <TabsTrigger value="cohorts" className="gap-2">
              <Users className="h-4 w-4" />
              Cohorts
            </TabsTrigger>
            <TabsTrigger value="email-templates" className="gap-2">
              <Mail className="h-4 w-4" />
              Email Templates
            </TabsTrigger>
          </TabsList>

          {/* ── Organizations Tab ──────────────────────────────────────── */}
          <TabsContent value="organizations">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-medium text-slate-800">Your Organizations</h2>
              <Button
                onClick={() => setShowOrgModal(true)}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Organization
              </Button>
            </div>

            {orgsQuery.isLoading ? (
              <div className="text-center py-12 text-slate-400">Loading organizations...</div>
            ) : organizations.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center">
                  <Building2 className="h-12 w-12 mx-auto text-slate-300 mb-4" />
                  <p className="text-slate-600 font-medium mb-2">No organizations yet</p>
                  <p className="text-sm text-slate-400 max-w-md mx-auto">
                    Create your first organization to get started. This could be a company,
                    school, coaching client, or any group you work with.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {organizations.map((org: any) => (
                  <Card key={org.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">{org.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {org.description && (
                        <p className="text-sm text-slate-500 mb-3">{org.description}</p>
                      )}
                      <p className="text-xs text-slate-400">
                        Created {new Date(org.created_at).toLocaleDateString()}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* ── Cohorts Tab ────────────────────────────────────────────── */}
          <TabsContent value="cohorts">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-medium text-slate-800">Your Cohorts</h2>
              <Button
                onClick={() => setShowCohortModal(true)}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Cohort
              </Button>
            </div>

            {cohortsQuery.isLoading ? (
              <div className="text-center py-12 text-slate-400">Loading cohorts...</div>
            ) : cohorts.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center">
                  <Users className="h-12 w-12 mx-auto text-slate-300 mb-4" />
                  <p className="text-slate-600 font-medium mb-2">No cohorts yet</p>
                  <p className="text-sm text-slate-400 max-w-md mx-auto">
                    Create a cohort to organize participants within an organization.
                    A cohort might be a team, a class, a program cohort, or a client engagement.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {cohorts.map((cohort: any) => (
                  <Card
                    key={cohort.id}
                    className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => navigate(`/facilitator/cohorts/${cohort.id}`)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{cohort.name}</CardTitle>
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
                    </CardHeader>
                    <CardContent>
                      {cohort.organization_name && (
                        <p className="text-sm text-slate-500 mb-2">{cohort.organization_name}</p>
                      )}
                      {cohort.description && (
                        <p className="text-sm text-slate-400 mb-3">{cohort.description}</p>
                      )}
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex gap-2">
                          {cohort.ast_access && (
                            <Badge variant="outline" className="text-xs border-slate-300">
                              AST
                            </Badge>
                          )}
                          {cohort.ia_access && (
                            <Badge variant="outline" className="text-xs border-slate-300">
                              IA
                            </Badge>
                          )}
                        </div>
                        <span className="flex items-center gap-1 text-xs text-slate-400">
                          <Users className="h-3 w-3" />
                          {cohort.participant_count ?? 0} participant{cohort.participant_count !== 1 ? 's' : ''}
                        </span>
                      </div>
                      {(cohort.start_date || cohort.end_date) && (
                        <div className="flex items-center text-xs text-slate-400 gap-1">
                          <Calendar className="h-3 w-3" />
                          {cohort.start_date
                            ? new Date(cohort.start_date).toLocaleDateString()
                            : '...'}
                          {' \u2013 '}
                          {cohort.end_date
                            ? new Date(cohort.end_date).toLocaleDateString()
                            : '...'}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* ── Email Templates Tab ──────────────────────────────────────── */}
          <TabsContent value="email-templates">
            <EmailTemplateManagement />
          </TabsContent>

        </Tabs>
      </div>

      {/* ── Create Organization Modal ──────────────────────────────────────── */}
      <Dialog open={showOrgModal} onOpenChange={setShowOrgModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Organization</DialogTitle>
            <DialogDescription>
              Add a new organization you facilitate programs for.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateOrg} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="org-name">Name *</Label>
              <Input
                id="org-name"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                placeholder="e.g. Acme Corp, Jefferson Middle School"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="org-description">Description</Label>
              <Input
                id="org-description"
                value={orgDescription}
                onChange={(e) => setOrgDescription(e.target.value)}
                placeholder="Optional description"
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowOrgModal(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700"
                disabled={createOrgMutation.isPending || !orgName.trim()}
              >
                {createOrgMutation.isPending ? 'Creating...' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Create Cohort Modal ────────────────────────────────────────────── */}
      <Dialog open={showCohortModal} onOpenChange={setShowCohortModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Cohort</DialogTitle>
            <DialogDescription>
              Set up a new cohort to organize participants.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateCohort} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cohort-name">Name *</Label>
              <Input
                id="cohort-name"
                value={cohortName}
                onChange={(e) => setCohortName(e.target.value)}
                placeholder="e.g. Q1 Leadership Cohort, Spring 2026 Teachers"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cohort-description">Description</Label>
              <Input
                id="cohort-description"
                value={cohortDescription}
                onChange={(e) => setCohortDescription(e.target.value)}
                placeholder="Optional description"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cohort-org">Organization</Label>
              <select
                id="cohort-org"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={cohortOrgId ?? ''}
                onChange={(e) =>
                  setCohortOrgId(e.target.value ? Number(e.target.value) : null)
                }
              >
                <option value="">None</option>
                {organizations.map((org: any) => (
                  <option key={org.id} value={org.id}>
                    {org.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between rounded-md border border-input px-3 py-2">
                <Label htmlFor="ast-access" className="text-sm cursor-pointer">
                  AST Access
                </Label>
                <Switch
                  id="ast-access"
                  checked={cohortAst}
                  onCheckedChange={setCohortAst}
                />
              </div>
              <div className="flex items-center justify-between rounded-md border border-input px-3 py-2">
                <Label htmlFor="ia-access" className="text-sm cursor-pointer">
                  IA Access
                </Label>
                <Switch
                  id="ia-access"
                  checked={cohortIa}
                  onCheckedChange={setCohortIa}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-date">Start Date</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={cohortStartDate}
                  onChange={(e) => setCohortStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-date">End Date</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={cohortEndDate}
                  onChange={(e) => setCohortEndDate(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCohortModal(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700"
                disabled={createCohortMutation.isPending || !cohortName.trim()}
              >
                {createCohortMutation.isPending ? 'Creating...' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FacilitatorDashboard;
