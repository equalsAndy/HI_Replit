import React, { useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';

// ─── Types ────────────────────────────────────────────────────────────────────

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

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

// ─── Toolbar ──────────────────────────────────────────────────────────────────

const Toolbar: React.FC<{ editor: ReturnType<typeof useEditor> }> = ({ editor }) => {
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
        const res = await fetch('/api/admin/transcript-images', {
          method: 'POST',
          credentials: 'include',
          body: formData,
        });
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

  if (!editor) return null;

  return (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: '2px',
      padding: '6px 8px',
      borderBottom: '1px solid #e5e7eb',
      backgroundColor: '#f9fafb',
    }}>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive('bold')}
        title="Bold"
      >
        <strong>B</strong>
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive('italic')}
        title="Italic"
      >
        <em>I</em>
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        active={editor.isActive('strike')}
        title="Strikethrough"
      >
        <s>S</s>
      </ToolbarButton>

      <span style={{ width: '1px', backgroundColor: '#d1d5db', margin: '0 4px' }} />

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        active={editor.isActive('heading', { level: 1 })}
        title="Heading 1"
      >
        H1
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        active={editor.isActive('heading', { level: 2 })}
        title="Heading 2"
      >
        H2
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        active={editor.isActive('heading', { level: 3 })}
        title="Heading 3"
      >
        H3
      </ToolbarButton>

      <span style={{ width: '1px', backgroundColor: '#d1d5db', margin: '0 4px' }} />

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        active={editor.isActive('bulletList')}
        title="Bullet List"
      >
        &bull; List
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        active={editor.isActive('orderedList')}
        title="Numbered List"
      >
        1. List
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        active={editor.isActive('blockquote')}
        title="Blockquote"
      >
        &ldquo; Quote
      </ToolbarButton>

      <span style={{ width: '1px', backgroundColor: '#d1d5db', margin: '0 4px' }} />

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        active={editor.isActive('codeBlock')}
        title="Code Block"
      >
        {'</>'}
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        title="Horizontal Rule"
      >
        &mdash;
      </ToolbarButton>

      <span style={{ width: '1px', backgroundColor: '#d1d5db', margin: '0 4px' }} />

      <ToolbarButton onClick={handleImageUpload} title="Insert Image">
        Image
      </ToolbarButton>

      <span style={{ width: '1px', backgroundColor: '#d1d5db', margin: '0 4px' }} />

      <ToolbarButton
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        title="Undo"
      >
        Undo
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        title="Redo"
      >
        Redo
      </ToolbarButton>
    </div>
  );
};

// ─── Editor Component ─────────────────────────────────────────────────────────

const RichTextEditor: React.FC<RichTextEditorProps> = ({ content, onChange, placeholder }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        inline: false,
        allowBase64: false,
        HTMLAttributes: {
          style: 'max-width: 100%; height: auto; border-radius: 4px;',
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        style: 'outline: none; min-height: 400px; padding: 16px; font-size: 14px; line-height: 1.7;',
      },
      handleDrop: (view, event, _slice, moved) => {
        // Handle image drops
        if (!moved && event.dataTransfer?.files?.length) {
          const file = event.dataTransfer.files[0];
          if (!file.type.startsWith('image/')) return false;

          event.preventDefault();

          const formData = new FormData();
          formData.append('image', file);

          fetch('/api/admin/transcript-images', {
            method: 'POST',
            credentials: 'include',
            body: formData,
          })
            .then(res => res.json())
            .then(data => {
              if (data.success && data.url) {
                const { schema } = view.state;
                const coordinates = view.posAtCoords({ left: event.clientX, top: event.clientY });
                if (coordinates) {
                  const node = schema.nodes.image.create({ src: data.url, alt: file.name });
                  const transaction = view.state.tr.insert(coordinates.pos, node);
                  view.dispatch(transaction);
                }
              }
            })
            .catch(err => console.error('Drop upload failed:', err));

          return true;
        }
        return false;
      },
      handlePaste: (view, event) => {
        // Handle pasted images
        const items = event.clipboardData?.items;
        if (!items) return false;

        for (const item of Array.from(items)) {
          if (item.type.startsWith('image/')) {
            event.preventDefault();
            const file = item.getAsFile();
            if (!file) continue;

            const formData = new FormData();
            formData.append('image', file);

            fetch('/api/admin/transcript-images', {
              method: 'POST',
              credentials: 'include',
              body: formData,
            })
              .then(res => res.json())
              .then(data => {
                if (data.success && data.url) {
                  const { schema } = view.state;
                  const node = schema.nodes.image.create({ src: data.url, alt: 'Pasted image' });
                  const transaction = view.state.tr.replaceSelectionWith(node);
                  view.dispatch(transaction);
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      <Toolbar editor={editor} />
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <EditorContent
          editor={editor}
          placeholder={placeholder}
        />
      </div>
      <style>{`
        .tiptap {
          outline: none;
        }
        .tiptap p { margin: 0.5em 0; }
        .tiptap h1 { font-size: 1.8em; font-weight: 700; margin: 0.8em 0 0.4em; }
        .tiptap h2 { font-size: 1.4em; font-weight: 600; margin: 0.7em 0 0.3em; }
        .tiptap h3 { font-size: 1.15em; font-weight: 600; margin: 0.6em 0 0.3em; }
        .tiptap ul, .tiptap ol { padding-left: 1.5em; margin: 0.5em 0; }
        .tiptap blockquote {
          border-left: 3px solid #d1d5db;
          padding-left: 12px;
          margin: 0.5em 0;
          color: #6b7280;
          font-style: italic;
        }
        .tiptap code {
          background: #f3f4f6;
          padding: 2px 4px;
          border-radius: 3px;
          font-size: 0.9em;
        }
        .tiptap pre {
          background: #1f2937;
          color: #e5e7eb;
          padding: 12px;
          border-radius: 6px;
          overflow-x: auto;
          margin: 0.5em 0;
        }
        .tiptap pre code {
          background: none;
          padding: 0;
          color: inherit;
        }
        .tiptap img {
          max-width: 100%;
          height: auto;
          border-radius: 4px;
          margin: 0.5em 0;
        }
        .tiptap img.ProseMirror-selectednode {
          outline: 2px solid #7c3aed;
          outline-offset: 2px;
        }
        .tiptap hr {
          border: none;
          border-top: 1px solid #e5e7eb;
          margin: 1em 0;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;
