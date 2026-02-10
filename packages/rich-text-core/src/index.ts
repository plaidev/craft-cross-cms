// Tiptap core re-exports
export { Editor, generateHTML, generateJSON, generateText, getSchema } from '@tiptap/core';
export type { Extensions, HTMLContent, JSONContent } from '@tiptap/core';

// Tiptap PM re-exports
export { Slice } from '@tiptap/pm/model';

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
