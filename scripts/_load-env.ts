/**
 * Env loader for scripts — import this FIRST, before any server module.
 *
 * Two things matter here:
 *  - `override: true`, so an exported shell var (e.g. a placeholder OPENAI_API_KEY)
 *    can't mask .env and produce bogus 401s that look like real outages.
 *  - It must be its own module. Several server modules (notably
 *    solid-pod/gateway-client.ts) capture process.env into module-level consts at
 *    import time, and ESM hoists all static imports above inline statements — so
 *    calling dotenv inline in the script would run *after* they had already read
 *    an empty env. Importing this first makes the load order explicit.
 */
import { config } from 'dotenv';

config({ override: true });
