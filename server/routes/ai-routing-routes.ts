/**
 * AI Routing Inventory Routes
 * ===========================
 * Backs the admin "Model Routing" sub-tab. Read-only: enumerates every AI surface
 * from the slot catalog and reports, per surface, the currently-effective provider
 * and model — resolving gateway slots LIVE against the selfActual model-control
 * plane (bypassing the runtime cache) so an operator sees ground truth.
 *
 * Phase 1: current-state report.
 * Phase 2 (later): add cached-vs-live comparison + force re-resolve to confirm a
 * console change propagated.
 */

import express from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { AI_SLOT_CATALOG } from '../config/ai-slot-catalog.js';
import { getProviderName } from '../services/ai-provider.js';
import {
  resolveSlot,
  isGatewayConfigured,
  healthCheck,
} from '../services/solid-pod/gateway-client.js';

const router = express.Router();

/** Map a gateway vendor name to HI's internal provider name (mirrors ai-provider). */
function mapGatewayProvider(provider: string | undefined): 'claude' | 'openai' | null {
  switch (provider?.toLowerCase().trim()) {
    case 'anthropic':
    case 'bedrock':
      // bedrock is Claude-family, dispatched via the AWS Bedrock runtime.
      return 'claude';
    case 'openai':
      return 'openai';
    default:
      return null; // together / unknown — no client wired; caller falls back
  }
}

interface LiveResolution {
  /** Effective provider HI would dispatch to right now. */
  provider: string;
  /** Effective backend model id (or null → provider default). */
  model: string | null;
  /** Where the effective answer came from. */
  source: 'gateway' | 'env-fallback' | 'unassigned' | 'unsupported-provider' | 'gateway-unreachable' | 'env';
  /** Raw model record the gateway returned for a slot (diagnostics), if any. */
  gatewayModel?: {
    id: string;
    label?: string;
    provider: string;
    backendModel: string;
    status?: string;
  } | null;
}

/**
 * GET /api/admin/ai/routing
 * Full routing inventory with live resolution for gateway slots.
 */
router.get('/', requireAuth, requireAdmin, async (_req, res) => {
  const gatewayConfigured = isGatewayConfigured();

  // One health probe (cheap, no auth) so the console can show gateway status.
  let gatewayReachable = false;
  if (gatewayConfigured) {
    try {
      const health = await healthCheck();
      gatewayReachable = health.ok;
    } catch {
      gatewayReachable = false;
    }
  }

  const rows = await Promise.all(
    AI_SLOT_CATALOG.map(async (entry) => {
      let live: LiveResolution;

      if (entry.controlType === 'gateway' && entry.slot) {
        const fallback: LiveResolution = {
          provider: entry.fallbackProvider,
          model: entry.fallbackModel ?? null,
          source: gatewayConfigured ? 'env-fallback' : 'gateway-unreachable',
          gatewayModel: null,
        };

        if (!gatewayConfigured) {
          live = fallback;
        } else {
          try {
            const resolvedRes = await resolveSlot(entry.slot);
            const model = resolvedRes.ok ? resolvedRes.data?.model ?? null : null;
            if (!model) {
              live = { ...fallback, source: 'unassigned' };
            } else {
              const mapped = mapGatewayProvider(model.provider);
              if (!mapped) {
                live = {
                  ...fallback,
                  source: 'unsupported-provider',
                  gatewayModel: model,
                };
              } else {
                live = {
                  provider: mapped,
                  model: model.backendModel ?? null,
                  source: 'gateway',
                  gatewayModel: model,
                };
              }
            }
          } catch {
            live = fallback;
          }
        }
      } else {
        // env / hardwired: provider comes from AI_PROVIDER_{FEATURE} / AI_PROVIDER.
        const provider = entry.envFeatureKey
          ? getProviderName(entry.envFeatureKey)
          : entry.fallbackProvider;
        live = {
          provider,
          model: entry.fallbackModel ?? null,
          source: 'env',
        };
      }

      return {
        id: entry.id,
        label: entry.label,
        workshop: entry.workshop,
        exercise: entry.exercise,
        controlType: entry.controlType,
        kind: entry.kind,
        slot: entry.slot ?? null,
        envFeatureKey: entry.envFeatureKey ?? null,
        trainingDocs: entry.trainingDocs,
        sourceFile: entry.sourceFile,
        notes: entry.notes ?? null,
        live,
      };
    })
  );

  res.json({
    ok: true,
    gateway: {
      configured: gatewayConfigured,
      reachable: gatewayReachable,
      baseUrl: process.env.GATEWAY_BASE_URL || 'http://localhost:3002 (default — unset)',
    },
    rows,
    timestamp: new Date().toISOString(),
  });
});

export default router;
