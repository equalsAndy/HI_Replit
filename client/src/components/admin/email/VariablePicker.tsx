import React, { useState, useEffect, useRef } from 'react';

interface TemplateVariable {
  id: number;
  variableKey: string;
  variableName: string;
  description: string | null;
  category: string;
  dataType: string;
  exampleValue: string | null;
  isConditional: boolean;
}

interface VariablePickerProps {
  onInsert: (variableKey: string, variableName: string) => void;
  onClose: () => void;
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  invite: { bg: '#dbeafe', text: '#1e40af', label: 'Invite' },
  platform: { bg: '#d1fae5', text: '#065f46', label: 'Platform' },
  workshop: { bg: '#ede9fe', text: '#5b21b6', label: 'Workshop' },
  user: { bg: '#fef3c7', text: '#92400e', label: 'User' },
  conditional: { bg: '#fce7f3', text: '#9d174d', label: 'Conditional' },
};

const VariablePicker: React.FC<VariablePickerProps> = ({ onInsert, onClose }) => {
  const [variables, setVariables] = useState<TemplateVariable[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    fetch('/api/email-templates/variables', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.success) setVariables(data.variables);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const filtered = variables.filter(v =>
    v.variableName.toLowerCase().includes(search.toLowerCase()) ||
    v.variableKey.toLowerCase().includes(search.toLowerCase()) ||
    (v.description || '').toLowerCase().includes(search.toLowerCase())
  );

  // Group by category
  const grouped = filtered.reduce<Record<string, TemplateVariable[]>>((acc, v) => {
    (acc[v.category] = acc[v.category] || []).push(v);
    return acc;
  }, {});

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        top: '100%',
        left: 0,
        zIndex: 1000,
        width: '340px',
        maxHeight: '400px',
        backgroundColor: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <div style={{ padding: '8px', borderBottom: '1px solid #e5e7eb' }}>
        <input
          ref={inputRef}
          type="text"
          placeholder="Search variables..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={e => { if (e.key === 'Escape') onClose(); }}
          style={{
            width: '100%',
            padding: '6px 10px',
            fontSize: '13px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
      </div>

      <div style={{ overflowY: 'auto', flex: 1, padding: '4px 0' }}>
        {loading && <div style={{ padding: '12px', textAlign: 'center', color: '#9ca3af', fontSize: '13px' }}>Loading...</div>}
        {!loading && filtered.length === 0 && (
          <div style={{ padding: '12px', textAlign: 'center', color: '#9ca3af', fontSize: '13px' }}>No variables found</div>
        )}
        {Object.entries(grouped).map(([category, vars]) => {
          const cat = CATEGORY_COLORS[category] || { bg: '#f3f4f6', text: '#374151', label: category };
          return (
            <div key={category}>
              <div style={{ padding: '6px 12px', fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', color: '#9ca3af', letterSpacing: '0.5px' }}>
                {cat.label}
              </div>
              {vars.map(v => (
                <button
                  key={v.variableKey}
                  onClick={() => { onInsert(v.variableKey, v.variableName); onClose(); }}
                  style={{
                    display: 'flex',
                    width: '100%',
                    alignItems: 'flex-start',
                    gap: '8px',
                    padding: '6px 12px',
                    border: 'none',
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontSize: '13px',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#f9fafb')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <code style={{
                    backgroundColor: cat.bg,
                    color: cat.text,
                    padding: '1px 5px',
                    borderRadius: '3px',
                    fontSize: '11px',
                    fontFamily: 'monospace',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                  }}>
                    {`{{${v.variableKey}}}`}
                  </code>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 500, color: '#374151' }}>{v.variableName}</div>
                    {v.description && (
                      <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '1px' }}>{v.description}</div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default VariablePicker;
