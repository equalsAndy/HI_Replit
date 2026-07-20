import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Network,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

// ─── Types (mirror server/routes/ai-routing-routes.ts) ───────────────────────

type ControlType = 'gateway' | 'env' | 'hardwired';

interface LiveResolution {
  provider: string;
  model: string | null;
  source:
    | 'gateway'
    | 'env-fallback'
    | 'unassigned'
    | 'unsupported-provider'
    | 'gateway-unreachable'
    | 'env';
  gatewayModel?: {
    id: string;
    label?: string;
    provider: string;
    backendModel: string;
    status?: string;
  } | null;
}

interface RoutingRow {
  id: string;
  label: string;
  workshop: 'AST' | 'IA' | 'shared';
  exercise: string;
  controlType: ControlType;
  kind: 'text' | 'image' | 'vision';
  slot: string | null;
  envFeatureKey: string | null;
  trainingDocs: { location: string; pointer?: string };
  sourceFile: string;
  notes: string | null;
  live: LiveResolution;
}

interface RoutingResponse {
  ok: boolean;
  gateway: { configured: boolean; reachable: boolean; baseUrl: string };
  rows: RoutingRow[];
  timestamp: string;
}

// ─── Badge helpers ───────────────────────────────────────────────────────────

const CONTROL_META: Record<ControlType, { label: string; className: string; hint: string }> = {
  gateway: {
    label: 'Gateway',
    className: 'bg-green-600 hover:bg-green-700 text-white',
    hint: 'Changeable live from the selfActual model-control console',
  },
  env: {
    label: 'Env',
    className: 'bg-amber-600 hover:bg-amber-700 text-white',
    hint: 'Chosen from AI_PROVIDER_* env vars — needs a redeploy to change',
  },
  hardwired: {
    label: 'Hardwired',
    className: 'bg-gray-500 hover:bg-gray-600 text-white',
    hint: 'Model lives outside HI (e.g. OpenAI Assistant) — not settable here',
  },
};

/** Colour/icon for the effective-resolution source. */
function sourceBadge(source: LiveResolution['source']) {
  switch (source) {
    case 'gateway':
      return { label: 'gateway (live)', className: 'bg-green-100 text-green-800 border-green-300' };
    case 'env':
      return { label: 'env config', className: 'bg-amber-100 text-amber-800 border-amber-300' };
    case 'env-fallback':
      return { label: 'env fallback', className: 'bg-orange-100 text-orange-800 border-orange-300' };
    case 'unassigned':
      return { label: 'unassigned → fallback', className: 'bg-orange-100 text-orange-800 border-orange-300' };
    case 'unsupported-provider':
      return { label: 'unsupported provider', className: 'bg-red-100 text-red-800 border-red-300' };
    case 'gateway-unreachable':
      return { label: 'gateway unreachable', className: 'bg-red-100 text-red-800 border-red-300' };
    default:
      return { label: source, className: 'bg-gray-100 text-gray-700 border-gray-300' };
  }
}

const WORKSHOP_COLOR: Record<string, string> = {
  AST: 'text-blue-700 bg-blue-50 border-blue-200',
  IA: 'text-purple-700 bg-purple-50 border-purple-200',
  shared: 'text-gray-700 bg-gray-50 border-gray-200',
};

export default function AIRoutingDashboard() {
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const { data, isLoading, isError, refetch, isFetching } = useQuery<RoutingResponse>({
    queryKey: ['/api/admin/ai/routing'],
    refetchInterval: false,
  });

  const handleRefresh = async () => {
    await refetch();
    setLastRefresh(new Date());
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-6 w-6 animate-spin mr-2" />
          <span>Loading model routing…</span>
        </div>
      </div>
    );
  }

  if (isError || !data?.ok) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6 flex items-center gap-2 text-red-600">
            <XCircle className="h-5 w-5" />
            Failed to load routing inventory.
            <Button onClick={handleRefresh} variant="outline" size="sm" className="ml-2">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const rows = data.rows;
  const gatewayControlled = rows.filter((r) => r.controlType === 'gateway').length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Network className="h-6 w-6" />
            AI Model Routing
          </h1>
          <p className="text-gray-600 mt-1">
            Every AI surface, the model it currently runs, where that choice comes from, and where its
            training docs live.
          </p>
        </div>
        <Button onClick={handleRefresh} variant="outline" className="flex items-center gap-2" disabled={isFetching}>
          <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Gateway status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">selfActual Gateway (model-control plane)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col p-3 bg-gray-50 rounded-lg">
              <span className="text-xs text-gray-500 uppercase tracking-wide mb-1">Configured</span>
              <span className="flex items-center gap-1 font-medium">
                {data.gateway.configured ? (
                  <><CheckCircle className="h-4 w-4 text-green-600" /> Yes</>
                ) : (
                  <><XCircle className="h-4 w-4 text-red-500" /> No (base URL / token unset)</>
                )}
              </span>
            </div>
            <div className="flex flex-col p-3 bg-gray-50 rounded-lg">
              <span className="text-xs text-gray-500 uppercase tracking-wide mb-1">Reachable</span>
              <span className="flex items-center gap-1 font-medium">
                {data.gateway.reachable ? (
                  <><CheckCircle className="h-4 w-4 text-green-600" /> Healthy</>
                ) : (
                  <><AlertTriangle className="h-4 w-4 text-amber-500" /> Not reachable</>
                )}
              </span>
            </div>
            <div className="flex flex-col p-3 bg-gray-50 rounded-lg">
              <span className="text-xs text-gray-500 uppercase tracking-wide mb-1">Base URL</span>
              <span className="font-mono text-xs break-all">{data.gateway.baseUrl}</span>
            </div>
          </div>
          {!data.gateway.configured && (
            <p className="text-xs text-amber-700 mt-3">
              Gateway not configured — all gateway slots fall back to their env defaults. Set
              GATEWAY_BASE_URL and GATEWAY_SERVICE_TOKEN to enable live control.
            </p>
          )}
          <p className="text-xs text-gray-500 mt-3">
            {gatewayControlled} of {rows.length} surfaces are gateway-controlled — those are the ones you
            can change from the selfActual console without a redeploy.
          </p>
        </CardContent>
      </Card>

      {/* Inventory table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Routing inventory</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                  <th className="px-4 py-3">Surface</th>
                  <th className="px-4 py-3">Control</th>
                  <th className="px-4 py-3">Effective model</th>
                  <th className="px-4 py-3">Source / slot</th>
                  <th className="px-4 py-3">Training docs</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const ctl = CONTROL_META[row.controlType];
                  const src = sourceBadge(row.live.source);
                  return (
                    <tr key={row.id} className="border-b last:border-0 align-top hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{row.label}</div>
                        <div className="mt-1 flex items-center gap-2">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded border ${WORKSHOP_COLOR[row.workshop]}`}>
                            {row.workshop}
                          </span>
                          <span className="text-xs text-gray-500">{row.exercise}</span>
                          <span className="text-[10px] text-gray-400">· {row.kind}</span>
                        </div>
                        {row.notes && (
                          <div className="mt-1 text-[11px] text-gray-400 max-w-md">{row.notes}</div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={ctl.className} title={ctl.hint}>{ctl.label}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium capitalize">{row.live.provider}</div>
                        <div className="font-mono text-xs text-gray-600">
                          {row.live.model ?? '(provider default)'}
                        </div>
                        {row.live.gatewayModel?.label && (
                          <div className="text-[11px] text-gray-400">{row.live.gatewayModel.label}</div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className={src.className}>{src.label}</Badge>
                        {row.slot && (
                          <div className="font-mono text-[11px] text-gray-500 mt-1">{row.slot}</div>
                        )}
                        {!row.slot && row.envFeatureKey && (
                          <div className="font-mono text-[11px] text-gray-500 mt-1">
                            AI_PROVIDER_{row.envFeatureKey.toUpperCase()}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-xs text-gray-700">{row.trainingDocs.location}</div>
                        {row.trainingDocs.pointer && (
                          <div className="font-mono text-[11px] text-gray-400 mt-0.5 break-all">
                            {row.trainingDocs.pointer}
                          </div>
                        )}
                        <div className="font-mono text-[10px] text-gray-300 mt-1">{row.sourceFile}</div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Legend + timestamp */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
        <span className="font-medium">Control types:</span>
        <span className="flex items-center gap-1"><Badge className={CONTROL_META.gateway.className}>Gateway</Badge> live from console</span>
        <span className="flex items-center gap-1"><Badge className={CONTROL_META.env.className}>Env</Badge> needs redeploy</span>
        <span className="flex items-center gap-1"><Badge className={CONTROL_META.hardwired.className}>Hardwired</Badge> outside HI</span>
      </div>
      <div className="text-xs text-gray-400 text-right">
        Last refreshed: {lastRefresh.toLocaleTimeString()}
        {data.timestamp && ` | Server: ${new Date(data.timestamp).toLocaleTimeString()}`}
      </div>
    </div>
  );
}
