/**
 * AI Gateway Smoke Test
 * =====================
 * Exercises every AI surface in the slot catalog against the live selfActual
 * model-control gateway, end to end:
 *
 *   1. resolve  — what does the gateway say this slot should run on?
 *   2. dispatch — send a real (tiny) completion through the resolved transport
 *                 (Bedrock / direct Anthropic / OpenAI) and confirm it answers.
 *
 * Step 2 is the part that catches what a resolve-only check cannot: bad Bedrock
 * inference-profile IDs, missing credentials, models the account can't invoke.
 *
 * Usage:
 *   npx tsx scripts/ai-gateway-smoke-test.ts            # text surfaces only
 *   npx tsx scripts/ai-gateway-smoke-test.ts --images   # also spend on image gen
 */

import './_load-env.js'; // MUST be first — see that file for why
import { AI_SLOT_CATALOG } from '../server/config/ai-slot-catalog.js';
import {
  resolveModel,
  getProvider,
  getProviderForResolved,
  getProviderName,
} from '../server/services/ai-provider.js';
import { isGatewayConfigured, healthCheck, resolveSlot } from '../server/services/solid-pod/gateway-client.js';

const RUN_IMAGES = process.argv.includes('--images');

const PROBE = {
  systemPrompt: 'You are a test harness. Reply with exactly one word.',
  messages: [{ role: 'user' as const, content: 'Say OK.' }],
  maxTokens: 16,
  temperature: 0,
};

interface Row {
  id: string;
  workshop: string;
  control: string;
  resolved: string;
  transport: string;
  source: string;
  dispatch: 'PASS' | 'FAIL' | 'SKIP';
  detail: string;
}

const rows: Row[] = [];

function record(r: Row) {
  rows.push(r);
  const mark = r.dispatch === 'PASS' ? '✅' : r.dispatch === 'FAIL' ? '❌' : '⏭️ ';
  console.log(`${mark} ${r.id.padEnd(22)} ${r.resolved.padEnd(46)} ${r.source.padEnd(8)} ${r.detail}`);
}

async function main() {
  console.log('\n═══ AI Gateway Smoke Test ═══');
  console.log(`gateway: ${process.env.GATEWAY_BASE_URL} (configured: ${isGatewayConfigured()})`);
  const health = await healthCheck();
  console.log(`health:  ${health.ok ? 'ok' : `UNREACHABLE (${health.status} ${health.statusText})`}`);
  console.log(`env:     AI_PROVIDER=${process.env.AI_PROVIDER} AI_PROVIDER_IA=${process.env.AI_PROVIDER_IA} AI_PROVIDER_REPORTS=${process.env.AI_PROVIDER_REPORTS} AI_PROVIDER_COACHING=${process.env.AI_PROVIDER_COACHING}`);
  console.log(`bedrock: creds ${process.env.BEDROCK_ACCESS_KEY_ID ? 'explicit' : 'default chain'} region=${process.env.BEDROCK_REGION || process.env.AWS_REGION}`);
  console.log('');

  for (const entry of AI_SLOT_CATALOG) {
    // ── Image / vision slots: resolve always, dispatch only behind --images ──
    if (entry.kind === 'image') {
      const res = await resolveSlot(entry.slot!);
      const m = res.ok ? res.data?.model : null;
      const resolved = m ? `${m.provider}:${m.backendModel}` : '(unassigned)';
      if (!RUN_IMAGES) {
        record({ id: entry.id, workshop: entry.workshop, control: entry.controlType, resolved, transport: m?.provider ?? '-', source: 'gateway', dispatch: 'SKIP', detail: 'image gen costs money — rerun with --images' });
        continue;
      }
      try {
        const { default: OpenAI } = await import('openai');
        const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const t0 = Date.now();
        const img = await client.images.generate({
          model: m?.backendModel || 'gpt-image-1',
          prompt: 'a plain grey square, minimal test image',
          size: '1024x1024',
          n: 1,
        });
        const bytes = img.data?.[0]?.b64_json?.length ?? 0;
        record({ id: entry.id, workshop: entry.workshop, control: entry.controlType, resolved, transport: 'openai', source: 'gateway', dispatch: 'PASS', detail: `${Date.now() - t0}ms, ${bytes} b64 chars` });
      } catch (err) {
        record({ id: entry.id, workshop: entry.workshop, control: entry.controlType, resolved, transport: 'openai', source: 'gateway', dispatch: 'FAIL', detail: (err as Error).message.slice(0, 140) });
      }
      continue;
    }

    // ── Gateway-controlled text/vision slots ────────────────────────────────
    if (entry.controlType === 'gateway' && entry.slot) {
      const envFallback = {
        provider: (entry.envFeatureKey ? getProviderName(entry.envFeatureKey) : entry.fallbackProvider) as 'claude' | 'openai',
        model: entry.fallbackModel,
      };
      const resolvedModel = await resolveModel(entry.slot, envFallback);
      const resolved = `${resolvedModel.provider}/${resolvedModel.transport ?? 'env'}:${resolvedModel.model ?? '(default)'}`;

      try {
        const provider = await getProviderForResolved(resolvedModel);
        const t0 = Date.now();
        const out = await provider.complete({ ...PROBE, model: resolvedModel.model });
        record({ id: entry.id, workshop: entry.workshop, control: entry.controlType, resolved, transport: resolvedModel.transport ?? 'env', source: resolvedModel.source, dispatch: 'PASS', detail: `${Date.now() - t0}ms "${out.content.trim().slice(0, 20)}" in=${out.usage.inputTokens} out=${out.usage.outputTokens}` });
      } catch (err) {
        record({ id: entry.id, workshop: entry.workshop, control: entry.controlType, resolved, transport: resolvedModel.transport ?? 'env', source: resolvedModel.source, dispatch: 'FAIL', detail: (err as Error).message.slice(0, 160) });
      }
      continue;
    }

    // ── Env / hardwired surfaces (no gateway slot) ──────────────────────────
    const providerName = entry.envFeatureKey ? getProviderName(entry.envFeatureKey) : entry.fallbackProvider;
    try {
      const provider = await getProvider(entry.envFeatureKey);
      const t0 = Date.now();
      const out = await provider.complete(PROBE);
      record({ id: entry.id, workshop: entry.workshop, control: entry.controlType, resolved: `${providerName}:${out.model}`, transport: providerName, source: 'env', dispatch: 'PASS', detail: `${Date.now() - t0}ms "${out.content.trim().slice(0, 20)}"` });
    } catch (err) {
      record({ id: entry.id, workshop: entry.workshop, control: entry.controlType, resolved: `${providerName}:(env default)`, transport: providerName, source: 'env', dispatch: 'FAIL', detail: (err as Error).message.slice(0, 160) });
    }
  }

  // ── Env-driven IA surfaces that have no gateway slot ─────────────────────
  // These go getProvider('ia') → Claude-family → Bedrock (no CLAUDE_API_KEY set).
  // They are the surfaces the catalog marks controlType:'env', and they broke
  // silently once the direct Anthropic key was retired — so probe them by name.
  console.log('\n── unslotted IA surfaces (getProvider(\'ia\') → Bedrock) ──');
  const IA_ENV_SURFACES = [
    { id: 'ia-chat', site: 'ia-chat-routes.ts:197' },
    { id: 'ia-3-7-reflection', site: 'module-reflection-routes.ts:195,231' },
    { id: 'ia-4-3-prompt-build', site: 'image-gen.ts:91,230' },
    { id: 'ia-training-docs', site: 'exercise-training-docs-routes.ts:195' },
  ];
  for (const s of IA_ENV_SURFACES) {
    try {
      const provider = await getProvider('ia');
      const t0 = Date.now();
      const out = await provider.complete(PROBE);
      record({ id: s.id, workshop: 'IA', control: 'env', resolved: `${provider.name}:${out.model}`, transport: provider.constructor.name, source: 'env', dispatch: 'PASS', detail: `${Date.now() - t0}ms "${out.content.trim().slice(0, 20)}" ← ${s.site}` });
    } catch (err) {
      record({ id: s.id, workshop: 'IA', control: 'env', resolved: 'claude:(env default)', transport: '-', source: 'env', dispatch: 'FAIL', detail: `${(err as Error).message.slice(0, 120)} ← ${s.site}` });
    }
  }

  const pass = rows.filter(r => r.dispatch === 'PASS').length;
  const fail = rows.filter(r => r.dispatch === 'FAIL').length;
  const skip = rows.filter(r => r.dispatch === 'SKIP').length;
  console.log(`\n─── ${pass} passed, ${fail} failed, ${skip} skipped ───`);

  // A green run that never actually reached the gateway is worse than a red one:
  // every slot degrades to the env fallback and still answers. Call that out.
  const degraded = rows.filter(r => r.control === 'gateway' && r.source !== 'gateway' && r.dispatch !== 'SKIP');
  if (!isGatewayConfigured()) {
    console.log('\n⚠️  GATEWAY NOT CONFIGURED — every slot above used its env fallback.');
    console.log('   These results say nothing about gateway routing. Check GATEWAY_BASE_URL/GATEWAY_SERVICE_TOKEN.');
    process.exit(1);
  }
  if (degraded.length) {
    console.log(`\n⚠️  ${degraded.length} gateway slot(s) answered via fallback, not the gateway:`);
    for (const r of degraded) console.log(`   ${r.id} (source=${r.source})`);
    process.exit(1);
  }
  if (fail) {
    console.log('\nFailures:');
    for (const r of rows.filter(r => r.dispatch === 'FAIL')) {
      console.log(`  ${r.id} [${r.resolved}] → ${r.detail}`);
    }
  }
  process.exit(fail ? 1 : 0);
}

main().catch((err) => {
  console.error('smoke test crashed:', err);
  process.exit(2);
});
