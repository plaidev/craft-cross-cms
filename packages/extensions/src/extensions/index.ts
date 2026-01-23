import { type Extensions, type NodeConfig } from '@tiptap/core';
import { Blockquote } from '@tiptap/extension-blockquote';
import { Bold } from '@tiptap/extension-bold';
import { Code } from '@tiptap/extension-code';
import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight';
import { Document } from '@tiptap/extension-document';
import { HardBreak } from '@tiptap/extension-hard-break';
import { Heading } from '@tiptap/extension-heading';
import { Highlight } from '@tiptap/extension-highlight';
import { HorizontalRule } from '@tiptap/extension-horizontal-rule';
import { Italic } from '@tiptap/extension-italic';
import { Link } from '@tiptap/extension-link';
import { BulletList, ListItem, ListKeymap, OrderedList } from '@tiptap/extension-list';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Strike } from '@tiptap/extension-strike';
import { Subscript } from '@tiptap/extension-subscript';
import { Superscript } from '@tiptap/extension-superscript';
import { TableKit } from '@tiptap/extension-table';
import { Text } from '@tiptap/extension-text';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyleKit } from '@tiptap/extension-text-style';
import { Underline } from '@tiptap/extension-underline';
import { CharacterCount, Dropcursor, TrailingNode, UndoRedo } from '@tiptap/extensions';
import { Markdown } from '@tiptap/markdown';
import { all, createLowlight } from 'lowlight';
import type { AssetData } from '../types/asset.js';
import { CLASS_NAME_PATTERN, isValidClassName } from './classNameValidator.js';
import { EmbedRenderer, generateCmsEmbedExtension } from './cmsEmbed.js';
import { generateCmsImage, type ResolveAssetFn } from './cmsImage.js';
import { CustomClass } from './customClass.js';
import { PasteMarkdown } from './pasteMarkdown.js';

export { CLASS_NAME_PATTERN, CustomClass, isValidClassName };
export type { ResolveAssetFn };

const TIPTAP_BASE_EXTENSIONS: Extensions = [
  TextStyleKit.configure({
    fontFamily: {
      types: [],
    },
    fontSize: {
      types: [],
    },
    color: {
      types: [],
    },
    backgroundColor: {
      types: [],
    },
  }),
  Heading.configure({
    levels: [1, 2, 3, 4, 5, 6],
  }),
  Underline,
  Bold,
  BulletList.configure({
    keepMarks: true,
    keepAttributes: true,
  }),
  OrderedList.configure({
    keepMarks: true,
    keepAttributes: true,
  }),
  ListItem,
  Italic,
  Strike,
  Paragraph,
  Code,
  Blockquote,
  HorizontalRule,
  HardBreak,
  Link.configure({
    openOnClick: false,
    defaultProtocol: 'https',
    protocols: ['http', 'https'],
    isAllowedUri: (
      url,
      ctx: {
        defaultProtocol: string;
        defaultValidate: (href: string) => boolean;
        protocols: (string | { scheme: string })[];
      },
    ) => {
      try {
        if (
          typeof url !== 'string' ||
          typeof ctx !== 'object' ||
          ctx === null ||
          typeof ctx.defaultProtocol !== 'string'
        ) {
          return false;
        }

        const parsedUrl = url.includes(':')
          ? new URL(url)
          : new URL(`${ctx.defaultProtocol}://${url}`);

        if (!ctx.defaultValidate(parsedUrl.href)) {
          return false;
        }

        const protocol = parsedUrl.protocol.replace(':', '');

        const allowedProtocols = ctx.protocols.map((p) => (typeof p === 'string' ? p : p.scheme));

        if (!allowedProtocols.includes(protocol)) {
          return false;
        }
        return true;
      } catch {
        return false;
      }
    },
  }),
  TextAlign.configure({
    types: ['heading', 'paragraph'],
  }),
  TableKit.configure({
    table: {},
    tableHeader: {},
    tableRow: {},
    tableCell: {},
  }),
  CharacterCount,
  CodeBlockLowlight.configure({
    lowlight: createLowlight(all),
  }),
  Superscript,
  Subscript,
  Highlight,
  Markdown,
  PasteMarkdown,
  ListKeymap,
  UndoRedo,
  Dropcursor,
  Document,
  TrailingNode,
  Text,
];

export const buildTiptapExtensions = ({
  resolveAsset,
  embedRenderer,
  imageRenderer,
}: {
  resolveAsset?: (assetId: string) => AssetData | null;
  embedRenderer?: EmbedRenderer;
  imageRenderer?: NodeConfig['addNodeView'];
}): Extensions => {
  return [
    ...TIPTAP_BASE_EXTENSIONS,
    CustomClass,
    generateCmsImage({ resolveAsset, imageRenderer }),
    generateCmsEmbedExtension({
      renderer: embedRenderer,
    }),
  ];
};
