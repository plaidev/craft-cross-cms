# @craft-cross-cms/rich-text-core

## 0.0.3

### Patch Changes

- b7dabb5: Fix tiptap extension module augmentations not propagating to consumers.

  Re-export Options types from each tiptap extension package via `export type` in `src/index.ts`. This forces tsup's DTS bundler to preserve external references in `dist/index.d.ts`, allowing consumer TypeScript to load extension `.d.ts` files and enable command types such as `editor.chain().toggleBold()`.

## 0.0.2

### Patch Changes

- 82b0dc6: Fix TypeScript type errors in cmsImage tests
