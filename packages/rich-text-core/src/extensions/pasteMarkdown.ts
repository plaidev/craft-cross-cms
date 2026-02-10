import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';

export interface PasteMarkdownOptions {
  /**
   * Whether to transform pasted text as Markdown
   * @default true
   */
  transformPastedText: boolean;
}

export const PasteMarkdown = Extension.create<PasteMarkdownOptions>({
  name: 'pasteMarkdown',

  addOptions() {
    return {
      transformPastedText: true,
    };
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('pasteMarkdown'),
        props: {
          handlePaste: (_view, event) => {
            if (!this.options.transformPastedText) {
              return false;
            }

            const text = event.clipboardData?.getData('text/plain');
            if (!text) {
              return false;
            }

            if (!looksLikeMarkdown(text)) {
              return false;
            }

            try {
              // Requires @tiptap/markdown extension to be registered.
              // If not available, fall back to default paste behavior.
              if (!this.editor.markdown || typeof this.editor.markdown.parse !== 'function') {
                return false;
              }

              const json = this.editor.markdown.parse(text);

              event.preventDefault();

              this.editor.commands.insertContent(json);
              return true;
            } catch (error) {
              console.error('Failed to parse pasted Markdown:', error);
              return false;
            }
          },
        },
      }),
    ];
  },

  addStorage() {
    return {};
  },
});

/**
 * Checks if the given text looks like Markdown content.
 * Returns true if any of the common Markdown patterns are found.
 */
export function looksLikeMarkdown(text: string): boolean {
  const patterns = [
    /^#{1,6}\s/m, // Headings: # ## ###
    /^[-*+]\s/m, // Unordered list: - * +
    /^\d+\.\s/m, // Ordered list: 1. 2.
    /^>\s/m, // Blockquote: >
    /```/, // Code block: ```
    /\*\*[^*]+\*\*/, // Bold: **text**
    /\*[^*]+\*/, // Italic: *text*
    /\[.+\]\(.+\)/, // Link: [text](url)
    /^---+$/m, // Horizontal rule: ---
    /\|.+\|/, // Table: | cell | cell |
  ];

  return patterns.some((pattern) => pattern.test(text));
}
