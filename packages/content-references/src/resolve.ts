import {
  DEFAULT_CHUNK_SIZE,
  DEFAULT_CONCURRENCY,
  type CmsContent,
  type CmsReferencePlanEntry,
  type ResolveCmsReferencesOptions,
} from './types.js';

/**
 * Replaces the reference fields of `items` with the referenced contents, one level deep.
 *
 * - A single reference becomes the referenced content, or `null` when it cannot be resolved
 *   (not published, deleted, or not returned by `fetchByIds`). The ID is never kept.
 * - A `multiple` reference becomes an array of the referenced contents in the original
 *   order. Entries that cannot be resolved are dropped. A `null` value becomes `[]`.
 * - Reference fields inside the referenced contents stay as IDs; nothing is recursed.
 * - Fields that are not part of `plan` are copied as they are.
 *
 * IDs are collected across all items and all plan entries, deduplicated per model, and
 * fetched in chunks of `chunkSize` with at most `concurrency` calls in flight. An error
 * thrown by `fetchByIds` rejects the whole call; there is no partial result, because a
 * partially resolved item would be indistinguishable from one whose references are
 * unpublished.
 *
 * `items` and their values are not mutated.
 */
export async function resolveCmsReferences(
  items: readonly CmsContent[],
  plan: readonly CmsReferencePlanEntry[],
  options: ResolveCmsReferencesOptions,
): Promise<readonly CmsContent[]> {
  const chunkSize = options.chunkSize ?? DEFAULT_CHUNK_SIZE;
  const concurrency = options.concurrency ?? DEFAULT_CONCURRENCY;
  if (!Number.isInteger(chunkSize) || chunkSize < 1) {
    throw new RangeError(`chunkSize must be a positive integer, got ${String(chunkSize)}`);
  }
  if (!Number.isInteger(concurrency) || concurrency < 1) {
    throw new RangeError(`concurrency must be a positive integer, got ${String(concurrency)}`);
  }
  if (plan.length === 0 || items.length === 0) return items.map((item) => ({ ...item }));

  const idsByModel = collectIdsByModel(items, plan);
  const contentsByModel = await fetchContentsByModel(idsByModel, {
    fetchByIds: options.fetchByIds,
    chunkSize,
    concurrency,
  });

  return items.map((item) => {
    const resolved: Record<string, unknown> = { ...item };
    for (const entry of plan) {
      const contents = contentsByModel.get(entry.refModel) ?? new Map<string, CmsContent>();
      resolved[entry.field] = resolveField(item[entry.field], entry, contents);
    }
    return resolved as CmsContent;
  });
}

function collectIdsByModel(
  items: readonly CmsContent[],
  plan: readonly CmsReferencePlanEntry[],
): Map<string, Set<string>> {
  const idsByModel = new Map<string, Set<string>>();
  for (const entry of plan) {
    const ids = idsByModel.get(entry.refModel) ?? new Set<string>();
    idsByModel.set(entry.refModel, ids);
    for (const item of items) {
      for (const id of referenceIdsOf(item[entry.field])) ids.add(id);
    }
  }
  return idsByModel;
}

/** IDs held by a reference value. Anything that is not a string is ignored. */
function referenceIdsOf(value: unknown): readonly string[] {
  if (typeof value === 'string') return value === '' ? [] : [value];
  if (Array.isArray(value)) {
    return value.filter((id): id is string => typeof id === 'string' && id !== '');
  }
  return [];
}

function resolveField(
  value: unknown,
  entry: CmsReferencePlanEntry,
  contents: ReadonlyMap<string, CmsContent>,
): CmsContent | readonly CmsContent[] | null {
  const ids = referenceIdsOf(value);
  if (entry.multiple) {
    return ids.flatMap((id) => {
      const content = contents.get(id);
      return content === undefined ? [] : [content];
    });
  }
  const id = ids[0];
  return id === undefined ? null : (contents.get(id) ?? null);
}

async function fetchContentsByModel(
  idsByModel: ReadonlyMap<string, ReadonlySet<string>>,
  options: Required<ResolveCmsReferencesOptions>,
): Promise<Map<string, Map<string, CmsContent>>> {
  const contentsByModel = new Map<string, Map<string, CmsContent>>();
  const tasks: (() => Promise<void>)[] = [];
  for (const [modelId, ids] of idsByModel) {
    const contents = new Map<string, CmsContent>();
    contentsByModel.set(modelId, contents);
    for (const chunk of chunked([...ids], options.chunkSize)) {
      tasks.push(async () => {
        for (const content of await options.fetchByIds(modelId, chunk)) {
          if (typeof content.id === 'string') contents.set(content.id, content);
        }
      });
    }
  }
  await runWithConcurrency(tasks, options.concurrency);
  return contentsByModel;
}

function chunked<T>(values: readonly T[], size: number): readonly (readonly T[])[] {
  const chunks: (readonly T[])[] = [];
  for (let index = 0; index < values.length; index += size) {
    chunks.push(values.slice(index, index + size));
  }
  return chunks;
}

async function runWithConcurrency(
  tasks: readonly (() => Promise<void>)[],
  concurrency: number,
): Promise<void> {
  let next = 0;
  const worker = async (): Promise<void> => {
    while (next < tasks.length) {
      const task = tasks[next++]!;
      await task();
    }
  };
  await Promise.all(Array.from({ length: Math.min(concurrency, tasks.length) }, worker));
}
