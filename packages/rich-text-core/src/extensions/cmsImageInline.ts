import { NodeConfig, Node as TiptapNode, mergeAttributes } from '@tiptap/core';
import type { AssetData } from '../types/asset.js';

export type ResolveAssetFn = (assetId: string) => AssetData | null;

export function generateCmsImageInline({
  resolveAsset,
  imageRenderer,
}: {
  resolveAsset?: ResolveAssetFn;
  imageRenderer?: NodeConfig['addNodeView'];
}) {
  const config: NodeConfig = {
    name: 'cmsImageInline',
    inline: true,
    group: 'inline',
    atom: true,
    draggable: true,
    marks: '_',

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
          priority: 60,
          getAttrs: (element) => {
            if (element.parentElement?.tagName === 'A') return {};
            return false;
          },
        },
      ];
    },

    renderHTML({ node, HTMLAttributes }) {
      if (!resolveAsset) {
        return [
          'img',
          mergeAttributes(HTMLAttributes, {
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
      const imageNode = helpers.createNode('cmsImageInline', {
        id: token.id,
        'data-asset-id': token.id,
      });
      imageNode.marks = [{ type: 'link', attrs: { href: token.href } }];
      return helpers.createNode('paragraph', {}, [imageNode]);
    },

    renderMarkdown(node) {
      const id = node.attrs?.id;
      if (typeof id !== 'string') {
        return '';
      }
      const linkMark = node.marks?.find((m) => m.type === 'link');
      const href = linkMark?.attrs?.href;
      if (typeof href === 'string' && href.length > 0) {
        return `[![image](${id})](${href})`;
      }
      return `![image](${id})`;
    },

    markdownTokenizer: {
      name: 'cmsImageInline',
      level: 'block',
      start(src) {
        return src.indexOf('[![image](');
      },
      tokenize(src) {
        const rule = /^\[!\[image\]\(([a-z0-9]+)\)\]\(([^)]+)\)/;
        const match = rule.exec(src);

        if (!match) {
          return undefined;
        }

        return {
          type: 'cmsImageInline',
          raw: match[0],
          id: match[1],
          href: match[2],
        };
      },
    },
  };

  if (imageRenderer) {
    config.addNodeView = imageRenderer;
  }

  return TiptapNode.create(config);
}
