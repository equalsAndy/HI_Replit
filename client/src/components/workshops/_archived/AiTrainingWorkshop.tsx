import React, { useEffect, useMemo, useState } from 'react';
import AdminChat from '@/components/admin/AdminChat';

const AiTrainingWorkshop: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'chat' | 'documents'>('chat');

  const tabStyle = (isActive: boolean) => ({
    padding: '12px 24px',
    border: 'none',
    backgroundColor: isActive ? '#3b82f6' : 'transparent',
    color: isActive ? 'white' : '#6b7280',
    borderRadius: '8px 8px 0 0',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    borderBottom: isActive ? 'none' : '2px solid transparent'
  });

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f8fafc',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        <header style={{
          marginBottom: '30px',
          textAlign: 'center'
        }}>
          <h1 style={{
            fontSize: '28px',
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: '8px'
          }}>
            AI Training & Testing Interface
          </h1>
          <p style={{
            color: '#6b7280',
            fontSize: '16px'
          }}>
            Comprehensive tool for training AI personas, running A/B tests, and managing training documents
          </p>
        </header>

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          marginBottom: '0',
          backgroundColor: 'white',
          borderRadius: '8px 8px 0 0',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
        }}>
          <button
            style={tabStyle(activeTab === 'chat')}
            onClick={() => setActiveTab('chat')}
          >
            🤖 AI Training Chat
          </button>
          <button
            style={tabStyle(activeTab === 'documents')}
            onClick={() => setActiveTab('documents')}
          >
            📁 Document Management
          </button>
        </div>

        {/* Tab Content */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '0 0 8px 8px',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          minHeight: '70vh'
        }}>
          {activeTab === 'chat' && <AdminChat />}
          {activeTab === 'documents' && <ProjectVectorStoreManager />}
        </div>
      </div>
    </div>
  );
};

export default AiTrainingWorkshop;

// Lightweight project-based vector store manager for OpenAI
const ProjectVectorStoreManager: React.FC = () => {
  const [projectKey, setProjectKey] = useState<'ultra' | 'default' | 'allstar' | 'ia' | 'reflection'>('ultra');
  // Personas are now represented by projects; no separate persona selection required
  const [files, setFiles] = useState<{ id: string; filename: string; createdAt: string; size: number; status?: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [vectorStoreAvailable, setVectorStoreAvailable] = useState(true);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<'training_session' | 'guideline' | 'example' | 'prompt'>('training_session');
  const [isGeneral, setIsGeneral] = useState(true);
  const [template, setTemplate] = useState<'none' | 'primary_prompt' | 'guidelines' | 'example_doc'>('none');
  const [message, setMessage] = useState<string | null>(null);

  const loadFiles = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/ai/training-sessions?projectKey=${encodeURIComponent(projectKey)}`, {
        credentials: 'include'
      });
      if (!res.ok) {
        const text = await res.text();
        if (res.status === 501) setVectorStoreAvailable(false);
        throw new Error(text || 'Failed to load files');
      }
      const data = await res.json();
      setFiles(Array.isArray(data?.trainingSessions) ? data.trainingSessions : []);
      setVectorStoreAvailable(true);
    } catch (e: any) {
      setError(e?.message || 'Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadFiles(); }, [personaId, projectKey]);

  const detach = async (fileId: string) => {
    if (!confirm('Detach this file from the vector store (keep project file)?')) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/ai/training-document/${fileId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectKey, mode: 'detach' })
      });
      if (!res.ok) throw new Error(await res.text());
      await loadFiles();
    } catch (e: any) {
      setError(e?.message || 'Detach failed');
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async (fileId: string) => {
    if (!confirm('Detach and delete this file from OpenAI?')) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/ai/training-document/${fileId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectKey, mode: 'detach_delete' })
      });
      if (!res.ok) throw new Error(await res.text());
      await loadFiles();
    } catch (e: any) {
      setError(e?.message || 'Delete failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '16px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 12, alignItems: 'end', marginBottom: 16 }}>
        <div>
          <label style={{ fontSize: 12, color: '#374151' }}>Project</label>
          <select value={projectKey} onChange={(e) => setProjectKey(e.target.value as any)} style={{ display: 'block', marginTop: 6, padding: 8, border: '1px solid #e5e7eb', borderRadius: 6 }}>
            <option value="ultra">Ultra Talia (proj_xXZPw7W0...)</option>
            <option value="allstar">AllStarTeams_Talia (proj_8orRfMn...)</option>
            <option value="ia">Imaginal Agility (proj_Mb9Fcwz...)</option>
            <option value="reflection">Reflection Assistant Talia (proj_VAJqPp...)</option>
            <option value="default">Default (SDK default project)</option>
          </select>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={loadFiles} disabled={loading} style={{ padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 6, background: 'white' }}>{loading ? 'Refreshing…' : 'Refresh'}</button>
        </div>
      </div>

      {!vectorStoreAvailable && (
        <div style={{ marginBottom: 12, padding: 10, background: '#FEF3C7', color: '#92400E', border: '1px solid #FCD34D', borderRadius: 6, fontSize: 12 }}>
          Vector store unavailable for this project. Set ULTRA_TALIA_PROJECT_ID and ULTRA_TALIA_VECTOR_STORE_ID, then restart the server.
        </div>
      )}

      {error && (
        <div style={{ marginBottom: 12, padding: 10, background: '#FEE2E2', color: '#991B1B', border: '1px solid #FCA5A5', borderRadius: 6, fontSize: 12 }}>{error}</div>
      )}
      {message && (
        <div style={{ marginBottom: 12, padding: 10, background: '#ECFDF5', color: '#065F46', border: '1px solid #A7F3D0', borderRadius: 6, fontSize: 12 }}>{message}</div>
      )}

      {/* Upload form */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
        <div>
          <label style={{ fontSize: 12, color: '#374151' }}>Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Document title"
            style={{ display: 'block', width: '100%', marginTop: 6, padding: 8, border: '1px solid #e5e7eb', borderRadius: 6 }}
          />
          {!title.trim() && (
            <div style={{ marginTop: 4, fontSize: 11, color: '#991B1B' }}>Title is required</div>
          )}
        </div>
        <div>
          <label style={{ fontSize: 12, color: '#374151' }}>Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as any)}
            style={{ display: 'block', width: '100%', marginTop: 6, padding: 8, border: '1px solid #e5e7eb', borderRadius: 6 }}
          >
            <option value="training_session">Training Session</option>
            <option value="guideline">Guideline</option>
            <option value="example">Example</option>
            <option value="prompt">Prompt</option>
          </select>
        </div>
        <div>
          <label style={{ fontSize: 12, color: '#374151' }}>Template</label>
          <select
            value={template}
            onChange={(e) => {
              const t = e.target.value as typeof template;
              setTemplate(t);
              // Apply simple templates
              if (t === 'primary_prompt') {
                setCategory('prompt');
                setTitle('TALIA_Report_Generation_PRIMARY_Prompt');
                setIsGeneral(true);
                setContent(`# TALIA Report Generation Primary Prompt\n\nFollow these rules strictly when generating reports:\n- Use 2nd person voice ("You...")\n- Cite exact assessment percentages\n- Weave direct quotes from reflections\n- Produce a complete, polished Markdown document\n\nSections to include:\n1. Signature Strength Pattern\n2. Flow Profile\n3. Reflection Insights\n4. Professional Development\n5. Personal Development\n6. Next Steps`);
              } else if (t === 'guidelines') {
                setCategory('guideline');
                setTitle('Report Writing Guidelines');
                setIsGeneral(true);
                setContent(`Guidelines:\n- Be concise and specific\n- Use headings and bullets\n- Include user data verbatim where helpful\n- Maintain consistent tone`);
              } else if (t === 'example_doc') {
                setCategory('example');
                setTitle('Example: Personal Development Report');
                setIsGeneral(true);
                setContent(`# Personal Development Report\n\n## Signature Pattern\n...\n\n## Flow Profile\n...\n\n## Next Steps\n...`);
              } else {
                // none
              }
            }}
            style={{ display: 'block', width: '100%', marginTop: 6, padding: 8, border: '1px solid #e5e7eb', borderRadius: 6 }}
          >
            <option value="none">None</option>
            <option value="primary_prompt">Primary Prompt</option>
            <option value="guidelines">Guidelines</option>
            <option value="example_doc">Example Doc</option>
          </select>
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={{ fontSize: 12, color: '#374151' }}>Content</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
            placeholder="Paste or write training content here..."
            style={{ display: 'block', width: '100%', marginTop: 6, padding: 8, border: '1px solid #e5e7eb', borderRadius: 6, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace', fontSize: 12 }}
          />
          {content.trim().length < 20 && (
            <div style={{ marginTop: 4, fontSize: 11, color: '#991B1B' }}>Please provide at least 20 characters of content</div>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <label style={{ fontSize: 12, color: '#374151' }}>
            <input type="checkbox" checked={isGeneral} onChange={(e) => setIsGeneral(e.target.checked)} style={{ marginRight: 6 }} />
            Mark as general
          </label>
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button
            onClick={async () => {
              setSubmitting(true);
              setError(null);
              setMessage(null);
              try {
                const res = await fetch('/api/admin/ai/upload-training-document', {
                  method: 'POST',
                  credentials: 'include',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ title, content, category, isGeneral, projectKey })
                });
                if (!res.ok) {
                  const text = await res.text();
                  if (res.status === 501) setVectorStoreAvailable(false);
                  throw new Error(text || 'Upload failed');
                }
                setTitle('');
                setContent('');
                setTemplate('none');
                setMessage('Uploaded successfully');
                await loadFiles();
              } catch (e: any) {
                setError(e?.message || 'Upload failed');
              } finally {
                setSubmitting(false);
              }
            }}
            disabled={submitting || !title.trim() || content.trim().length < 20 || !vectorStoreAvailable}
            style={{ padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 6, background: '#3b82f6', color: 'white' }}
          >
            {submitting ? 'Uploading…' : 'Upload'}
          </button>
          <button
            onClick={() => { setTitle(''); setContent(''); }}
            disabled={submitting}
            style={{ padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 6, background: 'white' }}
          >
            Clear
          </button>
        </div>
      </div>

      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
        {files.length === 0 ? (
          <div style={{ padding: 16, color: '#6b7280', fontSize: 14 }}>{loading ? 'Loading…' : 'No files in vector store.'}</div>
        ) : (
          files.map((f) => (
            <div key={f.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 12, borderBottom: '1px solid #e5e7eb' }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 700 }}>{f.filename}</div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>{new Date(f.createdAt).toLocaleString()} • {(f.size / 1024).toFixed(1)} KB</div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => detach(f.id)} disabled={submitting} style={{ padding: '6px 10px', border: '1px solid #e5e7eb', borderRadius: 6, background: 'white' }}>Detach</button>
                <button onClick={() => remove(f.id)} disabled={submitting} style={{ padding: '6px 10px', border: '1px solid #ef4444', color: 'white', background: '#ef4444', borderRadius: 6 }}>Detach + Delete</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
