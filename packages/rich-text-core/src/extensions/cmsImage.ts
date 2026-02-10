import {
  NodeConfig,
  Node as TiptapNode,
  mergeAttributes,
  nodeInputRule,
  nodePasteRule,
} from '@tiptap/core';
import type { AssetData } from '../types/asset.js';

export type ResolveAssetFn = (assetId: string) => AssetData | null;

// Markdown syntax for CMS images: ![image](assetId)
// Uses asset ID instead of URL because images are managed by CMS MediaLibrary.
// inputRegex: has outer capture group for nodeInputRule, so id is match[2]
// pasteRegex: no outer capture group for nodePasteRule, so id is match[1]
const inputRegex = /(?:^|\s)(!\[image\]\(([a-z0-9]+)\))$/;
const pasteRegex = /!\[image\]\(([a-z0-9]+)\)/g;

export function generateCmsImage({
  resolveAsset,
  imageRenderer,
}: {
  resolveAsset?: ResolveAssetFn;
  imageRenderer?: NodeConfig['addNodeView'];
}) {
  const config: NodeConfig = {
    name: 'cmsImage',
    inline: false,
    group: 'block',
    atom: true,
    draggable: true,

    addAttributes() {
      return {
        ...this.parent?.(),
        id: {
          default: null,
          parseHTML: (element) => element.getAttribute('data-asset-id'),
          renderHTML: ({ id }) => ({ 'data-asset-id': id }),
        },
        src: {
          default: null,
          parseHTML: (element) => element.getAttribute('src'),
          renderHTML: ({ src }) => ({ src }),
        },
        alt: {
          default: null,
          parseHTML: (element) => element.getAttribute('alt'),
          renderHTML: ({ alt }) => ({ alt }),
        },
        width: {
          default: null,
          parseHTML: (element) => element.getAttribute('width'),
          renderHTML: ({ width }) => ({ width }),
        },
        height: {
          default: null,
          parseHTML: (element) => element.getAttribute('height'),
          renderHTML: ({ height }) => ({ height }),
        },
      };
    },

    parseHTML() {
      return [
        {
          tag: 'img[data-asset-id]',
        },
      ];
    },

    renderHTML({ node, HTMLAttributes }) {
      if (!resolveAsset) {
        return [
          'img',
          mergeAttributes(HTMLAttributes, {
            // When imageRenderer is set, requests may still be triggered here, so we set src to empty if imageRenderer exists
            src: imageRenderer ? node.attrs.src : '',
            alt: node.attrs.alt,
            width: node.attrs.width,
            height: node.attrs.height,
            'data-asset-id': node.attrs.id,
          }),
        ];
      }

      const assetId = node.attrs.id as string | null;
      const asset = assetId ? resolveAsset(assetId) : null;

      if (!asset) {
        return [
          'img',
          mergeAttributes(HTMLAttributes, {
            src: '',
          }),
        ];
      }

      return [
        'img',
        mergeAttributes(HTMLAttributes, {
          src: asset?.file.src ?? '',
          alt: asset?.altText ?? '',
          width: asset?.file.width,
          height: asset?.file.height,
          'data-asset-id': asset?.id ?? '',
        }),
      ];
    },

    parseMarkdown(token, helpers) {
      return helpers.createNode('cmsImage', {
        id: token.id,
        'data-asset-id': token.id,
      });
    },

    renderMarkdown(node) {
      const id = node.attrs?.id;
      if (typeof id !== 'string') {
        return '';
      }
      return `![image](${id})\n\n`;
    },

    markdownTokenizer: {
      name: 'cmsImage',
      level: 'block',
      start(src) {
        return src.indexOf('![image](');
      },
      tokenize(src) {
        const rule = /^!\[image\]\(([a-z0-9]+)\)/;
        const match = rule.exec(src);

        if (!match) {
          return undefined;
        }

        return {
          type: 'cmsImage',
          raw: match[0],
          id: match[1],
        };
      },
    },

    addInputRules() {
      return [
        nodeInputRule({
          find: inputRegex,
          type: this.type,
          getAttributes: (match) => {
            return { id: match[2] };
          },
        }),
      ];
    },

    addPasteRules() {
      return [
        nodePasteRule({
          find: pasteRegex,
          type: this.type,
          getAttributes: (match) => {
            return { id: match[1] };
          },
        }),
      ];
    },
  };

  if (imageRenderer) {
    config.addNodeView = imageRenderer;
  }

  return TiptapNode.create(config);
}
