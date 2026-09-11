# @craft-cross-cms/content-references

Resolves the reference fields of Craft Cross CMS (xcms) contents into the referenced contents.

The xcms delivery APIs return a reference field as the referenced content's ID (or an array of
IDs for a `multiple` field). This package turns those IDs into the referenced contents with a
fixed, documented set of rules, so that every consumer — the xcms admin, site generators, your own
code — sees the same result. It talks to no network on its own: you pass in the function that
fetches contents by ID, and the package takes care of collecting, deduplicating, chunking and
writing the results back.

## Getting Started

### Installation

```bash
npm install @craft-cross-cms/content-references
```

or

```bash
pnpm add @craft-cross-cms/content-references
```

or

```bash
yarn add @craft-cross-cms/content-references
```

The package has no dependencies and works in Node.js and in browsers.

### Usage

```typescript
import { buildCmsReferencePlan, resolveCmsReferences } from '@craft-cross-cms/content-references';

// 1. Which fields are references? Derive it once from the model definition
//    (the `fields` array returned by the xcms management API).
const plan = buildCmsReferencePlan(model.fields);
// => [{ field: 'author', refModel: 'authors', multiple: false },
//     { field: 'tags',   refModel: 'tags',    multiple: true }]

// 2. Tell the resolver how to fetch contents of a model by ID.
//    With the delivery API this is a `Get contents` call filtered by `id`.
const fetchByIds = async (modelId: string, ids: readonly string[]) => {
  const qs = new URLSearchParams({ modelId, limit: String(ids.length) });
  for (const id of ids) qs.append('filter[id][$in]', id);
  const res = await fetch(`https://<subdomain>.<cdn-domain>/beta/cms/content/list?${qs}`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (!res.ok) throw new Error(`list failed: ${res.status}`);
  return (await res.json()).items;
};

// 3. Resolve one level of references.
const posts = await resolveCmsReferences(items, plan, { fetchByIds });
// posts[0].author => { id: 'a1', name: 'Alice', ... } | null
// posts[0].tags   => [{ id: 't1', label: 'news' }, ...]
```

## Resolution rules

These rules are the contract of this package. They apply to every consumer.

| Situation                                                        | Result                                                         |
| ---------------------------------------------------------------- | -------------------------------------------------------------- |
| Single reference, content returned by `fetchByIds`               | The referenced content                                         |
| Single reference, content not returned (unpublished, deleted, …) | `null` — the ID is never kept                                  |
| Single reference, value is `null` or absent                      | `null`                                                         |
| `multiple` reference                                             | Array of referenced contents, in the original order of the IDs |
| `multiple` reference, some IDs not returned                      | Those entries are dropped                                      |
| `multiple` reference, value is `null` or absent                  | `[]`                                                           |
| Reference fields inside a referenced content                     | Left as IDs — resolution is exactly one level deep             |
| Reference field without `refModel` in the model definition       | Not part of the plan; the value is copied untouched            |
| Field not in the plan                                            | Copied untouched                                               |
| `fetchByIds` throws                                              | The whole call rejects; there is no partial result             |

Why no partial result: an item whose references were only partly fetched would look exactly like
an item whose references are unpublished. Failing the whole call keeps `null` unambiguous.

## Fetching

- IDs are collected across all items and all plan entries, deduplicated per model, and fetched in
  chunks of `chunkSize` IDs (default `50`, the `$in` limit of the delivery API filter).
- At most `concurrency` calls to `fetchByIds` run at the same time (default `4`).
- `fetchByIds` receives a model ID and a list of distinct IDs, and returns the contents it can
  provide. Contents it does not return resolve to `null` / are dropped as described above.
  Returned contents are matched by their `id`.
- Inputs are not mutated; the returned items are new objects.

## API

### `buildCmsReferencePlan(fields)`

Builds the plan from a model's field definitions. A field takes part when its `type` is
`reference` and `typeOptions.refModel` is a non-empty string; `typeOptions.multiple === true`
marks it as multiple. Only top-level fields are inspected.

### `resolveCmsReferences(items, plan, options)`

Resolves one level of references on `items` according to `plan`.

| Option        | Type                                                                 | Default |
| ------------- | -------------------------------------------------------------------- | ------- |
| `fetchByIds`  | `(modelId: string, ids: readonly string[]) => Promise<CmsContent[]>` | —       |
| `chunkSize`   | `number`                                                             | `50`    |
| `concurrency` | `number`                                                             | `4`     |

## License

Apache-2.0
