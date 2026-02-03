import { NodeConfig, Node as TiptapNode, mergeAttributes } from '@tiptap/core';

interface SetEmbedOptions {
  html: string;
  url: string;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    embed: {
      setEmbed: (options: SetEmbedOptions) => ReturnType;
      removeEmbed: () => ReturnType;
    };
  }
}

export type EmbedRenderer = NodeConfig['addNodeView'];

export function generateCmsEmbedExtension({ renderer }: { renderer?: EmbedRenderer }) {
  const config: NodeConfig = {
    name: 'embed',
    group: 'block',
    atom: true,

    addAttributes() {
      return {
        type: {
          default: 'embed',
          parseHTML: (element) => element.getAttribute('data-type'),
          renderHTML: (attributes) => ({
            'data-type': attributes.type,
          }),
        },
        url: {
          default: '',
          parseHTML: (element) => element.getAttribute('data-url'),
          renderHTML: (attributes) => ({
            'data-url': attributes.url,
          }),
        },
        // Stores the actual embed HTML (e.g., iframe from OEmbed providers).
        // Tiptap's renderHTML() requires DOMOutputSpec, so actual embed HTML cannot be
        // rendered as child nodes. Instead, we store it as a data attribute and replace
        // it with actual HTML during final output (via replaceEmbedElements on server).
        embedHtml: {
          default: '',
          parseHTML: (element) => {
            return element.innerHTML;
          },
          renderHTML: (attributes) => {
            if (attributes.embedHtml) {
              return {
                'data-embed-html': attributes.embedHtml,
              };
            }
            return {};
          },
        },
      };
    },

    renderHTML(props) {
      const { HTMLAttributes } = props;
      if (HTMLAttributes['data-embed-html']) {
        return [
          'div',
          mergeAttributes(HTMLAttributes, {
            'data-type': 'embed',
          }),
        ];
      }

      // When rendering on frontend, embedHtml may not be available, but DomOutputSpec must always be returned,
      // so we return a placeholder tag. In actual frontend rendering, addNodeView will be called instead.
      return [
        'div',
        mergeAttributes(HTMLAttributes, {
          'data-type': 'embed',
          class: 'embed-placeholder',
        }),
        ['div', { class: 'embed-content' }, 'Embed Content Placeholder'],
      ];
    },

    addCommands() {
      return {
        setEmbed:
          (options: SetEmbedOptions) =>
          ({ commands }) => {
            return commands.insertContent({
              type: this.name,
              attrs: {
                type: 'embed',
                url: options.url,
                embedHtml: options.html,
              },
            });
          },
        removeEmbed:
          () =>
          ({ commands }) => {
            return commands.deleteNode(this.name);
          },
      };
    },
  };

  if (renderer) {
    config.addNodeView = renderer;
  }

  return TiptapNode.create(config);
}
