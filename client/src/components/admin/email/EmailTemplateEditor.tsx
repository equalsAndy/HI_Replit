import React, { useState, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { TextStyle, Color } from '@tiptap/extension-text-style';
import { Underline } from '@tiptap/extension-underline';
import { TextAlign } from '@tiptap/extension-text-align';
import { Link } from '@tiptap/extension-link';
import { Placeholder } from '@tiptap/extension-placeholder';
import { CharacterCount } from '@tiptap/extension-character-count';
import { VariableNode } from './VariableNode';
import VariablePicker from './VariablePicker';

interface EmailTemplateEditorProps {
  name: string;
  subject: string;
  htmlContent: string;
  plainTextContent: string;
  templateCategory: string;
  workshopType: string | null;
  description: string;
  onSave: (data: {
    name: string;
    subject: string;
    htmlContent: string;
    plainTextContent: string;
    templateCategory: string;
    workshopType: string | null;
    description: string;
  }) => void;
  onCancel: () => void;
  saving?: boolean;
}

const EmailTemplateEditor: React.FC<EmailTemplateEditorProps> = ({
  name: initName,
  subject: initSubject,
  htmlContent: initHtml,
  plainTextContent: initPlainText,
  templateCategory: initCategory,
  workshopType: initWorkshopType,
  description: initDescription,
  onSave,
  onCancel,
  saving,
}) => {
  const [name, setName] = useState(initName);
  const [subject, setSubject] = useState(initSubject);
  const [description, setDescription] = useState(initDescription);
  const [category, setCategory] = useState(initCategory);
  const [workshopType, setWorkshopType] = useState(initWorkshopType || '');
  const [plainText, setPlainText] = useState(initPlainText);
  const [showVariablePicker, setShowVariablePicker] = useState(false);
  const [sourceMode, setSourceMode] = useState(false);
  const [sourceHtml, setSourceHtml] = useState('');
  const [activeSection, setActiveSection] = useState<'visual' | 'plaintext'>('visual');

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Color,
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: 'Compose your email template...' }),
      CharacterCount,
      VariableNode,
    ],
    content: initHtml,
    editorProps: {
      attributes: {
        style: 'outline: none; min-height: 350px; padding: 16px; font-size: 14px; line-height: 1.7;',
      },
    },
  });

  const insertVariable = useCallback((variableKey: string, variableName: string) => {
    if (!editor) return;
    (editor.commands as any).insertVariable({ variableKey, variableName });
    editor.commands.focus();
  }, [editor]);

  const handleSave = () => {
    const html = sourceMode ? sourceHtml : (editor?.getHTML() || '');
    onSave({
      name,
      subject,
      htmlContent: html,
      plainTextContent: plainText,
      templateCategory: category,
      workshopType: workshopType || null,
      description,
    });
  };

  const handleToggleSource = () => {
    if (!editor) return;
    if (!sourceMode) {
      setSourceHtml(editor.getHTML());
      setSourceMode(true);
    } else {
      editor.commands.setContent(sourceHtml);
      setSourceMode(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Metadata fields */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div>
          <label style={styles.label}>Template Name *</label>
          <input style={styles.input} value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Welcome — Beta Tester" />
        </div>
        <div>
          <label style={styles.label}>Subject Line *</label>
          <input style={styles.input} value={subject} onChange={e => setSubject(e.target.value)} placeholder="e.g., Welcome to {{platform_name}}!" />
        </div>
        <div>
          <label style={styles.label}>Category</label>
          <select style={styles.input} value={category} onChange={e => setCategory(e.target.value)}>
            <option value="custom">Custom</option>
            <option value="welcome">Welcome</option>
            <option value="beta_tester">Beta Tester</option>
            <option value="workshop_specific">Workshop Specific</option>
          </select>
        </div>
        <div>
          <label style={styles.label}>Workshop Type</label>
          <select style={styles.input} value={workshopType} onChange={e => setWorkshopType(e.target.value)}>
            <option value="">Any / Both</option>
            <option value="ast">AST Only</option>
            <option value="ia">IA Only</option>
            <option value="both">Both</option>
          </select>
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={styles.label}>Description</label>
          <input style={styles.input} value={description} onChange={e => setDescription(e.target.value)} placeholder="Brief description of when to use this template" />
        </div>
      </div>

      {/* Section tabs */}
      <div style={{ display: 'flex', gap: '4px', borderBottom: '1px solid #e5e7eb' }}>
        <button
          onClick={() => setActiveSection('visual')}
          style={{ ...styles.sectionTab, ...(activeSection === 'visual' ? styles.activeSectionTab : {}) }}
        >
          HTML Body
        </button>
        <button
          onClick={() => setActiveSection('plaintext')}
          style={{ ...styles.sectionTab, ...(activeSection === 'plaintext' ? styles.activeSectionTab : {}) }}
        >
          Plain Text
        </button>
      </div>

      {/* HTML Editor */}
      {activeSection === 'visual' && (
        <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
          {/* Toolbar */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px', padding: '6px 8px', borderBottom: '1px solid #e5e7eb', backgroundColor: '#f9fafb', alignItems: 'center' }}>
            {!sourceMode && editor && (
              <>
                <ToolbarBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold"><strong>B</strong></ToolbarBtn>
                <ToolbarBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic"><em>I</em></ToolbarBtn>
                <ToolbarBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Underline"><span style={{ textDecoration: 'underline' }}>U</span></ToolbarBtn>
                <Divider />
                <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })} title="Heading 1">H1</ToolbarBtn>
                <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="Heading 2">H2</ToolbarBtn>
                <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="Heading 3">H3</ToolbarBtn>
                <Divider />
                <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} title="Left">&#8676;</ToolbarBtn>
                <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="Center">&#8596;</ToolbarBtn>
                <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} title="Right">&#8677;</ToolbarBtn>
                <Divider />
                <ToolbarBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet List">&bull; List</ToolbarBtn>
                <ToolbarBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Numbered">1. List</ToolbarBtn>
                <Divider />
                <ToolbarBtn onClick={() => {
                  const url = prompt('Enter URL:');
                  if (url) editor.chain().focus().setLink({ href: url }).run();
                }} active={editor.isActive('link')} title="Link">Link</ToolbarBtn>
                <ToolbarBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Horizontal Rule">&mdash;</ToolbarBtn>
                <Divider />
                {/* Variable picker */}
                <div style={{ position: 'relative' }}>
                  <ToolbarBtn onClick={() => setShowVariablePicker(!showVariablePicker)} active={showVariablePicker} title="Insert Variable">
                    {'{{'}&thinsp;x&thinsp;{'}}'}
                  </ToolbarBtn>
                  {showVariablePicker && (
                    <VariablePicker
                      onInsert={insertVariable}
                      onClose={() => setShowVariablePicker(false)}
                    />
                  )}
                </div>
              </>
            )}
            <div style={{ flex: 1 }} />
            <ToolbarBtn onClick={handleToggleSource} active={sourceMode} title={sourceMode ? 'Visual' : 'HTML Source'}>
              {sourceMode ? 'Visual' : 'HTML'}
            </ToolbarBtn>
          </div>

          {/* Editor content */}
          {sourceMode ? (
            <textarea
              value={sourceHtml}
              onChange={e => setSourceHtml(e.target.value)}
              spellCheck={false}
              style={{ width: '100%', minHeight: '350px', padding: '16px', fontFamily: 'monospace', fontSize: '12px', lineHeight: '1.6', border: 'none', resize: 'vertical', outline: 'none', backgroundColor: '#1f2937', color: '#e5e7eb', boxSizing: 'border-box' }}
            />
          ) : (
            <div style={{ minHeight: '350px' }}>
              <EditorContent editor={editor} />
            </div>
          )}
        </div>
      )}

      {/* Plain text editor */}
      {activeSection === 'plaintext' && (
        <div>
          <p style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '8px' }}>
            Plain text version for email clients that don't support HTML. Use {'{{variable_name}}'} for dynamic content.
          </p>
          <textarea
            value={plainText}
            onChange={e => setPlainText(e.target.value)}
            style={{ width: '100%', minHeight: '300px', padding: '12px', fontSize: '13px', lineHeight: '1.6', border: '1px solid #e5e7eb', borderRadius: '8px', resize: 'vertical', fontFamily: 'monospace', outline: 'none', boxSizing: 'border-box' }}
            placeholder="Plain text version of your email..."
          />
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', paddingTop: '8px' }}>
        <button onClick={onCancel} style={styles.btnSecondary}>Cancel</button>
        <button onClick={handleSave} disabled={saving || !name || !subject} style={{ ...styles.btnPrimary, opacity: (saving || !name || !subject) ? 0.5 : 1 }}>
          {saving ? 'Saving...' : 'Save Template'}
        </button>
      </div>

      <style>{`
        .tiptap { outline: none; }
        .tiptap p { margin: 0.5em 0; }
        .tiptap h1 { font-size: 1.8em; font-weight: 700; margin: 0.8em 0 0.4em; }
        .tiptap h2 { font-size: 1.4em; font-weight: 600; margin: 0.7em 0 0.3em; }
        .tiptap h3 { font-size: 1.15em; font-weight: 600; margin: 0.6em 0 0.3em; }
        .tiptap ul, .tiptap ol { padding-left: 1.5em; margin: 0.5em 0; }
        .tiptap a { color: #7c3aed; text-decoration: underline; }
        .tiptap hr { border: none; border-top: 1px solid #e5e7eb; margin: 1em 0; }
        .tiptap p.is-editor-empty:first-child::before {
          content: attr(data-placeholder); float: left; color: #adb5bd; pointer-events: none; height: 0;
        }
        .variable-node { display: inline-block; background: #ede9fe; color: #6d28d9; border: 1px solid #c4b5fd; border-radius: 4px; padding: 1px 6px; font-size: 0.85em; font-family: monospace; }
      `}</style>
    </div>
  );
};

// ── Small sub-components ─────────────────────────────────────────────────────

const ToolbarBtn: React.FC<{ onClick: () => void; active?: boolean; disabled?: boolean; title: string; children: React.ReactNode }> = ({ onClick, active, disabled, title, children }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={title}
    style={{
      padding: '4px 8px', fontSize: '13px', fontWeight: active ? 700 : 400,
      backgroundColor: active ? '#ede9fe' : 'transparent', color: active ? '#7c3aed' : '#374151',
      border: '1px solid transparent', borderRadius: '4px', cursor: disabled ? 'default' : 'pointer',
      opacity: disabled ? 0.4 : 1, lineHeight: 1,
    }}
  >
    {children}
  </button>
);

const Divider = () => <span style={{ width: '1px', backgroundColor: '#d1d5db', margin: '0 4px', alignSelf: 'stretch' }} />;

const styles: Record<string, React.CSSProperties> = {
  label: { display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '4px' },
  input: { width: '100%', padding: '8px 12px', fontSize: '14px', border: '1px solid #d1d5db', borderRadius: '6px', outline: 'none', boxSizing: 'border-box' },
  sectionTab: { padding: '8px 16px', fontSize: '13px', fontWeight: 500, border: 'none', borderBottom: '2px solid transparent', backgroundColor: 'transparent', cursor: 'pointer', color: '#6b7280' },
  activeSectionTab: { color: '#7c3aed', borderBottomColor: '#7c3aed' },
  btnPrimary: { padding: '8px 20px', fontSize: '14px', fontWeight: 600, backgroundColor: '#7c3aed', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' },
  btnSecondary: { padding: '8px 20px', fontSize: '14px', fontWeight: 500, backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer' },
};

export default EmailTemplateEditor;
