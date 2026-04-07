import React, { useState, useEffect } from 'react';

interface EmailTemplatePreviewProps {
  templateId: number;
  inviteId?: number;
  onClose: () => void;
}

const EmailTemplatePreview: React.FC<EmailTemplatePreviewProps> = ({ templateId, inviteId, onClose }) => {
  const [preview, setPreview] = useState<{ subject: string; html: string; plainText: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState<'html' | 'plaintext'>('html');

  useEffect(() => {
    setLoading(true);
    fetch(`/api/email-templates/${templateId}/preview`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inviteId: inviteId || null }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setPreview(data.preview);
        } else {
          setError(data.message || 'Failed to load preview');
        }
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [templateId, inviteId]);

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
      <div style={{ backgroundColor: '#fff', borderRadius: '12px', width: '90%', maxWidth: '700px', maxHeight: '85vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #e5e7eb' }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>Email Preview</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#9ca3af' }}>&times;</button>
        </div>

        {loading && <div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>Loading preview...</div>}
        {error && <div style={{ padding: '20px', textAlign: 'center', color: '#ef4444' }}>{error}</div>}

        {preview && (
          <>
            {/* Subject */}
            <div style={{ padding: '12px 20px', backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
              <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '2px' }}>Subject</div>
              <div style={{ fontSize: '14px', fontWeight: 500 }}>{preview.subject}</div>
            </div>

            {/* View toggle */}
            <div style={{ display: 'flex', gap: '4px', padding: '8px 20px', borderBottom: '1px solid #e5e7eb' }}>
              <button
                onClick={() => setViewMode('html')}
                style={{ padding: '4px 12px', fontSize: '12px', fontWeight: viewMode === 'html' ? 600 : 400, border: 'none', borderBottom: viewMode === 'html' ? '2px solid #7c3aed' : '2px solid transparent', backgroundColor: 'transparent', cursor: 'pointer', color: viewMode === 'html' ? '#7c3aed' : '#6b7280' }}
              >
                HTML
              </button>
              <button
                onClick={() => setViewMode('plaintext')}
                style={{ padding: '4px 12px', fontSize: '12px', fontWeight: viewMode === 'plaintext' ? 600 : 400, border: 'none', borderBottom: viewMode === 'plaintext' ? '2px solid #7c3aed' : '2px solid transparent', backgroundColor: 'transparent', cursor: 'pointer', color: viewMode === 'plaintext' ? '#7c3aed' : '#6b7280' }}
              >
                Plain Text
              </button>
            </div>

            {/* Content */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {viewMode === 'html' ? (
                <iframe
                  srcDoc={preview.html}
                  style={{ width: '100%', height: '500px', border: 'none' }}
                  title="Email preview"
                  sandbox="allow-same-origin"
                />
              ) : (
                <pre style={{ padding: '20px', fontSize: '13px', lineHeight: '1.6', whiteSpace: 'pre-wrap', fontFamily: 'monospace', color: '#374151', margin: 0 }}>
                  {preview.plainText}
                </pre>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EmailTemplatePreview;
