---
'@craft-cross-cms/rich-text-core': patch
---

Add `@craft-cross-cms/rich-text-core/server` subpath for Node.js usage. `generateJSON` / `generateHTML` can now be used server-side without manually setting up a DOM environment such as jsdom.
