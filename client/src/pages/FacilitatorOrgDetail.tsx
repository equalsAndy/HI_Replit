import React, { useState } from 'react';
import { useRoute, useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import { ArrowLeft, Plus, Users, Calendar, Building2 } from 'lucide-react';

// ── API helpers ──────────────────────────────────────────────────────────────

async function fetchOrgDetail(orgId: string) {
  const res = await fetch(`/api/facilitator/organizations/${orgId}`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch organization');
  return res.json();
}

async function fetchOrganizations() {
  const res = await fetch('/api/facilitator/organizations', { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch organizations');
  return res.json();
}

async function createCohort(data: {
  name: string;
  description: string;
  organizationId: string;
  astAccess: boolean;
  iaAccess: boolean;
  isTestCohort: boolean;
  isBetaCohort: boolean;
  showDemoDataButtons: boolean;
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

// ── Component ────────────────────────────────────────────────────────────────

const FacilitatorOrgDetail: React.FC = () => {
  const [, params] = useRoute('/facilitator/organizations/:orgId');
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();

  const orgId = params?.orgId ?? '';

  const [showCohortModal, setShowCohortModal] = useState(false);
  const [cohortName, setCohortName] = useState('');
  const [cohortDescription, setCohortDescription] = useState('');
  const [cohortAst, setCohortAst] = useState(true);
  const [cohortIa, setCohortIa] = useState(true);
  const [cohortIsTest, setCohortIsTest] = useState(false);
  const [cohortIsBeta, setCohortIsBeta] = useState(false);
  const [cohortShowDemo, setCohortShowDemo] = useState(false);
  const [cohortStartDate, setCohortStartDate] = useState('');
  const [cohortEndDate, setCohortEndDate] = useState('');

  const orgQuery = useQuery({
    queryKey: ['facilitator', 'organizations', orgId],
    queryFn: () => fetchOrgDetail(orgId),
    enabled: !!orgId,
  });

  const createCohortMutation = useMutation({
    mutationFn: createCohort,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facilitator', 'organizations', orgId] });
      queryClient.invalidateQueries({ queryKey: ['facilitator', 'cohorts'] });
      queryClient.invalidateQueries({ queryKey: ['facilitator', 'organizations'] });
      setShowCohortModal(false);
      setCohortName('');
      setCohortDescription('');
      setCohortAst(true);
      setCohortIa(true);
      setCohortIsTest(false);
      setCohortIsBeta(false);
      setCohortShowDemo(false);
      setCohortStartDate('');
      setCohortEndDate('');
    },
  });

  const handleCreateCohort = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cohortName.trim()) return;
    createCohortMutation.mutate({
      name: cohortName,
      description: cohortDescription,
      organizationId: orgId,
      astAccess: cohortAst,
      iaAccess: cohortIa,
      isTestCohort: cohortIsTest,
      isBetaCohort: cohortIsBeta,
      showDemoDataButtons: cohortShowDemo,
      startDate: cohortStartDate,
      endDate: cohortEndDate,
    });
  };

  const org = orgQuery.data?.organization;
  const cohorts: any[] = orgQuery.data?.cohorts ?? [];

  if (orgQuery.isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-400">Loading organization...</div>
      </div>
    );
  }

  if (orgQuery.isError || !org) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 mb-4">Organization not found or you don't have access.</p>
          <Button variant="outline" onClick={() => navigate('/facilitator')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Facilitator Console
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                className="text-slate-500"
                onClick={() => navigate('/facilitator')}
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Facilitator Console
              </Button>
              <div className="h-5 w-px bg-slate-200" />
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-slate-400" />
                <h1 className="text-xl font-semibold text-slate-900">{org.name}</h1>
              </div>
            </div>
            <Button
              onClick={() => setShowCohortModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Cohort
            </Button>
          </div>
          {org.description && (
            <p className="mt-2 text-sm text-slate-500 ml-[calc(1rem+1px+4rem)]">
              {org.description}
            </p>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-medium text-slate-800">
            Cohorts
            {cohorts.length > 0 && (
              <span className="text-sm font-normal text-slate-400 ml-2">({cohorts.length})</span>
            )}
          </h2>
        </div>

        {cohorts.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <Users className="h-12 w-12 mx-auto text-slate-300 mb-4" />
              <p className="text-slate-600 font-medium mb-2">No cohorts yet</p>
              <p className="text-sm text-slate-400 max-w-md mx-auto mb-6">
                Create a cohort to start organizing participants in{' '}
                <span className="font-medium">{org.name}</span>.
              </p>
              <Button
                onClick={() => setShowCohortModal(true)}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Cohort
              </Button>
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
                  {cohort.description && (
                    <p className="text-sm text-slate-400 mb-3">{cohort.description}</p>
                  )}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex gap-2">
                      {cohort.ast_access && (
                        <Badge variant="outline" className="text-xs border-slate-300">AST</Badge>
                      )}
                      {cohort.ia_access && (
                        <Badge variant="outline" className="text-xs border-slate-300">IA</Badge>
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
                      {cohort.start_date ? new Date(cohort.start_date).toLocaleDateString() : '...'}
                      {' – '}
                      {cohort.end_date ? new Date(cohort.end_date).toLocaleDateString() : '...'}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* ── Create Cohort Modal ────────────────────────────────────────────── */}
      <Dialog open={showCohortModal} onOpenChange={setShowCohortModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Cohort</DialogTitle>
            <DialogDescription>
              New cohort will be added to <span className="font-medium">{org.name}</span>.
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
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between rounded-md border border-input px-3 py-2">
                <Label htmlFor="ast-access" className="text-sm cursor-pointer">AST Access</Label>
                <Switch id="ast-access" checked={cohortAst} onCheckedChange={setCohortAst} />
              </div>
              <div className="flex items-center justify-between rounded-md border border-input px-3 py-2">
                <Label htmlFor="ia-access" className="text-sm cursor-pointer">IA Access</Label>
                <Switch id="ia-access" checked={cohortIa} onCheckedChange={setCohortIa} />
              </div>
            </div>
            <div>
              <Label className="text-sm text-slate-600 mb-2 block">Participant Flags</Label>
              <div className="grid grid-cols-3 gap-3">
                <div className="flex items-center justify-between rounded-md border border-input px-3 py-2">
                  <Label htmlFor="cohort-is-test" className="text-sm cursor-pointer">Test</Label>
                  <Switch id="cohort-is-test" checked={cohortIsTest} onCheckedChange={setCohortIsTest} />
                </div>
                <div className="flex items-center justify-between rounded-md border border-input px-3 py-2">
                  <Label htmlFor="cohort-is-beta" className="text-sm cursor-pointer">Beta</Label>
                  <Switch id="cohort-is-beta" checked={cohortIsBeta} onCheckedChange={setCohortIsBeta} />
                </div>
                <div className="flex items-center justify-between rounded-md border border-input px-3 py-2">
                  <Label htmlFor="cohort-show-demo" className="text-sm cursor-pointer">Demo Data</Label>
                  <Switch id="cohort-show-demo" checked={cohortShowDemo} onCheckedChange={setCohortShowDemo} />
                </div>
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
              <Button type="button" variant="outline" onClick={() => setShowCohortModal(false)}>
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

export default FacilitatorOrgDetail;
