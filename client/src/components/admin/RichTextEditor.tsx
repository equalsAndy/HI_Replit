import React, { useCallback, useState, useRef, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import ImageResize from 'tiptap-extension-resize-image';
import TextStyle from '@tiptap/extension-text-style';
import FontFamily from '@tiptap/extension-font-family';
import { Color } from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import Underline from '@tiptap/extension-underline';
import Superscript from '@tiptap/extension-superscript';
import Subscript from '@tiptap/extension-subscript';
import TextAlign from '@tiptap/extension-text-align';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import Typography from '@tiptap/extension-typography';
import { Extension } from '@tiptap/react';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

// ─── Types ────────────────────────────────────────────────────────────────────

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

// ─── Font Size Extension (custom) ─────────────────────────────────────────────

const FontSize = Extension.create({
  name: 'fontSize',
  addOptions() {
    return { types: ['textStyle'] };
  },
  addGlobalAttributes() {
    return [{
      types: this.options.types,
      attributes: {
        fontSize: {
          default: null,
          parseHTML: el => el.style.fontSize || null,
          renderHTML: attrs => {
            if (!attrs.fontSize) return {};
            return { style: `font-size: ${attrs.fontSize}` };
          },
        },
      },
    }];
  },
  addCommands() {
    return {
      setFontSize: (size: string) => ({ chain }: any) =>
        chain().setMark('textStyle', { fontSize: size }).run(),
      unsetFontSize: () => ({ chain }: any) =>
        chain().setMark('textStyle', { fontSize: null }).removeEmptyTextStyle().run(),
    };
  },
});

// ─── Search & Replace Extension (custom) ──────────────────────────────────────

const searchPluginKey = new PluginKey('searchReplace');

const SearchReplace = Extension.create({
  name: 'searchReplace',
  addOptions() {
    return { searchTerm: '', replaceTerm: '', caseSensitive: false };
  },
  addStorage() {
    return { searchTerm: '', replaceTerm: '', caseSensitive: false, results: 0 };
  },
  addProseMirrorPlugins() {
    const ext = this;
    return [
      new Plugin({
        key: searchPluginKey,
        state: {
          init() { return DecorationSet.empty; },
          apply(tr, old) {
            const meta = tr.getMeta(searchPluginKey);
            if (meta !== undefined) return meta;
            if (tr.docChanged) {
              // Rebuild decorations on doc change
              const term = ext.storage.searchTerm;
              if (!term) return DecorationSet.empty;
              const decos: Decoration[] = [];
              const caseSensitive = ext.storage.caseSensitive;
              tr.doc.descendants((node, pos) => {
                if (!node.isText || !node.text) return;
                const text = caseSensitive ? node.text : node.text.toLowerCase();
                const search = caseSensitive ? term : term.toLowerCase();
                let idx = text.indexOf(search);
                while (idx !== -1) {
                  decos.push(Decoration.inline(pos + idx, pos + idx + search.length, {
                    style: 'background-color: #fef08a; border-radius: 2px;',
                  }));
                  idx = text.indexOf(search, idx + 1);
                }
              });
              ext.storage.results = decos.length;
              return DecorationSet.create(tr.doc, decos);
            }
            return old.map(tr.mapping, tr.doc);
          },
        },
        props: {
          decorations(state) {
            return this.getState(state);
          },
        },
      }),
    ];
  },
  addCommands() {
    return {
      setSearchTerm: (term: string) => ({ editor, tr }: any) => {
        this.storage.searchTerm = term;
        const decos: Decoration[] = [];
        if (term) {
          const caseSensitive = this.storage.caseSensitive;
          tr.doc.descendants((node: any, pos: number) => {
            if (!node.isText || !node.text) return;
            const text = caseSensitive ? node.text : node.text.toLowerCase();
            const search = caseSensitive ? term : term.toLowerCase();
            let idx = text.indexOf(search);
            while (idx !== -1) {
              decos.push(Decoration.inline(pos + idx, pos + idx + search.length, {
                style: 'background-color: #fef08a; border-radius: 2px;',
              }));
              idx = text.indexOf(search, idx + 1);
            }
          });
        }
        this.storage.results = decos.length;
        tr.setMeta(searchPluginKey, DecorationSet.create(tr.doc, decos));
        return true;
      },
      replaceNext: () => ({ editor, tr, dispatch }: any) => {
        const term = this.storage.searchTerm;
        const replace = this.storage.replaceTerm;
        if (!term) return false;
        const caseSensitive = this.storage.caseSensitive;
        let found = false;
        tr.doc.descendants((node: any, pos: number) => {
          if (found || !node.isText || !node.text) return;
          const text = caseSensitive ? node.text : node.text.toLowerCase();
          const search = caseSensitive ? term : term.toLowerCase();
          const idx = text.indexOf(search);
          if (idx !== -1) {
            if (dispatch) {
              tr.replaceWith(pos + idx, pos + idx + term.length, editor.state.schema.text(replace));
            }
            found = true;
          }
        });
        return found;
      },
      replaceAll: () => ({ editor, tr, dispatch }: any) => {
        const term = this.storage.searchTerm;
        const replace = this.storage.replaceTerm;
        if (!term) return false;
        const caseSensitive = this.storage.caseSensitive;
        // Collect all matches first, then replace in reverse order
        const matches: { from: number; to: number }[] = [];
        tr.doc.descendants((node: any, pos: number) => {
          if (!node.isText || !node.text) return;
          const text = caseSensitive ? node.text : node.text.toLowerCase();
          const search = caseSensitive ? term : term.toLowerCase();
          let idx = text.indexOf(search);
          while (idx !== -1) {
            matches.push({ from: pos + idx, to: pos + idx + term.length });
            idx = text.indexOf(search, idx + 1);
          }
        });
        if (dispatch && matches.length > 0) {
          // Replace in reverse to keep positions valid
          for (let i = matches.length - 1; i >= 0; i--) {
            tr.replaceWith(matches[i].from, matches[i].to, editor.state.schema.text(replace));
          }
        }
        return matches.length > 0;
      },
    } as any;
  },
});

// ─── Toolbar Button ───────────────────────────────────────────────────────────

const ToolbarButton: React.FC<{
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}> = ({ onClick, active, disabled, title, children }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={title}
    style={{
      padding: '4px 8px',
      fontSize: '13px',
      fontWeight: active ? 700 : 400,
      backgroundColor: active ? '#ede9fe' : 'transparent',
      color: active ? '#7c3aed' : '#374151',
      border: '1px solid transparent',
      borderRadius: '4px',
      cursor: disabled ? 'default' : 'pointer',
      opacity: disabled ? 0.4 : 1,
      lineHeight: 1,
    }}
  >
    {children}
  </button>
);

const Divider = () => <span style={{ width: '1px', backgroundColor: '#d1d5db', margin: '0 4px', alignSelf: 'stretch' }} />;

// ─── Search Bar ───────────────────────────────────────────────────────────────

const SearchBar: React.FC<{ editor: ReturnType<typeof useEditor>; onClose: () => void }> = ({ editor, onClose }) => {
  const [search, setSearch] = useState('');
  const [replace, setReplace] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const updateSearch = (term: string) => {
    setSearch(term);
    if (editor) {
      (editor.commands as any).setSearchTerm(term);
    }
  };

  const handleReplace = () => {
    if (editor) {
      editor.extensionStorage.searchReplace.replaceTerm = replace;
      (editor.commands as any).replaceNext();
      (editor.commands as any).setSearchTerm(search); // refresh highlights
    }
  };

  const handleReplaceAll = () => {
    if (editor) {
      editor.extensionStorage.searchReplace.replaceTerm = replace;
      (editor.commands as any).replaceAll();
      (editor.commands as any).setSearchTerm(search); // refresh highlights
    }
  };

  const results = editor?.extensionStorage?.searchReplace?.results || 0;

  return (
    <div style={{
      display: 'flex',
      gap: '6px',
      padding: '6px 8px',
      borderBottom: '1px solid #e5e7eb',
      backgroundColor: '#fefce8',
      alignItems: 'center',
      flexWrap: 'wrap',
    }}>
      <input
        ref={inputRef}
        type="text"
        placeholder="Find..."
        value={search}
        onChange={e => updateSearch(e.target.value)}
        onKeyDown={e => { if (e.key === 'Escape') { updateSearch(''); onClose(); } }}
        style={{ padding: '3px 6px', fontSize: '12px', border: '1px solid #d1d5db', borderRadius: '4px', width: '140px' }}
      />
      <input
        type="text"
        placeholder="Replace..."
        value={replace}
        onChange={e => setReplace(e.target.value)}
        style={{ padding: '3px 6px', fontSize: '12px', border: '1px solid #d1d5db', borderRadius: '4px', width: '140px' }}
      />
      <button onClick={handleReplace} style={{ padding: '3px 8px', fontSize: '11px', backgroundColor: '#e5e7eb', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
        Replace
      </button>
      <button onClick={handleReplaceAll} style={{ padding: '3px 8px', fontSize: '11px', backgroundColor: '#e5e7eb', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
        All
      </button>
      {search && <span style={{ fontSize: '11px', color: '#6b7280' }}>{results} found</span>}
      <button onClick={() => { updateSearch(''); onClose(); }} style={{ padding: '3px 6px', fontSize: '11px', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
        &times;
      </button>
    </div>
  );
};

// ─── Toolbar ──────────────────────────────────────────────────────────────────

const Toolbar: React.FC<{
  editor: ReturnType<typeof useEditor>;
  sourceMode: boolean;
  onToggleSource: () => void;
  charCount: { characters: number; words: number } | null;
}> = ({ editor, sourceMode, onToggleSource, charCount }) => {
  const [showSearch, setShowSearch] = useState(false);

  const handleImageUpload = useCallback(() => {
    if (!editor) return;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpeg,image/png,image/gif,image/webp,image/svg+xml';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const formData = new FormData();
      formData.append('image', file);
      try {
        const res = await fetch('/api/admin/transcript-images', { method: 'POST', credentials: 'include', body: formData });
        const data = await res.json();
        if (data.success && data.url) {
          editor.chain().focus().setImage({ src: data.url, alt: file.name }).run();
        } else {
          alert(`Upload failed: ${data.error || 'Unknown error'}`);
        }
      } catch (err: any) {
        alert(`Upload error: ${err.message}`);
      }
    };
    input.click();
  }, [editor]);

  const handleLink = useCallback(() => {
    if (!editor) return;
    const prev = editor.getAttributes('link').href || '';
    const url = prompt('Enter URL:', prev);
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }
  }, [editor]);

  const setFontSize = useCallback((size: string) => {
    if (!editor) return;
    if (size === '') {
      (editor.commands as any).unsetFontSize();
    } else {
      (editor.commands as any).setFontSize(size);
    }
  }, [editor]);

  const setColor = useCallback((color: string) => {
    if (!editor) return;
    if (color === '') {
      editor.chain().focus().unsetColor().run();
    } else {
      editor.chain().focus().setColor(color).run();
    }
  }, [editor]);

  const setHighlight = useCallback((color: string) => {
    if (!editor) return;
    if (color === '') {
      editor.chain().focus().unsetHighlight().run();
    } else {
      editor.chain().focus().setHighlight({ color }).run();
    }
  }, [editor]);

  if (!editor) return null;

  return (
    <>
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '2px',
        padding: '6px 8px',
        borderBottom: '1px solid #e5e7eb',
        backgroundColor: '#f9fafb',
        alignItems: 'center',
      }}>
        {!sourceMode && (
          <>
            {/* Font Size */}
            <select
              onChange={e => setFontSize(e.target.value)}
              value=""
              title="Font size"
              style={{ padding: '2px 4px', fontSize: '12px', border: '1px solid #d1d5db', borderRadius: '4px', backgroundColor: 'white', width: '55px' }}
            >
              <option value="" disabled>Size</option>
              <option value="">Default</option>
              <option value="12px">12</option>
              <option value="14px">14</option>
              <option value="16px">16</option>
              <option value="18px">18</option>
              <option value="20px">20</option>
              <option value="24px">24</option>
              <option value="28px">28</option>
              <option value="32px">32</option>
            </select>

            <Divider />

            {/* Basic formatting */}
            <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold">
              <strong>B</strong>
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic">
              <em>I</em>
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Underline">
              <span style={{ textDecoration: 'underline' }}>U</span>
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Strikethrough">
              <s>S</s>
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleSuperscript().run()} active={editor.isActive('superscript')} title="Superscript">
              X<sup style={{ fontSize: '0.7em' }}>2</sup>
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleSubscript().run()} active={editor.isActive('subscript')} title="Subscript">
              X<sub style={{ fontSize: '0.7em' }}>2</sub>
            </ToolbarButton>

            <Divider />

            {/* Colors */}
            <label title="Text color" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', color: '#374151', marginRight: '2px' }}>A</span>
              <input type="color" value={editor.getAttributes('textStyle').color || '#000000'} onChange={e => setColor(e.target.value)}
                style={{ width: '20px', height: '20px', border: 'none', padding: 0, cursor: 'pointer', backgroundColor: 'transparent' }} />
            </label>
            <label title="Highlight color" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', backgroundColor: '#fef08a', padding: '0 2px', borderRadius: '2px', marginRight: '2px' }}>H</span>
              <input type="color" value="#fef08a" onChange={e => setHighlight(e.target.value)}
                style={{ width: '20px', height: '20px', border: 'none', padding: 0, cursor: 'pointer', backgroundColor: 'transparent' }} />
            </label>

            <Divider />

            {/* Headings */}
            <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })} title="Heading 1">H1</ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="Heading 2">H2</ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="Heading 3">H3</ToolbarButton>

            <Divider />

            {/* Alignment */}
            <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} title="Align left">
              &#8676;
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="Align center">
              &#8596;
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} title="Align right">
              &#8677;
            </ToolbarButton>

            <Divider />

            {/* Lists & blocks */}
            <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet List">&bull; List</ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Numbered List">1. List</ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Blockquote">&ldquo;</ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')} title="Code Block">{'</>'}</ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Horizontal Rule">&mdash;</ToolbarButton>

            <Divider />

            {/* Media & links */}
            <ToolbarButton onClick={handleImageUpload} title="Insert Image">Img</ToolbarButton>
            <ToolbarButton onClick={handleLink} active={editor.isActive('link')} title="Insert/Edit Link">Link</ToolbarButton>

            <Divider />

            {/* Undo/Redo */}
            <ToolbarButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo">Undo</ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo">Redo</ToolbarButton>

            <Divider />

            {/* Find & Replace */}
            <ToolbarButton onClick={() => setShowSearch(!showSearch)} active={showSearch} title="Find & Replace">Find</ToolbarButton>
          </>
        )}

        {/* Right side: char count + HTML toggle */}
        <div style={{ flex: 1 }} />
        {charCount && !sourceMode && (
          <span style={{ fontSize: '10px', color: '#9ca3af', marginRight: '6px' }}>
            {charCount.characters.toLocaleString()} chars &middot; {charCount.words.toLocaleString()} words
          </span>
        )}
        <ToolbarButton onClick={onToggleSource} active={sourceMode} title={sourceMode ? 'Switch to visual editor' : 'Edit HTML source'}>
          {sourceMode ? 'Visual' : 'HTML'}
        </ToolbarButton>
      </div>

      {showSearch && !sourceMode && <SearchBar editor={editor} onClose={() => setShowSearch(false)} />}
    </>
  );
};

// ─── Editor Component ─────────────────────────────────────────────────────────

const RichTextEditor: React.FC<RichTextEditorProps> = ({ content, onChange, placeholder }) => {
  const [sourceMode, setSourceMode] = useState(false);
  const [sourceHtml, setSourceHtml] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const editorRef = useRef<ReturnType<typeof useEditor>>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      FontSize,
      FontFamily,
      Color,
      Highlight.configure({ multicolor: true }),
      Underline,
      Superscript,
      Subscript,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Link.configure({ openOnClick: false }),
      ImageResize.configure({ inline: false, allowBase64: false }),
      Placeholder.configure({ placeholder: placeholder || 'Start typing...' }),
      CharacterCount,
      Typography,
      SearchReplace,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        style: 'outline: none; min-height: 400px; padding: 16px; font-size: 14px; line-height: 1.7;',
      },
      handleDrop: (_view, event, _slice, moved) => {
        if (!moved && event.dataTransfer?.files?.length) {
          const file = event.dataTransfer.files[0];
          if (!file.type.startsWith('image/')) return false;
          event.preventDefault();
          const formData = new FormData();
          formData.append('image', file);
          fetch('/api/admin/transcript-images', { method: 'POST', credentials: 'include', body: formData })
            .then(res => res.json())
            .then(data => {
              if (data.success && data.url) {
                editorRef.current?.chain().focus().setImage({ src: data.url, alt: file.name }).run();
              }
            })
            .catch(err => console.error('Drop upload failed:', err));
          return true;
        }
        return false;
      },
      handlePaste: (_view, event) => {
        const items = event.clipboardData?.items;
        if (!items) return false;
        for (const item of Array.from(items)) {
          if (item.type.startsWith('image/')) {
            event.preventDefault();
            const file = item.getAsFile();
            if (!file) continue;
            const formData = new FormData();
            formData.append('image', file);
            fetch('/api/admin/transcript-images', { method: 'POST', credentials: 'include', body: formData })
              .then(res => res.json())
              .then(data => {
                if (data.success && data.url) {
                  editorRef.current?.chain().focus().setImage({ src: data.url, alt: 'Pasted image' }).run();
                }
              })
              .catch(err => console.error('Paste upload failed:', err));
            return true;
          }
        }
        return false;
      },
    },
  });

  editorRef.current = editor;

  const charCount = editor ? {
    characters: editor.storage.characterCount.characters(),
    words: editor.storage.characterCount.words(),
  } : null;

  const handleToggleSource = useCallback(() => {
    if (!editor) return;
    if (!sourceMode) {
      setSourceHtml(editor.getHTML());
      setSourceMode(true);
    } else {
      editor.commands.setContent(sourceHtml);
      onChange(sourceHtml);
      setSourceMode(false);
    }
  }, [editor, sourceMode, sourceHtml, onChange]);

  const handleSourceChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSourceHtml(e.target.value);
    onChange(e.target.value);
  }, [onChange]);

  useEffect(() => {
    if (sourceMode && textareaRef.current) textareaRef.current.focus();
  }, [sourceMode]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <Toolbar editor={editor} sourceMode={sourceMode} onToggleSource={handleToggleSource} charCount={charCount} />

      {sourceMode ? (
        <textarea
          ref={textareaRef}
          value={sourceHtml}
          onChange={handleSourceChange}
          spellCheck={false}
          style={{
            flex: 1, padding: '16px', fontFamily: 'monospace', fontSize: '12px',
            lineHeight: '1.6', border: 'none', resize: 'none', outline: 'none',
            overflowY: 'auto', backgroundColor: '#1f2937', color: '#e5e7eb',
          }}
        />
      ) : (
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <EditorContent editor={editor} />
        </div>
      )}

      <style>{`
        .tiptap { outline: none; }
        .tiptap p { margin: 0.5em 0; }
        .tiptap h1 { font-size: 1.8em; font-weight: 700; margin: 0.8em 0 0.4em; }
        .tiptap h2 { font-size: 1.4em; font-weight: 600; margin: 0.7em 0 0.3em; }
        .tiptap h3 { font-size: 1.15em; font-weight: 600; margin: 0.6em 0 0.3em; }
        .tiptap ul, .tiptap ol { padding-left: 1.5em; margin: 0.5em 0; }
        .tiptap blockquote {
          border-left: 3px solid #d1d5db; padding-left: 12px;
          margin: 0.5em 0; color: #6b7280; font-style: italic;
        }
        .tiptap code { background: #f3f4f6; padding: 2px 4px; border-radius: 3px; font-size: 0.9em; }
        .tiptap pre { background: #1f2937; color: #e5e7eb; padding: 12px; border-radius: 6px; overflow-x: auto; margin: 0.5em 0; }
        .tiptap pre code { background: none; padding: 0; color: inherit; }
        .tiptap img { max-width: 100%; height: auto; border-radius: 4px; margin: 0.5em 0; }
        .tiptap img.ProseMirror-selectednode { outline: 2px solid #7c3aed; outline-offset: 2px; }
        .tiptap hr { border: none; border-top: 1px solid #e5e7eb; margin: 1em 0; }
        .tiptap a { color: #7c3aed; text-decoration: underline; cursor: pointer; }
        .tiptap p.is-editor-empty:first-child::before {
          content: attr(data-placeholder); float: left; color: #adb5bd;
          pointer-events: none; height: 0;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;
