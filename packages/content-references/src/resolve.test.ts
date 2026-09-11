import { describe, expect, it, vi } from 'vitest';
import { resolveCmsReferences } from './resolve.js';
import type { CmsContent, CmsReferencePlanEntry, FetchCmsContentsByIds } from './types.js';

const AUTHOR: CmsReferencePlanEntry = { field: 'author', refModel: 'authors', multiple: false };
const TAGS: CmsReferencePlanEntry = { field: 'tags', refModel: 'tags', multiple: true };

const authors: Record<string, CmsContent> = {
  a1: { id: 'a1', name: 'Alice', company: 'c1' },
  a2: { id: 'a2', name: 'Bob', company: 'c2' },
};
const tags: Record<string, CmsContent> = {
  t1: { id: 't1', label: 'news' },
  t2: { id: 't2', label: 'tech' },
};

/** A store-backed fetcher that returns only the contents it knows, like a published-only API. */
function storeFetcher(store: Record<string, Record<string, CmsContent>>): FetchCmsContentsByIds {
  return vi.fn(async (modelId, ids) =>
    ids.flatMap((id) => {
      const content = store[modelId]?.[id];
      return content === undefined ? [] : [content];
    }),
  );
}

describe('resolveCmsReferences', () => {
  it('replaces a single reference with the referenced content', async () => {
    const fetchByIds = storeFetcher({ authors });

    const resolved = await resolveCmsReferences(
      [{ id: 'p1', title: 'Post', author: 'a1' }],
      [AUTHOR],
      { fetchByIds },
    );

    expect(resolved).toEqual([{ id: 'p1', title: 'Post', author: authors.a1 }]);
  });

  it('replaces a multiple reference with the referenced contents in the original order', async () => {
    const fetchByIds = storeFetcher({ tags });

    const resolved = await resolveCmsReferences([{ id: 'p1', tags: ['t2', 't1'] }], [TAGS], {
      fetchByIds,
    });

    expect(resolved[0]?.tags).toEqual([tags.t2, tags.t1]);
  });

  it('resolves an unresolvable single reference to null and drops unresolvable multiple entries', async () => {
    const fetchByIds = storeFetcher({ authors, tags });

    const resolved = await resolveCmsReferences(
      [{ id: 'p1', author: 'missing', tags: ['t1', 'missing', 't2'] }],
      [AUTHOR, TAGS],
      { fetchByIds },
    );

    expect(resolved).toEqual([{ id: 'p1', author: null, tags: [tags.t1, tags.t2] }]);
  });

  it('maps null and absent values to null (single) and [] (multiple)', async () => {
    const fetchByIds = storeFetcher({ authors, tags });

    const resolved = await resolveCmsReferences(
      [{ id: 'p1', author: null, tags: null }, { id: 'p2' }],
      [AUTHOR, TAGS],
      { fetchByIds },
    );

    expect(resolved).toEqual([
      { id: 'p1', author: null, tags: [] },
      { id: 'p2', author: null, tags: [] },
    ]);
    expect(fetchByIds).not.toHaveBeenCalled();
  });

  it('does not recurse into the referenced contents', async () => {
    const fetchByIds = storeFetcher({ authors });

    const resolved = await resolveCmsReferences([{ id: 'p1', author: 'a1' }], [AUTHOR], {
      fetchByIds,
    });

    expect((resolved[0]?.author as CmsContent).company).toBe('c1');
    expect(fetchByIds).toHaveBeenCalledTimes(1);
  });

  it('deduplicates IDs across items and plan entries per model and fetches each model once', async () => {
    const fetchByIds = storeFetcher({ authors });
    const plan: CmsReferencePlanEntry[] = [
      AUTHOR,
      { field: 'editor', refModel: 'authors', multiple: false },
    ];

    await resolveCmsReferences(
      [
        { id: 'p1', author: 'a1', editor: 'a2' },
        { id: 'p2', author: 'a2', editor: 'a1' },
      ],
      plan,
      { fetchByIds },
    );

    expect(fetchByIds).toHaveBeenCalledTimes(1);
    expect(fetchByIds).toHaveBeenCalledWith('authors', ['a1', 'a2']);
  });

  it('splits IDs into chunks of chunkSize', async () => {
    const fetchByIds = storeFetcher({ tags });
    const ids = Array.from({ length: 7 }, (_, index) => `t${String(index)}`);

    await resolveCmsReferences([{ id: 'p1', tags: ids }], [TAGS], { fetchByIds, chunkSize: 3 });

    expect(vi.mocked(fetchByIds).mock.calls.map(([, chunk]) => chunk)).toEqual([
      ['t0', 't1', 't2'],
      ['t3', 't4', 't5'],
      ['t6'],
    ]);
  });

  it('defaults chunkSize to 50, the $in limit of the delivery API', async () => {
    const fetchByIds = storeFetcher({ tags });
    const ids = Array.from({ length: 101 }, (_, index) => `t${String(index)}`);

    await resolveCmsReferences([{ id: 'p1', tags: ids }], [TAGS], { fetchByIds });

    expect(vi.mocked(fetchByIds).mock.calls.map(([, chunk]) => chunk.length)).toEqual([50, 50, 1]);
  });

  it('runs at most concurrency fetches at a time', async () => {
    let inFlight = 0;
    let maxInFlight = 0;
    const fetchByIds: FetchCmsContentsByIds = async (_modelId, ids) => {
      inFlight += 1;
      maxInFlight = Math.max(maxInFlight, inFlight);
      await new Promise((resolve) => setTimeout(resolve, 1));
      inFlight -= 1;
      return ids.map((id) => ({ id }));
    };
    const ids = Array.from({ length: 10 }, (_, index) => `t${String(index)}`);

    await resolveCmsReferences([{ id: 'p1', tags: ids }], [TAGS], {
      fetchByIds,
      chunkSize: 1,
      concurrency: 2,
    });

    expect(maxInFlight).toBe(2);
  });

  it('rejects when fetchByIds throws instead of returning a partial result', async () => {
    const fetchByIds: FetchCmsContentsByIds = async () => {
      throw new Error('boom');
    };

    await expect(
      resolveCmsReferences([{ id: 'p1', author: 'a1' }], [AUTHOR], { fetchByIds }),
    ).rejects.toThrow('boom');
  });

  it('ignores non-string IDs and contents without a string id', async () => {
    const fetchByIds: FetchCmsContentsByIds = vi.fn(async () => [
      { id: 't1', label: 'news' },
      { id: 42 as unknown as string, label: 'broken' },
    ]);

    const resolved = await resolveCmsReferences(
      [{ id: 'p1', tags: ['t1', 42, '', null] }],
      [TAGS],
      { fetchByIds },
    );

    expect(fetchByIds).toHaveBeenCalledWith('tags', ['t1']);
    expect(resolved[0]?.tags).toEqual([{ id: 't1', label: 'news' }]);
  });

  it('copies fields outside the plan and does not mutate the input', async () => {
    const fetchByIds = storeFetcher({ authors });
    const original = { id: 'p1', title: 'Post', author: 'a1', tags: ['t1'] };

    const resolved = await resolveCmsReferences([original], [AUTHOR], { fetchByIds });

    expect(resolved[0]).toEqual({ id: 'p1', title: 'Post', author: authors.a1, tags: ['t1'] });
    expect(original.author).toBe('a1');
    expect(resolved[0]).not.toBe(original);
  });

  it('returns copies without fetching when the plan or the items are empty', async () => {
    const fetchByIds = storeFetcher({ authors });

    const noPlan = await resolveCmsReferences([{ id: 'p1', author: 'a1' }], [], { fetchByIds });
    const noItems = await resolveCmsReferences([], [AUTHOR], { fetchByIds });

    expect(noPlan).toEqual([{ id: 'p1', author: 'a1' }]);
    expect(noItems).toEqual([]);
    expect(fetchByIds).not.toHaveBeenCalled();
  });

  it('rejects invalid chunkSize and concurrency', async () => {
    const fetchByIds = storeFetcher({ authors });

    await expect(resolveCmsReferences([], [AUTHOR], { fetchByIds, chunkSize: 0 })).rejects.toThrow(
      RangeError,
    );
    await expect(
      resolveCmsReferences([], [AUTHOR], { fetchByIds, concurrency: 1.5 }),
    ).rejects.toThrow(RangeError);
  });
});
