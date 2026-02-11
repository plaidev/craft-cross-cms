---
'@craft-cross-cms/rich-text-core': patch
---

Enable tree-shaking for constant-only imports by switching tsup to unbundled output, adding sideEffects: false, and re-exporting light utilities directly from their source module to avoid pulling in tiptap dependencies.
