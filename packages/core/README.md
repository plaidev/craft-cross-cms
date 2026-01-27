# @craft-cross-cms/rich-text-core

[![License](https://img.shields.io/badge/license-Apache%202-blue)](https://github.com/plaidev/xcms-rich-text/blob/main/LICENSE)

TipTap-based rich text core for Craft Cross CMS.
This library provides HTML to JSON conversion functionality for rich text content.

## Getting Started

### Installation

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

### Usage

```typescript
import { generateJSON, buildTiptapExtensions } from '@craft-cross-cms/rich-text-core';

const html = '<p>Hello <strong>World</strong>!</p>';
const json = generateJSON(html, buildTiptapExtensions({}));

console.log(json);
// Output:
// {
//   type: 'doc',
//   content: [
//     {
//       type: 'paragraph',
//       content: [
//         { type: 'text', text: 'Hello ' },
//         { type: 'text', marks: [{ type: 'bold' }], text: 'World' },
//         { type: 'text', text: '!' }
//       ]
//     }
//   ]
// }
```

## Getting Help

- **Have a bug to report?**
  [Open a GitHub issue](https://github.com/plaidev/xcms-rich-text/issues/new). If possible, include the library version and full logs.
- **Have a feature request?**
  [Open a GitHub issue](https://github.com/plaidev/xcms-rich-text/issues/new). Tell us what the feature should do and why you want the feature.

## Contributing

Please follow our guidelines.

- [Contribution Guideline](https://github.com/plaidev/xcms-rich-text/blob/main/CONTRIBUTING.md)
- [Code of Conduct](https://github.com/plaidev/xcms-rich-text/blob/main/CODE_OF_CONDUCT.md)

## License

@craft-cross-cms/rich-text-core is published under the Apache 2.0 License.

Your use of KARTE is governed by the [KARTE Terms of Use](https://karte.io/legal/terms-of-use-en.html).
