# Model Control Plane — Heliotrope Integration Spec

**Status:** Draft for HI review
**Author:** Claude Code (selfActual gateway side)
**Date:** 2026-07-20
**Audience:** Heliotrope / HI_Replit maintainers

This describes how HI stops choosing AI models from environment variables and
starts resolving them from the selfActual gateway's **model control plane**, so
that model choice per feature becomes a console setting instead of a redeploy.
Nothing here is merged yet. Please review the assumptions — several are things
only the HI side can confirm, marked **[HI confirm]**.

> **[HI response — 2026-07-20]** HI has reviewed this spec against the codebase.
> Full reply, corrections, and answers to §8 are in
> **`MODEL-CONTROL-INTEGRATION-HI-RESPONSE.md`**. Inline `[HI response →]` markers
> below point to the relevant section. Headlines: §3.1 is wrong for production (IA
> exercises run Claude Haiku, not gpt-4.1-mini); "nine trainings" is really five
> live ones; §6 telemetry needs an ingest endpoint we don't have; and we need the
> `GATEWAY_SERVICE_TOKEN` handed over.

---

## 1. Why

Today HI decides which model runs each AI feature in-process, from env vars:

```
getProviderName(feature)  →  AI_PROVIDER_{FEATURE} → AI_PROVIDER → 'openai'
                             (server/services/ai-provider.ts:104)
model id                  →  CLAUDE_MODEL, or training.model_default
```

Changing a model means editing env and redeploying. There is no way to see, per
feature, what is running, and no way to change it without a deploy.

The control plane moves that decision to the gateway. A **slot** (a named
consumption point, e.g. `hi.ia-4-3`) is assigned a **model** in the console;
HI asks the gateway "what model for this slot?" and dispatches on the answer.
The model record is the complete dispatch spec — it carries both the provider
and the backend model id — so it replaces `AI_PROVIDER_{FEATURE}` **and**
`CLAUDE_MODEL`, not just one of them.

Environment isolation is automatic: staging HI resolves against the staging
gateway (database `platform_staging`), production against production
(`platform`). Same slot key, different answer per environment — nothing in HI
needs to know which environment it is in beyond `GATEWAY_BASE_URL`.

---

## 2. The contract (gateway side — authoritative)

Base URL is `GATEWAY_BASE_URL` (see §4). All calls use the existing
`gatewayRequest()` auth in `server/services/solid-pod/gateway-client.ts`:
`Authorization: Bearer $GATEWAY_SERVICE_TOKEN` plus `X-SA-App`. No per-user JWT.

### 2.1 Resolve a slot

```
GET /api/model-control/resolve/:slot
```

Auth: authenticated only (the service token suffices — **no** `admin:pods`
scope needed, unlike the write endpoints).

Response:

```json
{
  "ok": true,
  "slot": "hi.ia-4-3",
  "modelId": "sonnet",
  "model": {
    "id": "sonnet",
    "label": "Claude Sonnet 4.6",
    "provider": "anthropic",
    "backendModel": "claude-sonnet-4-6",
    "status": "active"
  }
}
```

`model` is `null` when the slot has no assignment and no fallback resolves.
Callers MUST treat `model: null` as "use my local default" (see §5).

**`provider` is the dispatch selector.** It names both the vendor and the
serving method:

| provider    | client to use                              | backendModel is…              |
|-------------|--------------------------------------------|-------------------------------|
| `anthropic` | direct Anthropic SDK                        | canonical model id            |
| `openai`    | OpenAI SDK                                  | OpenAI model id               |
| `bedrock`   | AWS Bedrock runtime                         | `us.anthropic.*` profile id   |
| `together`  | Together                                    | Together model id             |

The consumer dispatches on `provider` and sends `backendModel`. It does **not**
keep its own model-id translation table — if the console adds a model the
consumer has never seen, a local map would break silently at the point of
change. (Today no HI feature uses `bedrock`; it is listed for completeness.)

### 2.2 Read the whole registry (optional, for diagnostics)

```
GET /api/model-control        →  { ok, models[], slots[], assignments{}, defaults{} }
```

HI does not need this at runtime; useful for a health/debug view.

---

## 3. Slot ↔ feature map

Registered HI slots (group `HI` in the registry). Assignments shown are the
current staging values; production is set independently in its own console.

Verified against the live registry 2026-07-21 (`GET /api/model-control`); staging
and production carry the same eight `hi.*` slots.

| Slot                          | HI feature                                              | Route / service (file)                                              | kind  | assignment |
|-------------------------------|--------------------------------------------------------|--------------------------------------------------------------------|-------|--------------------|
| `hi.ia-4-2`                   | IA 4-2: Reframe with AI                                 | `server/routes/ai.ts` (`/chat/plain`)                              | text  | sonnet (`us.anthropic.claude-sonnet-4-6`) |
| `hi.ia-4-3`                   | IA 4-3: Stretch Potential                               | `server/routes/ai.ts` (`/chat/plain`)                              | text  | sonnet |
| `hi.ia-4-4`                   | IA 4-4: Higher Purpose → World Challenges               | `server/routes/ai.ts` (`/chat/plain`)                              | text  | sonnet |
| `hi.ia-4-5`                   | IA 4-5: Inviting the Muse                               | `server/routes/ai.ts` (`/chat/plain`)                              | text  | sonnet |
| `hi.ia-4-7-synopsis`          | IA 4-7: Module 4 Reflection Synopsis                    | `server/routes/ai.ts` (`/chat/plain`)                              | text  | sonnet |
| `hi.ia-image`                 | IA image generation (stretch / capability-stretch)     | `server/routes/image-gen.ts` (`/image/stretch`, `/capability-stretch`) | image | gpt-image (gpt-image-1) |
| `hi.ia-image-describe`        | IA image description (vision)                           | `server/routes/image-gen.ts` (`/image/describe`)                   | text  | gpt-mini (gpt-4o-mini) |
| `hi.ast-reports`              | AST sectional reports — **hardwired, not controlled**  | `server/services/ast-sectional-report-service.ts`                  | —     | (marked `controlled:false`) |

**Retired slots** (de-registered in the console — do not reintroduce):
- **`hi.ia-collab`** — the original single umbrella slot in front of every
  training, i.e. one assignment setting the model for all IA exercises at once.
  Rejected in §8 Q1 in favour of the five per-training slots above. Retired.
- **`hi.exercise-training-docs`** — never adopted. The admin training-docs
  harness (`exercise-training-docs-routes.ts:195`) calls `getProvider('ia')`
  directly and is env-driven, not slotted.

> ⚠️ **A retired slot does not stop resolving.** `resolve/<slot>` returns
> `ok:true` with a catch-all default (currently haiku) for *any* unregistered
> name — `hi.ia-collab`, `hi.totally-made-up-slot`, and a typo'd `hi.ia-4-2-typo`
> all return the same thing. So `resolveModel()` can never see `model: null`, its
> `unassigned → env fallback` branch is effectively dead, and a mistyped slot
> silently runs on haiku while the admin Model Routing tab reports it as a
> healthy `source: 'gateway'`. Cross-check catalog slots against the registry
> rather than trusting a successful resolve — `scripts/ai-gateway-smoke-test.ts`
> does this.

Notes:
- **`hi.ast-reports` is intentionally excluded** from control-plane resolution.
  AST sectional reports run the OpenAI **Assistants** path (assistant id +
  attached training docs / vector store), not a bare model id, so the model
  lives inside OpenAI where the control plane cannot set it. Left hardwired by
  decision. Marked `controlled: false` in the registry.
- **`kind`** splits text from image models. The gateway rejects assigning a
  text model to an image slot, so `hi.ia-image` can only ever resolve to an
  image model. HI can rely on that invariant.

### 3.1 The nine trainings — **[HI confirm]**

`server/config/trainings.ts` gives each of nine trainings its own
`model_default`. `hi.ia-collab` stood in front of all of them *(historical — that
umbrella slot was rejected below and is now retired; see §3)*. Five
are IA exercises that share one model (`gpt-4.1-mini`); four are Talia
assistants that differ (`gpt-4.1`, `o4-mini`). Open question in §8 on whether
these become per-training slots or keep a single slot with a group default.

> **[HI response → R1.1, R1.2, R2 Q1]** Incorrect for production. `AI_PROVIDER_IA=claude`
> forces the Claude branch, so the five live IA exercises run **Claude Haiku**
> (`claude-haiku-4-5-20251001`); each training's `model_default: gpt-4.1-mini` is
> **dead config**. And only five trainings are live — the four Talia trainings have
> zero callers (dead). Decision: **per-training slots for the five live exercises
> only** (`hi.ia-4-2`, `hi.ia-4-3`, `hi.ia-4-4`, `hi.ia-4-5`, `hi.ia-4-7-synopsis`),
> replacing the single `hi.ia-collab`.

---

## 4. Gateway-side obligation: two env vars in production — **blocker**

**Corrected 2026-07-20:** an earlier draft named only `GATEWAY_BASE_URL`. The
resolve endpoint is authenticated, and HI's own `isGatewayConfigured()`
(`gateway-client.ts:145`) requires **both** of these. Verified against the
`heliotrope` SSM account: **neither exists**, and neither appears in
`deploy-to-production.sh`.

> **[HI response → R3.1]** Confirmed correct (`isGatewayConfigured()` needs both,
> `gateway-client.ts:144`). Return obligation: **the gateway side must hand over the
> prod + staging `GATEWAY_SERVICE_TOKEN` value out-of-band** — HI cannot mint it. HI
> owns the SSM + deploy-script wiring once the value is in hand.

| Var                     | Value                            | Nature                                   |
|-------------------------|----------------------------------|------------------------------------------|
| `GATEWAY_BASE_URL`      | `https://api.selfactual.ai`      | plain config                             |
| `GATEWAY_SERVICE_TOKEN` | *(shared secret — see below)*    | must **match the gateway's** token value |

`GATEWAY_BASE_URL` alone is unset in HI production and falls back to
`http://localhost:3002` (`gateway-client.ts:14`). It is invisible today only
because `FEATURE_SOLID_POD_SYNC` is also off, so the gateway client is never
exercised. **The moment any AI feature resolves through the gateway, an unset
base URL calls localhost, and a missing/mismatched token returns 401.**

### The token is a coordination step, not a value HI can mint

`GATEWAY_SERVICE_TOKEN` must be the **same string the gateway validates**
(gateway `.env`, `GATEWAY_SERVICE_TOKEN`). HI cannot generate it — the value is
handed over out-of-band by the gateway side (selfActual), and HI stores it in
SSM. Production HI uses the production gateway's token; a laptop pointed at
`staging-api` for the §7 rehearsal uses the **staging** gateway's token (the two
gateways may differ). The token is never committed to the repo or pasted into
this doc.

### Steps

1. **[gateway/selfActual]** Provide the prod (and staging) `GATEWAY_SERVICE_TOKEN`
   value to HI out-of-band.
2. **[HI]** Create two SSM parameters in the `heliotrope` account:
   - `/prod/hi-replit/GATEWAY_BASE_URL` = `https://api.selfactual.ai` (String)
   - `/prod/hi-replit/GATEWAY_SERVICE_TOKEN` = *(the value from step 1)* (SecureString)
3. **[HI]** Fetch both in `deploy-to-production.sh` and add them to the container
   `environment` block. A ready-to-apply diff accompanies this doc.
4. **[HI]** Local dev already sets `GATEWAY_BASE_URL`; add `GATEWAY_SERVICE_TOKEN`
   to the local `.env` too (same gate needs both). For the §7 staging rehearsal,
   point both at staging.

Same *shape* of gap exists for `AI_PROVIDER_REPORTS` / `AI_PROVIDER_COACHING` (no
SSM parameter, no path into the container), but the control plane makes those
obsolete for slotted features, so they can simply be dropped rather than fixed.

---

## 5. Caching and failure policy — **[HI confirm the failure choice]**

LLM calls are hot; HI must not call the gateway on every message.

- **Cache** each slot's resolution in-process with a short TTL (~60s suggested),
  refreshed lazily. A console change is picked up within one TTL — fast enough
  for an operator toggling a model, cheap enough for request volume.
- **Failure:** if the gateway is unreachable or returns `model: null`, HI falls
  back to **last-known-cached value, then the current env default**. An exercise
  must never fail because the control plane hiccuped. The console is
  authoritative when reachable; HI degrades gracefully when it is not.

The recommended order is: cached value → env default → hard error only if even
the env default is missing. **[HI confirm]** whether "fall back silently" is
acceptable, or whether a degraded resolution should also surface a warning
somewhere (log line, admin banner).

> **[HI response → R2 Q2]** Silent fallback (cached → env) on the request path, **plus**
> a throttled `console.warn` on degrade to env. No admin banner in the first cut.
> Implemented — plus a 2.5s resolve timeout so a slow gateway degrades rather than
> stalls the exercise.

---

## 6. Telemetry — so spend shows in the console

The console's Models page shows per-slot calls and 30-day spend. That only
populates if HI reports usage tagged with the slot. HI already logs AI usage
(`server/services/ai-usage-logger.ts`); the addition is a **`slot` dimension**
on each record, forwarded to the gateway telemetry endpoint the console reads
(`GET /api/telemetry/ai-calls`, grouped `by_slot`).

> **[HI response → R1.3, R3.2]** Understated. HI's logger writes to a **local Postgres
> table**, not the gateway — the console won't see it. Two gaps: (1) the slotted
> routes (`ai.ts`, `image-gen.ts`) don't log usage at all today, so logging must be
> added there; (2) **the gateway must define a telemetry ingest (POST) endpoint** —
> only the read side is specified here. Model selection is unaffected; only spend
> readout is blocked on this.

- Token-priced models (all text slots) will show cost immediately once the slot
  tag flows, because pricing already covers them.
- **`gpt-image-1` is unpriced.** `model-pricing.js` is per-1M-tokens; image
  models bill per image by size and quality — which HI owns. So `hi.ia-image`
  **selection** works, but its **spend reads as absent (not zero)** until a
  per-image rate dimension lands and HI reports image count / size / quality.
  This is a known, accepted gap for the first cut.

---

## 7. Rollout sequence

Ordered so nothing reaches production untested and the blocker is cleared first.

1. **[gateway/CC + HI]** Land both gateway env vars (`GATEWAY_BASE_URL` and the
   shared-secret `GATEWAY_SERVICE_TOKEN`) in prod SSM + deploy script (§4).
   Nothing else can safely proceed.
2. **[HI]** Add `resolveModel(slot)` to `ai-provider.ts` — one gateway call via
   the existing client, cached (§5), wrapping (not yet replacing) the env logic.
3. **[HI]** Convert one feature end-to-end as proof: **`hi.ia-collab`** is the
   cleanest first target — it already goes through `ai-provider.ts`, so only the
   resolution source changes.
4. **[rehearse on staging]** Dev build on a laptop, `GATEWAY_BASE_URL` →
   `staging-api.selfactual.ai`. Change the model in the **staging** console and
   confirm the running exercise picks it up within one cache TTL. No production
   involvement.
5. **[HI]** Add the `slot` telemetry dimension (§6); confirm calls/spend appear
   in the staging console.
6. **[HI]** Convert the remaining slotted features, including the direct-call
   bypasses in `image-gen.ts` (which do not currently go through
   `ai-provider.ts`).
7. **[you + gateway/CC]** Deploy to production; assign models in the production
   console.

---

## 8. Open questions for HI

> **[HI response → R2]** All five answered in the response doc §R2:
> **Q1** per-training slots, five live exercises only (not `hi.ia-collab`);
> **Q2** silent fallback + throttled warn;
> **Q3** dead/deletable except IA chat API (live) and persona-management (file kept for exports);
> **Q4** image size/quality fixed in HI for now;
> **Q5** bedrock superseded — canonical Anthropic ids + `anthropic→claude` mapping is correct.

1. **Trainings (§3.1):** should each of the nine `trainings.ts` entries become
   its own slot, or does `hi.ia-collab` stay a single slot with a group default
   that individual trainings can override? The five IA exercises share a model
   today; the four Talia assistants differ.
2. **Failure policy (§5):** is silent fallback to the env default acceptable, or
   should a degraded resolution surface a warning?
3. **Dormant features:** an audit found ~10 dormant AI surfaces (legacy holistic
   report generate, IA chat conversation API, module-reflection, brainstorm /
   simulate, ai-comparison, assistant-test, report-talia, persona management,
   embedding services). These are intentionally **not** slotted. Confirm they
   are dead and can be deleted rather than wired — a slot for a dead route is
   control surface that controls nothing.
4. **Image controls:** size and quality stay in HI (confirmed). Should they be
   fixed, or eventually console-controlled too? That decides whether a future
   image "model" is one option or a size/quality matrix.
5. **Bedrock:** confirmed not the default path (v254 failed, v253 uses direct
   keys). The registry stores canonical Anthropic ids with `provider: anthropic`
   accordingly. Is the `cc/bedrock-haiku-provider` work being retired, or kept
   as an option behind the same slot mechanism (a separate `bedrock`-provider
   model entry)?

---

## 9. What this does NOT change

- AST sectional reports stay hardwired (§3).
- No change to how training docs, vector stores, or Assistant ids are managed.
- No change to API keys — `OPENAI_KEY_IA` and the Talia keys stay as they are;
  the control plane selects models, not credentials.
- Existing env vars keep working as the fallback layer during and after
  migration; the control plane sits in front of them, it does not rip them out.
