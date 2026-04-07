import React, { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import EmailTemplateEditor from './EmailTemplateEditor';
import EmailTemplatePreview from './EmailTemplatePreview';
import { Eye, Edit3, Copy, Trash2, Plus, Send, Download } from 'lucide-react';

interface EmailTemplate {
  id: number;
  name: string;
  description: string | null;
  subject: string;
  htmlContent: string;
  plainTextContent: string | null;
  templateCategory: string;
  workshopType: string | null;
  createdBy: number;
  isSystemTemplate: boolean;
  isShared: boolean;
  isActive: boolean;
  isDefault: boolean;
  version: number;
  updatedAt: string;
}

interface SendLogEntry {
  id: number;
  recipientEmail: string;
  recipientName: string | null;
  subject: string;
  senderIdentity: string;
  status: string;
  queuedAt: string;
  sentAt: string | null;
  errorMessage: string | null;
}

const apiRequest = async (url: string, options: any = {}) => {
  const res = await fetch(url, {
    ...options,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  return res.json();
};

const CATEGORY_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  welcome: { label: 'Welcome', color: '#065f46', bg: '#d1fae5' },
  beta_tester: { label: 'Beta Tester', color: '#92400e', bg: '#fef3c7' },
  workshop_specific: { label: 'Workshop', color: '#5b21b6', bg: '#ede9fe' },
  custom: { label: 'Custom', color: '#374151', bg: '#f3f4f6' },
};

const STATUS_COLORS: Record<string, { color: string; bg: string }> = {
  pending: { color: '#92400e', bg: '#fef3c7' },
  sent: { color: '#065f46', bg: '#d1fae5' },
  failed: { color: '#991b1b', bg: '#fee2e2' },
  bounced: { color: '#9a3412', bg: '#ffedd5' },
  complained: { color: '#9d174d', bg: '#fce7f3' },
};

const EmailTemplateManagement: React.FC = () => {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [sendHistory, setSendHistory] = useState<SendLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<'templates' | 'history'>('templates');
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [creatingNew, setCreatingNew] = useState(false);
  const [previewTemplateId, setPreviewTemplateId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const loadTemplates = useCallback(async () => {
    const data = await apiRequest('/api/email-templates');
    if (data.success) setTemplates(data.templates);
    setLoading(false);
  }, []);

  const loadHistory = useCallback(async () => {
    const data = await apiRequest('/api/email-send/history');
    if (data.success) setSendHistory(data.history);
  }, []);

  useEffect(() => { loadTemplates(); }, [loadTemplates]);
  useEffect(() => { if (activeView === 'history') loadHistory(); }, [activeView, loadHistory]);

  const handleSaveTemplate = async (templateData: any) => {
    setSaving(true);
    const url = editingTemplate
      ? `/api/email-templates/${editingTemplate.id}`
      : '/api/email-templates';
    const method = editingTemplate ? 'PUT' : 'POST';

    const data = await apiRequest(url, { method, body: JSON.stringify(templateData) });
    setSaving(false);

    if (data.success) {
      toast({ title: editingTemplate ? 'Template updated' : 'Template created', description: templateData.name });
      setEditingTemplate(null);
      setCreatingNew(false);
      loadTemplates();
    } else {
      toast({ title: 'Error', description: data.message || 'Failed to save', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete template "${name}"? This can be undone by an admin.`)) return;
    const data = await apiRequest(`/api/email-templates/${id}`, { method: 'DELETE' });
    if (data.success) {
      toast({ title: 'Template deleted', description: name });
      loadTemplates();
    } else {
      toast({ title: 'Error', description: data.message, variant: 'destructive' });
    }
  };

  const handleClone = async (id: number) => {
    const data = await apiRequest(`/api/email-templates/${id}/clone`, { method: 'POST' });
    if (data.success) {
      toast({ title: 'Template cloned', description: data.template.name });
      loadTemplates();
    } else {
      toast({ title: 'Error', description: data.message, variant: 'destructive' });
    }
  };

  // ── Editor view ────────────────────────────────────────────────────────────

  if (creatingNew || editingTemplate) {
    const t = editingTemplate;
    return (
      <div>
        <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>
          {t ? `Edit: ${t.name}` : 'Create New Template'}
        </h3>
        <EmailTemplateEditor
          name={t?.name || ''}
          subject={t?.subject || ''}
          htmlContent={t?.htmlContent || ''}
          plainTextContent={t?.plainTextContent || ''}
          templateCategory={t?.templateCategory || 'custom'}
          workshopType={t?.workshopType || null}
          description={t?.description || ''}
          onSave={handleSaveTemplate}
          onCancel={() => { setEditingTemplate(null); setCreatingNew(false); }}
          saving={saving}
        />
      </div>
    );
  }

  // ── List view ──────────────────────────────────────────────────────────────

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button onClick={() => setActiveView('templates')} style={{ ...styles.viewTab, ...(activeView === 'templates' ? styles.activeViewTab : {}) }}>
            Templates ({templates.length})
          </button>
          <button onClick={() => setActiveView('history')} style={{ ...styles.viewTab, ...(activeView === 'history' ? styles.activeViewTab : {}) }}>
            Send History
          </button>
        </div>
        {activeView === 'templates' && (
          <button onClick={() => setCreatingNew(true)} style={styles.btnPrimary}>
            <Plus size={14} style={{ marginRight: '4px' }} /> New Template
          </button>
        )}
      </div>

      {/* Templates list */}
      {activeView === 'templates' && (
        <>
          {loading && <div style={{ padding: '20px', textAlign: 'center', color: '#9ca3af' }}>Loading templates...</div>}
          {!loading && templates.length === 0 && (
            <div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>
              <p style={{ fontSize: '16px', marginBottom: '8px' }}>No email templates yet</p>
              <p style={{ fontSize: '13px' }}>Create your first template or run the seed script to load defaults.</p>
            </div>
          )}
          {!loading && templates.length > 0 && (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Name</th>
                  <th style={styles.th}>Category</th>
                  <th style={styles.th}>Workshop</th>
                  <th style={styles.th}>Subject</th>
                  <th style={styles.th}>Version</th>
                  <th style={styles.th}>Updated</th>
                  <th style={{ ...styles.th, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {templates.map(t => {
                  const cat = CATEGORY_LABELS[t.templateCategory] || CATEGORY_LABELS.custom;
                  return (
                    <tr key={t.id} style={styles.tr}>
                      <td style={styles.td}>
                        <div style={{ fontWeight: 500 }}>{t.name}</div>
                        {t.isSystemTemplate && <span style={{ fontSize: '10px', color: '#9ca3af' }}>System</span>}
                        {t.isDefault && <span style={{ fontSize: '10px', color: '#059669', marginLeft: '6px' }}>Default</span>}
                      </td>
                      <td style={styles.td}>
                        <span style={{ ...styles.badge, backgroundColor: cat.bg, color: cat.color }}>{cat.label}</span>
                      </td>
                      <td style={styles.td}>{t.workshopType?.toUpperCase() || 'Any'}</td>
                      <td style={{ ...styles.td, maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.subject}</td>
                      <td style={styles.td}>v{t.version}</td>
                      <td style={styles.td}>{new Date(t.updatedAt).toLocaleDateString()}</td>
                      <td style={{ ...styles.td, textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                          <ActionBtn title="Preview" onClick={() => setPreviewTemplateId(t.id)}><Eye size={14} /></ActionBtn>
                          <ActionBtn title="Edit" onClick={() => setEditingTemplate(t)}><Edit3 size={14} /></ActionBtn>
                          <ActionBtn title="Clone" onClick={() => handleClone(t.id)}><Copy size={14} /></ActionBtn>
                          <ActionBtn title="Delete" onClick={() => handleDelete(t.id, t.name)} danger><Trash2 size={14} /></ActionBtn>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </>
      )}

      {/* Send history */}
      {activeView === 'history' && (
        <>
          {sendHistory.length === 0 && (
            <div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>
              <p>No emails sent yet.</p>
            </div>
          )}
          {sendHistory.length > 0 && (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Recipient</th>
                  <th style={styles.th}>Subject</th>
                  <th style={styles.th}>Sender</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Sent</th>
                </tr>
              </thead>
              <tbody>
                {sendHistory.map(entry => {
                  const status = STATUS_COLORS[entry.status] || STATUS_COLORS.pending;
                  return (
                    <tr key={entry.id} style={styles.tr}>
                      <td style={styles.td}>
                        <div style={{ fontWeight: 500 }}>{entry.recipientEmail}</div>
                        {entry.recipientName && <div style={{ fontSize: '12px', color: '#9ca3af' }}>{entry.recipientName}</div>}
                      </td>
                      <td style={{ ...styles.td, maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{entry.subject}</td>
                      <td style={styles.td}>{entry.senderIdentity}</td>
                      <td style={styles.td}>
                        <span style={{ ...styles.badge, backgroundColor: status.bg, color: status.color }}>{entry.status}</span>
                        {entry.errorMessage && <div style={{ fontSize: '11px', color: '#ef4444', marginTop: '2px' }}>{entry.errorMessage}</div>}
                      </td>
                      <td style={styles.td}>{entry.sentAt ? new Date(entry.sentAt).toLocaleString() : 'Pending'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </>
      )}

      {/* Preview modal */}
      {previewTemplateId !== null && (
        <EmailTemplatePreview
          templateId={previewTemplateId}
          onClose={() => setPreviewTemplateId(null)}
        />
      )}
    </div>
  );
};

// ── Sub-components ────────────────────────────────────────────────────────────

const ActionBtn: React.FC<{ onClick: () => void; title: string; danger?: boolean; children: React.ReactNode }> = ({ onClick, title, danger, children }) => (
  <button
    onClick={onClick}
    title={title}
    style={{
      padding: '4px 6px', border: '1px solid #e5e7eb', borderRadius: '4px', backgroundColor: '#fff',
      cursor: 'pointer', color: danger ? '#ef4444' : '#6b7280', display: 'flex', alignItems: 'center',
    }}
    onMouseEnter={e => (e.currentTarget.style.backgroundColor = danger ? '#fef2f2' : '#f9fafb')}
    onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#fff')}
  >
    {children}
  </button>
);

const styles: Record<string, React.CSSProperties> = {
  viewTab: { padding: '8px 16px', fontSize: '13px', fontWeight: 500, border: 'none', borderBottom: '2px solid transparent', backgroundColor: 'transparent', cursor: 'pointer', color: '#6b7280' },
  activeViewTab: { color: '#7c3aed', borderBottomColor: '#7c3aed' },
  btnPrimary: { display: 'flex', alignItems: 'center', padding: '8px 16px', fontSize: '13px', fontWeight: 600, backgroundColor: '#7c3aed', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' },
  table: { width: '100%', borderCollapse: 'collapse' as const, fontSize: '13px' },
  th: { textAlign: 'left' as const, padding: '10px 12px', borderBottom: '2px solid #e5e7eb', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' as const, letterSpacing: '0.5px' },
  tr: { borderBottom: '1px solid #f3f4f6' },
  td: { padding: '10px 12px', verticalAlign: 'top' as const },
  badge: { display: 'inline-block', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 500 },
};

export default EmailTemplateManagement;
