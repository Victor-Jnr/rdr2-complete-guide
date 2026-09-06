import { describe, expect, it } from 'vitest';
import { SEARCH_GROUP_ORDER, searchGuide } from '@/services/search';
import { overallCategories, percent } from '@/services/progress';
import { missions, treasures } from '@/data';

describe('search grouping', () => {
  it('returns hits that can be grouped in the UI order', () => {
    const hits = searchGuide('map');
    expect(hits.length).toBeGreaterThan(0);
    const kinds = new Set(hits.map((h) => h.kind));
    expect([...kinds].every((k) => SEARCH_GROUP_ORDER.includes(k))).toBe(true);
  });
});

describe('progress categories', () => {
  it('does not treat empty extras as complete', () => {
    const cats = overallCategories(missions, treasures, new Map(), new Map(), new Map(), {
      campIds: [],
      companionIds: [],
      itemTotal: 0,
      missableTotal: 0,
    });
    const main = cats.find((c) => c.id === 'main');
    expect(main?.done).toBe(0);
    expect(main?.total).toBeGreaterThan(0);
    expect(percent(0, main?.total ?? 1)).toBe(0);
  });
});
