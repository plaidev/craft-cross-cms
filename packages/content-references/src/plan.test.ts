import { describe, expect, it } from 'vitest';
import { buildCmsReferencePlan } from './plan.js';

describe('buildCmsReferencePlan', () => {
  it('picks reference fields that have a refModel', () => {
    const plan = buildCmsReferencePlan([
      { uid: 'title', type: 'text', typeOptions: { title: true } },
      { uid: 'author', type: 'reference', typeOptions: { refModel: 'authors', multiple: false } },
      { uid: 'tags', type: 'reference', typeOptions: { refModel: 'tags', multiple: true } },
    ]);

    expect(plan).toEqual([
      { field: 'author', refModel: 'authors', multiple: false },
      { field: 'tags', refModel: 'tags', multiple: true },
    ]);
  });

  it('leaves out reference fields whose refModel is missing, null or empty', () => {
    const plan = buildCmsReferencePlan([
      { uid: 'a', type: 'reference', typeOptions: { refModel: null, multiple: false } },
      { uid: 'b', type: 'reference', typeOptions: { refModel: '', multiple: false } },
      { uid: 'c', type: 'reference', typeOptions: { multiple: true } },
      { uid: 'd', type: 'reference' },
      { uid: 'e', type: 'reference', typeOptions: null },
    ]);

    expect(plan).toEqual([]);
  });

  it('treats multiple as false unless it is exactly true', () => {
    const plan = buildCmsReferencePlan([
      { uid: 'a', type: 'reference', typeOptions: { refModel: 'm' } },
      { uid: 'b', type: 'reference', typeOptions: { refModel: 'm', multiple: 'yes' } },
    ]);

    expect(plan.map((entry) => entry.multiple)).toEqual([false, false]);
  });

  it('keeps the order of the field definitions', () => {
    const plan = buildCmsReferencePlan([
      { uid: 'z', type: 'reference', typeOptions: { refModel: 'm', multiple: false } },
      { uid: 'a', type: 'reference', typeOptions: { refModel: 'm', multiple: false } },
    ]);

    expect(plan.map((entry) => entry.field)).toEqual(['z', 'a']);
  });
});
