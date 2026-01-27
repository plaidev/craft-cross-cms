// Tiptap core re-exports
export { Editor, generateHTML, generateJSON, generateText } from '@tiptap/core';
export type { JSONContent, Extensions } from '@tiptap/core';

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
