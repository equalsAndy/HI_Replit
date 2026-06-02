// Shared helper for reflection-save failures across workshop steps
// (flow patterns 2-2, well-being 3-1, final reflection/insights, etc.).
//
// A failed save never discards what the user typed, so every message reassures
// them their responses are still there, and points at the most likely remedy.
// `rawError` may be a server-provided message (e.g. "...must be 1-5000 characters",
// "Module 3 is locked...") or an HTTP status string (e.g. "HTTP 403: Forbidden").
export function buildReflectionSaveErrorMessage(rawError?: string): string {
  const fallback =
    "We couldn't save your reflections. Your responses are still here — please try again in a moment.";

  if (!rawError) return fallback;

  // Length validation from the server (reflection fields are capped at 5000 chars)
  if (/\d+\s*characters/i.test(rawError) || /too long/i.test(rawError)) {
    return "We couldn't save your reflections because one of them is too long. Please shorten your responses and try again — your answers are still here.";
  }

  // Session / auth expiry (message text or a 401 status)
  if (/auth/i.test(rawError) || /not authenticated/i.test(rawError) || /\b401\b/.test(rawError)) {
    return "We couldn't save your reflections because your session expired. Please refresh the page and sign in again — your answers are still here.";
  }

  // Workshop locked (message text or a 403 status)
  if (/lock/i.test(rawError) || /\b403\b/.test(rawError)) {
    return "We couldn't save your reflections because this workshop is locked. If you think this is a mistake, please contact support.";
  }

  return `${fallback} (Details: ${rawError})`;
}
