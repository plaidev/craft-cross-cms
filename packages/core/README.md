# @craft-cross-cms/rich-text-core

TipTap-based rich text core for Craft Cross CMS.

## Installation

```bash
npm install @craft-cross-cms/rich-text-core
```

or

```bash
pnpm add @craft-cross-cms/rich-text-core
```

or

```bash
yarn add @craft-cross-cms/rich-text-core
```

## Usage

### Basic Setup

```typescript
import { Editor } from '@tiptap/core';
import { buildTiptapExtensions } from '@craft-cross-cms/rich-text-core';

const editor = new Editor({
  element: document.querySelector('#editor'),
  extensions: buildTiptapExtensions({}),
  content: '<p>Hello World!</p>',
});
```

### With Asset Resolution

To use CMS images with asset IDs, provide a `resolveAsset` function:

```typescript
import { buildTiptapExtensions } from '@craft-cross-cms/rich-text-core';
import type { AssetData } from '@craft-cross-cms/rich-text-core';

const editor = new Editor({
  element: document.querySelector('#editor'),
  extensions: buildTiptapExtensions({
    resolveAsset: (assetId: string): AssetData | null => {
      // Fetch asset data from your CMS
      const asset = yourCMS.getAsset(assetId);
      if (!asset) return null;

      return asset; // Return the full AssetData object
    },
  }),
});
```

### Custom Renderers

You can provide custom renderers for images and embeds:

```typescript
import { buildTiptapExtensions } from '@craft-cross-cms/rich-text-core';

const editor = new Editor({
  element: document.querySelector('#editor'),
  extensions: buildTiptapExtensions({
    resolveAsset: (assetId) => {
      // Your asset resolution logic
    },
    imageRenderer: () => ({
      dom: document.createElement('div'),
      contentDOM: null,
      // Custom image rendering logic
    }),
    embedRenderer: ({ node, getPos, editor }) => {
      const dom = document.createElement('div');
      // Custom embed rendering logic
      return { dom };
    },
  }),
});
```

## Features

### CMS-Specific Extensions

#### CMS Image

Custom image node that uses asset IDs instead of direct URLs.

- Supports Markdown syntax: `![image](assetId)`
- Resolves assets through `resolveAsset` callback
- Optional custom rendering via `imageRenderer`

#### CMS Embed

Embed blocks for third-party content.

- Stores embed HTML and URL
- Optional custom rendering via `embedRenderer`
- Commands: `setEmbed()`, `removeEmbed()`

### Base TipTap Extensions

This package includes a comprehensive set of TipTap extensions:

- **Text Formatting**: Bold, Italic, Strike, Underline, Code, Highlight
- **Structure**: Heading (1-6), Paragraph, Blockquote, HorizontalRule
- **Lists**: BulletList, OrderedList
- **Advanced**: Table, Link (with strict URL validation), TextAlign, CodeBlock with syntax highlighting
- **Utilities**: Superscript, Subscript, CharacterCount, Markdown, UndoRedo, Dropcursor

### Custom Utilities

#### CustomClass

Extension to validate and manage custom CSS classes on nodes:

```typescript
import { isValidClassName, CLASS_NAME_PATTERN } from '@craft-cross-cms/rich-text-core';

// Validate class name
if (isValidClassName('my-class')) {
  // Valid class name
}

// Get the validation pattern
console.log(CLASS_NAME_PATTERN); // RegExp
```

#### PasteMarkdown

Enables pasting Markdown content directly into the editor.

## API Reference

### `buildTiptapExtensions(options)`

Main function to assemble all TipTap extensions.

#### Parameters

- `options.resolveAsset?: (assetId: string) => AssetData | null` - Function to resolve asset IDs to asset data
- `options.embedRenderer?: EmbedRenderer` - Custom NodeView to render embed blocks
- `options.imageRenderer?: NodeConfig['addNodeView']` - Custom NodeView to render images

#### Returns

`Extensions` - Array of configured TipTap extensions

### Types

```typescript
interface AssetData {
  id: string;
  sys: {
    createdAt: string | null;
    createdBy: string | null;
    updatedAt: string | null;
    updatedBy: string | null;
    publishedAt: string | null;
  };
  title: string;
  description: string;
  altText: string;
  tagIds: string[];
  file: {
    name: string;
    mimeType: string;
    src: string;
    size: number;
    width?: number | null;
    height?: number | null;
  };
}

type ResolveAssetFn = (assetId: string) => AssetData | null;

type EmbedRenderer = (params: {
  node: Node;
  getPos: () => number;
  editor: Editor;
}) => { dom: HTMLElement };
```

## Security

### Link Validation

The Link extension implements strict URL validation through `isAllowedUri()`:

- Only allows `http` and `https` protocols
- Validates URLs through URL constructor
- Checks protocol allowlist before accepting

## License

Apache-2.0

Copyright 2026 PLAID, Inc.
