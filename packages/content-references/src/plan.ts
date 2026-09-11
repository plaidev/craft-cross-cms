import type { CmsFieldDefinition, CmsReferencePlanEntry } from './types.js';

const REFERENCE_FIELD_TYPE = 'reference';

/**
 * Derives the reference plan of a model from its field definitions.
 *
 * A field takes part in the plan when its `type` is `reference` and `typeOptions.refModel`
 * is a non-empty string. Reference fields without a `refModel` (for example right after a
 * model was duplicated into another collection) have nothing to resolve against and are
 * left out, so {@link resolveCmsReferences} keeps their IDs untouched.
 *
 * Only top-level fields are inspected. References inside custom field types are not part
 * of the plan.
 */
export function buildCmsReferencePlan(
  fields: readonly CmsFieldDefinition[],
): readonly CmsReferencePlanEntry[] {
  const plan: CmsReferencePlanEntry[] = [];
  for (const field of fields) {
    if (field.type !== REFERENCE_FIELD_TYPE) continue;
    const options = field.typeOptions;
    if (typeof options !== 'object' || options === null) continue;
    const { refModel, multiple } = options as { refModel?: unknown; multiple?: unknown };
    if (typeof refModel !== 'string' || refModel === '') continue;
    plan.push({ field: field.uid, refModel, multiple: multiple === true });
  }
  return plan;
}
