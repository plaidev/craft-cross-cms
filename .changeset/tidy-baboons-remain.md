---
'@craft-cross-cms/rich-text-core': patch
---

Fix tiptap extension module augmentations not propagating to consumers.

Re-export Options types from each tiptap extension package via `export type` in `src/index.ts`. This forces tsup's DTS bundler to preserve external references in `dist/index.d.ts`, allowing consumer TypeScript to load extension `.d.ts` files and enable command types such as `editor.chain().toggleBold()`.
