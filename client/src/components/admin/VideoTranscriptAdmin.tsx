import React, { useState, useEffect, useRef, useCallback } from 'react';
import RichTextEditor from './RichTextEditor';

// ─── Types ────────────────────────────────────────────────────────────────────

interface VideoSummary {
  id: number;
  stepId: string | null;
  workshopType: string;
  title: string;
  hasTranscript: boolean;
  transcriptLength: number;
  updatedAt: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PROD_URL = 'https://app2.heliotropeimaginal.com';
const DEV_URL = 'http://localhost:8080';
const STORAGE_KEY = 'transcriptAdmin_filters';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function detectEnvironment(): 'production' | 'dev' {
  return window.location.hostname === 'app2.heliotropeimaginal.com' ? 'production' : 'dev';
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

function workshopBadge(workshopType: string): { label: string; color: string; bg: string } {
  if (workshopType === 'ia' || workshopType === 'imaginal-agility') {
    return { label: 'IA', color: '#7c3aed', bg: '#ede9fe' };
  }
  return { label: 'AST', color: '#2563eb', bg: '#dbeafe' };
}

// ─── Component ────────────────────────────────────────────────────────────────

const VideoTranscriptAdmin: React.FC = () => {
  // Video list
  const [videos, setVideos] = useState<VideoSummary[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(true);

  // Editor
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<VideoSummary | null>(null);
  const [editorContent, setEditorContent] = useState('');
  const [savedContent, setSavedContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [loadingDoc, setLoadingDoc] = useState(false);

  // Saved badge
  const savedBadgeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showSavedBadge, setShowSavedBadge] = useState(false);

  // Filters (persisted to localStorage)
  const loadFilters = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  };
  const savedFilters = loadFilters();
  const [filterWorkshop, setFilterWorkshop] = useState<string>(savedFilters.workshop || 'all');
  const [filterTranscript, setFilterTranscript] = useState<string>(savedFilters.transcript || 'all');
  const [searchTerm, setSearchTerm] = useState<string>(savedFilters.search || '');

  // Persist filters to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      workshop: filterWorkshop,
      transcript: filterTranscript,
      search: searchTerm,
    }));
  }, [filterWorkshop, filterTranscript, searchTerm]);

  const resetFilters = () => {
    setFilterWorkshop('all');
    setFilterTranscript('all');
    setSearchTerm('');
    localStorage.removeItem(STORAGE_KEY);
  };

  const hasActiveFilters = filterWorkshop !== 'all' || filterTranscript !== 'all' || searchTerm !== '';

  // Sync / Push
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);
  const [confirmSync, setConfirmSync] = useState(false);
  const [pushing, setPushing] = useState(false);
  const [pushResult, setPushResult] = useState<string | null>(null);
  const [confirmPush, setConfirmPush] = useState(false);

  const currentEnv = detectEnvironment();
  const syncSource = currentEnv === 'dev' ? PROD_URL : DEV_URL;
  const syncLabel = currentEnv === 'dev' ? 'Production' : 'Dev (localhost)';
  const pushTarget = currentEnv === 'dev' ? PROD_URL : DEV_URL;
  const pushLabel = currentEnv === 'dev' ? 'Production' : 'Dev (localhost)';

  // ── Load video list ────────────────────────────────────────────────────────

  const fetchVideos = useCallback(async () => {
    setLoadingVideos(true);
    try {
      const res = await fetch('/api/admin/video-transcripts', { credentials: 'include' });
      const data = await res.json();
      if (data.success) setVideos(data.videos);
    } catch {
      // silently fail
    } finally {
      setLoadingVideos(false);
    }
  }, []);

  useEffect(() => { fetchVideos(); }, [fetchVideos]);

  // ── Select a video ─────────────────────────────────────────────────────────

  const selectVideo = async (video: VideoSummary) => {
    setSelectedId(video.id);
    setSelectedVideo(video);
    setLoadingDoc(true);
    try {
      const res = await fetch(`/api/admin/video-transcripts/${video.id}`, { credentials: 'include' });
      const data = await res.json();
      if (data.success && data.video) {
        // Prefer HTML content; fall back to markdown for legacy data
        const content = data.video.transcriptHtml || data.video.transcriptMd || '';
        setEditorContent(content);
        setSavedContent(content);
      }
    } finally {
      setLoadingDoc(false);
    }
  };

  // ── Save ───────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    if (selectedId === null) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/video-transcripts/${selectedId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcriptHtml: editorContent }),
      });
      const data = await res.json();
      if (data.success) {
        setSavedContent(editorContent);
        setShowSavedBadge(true);
        if (savedBadgeTimer.current) clearTimeout(savedBadgeTimer.current);
        savedBadgeTimer.current = setTimeout(() => setShowSavedBadge(false), 3000);
        fetchVideos();
      }
    } finally {
      setSaving(false);
    }
  };

  // ── Sync ───────────────────────────────────────────────────────────────────

  const handleSync = async () => {
    setSyncing(true);
    setSyncResult(null);
    setConfirmSync(false);
    try {
      const res = await fetch('/api/admin/video-transcripts/sync-from', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceUrl: syncSource }),
      });
      const data = await res.json();
      if (data.success) {
        setSyncResult(`Synced ${data.synced} of ${data.total} transcripts from ${syncLabel} (${data.skipped} skipped)`);
        fetchVideos();
        if (selectedId && selectedVideo) selectVideo(selectedVideo);
      } else {
        setSyncResult(`Sync failed: ${data.error}`);
      }
    } catch (err: any) {
      setSyncResult(`Sync error: ${err.message}`);
    } finally {
      setSyncing(false);
    }
  };

  // ── Push ───────────────────────────────────────────────────────────────────

  const handlePush = async () => {
    setPushing(true);
    setPushResult(null);
    setConfirmPush(false);
    try {
      const res = await fetch('/api/admin/video-transcripts/push-to', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUrl: pushTarget }),
      });
      const data = await res.json();
      if (data.success) {
        setPushResult(`Pushed ${data.pushed} of ${data.total} transcripts to ${pushLabel}`);
      } else {
        setPushResult(`Push failed: ${data.error}`);
      }
    } catch (err: any) {
      setPushResult(`Push error: ${err.message}`);
    } finally {
      setPushing(false);
    }
  };

  // ── Copy ───────────────────────────────────────────────────────────────────

  const copyContent = () => {
    if (editorContent) navigator.clipboard.writeText(editorContent);
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  // Filter videos
  const filteredVideos = videos.filter(video => {
    const matchesWorkshop = filterWorkshop === 'all'
      || (filterWorkshop === 'ia' && (video.workshopType === 'ia' || video.workshopType === 'imaginal-agility'))
      || (filterWorkshop === 'allstarteams' && video.workshopType === 'allstarteams')
      || video.workshopType === filterWorkshop;
    const matchesTranscript = filterTranscript === 'all'
      || (filterTranscript === 'has' && video.hasTranscript)
      || (filterTranscript === 'missing' && !video.hasTranscript);
    const matchesSearch = !searchTerm
      || video.title.toLowerCase().includes(searchTerm.toLowerCase())
      || (video.stepId && video.stepId.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesWorkshop && matchesTranscript && matchesSearch;
  });

  const isDirty = editorContent !== savedContent;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '16px', height: '80vh', minHeight: '600px' }}>

      {/* ── LEFT: Video list ───────────────────────────────────────────── */}
      <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {/* Sync / Push controls */}
        <div style={{ padding: '12px', borderBottom: '1px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
          {!confirmSync ? (
            <button
              onClick={() => setConfirmSync(true)}
              disabled={syncing}
              style={{ width: '100%', padding: '6px 12px', backgroundColor: '#7c3aed', color: 'white', border: 'none', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', marginBottom: '6px' }}
            >
              {syncing ? 'Syncing...' : `Sync from ${syncLabel}`}
            </button>
          ) : (
            <div>
              <p style={{ fontSize: '12px', color: '#374151', marginBottom: '6px' }}>
                Overwrite local transcripts with content from {syncLabel}?
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
          )}
          {syncResult && (
            <p style={{ fontSize: '11px', color: syncResult.startsWith('Sync') && !syncResult.includes('failed') && !syncResult.includes('error') ? '#059669' : '#dc2626', marginTop: '4px', margin: 0 }}>
              {syncResult}
            </p>
          )}

          {!confirmPush ? (
            <button
              onClick={() => setConfirmPush(true)}
              disabled={pushing}
              style={{ width: '100%', padding: '6px 12px', backgroundColor: '#059669', color: 'white', border: 'none', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', marginTop: '6px' }}
            >
              {pushing ? 'Pushing...' : `Push to ${pushLabel}`}
            </button>
          ) : (
            <div style={{ marginTop: '6px' }}>
              <p style={{ fontSize: '12px', color: '#374151', marginBottom: '6px' }}>
                Push ALL local transcripts to {pushLabel}? This overwrites remote content.
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
          )}
          {pushResult && (
            <p style={{ fontSize: '11px', color: pushResult.startsWith('Push') && !pushResult.includes('failed') && !pushResult.includes('error') ? '#059669' : '#dc2626', marginTop: '4px', margin: 0 }}>
              {pushResult}
            </p>
          )}

          <div style={{ display: 'flex', gap: '4px', marginTop: '6px' }}>
            <button
              onClick={copyContent}
              disabled={selectedId === null}
              title="Copy selected transcript markdown"
              style={{ flex: 1, padding: '4px', fontSize: '11px', backgroundColor: 'white', border: '1px solid #d1d5db', borderRadius: '4px', cursor: selectedId !== null ? 'pointer' : 'default', color: '#6b7280' }}
            >
              Copy Content
            </button>
          </div>
        </div>

        {/* Filters */}
        <div style={{ padding: '8px 12px', borderBottom: '1px solid #e5e7eb', backgroundColor: '#fafafa' }}>
          <div style={{ display: 'flex', gap: '4px', marginBottom: '6px' }}>
            <select
              value={filterWorkshop}
              onChange={e => setFilterWorkshop(e.target.value)}
              style={{ flex: 1, padding: '4px 6px', fontSize: '11px', border: '1px solid #d1d5db', borderRadius: '4px', backgroundColor: 'white' }}
            >
              <option value="all">All Workshops</option>
              <option value="allstarteams">AST</option>
              <option value="ia">IA</option>
            </select>
            <select
              value={filterTranscript}
              onChange={e => setFilterTranscript(e.target.value)}
              style={{ flex: 1, padding: '4px 6px', fontSize: '11px', border: '1px solid #d1d5db', borderRadius: '4px', backgroundColor: 'white' }}
            >
              <option value="all">All Status</option>
              <option value="has">Has Transcript</option>
              <option value="missing">Missing</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: '4px' }}>
            <input
              type="text"
              placeholder="Search title or step..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ flex: 1, padding: '4px 6px', fontSize: '11px', border: '1px solid #d1d5db', borderRadius: '4px' }}
            />
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                title="Reset filters"
                style={{ padding: '4px 8px', fontSize: '11px', backgroundColor: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '4px', cursor: 'pointer', whiteSpace: 'nowrap' }}
              >
                Reset
              </button>
            )}
          </div>
          <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '4px' }}>
            {filteredVideos.length} of {videos.length} videos
          </div>
        </div>

        {/* Video list */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {loadingVideos ? (
            <div style={{ padding: '16px', color: '#9ca3af', fontSize: '13px' }}>Loading...</div>
          ) : filteredVideos.length === 0 ? (
            <div style={{ padding: '16px', color: '#9ca3af', fontSize: '13px' }}>
              {videos.length === 0 ? 'No videos found.' : 'No videos match filters.'}
            </div>
          ) : (
            filteredVideos.map(video => {
              const badge = workshopBadge(video.workshopType);
              return (
                <button
                  key={video.id}
                  onClick={() => selectVideo(video)}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    padding: '10px 12px',
                    borderBottom: '1px solid #f3f4f6',
                    backgroundColor: selectedId === video.id ? '#ede9fe' : 'white',
                    border: 'none',
                    borderLeft: selectedId === video.id ? '3px solid #7c3aed' : '3px solid transparent',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                    <span style={{
                      display: 'inline-block',
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: video.hasTranscript ? '#10b981' : '#d1d5db',
                      flexShrink: 0,
                    }} />
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {video.title}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                    <span style={{ fontSize: '11px', color: '#6b7280', fontFamily: 'monospace' }}>
                      {video.stepId || '—'}
                    </span>
                    <span style={{
                      fontSize: '10px',
                      fontWeight: 600,
                      color: badge.color,
                      backgroundColor: badge.bg,
                      padding: '1px 5px',
                      borderRadius: '3px',
                    }}>
                      {badge.label}
                    </span>
                    {video.hasTranscript && (
                      <span style={{ fontSize: '10px', color: '#9ca3af' }}>
                        {video.transcriptLength.toLocaleString()} chars
                      </span>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ── RIGHT: Editor ──────────────────────────────────────────────── */}
      <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {selectedId === null ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: '14px' }}>
            Select a video to edit transcript
          </div>
        ) : loadingDoc ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: '14px' }}>
            Loading...
          </div>
        ) : (
          <>
            {/* Editor header */}
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#f9fafb' }}>
              <span style={{ flex: 1, fontSize: '14px', fontWeight: 600, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {selectedVideo?.title}
              </span>
              <span style={{ fontSize: '11px', color: '#9ca3af', whiteSpace: 'nowrap' }}>
                {editorContent.length.toLocaleString()} chars
              </span>
              {isDirty && (
                <span style={{ fontSize: '11px', color: '#f59e0b', fontWeight: 600 }}>Unsaved</span>
              )}
              {showSavedBadge && (
                <span style={{ fontSize: '11px', color: '#059669', fontWeight: 600 }}>Saved</span>
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
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>

            {/* Subtitle with stepId and workshopType */}
            <div style={{ padding: '6px 16px', borderBottom: '1px solid #f3f4f6', fontSize: '12px', color: '#6b7280' }}>
              Step: <span style={{ fontFamily: 'monospace' }}>{selectedVideo?.stepId || '—'}</span>
              {' | '}
              Workshop: <span style={{ fontFamily: 'monospace' }}>{selectedVideo?.workshopType}</span>
            </div>

            {/* Rich Text Editor */}
            <RichTextEditor
              key={selectedId}
              content={editorContent}
              onChange={setEditorContent}
              placeholder="Start typing or paste transcript content..."
            />
          </>
        )}
      </div>
    </div>
  );
};

export default VideoTranscriptAdmin;
