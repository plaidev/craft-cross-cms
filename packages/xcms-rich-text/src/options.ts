// rich text editorで利用可能な機能を全て列挙。
export const RICH_TEXT_EDITOR_OPTIONS = {
  // NODE OPTIONS
  PARAGRAPH: 'paragraph',
  H1: 'h1',
  H2: 'h2',
  H3: 'h3',
  H4: 'h4',
  H5: 'h5',
  H6: 'h6',
  BULLET_LIST: 'bullet-list',
  ORDERED_LIST: 'ordered-list',
  CODE_BLOCK: 'code-block',
  BLOCKQUOTE: 'blockquote',
  HORIZONTAL_RULE: 'horizontal-rule',
  IMAGE: 'image',
  TABLE: 'table',

  // MARK OPTIONS
  BOLD: 'bold',
  ITALIC: 'italic',
  STRIKE: 'strike',
  CODE: 'code',
  UNDERLINE: 'underline',
  LINK: 'link',
  SUPERSCRIPT: 'superscript',
  SUBSCRIPT: 'subscript',
  HIGHLIGHT: 'highlight',
  CUSTOM_CLASS: 'custom-class',

  // Functional
  TEXT_ALIGN: 'text-align',
  AI_GENERATION: 'ai-generation',
  EMBED: 'embed',

  // SYSTEM OPTIONS
  UNDO: 'undo',
  REDO: 'redo',
  UNSET_ALL_MARKS: 'unset-all-marks',
} as const;

export type RichTextEditorOptions =
  (typeof RICH_TEXT_EDITOR_OPTIONS)[keyof typeof RICH_TEXT_EDITOR_OPTIONS];
