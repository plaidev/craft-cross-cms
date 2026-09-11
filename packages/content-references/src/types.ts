/**
 * A content item as returned by the xcms delivery APIs (`GET contents` / `Get contents`).
 * Only `id` is required; the remaining keys are the model fields.
 */
export interface CmsContent {
  readonly id: string;
  readonly [field: string]: unknown;
}

/**
 * The value of a reference field as delivered by xcms: a referenced content ID,
 * an array of IDs when the field is `multiple`, or `null` when nothing is selected.
 */
export type CmsReferenceValue = string | readonly string[] | null;

/**
 * Which field of a content points at which model. Derived from the model definition with
 * {@link buildCmsReferencePlan} and consumed by {@link resolveCmsReferences}.
 */
export interface CmsReferencePlanEntry {
  /** The `uid` of the reference field. */
  readonly field: string;
  /** The `modelId` the field refers to (`typeOptions.refModel`). */
  readonly refModel: string;
  /** Whether the field holds an array of IDs (`typeOptions.multiple`). */
  readonly multiple: boolean;
}

/**
 * The public shape of a field definition as returned by the xcms management API.
 * Only the members needed to build a plan are declared.
 */
export interface CmsFieldDefinition {
  readonly uid: string;
  readonly type: string;
  readonly typeOptions?: unknown;
}

/**
 * Fetches the contents of `modelId` whose `id` is in `ids`. `ids` never exceeds
 * `chunkSize` entries and never contains duplicates. Contents that do not exist or are
 * not published may simply be omitted from the result; they resolve to `null`.
 *
 * Any thrown error propagates out of {@link resolveCmsReferences} unchanged.
 */
export type FetchCmsContentsByIds = (
  modelId: string,
  ids: readonly string[],
) => Promise<readonly CmsContent[]>;

export interface ResolveCmsReferencesOptions {
  readonly fetchByIds: FetchCmsContentsByIds;
  /**
   * Maximum number of IDs per `fetchByIds` call. Defaults to {@link DEFAULT_CHUNK_SIZE},
   * the `$in` limit of the xcms delivery API filter.
   */
  readonly chunkSize?: number;
  /** Maximum number of concurrent `fetchByIds` calls. Defaults to {@link DEFAULT_CONCURRENCY}. */
  readonly concurrency?: number;
}

/** The `$in` operator of the xcms delivery API filter accepts at most this many values. */
export const DEFAULT_CHUNK_SIZE = 50;

export const DEFAULT_CONCURRENCY = 4;
