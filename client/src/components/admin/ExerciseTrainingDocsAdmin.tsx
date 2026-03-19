import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PROMPTS, IAExerciseKey } from '@/constants/prompts';

// ─── Types ────────────────────────────────────────────────────────────────────

interface DocSummary {
  trainingId: string;
  title: string;
  updatedAt: string;
}

interface DocFull extends DocSummary {
  content: string;
}

interface TestMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface TestResult {
  reply: string;
  model: string;
  provider: string;
  usage?: { inputTokens?: number; outputTokens?: number; input_tokens?: number; output_tokens?: number; prompt_tokens?: number; completion_tokens?: number };
  latencyMs?: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TRAINING_TO_PROMPT: Partial<Record<string, IAExerciseKey>> = {
  'ia-4-2': 'IA_4_2',
  'ia-4-3': 'IA_4_3',
  'ia-4-4': 'IA_4_4',
  'ia-4-5': 'IA_4_5',
};

const TRAINING_PHASES: Record<string, string[]> = {
  'ia-4-2': ['reframe', 'shift', 'tag'],
  'ia-4-3': ['stretch', 'expansion', 'resistance'],
  'ia-4-4': ['reframe', 'explore'],
  'ia-4-5': ['refinement', 'commitment', 'timeframe'],
};

const PRESET_CHALLENGES: Record<string, string[]> = {
  'ia-4-2': [
    "I've been asked to lead a combined research and design team of twelve people in three weeks but I have no authority to hire or fire anyone.",
    "Sales won't sell my product because it's too small a percentage of their overall deal size.",
    "My dissertation committee keeps changing what they want and I've rewritten this chapter three times.",
  ],
  'ia-4-3': [
    "I tend to jump to solutions before fully understanding the problem.",
    "I struggle to let others take the lead even when they're better positioned to do so.",
    "I avoid conflict even when I know a direct conversation would help.",
  ],
  'ia-4-4': [
    "I want to help address loneliness in urban communities.",
    "I care about making quality education accessible to everyone.",
    "I'm drawn to environmental sustainability but don't know where to start.",
  ],
  'ia-4-5': [
    "A long walk in a quiet park where I can let my mind wander.",
    "Cooking something elaborate that requires full attention.",
    "Playing guitar until I forget what time it is.",
  ],
};

const PROD_URL = 'https://app2.heliotropeimaginal.com';
const DEV_URL = 'http://localhost:8080';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function detectEnvironment(): 'production' | 'dev' {
  const host = window.location.hostname;
  return host === 'app2.heliotropeimaginal.com' ? 'production' : 'dev';
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

function tokenCount(usage?: TestResult['usage']): string {
  if (!usage) return '—';
  const input = usage.inputTokens ?? usage.input_tokens ?? usage.prompt_tokens ?? 0;
  const output = usage.outputTokens ?? usage.output_tokens ?? usage.completion_tokens ?? 0;
  return `${input} in / ${output} out`;
}

// ─── Component ────────────────────────────────────────────────────────────────

const ExerciseTrainingDocsAdmin: React.FC = () => {
  // Doc list
  const [docs, setDocs] = useState<DocSummary[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(true);

  // Editor
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editorContent, setEditorContent] = useState('');
  const [editorTitle, setEditorTitle] = useState('');
  const [savedContent, setSavedContent] = useState(''); // for dirty-check
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [loadingDoc, setLoadingDoc] = useState(false);

  // Test panel
  const [selectedPhase, setSelectedPhase] = useState('');
  const [testInput, setTestInput] = useState('');
  const [testHistory, setTestHistory] = useState<TestMessage[]>([]);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [testing, setTesting] = useState(false);
  const [testError, setTestError] = useState<string | null>(null);

  // Sync from other environment
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);
  const [confirmSync, setConfirmSync] = useState(false);

  // Push to other environment
  const [pushing, setPushing] = useState(false);
  const [pushResult, setPushResult] = useState<string | null>(null);
  const [confirmPush, setConfirmPush] = useState(false);

  const currentEnv = detectEnvironment();
  const syncSource = currentEnv === 'dev' ? PROD_URL : DEV_URL;
  const syncLabel = currentEnv === 'dev' ? 'Production' : 'Dev (localhost)';
  const pushTarget = currentEnv === 'dev' ? PROD_URL : DEV_URL;
  const pushLabel = currentEnv === 'dev' ? 'Production' : 'Dev (localhost)';

  const savedBadgeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showSavedBadge, setShowSavedBadge] = useState(false);

  // ── Load doc list ──────────────────────────────────────────────────────────

  const fetchDocs = useCallback(async () => {
    setLoadingDocs(true);
    try {
      const res = await fetch('/api/admin/exercise-training-docs', { credentials: 'include' });
      const data = await res.json();
      if (data.success) setDocs(data.docs);
    } catch {
      // silently fail — user will see empty list
    } finally {
      setLoadingDocs(false);
    }
  }, []);

  useEffect(() => { fetchDocs(); }, [fetchDocs]);

  // ── Select a doc ──────────────────────────────────────────────────────────

  const selectDoc = async (trainingId: string) => {
    setSelectedId(trainingId);
    setLoadingDoc(true);
    setTestHistory([]);
    setTestResult(null);
    setTestError(null);
    // Set default phase for this training
    const phases = TRAINING_PHASES[trainingId] ?? [];
    setSelectedPhase(phases[0] ?? '');
    try {
      const res = await fetch(`/api/admin/exercise-training-docs/${trainingId}`, { credentials: 'include' });
      const data = await res.json();
      if (data.success && data.doc) {
        setEditorContent(data.doc.content);
        setEditorTitle(data.doc.title);
        setSavedContent(data.doc.content);
      }
    } finally {
      setLoadingDoc(false);
    }
  };

  // ── Save ──────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    if (!selectedId) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/exercise-training-docs/${selectedId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editorContent, title: editorTitle }),
      });
      const data = await res.json();
      if (data.success) {
        setSavedContent(editorContent);
        setSavedAt(new Date());
        setShowSavedBadge(true);
        if (savedBadgeTimer.current) clearTimeout(savedBadgeTimer.current);
        savedBadgeTimer.current = setTimeout(() => setShowSavedBadge(false), 3000);
        // Refresh the list so the timestamp updates
        fetchDocs();
      }
    } finally {
      setSaving(false);
    }
  };

  // ── Test ──────────────────────────────────────────────────────────────────

  const handleTest = async () => {
    if (!selectedId || !testInput.trim()) return;
    const promptKey = TRAINING_TO_PROMPT[selectedId];
    const systemPrompt = promptKey ? PROMPTS[promptKey] : null;

    const userMessage = testInput.trim();
    const newHistory: TestMessage[] = [...testHistory, { role: 'user', content: userMessage }];

    // Build messages array for the API
    const messages: Array<{ role: string; content: string }> = [];
    if (systemPrompt) {
      const phaseContext = selectedPhase ? `\nCURRENT_PHASE: ${selectedPhase}` : '';
      messages.push({ role: 'system', content: systemPrompt + phaseContext });
    }
    // Replay conversation history
    for (const msg of testHistory) {
      messages.push({ role: msg.role, content: msg.content });
    }
    messages.push({ role: 'user', content: userMessage });

    setTesting(true);
    setTestError(null);
    setTestInput('');

    try {
      const res = await fetch('/api/admin/exercise-training-docs/test', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ training_id: selectedId, messages }),
      });
      const data = await res.json();
      if (data.success) {
        const assistantMsg: TestMessage = { role: 'assistant', content: data.reply };
        setTestHistory([...newHistory, assistantMsg]);
        setTestResult(data);
      } else {
        setTestHistory(newHistory);
        setTestError(data.error || 'Test failed');
      }
    } catch (err: any) {
      setTestHistory(newHistory);
      setTestError(err.message || 'Network error');
    } finally {
      setTesting(false);
    }
  };

  // ── Sync ──────────────────────────────────────────────────────────────────

  const handleSync = async () => {
    setSyncing(true);
    setSyncResult(null);
    setConfirmSync(false);
    try {
      const res = await fetch('/api/admin/exercise-training-docs/sync-from', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceUrl: syncSource }),
      });
      const data = await res.json();
      if (data.success) {
        setSyncResult(`Synced ${data.synced} of ${data.total} docs from ${syncLabel}`);
        fetchDocs();
        // Reload the selected doc's content if it was overwritten
        if (selectedId) selectDoc(selectedId);
      } else {
        setSyncResult(`Sync failed: ${data.error}`);
      }
    } catch (err: any) {
      setSyncResult(`Sync error: ${err.message}`);
    } finally {
      setSyncing(false);
    }
  };

  // ── Push ──────────────────────────────────────────────────────────────────

  const handlePush = async () => {
    setPushing(true);
    setPushResult(null);
    setConfirmPush(false);
    try {
      const res = await fetch('/api/admin/exercise-training-docs/push-to', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUrl: pushTarget }),
      });
      const data = await res.json();
      if (data.success) {
        setPushResult(`Pushed ${data.pushed} of ${data.total} docs to ${pushLabel}`);
      } else {
        setPushResult(`Push failed: ${data.error}`);
      }
    } catch (err: any) {
      setPushResult(`Push error: ${err.message}`);
    } finally {
      setPushing(false);
    }
  };

  // ── Copy utils ────────────────────────────────────────────────────────────

  const copyContent = () => {
    if (editorContent) navigator.clipboard.writeText(editorContent);
  };

  const copyAllAsJson = async () => {
    try {
      const res = await fetch('/api/admin/exercise-training-docs/export', { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        navigator.clipboard.writeText(JSON.stringify(data.docs, null, 2));
      }
    } catch {
      // ignore
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  const isDirty = editorContent !== savedContent;
  const phases = selectedId ? (TRAINING_PHASES[selectedId] ?? []) : [];
  const hasPrompt = selectedId ? !!TRAINING_TO_PROMPT[selectedId] : false;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr 400px', gap: '16px', height: '80vh', minHeight: '600px' }}>

      {/* ── LEFT: Doc list ──────────────────────────────────────────────── */}
      <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {/* Sync controls — only available on dev (production can't reach localhost) */}
        <div style={{ padding: '12px', borderBottom: '1px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
          {currentEnv === 'production' && (
            <p style={{ fontSize: '11px', color: '#9ca3af', margin: '0 0 8px', fontStyle: 'italic' }}>
              Sync unavailable from production — use dev to push/pull.
            </p>
          )}
          {currentEnv === 'dev' && !confirmSync ? (
            <button
              onClick={() => setConfirmSync(true)}
              disabled={syncing}
              style={{ width: '100%', padding: '6px 12px', backgroundColor: '#7c3aed', color: 'white', border: 'none', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', marginBottom: '6px' }}
            >
              {syncing ? 'Syncing…' : `Sync from ${syncLabel}`}
            </button>
          ) : currentEnv === 'dev' ? (
            <div>
              <p style={{ fontSize: '12px', color: '#374151', marginBottom: '6px' }}>
                Overwrite local docs with content from {syncLabel}?
              </p>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button onClick={handleSync} style={{ flex: 1, padding: '5px', backgroundColor: '#7c3aed', color: 'white', border: 'none', borderRadius: '4px', fontSize: '12px', cursor: 'pointer' }}>
                  Confirm
                </button>
                <button onClick={() => setConfirmSync(false)} style={{ flex: 1, padding: '5px', backgroundColor: '#e5e7eb', border: 'none', borderRadius: '4px', fontSize: '12px', cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </div>
          ) : null}
          {syncResult && (
            <p style={{ fontSize: '11px', color: syncResult.startsWith('Sync') && !syncResult.includes('failed') && !syncResult.includes('error') ? '#059669' : '#dc2626', marginTop: '4px', margin: 0 }}>
              {syncResult}
            </p>
          )}

          {/* Push to other environment — dev only */}
          {currentEnv === 'dev' && !confirmPush ? (
            <button
              onClick={() => setConfirmPush(true)}
              disabled={pushing}
              style={{ width: '100%', padding: '6px 12px', backgroundColor: '#059669', color: 'white', border: 'none', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', marginTop: '6px' }}
            >
              {pushing ? 'Pushing…' : `Push to ${pushLabel}`}
            </button>
          ) : currentEnv === 'dev' ? (
            <div style={{ marginTop: '6px' }}>
              <p style={{ fontSize: '12px', color: '#374151', marginBottom: '6px' }}>
                Push ALL local docs to {pushLabel}? This overwrites remote content.
              </p>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button onClick={handlePush} style={{ flex: 1, padding: '5px', backgroundColor: '#059669', color: 'white', border: 'none', borderRadius: '4px', fontSize: '12px', cursor: 'pointer' }}>
                  Confirm
                </button>
                <button onClick={() => setConfirmPush(false)} style={{ flex: 1, padding: '5px', backgroundColor: '#e5e7eb', border: 'none', borderRadius: '4px', fontSize: '12px', cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </div>
          ) : null}
          {pushResult && (
            <p style={{ fontSize: '11px', color: pushResult.startsWith('Push') && !pushResult.includes('failed') && !pushResult.includes('error') ? '#059669' : '#dc2626', marginTop: '4px', margin: 0 }}>
              {pushResult}
            </p>
          )}

          <div style={{ display: 'flex', gap: '4px', marginTop: '6px' }}>
            <button
              onClick={copyContent}
              disabled={!selectedId}
              title="Copy selected doc's markdown"
              style={{ flex: 1, padding: '4px', fontSize: '11px', backgroundColor: 'white', border: '1px solid #d1d5db', borderRadius: '4px', cursor: selectedId ? 'pointer' : 'default', color: '#6b7280' }}
            >
              Copy Content
            </button>
            <button
              onClick={copyAllAsJson}
              title="Copy all docs as JSON"
              style={{ flex: 1, padding: '4px', fontSize: '11px', backgroundColor: 'white', border: '1px solid #d1d5db', borderRadius: '4px', cursor: 'pointer', color: '#6b7280' }}
            >
              Copy All JSON
            </button>
          </div>
        </div>

        {/* Doc list */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {loadingDocs ? (
            <div style={{ padding: '16px', color: '#9ca3af', fontSize: '13px' }}>Loading…</div>
          ) : docs.length === 0 ? (
            <div style={{ padding: '16px', color: '#9ca3af', fontSize: '13px' }}>No docs found. Check seeding.</div>
          ) : (
            docs.map(doc => (
              <button
                key={doc.trainingId}
                onClick={() => selectDoc(doc.trainingId)}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  padding: '10px 12px',
                  borderBottom: '1px solid #f3f4f6',
                  backgroundColor: selectedId === doc.trainingId ? '#ede9fe' : 'white',
                  border: 'none',
                  borderLeft: selectedId === doc.trainingId ? '3px solid #7c3aed' : '3px solid transparent',
                  cursor: 'pointer',
                }}
              >
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>{doc.title}</div>
                <div style={{ fontSize: '11px', color: '#6b7280', fontFamily: 'monospace' }}>{doc.trainingId}</div>
                <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '2px' }}>{formatDate(doc.updatedAt)}</div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* ── CENTER: Editor ──────────────────────────────────────────────── */}
      <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {!selectedId ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: '14px' }}>
            Select a training doc to edit
          </div>
        ) : loadingDoc ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: '14px' }}>
            Loading…
          </div>
        ) : (
          <>
            {/* Editor header */}
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#f9fafb' }}>
              <input
                value={editorTitle}
                onChange={e => setEditorTitle(e.target.value)}
                style={{ flex: 1, padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '14px', fontWeight: 600 }}
              />
              <span style={{ fontSize: '11px', color: '#9ca3af', whiteSpace: 'nowrap' }}>
                {editorContent.length.toLocaleString()} chars
              </span>
              {isDirty && (
                <span style={{ fontSize: '11px', color: '#f59e0b', fontWeight: 600 }}>Unsaved</span>
              )}
              {showSavedBadge && (
                <span style={{ fontSize: '11px', color: '#059669', fontWeight: 600 }}>Saved ✓</span>
              )}
              <button
                onClick={handleSave}
                disabled={saving || !isDirty}
                style={{
                  padding: '6px 14px',
                  backgroundColor: isDirty ? '#7c3aed' : '#e5e7eb',
                  color: isDirty ? 'white' : '#9ca3af',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: isDirty ? 'pointer' : 'default',
                }}
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>

            {/* Textarea */}
            <textarea
              value={editorContent}
              onChange={e => setEditorContent(e.target.value)}
              style={{
                flex: 1,
                padding: '16px',
                fontFamily: 'monospace',
                fontSize: '12px',
                lineHeight: '1.6',
                border: 'none',
                resize: 'none',
                outline: 'none',
                overflowY: 'auto',
              }}
              spellCheck={false}
            />
          </>
        )}
      </div>

      {/* ── RIGHT: Test panel ───────────────────────────────────────────── */}
      <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '12px 14px', borderBottom: '1px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
          <h3 style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#374151' }}>Test Panel</h3>
          {selectedId && (
            <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#9ca3af' }}>
              {selectedId} · saved doc is used for testing
            </p>
          )}
        </div>

        {!selectedId ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: '13px' }}>
            Select a doc to test
          </div>
        ) : !hasPrompt ? (
          <div style={{ padding: '16px', fontSize: '12px', color: '#6b7280' }}>
            <p style={{ margin: 0 }}>No client-side system prompt configured for <strong>{selectedId}</strong>.</p>
            <p style={{ marginTop: '6px' }}>Test not available — this doc is injected server-side only.</p>
          </div>
        ) : (
          <>
            {/* Controls */}
            <div style={{ padding: '10px 14px', borderBottom: '1px solid #f3f4f6', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <select
                value={selectedPhase}
                onChange={e => setSelectedPhase(e.target.value)}
                style={{ padding: '4px 8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '12px' }}
              >
                {phases.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
              <button
                onClick={() => { setTestHistory([]); setTestResult(null); setTestError(null); setTestInput(''); }}
                style={{ padding: '4px 10px', backgroundColor: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '12px', cursor: 'pointer' }}
              >
                Reset
              </button>
            </div>

            {/* Preset challenges */}
            {testHistory.length === 0 && PRESET_CHALLENGES[selectedId] && (
              <div style={{ padding: '8px 14px', borderBottom: '1px solid #f3f4f6' }}>
                <p style={{ fontSize: '11px', color: '#9ca3af', margin: '0 0 4px' }}>Presets:</p>
                {PRESET_CHALLENGES[selectedId].map((preset, i) => (
                  <button
                    key={i}
                    onClick={() => setTestInput(preset)}
                    style={{ display: 'block', width: '100%', textAlign: 'left', padding: '4px 6px', marginBottom: '3px', backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '4px', fontSize: '11px', cursor: 'pointer', color: '#374151' }}
                  >
                    {preset.length > 70 ? preset.substring(0, 70) + '…' : preset}
                  </button>
                ))}
              </div>
            )}

            {/* Conversation */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {testHistory.map((msg, i) => (
                <div
                  key={i}
                  style={{
                    padding: '8px 10px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    lineHeight: '1.5',
                    backgroundColor: msg.role === 'user' ? '#ede9fe' : '#f3f4f6',
                    alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '90%',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}
                >
                  {msg.content}
                </div>
              ))}
              {testing && (
                <div style={{ fontSize: '12px', color: '#9ca3af', fontStyle: 'italic' }}>Thinking…</div>
              )}
              {testError && (
                <div style={{ fontSize: '12px', color: '#dc2626', backgroundColor: '#fef2f2', padding: '8px', borderRadius: '6px' }}>
                  {testError}
                </div>
              )}
            </div>

            {/* Usage stats */}
            {testResult && (
              <div style={{ padding: '6px 14px', borderTop: '1px solid #f3f4f6', fontSize: '10px', color: '#9ca3af', display: 'flex', gap: '12px' }}>
                <span>{testResult.provider} · {testResult.model}</span>
                <span>{tokenCount(testResult.usage)}</span>
                {testResult.latencyMs && <span>{testResult.latencyMs}ms</span>}
              </div>
            )}

            {/* Input */}
            <div style={{ padding: '10px 14px', borderTop: '1px solid #e5e7eb', display: 'flex', gap: '8px' }}>
              <textarea
                value={testInput}
                onChange={e => setTestInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleTest(); } }}
                placeholder="Enter challenge… (Enter to send)"
                rows={3}
                style={{ flex: 1, padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '12px', resize: 'none', outline: 'none' }}
              />
              <button
                onClick={handleTest}
                disabled={testing || !testInput.trim()}
                style={{
                  padding: '8px 12px',
                  backgroundColor: testInput.trim() && !testing ? '#7c3aed' : '#e5e7eb',
                  color: testInput.trim() && !testing ? 'white' : '#9ca3af',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: testInput.trim() && !testing ? 'pointer' : 'default',
                  alignSelf: 'flex-end',
                }}
              >
                Send
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ExerciseTrainingDocsAdmin;
