// Tiptap core re-exports
export { Editor, generateHTML, generateJSON, generateText, getSchema } from '@tiptap/core';
export type { Extensions, HTMLContent, JSONContent } from '@tiptap/core';

// Tiptap PM re-exports
export { Slice } from '@tiptap/pm/model';

// Re-export extension types to include their module augmentations in DTS output
export type { BlockquoteOptions } from '@tiptap/extension-blockquote';
export type { BoldOptions } from '@tiptap/extension-bold';
export type { CodeOptions } from '@tiptap/extension-code';
export type { CodeBlockLowlightOptions } from '@tiptap/extension-code-block-lowlight';
export type { HeadingOptions } from '@tiptap/extension-heading';
export type { HighlightOptions } from '@tiptap/extension-highlight';
export type { HorizontalRuleOptions } from '@tiptap/extension-horizontal-rule';
export type { ItalicOptions } from '@tiptap/extension-italic';
export type { LinkOptions } from '@tiptap/extension-link';
export type { BulletListOptions, OrderedListOptions } from '@tiptap/extension-list';
export type { StrikeOptions } from '@tiptap/extension-strike';
export type { SubscriptExtensionOptions } from '@tiptap/extension-subscript';
export type { SuperscriptExtensionOptions } from '@tiptap/extension-superscript';
export type { TableKitOptions } from '@tiptap/extension-table';
export type { TextAlignOptions } from '@tiptap/extension-text-align';
export type { UnderlineOptions } from '@tiptap/extension-underline';
export type { CharacterCountOptions, CharacterCountStorage } from '@tiptap/extensions';
export type { MarkdownExtensionOptions, MarkdownExtensionStorage } from '@tiptap/markdown';

// Extensions
export {
  CLASS_NAME_PATTERN,
  CustomClass,
  buildTiptapExtensions,
  isValidClassName,
} from './extensions/index.js';
export type { ResolveAssetFn } from './extensions/index.js';

// Options
export { RICH_TEXT_EDITOR_OPTIONS, type RichTextEditorOptions } from './options.js';
