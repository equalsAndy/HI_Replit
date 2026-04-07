import { Node, mergeAttributes } from '@tiptap/react';

/**
 * Tiptap VariableNode extension — renders Handlebars variables as inline chips.
 * Non-editable, visually distinct, inserted via the VariablePicker toolbar button.
 */
export const VariableNode = Node.create({
  name: 'variableNode',
  group: 'inline',
  inline: true,
  atom: true, // non-editable — treated as a single unit
  marks: '_', // allow all marks (bold, italic, etc.) — formatting carries into sent email

  addAttributes() {
    return {
      variableKey: {
        default: null,
        parseHTML: (element: HTMLElement) => element.getAttribute('data-variable-key'),
        renderHTML: (attributes: Record<string, any>) => ({
          'data-variable-key': attributes.variableKey,
        }),
      },
      variableName: {
        default: null,
        parseHTML: (element: HTMLElement) => element.getAttribute('data-variable-name'),
        renderHTML: (attributes: Record<string, any>) => ({
          'data-variable-name': attributes.variableName,
        }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'span[data-variable-key]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(HTMLAttributes, {
        class: 'variable-node',
        style:
          'display: inline-block; background: #ede9fe; color: #6d28d9; border: 1px solid #c4b5fd; border-radius: 4px; padding: 1px 6px; font-size: 0.85em; font-family: monospace; cursor: default; user-select: all;',
        contenteditable: 'false',
      }),
      `{{${HTMLAttributes['data-variable-key']}}}`,
    ];
  },

  // When serializing to HTML for email sending, output the Handlebars syntax
  renderText({ node }) {
    return `{{${node.attrs.variableKey}}}`;
  },

  addCommands() {
    return {
      insertVariable:
        (attrs: { variableKey: string; variableName: string }) =>
        ({ commands }: any) => {
          return commands.insertContent({
            type: this.name,
            attrs,
          });
        },
    } as any;
  },
});
